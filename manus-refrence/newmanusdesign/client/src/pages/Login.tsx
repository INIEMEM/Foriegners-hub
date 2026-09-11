import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const mark = "/manus-storage/foreigners-hub-mark_f2c991cf.png";
const hero = "/manus-storage/foreigners-hub-hero_0578f4b6.png";

export default function Login() {
  const [step, setStep] = useState<"email" | "otp" | "ready">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      toast.error("Enter your email to receive a one-time code.");
      return;
    }
    setStep("otp");
    toast.success("Your 8-digit code is on its way.");
  }

  function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (otp.trim().length !== 8) {
      toast.error("Enter the 8-digit code from your email.");
      return;
    }
    setStep("ready");
    toast.success("Code verified. Your hub is ready.");
  }

  return (
    <main className="fh-auth-shell">
      <div className="fh-auth-side fh-grid-paper">
        <div className="fh-auth-side-top">
          <Link className="fh-brand" href="/"><img src={mark} alt="" /><span className="fh-wordmark">Foreigners Hub<small>city essentials</small></span></Link>
          <Link className="fh-auth-back" href="/"><ArrowLeft size={15} /> Back to home</Link>
        </div>
        <div className="fh-auth-story">
          <div className="fh-label">Your city, your dashboard</div>
          <h1 className="fh-display">Pick up where you <em>left off.</em></h1>
          <p>Sign in without another password. We’ll email you an 8-digit code and get you back to your rentals in seconds.</p>
          <div className="fh-auth-art"><img src={hero} alt="Young renter with a bike in a city" /><span className="fh-auth-route">01 <small>keep moving</small></span></div>
        </div>
      </div>

      <div className="fh-auth-panel">
        <div className="fh-auth-form-wrap">
          <div className="fh-auth-icon"><LockKeyhole size={20} /></div>
          {step === "email" && <>
            <div className="fh-label">Passwordless sign in</div>
            <h2 className="fh-display">Enter your email.</h2>
            <p className="fh-auth-intro">We’ll send you an 8-digit one-time code. No password to remember.</p>
            <form className="fh-form" onSubmit={requestCode}>
              <label htmlFor="login-email">Email address</label>
              <div className="fh-input-wrap"><Mail size={17} /><input id="login-email" type="email" autoComplete="email" placeholder="you@email.com" value={email} onChange={(event) => setEmail(event.target.value)} /></div>
              <button className="fh-primary-btn fh-form-submit" type="submit">Send me a code <ArrowRight size={16} /></button>
            </form>
          </>}
          {step === "otp" && <>
            <div className="fh-label">Check your inbox</div>
            <h2 className="fh-display">Enter your code.</h2>
            <p className="fh-auth-intro">We sent an 8-digit code to <strong>{email}</strong>. It expires soon.</p>
            <form className="fh-form" onSubmit={verifyCode}>
              <label htmlFor="login-otp">8-digit code</label>
              <input className="fh-otp-input" id="login-otp" inputMode="numeric" maxLength={8} pattern="[0-9]{8}" placeholder="00000000" value={otp} onChange={(event) => setOtp(event.target.value.replace(/[^0-9]/g, ""))} />
              <button className="fh-primary-btn fh-form-submit" type="submit">Verify code <ArrowRight size={16} /></button>
            </form>
            <button className="fh-auth-secondary" type="button" onClick={() => setStep("email")}>Use a different email</button>
          </>}
          {step === "ready" && <>
            <div className="fh-auth-ready-icon"><CheckCircle2 size={25} /></div>
            <div className="fh-label">You’re verified</div>
            <h2 className="fh-display">Welcome back.</h2>
            <p className="fh-auth-intro">Your account is ready. From here you’ll see rental status, payment updates, contracts, and pickup details.</p>
            <Link className="fh-primary-btn fh-form-submit" href="/bikes/city-bike">View bike rental <ArrowRight size={16} /></Link>
          </>}
          <div className="fh-auth-divider"><span>secure by design</span></div>
          <p className="fh-auth-note"><ShieldCheck size={13} /> Your one-time code is used only to verify your email. We never ask you to create another password.</p>
        </div>
      </div>
    </main>
  );
}
