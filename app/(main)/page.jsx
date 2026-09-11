import Link from "next/link";
import { ArrowUpRight, ShieldCheck, MapPin, Headphones, Check, Bike, Lock, Repeat, Tag, Wrench, Shield, Key, Clock, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import AnimatedText from "@/components/ui/AnimatedText";
import ScrollReveal from "@/components/ui/ScrollReveal";
import CountUp from "@/components/ui/CountUp";
import { HomePlayfulDecorations } from "@/components/ui/PlayfulDecorations";

export const metadata = {
  title: "Foreigners Hub — Student Bike & Apartment Rentals",
  description: "Simple, transparent bike and apartment rentals for students. Browse bikes, find apartments, and get moving.",
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: bikes } = await supabase.from("bikes").select("*, bike_categories(name)").eq("status", "AVAILABLE").order("created_at", { ascending: false }).limit(3);
  const { data: apartments } = await supabase.from("apartments").select("*").eq("status", "AVAILABLE").order("created_at", { ascending: false }).limit(3);

  return (
    <div className="fh-shell" suppressHydrationWarning>
      {/* ─────────────────────────────────────────────────── */}
      {/* HERO SECTION (New Manus Design)                     */}
      {/* ─────────────────────────────────────────────────── */}
      <section className="fh-hero" id="top">
        <div className="fh-container">
          <div className="fh-hero-grid">
            <ScrollReveal className="fh-hero-copy" delay={0}>
              <div className="fh-kicker">
                <span className="fh-kicker-dot" />
                City Essentials
              </div>
              <h1 className="fh-display">
                The basics of a new city, <AnimatedText />
              </h1>
              <p className="fh-hero-lead">
                Your new life in Vilnius starts here.<br />
                Affordable rooms. Reliable bikes. Zero hassle.
              </p>
              <div className="fh-hero-actions">
                <Link href="/bikes" className="fh-primary-btn">
                  Rent a bike <ArrowUpRight size={16} />
                </Link>
                <Link href="/#process" className="fh-ghost-btn">
                  See how it works
                </Link>
              </div>
              <div className="fh-hero-note">
                <ShieldCheck size={16} />
                Real support, real listings, no bureaucratic maze.
              </div>
            </ScrollReveal>

            <ScrollReveal className="fh-hero-visual" delay={1}>
              <div className="fh-hero-image-wrap">
                <video src="/hero-video.mp4" autoPlay muted loop playsInline />
              </div>
              <div className="fh-hero-tag">built for newcomers</div>
              <div className="fh-hero-sticker">
                <span>
                  <Bike size={15} />
                </span>
                <div>
                  <strong>Move around.</strong>
                  <br />
                  Settle in.
                </div>
              </div>
              <div className="fh-hero-route" aria-hidden="true" />
            </ScrollReveal>
          </div>
        </div>
        <svg className="fh-hero-wave" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 62 C180 18 350 12 540 48 C760 90 980 88 1160 38 C1280 5 1360 12 1440 29 L1440 100 L0 100 Z" />
        </svg>
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
              <span>We're here whenever you need us</span>
            </div>
          </ScrollReveal>
          <ScrollReveal className="fh-proof-item" delay={1}>
            <Users size={22} />
            <div>
              <strong><CountUp target={500} />+ clients</strong>
              <span>Successfully accommodated</span>
            </div>
          </ScrollReveal>
          <ScrollReveal className="fh-proof-item" delay={2}>
            <Bike size={22} />
            <div>
              <strong>150 bikes rented</strong>
              <span>Maintained &amp; ready to ride</span>
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
                <span className="fh-kicker-pill" /> The essentials
              </div>
              <h2>
                What you need. <br />
                <span>Nothing you don't.</span>
              </h2>
            </div>
            <p>
              We focus on the two things that matter most when you arrive: a reliable way to get to class, and a trustworthy place to live.
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
                  City <br />
                  <span>bikes.</span>
                </h3>
                <p>Maintained, secure, and ready to ride. Flexible plans tailored for student terms.</p>
              </div>
              <div className="fh-service-image fh-bike-image">
                <img src="/images/engwe-m20.jpg" alt="Student bike" />
              </div>
              <div className="fh-service-card-bottom">
                <span>
                  From <strong>€45</strong> / 1 week
                </span>
                <Link href="/bikes" className="fh-inline-arrow">
                  View plans <ArrowUpRight size={14} />
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
                <p>Verified shared apartments with clear terms and local support.</p>
              </div>
              <div className="fh-service-image fh-apartment-image">
                <div style={{ width: "100%", height: "100%", background: "#eac097" }} />
              </div>
              <div className="fh-service-card-bottom">
                <span>Flexible lease terms</span>
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
              <small>Arrive</small>
            </div>
            <div className="fh-journey-node">
              <span>02</span>
              <small>Choose</small>
            </div>
            <div className="fh-journey-node">
              <span>03</span>
              <small>Move</small>
            </div>
            <div className="fh-journey-node">
              <span>04</span>
              <small>Settle</small>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* ─────────────────────────────────────────────────── */}
      {/* PRICING                                            */}
      {/* ─────────────────────────────────────────────────── */}
      <section className="fh-pricing-section" id="pricing">
        <div className="fh-container">
          <ScrollReveal className="fh-pricing-top" delay={0}>
            <div>
              <h2>
                Choose a plan. We'll <br />
                keep you <em>moving.</em>
              </h2>
            </div>
            {/* <div>
              <p>Pick your rhythm. Every plan includes a maintained bike, transparent pricing, and no separate repair bill.</p>
              <div className="fh-pricing-switcher">
                <button className="fh-plan-toggle active">City bike</button>
                <button className="fh-plan-toggle">E-bike soon</button>
              </div>
            </div> */}
          </ScrollReveal>

          <div className="fh-price-cards">
            <ScrollReveal className="fh-price-card-full" delay={1}>
              <div className="fh-price-duration-label">DURATION</div>
              <div className="fh-price-duration-value">1 week</div>
              <div className="fh-price-amount">
                <span className="fh-price-euro">€45</span>
                <span className="fh-price-total-label">total rental</span>
              </div>
              <p className="fh-price-note">Ideal for arrivals, flat-hunting, and quick city orientation.</p>
              <ul className="fh-price-features">
                <li><Check size={14} /> Maintained city bike with gears</li>
                <li><Check size={14} /> Heavy duty lock &amp; safety lights</li>
                <li><Check size={14} /> €50 refundable deposit</li>
                <li><Check size={14} /> Extend rental anytime</li>
              </ul>
              <Link href="/rent" className="fh-select-plan-btn">
                Select 1-week plan
              </Link>
            </ScrollReveal>

            <ScrollReveal className="fh-price-card-full featured" delay={2}>
              <div className="fh-best-value">BEST VALUE</div>
              <div className="fh-price-duration-label">DURATION</div>
              <div className="fh-price-duration-value">1 month</div>
              <div className="fh-price-amount">
                <span className="fh-price-euro">€170</span>
                <span className="fh-price-total-label">total rental</span>
              </div>
              <p className="fh-price-note">Most popular among exchange students &amp; first-term stays.</p>
              <ul className="fh-price-features">
                <li><Check size={14} /> Free priority repairs &amp; maintenance</li>
                <li><Check size={14} /> Premium lock, basket, and LED lights</li>
                <li><Check size={14} /> Free bike swap if needed</li>
                <li><Check size={14} /> Student perk discount applied</li>
              </ul>
              <Link href="/rent" className="fh-select-plan-btn">
                Select 1-month plan
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

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
              <p>Everything is handled online. No need to visit an office just to sign a paper. Arrive, tap, ride.</p>
              <Link href="/bikes" className="fh-process-link">
                View available bikes <ArrowUpRight size={14} />
              </Link>
            </ScrollReveal>

            <ScrollReveal className="fh-process-list" delay={1}>
              <div className="fh-process-step">
                <div className="fh-step-marker">
                  <Check size={12} />
                </div>
                <div className="fh-step-no">01</div>
                <div>
                  <h3>Pick your plan</h3>
                  <p>Choose the duration that fits your stay. Weekly for quick visits, monthly for full semesters.</p>
                </div>
              </div>
              <div className="fh-process-step">
                <div className="fh-step-marker">
                  <Check size={12} />
                </div>
                <div className="fh-step-no">02</div>
                <div>
                  <h3>Sign &amp; pay digitally</h3>
                  <p>Complete the contract on your phone. Pay securely. We verify everything on our end.</p>
                </div>
              </div>
              <div className="fh-process-step">
                <div className="fh-step-marker">
                  <Check size={12} />
                </div>
                <div className="fh-step-no">03</div>
                <div>
                  <h3>Unlock &amp; ride</h3>
                  <p>Get your bike details and pick-up instructions. You're ready to explore the city.</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────── */}
      {/* VALUES                                             */}
      {/* ─────────────────────────────────────────────────── */}
      <section className="fh-values">
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
                <h3>No hidden fees</h3>
                <p>Clear pricing upfront. No surprise charges when you return the bike or sign the lease.</p>
              </div>
              <div className="fh-value">
                <div className="fh-value-icon">
                  <Key size={16} />
                </div>
                <h3>Digital contracts</h3>
                <p>Everything is signed electronically. You always have access to your rental documents.</p>
              </div>
              <div className="fh-value">
                <div className="fh-value-icon">
                  <Wrench size={16} />
                </div>
                <h3>Maintained fleet</h3>
                <p>Every bike is checked before it goes out. Free repairs on monthly plans.</p>
              </div>
              <div className="fh-value">
                <div className="fh-value-icon">
                  <Headphones size={16} />
                </div>
                <h3>Human support</h3>
                <p>Real help when you need it. Fast responses to get you back on track.</p>
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
                Browse bikes available now and complete your rental entirely online — no paperwork, no queues.
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
