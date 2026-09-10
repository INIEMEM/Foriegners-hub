"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, CalendarDays,
  CreditCard, ShieldCheck, Loader2, MessageCircle, Copy, ExternalLink,
} from "lucide-react";
import { createRentalRequest, submitPayment } from "@/app/actions/rental";

// ── Hardcoded plans ───────────────────────────────────────────────────────────
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

// ── Step indicator ────────────────────────────────────────────────────────────
const STEPS = ["Date", "Plan", "Review", "Payment"];

function StepBar({ current }) {
  return (
    <div className="flex items-center gap-1 mb-10">
      {STEPS.map((label, i) => {
        const idx = i + 1;
        const done = current > idx;
        const active = current === idx;
        return (
          <div key={label} className="flex items-center gap-1 flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: 700,
                  background: done ? "#16a34a" : active ? "#315cff" : "#e2e8f0",
                  color: done || active ? "white" : "#94a3b8",
                  flexShrink: 0,
                  transition: "background 0.3s",
                }}
              >
                {done ? <Check size={13} /> : idx}
              </div>
              <span style={{
                fontSize: "11px", fontWeight: 600,
                color: active ? "#315cff" : done ? "#16a34a" : "#94a3b8",
                whiteSpace: "nowrap",
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

// ── Sidebar summary ───────────────────────────────────────────────────────────
function Sidebar({ bike, selectedPlan, startDate, isReturningCustomer }) {
  const depositAmount = isReturningCustomer ? 0 : 50;
  const rentalAmount = selectedPlan ? selectedPlan.price : 0;
  const totalDue = rentalAmount + depositAmount;

  return (
    <div style={{
      background: "#0f172a", borderRadius: "20px", padding: "28px",
      color: "white", display: "flex", flexDirection: "column", gap: "20px",
    }}>
      <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "#64748b", textTransform: "uppercase" }}>
        Rental Summary
      </p>

      {/* Bike */}
      <div style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
        {bike.image_url && (
          <div style={{ aspectRatio: "16/9", overflow: "hidden" }}>
            <img src={bike.image_url} alt={bike.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <div style={{ padding: "14px" }}>
          <p style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>{bike.name}</p>
          <p style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>{bike.b_code}</p>
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
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
            <span style={{ color: "#64748b" }}>Plan</span>
            <span style={{ fontWeight: 600 }}>{selectedPlan.label}</span>
          </div>
        )}
        {selectedPlan && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
            <span style={{ color: "#64748b" }}>
              {selectedPlan.id === "weekly" ? "First payment" : "Rental amount"}
            </span>
            <span style={{ fontWeight: 600 }}>€{rentalAmount}</span>
          </div>
        )}
        {depositAmount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
            <span style={{ color: "#64748b" }}>Deposit (refundable)</span>
            <span style={{ fontWeight: 600 }}>€{depositAmount}</span>
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
              <p style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                Then €45/week for the remaining 3 weeks of your month.
              </p>
            )}
          </>
        )}
      </div>

      {/* Trust badges */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px" }}>
        {["€50 deposit refunded on return", "Admin-verified before activation", "Direct WhatsApp admin support"].map((t) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#94a3b8" }}>
            <ShieldCheck size={13} style={{ color: "#22c55e", flexShrink: 0 }} />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CheckoutFlow({ bike, profile, user, siteSettings = {}, isReturningCustomer = false }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rentalId, setRentalId] = useState(null);
  const [copied, setCopied] = useState(false);

  // Form state
  const [startDate, setStartDate] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");

  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId);
  const depositAmount = isReturningCustomer ? 0 : 50;
  const totalDue = (selectedPlan?.price || 0) + depositAmount;

  // Today's date string for min attribute
  const todayStr = new Date().toISOString().split("T")[0];

  // WhatsApp link
  const rawNumber = (siteSettings.whatsapp_number || "+37060291367").replace(/\D/g, "");
  const bikeRef = `FHUB-${bike.b_code}`;
  const waMessage = encodeURIComponent(
    `Hi Foreigners Hub! I just submitted a bike rental payment.\n\nRental ID: ${rentalId || "pending"}\nBike: ${bike.name} (${bikeRef})\nPlan: ${selectedPlan?.label || ""}\n\nPlease find my payment confirmation attached.`
  );
  const waLink = rawNumber
    ? `https://wa.me/${rawNumber}?text=${waMessage}`
    : `https://wa.me/?text=${waMessage}`;

  // Payment account details
  const paymentDetails = {
    Bank: siteSettings.payment_account_bank || "—",
    "Account name": siteSettings.payment_account_name || "FOREIGNERS HUB",
    "IBAN / Account no.": siteSettings.payment_account_iban || "—",
    ...(siteSettings.payment_account_bic ? { "BIC / SWIFT": siteSettings.payment_account_bic } : {}),
    Reference: bikeRef,
  };

  function copyRef() {
    navigator.clipboard.writeText(bikeRef).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Step navigation ─────────────────────────────────────────────────────────
  async function handleNext() {
    setError("");

    if (step === 1) {
      if (!startDate) { setError("Please choose a start date."); return; }
      setStep(2);
    } else if (step === 2) {
      if (!selectedPlanId) { setError("Please select a payment plan."); return; }
      setStep(3);
    } else if (step === 3) {
      // Create rental record
      setLoading(true);
      try {
        const result = await createRentalRequest({
          bikeId: bike.id,
          planType: selectedPlanId,
          startDate,
          isReturningCustomer,
        });
        setRentalId(result.rentalId);
        setStep(4);
      } catch (err) {
        setError(err.message || "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleConfirmPayment() {
    setLoading(true);
    setError("");
    try {
      await submitPayment({ rentalId, paymentReference: bikeRef });
      setStep(5);
    } catch (err) {
      setError(err.message || "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }} className="checkout-grid">
      <style>{`
        @media (min-width: 900px) {
          .checkout-grid { grid-template-columns: 1fr 340px !important; }
          .checkout-sidebar-order { order: 2; }
          .checkout-main-order { order: 1; }
        }
      `}</style>

      {/* Main panel */}
      <div className="checkout-main-order" style={{
        background: "white", borderRadius: "20px",
        padding: "32px 28px", border: "1px solid #e8edf5",
      }}>
        {step < 5 && <StepBar current={step} />}

        {/* ── STEP 1: Start date ── */}
        {step === 1 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <CalendarDays size={22} style={{ color: "#315cff" }} />
              <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>When do you want to start?</h1>
            </div>
            <p style={{ color: "#64748b", marginBottom: "28px", fontSize: "14px" }}>
              Choose the date you'd like your rental to begin. This is when we'll schedule your bike pickup.
            </p>

            <div style={{ marginBottom: "28px" }}>
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
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{
              display: "flex", alignItems: "flex-start", gap: "10px",
              background: "#f0f9ff", borderRadius: "12px", padding: "14px", marginBottom: "28px",
            }}>
              <ShieldCheck size={16} style={{ color: "#0284c7", flexShrink: 0, marginTop: "2px" }} />
              <p style={{ fontSize: "13px", color: "#0369a1" }}>
                Your rental won't start until your payment is verified and a bike is assigned by our team.
                The start date you pick is your <strong>preferred</strong> date.
              </p>
            </div>

            {error && <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "16px" }}>{error}</p>}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={() => router.push(`/bikes/${bike.id}`)}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#64748b", fontWeight: 600, fontSize: "14px", background: "none" }}
              >
                <ArrowLeft size={15} /> Back to bike
              </button>
              <button
                onClick={handleNext}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  background: "#315cff", color: "white", fontWeight: 700,
                  padding: "12px 24px", borderRadius: "12px", fontSize: "15px",
                }}
              >
                Choose plan <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Plan selection ── */}
        {step === 2 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <CreditCard size={22} style={{ color: "#315cff" }} />
              <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>Choose your payment plan</h1>
            </div>
            <p style={{ color: "#64748b", marginBottom: "28px", fontSize: "14px" }}>
              Both plans cover <strong>1 full month</strong> of riding. The difference is only how you pay.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "24px" }}>
              {PLANS.map((plan) => {
                const active = selectedPlanId === plan.id;
                return (
                  <button
                    key={plan.id}
                    onClick={() => { setSelectedPlanId(plan.id); setError(""); }}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "flex-start",
                      textAlign: "left", padding: "20px", borderRadius: "16px",
                      border: active ? "2px solid #315cff" : "1.5px solid #e2e8f0",
                      background: active ? "#f0f4ff" : "white",
                      transition: "all 0.2s", cursor: "pointer", position: "relative",
                    }}
                  >
                    <div style={{
                      display: "inline-flex", alignItems: "center",
                      background: active ? "#315cff" : "#f1f5f9",
                      color: active ? "white" : "#64748b",
                      fontSize: "10px", fontWeight: 700, padding: "3px 8px",
                      borderRadius: "20px", marginBottom: "10px", letterSpacing: "0.05em",
                    }}>
                      {plan.tag}
                    </div>
                    <p style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>{plan.label}</p>
                    <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "10px" }}>{plan.sublabel}</p>
                    <p style={{ fontSize: "28px", fontWeight: 800, color: active ? "#315cff" : "#0f172a" }}>
                      €{plan.price}
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#64748b", marginLeft: "4px" }}>
                        {plan.id === "weekly" ? "/ week" : "/ month"}
                      </span>
                    </p>
                    <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>{plan.description}</p>
                    {active && (
                      <div style={{
                        position: "absolute", top: "14px", right: "14px",
                        width: "20px", height: "20px", borderRadius: "50%",
                        background: "#315cff", display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Check size={12} color="white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {!isReturningCustomer && (
              <div style={{
                display: "flex", gap: "10px", background: "#fffbeb", borderRadius: "12px",
                padding: "14px", border: "1px solid #fde68a", marginBottom: "24px",
              }}>
                <ShieldCheck size={16} style={{ color: "#d97706", flexShrink: 0, marginTop: "2px" }} />
                <p style={{ fontSize: "13px", color: "#92400e" }}>
                  As a new customer, a <strong>€50 refundable deposit</strong> will be added to your first payment.
                  It is returned when you hand back the bike in good condition.
                </p>
              </div>
            )}

            {isReturningCustomer && (
              <div style={{
                display: "flex", gap: "10px", background: "#f0fdf4", borderRadius: "12px",
                padding: "14px", border: "1px solid #bbf7d0", marginBottom: "24px",
              }}>
                <Check size={16} style={{ color: "#16a34a", flexShrink: 0, marginTop: "2px" }} />
                <p style={{ fontSize: "13px", color: "#166534" }}>
                  Welcome back! As a returning customer, <strong>no deposit is required</strong>.
                </p>
              </div>
            )}

            {error && <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "16px" }}>{error}</p>}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={() => { setError(""); setStep(1); }} style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#64748b", fontWeight: 600, fontSize: "14px", background: "none" }}>
                <ArrowLeft size={15} /> Back
              </button>
              <button
                onClick={handleNext}
                disabled={!selectedPlanId}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  background: selectedPlanId ? "#315cff" : "#e2e8f0",
                  color: selectedPlanId ? "white" : "#94a3b8",
                  fontWeight: 700, padding: "12px 24px", borderRadius: "12px", fontSize: "15px",
                }}
              >
                Review rental <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Review ── */}
        {step === 3 && (
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>Review your rental</h1>
            <p style={{ color: "#64748b", marginBottom: "28px", fontSize: "14px" }}>
              Please confirm everything looks correct before proceeding.
            </p>

            <div style={{ borderRadius: "14px", border: "1.5px solid #e2e8f0", overflow: "hidden", marginBottom: "24px" }}>
              {[
                ["Bike", `${bike.name} (${bike.b_code})`],
                ["Start date", new Date(startDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })],
                ["Duration", "1 month (minimum)"],
                ["Payment plan", selectedPlan?.label],
                ...(selectedPlan?.id === "weekly" ? [["Weekly amount", "€45 / week × 4 weeks"]] : []),
                ...(depositAmount > 0 ? [["Refundable deposit", `€${depositAmount} (new customer)`]] : []),
                ["—", "—"],
                ["Total due now", `€${totalDue}`],
              ].map(([label, value], i) =>
                label === "—" ? (
                  <div key={i} style={{ borderTop: "1.5px solid #e2e8f0" }} />
                ) : (
                  <div key={label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "13px 18px", borderBottom: "1px solid #f1f5f9",
                    background: i % 2 === 0 ? "white" : "#fafbff",
                  }}>
                    <span style={{ fontSize: "13px", color: "#64748b" }}>{label}</span>
                    <span style={{
                      fontSize: label === "Total due now" ? "16px" : "13px",
                      fontWeight: label === "Total due now" ? 800 : 600,
                      color: label === "Total due now" ? "#315cff" : "#0f172a",
                    }}>
                      {value}
                    </span>
                  </div>
                )
              )}
            </div>

            <div style={{
              background: "#f8fafc", borderRadius: "12px", padding: "14px",
              border: "1px solid #e2e8f0", marginBottom: "28px",
            }}>
              <p style={{ fontSize: "12px", color: "#64748b" }}>
                By proceeding, you're requesting a bike rental. Your rental won't become active until 
                our team verifies your payment and assigns a bike to you. You'll receive an email at each stage.
              </p>
            </div>

            {error && <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "16px" }}>{error}</p>}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={() => { setError(""); setStep(2); }} style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#64748b", fontWeight: 600, fontSize: "14px", background: "none" }}>
                <ArrowLeft size={15} /> Back
              </button>
              <button
                onClick={handleNext}
                disabled={loading}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  background: "#315cff", color: "white", fontWeight: 700,
                  padding: "12px 24px", borderRadius: "12px", fontSize: "15px",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Creating rental...</> : <>Proceed to payment <ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Payment ── */}
        {step === 4 && (
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>Make your payment</h1>
            <p style={{ color: "#64748b", marginBottom: "28px", fontSize: "14px" }}>
              Transfer <strong>€{totalDue}</strong> to our account using the details below, then confirm below.
            </p>

            {/* Bank details */}
            <div style={{
              borderRadius: "14px", border: "1.5px solid #fed7aa",
              background: "#fff7ed", padding: "20px", marginBottom: "20px",
            }}>
              <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: "#92400e", marginBottom: "14px", textTransform: "uppercase" }}>
                Bank transfer details
              </p>
              {Object.entries(paymentDetails).map(([key, val]) => (
                <div key={key} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 0", borderBottom: "1px solid #fed7aa",
                }}>
                  <span style={{ fontSize: "13px", color: "#78350f" }}>{key}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", fontFamily: key === "IBAN / Account no." || key === "BIC / SWIFT" || key === "Reference" ? "monospace" : "inherit" }}>
                      {val}
                    </span>
                    {key === "Reference" && (
                      <button onClick={copyRef} title="Copy reference" style={{ background: "none", padding: "2px" }}>
                        {copied ? <Check size={13} style={{ color: "#16a34a" }} /> : <Copy size={13} style={{ color: "#94a3b8" }} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                background: "#25d366", color: "white", fontWeight: 700, fontSize: "15px",
                padding: "14px 20px", borderRadius: "14px", textDecoration: "none",
                marginBottom: "20px",
              }}
            >
              <MessageCircle size={18} />
              Send payment screenshot via WhatsApp
              <ExternalLink size={14} style={{ opacity: 0.7 }} />
            </a>

            <div style={{
              background: "#f0f9ff", borderRadius: "12px", padding: "14px",
              border: "1px solid #bae6fd", marginBottom: "24px",
            }}>
              <p style={{ fontSize: "13px", color: "#0369a1" }}>
                After transferring, click the WhatsApp button above to send us a screenshot of your payment.
                Then click the button below to confirm. Our team will verify it and email you within a few hours.
              </p>
            </div>

            {error && <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "16px" }}>{error}</p>}

            <button
              onClick={handleConfirmPayment}
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                width: "100%", background: "#0f172a", color: "white", fontWeight: 700,
                fontSize: "15px", padding: "14px 20px", borderRadius: "14px",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Confirming...</>
                : <><Check size={16} /> I've sent the payment</>
              }
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── STEP 5: Success ── */}
        {step === 5 && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              background: "#f0fdf4", border: "2px solid #bbf7d0",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
            }}>
              <CheckCircle2 size={36} style={{ color: "#16a34a" }} />
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", marginBottom: "10px" }}>
              Payment submitted!
            </h1>
            <p style={{ color: "#64748b", fontSize: "15px", maxWidth: "420px", margin: "0 auto 12px", lineHeight: "1.7" }}>
              We've received your request. Our team will verify your payment and you'll receive an email at every step:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "360px", margin: "0 auto 32px", textAlign: "left" }}>
              {[
                "Payment verified by our team",
                "Bike assigned + pickup time confirmed",
                "Contract available to sign on your dashboard",
                "Rental officially starts",
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <div style={{
                    width: "22px", height: "22px", borderRadius: "50%",
                    background: "#f0f4ff", border: "1.5px solid #c7d7ff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, fontSize: "11px", fontWeight: 700, color: "#315cff",
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: "13px", color: "#374151", lineHeight: "1.5", marginTop: "2px" }}>{step}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "24px" }}>
              A confirmation email has been sent to <strong>{user.email}</strong>
            </p>

            <Link
              href="/dashboard"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "#315cff", color: "white", fontWeight: 700,
                padding: "13px 28px", borderRadius: "14px", textDecoration: "none", fontSize: "15px",
              }}
            >
              Go to my dashboard <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="checkout-sidebar-order" style={{ display: "flex", flexDirection: "column" }}>
        <Sidebar
          bike={bike}
          selectedPlan={selectedPlan}
          startDate={startDate}
          isReturningCustomer={isReturningCustomer}
        />
      </div>
    </div>
  );
}
