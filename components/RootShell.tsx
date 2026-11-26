import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import LazyThirdParties from "@/components/LazyThirdParties";
import Navbar from "@/components/Navbar";
import UrgenceBanner from "@/components/UrgenceBanner";
import { FORMATIONS } from "@/lib/formations";
import {
  BRAND_NAME,
  CONTACT_EMAIL,
  LEGAL_NAME,
  MENTION_FR,
  SAME_AS,
  SITE_URL,
  formatDa,
  geoSchema,
  postalAddressSchema,
} from "@/lib/kost-facts";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL;

export const baseMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Formation DGR Algérie | Centre CBTA référencé IATA, agréé ANAC",
    template: "%s — KOST GROUP",
  },
  description: `Formation DGR en Algérie : ${MENTION_FR}. Fonctions 7.1 à 7.10, Bab Ezzouar (Alger) ou classe virtuelle.`,
  keywords: [
    "Formation IATA DGR",
    "CBTA",
    "Marchandises dangereuses",
    "Formation matières dangereuses",
    "Formation DGR Alger",
    "KOST GROUP",
  ],
  authors: [{ name: "KOST GROUP" }],
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
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon-32.png",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "KOST GROUP",
    title: "Formation DGR Algérie — Centre CBTA référencé IATA, agréé ANAC",
    description: `Formation DGR en Algérie : ${MENTION_FR}.`,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "KOST GROUP — Formation DGR / CBTA en Algérie",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Formation DGR-CBTA — KOST GROUP",
    description: `Formation DGR en Algérie : ${MENTION_FR}.`,
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export const baseViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#003D7A",
};

const prices = FORMATIONS.map((f) => f.prixDa);

const orgSchema = {
  "@context": "https://schema.org",
  "@type": ["EducationalOrganization", "LocalBusiness"],
  "@id": `${siteUrl}/#organization`,
  name: "KOST GROUP",
  legalName: LEGAL_NAME,
  alternateName: BRAND_NAME,
  url: siteUrl,
  logo: { "@type": "ImageObject", url: `${siteUrl}/kost-group-logo.svg` },
  image: `${siteUrl}/og-image.jpg`,
  description: `Organisme de formation DGR à Alger : ${MENTION_FR}.`,
  address: postalAddressSchema(),
  geo: geoSchema(),
  hasMap: "https://maps.app.goo.gl/oqJqBNFpBHTSL83d7",
  telephone: "+213542305383",
  email: CONTACT_EMAIL,
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "08:30",
      closes: "16:30",
    },
  ],
  priceRange: `${formatDa(Math.min(...prices))} – ${formatDa(Math.max(...prices))}`,
  currenciesAccepted: "DZD",
  paymentAccepted: "Cash, Bank Transfer",
  hasCredential: [
    {
      "@type": "EducationalOccupationalCredential",
      name: "Centre CBTA référencé IATA",
      url: SAME_AS[0],
      recognizedBy: { "@type": "Organization", name: "IATA", url: "https://www.iata.org" },
    },
    {
      "@type": "EducationalOccupationalCredential",
      name: "Agrément ANAC — formation DGR, fonctions 7.1 à 7.10 (réf. ANAC/DSOA/SAL-DGR/01/2026)",
      url: SAME_AS[1],
      recognizedBy: {
        "@type": "GovernmentOrganization",
        name: "ANAC — Autorité Nationale de l'Aviation Civile (Algérie)",
        url: "https://www.anac.dz",
      },
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Formations DGR — Marchandises dangereuses (fonctions 7.1 à 7.10)",
    itemListElement: FORMATIONS.map((f) => ({
      "@type": "Offer",
      price: f.prixDa,
      priceCurrency: "DZD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: f.prixDa,
        priceCurrency: "DZD",
        valueAddedTaxIncluded: false,
      },
      itemOffered: {
        "@type": "Course",
        name: f.code,
        description: f.description,
        provider: { "@id": `${siteUrl}/#organization` },
      },
    })),
  },
  areaServed: ["DZ", "MA", "TN", "SN", "CI", "CM", "ML", "GA"],
  sameAs: SAME_AS,
};

export function RootShell({
  lang,
  children,
}: {
  lang: "fr" | "en";
  children: React.ReactNode;
}) {
  return (
    <html lang={lang} className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(orgSchema).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="font-sans antialiased bg-[#002A56]">
        <UrgenceBanner />
        <Navbar />
        {children}
        <LazyThirdParties />
        <Analytics />
      </body>
    </html>
  );
}
