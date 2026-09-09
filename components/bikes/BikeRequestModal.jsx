"use client";

import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  CreditCard,
  User,
  Mail,
  Phone,
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import { guestSubmitRental } from "@/app/actions/rental";

const PLANS = [
  {
    id: "weekly",
    title: "Weekly",
    sub: "Spread the cost weekly",
    price: "€45",
    period: "/ week",
    tag: "Flexible",
    note: "€45 per week over 4 weeks (1 month min.)",
  },
  {
    id: "monthly",
    title: "Pay at once",
    sub: "Pay upfront for full month",
    price: "€170",
    period: "/ month",
    tag: "Save €10",
    note: "Pay once and ride for 1 full month",
  },
];

export default function BikeRequestModal({
  isOpen,
  onClose,
  initialPlan = "weekly",
  currentUser = null,
  whatsappNumber = "+37060000000",
}) {
  const todayStr = new Date().toISOString().split("T")[0];

  const [dateChoice, setDateChoice] = useState("today"); // "today" | "custom"
  const [customDate, setCustomDate] = useState("");
  const [planType, setPlanType] = useState(initialPlan || "weekly");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.email) setEmail(currentUser.email);
    }
  }, [currentUser]);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setSuccess(false);
      // default customDate to tomorrow if they pick custom
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setCustomDate(tomorrow.toISOString().split("T")[0]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const effectiveDate = dateChoice === "today" ? todayStr : customDate;
  const cleanPhone = (whatsappNumber || "").replace(/\D/g, "");
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Hi Foreigners Hub! I just submitted a bike rental request.\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nPlan: ${planType === "weekly" ? "Weekly (€45/wk)" : "Pay at once (€170/mo)"}\nStart date: ${effectiveDate}`
      )}`
    : `https://wa.me/?text=${encodeURIComponent(
        `Hi Foreigners Hub! I just submitted a bike rental request for ${name}.`
      )}`;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your phone number so we can contact you.");
      return;
    }
    if (dateChoice === "custom" && !customDate) {
      setError("Please select your preferred start date.");
      return;
    }

    setLoading(true);

    try {
      await guestSubmitRental({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        planType,
        startDate: effectiveDate,
      });

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleModalClose() {
    setSuccess(false);
    setError("");
    onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleModalClose();
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "540px",
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 25px 60px rgba(15, 23, 42, 0.25)",
          border: "1px solid #e2e8f0",
          position: "relative",
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleModalClose}
          style={{
            position: "absolute",
            top: "18px",
            right: "18px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "#f1f5f9",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#64748b",
            transition: "all 0.2s",
            zIndex: 10,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* ── SUCCESS POPUP STATE ── */}
        {success ? (
          <div style={{ padding: "40px 28px", textAlign: "center" }}>
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
              Confirmed
            </span>

            <h2
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "8px",
                lineHeight: 1.25,
              }}
            >
              Request Sent Successfully.
            </h2>
            <p
              style={{
                fontSize: "16px",
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
                padding: "18px 20px",
                border: "1px solid #e2e8f0",
                textAlign: "left",
                marginBottom: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "13px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Customer:</span>
                <strong style={{ color: "#0f172a" }}>{name}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Phone:</span>
                <strong style={{ color: "#0f172a" }}>{phone}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Payment Plan:</span>
                <strong style={{ color: "#0f172a" }}>
                  {planType === "weekly" ? "Weekly (€45/wk)" : "Pay at once (€170/mo)"}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Start Date:</span>
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

            <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6, marginBottom: "24px" }}>
              Our team will review your request, verify availability, and reach out via WhatsApp or phone to confirm your pickup details.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <a
                href={waUrl}
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
                  boxShadow: "0 6px 18px rgba(37, 211, 102, 0.35)",
                }}
              >
                <MessageCircle size={18} />
                Chat with Admin on WhatsApp
              </a>

              <button
                onClick={handleModalClose}
                style={{
                  padding: "12px 20px",
                  borderRadius: "14px",
                  border: "1.5px solid #e2e8f0",
                  background: "#ffffff",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* ── REQUEST FORM ── */
          <form onSubmit={handleSubmit} style={{ padding: "32px 28px" }}>
            {/* Header */}
            <div style={{ marginBottom: "22px" }}>
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
                <Sparkles size={11} /> Easy 1-Minute Booking
              </span>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1.2,
                }}
              >
                Request a bike
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                Select your start date, plan, and contact info. Our team will contact you to confirm pickup.
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
                1. Select preferred date
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                {/* Option: Today */}
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
                    transition: "all 0.2s",
                  }}
                >
                  <Calendar size={15} style={{ color: dateChoice === "today" ? "#315cff" : "#94a3b8" }} />
                  Today
                </button>

                {/* Option: Other dates */}
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
                    transition: "all 0.2s",
                  }}
                >
                  <Calendar size={15} style={{ color: dateChoice === "custom" ? "#315cff" : "#94a3b8" }} />
                  Choose other date
                </button>
              </div>

              {/* Custom Date Input */}
              {dateChoice === "custom" && (
                <div style={{ marginTop: "8px" }}>
                  <input
                    type="date"
                    min={todayStr}
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    required={dateChoice === "custom"}
                    style={{
                      width: "100%",
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
                </div>
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
                  const isSelected = planType === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setPlanType(plan.id)}
                      style={{
                        borderRadius: "14px",
                        padding: "14px 16px",
                        border: isSelected ? "2px solid #315cff" : "1.5px solid #e2e8f0",
                        background: isSelected ? "#eff6ff" : "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          display: "inline-block",
                          fontSize: "10px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          padding: "2px 7px",
                          borderRadius: "999px",
                          background: isSelected ? "#315cff" : "#f1f5f9",
                          color: isSelected ? "#ffffff" : "#64748b",
                          marginBottom: "8px",
                        }}
                      >
                        {plan.tag}
                      </div>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#0f172a",
                          marginBottom: "2px",
                        }}
                      >
                        {plan.title}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "3px",
                          margin: "4px 0",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "22px",
                            fontWeight: 800,
                            color: isSelected ? "#1d4ed8" : "#0f172a",
                          }}
                        >
                          {plan.price}
                        </span>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          {plan.period}
                        </span>
                      </div>
                      <p style={{ fontSize: "11px", color: "#64748b", lineHeight: 1.4 }}>
                        {plan.note}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. YOUR INFORMATION */}
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
                {/* Full Name */}
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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

                {/* Email Address */}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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

                {/* Phone Number */}
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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

            {/* Inclusions Pill / Policy Note */}
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
                <strong>All-inclusive:</strong> Free maintenance, helmet, phone holder, GPS tracker & human support. Minimum rental 1 month. Refundable €50 deposit for new customers.
              </p>
            </div>

            {/* Error message */}
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

            {/* Submit Button */}
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
                transition: "all 0.2s",
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
