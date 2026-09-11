import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Bike,
  Building2,
  Check,
  CircleCheck,
  FileSignature,
  Headphones,
  LockKeyhole,
  MapPin,
  Menu,
  MoveRight,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";

const assets = {
  mark: "/manus-storage/foreigners-hub-mark_f2c991cf.png",
  hero: "/manus-storage/foreigners-hub-hero_0578f4b6.png",
  bike: "/manus-storage/foreigners-hub-bike_bdc65882.png",
  apartment: "/manus-storage/foreigners-hub-apartment_a8ce01a5.png",
};

const plans = [
  { label: "1 week", price: 55 },
  { label: "2 weeks", price: 110 },
  { label: "3 weeks", price: 150 },
  { label: "1 month", price: 170, popular: true },
  { label: "2 months", price: 340 },
  { label: "3 months", price: 450 },
];

const processSteps = [
  {
    number: "01",
    title: "Browse & choose",
    copy: "See real availability, pricing, and the details that matter before you commit.",
    icon: MapPin,
  },
  {
    number: "02",
    title: "Sign digitally",
    copy: "Complete your details and sign your rental agreement online. No paperwork, no queue.",
    icon: FileSignature,
  },
  {
    number: "03",
    title: "Pay locally",
    copy: "Transfer payment to Foreigners Hub. We verify it, activate your rental, and keep you moving.",
    icon: Banknote,
  },
];

const values = [
  { title: "No hidden fees", copy: "What you see is what you pay. Clear plans, clear deposits, clear next steps.", icon: ShieldCheck },
  { title: "Digital contracts", copy: "Get signed, stored, and sorted without printing a single page.", icon: FileSignature },
  { title: "Maintained fleet", copy: "Brake pads, tires, chains — maintenance is included with your rental.", icon: Wrench },
  { title: "Human support", copy: "When something comes up, a real person is ready to help you solve it.", icon: Headphones },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [selectedPlan, setSelectedPlan] = useState("1 month");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [email, setEmail] = useState("");

  function handleWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      toast.error("Drop in your email first — we’ll keep it simple.");
      return;
    }
    toast.success("You’re on the list. We’ll be in touch soon.");
    setEmail("");
  }

  return (
    <main className="fh-shell">
      <header className="fh-nav">
        <div className="fh-container fh-nav-inner">
          <a className="fh-brand" href="#top" aria-label="Foreigners Hub home">
            <img src={assets.mark} alt="" />
            <span className="fh-wordmark">Foreigners Hub<small>city essentials</small></span>
          </a>
          <nav className="fh-nav-links" aria-label="Main navigation">
            <a href="#services">What’s available</a>
            <a href="#pricing">Bike plans</a>
            <a href="#process">How it works</a>
          </nav>
          <button className="fh-nav-cta" type="button" onClick={() => (window.location.href = "/login")}>
            Join the waitlist <ArrowUpRight size={15} />
          </button>
          <button className="fh-menu-btn" type="button" aria-label={mobileOpen ? "Close menu" : "Open menu"} onClick={() => setMobileOpen((open) => !open)}>
            {mobileOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
          {mobileOpen && (
            <div className="absolute right-4 top-[66px] z-50 flex w-[calc(100%-32px)] flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:hidden">
              <a className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50" href="#services" onClick={() => setMobileOpen(false)}>What’s available</a>
              <a className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50" href="#pricing" onClick={() => setMobileOpen(false)}>Bike plans</a>
              <a className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50" href="#process" onClick={() => setMobileOpen(false)}>How it works</a>
              <button className="fh-primary-btn mt-1 w-full" type="button" onClick={() => { setMobileOpen(false); window.location.href = "/login"; }}>Sign in to your hub <ArrowRight size={15} /></button>
            </div>
          )}
        </div>
      </header>

      <section id="top" className="fh-hero fh-grid-paper">
        <div className="fh-container fh-hero-grid">
          <div className="fh-hero-copy fh-fade-in">
            <div className="fh-kicker"><span className="fh-kicker-dot" /> For your first days in a new city</div>
            <h1 className="fh-display">The basics of a new city, <em>sorted.</em></h1>
            <p className="fh-hero-lead">Bikes to get around. Apartments to settle into. One student-friendly place to find what you need next.</p>
            <div className="fh-hero-actions">
              <a className="fh-primary-btn" href="/bikes/city-bike">Explore what’s available <ArrowRight size={16} /></a>
              <button className="fh-ghost-btn" type="button" onClick={() => scrollToId("process")}>See how it works <MoveRight size={16} /></button>
            </div>
            <div className="fh-hero-note"><CircleCheck size={16} /> Real support, real listings, no bureaucratic maze.</div>
          </div>
          <div className="fh-hero-visual fh-fade-in fh-delay-2" aria-label="A young renter with a bicycle in a city">
            <div className="fh-hero-image-wrap"><img src={assets.hero} alt="Young adult with a bicycle in a sunny city street" /></div><img className="fh-mark-watermark" src={assets.mark} alt="" aria-hidden="true" />
            <div className="fh-hero-tag">built for newcomers</div>
            <div className="fh-hero-sticker"><span><Bike size={15} /></span><div><strong>Move around.</strong><br />Settle in.</div></div>
            <div className="fh-hero-route" aria-hidden="true" />
          </div>
        </div>
        <svg className="fh-hero-wave" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 62 C180 18 350 12 540 48 C760 90 980 88 1160 38 C1280 5 1360 12 1440 29 L1440 100 L0 100 Z" /></svg>
      </section>

      <section className="fh-proof-strip" aria-label="Foreigners Hub highlights">
        <div className="fh-container fh-proof-inner">
          <div className="fh-proof-item"><ShieldCheck size={19} /><div><strong>Trust, made practical</strong><span>Clear listings and real contracts</span></div></div>
          <div className="fh-proof-item"><LockKeyhole size={19} /><div><strong>100% online process</strong><span>Browse, sign, and activate remotely</span></div></div>
          <div className="fh-proof-item"><Headphones size={19} /><div><strong>Human when it counts</strong><span>Fast support from actual people</span></div></div>
        </div>
      </section>

      <section id="services" className="fh-section">
        <div className="fh-container">
          <div className="fh-section-head">
            <div><div className="fh-label">Two essentials / one place</div><h2 className="fh-display">Start with what makes a new city <em>feel yours.</em></h2></div>
            <p>We’re building the reliable shortcut newcomers wish they had on day one — without the fine-print fog.</p>
          </div>
          <div className="fh-service-grid">
            <article className="fh-service-card bike">
              <div className="fh-service-top"><div className="fh-service-icon"><Bike size={24} /></div><span className="fh-service-number">01 / LIVE NOW</span></div>
              <h3 className="fh-display">Bike rentals</h3>
              <p>Maintained city bikes and e-bikes on plans that match your semester, your work placement, or your first few weeks.</p>
              <ul className="fh-service-list">
                <li><Check size={15} /> Weekly and monthly plans from €55</li>
                <li><Check size={15} /> Repairs and maintenance included</li>
                <li><Check size={15} /> €50 refundable deposit on new rentals</li>
              </ul>
              <div className="fh-service-image"><img src={assets.bike} alt="City bicycle outside a modern apartment" /></div>
              <div className="fh-service-footer"><span className="fh-status-pill">Ready to roll</span><a className="fh-service-link" href="/bikes/city-bike">See bike plans <ArrowRight size={14} /></a></div>
            </article>
            <article className="fh-service-card home">
              <div className="fh-service-top"><div className="fh-service-icon"><Building2 size={24} /></div><span className="fh-service-number">02 / COMING SOON</span></div>
              <h3 className="fh-display">Apartment rentals</h3>
              <p>Furnished, move-in-ready spaces for students and young professionals — with a process that respects your time.</p>
              <ul className="fh-service-list">
                <li><Check size={15} /> Real listings and flexible lease terms</li>
                <li><Check size={15} /> Browse first, then arrange a viewing</li>
                <li><Check size={15} /> Student-friendly support from start to keys</li>
              </ul>
              <div className="fh-service-image"><img src={assets.apartment} alt="Warm furnished student apartment" /></div>
              <div className="fh-service-footer"><span className="fh-status-pill orange">In the works</span><button className="fh-service-link" type="button" onClick={() => scrollToId("get-started")}>Get updates <ArrowRight size={14} /></button></div>
            </article>
          </div>
        </div>
      </section>

      <div className="fh-journey-wrap" aria-label="Your Foreigners Hub journey">
        <div className="fh-container fh-journey-line">
          <div className="fh-journey-node active"><span>01</span><small>arrive</small></div>
          <div className="fh-journey-node active"><span>02</span><small>choose</small></div>
          <div className="fh-journey-node"><span>03</span><small>move</small></div>
          <div className="fh-journey-node"><span>04</span><small>settle</small></div>
        </div>
      </div>

      <section id="pricing" className="fh-section fh-pricing-section">
        <div className="fh-container">
          <div className="fh-pricing-top">
            <div><div className="fh-label" style={{ color: "#87a2ff" }}>Bike plans / fixed pricing</div><h2 className="fh-display">Choose a plan. We’ll keep you <em>moving.</em></h2></div>
            <div><p>Pick your rhythm. Every plan includes a maintained bike, transparent pricing, and no separate repair bill.</p><div className="fh-pricing-switcher" role="group" aria-label="Bike type"><button className="fh-plan-toggle active" type="button">City bike</button><button className="fh-plan-toggle" type="button" onClick={() => toast.info("E-bike plans are coming next.")}>E-bike soon</button></div></div>
          </div>
          <div className="fh-price-grid">
            {plans.map((plan) => (
              <button key={plan.label} className={`fh-price-card ${selectedPlan === plan.label ? "active" : ""}`} type="button" onClick={() => setSelectedPlan(plan.label)} aria-pressed={selectedPlan === plan.label}>
                {plan.popular && <span className="fh-popular">most flexible</span>}
                <small>{plan.label}</small><strong>€{plan.price}</strong><span>total rental</span>
              </button>
            ))}
          </div>
          <div className="fh-deposit-note"><ShieldCheck size={15} /> Your selected plan: <strong>{selectedPlan}</strong> · €50 refundable deposit for new rentals only.</div>
        </div>
      </section>

      <section id="process" className="fh-section fh-process-section">
        <div className="fh-container fh-process-grid">
          <div className="fh-process-intro"><div className="fh-label">Less admin / more city</div><h2 className="fh-display">A rental process that <em>doesn’t feel like paperwork.</em></h2><p>Everything is designed to happen online, so you can spend less time chasing forms and more time getting oriented.</p><button className="fh-process-link" type="button" onClick={() => scrollToId("get-started")}>Ask us a question <ArrowRight size={14} /></button></div>
          <div className="fh-process-list">
            {processSteps.map((step) => { const Icon = step.icon; return <article className="fh-process-step" key={step.number}><span className="fh-step-marker"><Icon /></span><div className="fh-step-no">{step.number}</div><div><h3>{step.title}</h3><p>{step.copy}</p></div></article>; })}
          </div>
        </div>
      </section>

      <section className="fh-values">
        <div className="fh-container fh-values-layout">
          <div><div className="fh-label">The Foreigners Hub standard</div><h2 className="fh-display">Useful, <em>not vague.</em></h2></div>
          <div className="fh-values-list">{values.map((value) => { const Icon = value.icon; return <article className="fh-value" key={value.title}><span className="fh-value-icon"><Icon size={16} /></span><h3>{value.title}</h3><p>{value.copy}</p></article>; })}</div>
        </div>
      </section>

      <section id="get-started" className="fh-cta">
        <div className="fh-container fh-cta-inner">
          <div><div className="fh-label" style={{ color: "#b7ffcf" }}>First move, made easy</div><h2 className="fh-display">New city? <em>We’ve got the basics.</em></h2></div>
          <div className="fh-cta-copy"><p>Bike rentals are live. Apartment listings are on the way. Leave your email and we’ll send the useful updates — not the noisy ones.</p><form onSubmit={handleWaitlist}><label className="sr-only" htmlFor="email">Email address</label><div className="fh-cta-actions"><input id="email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@email.com" aria-label="Email address" style={{ minHeight: 49, minWidth: 0, flex: 1, borderRadius: 999, border: "1px solid rgba(255,255,255,.34)", padding: "0 16px", color: "#16264b", outline: "none" }} /><button className="fh-primary-btn" type="submit">Keep me posted <ArrowUpRight size={15} /></button></div></form></div>
        </div>
      </section>

      <footer className="fh-footer"><div className="fh-container fh-footer-inner"><a className="fh-brand" href="#top"><img src={assets.mark} alt="" /><span className="fh-wordmark">Foreigners Hub<small>city essentials</small></span></a><small>Move around. Settle in. © 2026 Foreigners Hub.</small><div className="fh-footer-links"><a href="#services">Services</a><a href="#pricing">Pricing</a><a href="#process">Process</a></div></div></footer>
    </main>
  );
}
