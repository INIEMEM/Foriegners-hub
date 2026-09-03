"use client";

import { useState, useTransition } from "react";
import { Wrench, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitRepairRequest } from "@/app/actions/rental";

export default function RepairRequestPanel({ rental, repairServices }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!rental?.bike_id) return null;

  function handleSubmit(formData) {
    setMessage("");
    startTransition(async () => {
      try {
        await submitRepairRequest(formData);
        setMessage("Repair request submitted. Our team will be in touch.");
        setIsFormOpen(false);
      } catch (err) {
        setMessage(err.message || "Could not submit repair request.");
      }
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-900">Request Repair</p>
          <p className="mt-1 text-xs text-slate-500">
            Report an issue with your bike and request a service.
          </p>
        </div>
        {!isFormOpen && (
          <Button variant="outline" size="sm" onClick={() => setIsFormOpen(true)}>
            <Wrench size={14} className="mr-2" />
            Report Issue
          </Button>
        )}
      </div>

      {isFormOpen && (
        <form action={handleSubmit} className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          <input type="hidden" name="bike_id" value={rental.bike_id} />

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Service type
            </label>
            <select
              name="service_id"
              required
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
            >
              <option value="">Select a repair type…</option>
              {repairServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Description
            </label>
            <textarea
              name="description"
              required
              rows={3}
              placeholder="Describe the issue with the bike…"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 size={14} className="mr-2 animate-spin" />}
              {isPending ? "Submitting…" : "Submit Request"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => {
                setIsFormOpen(false);
                setMessage("");
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {message && (
        <p className={`mt-2 text-xs ${message.includes("submitted") ? "text-green-700" : "text-red-700"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
