#!/usr/bin/env node
/**
 * Writes lib/page-lastmod.json: for every public page, the date of the last
 * git commit touching its page file (app/(fr|en)/<slug>/page.tsx).
 * Run after committing content changes: node scripts/generate-page-lastmod.mjs
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const registry = readFileSync(path.join(root, "lib/site-pages.ts"), "utf8");
const paths = [...registry.matchAll(/^\s*p\("([^"]*)"/gm)].map((m) => m[1]);

const out = {};
for (const pagePath of paths) {
  const slug = pagePath.replace(/^\//, "");
  const candidates = ["(fr)", "(en)"].map((group) =>
    path.join("app", group, slug, "page.tsx"),
  );
  const file = candidates.find((rel) => existsSync(path.join(root, rel)));
  if (!file) {
    console.warn(`no page file for "${pagePath}"`);
    continue;
  }
  // Follow renames, but ignore pure moves (R100): only content changes count.
  const log = execFileSync(
    "git",
    ["log", "--follow", "-M", "--format=@@%cI", "--name-status", "--", file],
    { cwd: root, encoding: "utf8" },
  );
  let date = "";
  for (const chunk of log.split("@@").slice(1)) {
    const [when, ...rest] = chunk.trim().split("\n");
    const status = rest.find((line) => line.trim())?.split("\t")[0] ?? "";
    if (status === "R100") continue;
    date = when.trim();
    break;
  }
  if (date) out[pagePath] = date;
}
writeFileSync(path.join(root, "lib/page-lastmod.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`lib/page-lastmod.json: ${Object.keys(out).length} pages`);
