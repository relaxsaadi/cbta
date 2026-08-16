import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  poweredByHeader: false,
  compress: true,
  outputFileTracingRoot: path.join(__dirname),
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    // Content-Security-Policy — every domain below is authorized because it is
    // actually loaded by the site today. No nonce system is in place, so
    // 'unsafe-inline' is used for script-src/style-src (inline JSON-LD in
    // app/layout.tsx, inline gtag/LinkedIn/Meta bootstrap snippets in
    // components/AnalyticsLoader.tsx, and Tailwind's inline style attributes).
    const csp = [
      // Fallback for any directive not explicitly listed below.
      "default-src 'self'",

      // script-src:
      // - 'self'              → Next.js app bundles, /_vercel/insights/script.js
      // - 'unsafe-inline'     → inline JSON-LD (layout.tsx) + inline bootstrap
      //                         scripts (AnalyticsLoader.tsx); no nonce system exists
      // - googletagmanager.com→ GTM loader (<GoogleTagManager> in layout.tsx) and
      //                         the gtag.js/GA4 script GTM injects
      // - google-analytics.com→ GA4 script variant sometimes served from this host
      // - snap.licdn.com      → LinkedIn Insight Tag script (AnalyticsLoader.tsx)
      // - connect.facebook.net→ Meta Pixel script (fbevents.js, AnalyticsLoader.tsx)
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://snap.licdn.com https://connect.facebook.net",

      // style-src:
      // - 'self' / 'unsafe-inline' → Tailwind runtime + inline style attributes
      // - fonts.googleapis.com     → Google Fonts stylesheet (preconnect in layout.tsx)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

      // font-src: Google Fonts font files (fonts.gstatic.com, preconnect in layout.tsx)
      "font-src 'self' https://fonts.gstatic.com data:",

      // img-src:
      // - 'self' / data: / blob: → Next/Image optimizer output + inline/base64 assets
      // - www.googletagmanager.com → GTM <noscript> pixel fallback
      // - www.google-analytics.com → GA4 image-beacon fallback
      // - www.facebook.com         → Meta Pixel /tr beacon
      // - px.ads.linkedin.com / www.linkedin.com → LinkedIn Insight Tag conversion beacon + px sync redirect
      "img-src 'self' data: blob: https://www.googletagmanager.com https://www.google-analytics.com https://www.facebook.com https://px.ads.linkedin.com https://www.linkedin.com",

      // connect-src (fetch/XHR/beacon targets):
      // - 'self'                      → same-origin API routes (/api/lead, /api/leads, ...)
      // - vitals.vercel-insights.com  → @vercel/analytics beacon (layout.tsx <Analytics />)
      // - googletagmanager.com/google-analytics.com/region1.google-analytics.com → GTM + GA4 hit collection
      // - analytics.google.com        → actual GA4 /g/collect endpoint gtag.js hits from
      //                                 (found via live CSP-violation audit, not just the config host)
      // - www.google.com              → Google consent-mode / cross-domain measurement collect pings
      // - stats.g.doubleclick.net     → Google Ads conversion linking (also fired by the GA4/GTM tag)
      // - snap.licdn.com / px.ads.linkedin.com / www.linkedin.com → LinkedIn Insight Tag calls + px sync
      // - connect.facebook.net / www.facebook.com → Meta Pixel event calls
      "connect-src 'self' https://vitals.vercel-insights.com https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com https://www.google.com https://stats.g.doubleclick.net https://snap.licdn.com https://px.ads.linkedin.com https://www.linkedin.com https://connect.facebook.net https://www.facebook.com",

      // frame-src: GTM's <noscript> iframe fallback (ns.html)
      "frame-src https://www.googletagmanager.com",

      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy", value: csp },
          // Disable browser features the site never uses.
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
