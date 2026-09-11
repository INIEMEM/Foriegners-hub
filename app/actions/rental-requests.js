"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, getSiteUrl } from "@/lib/email/service";
import { rentalRequestAdminNotificationTemplate } from "@/lib/email/templates";
import { randomUUID } from "crypto";

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

function safeRevalidate(path) {
  try {
    revalidatePath(path);
  } catch {
    // ignore when invoked outside Next.js request context
  }
}

/**
 * Persists and submits a new rental request / lead from a prospective customer.
 * Dispatches an instant email notification to the Admin.
 */
export async function submitRentalRequest(payload) {
  const {
    fullName = "",
    phone = "",
    planType = "weekly",
    planLabel = "Pay weekly (€45/wk)",
    startDate = "",
    bikeId = null,
    bikeName = null,
  } = payload || {};

  const cleanName = fullName.trim();
  const cleanPhone = phone.trim();

  if (!cleanName) {
    return { success: false, error: "Please provide your full name." };
  }
  if (!cleanPhone) {
    return { success: false, error: "Please provide your phone number." };
  }

  const requestId = randomUUID();
  const nowIso = new Date().toISOString();

  const requestData = {
    id: requestId,
    fullName: cleanName,
    phone: cleanPhone,
    planType,
    planLabel: planLabel || (planType === "weekly" ? "Pay weekly (€45/wk)" : "Pay at once (€170/mo)"),
    startDate: startDate || new Date().toISOString().split("T")[0],
    bikeId: bikeId || null,
    bikeName: bikeName || null,
    status: "NEW", // NEW | CONTACTED | CONVERTED | ARCHIVED
    notes: "",
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const adminSupabase = createAdminClient();

  // 1. Storage persistence (Dual-mode: dedicated table or site_settings fallback)
  let saved = false;
  try {
    const { error: tblError } = await adminSupabase.from("rental_requests").insert([
      {
        id: requestId,
        full_name: cleanName,
        phone: cleanPhone,
        plan_type: planType,
        plan_label: requestData.planLabel,
        start_date: requestData.startDate,
        bike_id: bikeId || null,
        status: "NEW",
        notes: "",
        created_at: nowIso,
        updated_at: nowIso,
      },
    ]);
    if (!tblError) {
      saved = true;
    }
  } catch {
    saved = false;
  }

  // Fallback to site_settings if rental_requests table is not present
  if (!saved) {
    try {
      await adminSupabase.from("site_settings").insert({
        id: `rental_req_${Date.now()}_${requestId.slice(0, 8)}`,
        value: JSON.stringify(requestData),
      });
      saved = true;
    } catch (err) {
      console.error("Failed to save rental request lead:", err);
    }
  }

  // 2. Dispatch Email to Admin(s)
  try {
    // Find all admin emails
    const { data: admins } = await adminSupabase
      .from("profiles")
      .select("email")
      .eq("role", "ADMIN");

    const adminEmails = (admins || [])
      .map((a) => a.email?.trim().toLowerCase())
      .filter(Boolean);

    if (adminEmails.length === 0) {
      adminEmails.push("davidiniemem2000@gmail.com");
    }

    const siteUrl = getSiteUrl();
    const adminUrl = `${siteUrl}/admin`;

    const emailTemplate = rentalRequestAdminNotificationTemplate({
      guestName: cleanName,
      guestPhone: cleanPhone,
      planLabel: requestData.planLabel,
      startDate: requestData.startDate,
      bikeName: bikeName || null,
      adminUrl,
    });

    // Send to each admin email
    for (const email of adminEmails) {
      await sendEmail({
        to: email,
        template: emailTemplate,
      });
    }
  } catch (emailErr) {
    console.error("Error dispatching admin notification email:", emailErr);
    // Non-fatal: do not block the user flow if email sending has an issue
  }

  safeRevalidate("/admin");
  return { success: true, request: requestData };
}

/**
 * Retrieves all rental requests for the Admin Dashboard.
 */
export async function getRentalRequests() {
  const adminSupabase = createAdminClient();
  const results = [];

  // Try dedicated table first
  try {
    const { data: tblData, error: tblErr } = await adminSupabase
      .from("rental_requests")
      .select("*, bikes(id, name, b_code)")
      .order("created_at", { ascending: false });

    if (!tblErr && tblData) {
      tblData.forEach((row) => {
        results.push({
          id: row.id,
          storageType: "table",
          fullName: row.full_name,
          phone: row.phone,
          planType: row.plan_type,
          planLabel: row.plan_label,
          startDate: row.start_date,
          bikeId: row.bike_id,
          bikeName: row.bikes?.name || null,
          bikeCode: row.bikes?.b_code || null,
          status: row.status || "NEW",
          notes: row.notes || "",
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        });
      });
      return results;
    }
  } catch {
    // Table not available, fallback to site_settings
  }

  // Fallback: Read from site_settings
  try {
    const { data: settingsData } = await adminSupabase
      .from("site_settings")
      .select("id, value, updated_at")
      .ilike("id", "rental_req_%")
      .order("updated_at", { ascending: false });

    if (settingsData && settingsData.length > 0) {
      for (const row of settingsData) {
        try {
          const parsed = JSON.parse(row.value);
          results.push({
            ...parsed,
            storageKey: row.id,
            storageType: "setting",
          });
        } catch {
          // ignore corrupted JSON
        }
      }
    }
  } catch (err) {
    console.error("Error loading rental requests from site_settings:", err);
  }

  return results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

/**
 * Admin action: Update a rental request status and internal notes.
 */
export async function updateRentalRequestStatus(identifier, status, notes = "") {
  await requireAdmin();
  const adminSupabase = createAdminClient();

  // Try dedicated table first if uuid format
  try {
    const { error: tblErr } = await adminSupabase
      .from("rental_requests")
      .update({
        status,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", identifier);

    if (!tblErr) {
      safeRevalidate("/admin");
      return { success: true };
    }
  } catch {
    // continue to fallback
  }

  // Fallback site_settings
  try {
    // Try matching storageKey directly or finding row
    const { data: row } = await adminSupabase
      .from("site_settings")
      .select("id, value")
      .or(`id.eq.${identifier},id.ilike.%${identifier}%`)
      .maybeSingle();

    if (row) {
      const parsed = JSON.parse(row.value);
      parsed.status = status;
      if (typeof notes === "string") parsed.notes = notes;
      parsed.updatedAt = new Date().toISOString();

      await adminSupabase
        .from("site_settings")
        .update({
          value: JSON.stringify(parsed),
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);

      safeRevalidate("/admin");
      return { success: true };
    }
  } catch (err) {
    console.error("Failed to update rental request status:", err);
    return { success: false, error: err.message || "Failed to update request." };
  }

  safeRevalidate("/admin");
  return { success: true };
}

/**
 * Admin action: Delete / Archive a rental request.
 */
export async function deleteRentalRequest(identifier) {
  await requireAdmin();
  const adminSupabase = createAdminClient();

  // Try table
  try {
    await adminSupabase.from("rental_requests").delete().eq("id", identifier);
  } catch {
    // ignore
  }

  // Try site_settings
  try {
    await adminSupabase
      .from("site_settings")
      .delete()
      .or(`id.eq.${identifier},id.ilike.%${identifier}%`);
  } catch {
    // ignore
  }

  safeRevalidate("/admin");
  return { success: true };
}
