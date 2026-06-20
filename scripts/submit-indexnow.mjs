// Submit all sitemap URLs to IndexNow (Bing, Yandex, Seznam, Yep coverage).
// Google doesn't accept IndexNow directly but Bing handles ~3% of global searches
// and Yandex is significant for Russian/CIS audiences.
//
// Run: node scripts/submit-indexnow.mjs
// Or: pnpm submit:indexnow

import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = "/Users/mac/Documents/kost-funnel";
const SITE_URL = "https://dgr.kostacademy.com";
const KEY = readFileSync(join(root, ".indexnow-key"), "utf-8").trim();

const URLS = [
  `${SITE_URL}/`,
  `${SITE_URL}/dgr-7-1`,
  `${SITE_URL}/dgr-7-2`,
  `${SITE_URL}/dgr-7-3`,
  `${SITE_URL}/dgr-7-4`,
  `${SITE_URL}/dgr-7-5`,
  `${SITE_URL}/dgr-7-6`,
  `${SITE_URL}/dgr-7-7`,
  `${SITE_URL}/dgr-7-8`,
  `${SITE_URL}/dgr-7-9`,
  `${SITE_URL}/dgr-7-10`,
  `${SITE_URL}/mentions-legales`,
  `${SITE_URL}/confidentialite`,
];

const payload = {
  host: "dgr.kostacademy.com",
  key: KEY,
  keyLocation: `${SITE_URL}/${KEY}.txt`,
  urlList: URLS,
};

// Submit to multiple IndexNow endpoints (each one re-distributes to its partners)
const ENDPOINTS = [
  "https://api.indexnow.org/IndexNow",
  "https://www.bing.com/IndexNow",
  "https://yandex.com/indexnow",
];

console.log(`Submitting ${URLS.length} URLs to IndexNow...`);
console.log(`Key location: ${payload.keyLocation}`);
console.log();

for (const endpoint of ENDPOINTS) {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });
    const tag = endpoint.replace(/https?:\/\//, "").split("/")[0];
    if (res.status === 200 || res.status === 202) {
      console.log(`✅ ${tag} → HTTP ${res.status} accepted`);
    } else {
      const text = await res.text().catch(() => "<no body>");
      console.log(`⚠️  ${tag} → HTTP ${res.status} · ${text.slice(0, 100)}`);
    }
  } catch (err) {
    console.error(`❌ ${endpoint} → ${err.message}`);
  }
}

console.log("\nDone. Bing/Yandex will crawl within 24-48h.");
console.log("For Google: use Google Search Console manually (no API for non-authenticated).");
