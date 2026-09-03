"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getSiteUrl, sendEmail } from "@/lib/email/service";
import { paymentSubmittedTemplate } from "@/lib/email/templates";

/**
 * Creates a new rental and electronic contract
 */
export async function createRentalAndContract({ bikeId, planId, signatureData, signerName }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  if (!signatureData?.trim() || !signerName?.trim()) {
    throw new Error("Please sign the rental agreement before continuing.");
  }

  const { data: bike } = await supabase
    .from("bikes")
    .select("id, status")
    .eq("id", bikeId)
    .single();

  if (!bike || bike.status !== "AVAILABLE") {
    throw new Error("This bike is no longer available for rent.");
  }

  const { data: plan } = await supabase
    .from("rental_pricing_plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (!plan) throw new Error("Invalid plan");

  const depositAmount = 50;
  const totalAmount = Number(plan.total_price) + depositAmount;

  // Date Logic: Booking day is not counted as a full rental day.
  // Start date is tomorrow.
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  if (plan.duration_months > 0) {
    endDate.setMonth(endDate.getMonth() + plan.duration_months);
  }
  if (plan.duration_weeks > 0) {
    endDate.setDate(endDate.getDate() + (plan.duration_weeks * 7));
  }

  // Double check user doesn't already have an active bike rental
  const { data: existingRentals, error: existingRentalsError } = await supabase
    .from("rentals")
    .select("id")
    .eq("user_id", user.id)
    .not("bike_id", "is", null)
    .not("status", "in", "(EXPIRED,CANCELLED)");

  if (existingRentalsError) {
    throw new Error("We could not confirm your current rental status. Please try again.");
  }
    
  if (existingRentals && existingRentals.length > 0) {
    throw new Error("You already have an active bike rental.");
  }

  // We need to bypass RLS or use the user's session to insert.
  // Since we have a trigger/constraint, we can just use the standard client.
  
  // 1. Create Rental
  const { data: rental, error: rentalError } = await supabase
    .from("rentals")
    .insert({
      user_id: user.id,
      bike_id: bikeId,
      pricing_plan_id: planId,
      status: "AWAITING_PAYMENT", // We jump to AWAITING_PAYMENT because they signed the contract in the same step
      type: "NEW",
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      total_amount: totalAmount,
      deposit_amount: depositAmount,
    })
    .select()
    .single();

  if (rentalError) {
    throw new Error("We could not create your rental. Please try again.");
  }

  // 2. Create Contract
  const { error: contractError } = await supabase
    .from("contracts")
    .insert({
      rental_id: rental.id,
      user_id: user.id,
      version: "v1.0",
      signed_at: new Date().toISOString(),
      signer_name: signerName,
      signature_data: signatureData,
      status: "SIGNED"
    });

  if (contractError) {
    // If contract fails, we should ideally rollback the rental. For now, throw.
    throw new Error("We could not save your contract signature. Please contact support.");
  }

  // 3. Mark bike as RESERVED so no one else rents it while they pay
  await supabase
    .from("bikes")
    .update({ status: "RESERVED" })
    .eq("id", bikeId);

  return { rentalId: rental.id };
}

/**
 * Submits local payment reference for a rental
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
      payment_date: new Date().toISOString()
    });

  if (paymentError) {
    throw new Error("We could not submit your payment confirmation. Please try again.");
  }

  // 2. Update Rental Status
  const { error: rentalError } = await supabase
    .from("rentals")
    .update({ status: "PAYMENT_SUBMITTED" })
    .eq("id", rentalId)
    .eq("user_id", user.id);

  if (rentalError) {
    throw new Error("Your payment was submitted, but we could not update the rental status.");
  }

  await sendEmail({
    to: user.email,
    template: paymentSubmittedTemplate({ dashboardUrl: `${getSiteUrl()}/dashboard` }),
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { success: true, paymentReference: cleanedReference };
}

export async function requestRentalExtension(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const rentalId = formData.get("rental_id");
  const planId = formData.get("pricing_plan_id");

  if (!rentalId || !planId) {
    throw new Error("Please select an extension plan.");
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

  const { data: existingExtension, error: extensionLookupError } = await supabase
    .from("rental_extensions")
    .select("id")
    .eq("rental_id", rental.id)
    .in("status", ["REQUESTED", "AWAITING_PAYMENT", "PAYMENT_SUBMITTED", "PAYMENT_VERIFIED"])
    .limit(1);

  if (extensionLookupError) {
    throw new Error("We could not check existing extension requests.");
  }

  if (existingExtension && existingExtension.length > 0) {
    throw new Error("This rental already has an extension request in progress.");
  }

  const { data: plan, error: planError } = await supabase
    .from("rental_pricing_plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (planError || !plan) {
    throw new Error("Invalid extension plan.");
  }

  const currentEndDate = new Date(rental.end_date);
  const proposedEndDate = new Date(currentEndDate);

  if (plan.duration_months > 0) {
    proposedEndDate.setMonth(proposedEndDate.getMonth() + plan.duration_months);
  }

  if (plan.duration_weeks > 0) {
    proposedEndDate.setDate(proposedEndDate.getDate() + (plan.duration_weeks * 7));
  }

  const { data: extension, error } = await supabase
    .from("rental_extensions")
    .insert({
      rental_id: rental.id,
      user_id: user.id,
      pricing_plan_id: plan.id,
      current_end_date: currentEndDate.toISOString(),
      proposed_end_date: proposedEndDate.toISOString(),
      amount: plan.total_price,
      deposit_amount: 0,
      status: "AWAITING_PAYMENT",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error("We could not create your extension request.");
  }

  revalidatePath("/dashboard");
  return { extensionId: extension.id };
}

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

  await sendEmail({
    to: user.email,
    template: paymentSubmittedTemplate({ dashboardUrl: `${getSiteUrl()}/dashboard` }),
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { success: true };
}

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

  // Update rental status
  const { error: cancelError } = await supabase
    .from("rentals")
    .update({ 
      status: "CANCELLED", 
      updated_at: new Date().toISOString() 
    })
    .eq("id", rental.id);

  if (cancelError) {
    throw new Error("Could not cancel the rental. Please try again.");
  }

  // If there is an associated bike, mark it as AVAILABLE again
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
