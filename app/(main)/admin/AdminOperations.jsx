"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Bike,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Eye,
  FileText,
  ImageIcon,
  Loader2,
  Search,
  Trash2,
  Users,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteBike,
  rejectPayment,
  saveApartment,
  saveApartmentCategory,
  saveBike,
  saveBikeCategory,
  saveSettings,
  updateRepairRequestStatus,
  verifyPayment,
} from "@/app/actions/admin";
import { getPaymentStatusMeta, getRentalStatusMeta } from "@/lib/rental-status";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "payments", label: "Payments" },
  { id: "rentals", label: "Rentals" },
  { id: "extensions", label: "Extensions" },
  { id: "bikes", label: "Bikes" },
  { id: "apartments", label: "Apartments" },
  { id: "users", label: "Users" },
  { id: "contracts", label: "Contracts" },
  { id: "repairs", label: "Repairs" },
  { id: "calendar", label: "Calendar" },
  { id: "settings", label: "⚙ Settings" },
];

const bikeStatuses = ["AVAILABLE", "RESERVED", "RENTED", "MAINTENANCE", "INACTIVE"];
const apartmentStatuses = ["AVAILABLE", "RENTED", "MAINTENANCE", "INACTIVE"];
const repairStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

function formatDate(value, withTime = false) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(new Date(value));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value || 0));
}

function personName(profile) {
  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
  return name || profile?.email || "Customer";
}

function searchable(value) {
  return JSON.stringify(value || {}).toLowerCase();
}

function StatusBadge({ children, className = "bg-slate-100 text-slate-700" }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${className}`}>
      {children}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Select({ name, defaultValue, children }) {
  return (
    <select
      name={name}
      defaultValue={defaultValue || ""}
      className="flex h-11 w-full rounded-lg border border-slate-200 bg-white/85 px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
    >
      {children}
    </select>
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`min-h-24 w-full rounded-lg border border-slate-200 bg-white/85 px-3.5 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 ${props.className || ""}`}
    />
  );
}

function SearchBox({ value, onChange, placeholder }) {
  return (
    <div className="relative w-full sm:max-w-sm">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}

function ActionButton({ action, children, variant, className }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <div>
      <Button
        size="sm"
        variant={variant}
        className={className}
        disabled={isPending}
        onClick={() => {
          setError("");
          startTransition(async () => {
            try {
              await action();
            } catch (err) {
              setError(err.message || "Admin action failed.");
            }
          });
        }}
      >
        {isPending && <Loader2 size={14} className="animate-spin" />}
        {children}
      </Button>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}

function FormShell({ title, children, action, className = "rounded-xl border border-slate-200 bg-white p-5", onSaved }) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setMessage("");
        startTransition(async () => {
          try {
            await action(formData);
            setMessage("Saved.");
            onSaved?.();
          } catch (err) {
            setMessage(err.message || "Could not save.");
          }
        });
      }}
      className={className}
    >
      <h3 className="mb-4 text-sm font-bold text-slate-900">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
      <div className="mt-5 flex items-center gap-3">
        <Button size="sm" disabled={isPending}>
          {isPending && <Loader2 size={14} className="animate-spin" />}
          Save
        </Button>
        {message && <p className="text-sm text-slate-500">{message}</p>}
      </div>
    </form>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-extrabold text-slate-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[calc(90vh-70px)] overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

function Overview({ stats, payments, rentals, repairs }) {
  const cards = [
    { label: "Active rentals", value: stats.activeRentals, icon: Bike, tone: "border-l-brand" },
    { label: "Pending payments", value: stats.pendingPayments, icon: CreditCard, tone: "border-l-orange-DEFAULT" },
    { label: "Upcoming returns", value: stats.upcomingReturns, icon: CalendarDays, tone: "border-l-brand" },
    { label: "Overdue rentals", value: stats.overdueRentals, icon: XCircle, tone: "border-l-danger" },
    { label: "Available bikes", value: stats.availableBikes, icon: CheckCircle2, tone: "border-l-green-DEFAULT" },
    { label: "Rented bikes", value: stats.rentedBikes, icon: Bike, tone: "border-l-slate-700" },
    { label: "Maintenance bikes", value: stats.maintenanceBikes, icon: Wrench, tone: "border-l-orange-DEFAULT" },
    { label: "Total users", value: stats.totalUsers, icon: Users, tone: "border-l-brand" },
    { label: "Pending repairs", value: stats.pendingRepairs, icon: Wrench, tone: "border-l-danger" },
    { label: "Pending extensions", value: stats.pendingExtensions, icon: CalendarDays, tone: "border-l-brand" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`premium-card rounded-2xl border-l-4 ${card.tone} p-5`}>
              <p className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
                <Icon size={16} className="text-brand" />
                {card.label}
              </p>
              <p className="text-3xl font-extrabold text-slate-950">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Payment submissions awaiting verification">
          <PaymentList payments={payments.filter((payment) => payment.status === "PAYMENT_SUBMITTED").slice(0, 5)} compact />
        </Panel>
        <Panel title="Upcoming and overdue returns">
          <RentalList
            rentals={rentals
              .filter((rental) => rental.status === "ACTIVE")
              .sort((a, b) => new Date(a.end_date || 0) - new Date(b.end_date || 0))
              .slice(0, 5)}
            compact
          />
        </Panel>
        <Panel title="Pending repair requests">
          <RepairList repairs={repairs.filter((repair) => repair.status === "PENDING").slice(0, 5)} compact />
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section className="premium-card rounded-2xl p-6">
      <h2 className="mb-5 text-xl font-extrabold text-slate-950">{title}</h2>
      {children}
    </section>
  );
}

function PaymentList({ payments, compact = false }) {
  if (!payments.length) {
    return <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No payments found.</p>;
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => {
        const meta = getPaymentStatusMeta(payment.status);
        const rental = payment.rentals;
        const extension = payment.rental_extensions?.[0];
        return (
          <div key={payment.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusBadge className={meta.className}>{meta.label}</StatusBadge>
                  <span className="text-xs text-slate-500">{formatDate(payment.payment_date || payment.created_at, true)}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{personName(payment.profiles)}</h3>
                <p className="text-xs text-slate-500">{payment.profiles?.email}</p>
                <p className="mt-2 text-sm text-slate-700">
                  {rental?.bikes?.name || "Bike"} {rental?.bikes?.b_code ? `(${rental.bikes.b_code})` : ""}
                </p>
                {extension && (
                  <p className="mt-1 text-xs font-semibold text-brand">
                    Extension payment · proposed return {formatDate(extension.proposed_end_date)}
                  </p>
                )}
                {!compact && (
                  <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                    <span>Plan: {rental?.rental_pricing_plans?.name || "Not set"}</span>
                    <span>Rental: {formatCurrency(Number(rental?.total_amount || 0) - Number(rental?.deposit_amount || 0))}</span>
                    <span>Deposit: {formatCurrency(rental?.deposit_amount)}</span>
                    <span>Reference: {payment.payment_reference || "Not provided"}</span>
                    {payment.rejection_reason && <span>Rejection: {payment.rejection_reason}</span>}
                  </div>
                )}
              </div>
              <div className="min-w-32 text-left md:text-right">
                <p className="text-lg font-extrabold text-slate-950">{formatCurrency(payment.amount)}</p>
                {payment.status === "PAYMENT_SUBMITTED" && (
                  <div className="mt-3 flex flex-wrap gap-2 md:justify-end">
                    <ActionButton
                      action={() => verifyPayment(payment.id)}
                      className="bg-green-600 text-white hover:bg-green-700"
                    >
                      Verify
                    </ActionButton>
                    <ActionButton
                      action={() => {
                        const reason = window.prompt("Reason for rejection?") || "";
                        return rejectPayment(payment.id, reason);
                      }}
                      variant="outline"
                      className="border-danger/30 text-danger hover:bg-danger/5"
                    >
                      Reject
                    </ActionButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ExtensionsPanel({ extensions }) {
  const [query, setQuery] = useState("");
  const filtered = extensions.filter((extension) => searchable(extension).includes(query.toLowerCase()));

  return (
    <Panel title="Rental extensions">
      <div className="mb-5">
        <SearchBox value={query} onChange={setQuery} placeholder="Search extensions..." />
      </div>
      <div className="space-y-3">
        {filtered.map((extension) => (
          <div key={extension.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <StatusBadge className="bg-slate-100 text-slate-700">
                  {extension.status.replace("_", " ")}
                </StatusBadge>
                <h3 className="mt-2 text-sm font-bold text-slate-900">{personName(extension.profiles)}</h3>
                <p className="text-xs text-slate-500">{extension.profiles?.email}</p>
                <p className="mt-2 text-sm text-slate-700">
                  {extension.rentals?.bikes?.name || "Bike"}
                  {extension.rentals?.bikes?.b_code ? ` (${extension.rentals.bikes.b_code})` : ""}
                </p>
                <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                  <span>Plan: {extension.rental_pricing_plans?.name || "Not set"}</span>
                  <span>Amount: {formatCurrency(extension.amount)}</span>
                  <span>Deposit: {formatCurrency(extension.deposit_amount)}</span>
                  <span>New return: {formatDate(extension.proposed_end_date)}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">Requested {formatDate(extension.requested_at, true)}</p>
            </div>
          </div>
        ))}
        {!filtered.length && (
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            No extension requests found.
          </p>
        )}
      </div>
    </Panel>
  );
}

function RentalList({ rentals, compact = false }) {
  if (!rentals.length) {
    return <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No rentals found.</p>;
  }

  return (
    <div className="space-y-3">
      {rentals.map((rental) => {
        const meta = getRentalStatusMeta(rental.status);
        const latestPayment = [...(rental.payments || [])].sort((a, b) => new Date(b.created_at || b.payment_date || 0) - new Date(a.created_at || a.payment_date || 0))[0];
        const paymentMeta = latestPayment ? getPaymentStatusMeta(latestPayment.status) : null;

        return (
          <div key={rental.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusBadge className={meta.className}>{meta.label}</StatusBadge>
                  {paymentMeta && <StatusBadge className={paymentMeta.className}>{paymentMeta.label}</StatusBadge>}
                </div>
                <h3 className="text-sm font-bold text-slate-900">{personName(rental.profiles)}</h3>
                <p className="text-xs text-slate-500">{rental.profiles?.email}</p>
                <p className="mt-2 text-sm text-slate-700">
                  {rental.bikes?.name || rental.apartments?.name || "Rental"}
                  {rental.bikes?.b_code ? ` (${rental.bikes.b_code})` : ""}
                </p>
                {!compact && (
                  <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2 lg:grid-cols-3">
                    <span>Plan: {rental.rental_pricing_plans?.name || "Not set"}</span>
                    <span>Start: {formatDate(rental.start_date)}</span>
                    <span>End: {formatDate(rental.end_date)}</span>
                    <span>Deposit: {formatCurrency(rental.deposit_amount)}</span>
                    <span>Created: {formatDate(rental.created_at, true)}</span>
                  </div>
                )}
              </div>
              <p className="text-sm font-bold text-slate-900">{formatCurrency(rental.total_amount)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BikeForm({ bike, categories, onSaved }) {
  return (
    <FormShell title={bike ? `Edit ${bike.b_code}` : "Add bike"} action={saveBike} onSaved={onSaved}>
      {bike && <input type="hidden" name="id" defaultValue={bike.id} />}
      <Field label="B-Code">
        <Input name="b_code" defaultValue={bike?.b_code || ""} required />
      </Field>
      <Field label="Name">
        <Input name="name" defaultValue={bike?.name || ""} required />
      </Field>
      <Field label="Status">
        <Select name="status" defaultValue={bike?.status || "AVAILABLE"}>
          {bikeStatuses.map((status) => <option key={status}>{status}</option>)}
        </Select>
      </Field>
      <Field label="Category">
        <Select name="category_id" defaultValue={bike?.category_id || ""}>
          <option value="">No category</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </Select>
      </Field>
      <Field label="Bike image">
        <Input name="image_file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" />
        <p className="text-xs leading-5 text-slate-500">
          Upload a JPG, PNG, WebP, or GIF from your machine. Max 5MB.
        </p>
      </Field>
      <Field label="Image URL">
        <Input name="image_url" defaultValue={bike?.image_url || ""} placeholder="Optional external image URL" />
      </Field>
      <Field label="Specifications JSON">
        <Textarea name="specifications" defaultValue={JSON.stringify(bike?.specifications || {}, null, 2)} />
        <p className="text-xs leading-5 text-slate-500">
          Structured bike facts for display, such as battery, range, motor, brakes, max speed, or accessories.
        </p>
      </Field>
      <div className="md:col-span-2">
        <Field label="Description">
          <Textarea name="description" defaultValue={bike?.description || ""} />
        </Field>
      </div>
    </FormShell>
  );
}

function DeleteBikeButton({ bike, onDeleted }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        className="border-danger/30 text-danger hover:bg-danger/5"
        disabled={isPending}
        onClick={() => {
          if (!confirm(`Delete ${bike.b_code}? This cannot be undone.`)) return;

          setError("");
          startTransition(async () => {
            try {
              const formData = new FormData();
              formData.set("id", bike.id);
              await deleteBike(formData);
              onDeleted?.();
            } catch (err) {
              setError(err.message || "Bike could not be deleted.");
            }
          });
        }}
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        Delete bike
      </Button>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}

function BikeDetailsModal({ bike, categories, onClose }) {
  const specs = bike.specifications && typeof bike.specifications === "object"
    ? Object.entries(bike.specifications)
    : [];

  return (
    <Modal title={`${bike.b_code} · ${bike.name}`} onClose={onClose}>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <div className="aspect-[4/3]">
              {bike.image_url ? (
                <img src={bike.image_url} alt={bike.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon size={48} className="text-slate-300" />
                </div>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              <StatusBadge className="bg-slate-900 text-white">{bike.b_code}</StatusBadge>
              <StatusBadge className={bike.status === "AVAILABLE" ? "bg-green-light text-green-dark" : "bg-slate-100 text-slate-700"}>
                {bike.status}
              </StatusBadge>
            </div>
            <h3 className="text-lg font-extrabold text-slate-950">{bike.name}</h3>
            <p className="text-sm text-slate-500">{bike.bike_categories?.name || "No category"}</p>
            {bike.description && (
              <p className="mt-3 text-sm leading-6 text-slate-600">{bike.description}</p>
            )}
            {specs.length > 0 && (
              <div className="mt-4 grid gap-2 text-xs text-slate-600">
                {specs.map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2">
                    <span className="font-semibold capitalize">{key.replace(/_/g, " ")}</span>
                    <span className="truncate text-slate-500">{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DeleteBikeButton bike={bike} onDeleted={onClose} />
        </aside>
        <BikeForm bike={bike} categories={categories} onSaved={onClose} />
      </div>
    </Modal>
  );
}

function BikeInventoryCard({ bike, onOpen }) {
  const specs = bike.specifications && typeof bike.specifications === "object"
    ? Object.entries(bike.specifications).slice(0, 4)
    : [];

  return (
    <article className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex w-full flex-col">
        <button type="button" onClick={onOpen} className="block text-left">
          <div className="aspect-[4/3] overflow-hidden bg-slate-100">
            {bike.image_url ? (
              <img src={bike.image_url} alt={bike.name} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon size={46} className="text-slate-300" />
              </div>
            )}
          </div>
        </button>
        <div className="flex flex-1 flex-col space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge className="bg-slate-900 text-white">{bike.b_code}</StatusBadge>
            <StatusBadge className={bike.status === "AVAILABLE" ? "bg-green-light text-green-dark" : "bg-slate-100 text-slate-700"}>
              {bike.status}
            </StatusBadge>
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-950">{bike.name}</h3>
            <p className="text-sm text-slate-500">{bike.bike_categories?.name || "No category"}</p>
          </div>
          {bike.description && (
            <p className="line-clamp-3 text-sm leading-6 text-slate-600">{bike.description}</p>
          )}
          {specs.length > 0 && (
            <div className="grid gap-2 text-xs text-slate-600">
              {specs.map(([key, value]) => (
                <div key={key} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                  <span className="font-semibold capitalize">{key.replace(/_/g, " ")}</span>
                  <span className="truncate text-slate-500">{String(value)}</span>
                </div>
              ))}
            </div>
          )}
          <Button type="button" variant="outline" className="mt-auto w-full" onClick={onOpen}>
            <Eye size={16} />
            View / edit
          </Button>
        </div>
      </div>
    </article>
  );
}

function BikeCategoryForm({ category }) {
  return (
    <FormShell title={category ? `Edit category: ${category.name}` : "Add bike category"} action={saveBikeCategory}>
      {category && <input type="hidden" name="id" defaultValue={category.id} />}
      <Field label="Name">
        <Input name="name" defaultValue={category?.name || ""} required />
      </Field>
      <Field label="Description">
        <Input name="description" defaultValue={category?.description || ""} />
      </Field>
    </FormShell>
  );
}

function BikeManagement({ bikes, categories }) {
  const [query, setQuery] = useState("");
  const [selectedBike, setSelectedBike] = useState(null);
  const [isAddingBike, setIsAddingBike] = useState(false);
  const filtered = bikes.filter((bike) => searchable(bike).includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBox value={query} onChange={setQuery} placeholder="Search bikes..." />
        <Button type="button" onClick={() => setIsAddingBike(true)}>Add bike</Button>
      </div>
      {isAddingBike && (
        <Modal title="Add bike" onClose={() => setIsAddingBike(false)}>
          <BikeForm categories={categories} onSaved={() => setIsAddingBike(false)} />
        </Modal>
      )}
      {selectedBike && (
        <BikeDetailsModal
          bike={selectedBike}
          categories={categories}
          onClose={() => setSelectedBike(null)}
        />
      )}
      <Panel title="Bike categories">
        <div className="grid gap-4 lg:grid-cols-2">
          <BikeCategoryForm />
          {categories.map((category) => <BikeCategoryForm key={category.id} category={category} />)}
        </div>
      </Panel>
      <Panel title="Bikes">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((bike) => (
            <BikeInventoryCard
              key={bike.id}
              bike={bike}
              onOpen={() => setSelectedBike(bike)}
            />
          ))}
          {!filtered.length && <p className="text-sm text-slate-500">No bikes match this search.</p>}
        </div>
      </Panel>
    </div>
  );
}

function ApartmentForm({ apartment, categories }) {
  const priceInfo = apartment?.price_info || {};
  const amenities = Array.isArray(apartment?.amenities) ? apartment.amenities.join("\n") : "";
  const imageUrls = Array.isArray(apartment?.image_urls) ? apartment.image_urls.join("\n") : "";

  return (
    <FormShell title={apartment ? `Edit ${apartment.name}` : "Add apartment"} action={saveApartment}>
      {apartment && <input type="hidden" name="id" defaultValue={apartment.id} />}
      <Field label="Name">
        <Input name="name" defaultValue={apartment?.name || ""} required />
      </Field>
      <Field label="Status">
        <Select name="status" defaultValue={apartment?.status || "AVAILABLE"}>
          {apartmentStatuses.map((status) => <option key={status}>{status}</option>)}
        </Select>
      </Field>
      <Field label="Category">
        <Select name="category_id" defaultValue={apartment?.category_id || ""}>
          <option value="">No category</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </Select>
      </Field>
      <Field label="Bedrooms">
        <Input name="bedrooms" type="number" min="0" defaultValue={apartment?.bedrooms || ""} />
      </Field>
      <Field label="Location">
        <Input name="location" defaultValue={apartment?.location || ""} />
      </Field>
      <Field label="Price info JSON">
        <Textarea name="price_info" defaultValue={JSON.stringify(priceInfo, null, 2)} />
      </Field>
      <Field label="Amenities, one per line">
        <Textarea name="amenities" defaultValue={amenities} />
      </Field>
      <Field label="Image URLs, one per line">
        <Textarea name="image_urls" defaultValue={imageUrls} />
      </Field>
      <div className="md:col-span-2">
        <Field label="Description">
          <Textarea name="description" defaultValue={apartment?.description || ""} />
        </Field>
      </div>
    </FormShell>
  );
}

function ApartmentCategoryForm({ category }) {
  return (
    <FormShell title={category ? `Edit category: ${category.name}` : "Add apartment category"} action={saveApartmentCategory}>
      {category && <input type="hidden" name="id" defaultValue={category.id} />}
      <Field label="Name">
        <Input name="name" defaultValue={category?.name || ""} required />
      </Field>
      <Field label="Description">
        <Input name="description" defaultValue={category?.description || ""} />
      </Field>
    </FormShell>
  );
}

function ApartmentManagement({ apartments, categories }) {
  const [query, setQuery] = useState("");
  const filtered = apartments.filter((apartment) => searchable(apartment).includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
      <SearchBox value={query} onChange={setQuery} placeholder="Search apartments..." />
      <ApartmentForm categories={categories} />
      <Panel title="Apartment categories">
        <div className="grid gap-4 lg:grid-cols-2">
          <ApartmentCategoryForm />
          {categories.map((category) => <ApartmentCategoryForm key={category.id} category={category} />)}
        </div>
      </Panel>
      <Panel title="Apartments">
        <div className="space-y-4">
          {filtered.map((apartment) => <ApartmentForm key={apartment.id} apartment={apartment} categories={categories} />)}
          {!filtered.length && <p className="text-sm text-slate-500">No apartments match this search.</p>}
        </div>
      </Panel>
    </div>
  );
}

function UserDetailsModal({ user, onClose }) {
  return (
    <Modal title={`User Details: ${personName(user)}`} onClose={onClose}>
      <div className="space-y-4 text-sm text-slate-700">
        <div>
          <span className="font-bold">Email:</span> {user.email}
        </div>
        <div>
          <span className="font-bold">Role:</span> {user.role}
        </div>
        <div>
          <span className="font-bold">Joined:</span> {formatDate(user.created_at)}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold">Rentals</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{user.rentals?.length || 0}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold">Payments</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{user.payments?.length || 0}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold">Contracts</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{user.contracts?.length || 0}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function UsersPanel({ users }) {
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const filtered = users.filter((user) => searchable(user).includes(query.toLowerCase()));

  return (
    <Panel title="Users">
      <div className="mb-5">
        <SearchBox value={query} onChange={setQuery} placeholder="Search users..." />
      </div>
      <div className="space-y-3">
        {filtered.map((user) => (
          <div 
            key={user.id} 
            className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-brand/30 hover:bg-slate-50"
            onClick={() => setSelectedUser(user)}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{personName(user)}</h3>
                <p className="text-xs text-slate-500">{user.email}</p>
                <p className="mt-2 text-xs text-slate-500">Joined {formatDate(user.created_at)}</p>
              </div>
              <StatusBadge className={user.role === "ADMIN" ? "bg-brand-light text-brand" : "bg-slate-100 text-slate-700"}>
                {user.role}
              </StatusBadge>
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <span className="rounded-lg bg-slate-100/50 p-3">Rentals: {user.rentals?.length || 0}</span>
              <span className="rounded-lg bg-slate-100/50 p-3">Payments: {user.payments?.length || 0}</span>
              <span className="rounded-lg bg-slate-100/50 p-3">Contracts: {user.contracts?.length || 0}</span>
            </div>
          </div>
        ))}
        {!filtered.length && <p className="text-sm text-slate-500">No users match this search.</p>}
      </div>
      {selectedUser && (
        <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </Panel>
  );
}

function ContractDetailsModal({ contract, onClose }) {
  const itemName = contract.rentals?.bikes?.name || contract.rentals?.apartments?.name || "Rental";
  return (
    <Modal title={`Contract: ${itemName}`} onClose={onClose}>
      <div className="space-y-4 text-sm text-slate-700">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="mb-2 font-bold text-slate-900">Signatory Information</h4>
          <p><span className="font-semibold">Name:</span> {personName(contract.profiles)}</p>
          <p><span className="font-semibold">Email:</span> {contract.profiles?.email}</p>
          <p><span className="font-semibold">Signed At:</span> {formatDate(contract.signed_at, true)}</p>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h4 className="mb-2 font-bold text-slate-900">Electronic Signature</h4>
          <div className="mb-2 text-xs text-slate-500">
            Signer agreed to Foreigners Hub rental terms (Version {contract.version}).
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-lg text-slate-900">
            {contract.signature_data || contract.signer_name}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Signature ID: {contract.id}
          </p>
        </div>
      </div>
    </Modal>
  );
}

function ContractsPanel({ contracts }) {
  const [selectedContract, setSelectedContract] = useState(null);

  return (
    <Panel title="Contracts">
      <div className="space-y-3">
        {contracts.map((contract) => (
          <div key={contract.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusBadge className="bg-slate-100 text-slate-700">{contract.status}</StatusBadge>
                  <span className="text-xs text-slate-500">Version {contract.version}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{personName(contract.profiles)}</h3>
                <p className="text-xs text-slate-500">
                  {contract.rentals?.bikes?.name || contract.rentals?.apartments?.name || "Rental"}
                  {contract.rentals?.bikes?.b_code ? ` (${contract.rentals.bikes.b_code})` : ""}
                </p>
                <p className="mt-2 text-xs text-slate-500">Signed {formatDate(contract.signed_at, true)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setSelectedContract(contract)}>
                  View details
                </Button>
                {contract.document_path && (
                  <Button asChild size="sm" variant="outline">
                    <a href={contract.document_path}>Download PDF</a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {!contracts.length && <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No contracts found.</p>}
      </div>
      {selectedContract && (
        <ContractDetailsModal contract={selectedContract} onClose={() => setSelectedContract(null)} />
      )}
    </Panel>
  );
}

function RepairList({ repairs, compact = false }) {
  if (!repairs.length) {
    return <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No repair requests found.</p>;
  }

  return (
    <div className="space-y-3">
      {repairs.map((repair) => (
        <div key={repair.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <StatusBadge className="bg-slate-100 text-slate-700">{repair.status.replace("_", " ")}</StatusBadge>
              <h3 className="mt-2 text-sm font-bold text-slate-900">{personName(repair.profiles)}</h3>
              <p className="text-xs text-slate-500">{repair.profiles?.email}</p>
              <p className="mt-2 text-sm text-slate-700">
                {repair.repair_services?.name || "Repair service"} for {repair.bikes?.name || "bike"}
                {repair.bikes?.b_code ? ` (${repair.bikes.b_code})` : ""}
              </p>
              {!compact && repair.description && (
                <p className="mt-2 text-sm text-slate-500">{repair.description}</p>
              )}
              <p className="mt-2 text-xs text-slate-400">{formatDate(repair.created_at, true)}</p>
            </div>
            {!compact && (
              <form action={updateRepairRequestStatus} className="flex items-center gap-2">
                <input type="hidden" name="id" value={repair.id} />
                <Select name="status" defaultValue={repair.status}>
                  {repairStatuses.map((status) => <option key={status}>{status}</option>)}
                </Select>
                <Button size="sm">Update</Button>
              </form>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function RepairsPanel({ repairs }) {
  const [query, setQuery] = useState("");
  const filtered = repairs.filter((repair) => searchable(repair).includes(query.toLowerCase()));
  return (
    <Panel title="Repair requests">
      <div className="mb-5">
        <SearchBox value={query} onChange={setQuery} placeholder="Search repairs..." />
      </div>
      <RepairList repairs={filtered} />
    </Panel>
  );
}

function CalendarPanel({ rentals, payments, repairs, extensions }) {
  const [monthDate, setMonthDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(null);
  
  const [filters, setFilters] = useState({
    Start: true,
    Return: true,
    Payment: true,
    Extension: true,
    Repair: true,
  });

  const toggleFilter = (type) => {
    setFilters((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const allEvents = useMemo(() => {
    const rentalEvents = rentals.flatMap((rental) => {
      const label = rental.bikes?.b_code || rental.bikes?.name || rental.apartments?.name || "Rental";
      return [
        rental.start_date && { date: rental.start_date, type: "Start", label, details: `Start of rental for ${personName(rental.profiles)}` },
        rental.end_date && { date: rental.end_date, type: "Return", label, details: `Expected return for ${personName(rental.profiles)}` },
      ].filter(Boolean);
    });

    const paymentEvents = payments
      .filter((payment) => payment.payment_date)
      .map((payment) => ({
        date: payment.payment_date,
        type: "Payment",
        label: payment.rentals?.bikes?.b_code || personName(payment.profiles),
        details: `${formatCurrency(payment.amount)} (${payment.status.replace("_", " ")})`,
      }));

    const extensionEvents = (extensions || [])
      .filter((ext) => ext.proposed_end_date)
      .map((ext) => ({
        date: ext.proposed_end_date,
        type: "Extension",
        label: ext.rentals?.bikes?.b_code || personName(ext.profiles),
        details: `Extended return for ${personName(ext.profiles)} (${ext.status.replace("_", " ")})`,
      }));

    const repairEvents = (repairs || [])
      .filter((repair) => repair.created_at)
      .map((repair) => ({
        date: repair.created_at,
        type: "Repair",
        label: repair.bikes?.b_code || "Bike",
        details: `${repair.repair_services?.name || "Repair"} reported by ${personName(repair.profiles)}`,
      }));

    return [...rentalEvents, ...paymentEvents, ...extensionEvents, ...repairEvents];
  }, [rentals, payments, extensions, repairs]);

  const events = useMemo(() => {
    return allEvents.filter(event => filters[event.type]);
  }, [allEvents, filters]);

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = firstDay.getDay();
  const cells = [
    ...Array.from({ length: leadingBlanks }, (_, index) => ({ key: `blank-${index}` })),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const dateKey = new Date(year, month, day).toDateString();
      return {
        key: dateKey,
        day,
        dateString: dateKey,
        events: events.filter((event) => new Date(event.date).toDateString() === dateKey),
      };
    }),
  ];

  const selectedDayEvents = selectedDate 
    ? events.filter(e => new Date(e.date).toDateString() === selectedDate) 
    : [];

  return (
    <Panel title="Operational calendar">
      <div className="mb-5 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            {new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(monthDate)}
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setMonthDate(new Date(year, month - 1, 1))}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setMonthDate(new Date())}>Today</Button>
            <Button variant="outline" size="sm" onClick={() => setMonthDate(new Date(year, month + 1, 1))}>Next</Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([type, isActive]) => (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className={`rounded-full border border-slate-200 px-3 py-1 text-xs font-bold transition-colors ${
                isActive ? "bg-slate-800 text-white border-slate-800" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="bg-slate-50 p-2 text-center text-xs font-bold text-slate-500">{day}</div>
        ))}
        {cells.map((cell) => (
          <div 
            key={cell.key} 
            className={`min-h-28 bg-white p-2 ${cell.day ? "cursor-pointer hover:bg-slate-50 transition-colors" : ""}`}
            onClick={() => cell.day && setSelectedDate(cell.dateString)}
          >
            {cell.day && <p className="mb-2 text-xs font-bold text-slate-700">{cell.day}</p>}
            <div className="space-y-1">
              {(cell.events || []).slice(0, 3).map((event, index) => (
                <div key={`${event.type}-${event.label}-${index}`} className="truncate rounded bg-brand-light px-2 py-1 text-[11px] font-semibold leading-tight text-brand">
                  {event.type}: {event.label}
                </div>
              ))}
              {(cell.events || []).length > 3 && (
                <p className="text-[11px] text-slate-400">+{cell.events.length - 3} more</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedDate && (
        <Modal title={`Events for ${selectedDate}`} onClose={() => setSelectedDate(null)}>
          <div className="space-y-3">
            {selectedDayEvents.length === 0 ? (
              <p className="text-sm text-slate-500">No events scheduled for this day.</p>
            ) : (
              selectedDayEvents.map((event, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 rounded-xl border border-slate-200 p-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <StatusBadge className="bg-slate-100 text-slate-700">{event.type}</StatusBadge>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{event.label}</p>
                    {event.details && <p className="mt-1 text-xs text-slate-500">{event.details}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </Modal>
      )}
    </Panel>
  );
}

function SettingsPanel({ siteSettings }) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData) {
    setMessage("");
    startTransition(async () => {
      try {
        await saveSettings(formData);
        setMessage("Settings saved successfully.");
      } catch (err) {
        setMessage(err.message || "Could not save settings.");
      }
    });
  }

  return (
    <Panel title="Organisation Settings">
      <form action={handleSubmit} className="space-y-8">
        <div>
          <h3 className="mb-1 text-sm font-bold text-slate-900">Rental Contract Terms</h3>
          <p className="mb-3 text-xs text-slate-500">
            This text forms the body of the rental agreement that users read and sign during checkout.
          </p>
          <textarea
            name="contract_terms"
            rows={10}
            defaultValue={siteSettings.contract_terms || ""}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-800 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
            placeholder="Enter the full rental contract terms that users will sign..."
          />
        </div>

        <div>
          <h3 className="mb-1 text-sm font-bold text-slate-900">Payment Account Details</h3>
          <p className="mb-3 text-xs text-slate-500">
            These are the bank details shown to users when they are asked to make a payment.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Account Holder Name</label>
              <Input
                name="payment_account_name"
                defaultValue={siteSettings.payment_account_name || ""}
                placeholder="e.g. Foreigners Hub GmbH"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Bank Name</label>
              <Input
                name="payment_account_bank"
                defaultValue={siteSettings.payment_account_bank || ""}
                placeholder="e.g. Deutsche Bank"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">IBAN</label>
              <Input
                name="payment_account_iban"
                defaultValue={siteSettings.payment_account_iban || ""}
                placeholder="e.g. DE89 3704 0044 0532 0130 00"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">BIC / SWIFT</label>
              <Input
                name="payment_account_bic"
                defaultValue={siteSettings.payment_account_bic || ""}
                placeholder="e.g. COBADEFFXXX"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-1 text-sm font-bold text-slate-900">Additional Payment Instructions</h3>
          <p className="mb-3 text-xs text-slate-500">
            Extra guidance shown to users during payment — e.g. WhatsApp number to send proof, reference to use, etc.
          </p>
          <textarea
            name="payment_instructions"
            rows={4}
            defaultValue={siteSettings.payment_instructions || ""}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-800 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
            placeholder="e.g. Send payment proof to our WhatsApp: +1 234 567 8900"
          />
        </div>

        <div className="flex items-center gap-4 border-t border-slate-100 pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 size={14} className="mr-2 animate-spin" />}
            {isPending ? "Saving…" : "Save settings"}
          </Button>
          {message && (
            <p className={`text-sm ${message.includes("success") ? "text-green-700" : "text-red-600"}`}>
              {message}
            </p>
          )}
        </div>
      </form>
    </Panel>
  );
}

export default function AdminOperations({
  adminEmail,
  stats,
  loadErrorCount,
  rentals,
  payments,
  bikes,
  bikeCategories,
  apartments,
  apartmentCategories,
  users,
  contracts,
  repairs,
  repairServices,
  extensions,
  siteSettings = {},
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [rentalQuery, setRentalQuery] = useState("");
  const [paymentQuery, setPaymentQuery] = useState("");

  const filteredRentals = rentals.filter((rental) => searchable(rental).includes(rentalQuery.toLowerCase()));
  const filteredPayments = payments.filter((payment) => searchable(payment).includes(paymentQuery.toLowerCase()));

  return (
    <div className="container mx-auto px-4 py-12 md:px-8 md:py-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-eyebrow mb-3">Operations</p>
          <h1 className="text-4xl font-extrabold text-slate-950">Admin Dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Manage payments, rentals, catalogue inventory, users, contracts,
            repairs, and operational calendar activity.
          </p>
        </div>
        <span className="rounded-full bg-brand px-3 py-1 text-xs font-bold tracking-wide text-white">
          ADMIN · {adminEmail}
        </span>
      </div>

      {loadErrorCount > 0 && (
        <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          {loadErrorCount} admin data section{loadErrorCount === 1 ? "" : "s"} could not be loaded.
        </div>
      )}

      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              activeTab === tab.id
                ? "bg-brand text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:text-slate-950"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && <Overview stats={stats} payments={payments} rentals={rentals} repairs={repairs} />}

      {activeTab === "payments" && (
        <Panel title="Payment verification">
          <div className="mb-5">
            <SearchBox value={paymentQuery} onChange={setPaymentQuery} placeholder="Search payments..." />
          </div>
          <PaymentList payments={filteredPayments} />
        </Panel>
      )}

      {activeTab === "rentals" && (
        <Panel title="Rental management">
          <div className="mb-5">
            <SearchBox value={rentalQuery} onChange={setRentalQuery} placeholder="Search rentals..." />
          </div>
          <RentalList rentals={filteredRentals} />
        </Panel>
      )}

      {activeTab === "extensions" && <ExtensionsPanel extensions={extensions} />}
      {activeTab === "bikes" && <BikeManagement bikes={bikes} categories={bikeCategories} />}
      {activeTab === "apartments" && <ApartmentManagement apartments={apartments} categories={apartmentCategories} />}
      {activeTab === "users" && <UsersPanel users={users} />}
      {activeTab === "contracts" && <ContractsPanel contracts={contracts} />}
      {activeTab === "repairs" && <RepairsPanel repairs={repairs} />}
      {activeTab === "calendar" && <CalendarPanel rentals={rentals} payments={payments} repairs={repairs} extensions={extensions} />}
      {activeTab === "settings" && <SettingsPanel siteSettings={siteSettings} />}
    </div>
  );
}
