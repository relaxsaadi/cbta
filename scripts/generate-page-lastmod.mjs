#!/usr/bin/env node
/**
 * Writes lib/page-lastmod.json: for every public page, the date of the last
 * commit that changed its main content — the page file itself plus the page
 * template it renders (not the site-wide navbar/footer). Pure renames are
 * ignored. Run after committing content changes:
 *   node scripts/generate-page-lastmod.mjs
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const registry = readFileSync(path.join(root, "lib/site-pages.ts"), "utf8");
const paths = [...registry.matchAll(/^\s*p\("([^"]*)"/gm)].map((m) => m[1]);

const TEMPLATES = ["ExactMatchPage", "CountryLandingPage", "DGRPage", "PlanningPage", "PromosPage"];

/** Date of the last content commit touching a file (pure R100 moves ignored). */
function lastContentDate(file) {
  const log = execFileSync(
    "git",
    ["log", "--follow", "-M", "--format=@@%cI", "--name-status", "--", file],
    { cwd: root, encoding: "utf8" },
  );
  for (const chunk of log.split("@@").slice(1)) {
    const [when, ...rest] = chunk.trim().split("\n");
    const status = rest.find((line) => line.trim())?.split("\t")[0] ?? "";
    if (status === "R100") continue;
    return when.trim();
  }
  return "";
}

const out = {};
for (const pagePath of paths) {
  const slug = pagePath.replace(/^\//, "");
  const file = ["(fr)", "(en)"]
    .map((group) => path.join("app", group, slug, "page.tsx"))
    .find((rel) => existsSync(path.join(root, rel)));
  if (!file) {
    console.warn(`no page file for "${pagePath}"`);
    continue;
  }
  const source = readFileSync(path.join(root, file), "utf8");
  const templates = TEMPLATES.filter((name) => source.includes(`@/components/${name}"`)).map(
    (name) => `components/${name}.tsx`,
  );
  const date = [file, ...templates].map(lastContentDate).filter(Boolean).sort().at(-1);
  if (date) out[pagePath] = date;
}
writeFileSync(path.join(root, "lib/page-lastmod.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`lib/page-lastmod.json: ${Object.keys(out).length} pages`);
