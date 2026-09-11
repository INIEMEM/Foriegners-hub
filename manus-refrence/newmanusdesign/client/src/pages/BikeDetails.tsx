import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Bike, CalendarDays, Check, CheckCircle2, CircleDot, Copy, ExternalLink, FileText, LockKeyhole, MapPin, MessageCircle, ShieldCheck, Wrench } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const bikeImage = "/manus-storage/foreigners-hub-e-bike_a39d643a.jpeg";
const mark = "/manus-storage/foreigners-hub-mark_f2c991cf.png";

type Step = 0 | 1 | 2 | 3 | 4 | 5;

const planOptions = [
  { id: "monthly", title: "Pay monthly", price: 170, displayPrice: 170, suffix: "for 1 month", detail: "One payment for your first month", badge: "Best value" },
  { id: "weekly", title: "Pay weekly", price: 180, displayPrice: 45, suffix: "per week · 4 weeks", detail: "Four weekly payments for your first month", badge: "Flexible" },
];

const inclusions = [
  { title: "Free maintenance", copy: "Brake, tire, and chain servicing is included.", icon: Wrench },
  { title: "Helmet", copy: "A helmet is ready for your pickup.", icon: ShieldCheck },
  { title: "Gloves", copy: "Comfortable riding gloves included.", icon: ShieldCheck },
  { title: "GPS tracking", copy: "The bike is tracked for peace of mind.", icon: MapPin },
  { title: "Lock", copy: "Secure your bike wherever you park.", icon: LockKeyhole },
];

function Stepper({ step }: { step: Step }) {
  const labels = ["Bike", "Details", "Plan", "Transfer", "Proof", "Pickup"];
  return <div className="fh-rental-stepper" aria-label="Rental progress">{labels.map((label, index) => <div className={`fh-rental-step-item ${index <= step ? "active" : ""}`} key={label}><span>{index < step ? <Check size={12} /> : index + 1}</span><small>{label}</small></div>)}</div>;
}

export default function BikeDetails() {
  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(planOptions[0]);
  const [copied, setCopied] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);

  const total = selectedPlan.price + 50;

  function nextFromDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Add your full name and email to continue.");
      return;
    }
    setStep(2);
  }

  function nextFromPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!startDate) {
      toast.error("Choose a preferred rental start date.");
      return;
    }
    setStep(3);
  }

  function copyAccount() {
    navigator.clipboard?.writeText("Foreigners Hub · IBAN: NL00 FHUB 0000 0000 00");
    setCopied(true);
    toast.success("Account details copied.");
    window.setTimeout(() => setCopied(false), 2200);
  }

  return <main className="fh-bike-page">
    <header className="fh-subnav"><div className="fh-container fh-subnav-inner"><Link className="fh-brand" href="/"><img src={mark} alt="" /><span className="fh-wordmark">Foreigners Hub<small>city essentials</small></span></Link><div className="fh-subnav-actions"><Link href="/login" className="fh-subnav-login">Passwordless login</Link><Link href="/" className="fh-subnav-home"><ArrowLeft size={14} /> Back to services</Link></div></div></header>
    <section className="fh-rental-journey-head"><div className="fh-container"><div className="fh-kicker"><span className="fh-kicker-dot" /> Bike rental / simple by design</div><h1 className="fh-display">Get moving in a few <em>clear steps.</em></h1><p>Choose your bike, share your details, make the transfer, and send us your proof. We’ll handle the rest.</p><Stepper step={step} /></div></section>

    {step === 0 && <section className="fh-rental-screen fh-bike-overview-screen"><div className="fh-container fh-bike-overview-grid"><div className="fh-bike-overview-photo"><img src={bikeImage} alt="Black electric fat tire bicycle available for rental" /><span className="fh-bike-code"><Bike size={14} /> B-CODE 001</span></div><div className="fh-bike-overview-copy"><div className="fh-label">Available now / electric city bike</div><h2 className="fh-display">Your first ride in a new city.</h2><p className="fh-bike-lead">A powerful, comfortable e-bike for getting around, with everything you need to ride confidently from day one.</p><div className="fh-inclusion-grid">{inclusions.map(({ title, copy, icon: Icon }) => <div className="fh-inclusion-card" key={title}><span><Icon size={17} /></span><strong>{title}</strong><p>{copy}</p></div>)}</div><div className="fh-bike-overview-bottom"><div><span className="fh-label">Starting from</span><strong>€170 <small>/ first month</small></strong></div><button className="fh-primary-btn" type="button" onClick={() => setStep(1)}>Start rental <ArrowRight size={16} /></button></div></div></div></section>}

    {step === 1 && <section className="fh-rental-screen"><div className="fh-container fh-centered-flow"><div className="fh-flow-intro"><div className="fh-step-badge">Step 2 / 6</div><h2 className="fh-display">Tell us who’s riding.</h2><p>We’ll use these details to prepare your rental agreement and payment instructions.</p></div><form className="fh-rental-form-card" onSubmit={nextFromDetails}><label htmlFor="rental-name">Full name</label><input id="rental-name" type="text" placeholder="Your full name" value={name} onChange={(event) => setName(event.target.value)} /><label htmlFor="rental-email">Email address</label><input id="rental-email" type="email" placeholder="you@email.com" value={email} onChange={(event) => setEmail(event.target.value)} /><div className="fh-form-card-foot"><span><ShieldCheck size={15} /> Passwordless updates by email</span><button className="fh-primary-btn" type="submit">Continue <ArrowRight size={16} /></button></div></form></div></section>}

    {step === 2 && <section className="fh-rental-screen"><div className="fh-container fh-centered-flow"><div className="fh-flow-intro"><div className="fh-step-badge">Step 3 / 6</div><h2 className="fh-display">Choose your first month.</h2><p>The minimum rental period is one month. After that, you can extend for €55 per extra week.</p></div><form className="fh-plan-flow" onSubmit={nextFromPlan}><div className="fh-plan-option-grid">{planOptions.map((plan) => <button className={`fh-plan-option ${selectedPlan.id === plan.id ? "active" : ""}`} type="button" key={plan.id} onClick={() => setSelectedPlan(plan)}><div className="fh-plan-option-top"><span>{plan.badge}</span>{selectedPlan.id === plan.id && <CheckCircle2 size={18} />}</div><strong>{plan.title}</strong><b>€{plan.displayPrice}</b><small>{plan.suffix}</small><p>{plan.detail}</p></button>)}</div><div className="fh-extension-note"><CalendarDays size={17} /><span><strong>After month one</strong> extend by one week for €55 whenever you need.</span></div><label className="fh-date-label" htmlFor="rental-start">Preferred rental start date</label><div className="fh-date-input"><CalendarDays size={17} /><input id="rental-start" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></div><button className="fh-primary-btn fh-form-submit" type="submit">Review payment <ArrowRight size={16} /></button></form></div></section>}

    {step === 3 && <section className="fh-rental-screen"><div className="fh-container fh-centered-flow fh-payment-flow"><div className="fh-flow-intro"><div className="fh-step-badge">Step 4 / 6</div><h2 className="fh-display">Make your transfer.</h2><p>Use the details below. Your €50 non-refundable fee is included in the checkout total.</p></div><div className="fh-payment-card"><div className="fh-payment-summary"><span>{selectedPlan.title} · {selectedPlan.suffix}</span><strong>€{total}</strong><small>€{selectedPlan.price} rental + €50 non-refundable fee</small></div><div className="fh-account-block"><div className="fh-account-row"><span>Account name</span><strong>Foreigners Hub</strong></div><div className="fh-account-row"><span>IBAN</span><strong>NL00 FHUB 0000 0000 00</strong></div><div className="fh-account-row"><span>Reference</span><strong>{name || "Your full name"}</strong></div><button className="fh-copy-button" type="button" onClick={copyAccount}>{copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copied" : "Copy account details"}</button></div><div className="fh-payment-warning"><ShieldCheck size={17} /><span>The €50 fee is non-refundable. Your rental is only confirmed after payment is reviewed by the Foreigners Hub team.</span></div><button className="fh-primary-btn fh-form-submit" type="button" onClick={() => setStep(4)}>I have made payment <ArrowRight size={16} /></button></div></div></section>}

    {step === 4 && <section className="fh-rental-screen"><div className="fh-container fh-centered-flow fh-proof-flow"><div className="fh-proof-modal"><div className="fh-proof-icon"><MessageCircle size={24} /></div><div className="fh-step-badge">Step 5 / 6</div><h2 className="fh-display">Send your payment proof.</h2><p>Open WhatsApp and send the transfer screenshot to the admin team. Add your full name so we can match it quickly.</p><div className="fh-whatsapp-preview"><div><MessageCircle size={18} /><span>Foreigners Hub Admin</span></div><small>Hi, I’ve made the payment for my bike rental. My name is {name || "[your name]"}.</small></div><label className="fh-upload-proof"><input type="file" accept="image/*,.pdf" onChange={(event) => setPaymentProof(event.target.files?.[0] ?? null)} /><span>{paymentProof ? <><CheckCircle2 size={16} /> {paymentProof.name}</> : <><FileText size={16} /> Add payment screenshot</>}</span><small>PNG, JPG, or PDF · UI preview only</small></label><a className="fh-primary-btn fh-form-submit" href="https://wa.me/" target="_blank" rel="noreferrer">Open WhatsApp <ExternalLink size={15} /></a><button className="fh-proof-done" type="button" onClick={() => { if (!paymentProof) { toast.error("Attach your payment screenshot first."); return; } setStep(5); }}>I sent my screenshot <Check size={15} /></button></div></div></section>}

    {step === 5 && <section className="fh-rental-screen"><div className="fh-container fh-centered-flow fh-success-flow"><div className="fh-success-card"><div className="fh-success-icon"><CheckCircle2 size={28} /></div><div className="fh-step-badge">Payment proof received</div><h2 className="fh-display">You’re in the pickup queue.</h2><p>The admin team will review your transfer, email you when it’s approved, assign your bike, and send your pickup time.</p><div className="fh-status-list"><div><span>01</span><strong>Payment review</strong><small>Admin confirms your transfer</small></div><div><span>02</span><strong>Bike assigned</strong><small>Your B-Code is attached to your account</small></div><div><span>03</span><strong>Pickup time</strong><small>We email you the location and time</small></div></div><Link className="fh-primary-btn fh-form-submit" href="/login">Login to check status <ArrowRight size={16} /></Link><p className="fh-ui-note"><FileText size={13} /> UI prototype only — admin approval, email notifications, and dashboard data will connect later.</p></div></div></section>}

    <footer className="fh-footer"><div className="fh-container fh-footer-inner"><Link className="fh-brand" href="/"><img src={mark} alt="" /><span className="fh-wordmark">Foreigners Hub<small>city essentials</small></span></Link><small>Move around. Settle in. © 2026 Foreigners Hub.</small><span className="fh-footer-links"><Link href="/login">Passwordless login</Link></span></div></footer>
  </main>;
}
