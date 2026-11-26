import type { Metadata } from "next";
import {
  CONTACT_EMAIL,
  MENTION_EN,
  MENTION_FR,
  SITE_URL,
  WHATSAPP_DISPLAY,
  WHATSAPP_E164,
  providerSchema,
  whatsAppHref,
} from "./kost-facts";
import { alternatesFor } from "./site-pages";

export const SITE = SITE_URL;

/** Mandatory official wording (see lib/kost-facts.ts). */
export const OFFICIAL_FR = MENTION_FR;
export const OFFICIAL_EN = MENTION_EN;

export { CONTACT_EMAIL, WHATSAPP_DISPLAY, WHATSAPP_E164, whatsAppHref };

type MetaInput = {
  title: string;
  description: string;
  slug: string;
  locale: "fr" | "en";
  keywords: string[];
  languages?: Record<string, string>;
};

export function exactMatchMetadata({
  title,
  description,
  slug,
  locale,
  keywords,
}: MetaInput): Metadata {
  return {
    title: { absolute: title },
    description,
    keywords,
    // Canonical + reciprocal hreflang come from the page registry.
    alternates: alternatesFor(`/${slug}`),
    openGraph: {
      title,
      description,
      url: `${SITE}/${slug}`,
      locale: locale === "en" ? "en_US" : "fr_FR",
      type: "website",
      siteName: "KOST Academy",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.jpg"],
    },
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(crumbs: Crumb[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.path === "" ? SITE : `${SITE}${crumb.path}`,
    })),
  }).replace(/</g, "\\u003c");
}

export function courseJsonLd(input: {
  name: string;
  description: string;
  slug: string;
  inLanguage: "fr" | "en";
}): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Course",
    name: input.name,
    description: input.description,
    url: `${SITE}/${input.slug}`,
    inLanguage: input.inLanguage,
    provider: providerSchema(),
  }).replace(/</g, "\\u003c");
}
