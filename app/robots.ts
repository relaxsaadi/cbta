import type { MetadataRoute } from "next";

const PRIVATE = ["/api/", "/merci", "/dashboard"];

/** Search and AI-answer crawlers explicitly allowed (GEO). */
const AI_CRAWLERS = [
  "OAI-SearchBot",
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "PerplexityBot",
  "Google-Extended",
  "Applebot",
];

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://dgr.kostacademy.com";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/", disallow: PRIVATE })),
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
