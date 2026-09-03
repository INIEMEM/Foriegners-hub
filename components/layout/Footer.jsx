import Link from "next/link";
import Logo from "@/components/shared/Logo";

const services = [
  { label: "Bikes", href: "/bikes" },
  { label: "Apartments", href: "/apartments" },
];

const company = [
  { label: "Why us", href: "/#why-us" },
  { label: "How it works", href: "/#how-it-works" },
];

const account = [
  { label: "Log in", href: "/login" },
  { label: "Dashboard", href: "/dashboard" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300">
      {/* Main footer */}
      <div className="container mx-auto px-4 md:px-8 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Logo light className="mb-5" />
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Simple, transparent rental services for students and young
              professionals. Bikes and apartments — in one place.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-widest mb-4">
              Services
            </h3>
            <ul className="space-y-2.5">
              {services.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-widest mb-4">
              Company
            </h3>
            <ul className="space-y-2.5">
              {company.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-widest mb-4">
              Account
            </h3>
            <ul className="space-y-2.5">
              {account.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>© {year} Foreigners Hub. All rights reserved.</p>
          <p>Student-focused rentals.</p>
        </div>
      </div>
    </footer>
  );
}
