"use client";

import { useMemo, useState } from "react";
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  ShieldCheck,
  Calendar,
  Search,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  RefreshCw,
  Bike,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function formatDate(dateStr, withTime = false) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    }).format(d);
  } catch {
    return dateStr;
  }
}

export default function FinancePanel({
  payments = [],
  rentals = [],
  extensions = [],
  setActiveTab,
}) {
  const [datePreset, setDatePreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Quick Date Preset Handler
  function handlePresetChange(preset) {
    setDatePreset(preset);
    const now = new Date();

    if (preset === "all") {
      setStartDate("");
      setEndDate("");
    } else if (preset === "today") {
      const todayStr = now.toISOString().split("T")[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === "yesterday") {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split("T")[0];
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (preset === "7days") {
      const past = new Date(now);
      past.setDate(past.getDate() - 7);
      setStartDate(past.toISOString().split("T")[0]);
      setEndDate(now.toISOString().split("T")[0]);
    } else if (preset === "thisMonth") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];
      setStartDate(firstDay);
      setEndDate(lastDay);
    } else if (preset === "lastMonth") {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        .toISOString()
        .split("T")[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
        .toISOString()
        .split("T")[0];
      setStartDate(firstDay);
      setEndDate(lastDay);
    } else if (preset === "thisYear") {
      const firstDay = new Date(now.getFullYear(), 0, 1)
        .toISOString()
        .split("T")[0];
      const todayStr = now.toISOString().split("T")[0];
      setStartDate(firstDay);
      setEndDate(todayStr);
    }
  }

  // Filter Payments based on date, search, status, and type
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const paymentDate = new Date(
        payment.payment_date || payment.submitted_at || payment.created_at
      );

      // Date Range
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (paymentDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (paymentDate > end) return false;
      }

      // Status
      if (statusFilter !== "all" && payment.status !== statusFilter) {
        return false;
      }

      // Type (Rental vs Extension)
      const isExtension = Boolean(
        payment.rental_extensions?.length ||
          payment.payment_reference?.toLowerCase().includes("ext")
      );
      if (typeFilter === "rental" && isExtension) return false;
      if (typeFilter === "extension" && !isExtension) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const profile = payment.profiles;
        const name = `${profile?.first_name || ""} ${profile?.last_name || ""}`.toLowerCase();
        const email = (profile?.email || "").toLowerCase();
        const phone = (profile?.phone || "").toLowerCase();
        const ref = (payment.payment_reference || "").toLowerCase();
        const bikeName = (payment.rentals?.bikes?.name || "").toLowerCase();
        const bikeCode = (payment.rentals?.bikes?.b_code || "").toLowerCase();

        if (
          !name.includes(q) &&
          !email.includes(q) &&
          !phone.includes(q) &&
          !ref.includes(q) &&
          !bikeName.includes(q) &&
          !bikeCode.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [payments, startDate, endDate, statusFilter, typeFilter, searchQuery]);

  // Compute Metrics dynamically based on filtered data
  const metrics = useMemo(() => {
    let verifiedRevenue = 0;
    let pendingRevenue = 0;
    let rejectedRevenue = 0;
    let verifiedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;
    let rentalRevenue = 0;
    let extensionRevenue = 0;
    let totalDeposits = 0;

    for (const payment of filteredPayments) {
      const amt = Number(payment.amount || 0);
      const isExtension = Boolean(
        payment.rental_extensions?.length ||
          payment.payment_reference?.toLowerCase().includes("ext")
      );

      if (payment.status === "VERIFIED") {
        verifiedRevenue += amt;
        verifiedCount += 1;
        if (isExtension) {
          extensionRevenue += amt;
        } else {
          rentalRevenue += amt;
          // Count deposit if attached to rental
          const deposit = Number(payment.rentals?.deposit_amount || 0);
          if (deposit > 0) {
            totalDeposits += deposit;
          }
        }
      } else if (payment.status === "PAYMENT_SUBMITTED") {
        pendingRevenue += amt;
        pendingCount += 1;
      } else if (payment.status === "REJECTED") {
        rejectedRevenue += amt;
        rejectedCount += 1;
      }
    }

    const netOperatingRevenue = Math.max(0, verifiedRevenue - totalDeposits);
    const avgOrderValue = verifiedCount > 0 ? verifiedRevenue / verifiedCount : 0;

    return {
      verifiedRevenue,
      pendingRevenue,
      rejectedRevenue,
      verifiedCount,
      pendingCount,
      rejectedCount,
      rentalRevenue,
      extensionRevenue,
      totalDeposits,
      netOperatingRevenue,
      avgOrderValue,
      totalCount: filteredPayments.length,
    };
  }, [filteredPayments]);

  // Export to CSV functionality
  function exportToCsv() {
    if (!filteredPayments.length) return;

    const headers = [
      "Payment ID",
      "Date",
      "Customer Name",
      "Email",
      "Phone",
      "Type",
      "Bike Asset",
      "Amount (EUR)",
      "Status",
      "Reference",
    ];

    const rows = filteredPayments.map((p) => {
      const isExt = Boolean(
        p.rental_extensions?.length ||
          p.payment_reference?.toLowerCase().includes("ext")
      );
      const name = `${p.profiles?.first_name || ""} ${p.profiles?.last_name || ""}`.trim() || "Customer";
      const bike = p.rentals?.bikes ? `${p.rentals.bikes.name} (${p.rentals.bikes.b_code})` : "Unassigned";

      return [
        p.id,
        formatDate(p.payment_date || p.submitted_at || p.created_at, true),
        `"${name.replace(/"/g, '""')}"`,
        `"${(p.profiles?.email || "").replace(/"/g, '""')}"`,
        `"${(p.profiles?.phone || "").replace(/"/g, '""')}"`,
        isExt ? "Extension" : "Initial Rental",
        `"${bike.replace(/"/g, '""')}"`,
        Number(p.amount || 0).toFixed(2),
        p.status,
        `"${(p.payment_reference || "").replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new window.Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ForeignersHub_Finances_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function resetFilters() {
    setDatePreset("all");
    setStartDate("");
    setEndDate("");
    setStatusFilter("all");
    setTypeFilter("all");
    setSearchQuery("");
  }

  return (
    <div className="space-y-8">
      {/* ── Top Header & Actions ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-950">Financial Analytics &amp; Revenue</h2>
          <p className="mt-1 text-sm text-slate-600">
            Real-time tracking of verified earnings, incoming submissions, and refundable deposits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="flex items-center gap-1.5 rounded-xl border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            <RefreshCw size={13} />
            Reset Filters
          </Button>

          <Button
            onClick={exportToCsv}
            disabled={!filteredPayments.length}
            className="flex items-center gap-1.5 rounded-xl bg-brand text-xs font-bold text-white shadow-sm hover:bg-brand/90"
          >
            <Download size={13} />
            Export CSV ({filteredPayments.length})
          </Button>
        </div>
      </div>

      {/* ── Comprehensive Filter Bar ── */}
      <div className="premium-card rounded-2xl p-5 border border-slate-200/80 bg-white">
        <div className="space-y-4">
          {/* Preset Buttons */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Calendar size={15} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Date Preset
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "All Time" },
                { id: "today", label: "Today" },
                { id: "yesterday", label: "Yesterday" },
                { id: "7days", label: "Last 7 Days" },
                { id: "thisMonth", label: "This Month" },
                { id: "lastMonth", label: "Last Month" },
                { id: "thisYear", label: "This Year" },
                { id: "custom", label: "Custom Range" },
              ].map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetChange(preset.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    datePreset === preset.id
                      ? "bg-brand text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker Range + Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDatePreset("custom");
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-brand focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDatePreset("custom");
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-brand focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Payment Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-brand focus:bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="VERIFIED">Verified (Received)</option>
                <option value="PAYMENT_SUBMITTED">Pending Verification</option>
                <option value="REJECTED">Rejected</option>
                <option value="AWAITING_PAYMENT">Awaiting Payment</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Revenue Stream
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-brand focus:bg-white"
              >
                <option value="all">All Revenue Streams</option>
                <option value="rental">Initial Rentals</option>
                <option value="extension">Rental Extensions</option>
              </select>
            </div>
          </div>

          {/* Search Input */}
          <div className="pt-2">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer name, email, phone, reference code, or bike..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand focus:bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Metric Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Verified Revenue */}
        <div className="premium-card rounded-2xl p-5 border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 via-white to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Verified Revenue
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-950">
            {formatCurrency(metrics.verifiedRevenue)}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{metrics.verifiedCount} verified transaction{metrics.verifiedCount === 1 ? "" : "s"}</span>
            <span className="font-semibold text-emerald-600">Received</span>
          </div>
        </div>

        {/* Pending Inflow */}
        <div className="premium-card rounded-2xl p-5 border border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-white to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Pending Verification
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Clock size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-950">
            {formatCurrency(metrics.pendingRevenue)}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{metrics.pendingCount} awaiting approval</span>
            {metrics.pendingCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("payments")}
                className="font-bold text-brand hover:underline cursor-pointer"
              >
                Review →
              </button>
            )}
          </div>
        </div>

        {/* Security Deposits Held */}
        <div className="premium-card rounded-2xl p-5 border border-blue-200/80 bg-gradient-to-br from-blue-50/70 via-white to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Deposits Held
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <ShieldCheck size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-950">
            {formatCurrency(metrics.totalDeposits)}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Refundable on return</span>
            <span className="text-[11px] font-semibold text-blue-600">€50 / new customer</span>
          </div>
        </div>

        {/* Net Operating Revenue */}
        <div className="premium-card rounded-2xl p-5 border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Net Rental Income
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-950">
            {formatCurrency(metrics.netOperatingRevenue)}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Revenue minus deposits</span>
            <span className="font-semibold text-slate-700">
              Avg {formatCurrency(metrics.avgOrderValue)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Revenue Stream & Breakdown Analytics ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stream Breakdown */}
        <div className="premium-card rounded-2xl p-6 border border-slate-200/80 bg-white">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
            Revenue by Stream
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-700">Initial Bike Rentals</span>
                <span className="text-slate-900">
                  {formatCurrency(metrics.rentalRevenue)}{" "}
                  <span className="text-slate-400 font-normal">
                    (
                    {metrics.verifiedRevenue > 0
                      ? Math.round((metrics.rentalRevenue / metrics.verifiedRevenue) * 100)
                      : 0}
                    %)
                  </span>
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-500"
                  style={{
                    width: `${
                      metrics.verifiedRevenue > 0
                        ? Math.min(100, Math.round((metrics.rentalRevenue / metrics.verifiedRevenue) * 100))
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-700">Rental Extensions</span>
                <span className="text-slate-900">
                  {formatCurrency(metrics.extensionRevenue)}{" "}
                  <span className="text-slate-400 font-normal">
                    (
                    {metrics.verifiedRevenue > 0
                      ? Math.round((metrics.extensionRevenue / metrics.verifiedRevenue) * 100)
                      : 0}
                    %)
                  </span>
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-purple-600 transition-all duration-500"
                  style={{
                    width: `${
                      metrics.verifiedRevenue > 0
                        ? Math.min(100, Math.round((metrics.extensionRevenue / metrics.verifiedRevenue) * 100))
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="premium-card rounded-2xl p-6 border border-slate-200/80 bg-white">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
            Payment Status Distribution
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-center">
              <CheckCircle2 size={16} className="mx-auto text-emerald-600 mb-1" />
              <p className="text-[11px] font-bold text-emerald-800 uppercase">Verified</p>
              <p className="text-lg font-extrabold text-slate-950 mt-0.5">{metrics.verifiedCount}</p>
              <p className="text-[10px] text-slate-500 font-semibold">{formatCurrency(metrics.verifiedRevenue)}</p>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-center">
              <Clock size={16} className="mx-auto text-amber-600 mb-1" />
              <p className="text-[11px] font-bold text-amber-800 uppercase">Pending</p>
              <p className="text-lg font-extrabold text-slate-950 mt-0.5">{metrics.pendingCount}</p>
              <p className="text-[10px] text-slate-500 font-semibold">{formatCurrency(metrics.pendingRevenue)}</p>
            </div>

            <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-center">
              <XCircle size={16} className="mx-auto text-rose-600 mb-1" />
              <p className="text-[11px] font-bold text-rose-800 uppercase">Rejected</p>
              <p className="text-lg font-extrabold text-slate-950 mt-0.5">{metrics.rejectedCount}</p>
              <p className="text-[10px] text-slate-500 font-semibold">{formatCurrency(metrics.rejectedRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Detailed Financial Transactions Ledger ── */}
      <div className="premium-card rounded-2xl overflow-hidden border border-slate-200/80 bg-white">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-slate-950 text-base">Transaction Ledger</h3>
            <p className="text-xs text-slate-500">
              Showing {filteredPayments.length} transaction{filteredPayments.length === 1 ? "" : "s"} matching current criteria.
            </p>
          </div>

          {(startDate || endDate || statusFilter !== "all" || typeFilter !== "all" || searchQuery) && (
            <div className="inline-flex items-center gap-1.5 text-xs text-brand font-semibold">
              <Filter size={12} /> Active filters applied
            </div>
          )}
        </div>

        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
              <Search size={20} />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">No transactions found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No financial records match the selected date range or filter criteria. Try adjusting or resetting filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="mt-4 rounded-xl text-xs font-semibold"
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Asset / Bike</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredPayments.map((p) => {
                  const isExt = Boolean(
                    p.rental_extensions?.length ||
                      p.payment_reference?.toLowerCase().includes("ext")
                  );
                  const name =
                    `${p.profiles?.first_name || ""} ${p.profiles?.last_name || ""}`.trim() ||
                    "Customer";
                  const phone = p.profiles?.phone || "";
                  const bike = p.rentals?.bikes;
                  const isPending = p.status === "PAYMENT_SUBMITTED";

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Date */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {formatDate(p.payment_date || p.submitted_at || p.created_at, true)}
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{name}</div>
                        <div className="text-[11px] text-slate-500">{p.profiles?.email}</div>
                        {phone && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            📞 {phone}
                          </div>
                        )}
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isExt
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {isExt ? "Extension" : "Rental"}
                        </span>
                      </td>

                      {/* Bike */}
                      <td className="py-3.5 px-4">
                        {bike ? (
                          <div>
                            <span className="font-semibold text-slate-900">{bike.name}</span>
                            <span className="block text-[10px] font-mono text-slate-400">
                              {bike.b_code}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Pending Assignment</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-extrabold text-sm text-slate-950">
                        {formatCurrency(p.amount)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            p.status === "VERIFIED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : p.status === "PAYMENT_SUBMITTED"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : p.status === "REJECTED"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {p.status === "PAYMENT_SUBMITTED"
                            ? "Pending Review"
                            : p.status === "VERIFIED"
                            ? "Verified"
                            : p.status}
                        </span>
                      </td>

                      {/* Reference */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {p.payment_reference || "—"}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isPending ? (
                          <button
                            type="button"
                            onClick={() => setActiveTab("payments")}
                            className="inline-flex items-center gap-1 rounded-lg bg-brand px-2.5 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-brand/90 cursor-pointer"
                          >
                            Review <ArrowUpRight size={11} />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
