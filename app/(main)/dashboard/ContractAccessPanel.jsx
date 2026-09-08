"use client";

import { useState } from "react";
import {
  FileText,
  Eye,
  Download,
  Printer,
  X,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import SignContractPanel from "./SignContractPanel";

function formatDate(value, withTime = false) {
  if (!value) return "Not set";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not set";
    if (withTime) {
      return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    }
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return "Not set";
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value || 0));
}

const DEFAULT_TERMS = [
  "1. The renter agrees to take proper care of the bicycle/equipment and return it in the same condition as received, normal wear and tear excepted.",
  "2. The renter is strictly responsible for any damage, loss, or theft that occurs during the rental period.",
  "3. The renter agrees to follow all local traffic laws, speed regulations, and cycling safety guidelines at all times.",
  "4. Foreigners Hub is not liable for any injuries, accidents, property damage, or third-party liabilities sustained while operating the equipment.",
  "5. The security deposit will be refunded in full upon the prompt, safe, and undamaged return of the equipment.",
  "6. Rental extensions must be submitted and approved prior to the expiration of the current rental period to avoid overdue penalty fees."
];

export default function ContractAccessPanel({
  contract,
  rental,
  siteSettings = {},
  userEmail = "",
  userName = "",
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!contract) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        No signed contract is available for this rental yet.
      </div>
    );
  }

  if (contract.status === "PENDING") {
    return <SignContractPanel contract={contract} />;
  }

  const signerDisplay = contract.signer_name || userName || "Customer";
  const termsText = siteSettings?.contract_terms || "";
  const parsedTerms = termsText
    ? termsText.split("\n").filter((t) => t.trim().length > 0)
    : DEFAULT_TERMS;

  const itemName =
    rental?.bikes?.name || rental?.apartments?.name || "Electric Bicycle";
  const itemCode = rental?.bikes?.b_code;
  const planName = rental?.rental_pricing_plans?.name || "Standard Rental";
  const totalAmount = Number(rental?.total_amount || 0);
  const depositAmount = Number(rental?.deposit_amount || 0);
  const rentalFee = Math.max(0, totalAmount - depositAmount);

  const handlePrint = () => {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("style", "position: fixed; right: 0; bottom: 0; width: 0; height: 0; border: 0;");
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Rental-Agreement-${contract?.id?.slice(0, 8) || "Contract"}</title>
          <style>
            @page {
              size: A4;
              margin: 16mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              margin: 0;
              padding: 0;
              background: #ffffff;
              font-size: 13px;
              line-height: 1.5;
            }
            .header {
              border-bottom: 2px solid #0f172a;
              padding-bottom: 16px;
              margin-bottom: 20px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .brand-name {
              font-size: 24px;
              font-weight: 900;
              letter-spacing: -0.5px;
              color: #0f172a;
            }
            .doc-title {
              font-size: 11px;
              font-weight: 700;
              color: #2563eb;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-top: 2px;
            }
            .badge-verified {
              display: inline-block;
              background: #f0fdf4;
              color: #15803d;
              border: 1px solid #bbf7d0;
              font-size: 11px;
              font-weight: 700;
              padding: 3px 10px;
              border-radius: 9999px;
            }
            .meta-text {
              font-size: 11px;
              color: #64748b;
              margin-top: 4px;
              text-align: right;
            }
            .grid-cols {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              margin-bottom: 20px;
            }
            .info-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 12px 14px;
            }
            .label-sm {
              font-size: 10px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              border: 1px solid #cbd5e1;
              border-radius: 8px;
              overflow: hidden;
            }
            .table th {
              background: #f1f5f9;
              text-align: left;
              padding: 9px 12px;
              font-size: 11px;
              font-weight: 700;
              color: #334155;
              border-bottom: 1px solid #cbd5e1;
            }
            .table td {
              padding: 8px 12px;
              border-bottom: 1px solid #f1f5f9;
              font-size: 12px;
            }
            .table tr:last-child td {
              border-bottom: 0;
            }
            .total-row {
              background: #f8fafc;
              font-weight: 700;
            }
            .terms-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 14px;
              margin-bottom: 24px;
              font-size: 11.5px;
              color: #334155;
            }
            .terms-box p {
              margin: 0 0 8px 0;
            }
            .terms-box p:last-child {
              margin-bottom: 0;
            }
            .sig-container {
              border-top: 2px solid #e2e8f0;
              padding-top: 18px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
            }
            .signature-box {
              border: 1px solid #cbd5e1;
              background: #f8fafc;
              border-radius: 6px;
              height: 56px;
              display: flex;
              align-items: center;
              padding: 0 16px;
              font-family: Georgia, serif;
              font-style: italic;
              font-size: 22px;
              color: #0f172a;
              margin-top: 6px;
            }
            .cert-box {
              background: #f0fdf4;
              border: 1px solid #bbf7d0;
              border-radius: 8px;
              padding: 12px;
              color: #14532d;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand-name">FOREIGNERS HUB</div>
              <div class="doc-title">Official Rental Agreement & Liability Contract</div>
            </div>
            <div>
              <div class="badge-verified">✓ Signed & Legally Binding</div>
              <div class="meta-text">Version: ${contract.version || "1.0"}</div>
            </div>
          </div>

          <div class="grid-cols">
            <div class="info-box">
              <div class="label-sm">Service Provider</div>
              <div style="font-weight: 700; font-size: 13px; color: #0f172a;">Foreigners Hub</div>
              <div style="color: #475569; margin-top: 2px;">Mobility & Equipment Rentals</div>
              <div style="color: #64748b; margin-top: 2px;">support@foreignershub.com</div>
            </div>
            <div class="info-box">
              <div class="label-sm">Renter (Signatory)</div>
              <div style="font-weight: 700; font-size: 13px; color: #0f172a;">${signerDisplay}</div>
              <div style="color: #475569; margin-top: 2px;">${userEmail || "Verified User"}</div>
              <div style="color: #64748b; margin-top: 2px;">Signed: ${formatDate(contract.signed_at, true)}</div>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th colspan="2">Rental Specifications</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="color: #64748b; width: 40%;">Rented Asset</td>
                <td style="font-weight: 700; color: #0f172a;">${itemName} ${itemCode ? `(${itemCode})` : ""}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">Rental Plan</td>
                <td>${planName}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">Rental Period</td>
                <td>${formatDate(rental?.start_date)} — ${formatDate(rental?.end_date)}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">Rental Amount</td>
                <td>${formatCurrency(rentalFee)}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">Security Deposit</td>
                <td>${formatCurrency(depositAmount)} (Refundable)</td>
              </tr>
              <tr class="total-row">
                <td style="color: #0f172a; font-weight: 700;">Total Contract Value</td>
                <td style="color: #2563eb; font-weight: 800; font-size: 14px;">${formatCurrency(totalAmount)}</td>
              </tr>
            </tbody>
          </table>

          <div style="font-weight: 700; font-size: 11px; text-transform: uppercase; color: #0f172a; margin-bottom: 6px; letter-spacing: 0.5px;">
            Terms & Conditions
          </div>
          <div class="terms-box">
            ${parsedTerms.map((t) => `<p>${t}</p>`).join("")}
          </div>

          <div class="sig-container">
            <div>
              <div class="label-sm">Authorized Electronic Signature</div>
              <div class="signature-box">${contract.signature_data || contract.signer_name || signerDisplay}</div>
              <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
                Digitally signed by <strong>${signerDisplay}</strong> on ${formatDate(contract.signed_at, true)}
              </div>
            </div>
            <div>
              <div class="label-sm">Digital Verification Seal</div>
              <div class="cert-box">
                <div style="font-weight: 700; margin-bottom: 2px;">✓ Verified Digital Record</div>
                <div>This contract is officially registered and timestamped in the Foreigners Hub system.</div>
                <div style="font-family: monospace; font-size: 9px; color: #166534; margin-top: 6px; word-break: break-all;">
                  ID: ${contract.id}
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }, 200);
  };

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-900">Signed contract</p>
            <p className="text-xs text-slate-500">
              Signed by {signerDisplay} on {formatDate(contract.signed_at)}
            </p>
          </div>
          <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
            On file
          </span>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex w-full cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-left transition-all hover:border-brand/40 hover:bg-brand/[0.02] hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand transition-transform group-hover:scale-105">
                <FileText size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 transition-colors group-hover:text-brand">
                  Preview & Download Contract
                </p>
                <p className="text-[11px] text-slate-500">
                  View signed document, terms & save as PDF
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-brand">
              <span>Preview</span>
              <Eye size={14} className="transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>

          {contract.document_path && (
            <a
              href={contract.document_path}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-dark"
            >
              <ExternalLink size={13} />
              Direct document attachment
            </a>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5">
          <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="no-print flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-950">
                    Signed Rental Agreement
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Ref: {contract.id}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-dark cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Download / Print PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto p-4 sm:p-6 bg-slate-100/60">
              {/* Document Sheet */}
              <div
                id="printable-contract"
                className="mx-auto rounded-xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm text-slate-800"
              >
                {/* Document Letterhead */}
                <div className="border-b-2 border-slate-900 pb-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h1 className="text-2xl font-black tracking-tight text-slate-950">
                        FOREIGNERS HUB
                      </h1>
                      <p className="text-xs font-bold uppercase tracking-wider text-brand">
                        Official Rental Agreement & Liability Contract
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700 border border-green-200">
                        <CheckCircle size={12} />
                        Signed & Binding
                      </span>
                      <p className="mt-1 text-[11px] text-slate-500 font-mono">
                        Version: {contract.version || "1.0"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Parties Details */}
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 text-xs">
                  <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3.5">
                    <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-1.5">
                      Service Provider
                    </p>
                    <p className="font-bold text-slate-900 text-sm">Foreigners Hub</p>
                    <p className="text-slate-600 mt-0.5">Mobility & Rental Services</p>
                    <p className="text-slate-500 mt-0.5">support@foreignershub.com</p>
                  </div>

                  <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3.5">
                    <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-1.5">
                      Renter (Signatory)
                    </p>
                    <p className="font-bold text-slate-900 text-sm">{signerDisplay}</p>
                    <p className="text-slate-600 mt-0.5">{userEmail || "Verified User"}</p>
                    <p className="text-slate-500 mt-0.5">
                      Signed: {formatDate(contract.signed_at, true)}
                    </p>
                  </div>
                </div>

                {/* Rental Item & Financial Terms */}
                <div className="mt-6 rounded-lg border border-slate-200 overflow-hidden text-xs">
                  <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800">
                    Rental Specifications
                  </div>
                  <div className="divide-y divide-slate-100 bg-white">
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-slate-500">Rented Asset</span>
                      <span className="font-bold text-slate-900">
                        {itemName} {itemCode ? `(${itemCode})` : ""}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-slate-500">Rental Plan</span>
                      <span className="font-medium text-slate-800">{planName}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-slate-500">Rental Period</span>
                      <span className="font-medium text-slate-800">
                        {formatDate(rental?.start_date)} to {formatDate(rental?.end_date)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-slate-500">Rental Amount</span>
                      <span className="font-medium text-slate-800">{formatCurrency(rentalFee)}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-slate-500">Security Deposit</span>
                      <span className="font-medium text-slate-800">{formatCurrency(depositAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50/60 px-4 py-2.5 font-bold">
                      <span className="text-slate-900">Total Contract Value</span>
                      <span className="text-brand text-sm">{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions Section */}
                <div className="mt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2.5">
                    Rental Agreement Terms
                  </h4>
                  <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/50 p-4 text-xs leading-relaxed text-slate-600">
                    {parsedTerms.map((term, idx) => (
                      <p key={idx} className="text-slate-700">
                        {term}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Digital Signature Block */}
                <div className="mt-8 border-t-2 border-slate-200 pt-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Authorized Electronic Signature
                      </p>
                      <div className="flex h-16 items-center rounded-lg border border-slate-200 bg-slate-50/50 px-4">
                        <span className="font-serif text-2xl italic tracking-wide text-slate-900">
                          {contract.signature_data || contract.signer_name || signerDisplay}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[11px] text-slate-500">
                        Digitally signed by <span className="font-bold text-slate-700">{signerDisplay}</span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Timestamp: {formatDate(contract.signed_at, true)}
                      </p>
                    </div>

                    <div className="flex flex-col justify-end">
                      <div className="rounded-lg border border-green-200 bg-green-50/50 p-3 text-xs text-green-900">
                        <div className="flex items-center gap-1.5 font-bold">
                          <ShieldCheck size={16} className="text-green-600" />
                          <span>Digital Signature Verified</span>
                        </div>
                        <p className="mt-1 text-[10px] text-green-800 leading-normal">
                          This record was legally generated and cryptographically confirmed in the Foreigners Hub system.
                        </p>
                        <p className="mt-1.5 font-mono text-[9px] text-green-700 truncate">
                          ID: {contract.id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Footer */}
            <div className="no-print flex items-center justify-between border-t border-slate-200 bg-white px-5 py-3.5">
              <span className="text-xs text-slate-500">
                You can download or save a PDF copy for your personal records.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white hover:bg-brand-dark cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download / Print PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
