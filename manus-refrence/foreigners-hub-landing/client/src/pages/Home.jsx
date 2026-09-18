/*
 * Wayfinding Editorial: this page uses an offset editorial rail, route-line cues,
 * and service-coded cards to make moving and settling feel legible.
 */
import {
  ArrowRight,
  ArrowUpRight,
  Bike,
  Building2,
  Check,
  ChevronRight,
  CircleHelp,
  FileCheck2,
  Headphones,
  KeyRound,
  MapPin,
  Menu,
  MoveRight,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const HERO_IMAGE = "/manus-storage/foreigners-hub-hero_4661938e.png";
const BIKES_IMAGE = "/manus-storage/foreigners-hub-bikes_a2b29fd7.png";
const APARTMENT_IMAGE = "/manus-storage/foreigners-hub-apartment_a4f0449e.png";
const MARK_IMAGE = "/manus-storage/foreigners-hub-mark_c0c1e3e3.png";

const bikePlans = [
  { duration: "1 week", price: "€55", note: "A quick start" },
  { duration: "1 month", price: "€170", note: "Most flexible" },
  { duration: "3 months", price: "€450", note: "Best long stay" },
];

const benefits = [
  { icon: ShieldCheck, title: "No hidden fees", copy: "See the full price before you choose." },
  { icon: FileCheck2, title: "Digital contracts", copy: "Sign online, without queues or paperwork." },
  { icon: Wrench, title: "Repairs included", copy: "Your rental keeps running. We handle the rest." },
  { icon: Headphones, title: "Human support", copy: "Fast answers from real people when you need them." },
];

const steps = [
  { number: "01", title: "Browse & choose", copy: "See real availability and clear pricing for bikes and apartments." },
  { number: "02", title: "Sign digitally", copy: "Complete your details and sign your rental agreement online." },
  { number: "03", title: "Pay locally", copy: "Transfer to Foreigners Hub. We verify it and activate your rental." },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function BrandMark() {
  return (
    <span className="brand-lockup" aria-label="Foreigners Hub">
      <span className="brand-mark-wrap">
        <img src={MARK_IMAGE} alt="" className="brand-mark" />
      </span>
      <span className="brand-name">
        <strong>Foreigners</strong>
        <span>Hub</span>
      </span>
    </span>
  );
}

function SectionKicker({ children, color = "blue" }: { children: React.ReactNode; color?: "blue" | "green" | "orange" }) {
  return (
    <div className={`section-kicker section-kicker-${color}`}>
      <span className="kicker-dot" />
      <span>{children}</span>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenuAndScroll = (id: string) => {
    setMenuOpen(false);
    scrollToId(id);
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="nav-frame">
          <a className="brand-link" href="#top" onClick={() => scrollToId("top")}>
            <BrandMark />
          </a>
          <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation">
            <button type="button" onClick={() => closeMenuAndScroll("services")}>Services</button>
            <button type="button" onClick={() => closeMenuAndScroll("process")}>How it works</button>
            <button type="button" onClick={() => closeMenuAndScroll("why-us")}>Why Foreigners Hub</button>
          </nav>
          <div className="nav-actions">
            <button className="nav-login" type="button" onClick={() => toast.info("Your personal dashboard is coming soon.")}>Log in</button>
            <button className="button button-small button-blue" type="button" onClick={() => scrollToId("services")}>
              Find your fit <ArrowUpRight size={15} strokeWidth={2.2} />
            </button>
          </div>
          <button className="menu-toggle" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-route-line" aria-hidden="true">
            <span className="route-point route-point-start" />
            <span className="route-point route-point-end" />
          </div>
          <div className="hero-grid page-width">
            <div className="hero-copy">
              <SectionKicker>For students & newcomers</SectionKicker>
              <h1>Move around.<br /><em>Settle in.</em></h1>
              <p className="hero-lede">The essentials for your new city, without the usual friction. Rent a maintained bike, find a place to live, and get on with your next chapter.</p>
              <div className="hero-actions">
                <button className="button button-blue button-large" type="button" onClick={() => scrollToId("bikes")}>
                  Browse bikes <ArrowRight size={17} />
                </button>
                <button className="text-link" type="button" onClick={() => scrollToId("apartments")}>
                  Explore apartments <MoveRight size={17} />
                </button>
              </div>
              <div className="hero-proof">
                <div className="proof-avatars" aria-hidden="true">
                  <span className="proof-avatar avatar-one">M</span>
                  <span className="proof-avatar avatar-two">A</span>
                  <span className="proof-avatar avatar-three">J</span>
                </div>
                <p><strong>Made for starting over</strong><br />Clear terms. Real support. No guesswork.</p>
              </div>
            </div>
            <div className="hero-visual-wrap">
              <div className="hero-visual">
                <img src={HERO_IMAGE} alt="A newcomer riding a city bicycle toward a bright apartment building" />
                <div className="visual-sticker visual-sticker-top"><MapPin size={14} /> Your city, made easier</div>
                <div className="visual-sticker visual-sticker-bottom">
                  <span className="sticker-icon"><Bike size={17} /></span>
                  <span><small>Weekly bike rental</small><strong>From €55</strong></span>
                  <ArrowUpRight size={17} />
                </div>
              </div>
              <div className="hero-number">01<span>/</span>02</div>
            </div>
          </div>
          <div className="hero-foot page-width">
            <span>Everything you need to begin</span>
            <div className="scroll-cue"><span /> Scroll to explore</div>
            <span className="hero-foot-right">Bikes <i /> Apartments</span>
          </div>
        </section>

        <section className="signal-strip" aria-label="Foreigners Hub benefits">
          <div className="page-width signal-grid">
            <div className="signal-intro"><Sparkles size={16} /> Built for real life</div>
            {benefits.slice(0, 3).map((benefit) => (
              <div className="signal-item" key={benefit.title}>
                <benefit.icon size={18} />
                <span>{benefit.title}</span>
              </div>
            ))}
            <div className="signal-item signal-item-end"><Headphones size={18} /><span>Human support</span></div>
          </div>
        </section>

        <section className="services-section page-section" id="services">
          <div className="page-width">
            <div className="section-intro services-intro">
              <div>
                <SectionKicker>Two essentials</SectionKicker>
                <h2>One clearer way<br /><span>to get settled.</span></h2>
              </div>
              <p>Whether you need wheels for the week or a place for the semester, Foreigners Hub keeps the essentials in one calm, practical place.</p>
            </div>

            <div className="services-layout">
              <article className="service-card bike-card" id="bikes">
                <div className="service-card-top">
                  <div className="service-label service-label-green"><Bike size={17} /> 01 / Get around</div>
                  <button className="circle-arrow circle-arrow-light" type="button" aria-label="View bike rentals" onClick={() => toast.success("Bike plans are ready to browse.")}><ArrowUpRight size={19} /></button>
                </div>
                <div className="service-card-copy">
                  <h3>Bike rentals<br /><span>that keep up.</span></h3>
                  <p>Maintained city bikes and e-bikes on weekly or monthly plans. Transparent pricing, repairs included.</p>
                </div>
                <div className="service-image bike-image"><img src={BIKES_IMAGE} alt="Two maintained city bicycles outside an apartment courtyard" /></div>
                <div className="service-card-bottom">
                  <span><strong>From €55</strong> / 1 week</span>
                  <button type="button" className="inline-arrow" onClick={() => scrollToId("bike-plans")}>See bike plans <ChevronRight size={15} /></button>
                </div>
              </article>

              <article className="service-card apartment-card" id="apartments">
                <div className="service-card-top">
                  <div className="service-label service-label-orange"><Building2 size={17} /> 02 / Settle in</div>
                  <button className="circle-arrow" type="button" aria-label="Ask about apartments" onClick={() => toast.info("Apartment viewings are opening soon — leave us a note to be first in line.")}><ArrowUpRight size={19} /></button>
                </div>
                <div className="service-card-copy">
                  <h3>A place<br /><span>to call yours.</span></h3>
                  <p>Furnished, move-in ready apartments with flexible lease terms and a student-friendly process.</p>
                </div>
                <div className="service-image apartment-image"><img src={APARTMENT_IMAGE} alt="Bright furnished studio apartment with a desk and sofa" /></div>
                <div className="service-card-bottom">
                  <span><strong>Flexible</strong> lease terms</span>
                  <button type="button" className="inline-arrow" onClick={() => toast.info("Apartment listings are being prepared for launch.")}>View apartments <ChevronRight size={15} /></button>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="plans-section" id="bike-plans">
          <div className="page-width plans-grid">
            <div className="plans-copy">
              <SectionKicker color="green">Bike plans</SectionKicker>
              <h2>Simple plans.<br /><span>More city.</span></h2>
              <p>Choose the time that fits your stay. Every rental includes a €50 refundable deposit for new rentals and maintenance from day one.</p>
              <button type="button" className="button button-dark button-medium" onClick={() => toast.success("We’ll help you choose the right plan.")}>Choose a bike <ArrowRight size={17} /></button>
            </div>
            <div className="plan-list">
              {bikePlans.map((plan, index) => (
                <button type="button" className={`plan-row ${index === 1 ? "plan-row-featured" : ""}`} key={plan.duration} onClick={() => toast.success(`${plan.duration} plan selected — we’ll take it from here.`)}>
                  <span className="plan-index">0{index + 1}</span>
                  <span className="plan-duration"><strong>{plan.duration}</strong><small>{plan.note}</small></span>
                  <span className="plan-price">{plan.price}</span>
                  <ArrowUpRight size={18} />
                </button>
              ))}
              <div className="plan-note"><CircleHelp size={15} /> Also available: 2 weeks €110 · 3 weeks €150 · 2 months €340</div>
            </div>
          </div>
        </section>

        <section className="process-section page-section" id="process">
          <div className="page-width">
            <div className="process-heading">
              <div>
                <SectionKicker>How it works</SectionKicker>
                <h2>Three steps between<br /><span>you and your next move.</span></h2>
              </div>
              <p>Everything happens online, so your energy can go into exploring the city — not figuring out the paperwork.</p>
            </div>
            <div className="steps-grid">
              {steps.map((step, index) => (
                <article className="step-card" key={step.number}>
                  <div className="step-top"><span>{step.number}</span>{index < steps.length - 1 && <ArrowRight className="step-arrow" size={22} />}</div>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="why-section page-section" id="why-us">
          <div className="page-width why-grid">
            <div className="why-visual">
              <div className="why-orbit orbit-one" />
              <div className="why-orbit orbit-two" />
              <img src={MARK_IMAGE} alt="" className="why-mark" />
              <span className="why-coord coord-one">52° 22′ N</span>
              <span className="why-coord coord-two">4° 53′ E</span>
            </div>
            <div className="why-copy">
              <SectionKicker color="orange">Why Foreigners Hub</SectionKicker>
              <h2>A soft landing<br /><span>for new beginnings.</span></h2>
              <p>Starting somewhere new is already a lot. We take care of the essentials with clear terms, maintained rentals, and support that feels human.</p>
              <div className="why-list">
                {benefits.map((benefit) => (
                  <div className="why-list-item" key={benefit.title}>
                    <span className="why-check"><Check size={13} /></span>
                    <span><strong>{benefit.title}</strong>{benefit.copy}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="closing-section">
          <div className="page-width closing-inner">
            <div className="closing-copy">
              <SectionKicker color="green">Your next chapter</SectionKicker>
              <h2>Pick your route.<br /><em>We’ll handle the rest.</em></h2>
              <p>From the first ride to the keys in your hand, Foreigners Hub is here to make a new city feel a little more yours.</p>
              <button type="button" className="button button-white button-large" onClick={() => scrollToId("services")}>Find your fit <ArrowUpRight size={17} /></button>
            </div>
            <div className="closing-route" aria-hidden="true"><span className="closing-dot" /><span className="closing-line" /><span className="closing-dot closing-dot-end" /></div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-width footer-top">
          <a className="brand-link" href="#top" onClick={() => scrollToId("top")}><BrandMark /></a>
          <p>Move around. Settle in.</p>
          <div className="footer-links"><button type="button" onClick={() => toast.info("Rental terms will be available with your booking.")}>Rental terms</button><button type="button" onClick={() => toast.info("Support is available when you’re ready to rent.")}>Support</button><button type="button" onClick={() => toast.info("Your dashboard is coming soon.")}>Your dashboard</button></div>
        </div>
        <div className="page-width footer-bottom"><span>© {new Date().getFullYear()} Foreigners Hub</span><span>Made for people finding their way</span><span className="footer-location"><MapPin size={13} /> Europe / online</span></div>
      </footer>
    </div>
  );
}
