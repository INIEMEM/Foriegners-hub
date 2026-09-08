"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, KeyRound, Loader2, ShieldCheck, Clock, Users } from "lucide-react";
import Logo from "@/components/shared/Logo";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();
  const nextPath = searchParams.get("next") || "/dashboard";

  async function handleSendOtp(e) {
    e.preventDefault();
    setError("");
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true, emailRedirectTo: redirectTo },
      });
      if (authError) throw authError;
      setStep("otp");
    } catch (err) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError("");
    if (!otp || otp.length < 4) {
      setError("Please enter the full code from your email.");
      return;
    }
    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });
      if (verifyError) throw verifyError;
      router.push(nextPath);
    } catch (err) {
      setError(err?.message ?? "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: "100%", maxWidth: "420px" }}>

      {/* Email step */}
      {step === "email" && (
        <>
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Mail size={16} style={{ color: "#315cff" }} />
              </div>
              <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>
                Sign in or create account
              </h1>
            </div>
            <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6 }}>
              Enter your email and we&apos;ll send you a secure one-time code. No password needed.
            </p>
          </div>

          <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label htmlFor="email" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                required
                style={{
                  padding: "12px 16px", borderRadius: "12px",
                  border: "1.5px solid #e2e8f0", fontSize: "15px", color: "#0f172a",
                  outline: "none", fontFamily: "inherit", background: "#f8fafc",
                  width: "100%",
                }}
              />
            </div>

            {error && (
              <p style={{ fontSize: "13px", color: "#dc2626" }} role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                background: loading ? "#6b7280" : "#315cff", color: "white", fontWeight: 700,
                fontSize: "15px", padding: "13px 20px", borderRadius: "12px",
                border: "none", cursor: loading ? "not-allowed" : "pointer", width: "100%",
                fontFamily: "inherit",
              }}
            >
              {loading ? (
                <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Sending code...</>
              ) : (
                "Send sign-in code"
              )}
            </button>
          </form>
        </>
      )}

      {step === "otp" && (
        <>
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <KeyRound size={16} style={{ color: "#16a34a" }} />
              </div>
              <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>
                Check your email
              </h1>
            </div>
          </div>

          {/* Primary: click the link */}
          <div style={{
            background: "#f0fdf4", border: "1.5px solid #bbf7d0",
            borderRadius: "14px", padding: "20px", marginBottom: "20px", textAlign: "center",
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "10px" }}>📬</div>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#166534", marginBottom: "6px" }}>
              We sent a sign-in link to
            </p>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "12px" }}>
              {email}
            </p>
            <p style={{ fontSize: "13px", color: "#4b7c62", lineHeight: 1.6 }}>
              Open your email and click the <strong>"Confirm email address"</strong> or <strong>"Sign in"</strong> link to continue.
              The link will bring you straight back to the app.
            </p>
          </div>

          {/* Secondary: manual OTP code (collapsible) */}
          <details style={{ marginBottom: "20px" }}>
            <summary style={{
              fontSize: "13px", fontWeight: 600, color: "#64748b",
              cursor: "pointer", listStyle: "none", padding: "10px 0",
              borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0",
            }}>
              Got a 6-digit code instead? Enter it here ↓
            </summary>
            <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "12px", paddingTop: "14px" }}>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                autoComplete="one-time-code"
                style={{
                  padding: "12px 16px", borderRadius: "12px",
                  border: "1.5px solid #e2e8f0", fontSize: "22px", fontWeight: 700,
                  color: "#0f172a", textAlign: "center", letterSpacing: "0.25em",
                  outline: "none", fontFamily: "monospace", background: "#f8fafc",
                  width: "100%",
                }}
              />
              {error && <p style={{ fontSize: "13px", color: "#dc2626" }} role="alert">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  background: loading ? "#6b7280" : "#315cff", color: "white", fontWeight: 700,
                  fontSize: "15px", padding: "13px 20px", borderRadius: "12px",
                  border: "none", cursor: loading ? "not-allowed" : "pointer", width: "100%",
                  fontFamily: "inherit",
                }}
              >
                {loading ? (
                  <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Verifying...</>
                ) : (
                  "Verify & sign in"
                )}
              </button>
            </form>
          </details>

          <button
            type="button"
            onClick={() => { setStep("email"); setOtp(""); setError(""); }}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              gap: "6px", fontSize: "13px", color: "#64748b", background: "none",
              border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
              width: "100%",
            }}
          >
            <ArrowLeft size={13} /> Use a different email
          </button>
        </>
      )}

      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <Link
          href="/"
          style={{ fontSize: "13px", color: "#94a3b8", textDecoration: "none" }}
        >
          ← Back to Foreigners Hub
        </Link>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function LoginPage() {
  const trustBadges = [
    { icon: ShieldCheck, text: "Secure passwordless login" },
    { icon: Clock, text: "Takes less than 60 seconds" },
    { icon: Users, text: "Trusted by 500+ students" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* ── Left panel: brand ── */}
      <div style={{
        display: "none", // Hidden on mobile, shown by media query
        flexDirection: "column", justifyContent: "space-between",
        width: "42%", minHeight: "100vh", background: "#0f172a",
        padding: "48px 44px", flexShrink: 0,
      }} className="login-left-panel">
        {/* Logo */}
        <Logo asLink={false} />

        {/* Center content */}
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(255,255,255,0.06)", borderRadius: "20px",
            padding: "6px 14px", marginBottom: "28px",
          }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", letterSpacing: "0.06em" }}>
              VILNIUS, LITHUANIA
            </span>
          </div>

          <h2 style={{
            fontSize: "36px", fontWeight: 800, color: "white",
            lineHeight: 1.2, marginBottom: "16px",
          }}>
            Move around.<br />
            <em style={{ color: "#60a5fa", fontStyle: "normal" }}>Settle in.</em>
          </h2>

          <p style={{ fontSize: "15px", color: "#94a3b8", lineHeight: 1.7, maxWidth: "340px" }}>
            Sign in to manage your bike rental, track your contract, request repairs, and more.
          </p>
        </div>

        {/* Trust badges */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {trustBadges.map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "34px", height: "34px", borderRadius: "10px",
                background: "rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Icon size={15} style={{ color: "#60a5fa" }} />
              </div>
              <span style={{ fontSize: "13px", color: "#94a3b8" }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 24px", background: "#f8fafc",
        minHeight: "100vh",
      }}>
        {/* Mobile logo (only visible when left panel is hidden) */}
        <div className="login-mobile-logo" style={{ marginBottom: "32px" }}>
          <Logo />
        </div>

        <div style={{
          width: "100%", maxWidth: "420px",
          background: "white", borderRadius: "20px",
          padding: "36px 32px", border: "1px solid #e8edf5",
          boxShadow: "0 4px 32px rgba(15,23,42,0.06)",
        }}>
          <Suspense fallback={
            <div style={{ display: "flex", justifyContent: "center", padding: "32px" }}>
              <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "#315cff" }} />
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .login-left-panel { display: flex !important; }
          .login-mobile-logo { display: none !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
