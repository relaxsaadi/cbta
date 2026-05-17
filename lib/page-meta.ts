import type { Metadata } from "next";
import type { Formation } from "./formations";

export function buildFormationMetadata(formation: Formation): Metadata {
  return {
    title: `${formation.code} — ${formation.title}`,
    description: `${formation.description} Durée : ${formation.duree}. Tarif : ${formation.prixEur} € / ${formation.prixUsd} $.`,
    alternates: { canonical: `/${formation.slug}` },
    openGraph: {
      title: `${formation.code} — ${formation.title} | KOST GROUP`,
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
      sameAs: process.env.NEXT_PUBLIC_SITE_URL || "https://formation.kostacademy.com",
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
