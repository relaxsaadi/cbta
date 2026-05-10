import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import AnalyticsLoader from "@/components/AnalyticsLoader";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://formation.kostacademy.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "Formation IATA DGR-CBTA — KOST Academy · 1er CBTA Provider en Afrique francophone",
    template: "%s — KOST Academy",
  },
  description:
    "Formations IATA DGR-CBTA officielles (7.1 à 7.10) à Alger pour l'Afrique francophone. Certificat IATA reconnu, 50% moins cher qu'à Bruxelles. Paiement EUR/USD.",
  keywords: [
    "Formation IATA DGR",
    "CBTA",
    "Marchandises dangereuses",
    "Aviation Afrique",
    "Cargo aérien",
    "Formation Alger",
  ],
  authors: [{ name: "KOST Academy" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "KOST Academy",
    title: "Formation IATA DGR-CBTA Certifiée — KOST Academy",
    description:
      "1er CBTA Provider IATA en Afrique francophone. Certificat IATA officiel, 50% moins cher qu'à Bruxelles.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Formation IATA DGR-CBTA — KOST Academy",
    description:
      "1er CBTA Provider IATA en Afrique francophone. Certificat IATA officiel.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#003D7A",
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "KOST Academy",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description:
    "1er Centre CBTA Provider IATA certifié en Algérie et en Afrique francophone. Formations IATA DGR (marchandises dangereuses) 7.1 à 7.10.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "176 Cité Boushaki, Bab Ezzouar",
    addressLocality: "Alger",
    addressCountry: "DZ",
  },
  telephone: "+213770772619",
  areaServed: ["DZ", "MA", "TN", "SN", "CI", "CM", "ML", "BF", "GA"],
  sameAs: ["https://www.linkedin.com/company/kost-academy"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="fr" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <AnalyticsLoader />
      </body>
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
    </html>
  );
}
