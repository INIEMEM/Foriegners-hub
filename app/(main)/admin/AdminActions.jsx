"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyPayment, rejectPayment } from "@/app/actions/admin";

export default function AdminActions({ paymentId }) {
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
      setLoading(true);
      try {
      await verifyPayment(paymentId);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (!confirm("Are you sure you want to reject this payment?")) return;
      setLoading(true);
      try {
      await rejectPayment(paymentId);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
      <Button 
        size="sm" 
        onClick={handleApprove} 
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        {loading ? <Loader2 size={14} className="animate-spin mr-1" /> : <CheckCircle2 size={14} className="mr-1" />}
        Verify Payment
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={handleReject} 
        disabled={loading}
        className="text-danger border-danger/30 hover:bg-danger/5"
      >
        {loading ? <Loader2 size={14} className="animate-spin mr-1" /> : <XCircle size={14} className="mr-1" />}
        Reject
      </Button>
    </div>
  );
}
