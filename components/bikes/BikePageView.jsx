"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  ShieldCheck,
  Wrench,
  Headphones,
  BellRing,
  Clock,
  CheckCircle,
  Calendar,
  CreditCard,
  Package,
  Sparkles,
  Smartphone,
  MapPin,
  Shield,
  HelpCircle,
} from "lucide-react";
import BikeRequestModal from "./BikeRequestModal";

const INCLUDED_FEATURES = [
  {
    icon: Wrench,
    title: "Free Maintenance",
    desc: "Complete repair support throughout your rental. Free brake adjustments, tube replacements, and tune-ups.",
  },
  {
    icon: ShieldCheck,
    title: "Safety-Certified Helmet",
    desc: "Safety-tested, comfortable helmet included at no extra charge to keep you safe on the road.",
  },
  {
    icon: Smartphone,
    title: "Phone Holder",
    desc: "Sturdy, shock-resistant handlebar smartphone mount ideal for city navigation or courier work.",
  },
  {
    icon: MapPin,
    title: "GPS Tracker",
    desc: "Built-in GPS security tracker installed on every bike for theft prevention and peace of mind.",
  },
  {
    icon: Headphones,
    title: "Human Support",
    desc: "Direct support from real people. Instant assistance available via WhatsApp and phone whenever you need it.",
  },
  {
    icon: Calendar,
    title: "Minimum 1 Month Term",
    desc: "Stable, student-friendly rental term of at least 1 month with flexible weekly or upfront payment options.",
  },
];

const PLANS = [
  {
    id: "weekly",
    tag: "Flexible",
    label: "Pay weekly",
    sub: "Spread the cost across 4 weekly payments",
    price: "€45",
    period: "/ week",
    highlight: false,
    badgeColor: "#64748b",
  },
  {
    id: "monthly",
    tag: "Save €10",
    label: "Pay at once",
    sub: "One simple upfront payment for the full month",
    price: "€170",
    period: "/ month",
    highlight: true,
    badgeColor: "#315cff",
  },
];

const DELAYED_PAYMENT_POINTS = [
  {
    icon: BellRing,
    title: "Advance Reminders",
    desc: "We send friendly reminders via WhatsApp and email 3 days and 1 day before any payment is due.",
  },
  {
    icon: Clock,
    title: "48-Hour Grace Period",
    desc: "If your payment is delayed, you have a 48-hour grace window to settle your account without immediate service interruption.",
  },
  {
    icon: Headphones,
    title: "Direct WhatsApp Communication",
    desc: "Need an extra couple of days? Just let our admin know on WhatsApp. We believe in flexible, human communication.",
  },
  {
    icon: CheckCircle,
    title: "Hassle-Free Extensions",
    desc: "Easily extend your rental or return the bike at the end of your term with zero surprise fees.",
  },
];

const SPECS = [
  ["Type", "City / commuter bike"],
  ["Gears", "7-speed Shimano gear system"],
  ["Frame", "Lightweight aluminium alloy"],
  ["Brakes", "Reliable front & rear V-brakes"],
  ["Accessories", "Helmet, lock, LED lights, phone holder"],
  ["Security", "GPS tracking unit & heavy-duty lock"],
  ["Condition", "Thoroughly inspected before every rental"],
];

export default function BikePageView({ siteSettings = {}, currentUser = null }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [preselectedPlan, setPreselectedPlan] = useState("weekly");

  function openRequestModal(plan = "weekly") {
    setPreselectedPlan(plan);
    setModalOpen(true);
  }

  return (
    <div style={{ background: "var(--fh-off-white, #f8fafc)" }}>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section style={{ background: "white", borderBottom: "1px solid #e8edf5" }}>
        <div className="container mx-auto px-4 md:px-8 py-14 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Copy */}
            <div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  background: "#f0fdf4",
                  color: "#16a34a",
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "5px 13px",
                  borderRadius: "20px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: "20px",
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "#16a34a",
                  }}
                />
                Bike Rental · Vilnius
              </span>

              <h1
                style={{
                  fontSize: "clamp(34px, 5vw, 50px)",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1.18,
                  marginBottom: "18px",
                }}
              >
                A reliable city bike, <br />
                <span style={{ color: "#315cff" }}>assigned just for you.</span>
              </h1>

              <p
                style={{
                  fontSize: "16px",
                  color: "#475569",
                  lineHeight: 1.75,
                  marginBottom: "28px",
                  maxWidth: "500px",
                }}
              >
                Reliable city commuting in Vilnius made simple. Every bike is fully serviced, equipped with all essentials, and backed by personal support throughout your rental.
              </p>

              {/* Quick Feature Pills */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: "36px",
                }}
              >
                {[
                  "Maintenance included",
                  "Helmet & phone holder",
                  "GPS tracker",
                  "Human support",
                  "Min. 1 month term",
                ].map((f) => (
                  <span
                    key={f}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#f1f5f9",
                      color: "#334155",
                      fontSize: "13px",
                      fontWeight: 600,
                      padding: "6px 14px",
                      borderRadius: "20px",
                    }}
                  >
                    <Check size={13} style={{ color: "#16a34a" }} /> {f}
                  </span>
                ))}
              </div>

              {/* Action Button */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <button
                  onClick={() => openRequestModal("weekly")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "#315cff",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "16px",
                    padding: "15px 32px",
                    borderRadius: "14px",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 8px 22px rgba(49, 92, 255, 0.28)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  Request a bike <ArrowRight size={17} />
                </button>

                <span style={{ fontSize: "14px", color: "#64748b", fontWeight: 500 }}>
                  From <strong>€45/week</strong> · 1 month minimum
                </span>
              </div>
            </div>

            {/* Bike Visual */}
            <div>
              <div
                style={{
                  borderRadius: "24px",
                  overflow: "hidden",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
                  background: "#ffffff",
                }}
              >
                <img
                  src="/images/engwe-m20.jpg"
                  alt="Foreigners Hub City Rental Bike"
                  style={{
                    width: "100%",
                    height: "380px",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── What is Included in the Price ─────────────────── */}
      <section style={{ background: "#ffffff", borderBottom: "1px solid #e8edf5" }}>
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-20">
          <div style={{ textAlign: "center", maxWidth: "640px", margin: "0 auto 48px" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "#315cff",
                textTransform: "uppercase",
                display: "inline-block",
                marginBottom: "10px",
              }}
            >
              All-Inclusive Pricing
            </span>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 38px)",
                fontWeight: 800,
                color: "#0f172a",
                lineHeight: 1.2,
                marginBottom: "14px",
              }}
            >
              What is included in the price
            </h2>
            <p style={{ fontSize: "16px", color: "#64748b", lineHeight: 1.7 }}>
              No hidden add-ons. Everything you need to commute comfortably, safely, and legally is bundled with every bike rental.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "24px",
              maxWidth: "1100px",
              margin: "0 auto",
            }}
          >
            {INCLUDED_FEATURES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  style={{
                    background: "#f8fafc",
                    borderRadius: "20px",
                    padding: "28px 24px",
                    border: "1.5px solid #e2e8f0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: "46px",
                      height: "46px",
                      borderRadius: "14px",
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#315cff",
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: "17px",
                        fontWeight: 700,
                        color: "#0f172a",
                        marginBottom: "6px",
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#64748b",
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Pricing Section ───────────────────────────────── */}
      <section style={{ background: "#f8fafc", borderBottom: "1px solid #e8edf5" }}>
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-20">
          <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 44px" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "#315cff",
                textTransform: "uppercase",
                marginBottom: "10px",
                display: "inline-block",
              }}
            >
              Rental Plans
            </span>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 36px)",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "12px",
              }}
            >
              Choose how you pay
            </h2>
            <p style={{ fontSize: "15px", color: "#64748b", lineHeight: 1.7 }}>
              Both options cover <strong>1 full month (minimum)</strong> of riding. Choose whether to spread payments weekly or pay at once upfront.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
              maxWidth: "760px",
              margin: "0 auto 32px",
            }}
          >
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                style={{
                  borderRadius: "22px",
                  padding: "32px 28px",
                  border: plan.highlight ? "2.5px solid #315cff" : "1.5px solid #cbd5e1",
                  background: plan.highlight ? "#eff6ff" : "#ffffff",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: plan.highlight
                    ? "0 12px 30px rgba(49, 92, 255, 0.12)"
                    : "0 4px 14px rgba(0,0,0,0.04)",
                }}
              >
                <div>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      background: plan.highlight ? "#315cff" : "#f1f5f9",
                      color: plan.highlight ? "white" : "#475569",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      marginBottom: "16px",
                    }}
                  >
                    {plan.tag}
                  </span>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>
                    {plan.label}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
                    {plan.sub}
                  </p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "24px" }}>
                    <span
                      style={{
                        fontSize: "42px",
                        fontWeight: 800,
                        color: plan.highlight ? "#1d4ed8" : "#0f172a",
                      }}
                    >
                      {plan.price}
                    </span>
                    <span style={{ fontSize: "14px", color: "#64748b", fontWeight: 600 }}>
                      {plan.period}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => openRequestModal(plan.id)}
                  style={{
                    width: "100%",
                    padding: "14px 20px",
                    borderRadius: "14px",
                    border: "none",
                    background: plan.highlight ? "#315cff" : "#0f172a",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "15px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  Request a bike <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Deposit Note */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "16px",
              padding: "18px 22px",
              maxWidth: "760px",
              margin: "0 auto",
            }}
          >
            <ShieldCheck size={18} style={{ color: "#d97706", flexShrink: 0, marginTop: "2px" }} />
            <p style={{ fontSize: "13px", color: "#92400e", lineHeight: 1.65, margin: 0 }}>
              <strong>Refundable Security Deposit:</strong> New customers provide a <strong>€50 refundable deposit</strong> with their first payment. This deposit is returned when the bike is handed back in good working condition. Returning customers are deposit-exempt.
            </p>
          </div>
        </div>
      </section>

      {/* ── Payment Reminders & Delayed Payment Policy ────── */}
      <section style={{ background: "#ffffff", borderBottom: "1px solid #e8edf5" }}>
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-20">
          <div style={{ textAlign: "center", maxWidth: "640px", margin: "0 auto 48px" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "#315cff",
                textTransform: "uppercase",
                marginBottom: "10px",
                display: "inline-block",
              }}
            >
              Peace of Mind
            </span>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 36px)",
                fontWeight: 800,
                color: "#0f172a",
                lineHeight: 1.25,
                marginBottom: "14px",
              }}
            >
              Payment reminders & delayed payments
            </h2>
            <p style={{ fontSize: "15px", color: "#64748b", lineHeight: 1.7 }}>
              Here is how payment reminders and delayed payments work so you never have to worry about unexpected surprises.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
              maxWidth: "1050px",
              margin: "0 auto 36px",
            }}
          >
            {DELAYED_PAYMENT_POINTS.map((pt) => {
              const Icon = pt.icon;
              return (
                <div
                  key={pt.title}
                  style={{
                    background: "#f8fafc",
                    borderRadius: "18px",
                    padding: "24px",
                    border: "1.5px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      background: "#eff6ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#315cff",
                      marginBottom: "14px",
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
                    {pt.title}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6, margin: 0 }}>
                    {pt.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Friendly Note */}
          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto",
              background: "#f0fdf4",
              borderRadius: "16px",
              padding: "20px 24px",
              border: "1px solid #bbf7d0",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "14px", color: "#166534", lineHeight: 1.6, margin: 0 }}>
              💡 <strong>Our policy is simple:</strong> We value transparency and student support. As long as you keep us informed via WhatsApp, we are always happy to coordinate flexible payment arrangements.
            </p>
          </div>
        </div>
      </section>

      {/* ── Technical Bike Specifications ─────────────────── */}
      <section style={{ background: "#0f172a", color: "white" }}>
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                  display: "inline-block",
                }}
              >
                Bike Specifications
              </span>
              <h2 style={{ fontSize: "32px", fontWeight: 800, color: "white", marginBottom: "16px" }}>
                Built for daily city commuting
              </h2>
              <p style={{ fontSize: "15px", color: "#94a3b8", lineHeight: 1.75, marginBottom: "32px" }}>
                Every bike in our fleet is checked, oiled, and safety-tested before handover. Designed specifically to handle Vilnius pavements, bike lanes, and cobblestone streets with ease.
              </p>

              <button
                onClick={() => openRequestModal("weekly")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "#315cff",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "15px",
                  padding: "14px 28px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Request a bike <ArrowRight size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {SPECS.map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "13px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span style={{ fontSize: "14px", color: "#64748b" }}>{label}</span>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "white" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────── */}
      <section style={{ background: "white", borderTop: "1px solid #e8edf5" }}>
        <div className="container mx-auto px-4 md:px-8 py-14 md:py-18 text-center">
          <h2 style={{ fontSize: "30px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
            Ready to get moving in Vilnius?
          </h2>
          <p style={{ fontSize: "15px", color: "#64748b", maxWidth: "520px", margin: "0 auto 28px", lineHeight: 1.65 }}>
            Submit your bike request in under 60 seconds. Our team will contact you right away to arrange pickup.
          </p>

          <button
            onClick={() => openRequestModal("weekly")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "#315cff",
              color: "white",
              fontWeight: 700,
              fontSize: "16px",
              padding: "16px 36px",
              borderRadius: "14px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 10px 25px rgba(49, 92, 255, 0.28)",
            }}
          >
            Request a bike <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* ── Request Modal ─────────────────────────────────── */}
      <BikeRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialPlan={preselectedPlan}
        currentUser={currentUser}
        whatsappNumber={siteSettings.whatsapp_number || "+37060291367"}
      />
    </div>
  );
}
