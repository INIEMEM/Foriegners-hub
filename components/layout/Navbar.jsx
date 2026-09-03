"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/shared/Logo";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { label: "Why us", href: "/#why-us" },
  { label: "Bikes", href: "/bikes" },
  { label: "Apartments", href: "/apartments" },
  { label: "How it works", href: "/#how-it-works" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      checkRole(currentUser);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      checkRole(currentUser);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkRole(currentUser) {
    setRoleChecked(false);
    if (!currentUser) {
      setIsAdmin(false);
      setRoleChecked(true);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();
    setIsAdmin(data?.role === "ADMIN");
    setRoleChecked(true);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? "border-b border-slate-200/70 bg-white/90 shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
          : "border-b border-white/60 bg-white/75"
      }`}
      style={{ backdropFilter: "blur(18px)" }}
    >
      <div className="container mx-auto flex h-18 items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 p-1 shadow-sm" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          {user ? roleChecked ? (
            <>
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-brand hover:text-brand-dark transition-colors inline-flex items-center gap-1.5"
                >
                  <LayoutDashboard size={15} />
                  Admin
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5"
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-slate-400 hover:text-danger transition-colors inline-flex items-center gap-1"
                title="Log out"
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <span className="h-5 w-20" aria-hidden="true" />
          ) : (
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors"
            >
              Log in
            </Link>
          )}

          <Button asChild size="sm" className="ml-1">
            <Link href="/bikes">Rent a bike</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:text-slate-900"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 px-4 py-5 flex flex-col gap-1 shadow-xl">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between text-sm font-medium text-slate-700 hover:text-slate-900 py-2.5 border-b border-slate-50 transition-colors"
            >
              {link.label}
              <ChevronRight size={14} className="text-slate-300" />
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            {user ? roleChecked ? (
              <>
                {isAdmin ? (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="text-sm font-medium text-brand py-1"
                  >
                    Admin Area
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="text-sm font-medium text-slate-600 py-1 inline-flex items-center gap-2"
                  >
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="text-sm font-medium text-slate-500 py-1 inline-flex items-center gap-2 text-left"
                >
                  <LogOut size={15} /> Log out
                </button>
              </>
            ) : (
              <span className="h-5" aria-hidden="true" />
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-slate-600 py-1"
              >
                Log in
              </Link>
            )}
            <Button asChild className="w-full mt-1">
              <Link href="/bikes" onClick={() => setMobileOpen(false)}>
                Rent a bike
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
