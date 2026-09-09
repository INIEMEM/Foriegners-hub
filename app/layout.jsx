import "./globals.css";

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
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
