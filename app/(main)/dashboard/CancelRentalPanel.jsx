"use client";

import { MessageCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CancelRentalPanel({ rental, siteSettings = {} }) {
  const whatsappNumber = siteSettings?.whatsapp_number || "+37060291367";
  const cleanNumber = whatsappNumber.replace(/\D/g, "");

  const isClosed = ["CANCELLED", "COMPLETED", "EXPIRED"].includes(rental?.status);
  if (isClosed) return null;

  const bikeTitle = rental?.bikes?.name
    ? `${rental.bikes.name}${rental.bikes.b_code ? ` (${rental.bikes.b_code})` : ""}`
    : "Bike rental";

  const waMessage = encodeURIComponent(
    `Hello Foreigners Hub admin, I would like to request a cancellation / return for my rental.\n\nRental ID: ${rental?.id || "N/A"}\nBike: ${bikeTitle}\nCurrent status: ${rental?.status || "Active"}`
  );

  const waLink = cleanNumber
    ? `https://wa.me/${cleanNumber}?text=${waMessage}`
    : `https://wa.me/?text=${waMessage}`;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-amber-100 p-2 text-amber-700">
          <HelpCircle size={16} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-900">Need to cancel or return?</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            For security and bike return inspection, rental cancellations and early returns must be processed directly by our team. Please contact the administrator on WhatsApp to coordinate.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              asChild
              size="sm"
              className="bg-[#25D366] text-white hover:bg-[#20ba5a] text-xs font-semibold shadow-sm"
            >
              <a href={waLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={14} className="mr-1.5" />
                Contact Admin ({whatsappNumber})
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
