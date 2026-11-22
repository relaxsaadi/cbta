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
    default: "Formation marchandises dangereuses aérien | DGR & CBTA — Algérie",
    template: "%s — KOST GROUP",
  },
  description:
    "Formations sur les marchandises dangereuses en transport aérien. Le périmètre est déterminé selon les tâches réelles et les exigences applicables de l'État et de l'exploitant.",
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
    title: "Formation DGR & CBTA — KOST GROUP",
    description:
      "Formation et accompagnement sur les marchandises dangereuses en transport aérien. Périmètre défini selon les tâches, les règles applicables et les exigences de l'exploitant.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "KOST GROUP — formation marchandises dangereuses et CBTA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Formation IATA DGR-CBTA — KOST GROUP",
    description:
      "Formation DGR et approche CBTA : périmètre et modalités précisés dans le programme.",
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
    "Organisme proposant des formations sur les marchandises dangereuses en transport aérien. Les fonctions et tâches à couvrir sont déterminées à partir des activités réelles et des exigences applicables.",
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
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Formations IATA DGR — Marchandises Dangereuses",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Course",
          name: "Formation IATA DGR Catégorie 7 — Initial",
          description:
            "Formation initiale sur les marchandises dangereuses en transport aérien. Les tâches, objectifs et modalités d'évaluation sont définis dans le programme applicable.",
          provider: { "@type": "Organization", name: "KOST GROUP" },
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Course",
          name: "Formation IATA DGR Recyclage — Recurrent",
          description:
            "Formation récurrente selon les exigences applicables à la fonction, aux tâches, à l'État et à l'exploitant concernés.",
          provider: { "@type": "Organization", name: "KOST GROUP" },
        },
      },
    ],
  },
  areaServed: ["DZ"],
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
