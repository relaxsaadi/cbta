#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const FUNCTIONS = ['7.1', '7.2', '7.3', '7.4', '7.5', '7.6', '7.7', '7.8', '7.9', '7.10'];

// Do not hard-code a three-batch shape here. Each CBTA function is governed by
// its own source/task structure and may have a different number of drafting
// batches. The only fact this gate needs is that the bank declares a later
// consolidated all-batches Tier-A verification pass for that function.
const CONSOLIDATED_PASS = /Tier A verification pass[\s\S]{0,320}consolidated note covering all[\s\S]{0,120}Function\s+7\.\d+\s+batches/i;
const STALE_NONE_VERIFIED = /None has been\s+Tier A-verified against the current IATA DGR 67th Edition/gi;
const HISTORICAL_MARKER = /(Original status|Original blocker|historical(?: drafting)? status|historical record|superseded)/i;

function nearestHeadingStart(text, start) {
  const prefix = text.slice(0, start);
  let last = -1;
  for (const match of prefix.matchAll(/^#{1,6}\s+.+$/gm)) {
    last = match.index ?? last;
  }
  return last >= 0 ? last : Math.max(0, start - 900);
}

function findViolationsInText(text, functionCode) {
  if (!CONSOLIDATED_PASS.test(text)) return [];

  const violations = [];
  for (const match of text.matchAll(STALE_NONE_VERIFIED)) {
    const start = match.index ?? 0;
    const localStart = nearestHeadingStart(text, start);
    const nearby = text.slice(localStart, start);

    // A preserved drafting-time statement is acceptable only when its own
    // local Markdown section clearly labels it historical/superseded. Do not
    // let an unrelated marker from a preceding section suppress a real
    // contradiction merely because it happens to be within a byte window.
    if (!HISTORICAL_MARKER.test(nearby)) {
      const prefix = text.slice(0, start);
      const line = prefix.split(/\r?\n/).length;
      violations.push({ functionCode, line });
    }
  }
  return violations;
}

function runSelfTest() {
  const contradictory = `# Bank\n## 2026-08-25 Tier A verification pass (consolidated note covering all three Function 7.8 batches)\n12 items FROZEN.\n## Status of this batch — read before using\n**All 15 items in this batch are DRAFT. None has been Tier A-verified against the current IATA DGR 67th Edition text.**\n`;
  const historical = `# Bank\n## 2026-08-25 Tier A verification pass (consolidated note covering all three Function 7.8 batches)\n12 items FROZEN.\n## Status of this batch — read before using\n**Original status (superseded for the items above):** all items were drafted before the live pass.\n**All 15 items in this batch are DRAFT. None has been Tier A-verified against the current IATA DGR 67th Edition text.**\n`;
  const noConsolidatedPass = `# Bank\n## Status of this batch\n**All 15 items in this batch are DRAFT. None has been Tier A-verified against the current IATA DGR 67th Edition text.**\n`;
  const fourBatchConsolidated = `# Bank\n## 2026-08-25 Tier A verification pass (consolidated note covering all four Function 7.8 batches)\n12 items FROZEN.\n## Status of this batch\n**All 15 items in this batch are DRAFT. None has been Tier A-verified against the current IATA DGR 67th Edition text.**\n`;
  const unrelatedHistoricalMarker = `# Bank\n## 2026-08-25 Tier A verification pass (consolidated note covering all three Function 7.8 batches)\n12 items FROZEN.\n## Prior provenance note\nThis superseded note is retained for history.\n## Status of this batch — read before using\n**All 15 items in this batch are DRAFT. None has been Tier A-verified against the current IATA DGR 67th Edition text.**\n`;

  const a = findViolationsInText(contradictory, '7.8');
  const b = findViolationsInText(historical, '7.8');
  const c = findViolationsInText(noConsolidatedPass, '7.8');
  const d = findViolationsInText(fourBatchConsolidated, '7.8');
  const e = findViolationsInText(unrelatedHistoricalMarker, '7.8');

  if (a.length !== 1) throw new Error('Regression fixture failed: current-sounding stale batch status was not rejected.');
  if (b.length !== 0) throw new Error('Regression fixture failed: explicitly historical/superseded status was rejected.');
  if (c.length !== 0) throw new Error('Regression fixture failed: bank without a consolidated pass was incorrectly rejected.');
  if (d.length !== 1) throw new Error('Regression fixture failed: non-three-batch consolidated pass escaped the gate.');
  if (e.length !== 1) throw new Error('Regression fixture failed: unrelated historical marker suppressed a current-section contradiction.');

  console.log('PASS: production-bank status-precedence regression fixtures');
}

if (process.argv.includes('--test')) {
  runSelfTest();
  process.exit(0);
}

const root = process.cwd();
const violations = [];

for (const functionCode of FUNCTIONS) {
  const file = path.join(root, 'docs', `DGR_PRODUCTION_BANK_${functionCode}.md`);
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  violations.push(...findViolationsInText(text, functionCode));
}

if (violations.length > 0) {
  console.error('ERROR: production-bank status precedence is ambiguous/contradictory after a consolidated all-batches Tier-A pass.');
  for (const violation of violations) {
    console.error(` - Function ${violation.functionCode}: stale current-sounding "None has been Tier A-verified" statement near line ${violation.line}. Label the preserved drafting-time block HISTORICAL/SUPERSEDED or regenerate it from current per-item state.`);
  }
  console.error('See docs/DGR_PRODUCTION_BANK_STATUS_PRECEDENCE_CORRECTION_2026-09-22.md.');
  process.exit(1);
}

console.log('PASS: no unlabelled stale production-bank status contradictions detected.');
