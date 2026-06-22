import type { MetadataRoute } from "next";
import { FORMATIONS } from "@/lib/formations";

const dgrSlugs = [
  "dgr-7-1",
  "dgr-7-2",
  "dgr-7-3",
  "dgr-7-4",
  "dgr-7-5",
  "dgr-7-6",
  "dgr-7-7",
  "dgr-7-8",
  "dgr-7-9",
  "dgr-7-10",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://formation.kostacademy.com";
  const now = new Date();

  const dgrUrls = dgrSlugs
    .filter((s) => FORMATIONS.find((f) => f.slug === s))
    .map((slug) => ({
      url: `${base}/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
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
