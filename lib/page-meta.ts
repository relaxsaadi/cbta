import type { Metadata } from "next";
import type { Formation } from "./formations";

export function buildFormationMetadata(formation: Formation): Metadata {
  const shortTitle = `${formation.code} — ${formation.title}`.slice(0, 47).replace(/\s\S+$/, "");
  return {
    title: shortTitle,
    description: formation.description,
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
  };
}
