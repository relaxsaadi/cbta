// Submit every URL in the live sitemap to IndexNow.
// IndexNow has a single shared endpoint (api.indexnow.org) that fans the
// submission out to every participating search engine (currently Bing,
// Yandex, Seznam, Yep — Google does not consume IndexNow).
//
// Run: node scripts/submit-indexnow.mjs
// Or:  pnpm submit:indexnow

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

const SITE_URL = "https://dgr.kostacademy.com";
const KEY = readFileSync(join(repoRoot, ".indexnow-key"), "utf-8").trim();
const KEY_LOCATION = `${SITE_URL}/${KEY}.txt`;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

/**
 * Fetch the live sitemap.xml and pull out every <loc> URL.
 * (Fetching the rendered sitemap, rather than parsing app/sitemap.ts
 * directly, guarantees we submit exactly what's actually published.)
 */
async function getSitemapUrls() {
  const res = await fetch(`${SITE_URL}/sitemap.xml`);
  if (!res.ok) {
    throw new Error(`Failed to fetch sitemap.xml: HTTP ${res.status}`);
  }
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());
  if (urls.length === 0) {
    throw new Error("No <loc> entries found in sitemap.xml");
  }
  return urls;
}

async function submitToIndexNow(urls) {
  const payload = {
    host: new URL(SITE_URL).host,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });

  if (res.status === 200 || res.status === 202) {
    console.log(`✅ IndexNow accepted the submission (HTTP ${res.status})`);
  } else {
    const text = await res.text().catch(() => "<no body>");
    console.log(`⚠️  IndexNow returned HTTP ${res.status} · ${text.slice(0, 200)}`);
  }
}

const urls = await getSitemapUrls();
console.log(`Submitting ${urls.length} URLs to IndexNow (${INDEXNOW_ENDPOINT})`);
console.log(`Key location: ${KEY_LOCATION}`);
console.log();

try {
  await submitToIndexNow(urls);
} catch (err) {
  console.error(`❌ IndexNow submission failed: ${err.message}`);
  process.exitCode = 1;
}

console.log("\nDone. Bing/Yandex/Seznam/Yep will crawl within 24-48h.");
console.log("Google does not accept IndexNow — submit via Google Search Console instead.");
