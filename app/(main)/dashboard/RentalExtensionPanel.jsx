"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  requestRentalExtension,
  submitExtensionPayment,
} from "@/app/actions/rental";

function formatCurrency(value) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value || 0));
}

export default function RentalExtensionPanel({ rental, plans, activeExtension, siteSettings = {} }) {
  const [selectedPlanId, setSelectedPlanId] = useState(plans?.[0]?.id || "");
  const [paymentReference, setPaymentReference] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  if (rental.status !== "ACTIVE") {
    return (
      <p className="text-sm leading-7 text-slate-600">
        Extensions are available only after a bike rental is active.
      </p>
    );
  }

  if (activeExtension) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-bold text-slate-900">
            Extension status: {activeExtension.status.replace("_", " ")}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Amount due: {formatCurrency(activeExtension.amount)}. No additional
            deposit is charged for this continuous renewal.
          </p>
        </div>

        {activeExtension.status === "AWAITING_PAYMENT" && (
          <form
            action={(formData) => {
              setMessage("");
              startTransition(async () => {
                try {
                  await submitExtensionPayment(formData);
                  setMessage("Extension payment submitted for admin verification.");
                } catch (err) {
                  setMessage(err.message || "Could not submit extension payment.");
                }
              });
            }}
            className="space-y-3"
          >
            <input type="hidden" name="extension_id" value={activeExtension.id} />
            
            {/* Show payment details from settings */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm mb-3">
              <p className="font-bold text-slate-900 mb-2">Transfer Details</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div>Bank: <span className="font-semibold">{siteSettings.payment_account_bank || "Vietcombank"}</span></div>
                <div>Name: <span className="font-semibold">{siteSettings.payment_account_name || "FOREIGNERS HUB LTD"}</span></div>
                <div className="col-span-2">IBAN / Acc: <span className="font-semibold">{siteSettings.payment_account_iban || "1029384756"}</span></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="extension-payment-reference">Payment reference</Label>
              <Input
                id="extension-payment-reference"
                name="payment_reference"
                value={paymentReference}
                onChange={(event) => setPaymentReference(event.target.value)}
                placeholder="Transfer ID or payment note"
              />
              <p className="text-xs text-slate-500">
                {siteSettings.payment_instructions || "Send payment proof to the official Foreigners Hub WhatsApp contact."}
              </p>
            </div>
            <Button size="sm" disabled={isPending}>
              {isPending && <Loader2 size={14} className="animate-spin" />}
              Submit extension payment
            </Button>
          </form>
        )}

        {message && <p className="text-sm text-slate-500">{message}</p>}
      </div>
    );
  }

  return (
    <form
      action={(formData) => {
        setMessage("");
        startTransition(async () => {
          try {
            await requestRentalExtension(formData);
            setMessage("Extension request created. Submit payment to continue.");
          } catch (err) {
            setMessage(err.message || "Could not request extension.");
          }
        });
      }}
      className="space-y-4"
    >
      <input type="hidden" name="rental_id" value={rental.id} />
      <div className="space-y-1.5">
        <Label htmlFor="pricing_plan_id">Additional rental period</Label>
        <select
          id="pricing_plan_id"
          name="pricing_plan_id"
          value={selectedPlanId}
          onChange={(event) => setSelectedPlanId(event.target.value)}
          className="flex h-11 w-full rounded-lg border border-slate-200 bg-white/85 px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
        >
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} — {formatCurrency(plan.total_price)}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs leading-6 text-slate-500">
        The return date changes only after Foreigners Hub verifies the extension
        payment. No second active rental is created, and no new-rental deposit
        is charged.
      </p>
      <Button size="sm" disabled={isPending || !selectedPlanId}>
        {isPending && <Loader2 size={14} className="animate-spin" />}
        Request extension
      </Button>
      {message && <p className="text-sm text-slate-500">{message}</p>}
    </form>
  );
}
