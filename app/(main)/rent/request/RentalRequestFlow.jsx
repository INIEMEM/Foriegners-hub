"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, CalendarDays,
  CreditCard, ShieldCheck, Loader2, MessageCircle, Copy, ExternalLink, Bike,
} from "lucide-react";
import { guestSubmitRental } from "@/app/actions/rental";

const PLANS = [
  {
    id: "monthly",
    label: "Pay monthly",
    sublabel: "€170 once, upfront",
    price: 170,
    tag: "Save €10",
    description: "Pay once and ride for the full month. Best value.",
  },
  {
    id: "weekly",
    label: "Pay weekly",
    sublabel: "€45 per week × 4",
    price: 45,
    tag: "Flexible",
    description: "Prefer to spread the cost? Pay €45 each week across the month.",
  },
];

const STEPS = ["Date", "Plan", "Review", "Payment"];

function StepBar({ current }) {
  return (
    <div style={{ display: "flex", gap: "12px", marginBottom: "36px" }}>
      {STEPS.map((label, i) => {
        const idx = i + 1;
        const done = current > idx;
        const active = current === idx;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", flex: 1 }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 700, flexShrink: 0,
                background: done ? "#16a34a" : active ? "#315cff" : "#e2e8f0",
                color: (done || active) ? "white" : "#94a3b8",
                transition: "background 0.3s",
              }}>
                {done ? <Check size={13} /> : idx}
              </div>
              <span style={{
                fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap",
                color: active ? "#315cff" : done ? "#16a34a" : "#94a3b8",
              }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                height: "2px", flex: 1, marginBottom: "18px",
                background: done ? "#16a34a" : "#e2e8f0",
                transition: "background 0.3s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Sidebar({ selectedPlan, startDate, isReturningCustomer }) {
  const depositAmount = isReturningCustomer ? 0 : 50;
  const totalDue = (selectedPlan?.price || 0) + depositAmount;

  return (
    <div style={{
      background: "#0f172a", borderRadius: "20px", padding: "28px",
      color: "white", display: "flex", flexDirection: "column", gap: "20px",
      position: "sticky", top: "24px",
    }}>
      <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "#64748b", textTransform: "uppercase" }}>
        Rental Summary
      </p>

      {/* Bike info */}
      <div style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Bike size={20} style={{ color: "#60a5fa" }} />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: "14px", marginBottom: "2px" }}>City Bike</p>
          <p style={{ fontSize: "12px", color: "#64748b" }}>Assigned by admin after payment</p>
        </div>
      </div>

      {/* Details */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {startDate && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
            <span style={{ color: "#64748b" }}>Start date</span>
            <span style={{ fontWeight: 600 }}>
              {new Date(startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        )}
        {selectedPlan && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "#64748b" }}>Plan</span>
              <span style={{ fontWeight: 600 }}>{selectedPlan.label}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "#64748b" }}>
                {selectedPlan.id === "weekly" ? "First payment" : "Rental"}
              </span>
              <span style={{ fontWeight: 600 }}>€{selectedPlan.price}</span>
            </div>
          </>
        )}
        {!isReturningCustomer && selectedPlan && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
            <span style={{ color: "#64748b" }}>Deposit (refundable)</span>
            <span style={{ fontWeight: 600 }}>€50</span>
          </div>
        )}
        {selectedPlan && (
          <>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", margin: "4px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: 700 }}>
              <span>Due now</span>
              <span style={{ color: "#60a5fa" }}>€{totalDue}</span>
            </div>
            {selectedPlan.id === "weekly" && (
              <p style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                Then €45/week for the remaining 3 weeks.
              </p>
            )}
          </>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px" }}>
        {[
          "€50 deposit refunded on return",
          "Bike assigned after payment verified",
          "Sign contract on your dashboard",
        ].map((t) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#94a3b8" }}>
            <ShieldCheck size={13} style={{ color: "#22c55e", flexShrink: 0 }} />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RentalRequestFlow({ user, siteSettings = {}, isReturningCustomer = false }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(() => parseInt(searchParams.get("step") || "1", 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState(null);
  const [copied, setCopied] = useState(false);

  const [startDate, setStartDate] = useState(() => searchParams.get("date") || "");
  const [selectedPlanId, setSelectedPlanId] = useState(() => searchParams.get("plan") || "");
  const [guestEmail, setGuestEmail] = useState(() => user?.email || "");
  const [guestName, setGuestName] = useState("");

  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId);
  // Deposit is shown as €50 by default for guest — the server action will check if they're returning
  const depositAmount = 50;
  const totalDue = (selectedPlan?.price || 0) + depositAmount;
  const todayStr = new Date().toISOString().split("T")[0];

  const rawNumber = (siteSettings.whatsapp_number || "").replace(/\D/g, "");
  const waMessage = encodeURIComponent(
    `Hi Foreigners Hub! I just submitted a bike rental payment.\n\nEmail: ${guestEmail}\nPlan: ${selectedPlan?.label || ""}\nStart date: ${startDate}\n\nPlease find my payment confirmation attached.`
  );
  const waLink = rawNumber
    ? `https://wa.me/${rawNumber}?text=${waMessage}`
    : `https://wa.me/?text=${waMessage}`;

  const paymentDetails = {
    Bank: siteSettings.payment_account_bank || "—",
    "Account name": siteSettings.payment_account_name || "FOREIGNERS HUB",
    "IBAN / Account no.": siteSettings.payment_account_iban || "—",
    ...(siteSettings.payment_account_bic ? { "BIC / SWIFT": siteSettings.payment_account_bic } : {}),
    Reference: `FHUB-RENTAL`,
  };

  function copyRef() {
    navigator.clipboard.writeText("FHUB-RENTAL").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleNext() {
    setError("");
    if (step === 1) {
      if (!startDate) { setError("Please choose a start date."); return; }
      setStep(2);
    } else if (step === 2) {
      if (!selectedPlanId) { setError("Please select a payment plan."); return; }
      setStep(3);
    } else if (step === 3) {
      if (!guestName.trim()) { setError("Please enter your full name."); return; }
      if (!guestEmail || !guestEmail.includes("@")) { setError("Please enter a valid email address."); return; }
      // Move to payment step — details already collected
      setStep(4);
    }
  }

  async function handleConfirmPayment() {
    setError("");
    if (!guestEmail || !guestEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const result = await guestSubmitRental({
        email: guestEmail,
        name: guestName,
        planType: selectedPlanId,
        startDate,
      });
      setSubmittedEmail(result.email);
      setStep(5);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }} className="checkout-grid">
      <style>{`
        @media (min-width: 900px) {
          .checkout-grid { grid-template-columns: 1fr 320px !important; }
          .checkout-sidebar { order: 2; }
          .checkout-main { order: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Main panel */}
      <div className="checkout-main" style={{ background: "white", borderRadius: "20px", padding: "32px 28px", border: "1px solid #e8edf5" }}>

        {/* Back link */}
        <Link href="/bikes" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#94a3b8", fontSize: "13px", fontWeight: 600, textDecoration: "none", marginBottom: "24px" }}>
          <ArrowLeft size={14} /> Bike rental info
        </Link>

        {step < 5 && <StepBar current={step} />}

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <CalendarDays size={22} style={{ color: "#315cff" }} />
              <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>When do you want to start?</h1>
            </div>
            <p style={{ color: "#64748b", marginBottom: "28px", fontSize: "14px" }}>
              Choose your preferred rental start date. This is when you'd like to collect the bike.
            </p>

            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
              Rental start date
            </label>
            <input
              type="date"
              min={todayStr}
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setError(""); }}
              style={{
                width: "100%", padding: "12px 16px", borderRadius: "12px",
                border: "1.5px solid #e2e8f0", fontSize: "15px", fontWeight: 600,
                color: "#0f172a", background: "#f8fafc", outline: "none",
                fontFamily: "inherit", marginBottom: "24px",
              }}
            />

            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", background: "#f0f9ff", borderRadius: "12px", padding: "14px", marginBottom: "28px" }}>
              <ShieldCheck size={16} style={{ color: "#0284c7", flexShrink: 0, marginTop: "2px" }} />
              <p style={{ fontSize: "13px", color: "#0369a1" }}>
                Your rental won't start until payment is verified and our team assigns you a bike. The date you pick is your <strong>preferred</strong> start date.
              </p>
            </div>

            {error && <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "16px" }}>{error}</p>}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={handleNext} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#315cff", color: "white", fontWeight: 700, padding: "12px 24px", borderRadius: "12px", fontSize: "15px", border: "none", cursor: "pointer" }}>
                Choose plan <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <CreditCard size={22} style={{ color: "#315cff" }} />
              <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>Choose your payment plan</h1>
            </div>
            <p style={{ color: "#64748b", marginBottom: "28px", fontSize: "14px" }}>
              Both plans cover <strong>1 full month</strong> of riding. Pick whichever suits you.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "24px" }}>
              {PLANS.map((plan) => {
                const active = selectedPlanId === plan.id;
                return (
                  <button key={plan.id} onClick={() => { setSelectedPlanId(plan.id); setError(""); }} style={{
                    display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left",
                    padding: "20px", borderRadius: "16px", cursor: "pointer",
                    border: active ? "2px solid #315cff" : "1.5px solid #e2e8f0",
                    background: active ? "#f0f4ff" : "white",
                    transition: "all 0.2s", position: "relative",
                  }}>
                    <span style={{ display: "inline-flex", alignItems: "center", background: active ? "#315cff" : "#f1f5f9", color: active ? "white" : "#64748b", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px", marginBottom: "10px", letterSpacing: "0.05em" }}>
                      {plan.tag}
                    </span>
                    <p style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>{plan.label}</p>
                    <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "10px" }}>{plan.sublabel}</p>
                    <p style={{ fontSize: "28px", fontWeight: 800, color: active ? "#315cff" : "#0f172a" }}>
                      €{plan.price}<span style={{ fontSize: "13px", fontWeight: 500, color: "#94a3b8", marginLeft: "4px" }}>{plan.id === "weekly" ? "/wk" : "/mo"}</span>
                    </p>
                    <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>{plan.description}</p>
                    {active && (
                      <div style={{ position: "absolute", top: "14px", right: "14px", width: "20px", height: "20px", borderRadius: "50%", background: "#315cff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Check size={12} color="white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {!isReturningCustomer && (
              <div style={{ display: "flex", gap: "10px", background: "#fffbeb", borderRadius: "12px", padding: "14px", border: "1px solid #fde68a", marginBottom: "24px" }}>
                <ShieldCheck size={16} style={{ color: "#d97706", flexShrink: 0, marginTop: "2px" }} />
                <p style={{ fontSize: "13px", color: "#92400e" }}>
                  As a new customer, a <strong>€50 refundable deposit</strong> will be added to your first payment. Returned when the bike is handed back.
                </p>
              </div>
            )}
            {isReturningCustomer && (
              <div style={{ display: "flex", gap: "10px", background: "#f0fdf4", borderRadius: "12px", padding: "14px", border: "1px solid #bbf7d0", marginBottom: "24px" }}>
                <Check size={16} style={{ color: "#16a34a", flexShrink: 0, marginTop: "2px" }} />
                <p style={{ fontSize: "13px", color: "#166534" }}>
                  Welcome back! As a returning customer, <strong>no deposit is required</strong>.
                </p>
              </div>
            )}

            {error && <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "16px" }}>{error}</p>}

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => { setError(""); setStep(1); }} style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#64748b", fontWeight: 600, fontSize: "14px", background: "none", border: "none", cursor: "pointer" }}>
                <ArrowLeft size={15} /> Back
              </button>
              <button onClick={handleNext} disabled={!selectedPlanId} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: selectedPlanId ? "#315cff" : "#e2e8f0", color: selectedPlanId ? "white" : "#94a3b8", fontWeight: 700, padding: "12px 24px", borderRadius: "12px", fontSize: "15px", border: "none", cursor: selectedPlanId ? "pointer" : "not-allowed" }}>
                Review rental <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Review */}
        {step === 3 && (
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>Review your rental</h1>
            <p style={{ color: "#64748b", marginBottom: "28px", fontSize: "14px" }}>Confirm everything is correct before proceeding.</p>

            <div style={{ borderRadius: "14px", border: "1.5px solid #e2e8f0", overflow: "hidden", marginBottom: "24px" }}>
              {[
                ["Start date", new Date(startDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })],
                ["Duration", "1 month (minimum)"],
                ["Payment plan", selectedPlan?.label],
                ...(selectedPlan?.id === "weekly" ? [["Weekly amount", "€45/week × 4 weeks"]] : []),
                ...(depositAmount > 0 ? [["Refundable deposit", `€${depositAmount} (new customer)`]] : []),
                ["divider", ""],
                ["Total due now", `€${totalDue}`],
              ].map(([label, value], i) =>
                label === "divider" ? (
                  <div key={i} style={{ borderTop: "1.5px solid #e2e8f0" }} />
                ) : (
                  <div key={label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "13px 18px", borderBottom: "1px solid #f1f5f9",
                    background: i % 2 === 0 ? "white" : "#fafbff",
                  }}>
                    <span style={{ fontSize: "13px", color: "#64748b" }}>{label}</span>
                    <span style={{ fontSize: label === "Total due now" ? "16px" : "13px", fontWeight: label === "Total due now" ? 800 : 600, color: label === "Total due now" ? "#315cff" : "#0f172a" }}>
                      {value}
                    </span>
                  </div>
                )
              )}
            </div>

            <div style={{ display: "grid", gap: "14px", gridTemplateColumns: "1fr 1fr", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>
                  Full name
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. John Smith"
                  style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "11px 14px", fontSize: "14px", color: "#0f172a", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "11px 14px", fontSize: "14px", color: "#0f172a", outline: "none" }}
                />
              </div>
            </div>

            <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "14px", border: "1px solid #e2e8f0", marginBottom: "28px" }}>
              <p style={{ fontSize: "12px", color: "#64748b" }}>
                By proceeding, you're requesting a bike rental. Your rental won't be active until our team verifies payment and assigns you a bike. You'll receive email updates at every stage.
              </p>
            </div>

            {error && <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "16px" }}>{error}</p>}

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => { setError(""); setStep(2); }} style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#64748b", fontWeight: 600, fontSize: "14px", background: "none", border: "none", cursor: "pointer" }}>
                <ArrowLeft size={15} /> Back
              </button>
              <button onClick={handleNext} disabled={loading} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#315cff", color: "white", fontWeight: 700, padding: "12px 24px", borderRadius: "12px", fontSize: "15px", border: "none", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
                {loading ? (
                  <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Loading...</>
                ) : (
                  <>Proceed to payment <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Payment */}
        {step === 4 && (
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>Make your payment</h1>
            <p style={{ color: "#64748b", marginBottom: "20px", fontSize: "14px" }}>
              Transfer <strong>€{totalDue}</strong> to our account using the details below.
            </p>

            <div style={{ borderRadius: "14px", border: "1.5px solid #fed7aa", background: "#fff7ed", padding: "20px", marginBottom: "20px" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: "#92400e", marginBottom: "14px", textTransform: "uppercase" }}>Bank transfer details</p>
              {Object.entries(paymentDetails).map(([key, val]) => (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #fed7aa" }}>
                  <span style={{ fontSize: "13px", color: "#78350f" }}>{key}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", fontFamily: key === "Reference" ? "monospace" : "inherit" }}>{val}</span>
                    {key === "Reference" && (
                      <button onClick={copyRef} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}>
                        {copied ? <Check size={13} style={{ color: "#16a34a" }} /> : <Copy size={13} style={{ color: "#94a3b8" }} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", background: "#25d366", color: "white", fontWeight: 700, fontSize: "15px", padding: "14px 20px", borderRadius: "14px", textDecoration: "none", marginBottom: "20px" }}>
              <MessageCircle size={18} /> Send payment screenshot via WhatsApp <ExternalLink size={14} style={{ opacity: 0.7 }} />
            </a>

            <div style={{ background: "#f0f9ff", borderRadius: "12px", padding: "14px", border: "1px solid #bae6fd", marginBottom: "24px" }}>
              <p style={{ fontSize: "13px", color: "#0369a1" }}>
                After transferring, click the WhatsApp button above to send us a screenshot. Then confirm below — our team will verify it and email you within a few hours.
              </p>
            </div>

            {error && <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "16px" }}>{error}</p>}

            <button onClick={handleConfirmPayment} disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", background: "#0f172a", color: "white", fontWeight: 700, fontSize: "15px", padding: "14px 20px", borderRadius: "14px", border: "none", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Submitting...</> : <><Check size={16} /> I've sent the payment</>}
            </button>
          </div>
        )}

        {/* STEP 5 — Success */}
        {step === 5 && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#f0fdf4", border: "2px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <CheckCircle2 size={36} style={{ color: "#16a34a" }} />
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", marginBottom: "10px" }}>Payment submitted!</h1>
            <p style={{ color: "#64748b", fontSize: "15px", maxWidth: "420px", margin: "0 auto 24px", lineHeight: 1.7 }}>
              We've received your rental request. Here's what happens next:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "360px", margin: "0 auto 32px", textAlign: "left" }}>
              {[
                "We verify your payment (usually within a few hours)",
                "Our team assigns you a maintained bike",
                "You'll receive pickup time & location via email",
                "Click the link in your email to access your dashboard and sign your contract",
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#f0f4ff", border: "1.5px solid #c7d7ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "11px", fontWeight: 700, color: "#315cff" }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: "13px", color: "#374151", lineHeight: 1.5, marginTop: "2px" }}>{s}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "24px" }}>
              A confirmation email has been sent to <strong>{submittedEmail}</strong>
            </p>

            <p style={{ fontSize: "13px", color: "#64748b" }}>
              You can close this page. Check your inbox for next steps.
            </p>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="checkout-sidebar">
        <Sidebar selectedPlan={selectedPlan} startDate={startDate} isReturningCustomer={isReturningCustomer} />
      </div>
    </div>
  );
}
