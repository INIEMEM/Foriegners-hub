import Link from "next/link";
import {
  ArrowRight, Check, ShieldCheck, Wrench, Headphones,
  CheckCircle, Calendar, CreditCard, Package,
} from "lucide-react";

export const metadata = {
  title: "Bike Rental | Foreigners Hub",
  description:
    "Rent a maintained city bike in Vilnius. Monthly or weekly plans from €45/week. Deposit €50 for new customers. Admin-assigned after payment.",
};

const included = [
  "Heavy-duty anti-theft lock",
  "Front & rear LED lights",
  "Helmet (safety certified)",
  "Riding gloves",
  "Scarf / face cover",
  "Repair support throughout rental",
];

const PLANS = [
  {
    id: "monthly",
    tag: "Save €10",
    label: "Pay monthly",
    sub: "Pay once, ride for the full month",
    price: "€170",
    period: "/ month",
    highlight: true,
  },
  {
    id: "weekly",
    tag: "Flexible",
    label: "Pay weekly",
    sub: "€45 per week over 4 weeks",
    price: "€45",
    period: "/ week",
    highlight: false,
  },
];

const steps = [
  {
    icon: Calendar,
    title: "Request a rental",
    body: "Pick your start date and preferred payment plan. Minimum rental is 1 month.",
  },
  {
    icon: CreditCard,
    title: "Transfer payment",
    body: "Send the payment to our bank account and share a screenshot with us via WhatsApp.",
  },
  {
    icon: Package,
    title: "We assign your bike",
    body: "Once payment is verified, our team assigns you a maintained bike and sets a pickup time.",
  },
  {
    icon: CheckCircle,
    title: "Sign & ride",
    body: "Sign your digital contract on the dashboard. Your rental is active from pickup day.",
  },
];

const specs = [
  ["Type", "City / commuter bike"],
  ["Gears", "7-speed Shimano"],
  ["Frame", "Lightweight aluminium"],
  ["Brakes", "V-brake (front & rear)"],
  ["Tyres", "700c road-ready"],
  ["Weight", "~12 kg"],
  ["Condition", "Serviced before every rental"],
];

export default function BikesPage() {
  return (
    <div style={{ background: "var(--fh-off-white, #f8fafc)" }}>

      {/* ── Hero ──────────────────────────────────────────── */}
      <div style={{ background: "white", borderBottom: "1px solid #e8edf5" }}>
        <div className="container mx-auto px-4 md:px-8 py-14 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Copy */}
            <div>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "7px",
                background: "#f0fdf4", color: "#16a34a", fontSize: "12px",
                fontWeight: 700, padding: "5px 13px", borderRadius: "20px",
                letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "20px",
              }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#16a34a" }} />
                Bike Rental · Vilnius
              </span>

              <h1 style={{
                fontSize: "clamp(36px, 5vw, 52px)", fontWeight: 800,
                color: "#0f172a", lineHeight: 1.15, marginBottom: "18px",
              }}>
                A reliable city bike,<br />
                <span style={{ color: "#315cff" }}>assigned just for you.</span>
              </h1>

              <p style={{ fontSize: "17px", color: "#475569", lineHeight: 1.75, marginBottom: "32px", maxWidth: "480px" }}>
                We don't run a marketplace — you request a rental, we verify your
                payment and personally assign you a serviced bike with a scheduled pickup.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "36px" }}>
                {["Minimum 1 month", "Admin-assigned bike", "€50 deposit (new)", "Free repair support"].map((f) => (
                  <span key={f} style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    background: "#f1f5f9", color: "#475569",
                    fontSize: "13px", fontWeight: 600, padding: "7px 14px", borderRadius: "20px",
                  }}>
                    <Check size={12} style={{ color: "#16a34a" }} /> {f}
                  </span>
                ))}
              </div>

              <Link
                href="/rent"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "10px",
                  background: "#315cff", color: "white", fontWeight: 700,
                  fontSize: "16px", padding: "14px 28px", borderRadius: "14px",
                  textDecoration: "none",
                }}
              >
                Start a Rental <ArrowRight size={17} />
              </Link>
            </div>

            {/* Bike image */}
            <div style={{ borderRadius: "20px", overflow: "hidden", border: "1px solid #e8edf5" }}>
              <img
                src="/images/engwe-m20.jpg"
                alt="City bike available for rental"
                style={{ width: "100%", height: "380px", objectFit: "cover", display: "block" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Specs ─────────────────────────────────────────── */}
      <div style={{ background: "#0f172a" }}>
        <div className="container mx-auto px-4 md:px-8 py-14 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

            <div>
              <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", color: "#64748b", textTransform: "uppercase", marginBottom: "12px" }}>
                About the bike
              </p>
              <h2 style={{ fontSize: "28px", fontWeight: 800, color: "white", marginBottom: "16px" }}>
                What you'll receive
              </h2>
              <p style={{ fontSize: "15px", color: "#94a3b8", lineHeight: 1.75, marginBottom: "28px" }}>
                Every bike is serviced before it goes out. You'll receive a well-maintained
                city commuter suited for Vilnius roads, along with all essential accessories.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {specs.map(([label, value]) => (
                  <div key={label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}>
                    <span style={{ fontSize: "13px", color: "#64748b" }}>{label}</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "white" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", color: "#64748b", textTransform: "uppercase", marginBottom: "12px" }}>
                What's included
              </p>
              <h2 style={{ fontSize: "28px", fontWeight: 800, color: "white", marginBottom: "16px" }}>
                Everything in the box
              </h2>
              <p style={{ fontSize: "15px", color: "#94a3b8", lineHeight: 1.75, marginBottom: "28px" }}>
                All items below are included at no extra charge with every rental.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {included.map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "22px", height: "22px", borderRadius: "50%",
                      background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Check size={12} color="white" />
                    </div>
                    <span style={{ fontSize: "14px", color: "#cbd5e1" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Pricing ───────────────────────────────────────── */}
      <div style={{ background: "white", borderTop: "1px solid #e8edf5" }}>
        <div className="container mx-auto px-4 md:px-8 py-14 md:py-16">
          <div style={{ textAlign: "center", maxWidth: "560px", margin: "0 auto 48px" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", color: "#315cff", textTransform: "uppercase", marginBottom: "12px" }}>
              Pricing
            </p>
            <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a", marginBottom: "14px" }}>
              Choose how you pay
            </h2>
            <p style={{ fontSize: "15px", color: "#64748b", lineHeight: 1.7 }}>
              Both plans cover <strong>1 full month</strong> of riding. The only difference is when you pay.
              Extensions are available after your first month.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", maxWidth: "640px", margin: "0 auto 28px" }}>
            {PLANS.map((plan) => (
              <div key={plan.id} style={{
                borderRadius: "18px", padding: "28px 24px",
                border: plan.highlight ? "2px solid #315cff" : "1.5px solid #e8edf5",
                background: plan.highlight ? "#f0f4ff" : "white",
                position: "relative",
              }}>
                <span style={{
                  display: "inline-block", fontSize: "10px", fontWeight: 700,
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  background: plan.highlight ? "#315cff" : "#f1f5f9",
                  color: plan.highlight ? "white" : "#64748b",
                  padding: "4px 10px", borderRadius: "20px", marginBottom: "16px",
                }}>
                  {plan.tag}
                </span>
                <p style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>{plan.label}</p>
                <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "18px" }}>{plan.sub}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                  <span style={{ fontSize: "38px", fontWeight: 800, color: plan.highlight ? "#315cff" : "#0f172a" }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: "14px", color: "#94a3b8" }}>{plan.period}</span>
                </div>
              </div>
            ))}
          </div>

          {/* New customer deposit note */}
          <div style={{
            display: "flex", alignItems: "flex-start", gap: "12px",
            background: "#fffbeb", border: "1px solid #fde68a",
            borderRadius: "14px", padding: "16px 20px",
            maxWidth: "640px", margin: "0 auto 20px",
          }}>
            <ShieldCheck size={17} style={{ color: "#d97706", flexShrink: 0, marginTop: "2px" }} />
            <p style={{ fontSize: "13px", color: "#92400e", lineHeight: 1.65 }}>
              <strong>New customers</strong> pay a €50 refundable deposit with their first payment.
              This is returned when the bike is handed back in good condition.
              Returning customers are exempt.
            </p>
          </div>

          {/* Extension info */}
          <div style={{
            display: "flex", alignItems: "flex-start", gap: "12px",
            background: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: "14px", padding: "16px 20px",
            maxWidth: "640px", margin: "0 auto",
          }}>
            <Wrench size={17} style={{ color: "#64748b", flexShrink: 0, marginTop: "2px" }} />
            <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.65 }}>
              <strong>Extensions</strong> are available after completing your first month:
              1 extra week for <strong>€55</strong>, or another full month for <strong>€170</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* ── How it works ──────────────────────────────────── */}
      <div style={{ background: "var(--fh-off-white, #f8fafc)", borderTop: "1px solid #e8edf5" }}>
        <div className="container mx-auto px-4 md:px-8 py-14 md:py-16">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", color: "#315cff", textTransform: "uppercase", marginBottom: "12px" }}>
              How it works
            </p>
            <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a" }}>
              Four simple steps
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", maxWidth: "900px", margin: "0 auto 48px" }}>
            {steps.map((s, i) => (
              <div key={s.title} style={{
                background: "white", borderRadius: "16px",
                border: "1.5px solid #e8edf5", padding: "24px",
              }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "12px",
                  background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "14px",
                }}>
                  <s.icon size={18} style={{ color: "#315cff" }} />
                </div>
                <div style={{
                  fontSize: "11px", fontWeight: 700, color: "#94a3b8",
                  marginBottom: "6px", letterSpacing: "0.06em",
                }}>
                  STEP {String(i + 1).padStart(2, "0")}
                </div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>{s.title}</h3>
                <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.65 }}>{s.body}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "15px", color: "#64748b", marginBottom: "20px" }}>
              Ready to get started? The whole process is online — no office visit needed.
            </p>
            <Link
              href="/rent"
              style={{
                display: "inline-flex", alignItems: "center", gap: "10px",
                background: "#315cff", color: "white", fontWeight: 700,
                fontSize: "16px", padding: "14px 32px", borderRadius: "14px",
                textDecoration: "none",
              }}
            >
              Start a Rental <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Support strip ─────────────────────────────────── */}
      <div style={{ background: "white", borderTop: "1px solid #e8edf5" }}>
        <div className="container mx-auto px-4 md:px-8 py-10">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "28px", justifyContent: "center", alignItems: "center" }}>
            {[
              { icon: ShieldCheck, text: "Verified payment before activation" },
              { icon: Wrench, text: "Free repairs on all active rentals" },
              { icon: Headphones, text: "24/7 support via WhatsApp" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Icon size={16} style={{ color: "#315cff", flexShrink: 0 }} />
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
