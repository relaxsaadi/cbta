import type { NextConfig } from "next";

// En-têtes de sécurité définis EN CODE (traçable en Git), contrairement à
// V1 où ils n'existaient que sur une config serveur non versionnée (écart
// identifié à l'inspection — voir docs/KOST_EEXAM_V2_ARCHITECTURE.md §1.5).
// Le reverse-proxy nginx de production les redéfinit aussi (défense en
// profondeur), mais le code ne doit jamais en dépendre seul.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  // Next 16 bloque par défaut les assets de dev cross-origin entre
  // "localhost" et "127.0.0.1" (traités comme deux origines distinctes) —
  // nécessaire pour que la suite Playwright (baseURL 127.0.0.1) charge le
  // JS client. Sans effet en production (`next start`), cette protection
  // ne s'applique qu'en dev.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
