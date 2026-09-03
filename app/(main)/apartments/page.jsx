import Link from "next/link";
import { ArrowRight, Building2, BedDouble, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Apartments | Foreigners Hub",
  description:
    "Browse furnished apartments for students and young professionals at Foreigners Hub.",
};

export default async function ApartmentsPage() {
  const supabase = await createClient();

  const { data: apartments } = await supabase
    .from("apartments")
    .select("*, apartment_categories(name)")
    .eq("status", "AVAILABLE")
    .order("created_at", { ascending: false });

  return (
    <div className="bg-slate-50/70">
      {/* ── Page header ──────────────────────────────────── */}
      <div className="border-b border-slate-200/70 bg-white">
        <div className="container mx-auto px-4 py-16 md:px-8 md:py-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <div className="section-eyebrow mb-4 text-orange-DEFAULT">
                Apartment Listings
              </div>
              <h1 className="mb-4 text-4xl font-extrabold leading-tight text-slate-950 md:text-5xl">
                Find your space
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Furnished apartments for students and young professionals.
                Browse real listings and get in touch to arrange a viewing.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
            {["Furnished & move-in ready", "Flexible lease terms", "Student-friendly process", "Real listings"].map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600"
              >
                <CheckCircle size={13} className="text-orange-DEFAULT" />
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Apartment grid ───────────────────────────────── */}
      <div className="min-h-[60vh]">
        <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
          {!apartments || apartments.length === 0 ? (
            <div className="premium-card flex flex-col items-center justify-center rounded-2xl py-24 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 mb-5">
                <Building2 className="text-slate-400" size={26} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No apartments listed yet
              </h3>
              <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
                We don&apos;t currently have any available apartments online.
                Please check back soon or get in touch directly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apartments.map((apt) => (
                <Link
                  key={apt.id}
                  href={`/apartments/${apt.id}`}
                  className="premium-card group flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                    {apt.image_urls && apt.image_urls.length > 0 ? (
                      <img
                        src={apt.image_urls[0]}
                        alt={apt.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 size={48} className="text-slate-300" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="rounded-full border border-orange-DEFAULT/20 bg-white px-2.5 py-1 text-xs font-bold text-orange-DEFAULT shadow-sm">
                        Available
                      </span>
                    </div>
                    {apt.apartment_categories?.name && (
                      <div className="absolute bottom-3 left-3">
                        <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                          {apt.apartment_categories.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-slate-900 text-base leading-tight mb-2">
                      {apt.name || "Apartment"}
                    </h3>
                    {apt.description && (
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
                        {apt.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        {apt.bedrooms && (
                          <span className="flex items-center gap-1">
                            <BedDouble size={14} className="text-slate-400" />
                            {apt.bedrooms} bed{apt.bedrooms > 1 ? "s" : ""}
                          </span>
                        )}
                        {apt.price_per_month && (
                          <span className="font-bold text-slate-900">
                            €{apt.price_per_month}
                            <span className="text-xs font-normal text-slate-400"> /mo</span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-orange-DEFAULT inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        View <ArrowRight size={12} />
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
