import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import AnalyticsLoader from "@/components/AnalyticsLoader";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://dgr.kostacademy.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Formation IATA DGR Algérie — Certifié KOST GROUP",
    template: "%s — KOST GROUP",
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
    "KOST GROUP",
  ],
  authors: [{ name: "KOST GROUP" }],
  alternates: { canonical: "/" },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
    other: {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION || "",
    },
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/kost-group-logo.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon-32.png",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "KOST GROUP",
    title: "Formation IATA DGR-CBTA Certifiée — KOST GROUP",
    description:
      "1er Centre CBTA Provider Certifié IATA en Algérie. Certificat IATA officiel, 50% moins cher qu'à Bruxelles.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "KOST GROUP — 1er Centre CBTA Provider Certifié IATA en Algérie",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Formation IATA DGR-CBTA — KOST GROUP",
    description:
      "1er Centre CBTA Provider Certifié IATA en Algérie. Certificat IATA officiel.",
    images: ["/og-image.jpg"],
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
  name: "KOST GROUP",
  alternateName: "KOST Academy",
  url: siteUrl,
  logo: `${siteUrl}/kost-group-logo.svg`,
  image: `${siteUrl}/og-image.jpg`,
  description:
    "1er Centre CBTA Provider Certifié IATA en Algérie. Formations IATA DGR (marchandises dangereuses) 7.1 à 7.10 pour les professionnels de l'aviation et du fret aérien en Afrique francophone.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "176 Cité Boushaki, Bab Ezzouar",
    addressLocality: "Alger",
    postalCode: "16111",
    addressCountry: "DZ",
  },
  telephone: "+213542305383",
  areaServed: ["DZ", "MA", "TN", "SN", "CI", "CM", "ML", "BF", "GA"],
  sameAs: ["https://www.linkedin.com/company/kost-group"],
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
      <body className="font-sans antialiased bg-[#002A56]">
        <Navbar />
        {children}
        <AnalyticsLoader />
      </body>
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
    </html>
  );
}
