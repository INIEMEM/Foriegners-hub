"use client";

import { useState, useTransition } from "react";
import { XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cancelRental } from "@/app/actions/rental";

export default function CancelRentalPanel({ rental }) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const isCancellable = ["PENDING", "CONTRACT_PENDING", "AWAITING_PAYMENT"].includes(rental.status);

  function handleCancel(formData) {
    if (!window.confirm("Are you sure you want to cancel this rental?")) return;

    setMessage("");
    startTransition(async () => {
      try {
        await cancelRental(formData);
        setMessage("Rental cancelled successfully.");
      } catch (err) {
        setMessage(err.message || "Could not cancel rental.");
      }
    });
  }

  return (
    <div className="rounded-xl border border-red-100 bg-red-50 p-4">
      <p className="text-sm font-bold text-red-900">Cancel Rental</p>
      <p className="mt-1 text-xs text-red-700">
        {isCancellable
          ? "You can cancel this rental request before payment is finalised."
          : "Cancel your active rental and mark the bike as returned."}
      </p>
      <form action={handleCancel} className="mt-3">
        <input type="hidden" name="rental_id" value={rental.id} />
        <Button
          type="submit"
          disabled={isPending}
          className="border border-red-300 bg-white text-red-700 hover:bg-red-50"
          variant="outline"
          size="sm"
        >
          {isPending ? (
            <Loader2 size={14} className="mr-2 animate-spin" />
          ) : (
            <XCircle size={14} className="mr-2" />
          )}
          {isPending ? "Cancelling…" : "Cancel Rental"}
        </Button>
      </form>
      {message && (
        <p className={`mt-2 text-xs ${message.includes("success") ? "text-green-700" : "text-red-700"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
