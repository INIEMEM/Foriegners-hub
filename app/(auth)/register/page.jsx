"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  CheckCircle2,
  FileText,
  Loader2,
  Lock,
  Mail,
  Phone,
  Upload,
  User,
  X,
  Sparkles,
} from "lucide-react";
import Logo from "@/components/shared/Logo";
import { validateBikeCode, submitOnboarding } from "@/app/actions/onboarding";
import { createClient } from "@/lib/supabase/client";

function RegisterWizard() {
  const router = useRouter();
  const supabase = createClient();

  // Mode: "new" (new rider at office) | "existing" (rider before website launch)
  const [isExisting, setIsExisting] = useState(false);

  // Current step (1-indexed)
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Credentials & Bike Code
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bikeCode, setBikeCode] = useState("");
  const [bikeVerified, setBikeVerified] = useState(null); // { valid: true, bike: {...} }
  const [verifyingBike, setVerifyingBike] = useState(false);
  const [bikeError, setBikeError] = useState("");

  // Step 2 (Existing only): Rental History
  const [startDate, setStartDate] = useState("");
  const [lastPaymentDate, setLastPaymentDate] = useState("");
  const [planType, setPlanType] = useState("weekly"); // "weekly" | "monthly"

  // Step 3: Residence Permit
  const [permitFront, setPermitFront] = useState(null);
  const [permitFrontPreview, setPermitFrontPreview] = useState(null);
  const [permitBack, setPermitBack] = useState(null);
  const [permitBackPreview, setPermitBackPreview] = useState(null);

  // Step 4: Contract
  const [contractChoice, setContractChoice] = useState("sign_now"); // "sign_now" | "already_signed"
  const [signerName, setSignerName] = useState("");
  const [hasCustomSigner, setHasCustomSigner] = useState(false);
  const [contractFile, setContractFile] = useState(null);
  const [contractFilePreview, setContractFilePreview] = useState(null);

  // Synchronize signerName with fullName from Step 1 until user manually edits it
  useEffect(() => {
    if (!hasCustomSigner) {
      setSignerName(fullName);
    }
  }, [fullName, hasCustomSigner]);

  // Step 5: Payment
  const [paymentChoice, setPaymentChoice] = useState("already_paid"); // "already_paid" | "make_payment"
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [paymentReceiptPreview, setPaymentReceiptPreview] = useState(null);

  // Form states
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [success, setSuccess] = useState(false);

  // Steps total: 5 for new riders, 5 for existing riders (Rental history is integrated smoothly)
  const totalSteps = isExisting ? 5 : 4;

  // Real-time verification of Bike Code
  async function handleVerifyBike() {
    setBikeError("");
    if (!bikeCode.trim()) {
      setBikeError("Please enter a Bike Code.");
      return;
    }
    setVerifyingBike(true);
    try {
      const res = await validateBikeCode(bikeCode.trim());
      if (res.valid) {
        setBikeVerified(res.bike);
        setBikeError("");
      } else {
        setBikeVerified(null);
        setBikeError(res.error || "Bike Code not found in fleet.");
      }
    } catch {
      setBikeError("Could not verify Bike Code. Please try again.");
    } finally {
      setVerifyingBike(false);
    }
  }

  // Handle permit file pickers
  function handlePermitFrontChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPermitFront(file);
    if (file.type.startsWith("image/")) {
      setPermitFrontPreview(URL.createObjectURL(file));
    } else {
      setPermitFrontPreview(file.name);
    }
  }

  function handlePermitBackChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPermitBack(file);
    if (file.type.startsWith("image/")) {
      setPermitBackPreview(URL.createObjectURL(file));
    } else {
      setPermitBackPreview(file.name);
    }
  }

  function handleContractFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setContractFile(file);
    if (file.type.startsWith("image/")) {
      setContractFilePreview(URL.createObjectURL(file));
    } else {
      setContractFilePreview(file.name);
    }
  }

  function handlePaymentReceiptChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPaymentReceipt(file);
    if (file.type.startsWith("image/")) {
      setPaymentReceiptPreview(URL.createObjectURL(file));
    } else {
      setPaymentReceiptPreview(file.name);
    }
  }

  // Step validation before Next >
  function validateStep(step) {
    setGlobalError("");
    if (step === 1) {
      if (!fullName.trim()) {
        setGlobalError("Please enter your full name.");
        return false;
      }
      if (!email.trim() || !email.includes("@")) {
        setGlobalError("Please enter a valid email address.");
        return false;
      }
      if (!phone.trim()) {
        setGlobalError("Please enter your phone number.");
        return false;
      }
      if (!bikeCode.trim()) {
        setGlobalError("Please enter your assigned Bike Code.");
        return false;
      }
      return true;
    }

    if (isExisting && step === 2) {
      if (!startDate) {
        setGlobalError("Please choose when you started renting.");
        return false;
      }
      if (!lastPaymentDate) {
        setGlobalError("Please choose when your last payment was made.");
        return false;
      }
      return true;
    }

    const permitStep = isExisting ? 3 : 2;
    if (step === permitStep) {
      if (!permitFront) {
        setGlobalError("Please upload the front of your Residence Permit.");
        return false;
      }
      if (!permitBack) {
        setGlobalError("Please upload the back of your Residence Permit.");
        return false;
      }
      return true;
    }

    const contractStep = isExisting ? 4 : 3;
    if (step === contractStep) {
      const effectiveSigner = (hasCustomSigner ? signerName : (signerName || fullName)).trim();
      if (contractChoice === "sign_now" && !effectiveSigner) {
        setGlobalError("Please type your full name to electronically sign the contract.");
        return false;
      }
      if (contractChoice === "sign_now" && !signerName.trim() && effectiveSigner) {
        setSignerName(effectiveSigner);
      }
      if (contractChoice === "already_signed" && !contractFile) {
        setGlobalError("Please upload a photo or PDF of your signed contract.");
        return false;
      }
      return true;
    }

    return true;
  }

  function handleNext() {
    if (!validateStep(currentStep)) return;
    setCurrentStep((prev) => prev + 1);
  }

  function handleBack() {
    setGlobalError("");
    setCurrentStep((prev) => Math.max(1, prev - 1));
  }

  // Final submit
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setGlobalError("");
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("isExisting", isExisting ? "true" : "false");
      formData.append("fullName", fullName.trim());
      formData.append("email", email.trim().toLowerCase());
      formData.append("phone", phone.trim());
      formData.append("bikeCode", bikeCode.trim());
      formData.append("planType", planType);

      if (isExisting) {
        formData.append("startDate", startDate);
        formData.append("lastPaymentDate", lastPaymentDate);
      }

      if (permitFront) formData.append("permitFront", permitFront);
      if (permitBack) formData.append("permitBack", permitBack);

      formData.append("contractChoice", contractChoice);
      if (contractChoice === "sign_now") {
        const effectiveSigner = (hasCustomSigner ? signerName : (signerName || fullName)).trim();
        formData.append("signerName", effectiveSigner);
      } else if (contractFile) {
        formData.append("contractFile", contractFile);
      }

      formData.append("paymentChoice", paymentChoice);
      if (paymentReceipt) {
        formData.append("paymentReceipt", paymentReceipt);
      }

      const res = await submitOnboarding(formData);

      if (!res.success) {
        setGlobalError(res.error || "Failed to create account. Please try again.");
        setSubmitting(false);
        return;
      }

      // Auto sign in user with provisioned credentials
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: res.tempPassword,
      });

      if (signInErr) {
        console.warn("Auto-login error:", signInErr);
      }

      setSuccess(true);
      window.setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Submission error:", err);
      setGlobalError(err.message || "An unexpected error occurred. Please try again.");
      setSubmitting(false);
    }
  }

  // Calculations for display
  const planCost = planType === "weekly" ? 45 : 170;
  const deposit = isExisting ? 0 : 50;
  const totalAmount = planCost + deposit;

  return (
    <div style={{ width: "100%", maxWidth: "580px", margin: "0 auto" }}>
      {/* Back to Home / Login */}
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "#64748b",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={15} /> Back to login
        </Link>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#315cff", background: "#f0f4ff", padding: "4px 10px", borderRadius: "999px" }}>
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      <div
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          padding: "36px 32px",
          border: "1.5px solid #e2e8f0",
          boxShadow: "0 12px 35px rgba(15, 23, 42, 0.06)",
        }}
      >
        {success ? (
          <div style={{ textAlign: "center", padding: "30px 10px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#f0fdf4", color: "#16a34a", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <CheckCircle2 size={32} />
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
              Account Created Successfully!
            </h2>
            <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6, marginBottom: "20px" }}>
              Welcome to Foreigners Hub. Your bike rental has been registered. Redirecting you to your dashboard...
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#315cff", fontWeight: 600 }}>
              <Loader2 size={16} className="animate-spin" />
              <span>Loading dashboard...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Track Switcher (Only on Step 1) */}
            {currentStep === 1 && (
              <div style={{ marginBottom: "28px" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
              Select your registration type
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  setIsExisting(false);
                  setPaymentChoice("make_payment");
                  setContractChoice("sign_now");
                }}
                style={{
                  padding: "12px",
                  borderRadius: "14px",
                  border: !isExisting ? "2px solid #315cff" : "1.5px solid #e2e8f0",
                  background: !isExisting ? "#f0f4ff" : "#ffffff",
                  color: !isExisting ? "#1e40af" : "#475569",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.15s ease",
                }}
              >
                <Bike size={18} style={{ color: !isExisting ? "#315cff" : "#94a3b8" }} />
                <span>New Bike Rental</span>
                <span style={{ fontSize: "11px", fontWeight: 500, color: "#64748b" }}>Picking up at office</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsExisting(true);
                  setPaymentChoice("already_paid");
                  setContractChoice("already_signed");
                }}
                style={{
                  padding: "12px",
                  borderRadius: "14px",
                  border: isExisting ? "2px solid #315cff" : "1.5px solid #e2e8f0",
                  background: isExisting ? "#f0f4ff" : "#ffffff",
                  color: isExisting ? "#1e40af" : "#475569",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.15s ease",
                }}
              >
                <Sparkles size={18} style={{ color: isExisting ? "#315cff" : "#94a3b8" }} />
                <span>Existing Rental</span>
                <span style={{ fontSize: "11px", fontWeight: 500, color: "#64748b" }}>Renting before website</span>
              </button>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {globalError && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "12px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              fontSize: "13px",
              fontWeight: 500,
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <X size={16} />
            <span>{globalError}</span>
          </div>
        )}

        {/* ── STEP 1: CREATE ACCOUNT & BIKE CODE ── */}
        {currentStep === 1 && (
          <div>
            <div style={{ marginBottom: "22px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>
                {isExisting ? "Connect your existing rental" : "Create your account"}
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b" }}>
                Enter your credentials and the Bike Code provided by the admin.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Name Surname */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Name &amp; Surname
                </label>
                <div style={{ position: "relative" }}>
                  <User size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
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

              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Email address
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
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
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Phone number
                </label>
                <div style={{ position: "relative" }}>
                  <Phone size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="tel"
                    required
                    placeholder="+370 600 00000"
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

              {/* Passwordless Notice */}
              <div style={{
                background: "#f0fdf4",
                borderRadius: "10px",
                padding: "10px 14px",
                border: "1px solid #bbf7d0",
                fontSize: "12px",
                color: "#166534",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <span>🔒</span>
                <span><strong>Passwordless account:</strong> No password needed. You will sign in anytime using a secure email code.</span>
              </div>

              {/* Bike Code Input with Live Verify */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Bike Code
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <Bike size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. B-ENGWE-001"
                      value={bikeCode}
                      onChange={(e) => {
                        setBikeCode(e.target.value);
                        setBikeVerified(null);
                        setBikeError("");
                      }}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "11px 14px 11px 40px",
                        borderRadius: "12px",
                        border: bikeVerified ? "1.5px solid #22c55e" : "1.5px solid #e2e8f0",
                        fontSize: "14px",
                        color: "#0f172a",
                        fontWeight: 600,
                        outline: "none",
                        textTransform: "uppercase",
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyBike}
                    disabled={verifyingBike || !bikeCode.trim()}
                    style={{
                      padding: "0 16px",
                      borderRadius: "12px",
                      background: "#f1f5f9",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#334155",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {verifyingBike ? <Loader2 size={14} className="animate-spin" /> : "Verify Code"}
                  </button>
                </div>

                {bikeVerified && (
                  <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#16a34a", fontWeight: 600 }}>
                    <CheckCircle2 size={14} />
                    <span>Verified: {bikeVerified.name} (Bike Code: {bikeVerified.bikeCode})</span>
                  </div>
                )}

                {bikeError && (
                  <p style={{ marginTop: "6px", fontSize: "12px", color: "#dc2626", fontWeight: 500 }}>
                    {bikeError}
                  </p>
                )}
                <p style={{ marginTop: "4px", fontSize: "11px", color: "#64748b" }}>
                  Enter the official Bike Code found on your bike frame or provided by our staff.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              style={{
                width: "100%",
                marginTop: "24px",
                padding: "14px",
                borderRadius: "14px",
                background: "#315cff",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "15px",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              Next Step <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ── STEP 2 (EXISTING RIDERS ONLY): RENTAL HISTORY ── */}
        {isExisting && currentStep === 2 && (
          <div>
            <div style={{ marginBottom: "22px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>
                Rental History
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b" }}>
                Provide details of your existing rental so we can accurately sync your account.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* When did you start renting? */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  When did you start renting?
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px 14px",
                    borderRadius: "12px",
                    border: "1.5px solid #e2e8f0",
                    fontSize: "14px",
                    color: "#0f172a",
                    outline: "none",
                  }}
                />
              </div>

              {/* When was your last payment? */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  When was your last payment?
                </label>
                <input
                  type="date"
                  required
                  value={lastPaymentDate}
                  onChange={(e) => setLastPaymentDate(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px 14px",
                    borderRadius: "12px",
                    border: "1.5px solid #e2e8f0",
                    fontSize: "14px",
                    color: "#0f172a",
                    outline: "none",
                  }}
                />
              </div>

              {/* What plan are you on? */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>
                  What plan are you on?
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div
                    onClick={() => setPlanType("weekly")}
                    style={{
                      padding: "14px",
                      borderRadius: "14px",
                      border: planType === "weekly" ? "2px solid #315cff" : "1.5px solid #e2e8f0",
                      background: planType === "weekly" ? "#f0f4ff" : "#ffffff",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>Weekly</p>
                    <p style={{ fontSize: "18px", fontWeight: 800, color: "#315cff", margin: "4px 0" }}>€45</p>
                    <p style={{ fontSize: "11px", color: "#64748b" }}>per week</p>
                  </div>

                  <div
                    onClick={() => setPlanType("monthly")}
                    style={{
                      padding: "14px",
                      borderRadius: "14px",
                      border: planType === "monthly" ? "2px solid #315cff" : "1.5px solid #e2e8f0",
                      background: planType === "monthly" ? "#f0f4ff" : "#ffffff",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>Monthly</p>
                    <p style={{ fontSize: "18px", fontWeight: 800, color: "#315cff", margin: "4px 0" }}>€170</p>
                    <p style={{ fontSize: "11px", color: "#64748b" }}>per month</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                type="button"
                onClick={handleBack}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "14px",
                  background: "#ffffff",
                  border: "1.5px solid #cbd5e1",
                  color: "#475569",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                style={{
                  flex: 2,
                  padding: "14px",
                  borderRadius: "14px",
                  background: "#315cff",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "15px",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                Next: Residence Permit <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 (or 2 for New): RESIDENCE PERMIT ── */}
        {((isExisting && currentStep === 3) || (!isExisting && currentStep === 2)) && (
          <div>
            <div style={{ marginBottom: "22px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>
                Residence Permit
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b" }}>
                Please upload clear photos or PDF scans of the front and back of your residence permit.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Front of Permit */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Front of Permit
                </label>
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px",
                    borderRadius: "16px",
                    border: permitFront ? "2px solid #22c55e" : "2px dashed #cbd5e1",
                    background: permitFront ? "#f0fdf4" : "#f8fafc",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handlePermitFrontChange}
                    style={{ display: "none" }}
                  />
                  {permitFront ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                      <CheckCircle2 size={24} style={{ color: "#22c55e" }} />
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#15803d" }}>Front Uploaded</span>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>{permitFront.name} (Click to change)</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                      <Upload size={22} style={{ color: "#315cff" }} />
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Upload Front (JPG, PNG, PDF)</span>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Max file size 10MB</span>
                    </div>
                  )}
                </label>
              </div>

              {/* Back of Permit */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Back of Permit
                </label>
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px",
                    borderRadius: "16px",
                    border: permitBack ? "2px solid #22c55e" : "2px dashed #cbd5e1",
                    background: permitBack ? "#f0fdf4" : "#f8fafc",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handlePermitBackChange}
                    style={{ display: "none" }}
                  />
                  {permitBack ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                      <CheckCircle2 size={24} style={{ color: "#22c55e" }} />
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#15803d" }}>Back Uploaded</span>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>{permitBack.name} (Click to change)</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                      <Upload size={22} style={{ color: "#315cff" }} />
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Upload Back (JPG, PNG, PDF)</span>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Max file size 10MB</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                type="button"
                onClick={handleBack}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "14px",
                  background: "#ffffff",
                  border: "1.5px solid #cbd5e1",
                  color: "#475569",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                style={{
                  flex: 2,
                  padding: "14px",
                  borderRadius: "14px",
                  background: "#315cff",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "15px",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                Next: Rental Contract <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4 (or 3 for New): CONTRACT ── */}
        {((isExisting && currentStep === 4) || (!isExisting && currentStep === 3)) && (
          <div>
            <div style={{ marginBottom: "22px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>
                Rental Agreement &amp; Contract
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b" }}>
                {isExisting
                  ? "Sign the standard digital agreement or upload proof of your signed paper contract."
                  : "Review the rental agreement and type your full legal name to sign."}
              </p>
            </div>

            {/* Existing user choice */}
            {isExisting && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
                <button
                  type="button"
                  onClick={() => setContractChoice("sign_now")}
                  style={{
                    padding: "12px",
                    borderRadius: "12px",
                    border: contractChoice === "sign_now" ? "2px solid #315cff" : "1.5px solid #e2e8f0",
                    background: contractChoice === "sign_now" ? "#f0f4ff" : "#ffffff",
                    color: contractChoice === "sign_now" ? "#1e40af" : "#475569",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Read &amp; Sign Now
                </button>
                <button
                  type="button"
                  onClick={() => setContractChoice("already_signed")}
                  style={{
                    padding: "12px",
                    borderRadius: "12px",
                    border: contractChoice === "already_signed" ? "2px solid #315cff" : "1.5px solid #e2e8f0",
                    background: contractChoice === "already_signed" ? "#f0f4ff" : "#ffffff",
                    color: contractChoice === "already_signed" ? "#1e40af" : "#475569",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Already Signed (Upload)
                </button>
              </div>
            )}

            {contractChoice === "sign_now" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Contract Summary Box */}
                <div
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    maxHeight: "140px",
                    overflowY: "auto",
                    fontSize: "12px",
                    color: "#475569",
                    lineHeight: 1.6,
                  }}
                >
                  <p style={{ fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>Standard Rental Terms:</p>
                  <p>1. Renter agrees to maintain the bicycle in proper working condition and take reasonable care.</p>
                  <p>2. Theft, loss, or intentional damage is the sole responsibility of the renter.</p>
                  <p>3. Rental extensions must be submitted prior to the end of the rental period.</p>
                  <p>4. Safety gear and heavy-duty locks are provided for security.</p>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Electronic Signature (Type full legal name)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    value={signerName}
                    onChange={(e) => {
                      setHasCustomSigner(true);
                      setSignerName(e.target.value);
                    }}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "11px 14px",
                      borderRadius: "12px",
                      border: "1.5px solid #e2e8f0",
                      fontSize: "14px",
                      color: "#0f172a",
                      fontFamily: "monospace",
                      fontWeight: 700,
                      outline: "none",
                    }}
                  />
                  <p style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                    By typing your name, you agree to the binding digital terms of Foreigners Hub.
                  </p>
                </div>
              </div>
            ) : (
              /* Already Signed: Upload PDF / Photo */
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Upload Signed Contract Document
                </label>
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "26px",
                    borderRadius: "16px",
                    border: contractFile ? "2px solid #22c55e" : "2px dashed #cbd5e1",
                    background: contractFile ? "#f0fdf4" : "#f8fafc",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleContractFileChange}
                    style={{ display: "none" }}
                  />
                  {contractFile ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                      <CheckCircle2 size={24} style={{ color: "#22c55e" }} />
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#15803d" }}>Contract Uploaded</span>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>{contractFile.name} (Click to replace)</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                      <FileText size={22} style={{ color: "#315cff" }} />
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Upload Contract (PDF or Photo)</span>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Proof of prior agreement</span>
                    </div>
                  )}
                </label>
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                type="button"
                onClick={handleBack}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "14px",
                  background: "#ffffff",
                  border: "1.5px solid #cbd5e1",
                  color: "#475569",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                style={{
                  flex: 2,
                  padding: "14px",
                  borderRadius: "14px",
                  background: "#315cff",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "15px",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                Next: Payment <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5 (or 4 for New): PAYMENT & FINISH ── */}
        {((isExisting && currentStep === 5) || (!isExisting && currentStep === 4)) && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "22px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>
                {isExisting ? "Payment Verification" : "Payment & Activation"}
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b" }}>
                {isExisting
                  ? "Upload your latest payment receipt or transfer proof to verify your active status."
                  : "Review payment details, complete your bank transfer, and upload proof."}
              </p>
            </div>

            {/* Existing user payment choice */}
            {isExisting ? (
              <div style={{ marginBottom: "18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                  <button
                    type="button"
                    onClick={() => setPaymentChoice("already_paid")}
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      border: paymentChoice === "already_paid" ? "2px solid #315cff" : "1.5px solid #e2e8f0",
                      background: paymentChoice === "already_paid" ? "#f0f4ff" : "#ffffff",
                      color: paymentChoice === "already_paid" ? "#1e40af" : "#475569",
                      fontWeight: 700,
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    Already Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentChoice("make_payment")}
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      border: paymentChoice === "make_payment" ? "2px solid #315cff" : "1.5px solid #e2e8f0",
                      background: paymentChoice === "make_payment" ? "#f0f4ff" : "#ffffff",
                      color: paymentChoice === "make_payment" ? "#1e40af" : "#475569",
                      fontWeight: 700,
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    Make Payment Now
                  </button>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    {paymentChoice === "already_paid" ? "Upload Latest Payment Receipt / Statement" : "Upload Transfer Receipt"}
                  </label>
                  <label
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "24px",
                      borderRadius: "16px",
                      border: paymentReceipt ? "2px solid #22c55e" : "2px dashed #cbd5e1",
                      background: paymentReceipt ? "#f0fdf4" : "#f8fafc",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handlePaymentReceiptChange}
                      style={{ display: "none" }}
                    />
                    {paymentReceipt ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                        <CheckCircle2 size={24} style={{ color: "#22c55e" }} />
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#15803d" }}>Receipt Uploaded</span>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>{paymentReceipt.name}</span>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                        <Upload size={22} style={{ color: "#315cff" }} />
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Upload Receipt (PDF or Screenshot)</span>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>Bank confirmation / transfer statement</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            ) : (
              /* New User Payment Flow */
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Plan Selector */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Selected Plan
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div
                      onClick={() => setPlanType("weekly")}
                      style={{
                        padding: "12px",
                        borderRadius: "12px",
                        border: planType === "weekly" ? "2px solid #315cff" : "1.5px solid #e2e8f0",
                        background: planType === "weekly" ? "#f0f4ff" : "#ffffff",
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                    >
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Weekly</p>
                      <p style={{ fontSize: "16px", fontWeight: 800, color: "#315cff" }}>€45 / wk</p>
                    </div>

                    <div
                      onClick={() => setPlanType("monthly")}
                      style={{
                        padding: "12px",
                        borderRadius: "12px",
                        border: planType === "monthly" ? "2px solid #315cff" : "1.5px solid #e2e8f0",
                        background: planType === "monthly" ? "#f0f4ff" : "#ffffff",
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                    >
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Monthly</p>
                      <p style={{ fontSize: "16px", fontWeight: 800, color: "#315cff" }}>€170 / mo</p>
                    </div>
                  </div>
                </div>

                {/* Amount Summary */}
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: "12px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>First payment total (includes €50 refundable deposit):</span>
                    <p style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>€{totalAmount}</p>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#16a34a", background: "#f0fdf4", padding: "4px 8px", borderRadius: "6px" }}>
                    €50 deposit refunded on return
                  </span>
                </div>

                {/* Bank Account Details */}
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: "12px",
                    background: "#f0f4ff",
                    border: "1px solid #dbeafe",
                    fontSize: "12px",
                  }}
                >
                  <p style={{ fontWeight: 700, color: "#1e40af", marginBottom: "6px" }}>Official Bank Account:</p>
                  <p style={{ color: "#334155" }}><strong>Beneficiary:</strong> FOREIGNERS HUB</p>
                  <p style={{ color: "#334155" }}><strong>Payment Reference:</strong> FHUB-{bikeCode.toUpperCase()}</p>
                  <p style={{ color: "#64748b", marginTop: "4px", fontSize: "11px" }}>
                    Please include the reference so your payment is automatically mapped.
                  </p>
                </div>

                {/* Upload Receipt */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Upload Bank Transfer Proof / Receipt (Optional, can be verified later)
                  </label>
                  <label
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "20px",
                      borderRadius: "14px",
                      border: paymentReceipt ? "2px solid #22c55e" : "2px dashed #cbd5e1",
                      background: paymentReceipt ? "#f0fdf4" : "#f8fafc",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handlePaymentReceiptChange}
                      style={{ display: "none" }}
                    />
                    {paymentReceipt ? (
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#15803d" }}>
                        ✓ {paymentReceipt.name}
                      </span>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        Click to upload transfer screenshot (optional)
                      </span>
                    )}
                  </label>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "14px",
                  background: "#ffffff",
                  border: "1.5px solid #cbd5e1",
                  color: "#475569",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 2,
                  padding: "14px",
                  borderRadius: "14px",
                  background: "#16a34a",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "15px",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 6px 18px rgba(22, 163, 74, 0.3)",
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} /> Complete Sign Up
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </>
    )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px 16px" }}>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div style={{ display: "inline-block", marginBottom: "8px" }}>
          <Logo />
        </div>
      </div>
      <Suspense fallback={<div style={{ textAlign: "center", padding: "40px" }}><Loader2 size={24} className="animate-spin" /></div>}>
        <RegisterWizard />
      </Suspense>
    </div>
  );
}
