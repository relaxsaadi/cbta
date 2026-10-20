import type { MetadataRoute } from "next";
import { existsSync } from "node:fs";
import path from "node:path";
import { FORMATIONS } from "@/lib/formations";

function hasAppPage(slug: string): boolean {
  return existsSync(path.join(process.cwd(), "app", slug, "page.tsx"));
}

const countryUrls = [
  "formation-dgr-algerie",
  "formation-dgr-maroc",
  "formation-dgr-senegal",
  "formation-dgr-cote-ivoire",
  "formation-dgr-cameroun",
  "formation-dgr-afrique",
  "iata-dangerous-goods-training-algeria",
  "formation-dgr-transitaires",
  "formation-dgr-petrole-gaz",
  "formation-dgr-pharmacie",
  "reglementation-dgr-algerie",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://dgr.kostacademy.com";
  const now = new Date();

  const dgrUrls = FORMATIONS.filter((f) => hasAppPage(f.slug)).map((f) => ({
    url: `${base}/${f.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const countryPages = countryUrls.filter(hasAppPage).map((slug) => ({
    url: `${base}/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...countryPages,
    ...dgrUrls,
    {
      url: `${base}/planning`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${base}/promos`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    {
      url: `${base}/session-aout`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    {
      url: `${base}/a-propos`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${base}/contact`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    },
    {
      url: `${base}/entreprises`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    },
    {
      url: `${base}/mentions-legales`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${base}/confidentialite`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
