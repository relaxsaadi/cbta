#!/usr/bin/env node
/**
 * SEO/GEO regression check against a running site (local `next start` or a
 * Vercel preview). Usage: node scripts/check-seo-geo.mjs http://localhost:3123
 * Exits 1 on any failure.
 */
const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const headers = {};
if (process.env.VERCEL_BYPASS) headers["x-vercel-protection-bypass"] = process.env.VERCEL_BYPASS;

const failures = [];
const fail = (msg) => failures.push(msg);
const get = async (path, opts = {}) => fetch(base + path, { headers, redirect: "manual", ...opts });

const IATA = "https://www.iata.org/en/services/certification/training-development/cbta-center/cbta-certified-companies/eurl-kost-group/1276394/";
const ANAC_FR = "https://www.anac.dz/fr/ecoles-de-formation/";
const MENTION_FR = "centre CBTA référencé IATA, agréé ANAC pour les fonctions 7.1 à 7.10, réf. ANAC/DSOA/SAL-DGR/01/2026";
const MENTION_EN = "IATA-referenced CBTA centre, approved by ANAC for functions 7.1 to 7.10, ref. ANAC/DSOA/SAL-DGR/01/2026";
const BANNED = /\b(premier|première|first|unique|monopole|monopoly|IATA[- ]certified)\b|certifi[ée]e?s? (par l'|par )?IATA|300\+/i;
const INTL = new Set([
  "/formation-dgr-afrique", "/formation-dgr-maroc", "/formation-dgr-tunisie", "/formation-dgr-senegal",
  "/formation-dgr-cote-ivoire", "/formation-dgr-cameroun", "/formation-dgr-mali", "/formation-dgr-gabon",
  "/iata-dgr-recurrent-training", "/cbta-dgr-training-africa", "/iata-dgr-course-nigeria",
  "/iata-dgr-course-ghana", "/iata-dgr-course-kenya",
]);
const EN = new Set([
  "/iata-dangerous-goods-training-algeria", "/iata-dgr-recurrent-training", "/cbta-dgr-training-africa",
  "/iata-dgr-course-nigeria", "/iata-dgr-course-ghana", "/iata-dgr-course-kenya",
]);
const FAQ_PAGES = ["/formation-dgr-alger", "/formation-marchandises-dangereuses-algerie", "/iata-dangerous-goods-training-algeria"];

const visibleText = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");

const jsonLd = (html) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));

const words = (s) => s.trim().split(/\s+/).length;

// --- sitemap ---------------------------------------------------------------
const sm = await (await get("/sitemap.xml")).text();
const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const lastmods = [...sm.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1].slice(0, 10));
if (urls.length !== 49) fail(`sitemap: ${urls.length} URLs (expected 49)`);
if (new Set(lastmods).size < 2) fail(`sitemap: lastmod not differentiated (${new Set(lastmods).size} distinct)`);
const paths = urls.map((u) => new URL(u).pathname.replace(/\/$/, "") || "");

// --- pages -----------------------------------------------------------------
const pages = {};
for (const path of paths) {
  const res = await get(path || "/");
  const html = await res.text();
  pages[path] = html;
  const p = path || "/";
  if (res.status !== 200) fail(`${p}: HTTP ${res.status}`);
  const lang = html.match(/<html[^>]*\blang="([a-z]+)"/)?.[1];
  const wantLang = EN.has(path) ? "en" : "fr";
  if (lang !== wantLang) fail(`${p}: <html lang="${lang}"> (expected ${wantLang})`);
  const text = visibleText(html);
  const banned = text.match(BANNED);
  if (banned) fail(`${p}: banned wording "${banned[0]}" … ${text.slice(Math.max(0, banned.index - 60), banned.index + 60)}`);
  const mention = wantLang === "en" ? MENTION_EN : MENTION_FR;
  if (!text.toLowerCase().includes(mention.toLowerCase())) fail(`${p}: mandatory mention missing`);
  if (!html.includes(IATA)) fail(`${p}: IATA proof link missing`);
  if (html.includes("cbta-center-registry")) fail(`${p}: old IATA 404 link still present`);
  if (/@gmail\.com/.test(html)) fail(`${p}: personal mailbox address present`);
  if (/176 Cité Boushaki/.test(text)) fail(`${p}: old address format`);
  if (!INTL.has(path)) {
    // Legal pages may name the French payment partner (factual disclosure).
    const legal = path === "/mentions-legales" || path === "/confidentialite";
    const cur = text.match(legal ? /€|\bEUR\b|\bUSD\b/ : /€|\bEUR\b|\bUSD\b|STRATEGIX/);
    if (cur) fail(`${p}: currency/billing "${cur[0]}" on Algeria page`);
  }
  for (const block of jsonLd(html)) {
    for (const node of Array.isArray(block) ? block : [block]) {
      const geo = node.geo || node.provider?.geo;
      if (geo && (geo.latitude !== 36.71942 || geo.longitude !== 3.18274)) fail(`${p}: GPS differs`);
      if (node.currenciesAccepted && node.currenciesAccepted !== "DZD") fail(`${p}: currenciesAccepted ${node.currenciesAccepted}`);
      if ([].concat(node["@type"] || []).includes("EducationalOrganization") && node.sameAs) {
        if (!node.sameAs.includes(IATA) || !node.sameAs.includes(ANAC_FR)) fail(`${p}: sameAs missing proof links`);
      }
    }
  }
}

// --- "seul…" formulas next to their proofs on home + formation pages ---------
for (const path of ["", "/formation-dgr-alger", "/formation-dgr-algerie", "/dgr-7-1", "/iata-dangerous-goods-training-algeria"]) {
  const text = visibleText(pages[path] || "");
  const ok = EN.has(path)
    ? text.includes("the only IATA-referenced CBTA centre in Algeria") && text.includes("the only DGR training organisation approved by ANAC in Algeria")
    : text.includes("seul centre CBTA en Algérie référencé par l'IATA") && text.includes("seul organisme de formation DGR agréé par l'ANAC en Algérie");
  if (!ok) fail(`${path || "/"}: "seul…/only…" formulas missing`);
}

// --- hreflang reciprocity ----------------------------------------------------
const alt = (html) =>
  Object.fromEntries(
    [...html.matchAll(/<link rel="alternate" hrefLang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], new URL(m[2]).pathname]),
  );
for (const [path, html] of Object.entries(pages)) {
  const a = alt(html);
  for (const [hl, target] of Object.entries(a)) {
    if (hl === "x-default") continue;
    const back = alt(pages[target === "/" ? "" : target] || "");
    if (!Object.values(back).includes(path || "/")) fail(`${path}: hreflang ${hl} → ${target} not reciprocal`);
  }
  if (Object.keys(a).length && !a["x-default"]) fail(`${path}: hreflang without x-default`);
}
for (const path of ["/formation-dgr-algerie", "/iata-dangerous-goods-training-algeria", "/recyclage-dgr-24-mois", "/iata-dgr-recurrent-training", "/formation-dgr-afrique", "/cbta-dgr-training-africa"]) {
  if (!alt(pages[path] || "")["x-default"]) fail(`${path}: missing hreflang set`);
}

// --- internal inbound links (distinct source pages) ----------------------------
const inbound = {};
for (const [src, html] of Object.entries(pages)) {
  const targets = new Set([...html.matchAll(/<a[^>]+href="(\/[^"#?]*)/g)].map((m) => m[1].replace(/\/$/, "")));
  for (const t of targets) if (t !== src) (inbound[t] ||= new Set()).add(src);
}
let minInbound = Infinity;
for (const path of paths) {
  const n = inbound[path]?.size || 0;
  minInbound = Math.min(minInbound, n);
  if (n < 5) fail(`${path || "/"}: only ${n} internal linking pages`);
}

// --- FAQ blocks ---------------------------------------------------------------
for (const path of FAQ_PAGES) {
  const faq = jsonLd(pages[path] || "").find((n) => n["@type"] === "FAQPage");
  if (!faq) { fail(`${path}: no FAQPage`); continue; }
  const q = faq.mainEntity.map((e) => e.name).join(" | ");
  if (!/centre CBTA IATA en Algérie|IATA CBTA centre in Algeria/.test(q)) fail(`${path}: CBTA-in-Algeria question missing`);
  for (const e of faq.mainEntity) {
    const n = words(e.acceptedAnswer.text);
    if (n < 40 || n > 60) fail(`${path}: FAQ answer ${n} words — "${e.name}"`);
  }
}

// --- redirects, 404, robots, llms, CSP ------------------------------------------
for (const [from, to] of [["/session-aout", "/planning"], ["/reglementation", "/reglementation-dgr-algerie"]]) {
  const res = await get(from);
  if (res.status !== 301 || !res.headers.get("location")?.endsWith(to)) fail(`${from}: ${res.status} → ${res.headers.get("location")}`);
}
const nf = await get("/page-qui-n-existe-pas");
if (nf.status !== 404) fail(`unknown URL returns ${nf.status}`);
const robots = await (await get("/robots.txt")).text();
for (const bot of ["OAI-SearchBot", "GPTBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot"]) {
  if (!new RegExp(`User-Agent: ${bot}\\nAllow: /`, "i").test(robots)) fail(`robots.txt: ${bot} not explicitly allowed`);
}
for (const f of ["/llms.txt", "/llms-full.txt"]) {
  const res = await get(f);
  const t = await res.text();
  if (res.status !== 200) fail(`${f}: HTTP ${res.status}`);
  if (/SOURCE GAP|SOURCE CONFLICT|Tier A|\bAPPROVED\b|reviewer/.test(t)) fail(`${f}: internal jargon`);
  if (!t.includes(IATA) || !t.includes(ANAC_FR)) fail(`${f}: proof links missing`);
  if (!/\[[^\]]+\]\(https:\/\/dgr\.kostacademy\.com/.test(t)) fail(`${f}: not Markdown links`);
  if (BANNED.test(t)) fail(`${f}: banned wording`);
  if (/€|\bEUR\b|\bUSD\b/.test(t)) fail(`${f}: EUR/USD`);
}
const csp = (await get("/")).headers.get("content-security-policy") || "";
if (!csp.includes("px4.ads.linkedin.com")) fail("CSP: px4.ads.linkedin.com missing");

console.log(`Checked ${paths.length} pages on ${base} — min internal linking pages per URL: ${minInbound}`);
if (failures.length) {
  console.log(`FAIL (${failures.length})`);
  for (const f of failures) console.log(" - " + f);
  process.exit(1);
}
console.log("PASS: all SEO/GEO checks");
