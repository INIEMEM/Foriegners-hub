import SignContractPanel from "./SignContractPanel";
import ContractAccessPanel from "./ContractAccessPanel";
import Link from "next/link";
import {
  ArrowRight,
  Bike,
  CalendarDays,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  History,
  Inbox,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import RentalExtensionPanel from "./RentalExtensionPanel";
import CancelRentalPanel from "./CancelRentalPanel";
import RepairRequestPanel from "./RepairRequestPanel";
import {
  getPaymentStatusMeta,
  getRentalProgress,
  getRentalStatusMeta,
} from "@/lib/rental-status";

export const metadata = {
  title: "Dashboard",
};

function formatDate(value) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value || 0));
}

function latestByDate(items = [], dateFields = ["created_at"]) {
  return [...items].sort((a, b) => {
    const aDate = dateFields.map((field) => a?.[field]).find(Boolean) || 0;
    const bDate = dateFields.map((field) => b?.[field]).find(Boolean) || 0;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  })[0];
}

function StatusBadge({ meta }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${meta.className}`}>
      {meta.label}
    </span>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function ProgressBar({ progress }) {
  const colors = {
    green: "bg-green-DEFAULT",
    orange: "bg-orange-DEFAULT",
    red: "bg-danger-DEFAULT",
    slate: "bg-slate-400",
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-900">{progress.label}</p>
          <p className="text-xs text-slate-500">{progress.message}</p>
        </div>
        {progress.daysUntilReturn !== null && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {progress.daysUntilReturn > 0
              ? `${progress.daysUntilReturn} day${progress.daysUntilReturn === 1 ? "" : "s"} left`
              : "Due now"}
          </span>
        )}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${colors[progress.tone]}`}
          style={{ width: `${progress.percent}%` }}
        />
      </div>
    </div>
  );
}


function CurrentRental({ rental, pricingPlans, repairServices, siteSettings, userEmail, userName }) {
  if (!rental) {
    return (
      <section className="premium-card rounded-2xl p-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light">
          <Bike size={22} className="text-brand" />
        </div>
        <h2 className="mb-2 text-2xl font-extrabold text-slate-950">
          No current bike rental
        </h2>
        <p className="mb-6 max-w-xl text-sm leading-7 text-slate-600">
          You do not have an active or pending bike rental right now. Browse
          available bikes when you are ready to start a rental.
        </p>
        <Button asChild>
          <Link href="/bikes">
            Browse bikes <ArrowRight size={15} />
          </Link>
        </Button>
      </section>
    );
  }

  const statusMeta = getRentalStatusMeta(rental.status);
  const latestPayment = latestByDate(rental.payments, ["payment_date", "created_at"]);
  const paymentMeta = latestPayment
    ? getPaymentStatusMeta(latestPayment.status)
    : getPaymentStatusMeta(rental.status === "AWAITING_PAYMENT" ? "AWAITING_PAYMENT" : null);
  const contract = latestByDate(rental.contracts, ["signed_at", "created_at"]);
  const activeExtension = latestByDate(
    (rental.rental_extensions || []).filter((extension) =>
      ["REQUESTED", "AWAITING_PAYMENT", "PAYMENT_SUBMITTED", "PAYMENT_VERIFIED"].includes(extension.status)
    ),
    ["created_at", "requested_at"]
  );
  const progress = getRentalProgress(rental.start_date, rental.end_date);
  const showProgress = rental.status === "ACTIVE";

  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="premium-card overflow-hidden rounded-2xl">
        <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50 p-5">
          <div className="flex h-16 w-20 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
            {showProgress && rental.bikes?.image_url ? (
              <img
                src={rental.bikes.image_url}
                alt={rental.bikes.name || "Bike"}
                className="h-full w-full object-cover"
              />
            ) : (
              <Bike size={28} className="text-slate-300" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StatusBadge meta={statusMeta} />
              <StatusBadge meta={paymentMeta} />
            </div>
            <h2 className="truncate text-xl font-extrabold text-slate-950">
              {showProgress ? (rental.bikes?.name || "Bike details unavailable") : "Bike to be assigned"}
            </h2>
            <p className="font-mono text-xs text-slate-500">
              {showProgress ? (rental.bikes?.b_code || "Bike Code unavailable") : "Pending assignment"}
            </p>
          </div>
        </div>

        <div className="grid gap-6 p-5 md:grid-cols-2">
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
              <CalendarDays size={16} className="text-brand" />
              Rental details
            </h3>
            <DetailRow label="Rental plan" value={rental.rental_pricing_plans?.name || "Not set"} />
            <DetailRow label="Start date" value={formatDate(rental.start_date)} />
            <DetailRow label="Expected return" value={formatDate(rental.end_date)} />
            <DetailRow
              label="Rental amount"
              value={formatCurrency(Number(rental.total_amount) - Number(rental.deposit_amount || 0))}
            />
            <DetailRow label="Deposit" value={formatCurrency(rental.deposit_amount)} />
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
              <ShieldCheck size={16} className="text-brand" />
              Status guidance
            </h3>
            <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-bold text-slate-900">{statusMeta.label}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{statusMeta.message}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-bold text-slate-900">{paymentMeta.label}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{paymentMeta.message}</p>
            </div>
          </div>
        </div>

        {showProgress && (
          <div className="border-t border-slate-100 p-5">
            <ProgressBar progress={progress} />
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="premium-card rounded-2xl p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
            <FileText size={16} className="text-brand" />
            Contract
          </h3>
          <ContractAccessPanel
            contract={contract}
            rental={rental}
            siteSettings={siteSettings}
            userEmail={userEmail}
            userName={userName}
          />
        </div>

        <div className="premium-card rounded-2xl p-6">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
            <Clock size={16} className="text-brand" />
            Rental extension
          </h3>
          <RentalExtensionPanel
            rental={rental}
            plans={pricingPlans}
            activeExtension={activeExtension}
            siteSettings={siteSettings}
          />
        </div>

        <div className="premium-card rounded-2xl p-6">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
            <Settings size={16} className="text-brand" />
            Rental actions
          </h3>
          <div className="space-y-3">
            <RepairRequestPanel rental={rental} repairServices={repairServices} />
            <CancelRentalPanel rental={rental} siteSettings={siteSettings} />
          </div>
        </div>
      </div>
    </section>
  );
}

function PaymentHistory({ payments }) {
  return (
    <section className="premium-card rounded-2xl p-6">
      <h2 className="mb-5 flex items-center gap-2 text-xl font-extrabold text-slate-950">
        <CreditCard size={20} className="text-brand" />
        Payment history
      </h2>
      {payments.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          No payments have been submitted yet.
        </p>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => {
            const meta = getPaymentStatusMeta(payment.status);
            return (
              <div
                key={payment.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <StatusBadge meta={meta} />
                    <span className="text-xs text-slate-500">
                      {formatDate(payment.payment_date || payment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {payment.rentals?.bikes?.name || "Rental"}
                    {payment.rentals?.bikes?.b_code ? ` (${payment.rentals.bikes.b_code})` : ""}
                  </p>
                  <p className="text-xs text-slate-500">{meta.message}</p>
                  {payment.payment_reference && (
                    <p className="mt-1 text-xs text-slate-500">
                      Reference: {payment.payment_reference}
                    </p>
                  )}
                  {payment.rejection_reason && (
                    <p className="mt-1 text-xs text-red-600">
                      Reason: {payment.rejection_reason}
                    </p>
                  )}
                </div>
                <p className="text-lg font-extrabold text-slate-950">
                  {formatCurrency(payment.amount)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function RentalHistory({ rentals, currentRentalId }) {
  const history = rentals.filter((rental) => rental.id !== currentRentalId);

  return (
    <section className="premium-card rounded-2xl p-6">
      <h2 className="mb-5 flex items-center gap-2 text-xl font-extrabold text-slate-950">
        <History size={20} className="text-brand" />
        Rental history
      </h2>
      {history.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Previous rentals will appear here after your first rental period ends
          or is cancelled.
        </p>
      ) : (
        <div className="space-y-3">
          {history.map((rental) => {
            const meta = getRentalStatusMeta(rental.status);
            return (
              <div
                key={rental.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <StatusBadge meta={meta} />
                    <span className="text-xs text-slate-500">
                      {formatDate(rental.start_date)} to {formatDate(rental.end_date)}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {rental.bikes?.name || rental.apartments?.name || "Rental"}
                  </p>
                  <p className="font-mono text-xs text-slate-500">
                    {rental.bikes?.b_code || rental.rental_pricing_plans?.name || "Details unavailable"}
                  </p>
                </div>
                <p className="text-sm font-bold text-slate-900">
                  {formatCurrency(rental.total_amount)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Notifications({ notifications }) {
  return (
    <section className="premium-card rounded-2xl p-6">
      <h2 className="mb-5 flex items-center gap-2 text-xl font-extrabold text-slate-950">
        <Inbox size={20} className="text-brand" />
        Messages
      </h2>
      {notifications.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          You do not have any account messages right now.
        </p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="mb-1 flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-slate-900">{notification.title}</p>
                {!notification.is_read && (
                  <span className="rounded-full bg-brand-light px-2.5 py-1 text-xs font-bold text-brand">
                    New
                  </span>
                )}
              </div>
              <p className="text-sm leading-6 text-slate-600">{notification.message}</p>
              <p className="mt-2 text-xs text-slate-400">{formatDate(notification.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role === "ADMIN") {
    redirect("/admin");
  }

  const { data: rentals, error: rentalsError } = await supabase
    .from("rentals")
    .select(`
      *,
      bikes(name, b_code, image_url, status),
      apartments(name),
      rental_pricing_plans(name, duration_weeks, duration_months, total_price),
      payments(id, amount, payment_date, status, verified_at, created_at),
      contracts(id, version, signed_at, signer_name, signature_data, document_path, status, created_at),
      rental_extensions(id, pricing_plan_id, payment_id, current_end_date, proposed_end_date, amount, deposit_amount, status, requested_at, payment_submitted_at, created_at)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select(`
      id,
      amount,
      payment_date,
      status,
      verified_at,
      submitted_at,
      rejected_at,
      rejection_reason,
      payment_reference,
      created_at,
      rentals(id, bikes(name, b_code))
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: notifications, error: notificationsError } = await supabase
    .from("notifications")
    .select("id, title, message, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(6);

  const { data: pricingPlans, error: pricingPlansError } = await supabase
    .from("rental_pricing_plans")
    .select("id, name, duration_weeks, duration_months, total_price")
    .order("total_price", { ascending: true });

  const { data: repairServices, error: repairServicesError } = await supabase
    .from("repair_services")
    .select("id, name, description")
    .order("name", { ascending: true });

  const { data: settingsData } = await supabase
    .from("site_settings")
    .select("id, value");
  
  const siteSettings = Object.fromEntries(
    (settingsData || []).map((s) => [s.id, s.value])
  );

  const loadError = profileError || rentalsError || paymentsError || notificationsError || pricingPlansError || repairServicesError;
  const safeRentals = rentals || [];
  const currentRental = safeRentals.find(
    (rental) => rental.bike_id && !["EXPIRED", "CANCELLED"].includes(rental.status)
  );

  return (
    <div className="container mx-auto px-4 py-12 md:px-8 md:py-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-eyebrow mb-3">Account</p>
          <h1 className="text-4xl font-extrabold text-slate-950">User Dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Track your rental status, payment history, signed contracts, and
            account messages.
          </p>
        </div>
        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
          {profile?.email || user.email}
        </div>
      </div>

      {loadError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          We could not load every dashboard section. Please refresh the page or
          try again shortly.
        </div>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="premium-card rounded-2xl p-5">
          <p className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
            <Bike size={16} className="text-brand" />
            Current rental
          </p>
          <p className="text-2xl font-extrabold text-slate-950">
            {currentRental ? getRentalStatusMeta(currentRental.status).label : "None"}
          </p>
        </div>
        <div className="premium-card rounded-2xl p-5">
          <p className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
            <CreditCard size={16} className="text-brand" />
            Payments
          </p>
          <p className="text-2xl font-extrabold text-slate-950">{payments?.length || 0}</p>
        </div>
        <div className="premium-card rounded-2xl p-5">
          <p className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
            <CheckCircle size={16} className="text-brand" />
            Rentals total
          </p>
          <p className="text-2xl font-extrabold text-slate-950">{safeRentals.length}</p>
        </div>
      </div>

      <CurrentRental
        rental={currentRental}
        pricingPlans={pricingPlans || []}
        repairServices={repairServices || []}
        siteSettings={siteSettings}
        userEmail={profile?.email || user.email}
        userName={`${profile?.first_name || ""} ${profile?.last_name || ""}`.trim()}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <PaymentHistory payments={payments || []} />
        <Notifications notifications={notifications || []} />
      </div>

      <div className="mt-8">
        <RentalHistory rentals={safeRentals} currentRentalId={currentRental?.id} />
      </div>
    </div>
  );
}
