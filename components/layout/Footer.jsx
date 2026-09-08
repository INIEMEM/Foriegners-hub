import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="fh-footer">
      <div className="fh-container">
        <div className="fh-footer-card">
          <div className="fh-footer-brand">
            <Link href="/" className="fh-footer-logo-box">
              <Image
                src="/logo.jpg"
                alt="Foreigners Hub Logo"
                width={110}
                height={40}
                className="fh-footer-logo-img"
              />
            </Link>
            <p className="fh-footer-desc">
              Simple, transparent rental services for students and young professionals. Bikes and apartments — in one place.
            </p>
          </div>

          <div className="fh-footer-nav">
            <div className="fh-footer-col">
              <h4>SERVICES</h4>
              <ul>
                <li><Link href="/bikes">Bikes</Link></li>
                <li><Link href="/apartments">Apartments</Link></li>
              </ul>
            </div>

            <div className="fh-footer-col">
              <h4>COMPANY</h4>
              <ul>
                <li><Link href="/#services">Why us</Link></li>
                <li><Link href="/#process">How it works</Link></li>
              </ul>
            </div>

            <div className="fh-footer-col">
              <h4>ACCOUNT</h4>
              <ul>
                <li><Link href="/login">Log in</Link></li>
                <li><Link href="/dashboard">Dashboard</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="fh-footer-bottom">
          <span>© {new Date().getFullYear()} Foreigners Hub. All rights reserved.</span>
          <span>Student-focused rentals.</span>
        </div>
      </div>
    </footer>
  );
}
