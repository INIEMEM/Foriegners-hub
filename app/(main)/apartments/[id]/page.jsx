import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, MapPin, BedDouble, Check, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: apt } = await supabase
    .from("apartments")
    .select("name")
    .eq("id", id)
    .single();

  if (!apt) return { title: "Apartment Not Found" };

  return {
    title: `${apt.name} | Foreigners Hub`,
  };
}

export default async function ApartmentDetailsPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: apt, error } = await supabase
    .from("apartments")
    .select(`
      *,
      apartment_categories (
        name
      )
    `)
    .eq("id", id)
    .single();

  if (error || !apt) {
    notFound();
  }

  // Parse JSONB data if needed, or assume it's directly accessible
  const amenities = Array.isArray(apt.amenities) ? apt.amenities : [];
  const priceInfo = apt.price_info || null;

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* ── Breadcrumb ── */}
      <div className="container mx-auto px-4 md:px-6 py-6">
        <Link
          href="/apartments"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-950"
        >
          <ArrowLeft size={16} />
          Back to all apartments
        </Link>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        
        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="rounded-full border border-orange-100 bg-orange-light px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-dark">
              {apt.status === 'AVAILABLE' ? 'Available' : apt.status}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-500">
              {apt.apartment_categories?.name || "Apartment"}
            </span>
          </div>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight text-slate-950 md:text-5xl">
            {apt.name}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-1.5">
              <MapPin size={16} className="text-slate-400" />
              <span>{apt.location || "Location on request"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BedDouble size={16} className="text-slate-400" />
              <span>{apt.bedrooms ? `${apt.bedrooms} Bedroom${apt.bedrooms > 1 ? 's' : ''}` : 'Studio Layout'}</span>
            </div>
          </div>
        </div>

        {/* ── Gallery Grid (placeholder if no images) ── */}
        <div className="mb-10 grid h-[300px] grid-cols-1 gap-4 md:h-[450px] md:grid-cols-3">
          <div className="premium-card relative flex items-center justify-center overflow-hidden rounded-2xl bg-slate-200 md:col-span-2">
            {apt.image_urls && apt.image_urls.length > 0 ? (
              <img src={apt.image_urls[0]} alt="Primary" className="w-full h-full object-cover" />
            ) : (
              <Building2 size={64} className="text-slate-400" />
            )}
          </div>
          <div className="hidden md:flex flex-col gap-4 h-full">
            <div className="premium-card relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl bg-slate-200">
              {apt.image_urls && apt.image_urls.length > 1 ? (
                <img src={apt.image_urls[1]} alt="Secondary" className="w-full h-full object-cover" />
              ) : (
                <Building2 size={32} className="text-slate-400" />
              )}
            </div>
            <div className="premium-card relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl bg-slate-200">
              {apt.image_urls && apt.image_urls.length > 2 ? (
                <img src={apt.image_urls[2]} alt="Tertiary" className="w-full h-full object-cover" />
              ) : (
                <Building2 size={32} className="text-slate-400" />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* ── Main Content ── */}
          <div className="lg:col-span-2">
            <div className="premium-card mb-6 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">About this apartment</h2>
              <div className="prose prose-slate prose-sm md:prose-base max-w-none">
                {apt.description ? (
                  <p className="whitespace-pre-wrap">{apt.description}</p>
                ) : (
                  <p>A beautiful, fully furnished apartment situated in a convenient location for students. It comes with everything you need to settle in comfortably.</p>
                )}
              </div>
            </div>

            {/* Amenities */}
            <div className="premium-card rounded-2xl p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Amenities</h2>
              {amenities.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {amenities.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 text-sm">
                      <Check size={16} className="text-orange-DEFAULT" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Info size={16} />
                  <span>Amenities list will be provided upon inquiry.</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar (Pricing & Action) ── */}
          <div className="lg:col-span-1">
            <div className="premium-card sticky top-24 rounded-2xl p-6">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">Rental Price</h3>
                {priceInfo && priceInfo.monthly ? (
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold text-slate-900">€{priceInfo.monthly}</span>
                    <span className="text-slate-500 mb-1">/month</span>
                  </div>
                ) : (
                  <span className="text-lg font-medium text-slate-700">Price on request</span>
                )}
              </div>

              <hr className="border-slate-100 mb-6" />

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5"><Check size={16} className="text-orange-DEFAULT" /></div>
                  <p className="text-sm text-slate-600">Student-friendly leasing terms</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5"><Check size={16} className="text-orange-DEFAULT" /></div>
                  <p className="text-sm text-slate-600">No hidden agency fees</p>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white border-0"
                disabled={apt.status !== 'AVAILABLE'}
              >
                {apt.status === 'AVAILABLE' ? 'Inquire about availability' : 'Currently Unavailable'}
              </Button>
              
              <p className="text-xs text-center text-slate-500 mt-4">
                You won&apos;t be charged yet. Our team will contact you to arrange a viewing and discuss terms.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
