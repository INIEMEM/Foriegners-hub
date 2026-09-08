"use client";

import { useState } from "react";
import { Loader2, PenTool, CheckCircle } from "lucide-react";
import { signContract } from "@/app/actions/rental";
import { useRouter } from "next/navigation";

export default function SignContractPanel({ contract }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signerName, setSignerName] = useState("");

  async function handleSign(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signContract({ contractId: contract.id, signerName });
      router.refresh();
    } catch (err) {
      setError(err.message || "Failed to sign the contract.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-brand-light bg-blue-50/50 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white">
          <PenTool size={18} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">Contract signature required</h4>
          <p className="text-xs text-slate-600">Please review and sign your digital contract to proceed.</p>
        </div>
      </div>
      
      <form onSubmit={handleSign} className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">Type your full name to sign</label>
          <input
            type="text"
            required
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            placeholder="e.g. Jane Doe"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand"
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || !signerName.trim()}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Sign & Accept"}
        </button>
      </form>
    </div>
  );
}
