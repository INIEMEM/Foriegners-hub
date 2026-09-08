import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RentalRequestFlow from "./RentalRequestFlow";
import { Suspense } from "react";

export const metadata = {
  title: "Start Your Rental | Foreigners Hub",
};

export default async function RentRequestPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  let isReturningCustomer = false;

  if (user) {
    // Check if user already has an active/pending rental
    const { data: existingRentals } = await supabase
      .from("rentals")
      .select("id, status")
      .eq("user_id", user.id)
      .not("status", "in", "(EXPIRED,CANCELLED)")
      .limit(1);

    if (existingRentals && existingRentals.length > 0) {
      return (
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ maxWidth: "480px", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⚠️</div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "10px" }}>
              Active Rental Found
            </h1>
            <p style={{ fontSize: "15px", color: "#64748b", lineHeight: 1.7, marginBottom: "24px" }}>
              You already have an active or pending rental. Only one rental is allowed at a time.
              Head to your dashboard to manage it.
            </p>
            <a
              href="/dashboard"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "#315cff", color: "white", fontWeight: 700,
                padding: "12px 24px", borderRadius: "12px", textDecoration: "none", fontSize: "15px",
              }}
            >
              Go to Dashboard →
            </a>
          </div>
        </div>
      );
    }

    // Check if returning customer (has prior completed rental — no deposit needed)
    const { data: priorRentals } = await supabase
      .from("rentals")
      .select("id")
      .eq("user_id", user.id)
      .in("status", ["EXPIRED", "COMPLETED"])
      .limit(1);

    isReturningCustomer = priorRentals && priorRentals.length > 0;
  }

  // Site settings (payment details, WhatsApp)
  const { data: settingsData } = await supabase
    .from("site_settings")
    .select("id, value");

  const siteSettings = Object.fromEntries(
    (settingsData || []).map((s) => [s.id, s.value])
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--fh-off-white, #f8fafc)" }}>
      <div className="fh-container py-10 md:py-14">
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>}>
          <RentalRequestFlow
            user={user}
            siteSettings={siteSettings}
            isReturningCustomer={isReturningCustomer}
          />
        </Suspense>
      </div>
    </div>
  );
}
