import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: {
    default: "Foreigners Hub — Student Bike & Apartment Rentals",
    template: "%s | Foreigners Hub",
  },
  description:
    "Foreigners Hub is a student-focused rental platform. Rent bikes and find apartments — simple, transparent, and trustworthy.",
  keywords: ["bike rental", "apartment rental", "student rentals", "foreigners", "bikes", "apartments"],
  metadataBase: new URL("https://foreignershub.com"),
  openGraph: {
    siteName: "Foreigners Hub",
    type: "website",
    locale: "en_US",
  },
};

/**
 * Root layout — applies the global font and metadata.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body>
        {children}
      </body>
    </html>
  );
}
