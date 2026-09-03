import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowRight,
  Bike,
  Building2,
  ShieldCheck,
  Headphones,
  Wrench,
  CheckCircle,
  BadgeCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Foreigners Hub — Student Bike & Apartment Rentals",
  description:
    "Simple, transparent bike and apartment rentals for students. Browse bikes, find apartments, and get moving.",
};

const whyUsItems = [
  {
    icon: BadgeCheck,
    title: "Transparent pricing",
    description:
      "Clear rental rates with no hidden fees. What you see is what you pay.",
  },
  {
    icon: ShieldCheck,
    title: "Secure process",
    description:
      "Electronic contract signing, verified payments, and a clear rental record.",
  },
  {
    icon: Wrench,
    title: "Maintained fleet",
    description:
      "Every bike is serviced and checked before it goes out. Repair support included.",
  },
  {
    icon: Headphones,
    title: "Student-friendly support",
    description:
      "Real help when you need it. Fast responses, human support.",
  },
];

const steps = [
  {
    step: "01",
    title: "Browse & choose",
    description:
      "Explore available bikes or apartments. Each listing shows real availability, specs, and pricing.",
  },
  {
    step: "02",
    title: "Sign digitally",
    description:
      "Complete your rental details and sign the rental agreement electronically. No paperwork.",
  },
  {
    step: "03",
    title: "Pay locally",
    description:
      "Transfer locally to our account. We verify and activate your rental. Simple as that.",
  },
];

const repairServices = [
  "Brake pad replacement",
  "Brake adjustment",
  "Tire repair",
  "Tube replacement",
  "Chain service",
  "Other services",
];

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch available bikes
  const { data: bikes } = await supabase
    .from("bikes")
    .select("*, bike_categories(name)")
    .eq("status", "AVAILABLE")
    .order("created_at", { ascending: false })
    .limit(3);

  // Fetch available apartments
  const { data: apartments } = await supabase
    .from("apartments")
    .select("*")
    .eq("status", "AVAILABLE")
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div>
      {/* ─────────────────────────────────────────────────── */}
      {/* HERO                                               */}
      {/* ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-slate-200/70 bg-[linear-gradient(180deg,#ffffff_0%,#f7f9ff_58%,#ffffff_100%)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/45 to-transparent" />
        <div className="container mx-auto px-4 md:px-8">
          <div className="mx-auto flex min-h-[78vh] max-w-4xl flex-col items-center justify-center py-24 text-center md:py-28">
            <div className="mb-7 inline-flex items-center rounded-full border border-brand/15 bg-brand/8 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-brand shadow-sm">
              Student rentals made simple
            </div>

            <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.02] text-slate-950 md:text-7xl">
              Move around. <span className="text-brand">Settle in.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
              Foreigners Hub helps students rent the essentials with clarity:
              maintained bikes for getting around and Shared apartments on a budget.
            </p>

            <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
              <Button asChild size="lg">
                <Link href="/bikes">
                  Explore bikes <ArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/apartments">Browse apartments</Link>
              </Button>
            </div>

            <div className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
              {["No hidden fees", "Digital contract", "Maintained fleet"].map((item) => (
                <div
                  key={item}
                  className="premium-card flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  <CheckCircle size={15} className="text-green-DEFAULT" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────── */}
      {/* SERVICES — FULL WIDTH SPLIT                        */}
      {/* ─────────────────────────────────────────────────── */}
      <section className="border-b border-slate-200/70 bg-white py-16 md:py-20">
        <div className="container mx-auto grid grid-cols-1 gap-6 px-4 md:grid-cols-2 md:px-8">
          {/* Bikes */}
          <div className="premium-card flex flex-col rounded-2xl p-8 md:p-10">
            <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-xl bg-green-light">
              <Bike size={24} className="text-green-DEFAULT" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 tracking-tight">
              Bike Rentals
            </h2>
            <p className="text-slate-500 leading-relaxed mb-6 max-w-md">
              Flexible weekly and monthly rentals on serviced bikes. Choose your
              plan, sign digitally, and collect your bike. Repair support is
              included.
            </p>
            <ul className="flex flex-col gap-2 mb-8">
              {["Weekly & monthly plans", "Maintained fleet", "Electronic contract", "Local payment"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle size={14} className="text-green-DEFAULT flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              <Button asChild className="bg-green-DEFAULT hover:bg-green-dark text-white border-0">
                <Link href="/bikes">
                  Explore bikes <ArrowRight size={15} className="ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Apartments */}
          <div className="premium-card flex flex-col rounded-2xl p-8 md:p-10">
            <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-light">
              <Building2 size={24} className="text-orange-DEFAULT" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 tracking-tight">
              Apartment Rentals
            </h2>
            <p className="text-slate-500 leading-relaxed mb-6 max-w-md">
              Furnished apartments for students and young professionals.
              Browse real listings and make contact with us to arrange
              viewings and terms.
            </p>
            <ul className="flex flex-col gap-2 mb-8">
              {["Furnished & move-in ready", "Flexible lease terms", "Student-friendly process", "Real listings"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle size={14} className="text-orange-DEFAULT flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              <Button asChild variant="outline" className="border-orange-DEFAULT text-orange-DEFAULT hover:bg-orange-light">
                <Link href="/apartments">
                  Browse apartments <ArrowRight size={15} className="ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────── */}
      {/* WHY US                                             */}
      {/* ─────────────────────────────────────────────────── */}
      <section id="why-us" className="border-b border-slate-200/70 bg-slate-50/70 py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          {/* Label */}
          <div className="section-eyebrow mb-5">
            Why Foreigners Hub
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              Renting as a foreigner shouldn&apos;t be complicated.
            </h2>
            <p className="text-slate-500 leading-relaxed text-lg pt-2">
              We built Foreigners Hub to take the friction out of student
              rentals. A clear process, real availability, and support when
              you need it.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUsItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="premium-card rounded-2xl p-6 transition-transform duration-200 hover:-translate-y-1"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/8 mb-4">
                    <Icon size={20} className="text-brand" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────── */}
      {/* HOW IT WORKS                                       */}
      {/* ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="border-b border-slate-200/70 bg-white py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="section-eyebrow mb-5">
            The process
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              From browsing to riding — three clear steps.
            </h2>
          </div>

          <div className="premium-card grid grid-cols-1 overflow-hidden rounded-2xl md:grid-cols-3">
            {steps.map((item, i) => (
              <div
                key={item.step}
                className={`flex flex-col gap-4 bg-white/60 p-8 md:p-10 ${
                  i < steps.length - 1 ? "border-b md:border-b-0 md:border-r border-slate-100" : ""
                }`}
              >
                <span className="text-4xl font-black text-slate-100 leading-none tracking-tighter">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900 text-base mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────── */}
      {/* FEATURED BIKES                                     */}
      {/* ─────────────────────────────────────────────────── */}
      <section className="border-b border-slate-200/70 bg-slate-50/70 py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-green-DEFAULT" />
                <span className="text-xs font-semibold text-green-DEFAULT uppercase tracking-widest">
                  Bike Catalogue
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Available now
              </h2>
            </div>
            <Link
              href="/bikes"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark transition-colors"
            >
              View all bikes <ArrowRight size={14} />
            </Link>
          </div>

          {bikes && bikes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bikes.map((bike) => (
                <Link
                  key={bike.id}
                  href={`/bikes/${bike.id}`}
                  className="premium-card group block overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                    {bike.image_url ? (
                      <img
                        src={bike.image_url}
                        alt={bike.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Bike size={40} className="text-slate-300" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-white border border-slate-200 text-xs font-semibold text-green-DEFAULT px-2 py-1 rounded-full">
                      Available
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-xs text-slate-400 font-mono mb-0.5">
                          {bike.b_code}
                        </p>
                        <h3 className="font-bold text-slate-900 text-base leading-tight">
                          {bike.name}
                        </h3>
                      </div>
                    </div>
                    {bike.bike_categories && (
                      <span className="inline-block text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded mb-3">
                        {bike.bike_categories.name}
                      </span>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-sm text-slate-500">
                        From <span className="font-bold text-slate-900">€55</span>
                        <span className="text-xs text-slate-400"> / week</span>
                      </span>
                      <span className="text-xs font-semibold text-brand inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        View details <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl bg-white py-16 text-center">
              <Bike size={36} className="text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-sm">
                No bikes currently available — check back soon.
              </p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/bikes"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand"
            >
              View all bikes <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────── */}
      {/* APARTMENTS                                         */}
      {/* ─────────────────────────────────────────────────── */}
      <section className="border-b border-slate-200/70 bg-white py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-orange-DEFAULT" />
                <span className="text-xs font-semibold text-orange-DEFAULT uppercase tracking-widest">
                  Apartment Listings
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Find your space
              </h2>
            </div>
            <Link
              href="/apartments"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-orange-DEFAULT hover:text-orange-dark transition-colors"
            >
              View all apartments <ArrowRight size={14} />
            </Link>
          </div>

          {apartments && apartments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apartments.map((apt) => (
                <Link
                  key={apt.id}
                  href={`/apartments/${apt.id}`}
                  className="premium-card group block overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                    {apt.image_url ? (
                      <img
                        src={apt.image_url}
                        alt={apt.name || "Apartment"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 size={40} className="text-slate-300" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-white border border-slate-200 text-xs font-semibold text-orange-DEFAULT px-2 py-1 rounded-full">
                      Available
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 text-base leading-tight mb-1">
                      {apt.name || "Apartment"}
                    </h3>
                    {(apt.bedrooms || apt.price_per_month) && (
                      <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                        {apt.bedrooms && <span>{apt.bedrooms} bed</span>}
                        {apt.price_per_month && (
                          <span className="font-bold text-slate-900">
                            €{apt.price_per_month}
                            <span className="font-normal text-xs text-slate-400"> /mo</span>
                          </span>
                        )}
                      </div>
                    )}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-orange-DEFAULT inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        View details <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl bg-slate-50 py-16 text-center">
              <Building2 size={36} className="text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-sm">
                No apartments currently available — check back soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────── */}
      {/* REPAIRS                                            */}
      {/* ─────────────────────────────────────────────────── */}
      <section className="border-b border-slate-200/70 bg-slate-50/70 py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-5">
                <span className="h-px w-8 bg-brand" />
                <span className="text-xs font-bold text-brand uppercase tracking-widest">
                  Bike Services
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-5">
                Repair &amp; maintenance included.
              </h2>
              <p className="text-slate-500 leading-relaxed mb-8 max-w-lg">
                Every rental includes access to our bike service. Need
                something fixed? Our team handles it. Your rental keeps
                running.
              </p>
              <Button asChild>
                <Link href="/bikes">
                  View bikes <ArrowRight size={15} className="ml-1" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {repairServices.map((service) => (
                <div
                  key={service}
                  className="premium-card flex items-center gap-3 rounded-xl px-4 py-3.5"
                >
                  <Wrench size={15} className="text-brand flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-700">
                    {service}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────── */}
      {/* CTA BANNER — BRAND BLUE                            */}
      {/* ─────────────────────────────────────────────────── */}
      <section className="bg-slate-950">
        <div className="container mx-auto px-4 md:px-8 py-20 md:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Ready to get started?
            </h2>
            <p className="text-blue-100 text-lg leading-relaxed mb-9">
              Browse bikes available now and complete your rental entirely
              online — no paperwork, no queues.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-white text-brand hover:bg-blue-50 border-0 font-semibold"
              >
                <Link href="/bikes">
                  Rent a bike <ArrowRight size={16} className="ml-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-blue-300 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/apartments">Browse apartments</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
