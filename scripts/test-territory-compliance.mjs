import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = readFileSync(resolve(root, "components/CountryLandingPage.tsx"), "utf8");

assert.match(
  source,
  /classes virtuelles en français (?:sont )?organisées depuis notre centre accrédité en Algérie/i,
  "Country pages must disclose the virtual-classroom delivery option from Algeria."
);
assert.match(
  source,
  /formation en présentiel hors Algérie.*autorisation écrite préalable d['’]IATA/i,
  "Country pages must reserve physical delivery outside Algeria for prior written IATA authorization."
);

console.log("PASS: country pages disclose the Algeria delivery territory and IATA condition.");
