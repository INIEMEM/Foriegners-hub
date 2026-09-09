"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getSiteUrl, sendEmail } from "@/lib/email/service";
import {
  paymentSubmittedTemplate,
  paymentVerifiedTemplate,
  paymentRejectedTemplate,
  extensionPaymentSubmittedTemplate,
} from "@/lib/email/templates";

// ── Hardcoded pricing plans (no longer DB-driven for initial rental) ──────────
const PLANS = {
  monthly: { label: "1 month — upfront", durationMonths: 1, price: 170, type: "monthly" },
  weekly:  { label: "1 month — weekly payments (€45/wk)", durationMonths: 1, price: 45, type: "weekly" },
};

/**
 * Creates a rental request + records payment submission for a guest user.
 * Finds or creates the Supabase user by email using the Admin API.
 * The user does NOT need to be logged in to call this.
 * They will receive a magic link by email to access their dashboard later.
 */
export async function guestSubmitRental({ email, name, phone, planType, startDate }) {
  try {
    const { createClient: createAdminClient } = await import("@supabase/supabase-js");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing Supabase admin credentials");
      return { success: false, error: "Server configuration error. Please contact support." };
    }

    const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const cleanEmail = (email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const plan = PLANS[planType];
    if (!plan) return { success: false, error: "Invalid plan selected." };
    if (!startDate) return { success: false, error: "Please select a start date." };

    const nameParts = (name || "").trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    const cleanPhone = (phone || "").trim();

    // 1. Find or create the user account
    let userId = null;
    let isNewUser = false;

    // Check existing profile first (fast indexed lookup)
    const { data: existingProfile } = await adminSupabase
      .from("profiles")
      .select("id, email")
      .ilike("email", cleanEmail)
      .maybeSingle();

    if (existingProfile) {
      userId = existingProfile.id;
      const updates = {};
      if (cleanPhone) updates.phone = cleanPhone;
      if (firstName) updates.first_name = firstName;
      if (lastName) updates.last_name = lastName;
      if (Object.keys(updates).length > 0) {
        await adminSupabase.from("profiles").update(updates).eq("id", userId);
      }
    } else {
      // Check auth users list as fallback
      const { data: { users } = {} } = await adminSupabase.auth.admin.listUsers();
      const existingAuthUser = users?.find((u) => u.email?.toLowerCase() === cleanEmail);

      if (existingAuthUser) {
        userId = existingAuthUser.id;
        await adminSupabase.from("profiles").upsert({
          id: userId,
          email: cleanEmail,
          role: "USER",
          first_name: firstName,
          last_name: lastName,
          phone: cleanPhone || null,
        }, { onConflict: "id" });
      } else {
        // Create new user with email_confirm: true (avoids Supabase email rate limits and enables magiclink)
        const { data: createdData, error: createError } = await adminSupabase.auth.admin.createUser({
          email: cleanEmail,
          email_confirm: true,
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
            phone: cleanPhone || null,
          },
        });

        if (createError) {
          console.error("Supabase admin.createUser error:", createError);
          // If the user actually exists already
          if (createError.message?.toLowerCase().includes("already") || createError.status === 422) {
            const { data: retryProfile } = await adminSupabase
              .from("profiles")
              .select("id")
              .ilike("email", cleanEmail)
              .maybeSingle();
            if (retryProfile) {
              userId = retryProfile.id;
            } else {
              return { success: false, error: "An account with this email already exists. Please log in." };
            }
          } else {
            return { success: false, error: createError.message || "Could not create user account. Please try again." };
          }
        } else if (createdData?.user?.id) {
          userId = createdData.user.id;
          isNewUser = true;

          // Upsert profile
          await adminSupabase.from("profiles").upsert({
            id: userId,
            email: cleanEmail,
            role: "USER",
            first_name: firstName,
            last_name: lastName,
            phone: cleanPhone || null,
          }, { onConflict: "id" });
        } else {
          return { success: false, error: "Unable to create account. Please contact support." };
        }
      }
    }

    if (!userId) {
      return { success: false, error: "Could not identify user account." };
    }

    // 2. Check for existing active/pending rental
    const { data: existingRentals } = await adminSupabase
      .from("rentals")
      .select("id")
      .eq("user_id", userId)
      .not("status", "in", "(EXPIRED,CANCELLED)");

    if (existingRentals && existingRentals.length > 0) {
      return {
        success: false,
        error: "This email already has an active or pending rental request. Check your email or chat with us on WhatsApp.",
      };
    }

    // 3. Get a placeholder bike (required by DB check constraint)
    const { data: placeholderBike } = await adminSupabase
      .from("bikes")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (!placeholderBike) {
      return { success: false, error: "System error: No bikes currently found in the system." };
    }

    // 4. Check if returning customer (no deposit)
    const { data: priorRentals } = await adminSupabase
      .from("rentals")
      .select("id")
      .eq("user_id", userId)
      .in("status", ["EXPIRED", "COMPLETED"])
      .limit(1);

    const isReturningCustomer = priorRentals && priorRentals.length > 0;
    const depositAmount = isReturningCustomer ? 0 : 50;
    const totalAmount = plan.price + depositAmount;

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const endDate = new Date(start);
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    // 5. Create the rental
    const { data: rental, error: rentalError } = await adminSupabase
      .from("rentals")
      .insert({
        user_id: userId,
        bike_id: placeholderBike.id,
        status: "AWAITING_PAYMENT",
        type: "NEW",
        start_date: start.toISOString(),
        end_date: endDate.toISOString(),
        total_amount: totalAmount,
        deposit_amount: depositAmount,
      })
      .select()
      .single();

    if (rentalError || !rental) {
      console.error("Rental insert error:", rentalError);
      return { success: false, error: "Could not register rental request. Please try again." };
    }

    // 6. Record payment as submitted
    await adminSupabase.from("payments").insert({
      rental_id: rental.id,
      user_id: userId,
      amount: totalAmount,
      payment_reference: "FHUB-RENTAL",
      status: "PAYMENT_SUBMITTED",
      submitted_at: new Date().toISOString(),
      payment_date: new Date().toISOString(),
    });

    await adminSupabase
      .from("rentals")
      .update({ status: "PAYMENT_SUBMITTED" })
      .eq("id", rental.id);

    // 7. Send confirmation email + magic link for future dashboard access
    try {
      const siteUrl = getSiteUrl();
      const { data: magicLinkData } = await adminSupabase.auth.admin.generateLink({
        type: "magiclink",
        email: cleanEmail,
        options: { redirectTo: `${siteUrl}/auth/callback?next=/dashboard` },
      });

      await sendEmail({
        to: cleanEmail,
        template: paymentSubmittedTemplate({
          dashboardUrl: magicLinkData?.properties?.action_link || `${siteUrl}/login`,
        }),
      });
    } catch (emailErr) {
      // Non-fatal: Do not block user confirmation if email delivery fails
      console.error("Error sending confirmation email in guestSubmitRental:", emailErr);
    }

    return { success: true, rentalId: rental.id, email: cleanEmail, isNewUser };
  } catch (err) {
    console.error("Unexpected error in guestSubmitRental:", err);
    return { success: false, error: err.message || "An unexpected error occurred. Please try again." };
  }
}

/**
 * Creates a new rental request for an already-logged-in user.
 */
export async function createRentalRequest({ planType, startDate, isReturningCustomer }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const plan = PLANS[planType];
  if (!plan) throw new Error("Invalid plan selected.");

  if (!startDate) throw new Error("Please select a start date.");

  const { data: existingRentals } = await supabase
    .from("rentals")
    .select("id")
    .eq("user_id", user.id)
    .not("status", "in", "(EXPIRED,CANCELLED)");

  if (existingRentals && existingRentals.length > 0) {
    throw new Error("You already have an active or pending rental.");
  }

  // The database schema has a CHECK constraint: (bike_id IS NOT NULL OR apartment_id IS NOT NULL)
  // Since the admin will assign the actual bike later, we use any existing bike as a temporary placeholder.
  const { data: placeholderBike } = await supabase
    .from("bikes")
    .select("id")
    .limit(1)
    .single();

  if (!placeholderBike) {
    throw new Error("System error: No bikes available in the database to fulfill the request.");
  }

  const depositAmount = isReturningCustomer ? 0 : 50;
  const totalAmount = plan.price + depositAmount;

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const endDate = new Date(start);
  endDate.setMonth(endDate.getMonth() + plan.durationMonths);

  const { data: rental, error: rentalError } = await supabase
    .from("rentals")
    .insert({
      user_id: user.id,
      bike_id: placeholderBike.id,  // Placeholder to satisfy DB constraint
      status: "AWAITING_PAYMENT",
      type: "NEW",
      start_date: start.toISOString(),
      end_date: endDate.toISOString(),
      total_amount: totalAmount,
      deposit_amount: depositAmount,
    })
    .select()
    .single();

  if (rentalError) {
    console.error("Supabase insert error:", rentalError);
    throw new Error(rentalError.message || "We could not create your rental. Please try again.");
  }

  // NOTE: Bike stays AVAILABLE until admin confirms payment and assigns it.
  // This prevents bikes being blocked by unverified payment requests.

  return { rentalId: rental.id };
}


/**
 * Submits local payment reference for a rental + sends confirmation email
 */
export async function submitPayment({ rentalId, paymentReference }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: rental, error: rentalLookupError } = await supabase
    .from("rentals")
    .select("id, user_id, total_amount, status")
    .eq("id", rentalId)
    .eq("user_id", user.id)
    .single();

  if (rentalLookupError || !rental) {
    throw new Error("We could not find this rental for your account.");
  }

  if (!["AWAITING_PAYMENT", "PENDING"].includes(rental.status)) {
    throw new Error("Payment cannot be submitted for this rental status.");
  }

  const cleanedReference = paymentReference?.trim() || "N/A";

  const { error: paymentError } = await supabase
    .from("payments")
    .insert({
      rental_id: rentalId,
      user_id: user.id,
      amount: rental.total_amount,
      payment_reference: cleanedReference,
      status: "PAYMENT_SUBMITTED",
      submitted_at: new Date().toISOString(),
      payment_date: new Date().toISOString(),
    });

  if (paymentError) {
    throw new Error("We could not submit your payment confirmation. Please try again.");
  }

  const { error: rentalError } = await supabase
    .from("rentals")
    .update({ status: "PAYMENT_SUBMITTED" })
    .eq("id", rentalId)
    .eq("user_id", user.id);

  if (rentalError) {
    throw new Error("Your payment was submitted, but we could not update the rental status.");
  }

  // Email: payment submitted
  await sendEmail({
    to: user.email,
    template: paymentSubmittedTemplate({ dashboardUrl: `${getSiteUrl()}/dashboard` }),
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { success: true, paymentReference: cleanedReference };
}

/**
 * Requests a rental extension (only available for ACTIVE rentals after first month ends)
 */
export async function requestRentalExtension(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const rentalId = formData.get("rental_id");
  const pricingPlanId = formData.get("pricing_plan_id");
  const extensionType = formData.get("extension_type"); // For backward compatibility

  if (!rentalId || (!pricingPlanId && !extensionType)) {
    throw new Error("Please select an extension plan.");
  }

  let durationWeeks = 0;
  let durationMonths = 0;
  let price = 0;
  let planId = pricingPlanId;

  if (pricingPlanId) {
    const { data: plan, error: planError } = await supabase
      .from("rental_pricing_plans")
      .select("id, name, duration_weeks, duration_months, total_price")
      .eq("id", pricingPlanId)
      .single();

    if (planError || !plan) {
      throw new Error("The selected extension plan could not be found.");
    }

    durationWeeks = plan.duration_weeks || 0;
    durationMonths = plan.duration_months || 0;
    price = Number(plan.total_price || 0);
  } else {
    const EXTENSION_PLANS = {
      weekly:  { label: "1 week extension", durationWeeks: 1, durationMonths: 0, price: 55 },
      monthly: { label: "1 month extension", durationWeeks: 0, durationMonths: 1, price: 170 },
    };
    const extPlan = EXTENSION_PLANS[extensionType];
    if (!extPlan) throw new Error("Invalid extension plan.");

    durationWeeks = extPlan.durationWeeks;
    durationMonths = extPlan.durationMonths;
    price = extPlan.price;

    const { data: placeholderPlan } = await supabase
      .from("rental_pricing_plans")
      .select("id")
      .limit(1)
      .single();

    if (!placeholderPlan) {
      throw new Error("System error: No pricing plans exist in the database.");
    }
    planId = placeholderPlan.id;
  }

  const { data: rental, error: rentalError } = await supabase
    .from("rentals")
    .select("id, user_id, bike_id, status, end_date")
    .eq("id", rentalId)
    .eq("user_id", user.id)
    .single();

  if (rentalError || !rental) {
    throw new Error("We could not find this rental for your account.");
  }

  if (rental.status !== "ACTIVE" || !rental.bike_id || !rental.end_date) {
    throw new Error("Only active bike rentals can be extended.");
  }

  const { data: existingExtension } = await supabase
    .from("rental_extensions")
    .select("id")
    .eq("rental_id", rental.id)
    .in("status", ["REQUESTED", "AWAITING_PAYMENT", "PAYMENT_SUBMITTED", "PAYMENT_VERIFIED"])
    .limit(1);

  if (existingExtension && existingExtension.length > 0) {
    throw new Error("This rental already has an extension request in progress.");
  }

  const currentEndDate = new Date(rental.end_date);
  const proposedEndDate = new Date(currentEndDate);

  if (durationMonths > 0) {
    proposedEndDate.setMonth(proposedEndDate.getMonth() + durationMonths);
  }
  if (durationWeeks > 0) {
    proposedEndDate.setDate(proposedEndDate.getDate() + durationWeeks * 7);
  }

  const { data: newExtension, error: extError } = await supabase
    .from("rental_extensions")
    .insert({
      rental_id: rental.id,
      user_id: user.id,
      pricing_plan_id: planId,
      current_end_date: currentEndDate.toISOString(),
      proposed_end_date: proposedEndDate.toISOString(),
      amount: price,
      deposit_amount: 0,
      status: "AWAITING_PAYMENT",
    })
    .select()
    .single();

  if (extError) {
    throw new Error("We could not create your extension request: " + extError.message);
  }

  revalidatePath("/dashboard");
  return { extensionId: newExtension.id };
}

/**
 * Submits payment for a rental extension
 */
export async function submitExtensionPayment(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const extensionId = formData.get("extension_id");
  const paymentReference = formData.get("payment_reference")?.trim() || "N/A";

  if (!extensionId) {
    throw new Error("Extension request is required.");
  }

  const { data: extension, error: extensionError } = await supabase
    .from("rental_extensions")
    .select("id, rental_id, user_id, amount, status")
    .eq("id", extensionId)
    .eq("user_id", user.id)
    .single();

  if (extensionError || !extension) {
    throw new Error("We could not find this extension request for your account.");
  }

  if (extension.status !== "AWAITING_PAYMENT") {
    throw new Error("Payment cannot be submitted for this extension status.");
  }

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      rental_id: extension.rental_id,
      user_id: user.id,
      amount: extension.amount,
      payment_reference: paymentReference,
      status: "PAYMENT_SUBMITTED",
      submitted_at: new Date().toISOString(),
      payment_date: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (paymentError || !payment) {
    throw new Error("We could not submit your extension payment.");
  }

  const { error: updateError } = await supabase
    .from("rental_extensions")
    .update({
      payment_id: payment.id,
      status: "PAYMENT_SUBMITTED",
      payment_submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", extension.id)
    .eq("user_id", user.id);

  if (updateError) {
    throw new Error("Extension payment was submitted, but the extension request could not be updated.");
  }

  // Email: extension payment submitted
  await sendEmail({
    to: user.email,
    template: extensionPaymentSubmittedTemplate({ dashboardUrl: `${getSiteUrl()}/dashboard` }),
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { success: true };
}

/**
 * Cancels a rental (user-initiated)
 */
export async function cancelRental(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const rentalId = formData.get("rental_id");
  if (!rentalId) throw new Error("Rental ID is required.");

  const { data: rental, error: rentalError } = await supabase
    .from("rentals")
    .select("id, status, bike_id")
    .eq("id", rentalId)
    .eq("user_id", user.id)
    .single();

  if (rentalError || !rental) {
    throw new Error("We could not find this rental.");
  }

  if (rental.status === "EXPIRED" || rental.status === "CANCELLED") {
    throw new Error("This rental is already closed.");
  }

  const { error: cancelError } = await supabase
    .from("rentals")
    .update({ status: "CANCELLED", updated_at: new Date().toISOString() })
    .eq("id", rental.id);

  if (cancelError) {
    throw new Error("Could not cancel the rental. Please try again.");
  }

  if (rental.bike_id) {
    await supabase
      .from("bikes")
      .update({ status: "AVAILABLE", updated_at: new Date().toISOString() })
      .eq("id", rental.bike_id);
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { success: true };
}

/**
 * Submits a repair request
 */
export async function submitRepairRequest(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const bikeId = formData.get("bike_id");
  const serviceId = formData.get("service_id");
  const description = formData.get("description")?.trim();

  if (!bikeId) throw new Error("Bike ID is required.");

  const { error } = await supabase
    .from("repair_requests")
    .insert({
      user_id: user.id,
      bike_id: bikeId,
      service_id: serviceId || null,
      description: description || null,
      status: "PENDING",
    });

  if (error) {
    throw new Error("Could not submit the repair request. Please try again.");
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { success: true };
}

export async function signContract({ contractId, signerName }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: contract, error: cError } = await supabase
    .from("contracts")
    .select("id, rental_id, status")
    .eq("id", contractId)
    .eq("user_id", user.id)
    .single();

  if (cError || !contract) throw new Error("Contract not found.");
  if (contract.status !== "PENDING") throw new Error("Contract is already signed.");

  const timestamp = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("contracts")
    .update({
      status: "SIGNED",
      signed_at: timestamp,
      signer_name: signerName.trim(),
    })
    .eq("id", contractId);

  if (updateError) throw new Error("Failed to sign contract.");

  const { error: rError } = await supabase
    .from("rentals")
    .update({ status: "PAYMENT_VERIFIED", updated_at: timestamp })
    .eq("id", contract.rental_id);

  if (rError) throw new Error("Failed to update rental status.");

  revalidatePath("/dashboard");
  return { success: true };
}
