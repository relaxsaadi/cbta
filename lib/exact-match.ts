import type { Metadata } from "next";

export const SITE = "https://dgr.kostacademy.com";

export const OFFICIAL_FR =
  "centre de formation DGR/CBTA dont les habilitations applicables doivent être vérifiées pour la prestation envisagée";

export const OFFICIAL_EN =
  "DGR/CBTA training centre whose applicable authorizations must be verified for the proposed course";

export const CONTACT_EMAIL = "cbta@kostacademy.com";
export const WHATSAPP_DISPLAY = "+213 542 305 383";
export const WHATSAPP_E164 = "213542305383";

export function whatsAppHref(message: string): string {
  return `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(message)}`;
}

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
  languages,
}: MetaInput): Metadata {
  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: {
      canonical: `/${slug}`,
      languages,
    },
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
    provider: {
      "@type": "EducationalOrganization",
      name: "KOST Academy",
      url: SITE,
      address: {
        "@type": "PostalAddress",
        streetAddress: "176 Cité Boushaki, Bab Ezzouar",
        addressLocality: "Alger",
        postalCode: "16024",
        addressCountry: "DZ",
      },
    },
  }).replace(/</g, "\\u003c");
}
