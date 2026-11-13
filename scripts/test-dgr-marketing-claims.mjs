// Regression tests for the public DGR outbound-copy fail-closed guard.
// This only tests known unsupported-claim examples; it is not a regulatory
// review, proof that arbitrary generated copy is safe, or source verification.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = readFileSync(resolve("lib/dgr-marketing-claims.ts"), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const exports = {};
runInNewContext(compiled, { exports });
const { assertSafeDgrMarketingCopy } = exports;
assert.equal(typeof assertSafeDgrMarketingCopy, "function");

const forbidden = [
  "KOST est agréé par l'ANAC.",
  "L'ANAC a agréé notre centre.",
  "Notre organisme est reconnu par IATA.",
  "L'ANAC a habilité KOST pour toutes les fonctions.",
  "KOST est le seul organisme CBTA en Algérie.",
  "<p>KOST est agréé par <strong>l'ANAC</strong>.</p>",
  "<p>KOST est agr&eacute;&eacute; par <b>l'ANAC</b>.</p>",
  "Réservez votre session septembre 2026.",
  "Nous sommes le premier centre de formation en Algérie.",
];
const permitted = [
  "KOST est un organisme de formation DGR/CBTA.",
  "<p>Nous pouvons étudier vos tâches afin de déterminer la fonction CBTA pertinente.</p>",
  "Les conditions applicables doivent être vérifiées dans les sources en vigueur.",
];
for (const text of forbidden) {
  assert.throws(() => assertSafeDgrMarketingCopy(text), /blocked generated copy/, text);
}
for (const text of permitted) {
  assert.doesNotThrow(() => assertSafeDgrMarketingCopy(text), text);
}
// The shared public footer is static JSX and bypasses the generated-copy guard.
// A registry link must not imply unsupported first-provider status or that all
// KOST DGR training is "official" absent separately verified current evidence.
const footer = readFileSync(resolve("components/Footer.tsx"), "utf8");
assert.doesNotMatch(footer, /1\s*<sup>er<\/sup>\s*CBTA Provider IATA/i);
assert.doesNotMatch(footer, /Formations DGR officielles/i);
assert.match(footer, /Consulter le registre IATA des centres CBTA/);

console.log("PASS: DGR marketing-copy claim guard regression cases");
