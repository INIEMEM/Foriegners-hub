import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CheckoutFlow from "./CheckoutFlow";

export const metadata = {
  title: "Secure Checkout | Foreigners Hub",
};

export default async function RentPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  
  // 1. Authenticate user
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

  // If bike is not available, we shouldn't allow a new rental
  // However, maybe this user just created it and is looking at it, but usually, we enforce availability here.
  if (bike.status !== "AVAILABLE") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Bike Unavailable</h1>
        <p className="text-slate-600 mb-6">This bike is no longer available for rent.</p>
        <a href="/bikes" className="text-brand font-medium hover:underline">Return to bikes</a>
      </div>
    );
  }

  // 4. Fetch Pricing Plans
  const { data: plans } = await supabase
    .from("rental_pricing_plans")
    .select("*")
    .order("total_price", { ascending: true });

  // 5. Check if user already has an active bike rental (so we can warn/block gracefully)
  const { data: existingRentals } = await supabase
    .from("rentals")
    .select("id, status")
    .eq("user_id", user.id)
    .not("bike_id", "is", null)
    .not("status", "in", "(EXPIRED,CANCELLED)");
    
  const hasActiveBikeRental = existingRentals && existingRentals.length > 0;

  // 6. Fetch Settings
  const { data: settingsData } = await supabase
    .from("site_settings")
    .select("id, value");
  
  const siteSettings = Object.fromEntries(
    (settingsData || []).map((s) => [s.id, s.value])
  );

  if (hasActiveBikeRental) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <div className="premium-card mb-6 rounded-2xl border-red-200 bg-red-50 p-6 text-red-700">
          <h1 className="text-xl font-bold mb-2">Active Rental Found</h1>
          <p className="text-sm">
            Our records indicate you already have an active or pending bike rental. 
            You may only have one active bike rental at a time.
          </p>
        </div>
        <a href="/dashboard" className="text-brand font-medium hover:underline">Go to your dashboard</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-10">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <CheckoutFlow 
          bike={bike} 
          plans={plans} 
          profile={profile} 
          user={user} 
          siteSettings={siteSettings}
        />
      </div>
    </div>
  );
}
