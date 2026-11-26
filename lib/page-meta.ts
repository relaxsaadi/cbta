import type { Metadata } from "next";
import { getFormationBySlug, type Formation } from "./formations";
import { SITE_URL, providerSchema } from "./kost-facts";
import { alternatesFor } from "./site-pages";

export function buildFormationMetadata(formation: Formation): Metadata {
  const shortTitle = `${formation.code} — ${formation.title}`.slice(0, 47).replace(/\s\S+$/, "");
  return {
    title: shortTitle,
    description: formation.description,
    alternates: alternatesFor(`/${formation.slug}`),
    openGraph: {
      title: shortTitle,
      description: formation.description,
      url: `/${formation.slug}`,
    },
  };
}

export function courseSchema(formation: Formation) {
  const recurrent = getFormationBySlug(`${formation.slug}-recurrent`);
  const offer = (f: Formation) => ({
    "@type": "Offer",
    name: f.code,
    price: f.prixDa,
    priceCurrency: "DZD",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: f.prixDa,
      priceCurrency: "DZD",
      valueAddedTaxIncluded: false,
    },
    category: "Formation professionnelle",
    url: `${SITE_URL}/${formation.slug}`,
  });
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${formation.code} — ${formation.title}`,
    description: formation.description,
    url: `${SITE_URL}/${formation.slug}`,
    inLanguage: "fr",
    timeRequired: formation.duree,
    provider: providerSchema(),
    offers: recurrent ? [offer(formation), offer(recurrent)] : [offer(formation)],
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: ["Onsite", "Online"],
      location: {
        "@type": "Place",
        name: "KOST Academy — Bab Ezzouar",
        address: providerSchema().address,
        geo: providerSchema().geo,
      },
    },
  };
}
