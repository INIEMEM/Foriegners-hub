"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, X, ChevronRight, ArrowUpRight } from "lucide-react";
import Logo from "@/components/shared/Logo";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { label: "What's available", href: "/#services" },
  { label: "Bike plans", href: "/#pricing" },
  { label: "How it works", href: "/#process" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);
  const router = useRouter();
  const supabase = createClient();

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
    <header className="fh-nav">
      <div className="fh-container fh-nav-inner">
        {/* Logo — always our official logo */}
        <div className="fh-nav-brand">
          <Logo />
        </div>

        {/* Desktop nav links */}
        <nav className="fh-nav-links" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA area */}
        <div className="fh-nav-cta">
          {user ? (
            roleChecked ? (
              <>
                {isAdmin ? (
                  <Link
                    href="/admin"
                    style={{ fontSize: "0.84rem", fontWeight: 600, color: "#315cff", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "5px" }}
                  >
                    <LayoutDashboard size={15} />
                    Admin
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    style={{ fontSize: "0.84rem", fontWeight: 600, color: "#40516e", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "5px" }}
                  >
                    <LayoutDashboard size={15} />
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  style={{ fontSize: "0.84rem", fontWeight: 600, color: "#94a3b8", background: "transparent", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  title="Log out"
                >
                  <LogOut size={15} />
                </button>
              </>
            ) : (
              <span style={{ width: "80px", height: "20px", display: "inline-block" }} aria-hidden="true" />
            )
          ) : (
            <Link href="/login" className="fh-nav-login-btn">
              Login <ArrowUpRight size={14} />
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="fh-menu-btn"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{
            position: "absolute",
            right: "16px",
            top: "74px",
            zIndex: 50,
            width: "calc(100% - 32px)",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            borderRadius: "16px",
            border: "1px solid #e0e7f3",
            background: "white",
            padding: "16px",
            boxShadow: "0 18px 44px rgba(15, 32, 63, 0.14)",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: "8px",
                padding: "10px 12px",
                fontSize: "0.88rem",
                fontWeight: 600,
                color: "#40516e",
                textDecoration: "none",
              }}
            >
              {link.label}
              <ChevronRight size={14} style={{ color: "#c5d0e0" }} />
            </Link>
          ))}

          <div style={{ paddingTop: "12px", borderTop: "1px solid #f0f4ff", marginTop: "8px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {user ? (
              roleChecked ? (
                <>
                  {isAdmin ? (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      style={{ fontSize: "0.84rem", fontWeight: 600, color: "#315cff", textDecoration: "none", padding: "4px 0" }}
                    >
                      Admin Area
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      style={{ fontSize: "0.84rem", fontWeight: 600, color: "#40516e", textDecoration: "none", padding: "4px 0", display: "inline-flex", alignItems: "center", gap: "8px" }}
                    >
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    style={{ fontSize: "0.84rem", fontWeight: 600, color: "#94a3b8", background: "transparent", textAlign: "left", display: "inline-flex", alignItems: "center", gap: "8px", padding: "4px 0" }}
                  >
                    <LogOut size={15} /> Log out
                  </button>
                </>
              ) : (
                <span style={{ height: "20px", display: "block" }} aria-hidden="true" />
              )
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="fh-nav-login-btn"
                style={{ justifyContent: "center" }}
              >
                Login <ArrowUpRight size={14} />
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
