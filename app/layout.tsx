import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import AnalyticsLoader from "@/components/AnalyticsLoader";
import Navbar from "@/components/Navbar";
import UrgenceBanner from "@/components/UrgenceBanner";
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
    default: "Formation DGR Algérie | Approche CBTA",
    template: "%s — KOST GROUP",
  },
  description:
    "Formation DGR en Algérie, approche CBTA, pour les fonctions 7.1 à 7.10 selon le périmètre validé et l’analyse des tâches.",
  keywords: [
    "Formation IATA DGR",
    "CBTA",
    "Marchandises dangereuses",
    "Formation matières dangereuses",
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
    title: "Formation DGR Algérie — Approche CBTA",
    description:
      "Formation DGR en Algérie, approche CBTA, pour les fonctions 7.1 à 7.10 selon le périmètre validé et l’analyse des tâches.",
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
    description:
      "Formation DGR en Algérie, approche CBTA, pour les fonctions 7.1 à 7.10 selon le périmètre validé.",
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
  "@type": ["EducationalOrganization", "LocalBusiness"],
  name: "KOST GROUP",
  alternateName: "KOST Academy",
  url: siteUrl,
  logo: {
    "@type": "ImageObject",
    url: `${siteUrl}/kost-group-logo.svg`,
  },
  image: `${siteUrl}/og-image.jpg`,
  description:
    "Organisme de formation DGR / CBTA en Algérie pour les professionnels de l’aviation et du fret aérien, avec périmètre déterminé à partir des tâches du personnel.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "176 Cité Boushaki, Bab Ezzouar",
    addressLocality: "Alger",
    postalCode: "16024",
    addressCountry: "DZ",
  },
  telephone: "+213542305383",
  email: "kostgroupe@gmail.com",
  geo: {
    "@type": "GeoCoordinates",
    latitude: 36.71942,
    longitude: 3.18274,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "08:30",
      closes: "16:30",
    },
  ],
  priceRange: "€€",
  currenciesAccepted: "DZD, EUR",
  paymentAccepted: "Cash, Bank Transfer",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.3",
    bestRating: "5",
    worstRating: "1",
    ratingCount: "12",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Formations DGR — Marchandises Dangereuses",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Course",
          name: "Formation DGR — Initiale",
          description:
            "Formation initiale aux marchandises dangereuses selon le périmètre CBTA validé. La fonction applicable est déterminée à partir des tâches du personnel.",
          provider: { "@type": "Organization", name: "KOST GROUP" },
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Course",
          name: "Formation DGR — Recyclage",
          description:
            "Formation périodique DGR selon le périmètre CBTA validé et les exigences applicables. La fonction concernée dépend des tâches du personnel.",
          provider: { "@type": "Organization", name: "KOST GROUP" },
        },
      },
    ],
  },
  areaServed: ["DZ", "MA", "TN", "SN", "CI", "CM", "ML", "BF", "GA"],
  sameAs: [
    "https://www.linkedin.com/company/kost-group",
    "https://www.facebook.com/p/Kost-Groupe-Academy-100067440295455/",
    "https://maps.app.goo.gl/oqJqBNFpBHTSL83d7",
  ],
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
        <UrgenceBanner />
        <Navbar />
        {children}
        <AnalyticsLoader />
        <Analytics />
      </body>
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
    </html>
  );
}