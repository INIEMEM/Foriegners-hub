import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  ShieldCheck,
  Wrench,
  CheckCircle,
  Zap,
  Calendar,
  CreditCard,
  Clock,
  AlertTriangle,
  MessageCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const includedAccessories = [
  "Free maintenance & quick repairs",
  "Certified safety helmet",
  "Secure phone holder",
  "Real-time GPS anti-theft tracker",
  "Human support via WhatsApp & phone",
  "Minimum rental term: 1 month",
];

const PLANS = [
  {
    id: "weekly",
    label: "Weekly payment",
    price: "€45/wk",
    sublabel: "€45 per week over 4 weeks (min. 1 month)",
    tag: "Flexible",
  },
  {
    id: "monthly",
    label: "Pay at once",
    price: "€170",
    sublabel: "Pay once upfront for the entire month",
    tag: "Save €10",
  },
];

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: bike } = await supabase
    .from("bikes")
    .select("name")
    .eq("id", id)
    .single();

  if (!bike) return { title: "Bike Not Found" };
  return { title: `${bike.name} | Foreigners Hub` };
}

export default async function BikeDetailsPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: bike } = await supabase
    .from("bikes")
    .select("*, bike_categories(name)")
    .eq("id", id)
    .single();

  if (!bike) notFound();

  const { data: repairServices } = await supabase
    .from("repair_services")
    .select("name")
    .order("name", { ascending: true });

  const isAvailable = bike.status === "AVAILABLE";

  return (
    <div className="min-h-screen bg-slate-50/70">
      {/* ── Breadcrumb ── */}
      <div className="border-b border-slate-200/70 bg-white">
        <div className="container mx-auto px-4 md:px-8 py-4">
          <Link
            href="/bikes"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-950"
          >
            <ArrowLeft size={15} />
            All bikes
          </Link>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="container mx-auto px-4 md:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Left: Image */}
          <div className="premium-card overflow-hidden rounded-2xl">
            <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center relative overflow-hidden">
              {bike.image_url ? (
                <img
                  src={bike.image_url}
                  alt={bike.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Bike size={80} className="text-slate-300" />
              )}
              <div className="absolute top-4 left-4">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    isAvailable
                      ? "border border-green-DEFAULT/20 bg-green-light text-green-dark"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {isAvailable ? "Available" : bike.status}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="flex flex-col">
            {/* Category & code */}
            <div className="flex items-center gap-3 mb-3">
              {bike.bike_categories?.name && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand bg-brand/8 px-2.5 py-1 rounded-full">
                  <Zap size={11} />
                  {bike.bike_categories.name}
                </span>
              )}
              <span className="text-xs text-slate-400 font-mono">
                {bike.b_code}
              </span>
            </div>

            <h1 className="mb-4 text-4xl font-extrabold leading-tight text-slate-950 md:text-5xl">
              {bike.name}
            </h1>

            {bike.description && (
              <p className="mb-7 text-lg leading-8 text-slate-600">
                {bike.description}
              </p>
            )}

            {/* Plans */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={15} className="text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                  Payment plans — minimum 1 month
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className="premium-card rounded-xl px-4 py-4"
                  >
                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-brand bg-brand/8 px-2 py-0.5 rounded-full mb-2">
                      {plan.tag}
                    </span>
                    <p className="font-bold text-slate-900 text-base">{plan.price}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{plan.sublabel}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Deposit note */}
            <div className="mb-7 flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <ShieldCheck size={16} className="text-brand flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                New customers pay a{" "}
                <strong className="font-semibold">€50 refundable deposit</strong>{" "}
                with their first payment. Returning customers are exempt. Deposit
                is returned when the bike is handed back in good condition.
              </p>
            </div>

            {/* How it works — mini steps */}
            <div className="mb-7">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={15} className="text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                  How it works
                </h2>
              </div>
              <ol className="flex flex-col gap-2">
                {[
                  "Choose your start date & plan",
                  "Transfer payment + send screenshot via WhatsApp",
                  "We verify & assign you a bike with pickup time",
                  "Sign your contract on the dashboard — your rental starts!",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand/10 text-[10px] font-bold text-brand">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* CTA */}
            <div className="mt-auto">
              {isAvailable ? (
                <Link
                  href={`/rent/request?bike=${bike.id}`}
                  className="inline-flex items-center gap-2 font-bold text-white px-7 py-3.5 rounded-xl text-base"
                  style={{ background: "#315cff" }}
                >
                  Request This Bike <ArrowRight size={16} />
                </Link>
              ) : (
                <button disabled className="inline-flex items-center gap-2 font-bold text-white px-7 py-3.5 rounded-xl text-base bg-slate-300 cursor-not-allowed">
                  Currently Unavailable
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Included + Repairs ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Accessories */}
          <div className="premium-card rounded-2xl p-7 md:p-8">
            <div className="flex items-center gap-2.5 mb-1">
              <CheckCircle size={18} className="text-green-DEFAULT" />
              <h3 className="font-semibold text-slate-900">Included for free</h3>
            </div>
            <p className="text-sm text-slate-500 mb-5 ml-7">
              Every rental includes the following accessories at no charge.
            </p>
            <ul className="space-y-3 ml-7">
              {includedAccessories.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-green-DEFAULT flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Repairs */}
          <div className="premium-card rounded-2xl p-7 md:p-8">
            <div className="flex items-center gap-2.5 mb-1">
              <Wrench size={18} className="text-slate-600" />
              <h3 className="font-semibold text-slate-900">
                Maintenance &amp; repairs
              </h3>
            </div>
            <p className="text-sm text-slate-500 mb-5 ml-7">
              Our team handles repairs to keep your bike running throughout
              your rental period.
            </p>
            <div className="flex flex-wrap gap-2 ml-7">
              {repairServices?.map((service) => (
                <span
                  key={service.name}
                  className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600"
                >
                  {service.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Payment reminders & delayed payment policy ── */}
        <div className="mt-8 premium-card rounded-2xl p-7 md:p-8 border border-slate-200/80 bg-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-brand">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                Payment Reminders &amp; Delayed Payments
              </h3>
              <p className="text-sm text-slate-500">
                Transparent and friendly policies so you always stay ahead.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-brand" />
                <h4 className="font-bold text-slate-900 text-sm">Advance Reminders</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                You receive automated WhatsApp and email reminders 3 days and 1 day before your next installment is due.
              </p>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-amber-600" />
                <h4 className="font-bold text-amber-900 text-sm">48-Hour Grace Period</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                If payment is delayed, we provide a 48-hour grace period with friendly check-ins so you never lose your ride without notice.
              </p>
            </div>

            <div className="rounded-xl border border-green-100 bg-green-50/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle size={16} className="text-green-600" />
                <h4 className="font-bold text-green-900 text-sm">Always Reach Out</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Need extra time or want to extend your rental? Message us on WhatsApp and our team will work out an arrangement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
