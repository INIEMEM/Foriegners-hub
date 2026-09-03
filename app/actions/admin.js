"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";
import { getSiteUrl, sendEmail } from "@/lib/email/service";
import {
  paymentRejectedTemplate,
  paymentVerifiedTemplate,
  rentalConfirmedTemplate,
  repairStatusUpdatedTemplate,
} from "@/lib/email/templates";

const bikeStatuses = ["AVAILABLE", "RESERVED", "RENTED", "MAINTENANCE", "INACTIVE"];
const apartmentStatuses = ["AVAILABLE", "RENTED", "MAINTENANCE", "INACTIVE"];
const repairStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("You must be signed in as an admin.");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || profile?.role !== "ADMIN") {
    throw new Error("You are not authorized to perform this admin action.");
  }

  return { supabase, user };
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseJsonField(value, fallback) {
  const cleaned = cleanString(value);
  if (!cleaned) return fallback;
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("One of the JSON fields is not valid JSON.");
  }
}

function parseListField(value) {
  return cleanString(value)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function hasUploadedFile(value) {
  return value && typeof value === "object" && typeof value.size === "number" && value.size > 0;
}

function bikeImagePath(file, bCode) {
  const extension = file.name?.split(".").pop()?.toLowerCase() || "jpg";
  const safeCode = bCode.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${safeCode || "bike"}-${randomUUID()}.${extension}`;
}

function storagePathFromPublicUrl(value, bucketName) {
  if (!value) return null;

  try {
    const url = new URL(value);
    const marker = `/storage/v1/object/public/${bucketName}/`;
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex === -1) return null;

    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

export async function verifyPayment(paymentId) {
  const { supabase, user } = await requireAdmin();

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select(`
      id,
      status,
      rental_id,
      user_id,
      profiles!payments_user_id_fkey(email),
      rentals(id, bike_id, status)
    `)
    .eq("id", paymentId)
    .single();

  if (paymentError || !payment) {
    throw new Error("Payment could not be found.");
  }

  if (payment.status !== "PAYMENT_SUBMITTED") {
    throw new Error("Only submitted payments can be verified.");
  }

  if (!payment.rentals?.bike_id) {
    throw new Error("This payment is not attached to a bike rental.");
  }

  const timestamp = new Date().toISOString();

  const { error: pError } = await supabase
    .from("payments")
    .update({
      status: "VERIFIED",
      verified_at: timestamp,
      verified_by: user.id,
    })
    .eq("id", payment.id)
    .eq("status", "PAYMENT_SUBMITTED");

  if (pError) throw new Error("Payment could not be verified.");

  const { data: extension } = await supabase
    .from("rental_extensions")
    .select("id, rental_id, proposed_end_date")
    .eq("payment_id", payment.id)
    .eq("status", "PAYMENT_SUBMITTED")
    .maybeSingle();

  if (extension) {
    const { error: rentalExtendError } = await supabase
      .from("rentals")
      .update({ end_date: extension.proposed_end_date, updated_at: timestamp })
      .eq("id", extension.rental_id)
      .eq("status", "ACTIVE");

    if (rentalExtendError) throw new Error("Rental end date could not be extended.");

    const { error: extensionError } = await supabase
      .from("rental_extensions")
      .update({
        status: "APPROVED",
        verified_at: timestamp,
        verified_by: user.id,
        updated_at: timestamp,
      })
      .eq("id", extension.id);

    if (extensionError) throw new Error("Extension request could not be approved.");
  } else {
    const { error: rError } = await supabase
      .from("rentals")
      .update({ status: "ACTIVE", updated_at: timestamp })
      .eq("id", payment.rental_id);

    if (rError) throw new Error("Rental could not be activated.");

    const { error: bError } = await supabase
      .from("bikes")
      .update({ status: "RENTED", updated_at: timestamp })
      .eq("id", payment.rentals.bike_id);

    if (bError) throw new Error("Bike status could not be updated.");
  }

  await supabase.from("notifications").insert({
    user_id: payment.user_id,
    title: "Payment confirmed",
    message: extension
      ? "Your extension payment has been verified and your rental return date has been updated."
      : "Your payment has been verified and your bike rental is now active.",
  });

  const dashboardUrl = `${getSiteUrl()}/dashboard`;
  await sendEmail({
    to: payment.profiles?.email,
    template: paymentVerifiedTemplate({ dashboardUrl }),
  });
  if (!extension) {
    let attachments = [];
    
    // Fetch contract to attach it to the confirmation email
    const { data: contract } = await supabase
      .from("contracts")
      .select("id, version, signed_at, signer_name, signature_data")
      .eq("rental_id", payment.rental_id)
      .eq("user_id", payment.user_id)
      .maybeSingle();
      
    if (contract) {
      // Fetch current terms from site settings
      const { data: settingsData } = await supabase
        .from("site_settings")
        .select("id, value")
        .eq("id", "contract_terms")
        .maybeSingle();
        
      const termsHtml = settingsData?.value 
        ? `<div style="white-space: pre-wrap;">${settingsData.value}</div>`
        : `
          <h3>Terms and Conditions</h3>
          <p>1. You accept responsibility for the bike and agree to return it in the same condition.</p>
          <p>2. You agree to follow all applicable local traffic laws and regulations.</p>
          <p>3. This rental is not active until payment has been locally verified by Foreigners Hub.</p>
        `;

      const contractHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Rental Contract - Foreigners Hub</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.6; }
            h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
            .section { margin-bottom: 30px; }
            .meta { background: #f8fafc; padding: 15px; border-radius: 8px; font-size: 14px; }
            .signature-box { border: 1px solid #cbd5e1; padding: 20px; font-family: monospace; font-size: 18px; background: #f1f5f9; text-align: center; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <h1>Foreigners Hub Rental Agreement</h1>
          
          <div class="section meta">
            <strong>Signatory Email:</strong> ${payment.profiles?.email}<br>
            <strong>Signatory Name:</strong> ${contract.signer_name}<br>
            <strong>Signed At:</strong> ${new Date(contract.signed_at).toLocaleString()}<br>
            <strong>Contract ID:</strong> ${contract.id}<br>
            <strong>Terms Version:</strong> ${contract.version}
          </div>
          
          <div class="section">
            ${termsHtml}
          </div>
          
          <div class="section">
            <p><strong>Electronic Signature:</strong></p>
            <div class="signature-box">${contract.signature_data || contract.signer_name}</div>
            <p><small>This document serves as proof of a valid electronic agreement under the conditions presented at checkout.</small></p>
          </div>
          
          <div style="font-size: 12px; color: #64748b; margin-top: 40px; text-align: center;">
            This is an electronically generated and legally binding document.
          </div>
        </body>
        </html>
      `;
      
      attachments.push({
        name: `contract_${payment.rental_id}.html`,
        content: Buffer.from(contractHtml).toString("base64")
      });
    }

    await sendEmail({
      to: payment.profiles?.email,
      template: rentalConfirmedTemplate({ dashboardUrl }),
      attachments,
    });
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function rejectPayment(paymentId, reason = "") {
  const { supabase, user } = await requireAdmin();

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("id, status, rental_id, user_id, profiles!payments_user_id_fkey(email)")
    .eq("id", paymentId)
    .single();

  if (paymentError || !payment) {
    throw new Error("Payment could not be found.");
  }

  if (payment.status !== "PAYMENT_SUBMITTED") {
    throw new Error("Only submitted payments can be rejected.");
  }

  const timestamp = new Date().toISOString();

  const { error: pError } = await supabase
    .from("payments")
    .update({
      status: "REJECTED",
      rejected_at: timestamp,
      rejected_by: user.id,
      rejection_reason: cleanString(reason) || null,
    })
    .eq("id", payment.id)
    .eq("status", "PAYMENT_SUBMITTED");

  if (pError) throw new Error("Payment could not be rejected.");

  const { data: extension } = await supabase
    .from("rental_extensions")
    .select("id")
    .eq("payment_id", payment.id)
    .eq("status", "PAYMENT_SUBMITTED")
    .maybeSingle();

  if (!extension) {
    const { error: rError } = await supabase
      .from("rentals")
      .update({ status: "AWAITING_PAYMENT", updated_at: timestamp })
      .eq("id", payment.rental_id);

    if (rError) throw new Error("Rental status could not be updated.");
  }

  await supabase
    .from("rental_extensions")
    .update({
      status: "REJECTED",
      rejected_at: timestamp,
      rejected_by: user.id,
      rejection_reason: cleanString(reason) || null,
      updated_at: timestamp,
    })
    .eq("payment_id", payment.id)
    .eq("status", "PAYMENT_SUBMITTED");

  const message = cleanString(reason)
    ? `Your payment could not be verified. Reason: ${cleanString(reason)}`
    : "Your payment could not be verified. Please contact Foreigners Hub support or submit corrected payment details.";

  await supabase.from("notifications").insert({
    user_id: payment.user_id,
    title: "Payment could not be verified",
    message,
  });

  await sendEmail({
    to: payment.profiles?.email,
    template: paymentRejectedTemplate({
      dashboardUrl: `${getSiteUrl()}/dashboard`,
      reason: cleanString(reason),
    }),
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function saveBike(formData) {
  const { supabase } = await requireAdmin();
  const id = cleanString(formData.get("id"));
  const bCode = cleanString(formData.get("b_code"));
  const name = cleanString(formData.get("name"));
  const status = cleanString(formData.get("status")) || "AVAILABLE";
  const categoryId = cleanString(formData.get("category_id")) || null;
  const description = cleanString(formData.get("description")) || null;
  const imageFile = formData.get("image_file");
  let imageUrl = cleanString(formData.get("image_url")) || null;
  const specifications = parseJsonField(formData.get("specifications"), {});

  if (!bCode || !name) throw new Error("B-Code and bike name are required.");
  if (!bikeStatuses.includes(status)) throw new Error("Invalid bike status.");

  if (hasUploadedFile(imageFile)) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (!allowedTypes.includes(imageFile.type)) {
      throw new Error("Bike image must be a JPG, PNG, WebP, or GIF file.");
    }

    if (imageFile.size > 5242880) {
      throw new Error("Bike image must be 5MB or smaller.");
    }

    const filePath = bikeImagePath(imageFile, bCode);
    const { data: upload, error: uploadError } = await supabase.storage
      .from("bike-images")
      .upload(filePath, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (uploadError || !upload?.path) {
      throw new Error("Bike image could not be uploaded. Please check the bike-images storage bucket.");
    }

    const { data: publicImage } = supabase.storage
      .from("bike-images")
      .getPublicUrl(upload.path);

    imageUrl = publicImage.publicUrl;
  }

  const duplicateQuery = supabase
    .from("bikes")
    .select("id")
    .eq("b_code", bCode)
    .limit(1);

  const { data: duplicate } = id
    ? await duplicateQuery.neq("id", id)
    : await duplicateQuery;

  if (duplicate && duplicate.length > 0) {
    throw new Error("Another bike already uses this B-Code.");
  }

  if (id && status === "AVAILABLE") {
    const { data: activeRentals, error: activeError } = await supabase
      .from("rentals")
      .select("id")
      .eq("bike_id", id)
      .not("status", "in", "(EXPIRED,CANCELLED)")
      .limit(1);

    if (activeError) throw new Error("Could not check active rentals for this bike.");
    if (activeRentals && activeRentals.length > 0) {
      throw new Error("This bike is attached to a current rental and cannot be marked available.");
    }
  }

  const payload = {
    b_code: bCode,
    name,
    category_id: categoryId,
    description,
    image_url: imageUrl,
    specifications,
    status,
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await supabase.from("bikes").update(payload).eq("id", id)
    : await supabase.from("bikes").insert(payload);

  if (error) throw new Error("Bike could not be saved.");
  revalidatePath("/admin");
  revalidatePath("/bikes");
}

export async function deleteBike(formData) {
  const { supabase } = await requireAdmin();
  const id = cleanString(formData.get("id"));

  if (!id) throw new Error("Bike is required.");

  const { data: bike, error: bikeError } = await supabase
    .from("bikes")
    .select("id, image_url")
    .eq("id", id)
    .single();

  if (bikeError || !bike) {
    throw new Error("Bike could not be found.");
  }

  const { data: rentals, error: rentalsError } = await supabase
    .from("rentals")
    .select("id")
    .eq("bike_id", id)
    .limit(1);

  if (rentalsError) throw new Error("Could not check rental history for this bike.");
  if (rentals && rentals.length > 0) {
    throw new Error("This bike has rental history and cannot be deleted. Mark it INACTIVE instead.");
  }

  const { data: repairs, error: repairsError } = await supabase
    .from("repair_requests")
    .select("id")
    .eq("bike_id", id)
    .limit(1);

  if (repairsError) throw new Error("Could not check repair history for this bike.");
  if (repairs && repairs.length > 0) {
    throw new Error("This bike has repair history and cannot be deleted. Mark it INACTIVE instead.");
  }

  const { error } = await supabase
    .from("bikes")
    .delete()
    .eq("id", id);

  if (error) throw new Error("Bike could not be deleted.");

  const storagePath = storagePathFromPublicUrl(bike.image_url, "bike-images");
  if (storagePath) {
    await supabase.storage.from("bike-images").remove([storagePath]);
  }

  revalidatePath("/admin");
  revalidatePath("/bikes");
}

export async function saveBikeCategory(formData) {
  const { supabase } = await requireAdmin();
  const id = cleanString(formData.get("id"));
  const name = cleanString(formData.get("name"));
  const description = cleanString(formData.get("description")) || null;

  if (!name) throw new Error("Category name is required.");

  const payload = { name, description };
  const { error } = id
    ? await supabase.from("bike_categories").update(payload).eq("id", id)
    : await supabase.from("bike_categories").insert(payload);

  if (error) throw new Error("Bike category could not be saved.");
  revalidatePath("/admin");
  revalidatePath("/bikes");
}

export async function saveApartment(formData) {
  const { supabase } = await requireAdmin();
  const id = cleanString(formData.get("id"));
  const name = cleanString(formData.get("name"));
  const status = cleanString(formData.get("status")) || "AVAILABLE";
  const categoryId = cleanString(formData.get("category_id")) || null;
  const description = cleanString(formData.get("description")) || null;
  const location = cleanString(formData.get("location")) || null;
  const bedroomsValue = cleanString(formData.get("bedrooms"));
  const priceInfo = parseJsonField(formData.get("price_info"), {});
  const amenities = parseListField(formData.get("amenities"));
  const imageUrls = parseListField(formData.get("image_urls"));

  if (!name) throw new Error("Apartment name is required.");
  if (!apartmentStatuses.includes(status)) throw new Error("Invalid apartment status.");

  const payload = {
    name,
    category_id: categoryId,
    description,
    location,
    price_info: priceInfo,
    bedrooms: bedroomsValue ? Number(bedroomsValue) : null,
    amenities,
    image_urls: imageUrls,
    status,
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await supabase.from("apartments").update(payload).eq("id", id)
    : await supabase.from("apartments").insert(payload);

  if (error) throw new Error("Apartment could not be saved.");
  revalidatePath("/admin");
  revalidatePath("/apartments");
}

export async function saveApartmentCategory(formData) {
  const { supabase } = await requireAdmin();
  const id = cleanString(formData.get("id"));
  const name = cleanString(formData.get("name"));
  const description = cleanString(formData.get("description")) || null;

  if (!name) throw new Error("Category name is required.");

  const payload = { name, description };
  const { error } = id
    ? await supabase.from("apartment_categories").update(payload).eq("id", id)
    : await supabase.from("apartment_categories").insert(payload);

  if (error) throw new Error("Apartment category could not be saved.");
  revalidatePath("/admin");
  revalidatePath("/apartments");
}

export async function updateRepairRequestStatus(formData) {
  const { supabase } = await requireAdmin();
  const id = cleanString(formData.get("id"));
  const status = cleanString(formData.get("status"));

  if (!id) throw new Error("Repair request is required.");
  if (!repairStatuses.includes(status)) throw new Error("Invalid repair status.");

  const { data: request, error: fetchError } = await supabase
    .from("repair_requests")
    .select("user_id, status, repair_services!repair_requests_service_id_fkey(name), profiles!repair_requests_user_id_fkey(email)")
    .eq("id", id)
    .single();

  if (fetchError || !request) {
    throw new Error("Could not fetch repair request details.");
  }

  // Prevent sending emails if status is not actually changing
  if (request.status === status) {
    return;
  }

  const { error } = await supabase
    .from("repair_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error("Repair request could not be updated.");

  const serviceName = request.repair_services?.name || "Your repair request";
  const statusLabel = status.replace("_", " ");
  
  await supabase.from("notifications").insert({
    user_id: request.user_id,
    title: `Repair update: ${statusLabel}`,
    message: `${serviceName} is now ${statusLabel}.`,
  });

  const dashboardUrl = `${getSiteUrl()}/dashboard`;
  await sendEmail({
    to: request.profiles?.email,
    template: repairStatusUpdatedTemplate({ dashboardUrl, status, serviceName }),
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin");
}

export async function saveSettings(formData) {
  const { supabase } = await requireAdmin();

  const settings = [
    { id: "contract_terms", value: formData.get("contract_terms") },
    { id: "payment_account_name", value: formData.get("payment_account_name") },
    { id: "payment_account_bank", value: formData.get("payment_account_bank") },
    { id: "payment_account_iban", value: formData.get("payment_account_iban") },
    { id: "payment_account_bic", value: formData.get("payment_account_bic") },
    { id: "payment_instructions", value: formData.get("payment_instructions") },
  ].filter(s => s.value !== null);

  for (const setting of settings) {
    if (!setting.value?.trim()) continue;
    const { error } = await supabase
      .from("site_settings")
      .upsert({ id: setting.id, value: setting.value.trim(), updated_at: new Date().toISOString() }, { onConflict: "id" });
    if (error) throw new Error(`Could not save setting "${setting.id}".`);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/bikes");
}

