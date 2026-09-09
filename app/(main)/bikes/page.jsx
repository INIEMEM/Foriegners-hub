import { createClient } from "@/lib/supabase/server";
import BikePageView from "@/components/bikes/BikePageView";

export const metadata = {
  title: "Bike Rental Vilnius | Foreigners Hub",
  description:
    "Rent a maintained city bike in Vilnius with free maintenance, helmet, phone holder, GPS tracker, human support, and flexible payment plans.",
};

export default async function BikesPage() {
  const supabase = await createClient();

  const [{ data: settingsData }, { data: { user } }] = await Promise.all([
    supabase.from("site_settings").select("id, value"),
    supabase.auth.getUser(),
  ]);

  const siteSettings = Object.fromEntries(
    (settingsData || []).map((s) => [s.id, s.value])
  );

  return <BikePageView siteSettings={siteSettings} currentUser={user} />;
}
