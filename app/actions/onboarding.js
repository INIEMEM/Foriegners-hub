"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

/**
 * Validates a Bike Code against the fleet.
 * NOTE: User instructions require referring to this strictly as "Bike Code",
 * though the database column is `b_code`.
 */
export async function validateBikeCode(bikeCode) {
  if (!bikeCode || typeof bikeCode !== "string") {
    return { valid: false, error: "Please enter a Bike Code." };
  }

  const cleanCode = bikeCode.trim();
  if (!cleanCode) {
    return { valid: false, error: "Please enter a Bike Code." };
  }

  try {
    const adminSupabase = createAdminClient();
    const { data: bike, error } = await adminSupabase
      .from("bikes")
      .select("id, b_code, name, status, specifications, image_url")
      .ilike("b_code", cleanCode)
      .maybeSingle();

    if (error || !bike) {
      return {
        valid: false,
        error: `Bike Code "${cleanCode}" was not found in our fleet. Please check the code on the bike frame or ask the admin.`,
      };
    }

    return {
      valid: true,
      bike: {
        id: bike.id,
        name: bike.name,
        bikeCode: bike.b_code,
        status: bike.status,
        imageUrl: bike.image_url,
      },
    };
  } catch (err) {
    console.error("Error validating Bike Code:", err);
    return { valid: false, error: "Could not verify Bike Code. Please try again." };
  }
}

/**
 * Helper to upload a file to Supabase Storage "documents" bucket
 */
async function uploadToDocumentsBucket(adminSupabase, file, folder, prefix) {
  if (!file || typeof file !== "object" || !file.size) return null;

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Files must be 10MB or smaller.");
  }

  const rawExt = file.name ? file.name.split(".").pop().toLowerCase() : "jpg";
  const ext = ["pdf", "jpg", "jpeg", "png", "webp"].includes(rawExt) ? rawExt : "jpg";
  const uniqueId = Math.random().toString(36).substring(2, 9);
  const filePath = `${folder}/${prefix}-${Date.now()}-${uniqueId}.${ext}`;

  const { error: uploadErr } = await adminSupabase.storage
    .from("documents")
    .upload(filePath, file, {
      contentType: file.type || (ext === "pdf" ? "application/pdf" : "image/jpeg"),
      upsert: true,
    });

  if (uploadErr) {
    console.error(`Upload error for ${folder}:`, uploadErr);
    // Non-fatal fallback: continue if storage upload fails so registration isn't blocked
    return null;
  }

  const { data: pubData } = adminSupabase.storage
    .from("documents")
    .getPublicUrl(filePath);

  return pubData?.publicUrl || null;
}

/**
 * Handles multi-step account creation and rental onboarding
 * for both new and existing riders.
 */
export async function submitOnboarding(formData) {
  try {
    const adminSupabase = createAdminClient();

    const isExisting = formData.get("isExisting") === "true";
    const fullName = (formData.get("fullName") || "").trim();
    const email = (formData.get("email") || "").trim().toLowerCase();
    const phone = (formData.get("phone") || "").trim();
    // Foreigners Hub uses passwordless login (OTP/Magic link).
    // We generate an internal secure password so the user is provisioned and can auto-login upon registration.
    const internalPassword = (formData.get("password") || "").trim() || (randomBytes(24).toString("hex") + "FHub1!");
    const bikeCode = (formData.get("bikeCode") || "").trim();
    const planType = (formData.get("planType") || "weekly").trim();

    // 1. Validation
    if (!fullName) return { success: false, error: "Full name is required." };
    if (!email || !email.includes("@")) return { success: false, error: "A valid email is required." };
    if (!phone) return { success: false, error: "Phone number is required." };
    if (!bikeCode) return { success: false, error: "Bike Code is required." };

    // 2. Validate Bike Code
    const { data: bike, error: bError } = await adminSupabase
      .from("bikes")
      .select("id, b_code, name, status")
      .ilike("b_code", bikeCode)
      .maybeSingle();

    if (bError || !bike) {
      return { success: false, error: `Bike Code "${bikeCode}" is not recognized in our fleet.` };
    }

    // 3. Name split
    const nameParts = fullName.split(" ");
    const firstName = nameParts[0] || fullName;
    const lastName = nameParts.slice(1).join(" ") || "";

    // 4. File uploads
    const permitFrontFile = formData.get("permitFront");
    const permitBackFile = formData.get("permitBack");
    const contractFile = formData.get("contractFile");
    const paymentReceiptFile = formData.get("paymentReceipt");

    const permitFrontUrl = await uploadToDocumentsBucket(adminSupabase, permitFrontFile, "permits", "front");
    const permitBackUrl = await uploadToDocumentsBucket(adminSupabase, permitBackFile, "permits", "back");
    const contractFileUrl = await uploadToDocumentsBucket(adminSupabase, contractFile, "contracts", "paper");
    const receiptFileUrl = await uploadToDocumentsBucket(adminSupabase, paymentReceiptFile, "receipts", "payment");

    // 5. Create Supabase Auth User
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password: internalPassword,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone,
        residence_permit_front_url: permitFrontUrl,
        residence_permit_back_url: permitBackUrl,
        is_existing_rental: isExisting,
        bike_code: bike.b_code,
      },
    });

    if (authError || !authData?.user) {
      if (authError?.message?.includes("already") || authError?.message?.includes("registered")) {
        return {
          success: false,
          error: "An account with this email already exists. Please sign in or use a different email.",
        };
      }
      return { success: false, error: authError?.message || "Failed to create user account." };
    }

    const userId = authData.user.id;

    // 6. Ensure profile is updated
    await adminSupabase.from("profiles").upsert({
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
      role: "USER",
    });

    // 7. Get or match Pricing Plan
    const { data: pricingPlans } = await adminSupabase
      .from("rental_pricing_plans")
      .select("id, name, duration_weeks, duration_months, total_price");

    let matchedPlan = (pricingPlans || []).find((p) =>
      planType === "weekly"
        ? p.duration_weeks === 1 || p.name.toLowerCase().includes("1 week")
        : p.duration_months === 1 || p.name.toLowerCase().includes("month")
    ) || pricingPlans?.[0];

    const planPrice = planType === "weekly" ? 45 : 170;
    const depositAmount = isExisting ? 0 : 50;
    const totalAmount = planPrice + depositAmount;

    // 8. Determine Dates
    let startDate = new Date();
    let endDate = new Date();

    if (isExisting) {
      const customStartDateStr = formData.get("startDate");
      const lastPaymentDateStr = formData.get("lastPaymentDate");

      if (customStartDateStr) {
        startDate = new Date(customStartDateStr);
      }
      if (lastPaymentDateStr) {
        const lastPay = new Date(lastPaymentDateStr);
        endDate = new Date(lastPay);
        if (planType === "weekly") {
          endDate.setDate(endDate.getDate() + 7);
        } else {
          endDate.setMonth(endDate.getMonth() + 1);
        }
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const rentalStatus = isExisting ? "ACTIVE" : "PAYMENT_SUBMITTED";

    // 9. Create Rental
    const { data: rental, error: rentalError } = await adminSupabase
      .from("rentals")
      .insert({
        user_id: userId,
        bike_id: bike.id,
        pricing_plan_id: matchedPlan?.id || null,
        status: rentalStatus,
        type: isExisting ? "RENEWAL" : "NEW",
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        total_amount: totalAmount,
        deposit_amount: depositAmount,
      })
      .select()
      .single();

    if (rentalError || !rental) {
      console.error("Rental creation error:", rentalError);
      return { success: false, error: "Account created, but failed to connect bike rental. Please contact admin." };
    }

    // 10. Update Bike status to RENTED
    await adminSupabase
      .from("bikes")
      .update({ status: "RENTED", updated_at: new Date().toISOString() })
      .eq("id", bike.id);

    // 11. Create Contract record
    const signerName = (formData.get("signerName") || fullName).trim();
    await adminSupabase.from("contracts").insert({
      rental_id: rental.id,
      user_id: userId,
      version: "v1.0",
      signer_name: signerName,
      signed_at: new Date().toISOString(),
      signature_data: `Digitally signed by ${signerName}`,
      document_path: contractFileUrl || null,
      status: "SIGNED",
    });

    // 12. Create Payment record
    const paymentRef = `FHUB-${bike.b_code}${receiptFileUrl ? ` [Receipt: ${receiptFileUrl}]` : ""}`;
    await adminSupabase.from("payments").insert({
      rental_id: rental.id,
      user_id: userId,
      amount: totalAmount,
      payment_date: isExisting && formData.get("lastPaymentDate") ? new Date(formData.get("lastPaymentDate")).toISOString() : new Date().toISOString(),
      submitted_at: new Date().toISOString(),
      status: isExisting ? "VERIFIED" : "PAYMENT_SUBMITTED",
      payment_reference: paymentRef,
    });

    // 13. Create Welcome Notification
    await adminSupabase.from("notifications").insert({
      user_id: userId,
      title: isExisting ? "Existing Rental Connected" : "Welcome to Foreigners Hub",
      message: isExisting
        ? `Your rental for bike ${bike.name} (${bike.b_code}) has been connected. You can manage your rental, view payments, and request maintenance anytime.`
        : `Your bike rental for ${bike.name} (${bike.b_code}) is registered. Please await final admin payment verification.`,
      type: "INFO",
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    revalidatePath("/bikes");

    return {
      success: true,
      email,
      tempPassword: internalPassword,
      rentalId: rental.id,
      bikeCode: bike.b_code,
    };
  } catch (err) {
    console.error("Unexpected error during onboarding:", err);
    return { success: false, error: err.message || "An unexpected error occurred. Please try again." };
  }
}
