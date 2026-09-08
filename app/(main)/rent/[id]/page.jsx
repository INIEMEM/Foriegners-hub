import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CheckoutFlow from "./CheckoutFlow";

export const metadata = {
  title: "Start Your Rental | Foreigners Hub",
};

export default async function RentPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Must be logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=/rent/${id}`);
  }

  // 2. Fetch User Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // 3. Fetch Bike
  const { data: bike } = await supabase
    .from("bikes")
    .select("*, bike_categories(name)")
    .eq("id", id)
    .single();

  if (!bike) notFound();

  if (bike.status !== "AVAILABLE") {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🚲</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Bike Unavailable</h1>
        <p className="text-slate-600 mb-6">This bike is no longer available for rent. Browse other bikes below.</p>
        <a href="/bikes" className="fh-primary-btn inline-flex">Browse available bikes</a>
      </div>
    );
  }

  // 4. Check if user already has an active/pending bike rental
  const { data: existingRentals } = await supabase
    .from("rentals")
    .select("id, status")
    .eq("user_id", user.id)
    .not("bike_id", "is", null)
    .not("status", "in", "(EXPIRED,CANCELLED)");

  const hasActiveBikeRental = existingRentals && existingRentals.length > 0;

  if (hasActiveBikeRental) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-8 mb-6">
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>⚠️</div>
          <h1 className="text-xl font-bold text-orange-900 mb-2">Active Rental Found</h1>
          <p className="text-sm text-orange-800">
            You already have an active or pending bike rental. Only one rental is allowed at a time.
          </p>
        </div>
        <a href="/dashboard" className="text-brand font-semibold hover:underline">
          Go to your dashboard →
        </a>
      </div>
    );
  }

  // 5. Determine if returning customer (has at least one EXPIRED/completed rental)
  const { data: priorRentals } = await supabase
    .from("rentals")
    .select("id")
    .eq("user_id", user.id)
    .not("bike_id", "is", null)
    .in("status", ["EXPIRED", "COMPLETED"])
    .limit(1);

  const isReturningCustomer = priorRentals && priorRentals.length > 0;

  // 6. Fetch site settings (for payment details + WhatsApp number)
  const { data: settingsData } = await supabase
    .from("site_settings")
    .select("id, value");

  const siteSettings = Object.fromEntries(
    (settingsData || []).map((s) => [s.id, s.value])
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--fh-off-white)" }}>
      <div className="fh-container py-10 md:py-16">
        <CheckoutFlow
          bike={bike}
          profile={profile}
          user={user}
          siteSettings={siteSettings}
          isReturningCustomer={isReturningCustomer}
        />
      </div>
    </div>
  );
}
