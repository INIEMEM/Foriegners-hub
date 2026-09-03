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
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

const includedAccessories = [
  "Helmet (Safety certified)",
  "Riding gloves",
  "Scarf / Face cover",
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

  const { data: pricingPlans } = await supabase
    .from("rental_pricing_plans")
    .select("*")
    .order("total_price", { ascending: true });

  const { data: repairServices } = await supabase
    .from("repair_services")
    .select("name")
    .order("name", { ascending: true });

  const isAvailable = bike.status === "AVAILABLE";

  return (
    <div className="min-h-screen bg-slate-50/70">
      {/* ── Breadcrumb ──────────────────────────────────── */}
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

      {/* ── Main content ────────────────────────────────── */}
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
              {/* Status badge */}
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

            {/* Pricing plans */}
            <div className="mb-7">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
                Rental Plans
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {pricingPlans?.map((plan) => (
                  <div
                    key={plan.id}
                    className="premium-card rounded-xl px-3 py-3 text-center"
                  >
                    <p className="text-xs text-slate-400 mb-0.5">{plan.name}</p>
                    <p className="font-bold text-slate-900">€{plan.total_price}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Deposit note */}
            <div className="mb-7 flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <ShieldCheck size={16} className="text-brand flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                New rentals require a{" "}
                <strong className="font-semibold">€50 refundable deposit</strong>{" "}
                on top of the rental fee, returned when the bike is handed back.
              </p>
            </div>

            {/* CTA */}
            <div className="mt-auto">
              {isAvailable ? (
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href={`/rent/${bike.id}`}>
                    Rent this bike{" "}
                    <ArrowRight size={16} className="ml-1" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" disabled className="w-full sm:w-auto">
                  Currently Unavailable
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ── Included + Repairs ──────────────────────── */}
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
      </div>
    </div>
  );
}
