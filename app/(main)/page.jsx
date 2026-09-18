import Link from "next/link";
import { ArrowUpRight, ShieldCheck, MapPin, Headphones, Check, Bike, Tag, Key, Clock, Users, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import AnimatedText from "@/components/ui/AnimatedText";
import ScrollReveal from "@/components/ui/ScrollReveal";
import CountUp from "@/components/ui/CountUp";
import HeroVideoCarousel from "@/components/ui/HeroVideoCarousel";
import { HomePlayfulDecorations } from "@/components/ui/PlayfulDecorations";

export const metadata = {
  title: "Foreigners Hub — Student Bike & Apartment Rentals",
  description: "Simple, transparent bike and apartment rentals for students. Browse bikes, find apartments, and get moving.",
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: apartments } = await supabase.from("apartments").select("*").eq("status", "AVAILABLE").order("created_at", { ascending: false }).limit(3);

  return (
    <div className="fh-shell" suppressHydrationWarning>
      {/* ─────────────────────────────────────────────────── */}
      {/* HERO SECTION                                         */}
      {/* ─────────────────────────────────────────────────── */}
      <section className="fh-hero fh-grid-paper" id="top">
        <div className="fh-container">
          <div className="fh-hero-grid">
            <ScrollReveal className="fh-hero-copy" delay={0}>
              <div className="fh-kicker">
                {/* <span className="fh-kicker-dot" /> */}
                # Trusted by Foreigners in Lithuania
              </div>
              <h1 className="fh-display">
                One Hub. Everything You Need to <AnimatedText />
              </h1>
              <p className="fh-hero-lead">
                Find a room that fits your budget, or rent an e-bike for courier work. And if you need both, we’ve got you covered
              </p>
              <div className="fh-hero-actions">
                <Link href="/bikes" className="fh-primary-btn">
                  Rent E-Bike <ArrowUpRight size={16} />
                </Link>
                <Link href="/apartments" className="fh-ghost-btn">
                  Rent Apartment <ArrowUpRight size={16} />
                </Link>
              </div>
              <div className="fh-hero-note">
                <ShieldCheck size={15} />
                Real Support, Verified Listings, Simple Process.
              </div>
            </ScrollReveal>

            <ScrollReveal className="fh-hero-visual" delay={1}>
              <HeroVideoCarousel />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────── */}
      {/* PROOF STRIP                                        */}
      {/* ─────────────────────────────────────────────────── */}
      <section className="fh-proof-strip">
        <div className="fh-container fh-proof-inner">
          <ScrollReveal className="fh-proof-item" delay={0}>
            <Clock size={22} />
            <div>
              <strong>24/7 Support</strong>
              <span>We're Here Whenever you Need us</span>
            </div>
          </ScrollReveal>
          <ScrollReveal className="fh-proof-item" delay={1}>
            <Users size={22} />
            <div>
              <strong><CountUp target={500} />+ Clients</strong>
              <span>Successfully Accommodated</span>
            </div>
          </ScrollReveal>
          <ScrollReveal className="fh-proof-item" delay={2}>
            <Bike size={22} />
            <div>
              <strong>150+ Bikes Rented</strong>
              <span>Maintained &amp; Ready to Ride</span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────── */}
      {/* TWO ESSENTIALS                                     */}
      {/* ─────────────────────────────────────────────────── */}
      <section className="fh-page-section relative overflow-hidden" id="services" style={{ background: "var(--fh-off-white)" }}>
        <HomePlayfulDecorations />
        <div className="fh-page-width relative z-10">
          <ScrollReveal className="fh-services-intro" delay={0}>
            <div>
              <div className="fh-section-kicker">
                <span className="fh-kicker-pill" /> Bikes and apartments
              </div>
              <h2>
                Set up your stay. <br />
                <span>Move around easily.</span>
              </h2>
            </div>
            <p>
              Foreigners Hub helps students get the basics sorted before and after arrival: a safe place to live and a reliable bike for everyday movement.
            </p>
          </ScrollReveal>

          <div className="fh-services-layout">
            <ScrollReveal className="fh-service-card fh-bike-card" delay={0}>
              <div className="fh-service-card-top">
                <div className="fh-service-label fh-service-label-green">
                  <span className="fh-kicker-pill" /> Mobility
                </div>
                <Link href="/bikes" className="fh-circle-arrow fh-circle-arrow-light">
                  <ArrowUpRight size={18} />
                </Link>
              </div>
              <div className="fh-service-card-copy">
                <h3>
                  Electronic <br />
                  <span>bikes.</span>
                </h3>
                <p>Maintained, secure, and ready to ride. Flexible plans tailored for student terms.</p>
                <div className="fh-service-facts" aria-label="Bike rental highlights">
                  <span>From €45 / week</span>
                  <span>€170 / month</span>
                  <span>Repairs included</span>
                </div>
              </div>
              <div className="fh-service-image fh-bike-image">
                <img src="/images/engwe-m20.jpg" alt="Electronic bike" />
              </div>
              <div className="fh-service-card-bottom">
                <span>
                  Bike rental
                </span>
                <Link href="/bikes" className="fh-inline-arrow">
                  See full plans <ArrowUpRight size={14} />
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal className="fh-service-card fh-apartment-card" delay={1}>
              <div className="fh-service-card-top">
                <div className="fh-service-label fh-service-label-orange">
                  <span className="fh-kicker-pill" /> Housing
                </div>
                <Link href="/apartments" className="fh-circle-arrow">
                  <ArrowUpRight size={18} />
                </Link>
              </div>
              <div className="fh-service-card-copy">
                <h3>
                  Student <br />
                  <span>housing.</span>
                </h3>
                <p>Verified private rooms and shared flats across Vilnius. Move-in ready with flexible semester leases.</p>
                <div className="fh-service-facts fh-service-facts-light" aria-label="Apartment rental highlights">
                  <span>From €200 / month</span>
                  <span>Furnished rooms</span>
                  <span>Flexible leases</span>
                </div>
              </div>
              <div className="fh-service-image fh-apartment-image">
                {apartments?.[0]?.image_urls?.[0] ? (
                  <img src={apartments[0].image_urls[0]} alt="Student apartment in Vilnius" />
                ) : (
                  <div className="fh-apartment-placeholder">
                    <div className="fh-apartment-badge">
                      <Building2 size={16} />
                      <span>Furnished Student Flats</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="fh-service-card-bottom">
                <span>
                  Apartment rental
                </span>
                <Link href="/apartments" className="fh-inline-arrow">
                  View listings <ArrowUpRight size={14} />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────── */}
      {/* JOURNEY LINE                                       */}
      {/* ─────────────────────────────────────────────────── */}
      <div className="fh-journey-wrap">
        <ScrollReveal className="fh-container" delay={0}>
          <div className="fh-journey-line">
            <div className="fh-journey-node active">
              <span>01</span>
              <small>Apply</small>
            </div>
            <div className="fh-journey-node">
              <span>02</span>
              <small>Visit</small>
            </div>
            <div className="fh-journey-node">
              <span>03</span>
              <small>Register</small>
            </div>
            <div className="fh-journey-node">
              <span>04</span>
              <small>Track</small>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* ─────────────────────────────────────────────────── */}
      {/* PROCESS                                            */}
      {/* ─────────────────────────────────────────────────── */}
      <section className="fh-process-section" id="process">
        <div className="fh-container">
          <div className="fh-process-grid">
            <ScrollReveal className="fh-process-intro" delay={0}>
              <div className="fh-label">How it works</div>
              <h2>
                Simple process. <br />
                <em>No friction.</em>
              </h2>
              <p>
                Choose what you need, complete the agreement online, and arrive with your transport and housing plan already clear.
              </p>
              <div className="fh-process-links-wrap fh-process-desktop-actions">
                <Link href="/bikes" className="fh-process-link">
                  View bikes <ArrowUpRight size={14} />
                </Link>
                <Link href="/apartments" className="fh-process-link">
                  Browse apartments <ArrowUpRight size={14} />
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal className="fh-process-list" delay={1}>
              <div className="fh-process-step">
                <div className="fh-step-marker">
                  <Check size={12} />
                </div>
                <div className="fh-step-no">01</div>
                <div>
                  <h3>Apply</h3>
                  <p>Send a request for a room or e-bike and we’ll confirm availability and what to do next.</p>
                </div>
              </div>
              <div className="fh-process-step">
                <div className="fh-step-marker">
                  <Check size={12} />
                </div>
                <div className="fh-step-no">02</div>
                <div>
                  <h3>Visit</h3>
                  <p>Choose a convenient time to tour the room or pick up your e-bike.</p>
                </div>
              </div>
              <div className="fh-process-step">
                <div className="fh-step-marker">
                  <Check size={12} />
                </div>
                <div className="fh-step-no">03</div>
                <div>
                  <h3>Register</h3>
                  <p>Sign your rental agreement, make your payment and create your Hub account.</p>
                </div>
              </div>
              <div className="fh-process-step">
                <div className="fh-step-marker">
                  <Check size={12} />
                </div>
                <div className="fh-step-no">04</div>
                <div>
                  <h3>Track</h3>
                  <p>Manage your rental, view payments and receive reminders and important updates in your account.</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────── */}
      {/* VALUES                                             */}
      {/* ─────────────────────────────────────────────────── */}
      <section className="fh-values" id="why-us">
        <div className="fh-container">
          <div className="fh-values-layout">
            <ScrollReveal delay={0}>
              <div className="fh-label">Why us</div>
              <h2>
                Renting, <br />
                <em>rethought.</em>
              </h2>
            </ScrollReveal>

            <ScrollReveal className="fh-values-list" delay={1}>
              <div className="fh-value">
                <div className="fh-value-icon">
                  <Tag size={16} />
                </div>
                <h3>No Hidden Fees</h3>
                <p>Clear rental prices and transparent costs, with no unexpected charges.</p>
              </div>
              <div className="fh-value">
                <div className="fh-value-icon">
                  <Key size={16} />
                </div>
                <h3>Simple Process</h3>
                <p>Request what you need, visit, sign your agreement, pay, and you’re ready to go.</p>
              </div>
              <div className="fh-value">
                <div className="fh-value-icon">
                  <ShieldCheck size={16} />
                </div>
                <h3>Reliable Service</h3>
                <p>Clean shared rooms and well-maintained e-bikes, ready when you need them.</p>
              </div>
              <div className="fh-value">
                <div className="fh-value-icon">
                  <Headphones size={16} />
                </div>
                <h3>Local Support</h3>
                <p>Need help? Our Vilnius team is available on WhatsApp whenever you need us.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────── */}
      {/* CTA BANNER                                         */}
      {/* ─────────────────────────────────────────────────── */}
      <section className="fh-cta">
        <div className="fh-container">
          <div className="fh-cta-inner">
            <ScrollReveal delay={0}>
              <div className="fh-label" style={{ color: "#b7ffcf" }}>
                Get Started
              </div>
              <h2>
                Ready to <br />
                <em>settle in?</em>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={1}>
              <p className="fh-cta-copy">
                Get your bike and student apartment sorted before you land in Vilnius. Transparent pricing, digital contracts, and zero hassle.
              </p>
              <div className="fh-cta-actions">
                <Link href="/bikes" className="fh-primary-btn">
                  Rent a bike <ArrowUpRight size={15} />
                </Link>
                <Link href="/apartments" className="fh-ghost-btn">
                  Browse apartments
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
