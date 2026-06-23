import type { Metadata } from "next";
import type { Formation } from "./formations";

export function buildFormationMetadata(formation: Formation): Metadata {
  // Keep title ≤47 chars so "— KOST GROUP" suffix stays under 60 total
  const shortTitle = `${formation.code} — ${formation.title}`.slice(0, 47).replace(/\s\S+$/, "");
  return {
    title: shortTitle,
    description: `${formation.description} Durée : ${formation.duree}. Tarif : ${formation.prixEur} €.`,
    alternates: { canonical: `/${formation.slug}` },
    openGraph: {
      title: shortTitle,
      description: formation.description,
      url: `/${formation.slug}`,
    },
  };
}

export function courseSchema(formation: Formation) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${formation.code} — ${formation.title}`,
    description: formation.description,
    provider: {
      "@type": "EducationalOrganization",
      name: "KOST GROUP",
      sameAs: process.env.NEXT_PUBLIC_SITE_URL || "https://dgr.kostacademy.com",
    },
    offers: {
      "@type": "Offer",
      price: formation.prixEur,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      category: "Professional Training",
    },
    educationalCredentialAwarded: "Certificat IATA CBTA",
    timeRequired: formation.duree,
  };
}
