"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ShieldCheck, FileSignature, Landmark, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createRentalAndContract, submitPayment } from "@/app/actions/rental";
import { createClient } from "@/lib/supabase/client";

export default function CheckoutFlow({ bike, plans, profile, user, siteSettings = {} }) {
  const router = useRouter();
  const supabase = createClient();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [fullName, setFullName] = useState(
    profile?.first_name && profile?.last_name 
      ? `${profile.first_name} ${profile.last_name}` 
      : ""
  );
  const [signature, setSignature] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [rentalId, setRentalId] = useState(null);
  const [email, setEmail] = useState(user.email || profile?.email || "");
  const [emailMessage, setEmailMessage] = useState("");

  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  const currentEmail = user.email || profile?.email || "";
  const cleanEmail = email.trim().toLowerCase();
  const emailHasChanged = cleanEmail !== currentEmail.toLowerCase();
  const draftKey = useMemo(() => `foreigners-hub-rent-draft:${bike.id}`, [bike.id]);

  useEffect(() => {
    const storedDraft = window.localStorage.getItem(draftKey);
    if (!storedDraft) return;

    try {
      const draft = JSON.parse(storedDraft);
      const signedInEmail = currentEmail.toLowerCase();

      if (draft.resumeAfterAuth && draft.email?.toLowerCase() === signedInEmail) {
        setSelectedPlanId(draft.selectedPlanId || "");
        setFullName(draft.fullName || "");
        setEmail(currentEmail);
        setStep(draft.selectedPlanId && draft.fullName ? 3 : 2);
        window.localStorage.removeItem(draftKey);
      }
    } catch {
      window.localStorage.removeItem(draftKey);
    }
  }, [currentEmail, draftKey]);
  
  // Calculate Totals
  const isNewRental = true; // Always true for this flow as per requirements
  const depositAmount = isNewRental ? 50 : 0;
  const rentalAmount = selectedPlan ? Number(selectedPlan.total_price) : 0;
  const totalAmount = rentalAmount + depositAmount;

  // Handlers
  const switchToEmailAccount = async () => {
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return false;
    }

    setLoading(true);
    setEmailMessage("");

    try {
      window.localStorage.setItem(
        draftKey,
        JSON.stringify({
          resumeAfterAuth: true,
          selectedPlanId,
          fullName,
          email: cleanEmail,
        })
      );
      await supabase.auth.signOut();
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}&email=${encodeURIComponent(cleanEmail)}`);
      router.refresh();
      return true;
    } catch (err) {
      setError(err.message || "We could not switch to this email. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    setError("");
    setEmailMessage("");

    if (step === 1 && !selectedPlanId) {
      setError("Please select a rental plan to continue.");
      return;
    }
    if (step === 2 && (!fullName.trim() || fullName.length < 3)) {
      setError("Please enter your full name.");
      return;
    }

    if (step === 2 && emailHasChanged) {
      setEmailMessage("To use that email, sign in with it first. We will bring you back to this rental after verification.");
      await switchToEmailAccount();
      return;
    }

    setStep(s => s + 1);
  };

  const handleBack = () => {
    setError("");
    setStep(s => s - 1);
  };

  const handleSignContract = async () => {
    setError("");
    if (!signature.trim()) {
      setError("Please type your full name to sign the contract.");
      return;
    }

    setLoading(true);
    try {
      const res = await createRentalAndContract({
        bikeId: bike.id,
        planId: selectedPlanId,
        signatureData: signature,
        signerName: signature
      });
      setRentalId(res.rentalId);
      setStep(5); // Proceed to payment
    } catch (err) {
      setError(err.message || "Failed to create rental. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    setError("");
    try {
      await submitPayment({
        rentalId,
        paymentReference: paymentRef || "N/A"
      });
      setStep(6); // Success page
    } catch (err) {
      setError(err.message || "Failed to submit payment details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-card flex min-h-[600px] flex-col overflow-hidden rounded-2xl md:flex-row">
      
      {/* ── Left Side: Bike Summary (Visible on Desktop) ── */}
      <div className="hidden w-1/3 flex-col border-r border-slate-200 bg-slate-950 p-8 text-white md:flex">
        <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-400">Rental Summary</h2>
        
        <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.06] p-4">
          <div className="aspect-[4/3] bg-slate-100 rounded-md flex items-center justify-center mb-4 overflow-hidden">
            {bike.image_url && <img src={bike.image_url} alt={bike.name} className="object-cover w-full h-full" />}
          </div>
          <h3 className="mb-1 font-bold leading-tight text-white">{bike.name}</h3>
          <p className="text-xs text-slate-500 font-mono mb-3">B-Code: {bike.b_code}</p>
          <span className="inline-block bg-brand/10 text-brand text-xs font-semibold px-2 py-1 rounded">
            {bike.bike_categories?.name}
          </span>
        </div>

        {selectedPlan && (
          <div className="flex-1">
            <h3 className="mb-3 text-sm font-semibold text-white">Charges</h3>
            <div className="mb-2 flex justify-between text-sm text-slate-300">
              <span>Rental ({selectedPlan.name})</span>
              <span>€{rentalAmount.toFixed(2)}</span>
            </div>
            <div className="mb-4 flex justify-between border-b border-white/10 pb-4 text-sm text-slate-300">
              <span>Refundable Deposit</span>
              <span>€{depositAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white">
              <span>Total Due</span>
              <span>€{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="mt-auto pt-6 flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck size={16} />
          <span>Secure checkout verified by Foreigners Hub</span>
        </div>
      </div>

      {/* ── Right Side: Dynamic Steps ── */}
      <div className="w-full md:w-2/3 p-6 md:p-10 flex flex-col">
        
        {/* Step Indicator */}
        {step < 6 && (
          <div className="flex items-center gap-2 mb-8 text-sm font-medium text-slate-400">
            <span className={step >= 1 ? "text-brand" : ""}>Plan</span>
            <span className="text-slate-300">/</span>
            <span className={step >= 2 ? "text-brand" : ""}>Info</span>
            <span className="text-slate-300">/</span>
            <span className={step >= 3 ? "text-brand" : ""}>Review</span>
            <span className="text-slate-300">/</span>
            <span className={step >= 4 ? "text-brand" : ""}>Sign</span>
            <span className="text-slate-300">/</span>
            <span className={step >= 5 ? "text-brand" : ""}>Pay</span>
          </div>
        )}

        {/* --- STEP 1: CHOOSE PLAN --- */}
        {step === 1 && (
          <div className="flex flex-1 flex-col">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Select rental plan</h1>
            <p className="text-slate-500 mb-6">Choose how long you want to rent the {bike.name}.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
                    selectedPlanId === plan.id 
                      ? 'border-brand bg-brand/5 shadow-[0_14px_32px_rgba(49,92,255,0.12)]' 
                      : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <span className="font-semibold text-slate-900 mb-1">{plan.name}</span>
                  <span className="text-lg font-bold text-brand mb-2">€{plan.total_price}</span>
                  <span className="text-xs text-slate-500 mt-auto">Excludes €50 deposit</span>
                </button>
              ))}
            </div>

            {error && <p className="text-danger text-sm mb-4">{error}</p>}
            
            <div className="mt-auto pt-6 flex items-center justify-between">
              <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
              <Button onClick={handleNext} disabled={!selectedPlanId}>Next Step <ArrowRight size={16} className="ml-2" /></Button>
            </div>
          </div>
        )}

        {/* --- STEP 2: PERSONAL INFO --- */}
        {step === 2 && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Personal Information</h1>
            <p className="text-slate-500 mb-6">Confirm your details for the rental agreement.</p>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
                  placeholder="John Doe" 
                />
                <p className="text-xs text-slate-500">This must match your legal ID for the contract.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setEmailMessage("");
                  }}
                  placeholder="you@example.com"
                />
                <p className="text-xs text-slate-500">
                  To use a different email, you will sign in with that email first so the rental is attached to the correct account.
                </p>
                {emailMessage && <p className="text-sm text-green-700">{emailMessage}</p>}
              </div>
            </div>

            {error && <p className="text-danger text-sm mt-4">{error}</p>}

            <div className="mt-auto pt-6 flex items-center justify-between">
              <Button variant="ghost" onClick={handleBack}>Back</Button>
              <Button onClick={handleNext} disabled={loading}>
                {loading ? <><Loader2 size={16} className="animate-spin mr-2" /> Sending...</> : "Review Rental"}
                {!loading && <ArrowRight size={16} className="ml-2" />}
              </Button>
            </div>
          </div>
        )}

        {/* --- STEP 3: REVIEW --- */}
        {step === 3 && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Review your rental</h1>
            <p className="text-slate-500 mb-6">Please check all details before generating your contract.</p>
            
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <dl className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Bike</dt>
                  <dd className="font-semibold text-slate-900 text-right">{bike.name} ({bike.b_code})</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Plan</dt>
                  <dd className="font-semibold text-slate-900">{selectedPlan.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Start Date</dt>
                  <dd className="font-semibold text-slate-900">Tomorrow (Booking day excludes)</dd>
                </div>
                <hr className="border-slate-200" />
                <div className="flex justify-between">
                  <dt className="text-slate-500">Rental Amount</dt>
                  <dd className="font-medium text-slate-900">€{rentalAmount.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Refundable Deposit</dt>
                  <dd className="font-medium text-slate-900">€{depositAmount.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between pt-2">
                  <dt className="text-slate-700 font-bold">Total Initial Amount</dt>
                  <dd className="font-bold text-brand text-lg">€{totalAmount.toFixed(2)}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-auto pt-6 flex items-center justify-between">
              <Button variant="ghost" onClick={handleBack}>Back</Button>
              <Button onClick={handleNext}>Generate Contract <ArrowRight size={16} className="ml-2" /></Button>
            </div>
          </div>
        )}

        {/* --- STEP 4: SIGN CONTRACT --- */}
        {step === 4 && (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <FileSignature className="text-brand" size={24} />
              <h1 className="text-2xl font-bold text-slate-900">Sign Contract</h1>
            </div>
            <p className="text-slate-500 mb-6">Read and sign the electronic rental agreement.</p>
            
            <div className="prose prose-sm mb-6 h-48 max-w-none overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
              <p><strong>BICYCLE RENTAL AGREEMENT</strong></p>
              <p>By electronically signing below, you ({fullName}) agree to rent the {bike.name} ({bike.b_code}) for the period of {selectedPlan.name}.</p>
              <p>You agree to pay the total amount of €{totalAmount.toFixed(2)}, which includes a €{depositAmount.toFixed(2)} refundable deposit.</p>
              <hr className="my-4 border-slate-200" />
              <div className="whitespace-pre-wrap">
                {siteSettings.contract_terms || `1. You accept responsibility for the bike and agree to return it in the same condition.
2. You agree to follow all applicable local traffic laws and regulations.
3. This rental is not active until payment has been locally verified by Foreigners Hub.`}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <Label htmlFor="signature">Electronic Signature</Label>
              <Input 
                id="signature" 
                value={signature} 
                onChange={e => setSignature(e.target.value)} 
                placeholder="Type your full legal name to sign" 
                className="font-serif text-lg bg-white"
              />
            </div>

            {error && <p className="text-danger text-sm mb-4">{error}</p>}

            <div className="mt-auto pt-4 flex items-center justify-between">
              <Button variant="ghost" onClick={handleBack} disabled={loading}>Back</Button>
              <Button onClick={handleSignContract} disabled={loading}>
                {loading ? <><Loader2 size={16} className="animate-spin mr-2" /> Signing...</> : "Sign & Continue"}
              </Button>
            </div>
          </div>
        )}

        {/* --- STEP 5: PAYMENT --- */}
        {step === 5 && (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <Landmark className="text-brand" size={24} />
              <h1 className="text-2xl font-bold text-slate-900">Local Payment</h1>
            </div>
            <p className="text-slate-500 mb-6">Transfer the funds to our local account to activate your rental.</p>
            
            <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 p-5">
              <h3 className="font-semibold text-orange-900 mb-2">Payment Instructions</h3>
              <p className="text-sm text-orange-800 mb-4">
                Please transfer exactly <strong className="text-lg">€{totalAmount.toFixed(2)}</strong> to the following account. Your rental remains Pending until verified by our team.
              </p>
              <dl className="space-y-2 rounded-lg border border-orange-100 bg-white p-4 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500">Bank:</dt><dd className="font-medium">{siteSettings.payment_account_bank || "Vietcombank"}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Account Name:</dt><dd className="font-medium">{siteSettings.payment_account_name || "FOREIGNERS HUB LTD"}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">IBAN / Account No:</dt><dd className="font-medium font-mono">{siteSettings.payment_account_iban || "1029384756"}</dd></div>
                {siteSettings.payment_account_bic && (
                  <div className="flex justify-between"><dt className="text-slate-500">BIC / SWIFT:</dt><dd className="font-medium font-mono">{siteSettings.payment_account_bic}</dd></div>
                )}
                <div className="flex justify-between"><dt className="text-slate-500">Message/Reference:</dt><dd className="font-medium font-mono">FHUB-{bike.b_code}</dd></div>
              </dl>
            </div>

            <div className="space-y-3 mb-6">
              <Label htmlFor="paymentRef">Transfer Reference (Optional)</Label>
              <Input 
                id="paymentRef" 
                value={paymentRef} 
                onChange={e => setPaymentRef(e.target.value)} 
                placeholder="e.g. Transaction ID or Name" 
              />
              <p className="text-xs text-slate-500">
                {siteSettings.payment_instructions || "After submitting, please send a screenshot of the transfer to our official WhatsApp."}
              </p>
            </div>

            {error && <p className="text-danger text-sm mb-4">{error}</p>}

            <div className="mt-auto pt-4 flex items-center justify-end">
              <Button onClick={handleConfirmPayment} disabled={loading} size="lg" className="w-full sm:w-auto">
                {loading ? <><Loader2 size={16} className="animate-spin mr-2" /> Submitting...</> : "I have made the payment"}
              </Button>
            </div>
          </div>
        )}

        {/* --- STEP 6: SUCCESS --- */}
        {step === 6 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
            <CheckCircle2 size={64} className="text-green-DEFAULT mb-6" />
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Request Submitted!</h1>
            <p className="text-slate-600 mb-8 max-w-md">
              We have received your payment confirmation. Your rental is currently <strong className="text-slate-800">AWAITING VERIFICATION</strong>. Our team will verify the payment and activate your rental shortly.
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
