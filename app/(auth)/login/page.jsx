"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/shared/Logo";

import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState("email"); // "email" | "otp"
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();
  const nextPath = searchParams.get("next") || "/dashboard";

  /* ── Step 1: Send OTP / magic link ────────────────────────────────── */
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
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectTo,
        }
      });
      
      if (authError) throw authError;

      setStep("otp");
    } catch (err) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ── Step 2: Verify OTP ──────────────────────────────────────────── */
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
        type: "email" 
      });
      
      if (verifyError) throw verifyError;
      
      // Navigate to intended path on success
      router.push(nextPath);
    } catch (err) {
      setError(err?.message ?? "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <Logo />
      </div>

      {/* Card */}
      <div className="premium-card rounded-2xl p-8 md:p-9">
        {/* ── Email step ────────────────────────────────────────────── */}
        {step === "email" && (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Mail size={16} className="text-brand" />
                <h1 className="text-xl font-bold text-slate-950">
                  Welcome back
                </h1>
              </div>
              <p className="text-sm text-slate-500">
                Enter your email and we&apos;ll send you a secure sign-in email.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-danger-DEFAULT" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending email...
                  </>
                ) : (
                  "Send sign-in email"
                )}
              </Button>
            </form>
          </>
        )}

        {/* ── OTP step ──────────────────────────────────────────────── */}
        {step === "otp" && (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <KeyRound size={16} className="text-brand" />
                <h1 className="text-xl font-bold text-slate-950">
                  Check your email
                </h1>
              </div>
              <p className="text-sm text-slate-500">
                We sent a sign-in email to{" "}
                <span className="font-medium text-slate-700">{email}</span>.
                Open the link in the email, or enter the 6-digit code if your email includes one.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="otp">Sign-in code</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  autoComplete="one-time-code"
                  autoFocus
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-danger" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & sign in"
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setError("");
                }}
                className="inline-flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ArrowLeft size={14} />
                Use a different email
              </button>
            </form>
          </>
        )}
      </div>

      {/* Back to site */}
      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          ← Back to Foreigners Hub
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(180deg,#ffffff_0%,#f2f5ff_100%)] px-4 py-12">
      <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin text-brand" /></div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
