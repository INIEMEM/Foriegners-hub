"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Calendar,
  CreditCard,
  ShieldCheck,
  Loader2,
  MessageCircle,
  Bike,
  User,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";
import { guestSubmitRental } from "@/app/actions/rental";

const PLANS = [
  {
    id: "weekly",
    label: "Pay weekly",
    sublabel: "€45 per week over 4 weeks",
    price: 45,
    tag: "Flexible",
    description: "Spread the cost across 4 weekly payments. Minimum rental is 1 month.",
  },
  {
    id: "monthly",
    label: "Pay at once",
    sublabel: "€170 upfront for full month",
    price: 170,
    tag: "Save €10",
    description: "Pay once and ride for the full month without weekly installments.",
  },
];

export default function RentalRequestFlow({ user, siteSettings = {}, isReturningCustomer = false }) {
  const searchParams = useSearchParams();
  const todayStr = new Date().toISOString().split("T")[0];

  const [dateChoice, setDateChoice] = useState(() => (searchParams.get("date") ? "custom" : "today"));
  const [customDate, setCustomDate] = useState(() => searchParams.get("date") || "");
  const [selectedPlanId, setSelectedPlanId] = useState(() => searchParams.get("plan") || "weekly");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState(() => user?.email || "");
  const [guestPhone, setGuestPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[0];
  const effectiveDate = dateChoice === "today" ? todayStr : customDate || todayStr;
  const depositAmount = isReturningCustomer ? 0 : 50;

  const rawNumber = (siteSettings.whatsapp_number || "").replace(/\D/g, "");
  const waMessage = encodeURIComponent(
    `Hi Foreigners Hub! I just submitted a bike rental request.\nName: ${guestName}\nEmail: ${guestEmail}\nPhone: ${guestPhone}\nPlan: ${selectedPlan.label}\nStart date: ${effectiveDate}`
  );
  const waLink = rawNumber
    ? `https://wa.me/${rawNumber}?text=${waMessage}`
    : `https://wa.me/?text=${waMessage}`;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!guestName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!guestEmail || !guestEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!guestPhone.trim()) {
      setError("Please enter your phone number.");
      return;
    }
    if (dateChoice === "custom" && !customDate) {
      setError("Please choose your preferred start date.");
      return;
    }

    setLoading(true);

    try {
      const res = await guestSubmitRental({
        name: guestName.trim(),
        email: guestEmail.trim().toLowerCase(),
        phone: guestPhone.trim(),
        planType: selectedPlanId,
        startDate: effectiveDate,
      });

      if (res && res.success === false) {
        setError(res.error || "Could not complete your request. Please try again.");
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto" }}>
      {/* Back Link */}
      <Link
        href="/bikes"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: "#64748b",
          fontSize: "13px",
          fontWeight: 600,
          textDecoration: "none",
          marginBottom: "20px",
        }}
      >
        <ArrowLeft size={14} /> Back to all bike details
      </Link>

      <div
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          padding: "36px 32px",
          border: "1.5px solid #e2e8f0",
          boxShadow: "0 12px 35px rgba(15, 23, 42, 0.05)",
        }}
      >
        {success ? (
          /* ── SUCCESS POPUP STATE ── */
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div
              style={{
                width: "76px",
                height: "76px",
                borderRadius: "50%",
                background: "#f0fdf4",
                border: "2px solid #bbf7d0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <CheckCircle2 size={42} style={{ color: "#16a34a" }} />
            </div>

            <span
              style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "999px",
                background: "#dcfce7",
                color: "#15803d",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              Request Confirmed
            </span>

            <h1
              style={{
                fontSize: "26px",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "8px",
              }}
            >
              Request Sent Successfully.
            </h1>
            <p
              style={{
                fontSize: "17px",
                fontWeight: 600,
                color: "#315cff",
                marginBottom: "24px",
              }}
            >
              We will contact you soon.
            </p>

            <div
              style={{
                background: "#f8fafc",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid #e2e8f0",
                textAlign: "left",
                marginBottom: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "14px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Customer:</span>
                <strong style={{ color: "#0f172a" }}>{guestName}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Phone:</span>
                <strong style={{ color: "#0f172a" }}>{guestPhone}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Email:</span>
                <strong style={{ color: "#0f172a" }}>{guestEmail}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Plan:</span>
                <strong style={{ color: "#0f172a" }}>
                  {selectedPlan.label} (€{selectedPlan.price}
                  {selectedPlan.id === "weekly" ? "/wk" : "/mo"})
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Preferred Start:</span>
                <strong style={{ color: "#0f172a" }}>
                  {dateChoice === "today"
                    ? "Today"
                    : new Date(effectiveDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                </strong>
              </div>
            </div>

            <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6, marginBottom: "28px" }}>
              Our team has received your request. We will reach out via WhatsApp or phone to confirm bike assignment and pickup timing.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  background: "#25D366",
                  color: "#ffffff",
                  padding: "14px 20px",
                  borderRadius: "14px",
                  fontWeight: 700,
                  fontSize: "15px",
                  textDecoration: "none",
                  boxShadow: "0 6px 20px rgba(37, 211, 102, 0.35)",
                }}
              >
                <MessageCircle size={18} />
                Chat with Admin on WhatsApp
              </a>

              <Link
                href="/bikes"
                style={{
                  display: "inline-block",
                  padding: "13px 20px",
                  borderRadius: "14px",
                  border: "1.5px solid #e2e8f0",
                  background: "#ffffff",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: "14px",
                  textDecoration: "none",
                }}
              >
                Back to Bikes
              </Link>
            </div>
          </div>
        ) : (
          /* ── REQUEST FORM ── */
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "24px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#eff6ff",
                  color: "#2563eb",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: "999px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                <Sparkles size={11} /> 1-Minute Booking
              </span>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1.25,
                }}
              >
                Request a bike rental
              </h1>
              <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
                Select your preferred start date and plan. We will contact you to verify details and arrange handover.
              </p>
            </div>

            {/* 1. PREFERRED DATE */}
            <div style={{ marginBottom: "22px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#1e293b",
                  marginBottom: "8px",
                }}
              >
                1. Select preferred start date
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                <button
                  type="button"
                  onClick={() => setDateChoice("today")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: dateChoice === "today" ? "2px solid #315cff" : "1.5px solid #e2e8f0",
                    background: dateChoice === "today" ? "#eff6ff" : "#ffffff",
                    color: dateChoice === "today" ? "#1d4ed8" : "#475569",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  <Calendar size={15} style={{ color: dateChoice === "today" ? "#315cff" : "#94a3b8" }} />
                  Today
                </button>

                <button
                  type="button"
                  onClick={() => setDateChoice("custom")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: dateChoice === "custom" ? "2px solid #315cff" : "1.5px solid #e2e8f0",
                    background: dateChoice === "custom" ? "#eff6ff" : "#ffffff",
                    color: dateChoice === "custom" ? "#1d4ed8" : "#475569",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  <Calendar size={15} style={{ color: dateChoice === "custom" ? "#315cff" : "#94a3b8" }} />
                  Choose other date
                </button>
              </div>

              {dateChoice === "custom" && (
                <input
                  type="date"
                  min={todayStr}
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  required={dateChoice === "custom"}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px 14px",
                    borderRadius: "12px",
                    border: "1.5px solid #cbd5e1",
                    background: "#f8fafc",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#0f172a",
                    outline: "none",
                  }}
                />
              )}
            </div>

            {/* 2. PAYMENT PLAN */}
            <div style={{ marginBottom: "22px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#1e293b",
                  marginBottom: "8px",
                }}
              >
                2. Select payment plan
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {PLANS.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      style={{
                        borderRadius: "14px",
                        padding: "14px 16px",
                        border: isSelected ? "2px solid #315cff" : "1.5px solid #e2e8f0",
                        background: isSelected ? "#eff6ff" : "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: "10px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          padding: "2px 7px",
                          borderRadius: "999px",
                          background: isSelected ? "#315cff" : "#f1f5f9",
                          color: isSelected ? "#ffffff" : "#64748b",
                          marginBottom: "8px",
                        }}
                      >
                        {plan.tag}
                      </span>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                        {plan.label}
                      </div>
                      <div style={{ fontSize: "22px", fontWeight: 800, color: isSelected ? "#1d4ed8" : "#0f172a", margin: "4px 0" }}>
                        €{plan.price}
                        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
                          {plan.id === "weekly" ? "/wk" : "/mo"}
                        </span>
                      </div>
                      <p style={{ fontSize: "11px", color: "#64748b", lineHeight: 1.4, margin: 0 }}>
                        {plan.sublabel}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. USER INFORMATION */}
            <div style={{ marginBottom: "22px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#1e293b",
                  marginBottom: "8px",
                }}
              >
                3. Input your information
              </label>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ position: "relative" }}>
                  <User
                    size={16}
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                    }}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "11px 14px 11px 40px",
                      borderRadius: "12px",
                      border: "1.5px solid #e2e8f0",
                      fontSize: "14px",
                      color: "#0f172a",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ position: "relative" }}>
                  <Mail
                    size={16}
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                    }}
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email address"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "11px 14px 11px 40px",
                      borderRadius: "12px",
                      border: "1.5px solid #e2e8f0",
                      fontSize: "14px",
                      color: "#0f172a",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ position: "relative" }}>
                  <Phone
                    size={16}
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                    }}
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone number (WhatsApp preferred)"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "11px 14px 11px 40px",
                      borderRadius: "12px",
                      border: "1.5px solid #e2e8f0",
                      fontSize: "14px",
                      color: "#0f172a",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Inclusions Card */}
            <div
              style={{
                background: "#f8fafc",
                borderRadius: "12px",
                padding: "12px 14px",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <ShieldCheck size={16} style={{ color: "#16a34a", flexShrink: 0, marginTop: "2px" }} />
              <p style={{ fontSize: "12px", color: "#475569", lineHeight: 1.5, margin: 0 }}>
                Includes free maintenance, helmet, phone holder, GPS tracker & human support. Minimum 1 month. €50 refundable deposit for new customers.
              </p>
            </div>

            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                  fontSize: "13px",
                  marginBottom: "16px",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px 20px",
                borderRadius: "14px",
                border: "none",
                background: "#315cff",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "15px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 8px 20px rgba(49, 92, 255, 0.3)",
                opacity: loading ? 0.75 : 1,
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                  Sending Request…
                </>
              ) : (
                <>
                  Send a Request <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
