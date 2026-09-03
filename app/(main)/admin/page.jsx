import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminOperations from "./AdminOperations";

export const metadata = {
  title: "Admin Dashboard",
};

function isUpcomingReturn(rental) {
  if (!rental.end_date || rental.status !== "ACTIVE") return false;
  const now = new Date();
  const endDate = new Date(rental.end_date);
  const days = Math.ceil((endDate.getTime() - now.getTime()) / 86400000);
  return days >= 0 && days <= 7;
}

function isOverdueRental(rental) {
  if (!rental.end_date || rental.status !== "ACTIVE") return false;
  return new Date(rental.end_date).getTime() < Date.now();
}

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "ADMIN") redirect("/dashboard");

  const [
    rentalsResult,
    paymentsResult,
    bikesResult,
    bikeCategoriesResult,
    apartmentsResult,
    apartmentCategoriesResult,
    usersResult,
    contractsResult,
    repairsResult,
    repairServicesResult,
    extensionsResult,
    settingsResult,
  ] = await Promise.all([
    supabase
      .from("rentals")
      .select(`
        *,
        profiles!rentals_user_id_fkey(id, email, first_name, last_name),
        bikes(id, name, b_code, status),
        apartments(id, name),
        rental_pricing_plans(id, name, total_price),
        payments!payments_rental_id_fkey(id, status, amount, payment_date, verified_at),
        rental_extensions!rental_extensions_rental_id_fkey(id, status, amount, proposed_end_date)
      `)
      .order("created_at", { ascending: false }),
    supabase
      .from("payments")
      .select(`
        *,
        profiles!payments_user_id_fkey(id, email, first_name, last_name),
        rentals!payments_rental_id_fkey(
          id,
          status,
          total_amount,
          deposit_amount,
          start_date,
          end_date,
          rental_pricing_plans(id, name),
          bikes(id, name, b_code, status)
        ),
        rental_extensions!rental_extensions_payment_id_fkey(id, status, amount, proposed_end_date)
      `)
      .order("created_at", { ascending: false }),
    supabase
      .from("bikes")
      .select("*, bike_categories(id, name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("bike_categories")
      .select("*")
      .order("name", { ascending: true }),
    supabase
      .from("apartments")
      .select("*, apartment_categories(id, name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("apartment_categories")
      .select("*")
      .order("name", { ascending: true }),
    supabase
      .from("profiles")
      .select(`
        id,
        email,
        role,
        first_name,
        last_name,
        phone,
        created_at,
        rentals!rentals_user_id_fkey(id, status, created_at, bikes(name, b_code), apartments(name)),
        payments!payments_user_id_fkey(id, status, amount, created_at),
        contracts!contracts_user_id_fkey(id, status, signed_at, version)
      `)
      .order("created_at", { ascending: false }),
    supabase
      .from("contracts")
      .select(`
        *,
        profiles!contracts_user_id_fkey(id, email, first_name, last_name),
        rentals!contracts_rental_id_fkey(id, status, bikes(name, b_code), apartments(name))
      `)
      .order("created_at", { ascending: false }),
    supabase
      .from("repair_requests")
      .select(`
        *,
        profiles!repair_requests_user_id_fkey(id, email, first_name, last_name),
        bikes!repair_requests_bike_id_fkey(id, name, b_code),
        repair_services!repair_requests_service_id_fkey(id, name)
      `)
      .order("created_at", { ascending: false }),
    supabase
      .from("repair_services")
      .select("*")
      .order("name", { ascending: true }),
    supabase
      .from("rental_extensions")
      .select(`
        *,
        profiles!rental_extensions_user_id_fkey(id, email, first_name, last_name),
        rental_pricing_plans!rental_extensions_pricing_plan_id_fkey(id, name, total_price),
        rentals!rental_extensions_rental_id_fkey(id, status, bikes(id, name, b_code))
      `)
      .order("created_at", { ascending: false }),
    supabase.from("site_settings").select("id, value"),
  ]);

  const rentals = rentalsResult.data || [];
  const payments = paymentsResult.data || [];
  const bikes = bikesResult.data || [];
  const repairs = repairsResult.data || [];
  const users = usersResult.data || [];
  const extensions = extensionsResult.data || [];

  // Convert settings array to a keyed object: { contract_terms: "...", ... }
  const siteSettings = Object.fromEntries(
    (settingsResult.data || []).map((s) => [s.id, s.value])
  );

  const stats = {
    activeRentals: rentals.filter((rental) => rental.status === "ACTIVE").length,
    pendingPayments: payments.filter((payment) => payment.status === "PAYMENT_SUBMITTED").length,
    upcomingReturns: rentals.filter(isUpcomingReturn).length,
    overdueRentals: rentals.filter(isOverdueRental).length,
    availableBikes: bikes.filter((bike) => bike.status === "AVAILABLE").length,
    rentedBikes: bikes.filter((bike) => bike.status === "RENTED").length,
    maintenanceBikes: bikes.filter((bike) => bike.status === "MAINTENANCE").length,
    totalUsers: users.length,
    pendingRepairs: repairs.filter((repair) => repair.status === "PENDING").length,
    pendingExtensions: extensions.filter((extension) =>
      ["REQUESTED", "AWAITING_PAYMENT", "PAYMENT_SUBMITTED", "PAYMENT_VERIFIED"].includes(extension.status)
    ).length,
  };

  const loadErrors = [
    rentalsResult.error,
    paymentsResult.error,
    bikesResult.error,
    bikeCategoriesResult.error,
    apartmentsResult.error,
    apartmentCategoriesResult.error,
    usersResult.error,
    contractsResult.error,
    repairsResult.error,
    repairServicesResult.error,
    extensionsResult.error,
  ].filter(Boolean);

  return (
    <AdminOperations
      adminEmail={profile.email || user.email}
      stats={stats}
      loadErrorCount={loadErrors.length}
      rentals={rentals}
      payments={payments}
      bikes={bikes}
      bikeCategories={bikeCategoriesResult.data || []}
      apartments={apartmentsResult.data || []}
      apartmentCategories={apartmentCategoriesResult.data || []}
      users={users}
      contracts={contractsResult.data || []}
      repairs={repairs}
      repairServices={repairServicesResult.data || []}
      extensions={extensions}
      siteSettings={siteSettings}
    />
  );
}

