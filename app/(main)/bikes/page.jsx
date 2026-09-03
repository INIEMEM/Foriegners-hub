import Link from "next/link";
import { ArrowRight, Bike, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Bikes for Rent | Foreigners Hub",
  description:
    "Browse available bikes for rent at Foreigners Hub. Weekly and monthly plans on maintained bikes.",
};

const pricingTeaser = [
  { label: "1 Week", price: "€55" },
  { label: "2 Weeks", price: "€110" },
  { label: "1 Month", price: "€170" },
];

export default async function BikesPage() {
  const supabase = await createClient();

  const { data: bikes } = await supabase
    .from("bikes")
    .select("*, bike_categories(name)")
    .eq("status", "AVAILABLE")
    .order("created_at", { ascending: false });

  return (
    <div className="bg-slate-50/70">
      {/* ── Page header ──────────────────────────────────── */}
      <div className="border-b border-slate-200/70 bg-white">
        <div className="container mx-auto px-4 py-16 md:px-8 md:py-20">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="section-eyebrow mb-4 text-green-DEFAULT">
                Bike Rentals
              </div>
              <h1 className="mb-4 text-4xl font-extrabold leading-tight text-slate-950 md:text-5xl">
                Available bikes
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Fully serviced bikes ready for immediate rental. Choose your
                plan, sign digitally, and you&apos;re ready to go.
              </p>
            </div>

            {/* Pricing teaser */}
            <div className="flex items-center gap-3 flex-wrap">
              {pricingTeaser.map((p) => (
                <div
                  key={p.label}
                  className="premium-card min-w-[92px] rounded-xl px-4 py-3 text-center"
                >
                  <p className="text-xs text-slate-400 mb-0.5">{p.label}</p>
                  <p className="text-base font-bold text-slate-900">{p.price}</p>
                </div>
              ))}
              <div className="premium-card min-w-[92px] rounded-xl px-4 py-3 text-center">
                <p className="text-xs text-slate-400 mb-0.5">Deposit</p>
                <p className="text-base font-bold text-slate-900">€50</p>
              </div>
            </div>
          </div>

          {/* Included */}
          <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
            {["Maintained fleet", "Free accessories", "Repair support", "Electronic contract"].map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600"
              >
                <CheckCircle size={13} className="text-green-DEFAULT" />
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bike grid ────────────────────────────────────── */}
      <div className="min-h-[60vh]">
        <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
          {!bikes || bikes.length === 0 ? (
            <div className="premium-card flex flex-col items-center justify-center rounded-2xl py-24 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 mb-5">
                <Bike className="text-slate-400" size={26} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No bikes available right now
              </h3>
              <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
                We don&apos;t currently have any available bikes. Please check
                back soon or get in touch.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bikes.map((bike) => (
                <Link
                  key={bike.id}
                  href={`/bikes/${bike.id}`}
                  className="premium-card group flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                    {bike.image_url ? (
                      <img
                        src={bike.image_url}
                        alt={bike.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Bike size={48} className="text-slate-300" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="rounded-full border border-green-DEFAULT/20 bg-white px-2.5 py-1 text-xs font-bold text-green-DEFAULT shadow-sm">
                        Available
                      </span>
                    </div>
                    {bike.bike_categories?.name && (
                      <div className="absolute bottom-3 left-3">
                        <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                          {bike.bike_categories.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-xs text-slate-400 font-mono mb-1">
                      {bike.b_code}
                    </p>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2">
                      {bike.name}
                    </h3>
                    {bike.description && (
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
                        {bike.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                      <div>
                        <span className="text-xs text-slate-400">From </span>
                        <span className="font-bold text-slate-900">€55</span>
                        <span className="text-xs text-slate-400"> / week</span>
                      </div>
                      <span className="text-xs font-semibold text-green-DEFAULT inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        Rent this bike <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
