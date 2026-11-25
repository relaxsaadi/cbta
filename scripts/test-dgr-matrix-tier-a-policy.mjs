#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  hasConcreteLocator,
  hasCurrentEdition2026,
  hasCurrentEdition2026WithConcreteLocator,
  hasIataDgrSourceIdentity,
  hasNonDirectItemEvidence,
  isVerifiedFrState,
  validateTierAEvidenceForFrState,
} from "./lib/dgr-matrix-tier-a-policy.mjs";

function errors(input) {
  return validateTierAEvidenceForFrState(input);
}

assert.equal(isVerifiedFrState("FROZEN FR / SOURCE VERIFIED"), true);
assert.equal(isVerifiedFrState("NOT YET VERIFIED"), false);
assert.equal(isVerifiedFrState("SOURCE GAP"), false);
assert.equal(hasIataDgrSourceIdentity("IATA DGR 67th Edition 2026 § 5.0.1.2(c)"), true);
assert.equal(hasIataDgrSourceIdentity("DGR 67th Edition 2026 § 5.0.1.2(c)"), true);
assert.equal(hasIataDgrSourceIdentity("IATA Dangerous Goods Regulations 67th Edition 2026 § 5.0.1.2(c)"), true);
assert.equal(hasIataDgrSourceIdentity("SOURCE VERIFIED — DGR 67th Edition 2026 § 5.0.1.2(c)"), true);
assert.equal(hasIataDgrSourceIdentity("67th Edition 2026 § 5.0.1.2(c)"), false);
assert.equal(hasIataDgrSourceIdentity("IATA 67th Edition 2026 § 5.0.1.2(c)"), false);
assert.equal(hasIataDgrSourceIdentity("Dangerous Goods Regulations 67th Edition 2026 § 5.0.1.2(c)"), false);
assert.equal(hasIataDgrSourceIdentity("Company DGR Manual 67th Edition 2026 § 5.0.1.2(c)"), false);
assert.equal(hasIataDgrSourceIdentity("Local DGR Guide 67th Edition 2026 § 5.0.1.2(c)"), false);
assert.equal(hasIataDgrSourceIdentity("ICAO DGR Guide 67th Edition 2026 § 5.0.1.2(c)"), false);
assert.equal(hasIataDgrSourceIdentity("DGR Company Manual 67th Edition 2026 § 5.0.1.2(c)"), false);
assert.equal(hasIataDgrSourceIdentity("DGR Local Guide 67th Edition 2026 § 5.0.1.2(c)"), false);
assert.equal(hasIataDgrSourceIdentity("IATA DGR Company Manual 67th Edition 2026 § 5.0.1.2(c)"), false);
assert.equal(hasConcreteLocator("IATA DGR 67th Edition 2026 § 5.0.1.2(c)"), true);
assert.equal(hasConcreteLocator("IATA DGR 67th Edition 2026 Table 2.3.A"), true);
assert.equal(hasConcreteLocator("IATA DGR 67th Edition 2026 5.0.1.2(c)"), true);
assert.equal(hasConcreteLocator("IATA DGR 67th Edition 2026 1.1"), true);
assert.equal(hasConcreteLocator("IATA DGR 67th Edition 2026 v1.0"), false);
assert.equal(hasConcreteLocator("IATA DGR 67th Edition 2026 version 2.3"), false);
assert.equal(hasConcreteLocator("IATA DGR 67th Edition 2026 rev. 3.1"), false);
assert.equal(hasConcreteLocator("IATA DGR 67th Edition 2026 revision: 4.2"), false);
assert.equal(hasConcreteLocator("IATA DGR 67th Edition 2026"), false);
assert.equal(hasNonDirectItemEvidence("Representative sample of this citation pattern was checked"), true);
assert.equal(hasNonDirectItemEvidence("This item's own specific citation was not independently re-read this pass"), true);
assert.equal(hasNonDirectItemEvidence("Citation was used as-is and follows the same verified batch pattern"), true);
assert.equal(hasNonDirectItemEvidence("Exact item-specific current-text re-read still needs durable provenance"), true);
assert.equal(hasNonDirectItemEvidence("This locator is not item-specific"), true);
assert.equal(hasNonDirectItemEvidence("Item-specific evidence is still required"), true);
assert.equal(hasNonDirectItemEvidence("Échantillon représentatif seulement"), true);
assert.equal(hasNonDirectItemEvidence("Citation non relue indépendamment"), true);
assert.equal(hasNonDirectItemEvidence("Preuve non spécifique à l'item"), true);
assert.equal(hasNonDirectItemEvidence("Provenance spécifique à l'item reste à confirmer"), true);
assert.equal(hasNonDirectItemEvidence("Direct item verification against IATA DGR 67th Edition 2026 §1.1"), false);
assert.equal(hasNonDirectItemEvidence("Direct item-specific verification completed against IATA DGR 67th Edition 2026 §1.1"), false);
assert.equal(hasNonDirectItemEvidence("Vérification spécifique à l'item terminée contre IATA DGR 67e édition 2026 §1.1"), false);

assert.equal(
  hasCurrentEdition2026("DGR 66th Edition 2025 §1.1; internal reference 67th Edition 2026 §2.2"),
  false,
  "an older DGR source and a separate current local source must not synthesize current DGR identity",
);
assert.equal(
  hasCurrentEdition2026("Company DGR Manual 67th Edition 2026 §2.2"),
  false,
  "a third-party DGR-named manual must not satisfy direct current IATA DGR identity",
);
assert.equal(
  hasCurrentEdition2026("DGR Company Manual 67th Edition 2026 §2.2"),
  false,
  "a third-party title beginning with DGR must not satisfy direct current IATA DGR identity",
);
assert.equal(
  hasCurrentEdition2026WithConcreteLocator("IATA DGR Local Guide 67th Edition 2026 §2.2"),
  false,
  "an IATA-DGR-prefixed local guide must not satisfy direct current IATA DGR evidence",
);
assert.equal(
  hasCurrentEdition2026WithConcreteLocator("Local DGR Guide 67th Edition 2026 §2.2"),
  false,
  "a local DGR-named guide must not satisfy direct current IATA DGR evidence",
);
assert.equal(
  hasCurrentEdition2026WithConcreteLocator("DGR 67th Edition 2026; internal reference §2.2"),
  false,
  "a locator in another source segment must not satisfy current DGR direct-evidence syntax",
);
assert.equal(
  hasCurrentEdition2026WithConcreteLocator("DGR 67th Edition 2026 rev 1.0"),
  false,
  "a revision number must not masquerade as a concrete current-DGR locator",
);
assert.equal(
  hasCurrentEdition2026WithConcreteLocator("DGR 67th Edition 2026 1.1"),
  true,
  "a legitimate bare dotted DGR section reference must remain valid",
);
assert.equal(
  hasCurrentEdition2026WithConcreteLocator("DGR 67th Edition 2026 §1.1; internal cross-reference p.2"),
  true,
  "canonical current DGR identity and locator in the same source segment must remain valid",
);
assert.equal(
  hasCurrentEdition2026WithConcreteLocator(
    "DGR 66th Edition 2025 §1.1; IATA Dangerous Goods Regulations 67th Edition 2026 Table 2.3.A",
  ),
  true,
  "a separate segment that itself identifies current IATA DGR and a locator must remain valid",
);

assert.ok(
  errors({
    tierAEvidence: "SOURCE GAP",
    frState: "FROZEN FR / SOURCE VERIFIED",
    frVerifier: "Qualified Reviewer — 2026-09-06",
  }).some((error) => error.includes("explicitly non-verified")),
  "SOURCE GAP + FR VERIFIED must fail",
);

assert.ok(
  errors({
    tierAEvidence: "IATA DGR 67th Edition 2026 — to verify",
    frState: "FROZEN FR / SOURCE VERIFIED",
    frVerifier: "Qualified Reviewer — 2026-09-06",
  }).length > 0,
  "current-edition wording with provisional phrase must fail",
);

for (const tierAEvidence of [
  "IATA DGR 67th Edition 2026 §1.1 — representative sample of this citation pattern was independently spot-verified",
  "IATA DGR 67th Edition 2026 §1.1 — this item's own specific citation was not independently re-read this pass",
  "IATA DGR 67th Edition 2026 §1.1 — citation was used as-is and follows the same verified batch pattern",
  "IATA DGR 67th Edition 2026 §1.2.4(b) — exact item-specific current-text re-read still needs durable provenance",
  "IATA DGR 67th Edition 2026 §1.1 — this locator is not item-specific",
  "IATA DGR 67th Edition 2026 §1.1 — item-specific evidence is still required",
  "IATA DGR 67e édition 2026 §1.1 — échantillon représentatif seulement",
  "IATA DGR 67e édition 2026 §1.1 — citation non relue indépendamment",
  "IATA DGR 67e édition 2026 §1.1 — preuve non spécifique à l'item",
  "IATA DGR 67e édition 2026 §1.1 — provenance spécifique à l'item reste à confirmer",
]) {
  assert.ok(
    errors({
      tierAEvidence,
      frState: "FROZEN FR / SOURCE VERIFIED",
      frVerifier: "Qualified Reviewer — 2026-09-06",
    }).some((error) => error.includes("representative/indirect")),
    `${tierAEvidence} must not satisfy direct item-specific Tier-A verification`,
  );
}

assert.deepEqual(
  errors({
    tierAEvidence: "IATA DGR 67th Edition 2026 §1.1 — this item's own specific citation was not independently re-read this pass",
    frState: "DRAFT / NOT YET VERIFIED",
    frVerifier: "",
  }),
  [],
  "a truthful non-terminal FR state may retain representative evidence wording as a reconciliation lead",
);

assert.deepEqual(
  errors({
    tierAEvidence: "IATA DGR 67th Edition 2026 §1.2.4(b) — exact item-specific current-text re-read still needs durable provenance",
    frState: "DRAFT / NOT YET VERIFIED",
    frVerifier: "",
  }),
  [],
  "a truthful non-terminal FR state may retain unresolved item-specific provenance wording as a reconciliation lead",
);

assert.deepEqual(
  errors({
    tierAEvidence: "IATA DGR 67e édition 2026 §1.1 — provenance spécifique à l'item reste à confirmer",
    frState: "DRAFT / NOT YET VERIFIED",
    frVerifier: "",
  }),
  [],
  "a truthful non-terminal FR state may retain French unresolved item-specific provenance wording as a reconciliation lead",
);

assert.deepEqual(
  errors({
    tierAEvidence: "DRAFT — IATA DGR 67th Edition 2026 §1.1 lead only; representative sample checked, item-specific verification still required",
    frState: "DRAFT",
    frVerifier: "",
  }),
  [],
  "explicit non-verified evidence state must remain representable without promotion",
);

assert.ok(
  errors({
    tierAEvidence: "IATA DGR 67th Edition 2026",
    frState: "FROZEN FR / SOURCE VERIFIED",
    frVerifier: "Qualified Reviewer — 2026-09-06",
  }).some((error) => error.includes("concrete section/table/page locator")),
  "edition/year alone must not satisfy a verified FR row",
);

for (const tierAEvidence of [
  "IATA DGR 67th Edition 2026 v1.0",
  "IATA DGR 67th Edition 2026 version 2.3",
  "IATA DGR 67th Edition 2026 rev. 3.1",
  "IATA DGR 67th Edition 2026 revision: 4.2",
]) {
  assert.ok(
    errors({
      tierAEvidence,
      frState: "FROZEN FR / SOURCE VERIFIED",
      frVerifier: "Qualified Reviewer — 2026-09-06",
    }).some((error) => error.includes("concrete section/table/page locator")),
    `${tierAEvidence} must not satisfy the concrete locator gate`,
  );
}

for (const tierAEvidence of [
  "67th Edition 2026 § 5.0.1.2(c)",
  "IATA 67th Edition 2026 § 5.0.1.2(c)",
  "Dangerous Goods Regulations 67th Edition 2026 § 5.0.1.2(c)",
  "Company DGR Manual 67th Edition 2026 § 5.0.1.2(c)",
  "Local DGR Guide 67th Edition 2026 § 5.0.1.2(c)",
  "DGR Company Manual 67th Edition 2026 § 5.0.1.2(c)",
  "DGR Local Guide 67th Edition 2026 § 5.0.1.2(c)",
  "IATA DGR Company Manual 67th Edition 2026 § 5.0.1.2(c)",
]) {
  assert.ok(
    errors({
      tierAEvidence,
      frState: "FROZEN FR / SOURCE VERIFIED",
      frVerifier: "Qualified Reviewer — 2026-09-06",
    }).some((error) => error.includes("explicit IATA DGR 67th Edition 2026 evidence identification")),
    `${tierAEvidence} must not satisfy the current Tier-A source-identity gate`,
  );
}

assert.ok(
  errors({
    tierAEvidence: "DGR 66th Edition 2025 §1.1; internal reference 67th Edition 2026 §2.2",
    frState: "FROZEN FR / SOURCE VERIFIED",
    frVerifier: "Qualified Reviewer — 2026-09-06",
  }).some((error) => error.includes("explicit IATA DGR 67th Edition 2026 evidence identification")),
  "mixed old-DGR/current-local evidence must fail instead of combining whole-cell tokens",
);

assert.ok(
  errors({
    tierAEvidence: "DGR 67th Edition 2026; internal reference §2.2",
    frState: "FROZEN FR / SOURCE VERIFIED",
    frVerifier: "Qualified Reviewer — 2026-09-06",
  }).some((error) => error.includes("bound to the same current DGR source segment")),
  "a locator from another source segment must not satisfy direct current DGR evidence",
);

assert.deepEqual(
  errors({
    tierAEvidence: "DGR 67th Edition 2026 § 5.0.1.2(c)",
    frState: "FROZEN FR / SOURCE VERIFIED",
    frVerifier: "Qualified Reviewer — 2026-09-06",
  }),
  [],
  "canonical DGR shorthand + current edition + direct locator + named verifier/date should pass syntax only",
);

assert.deepEqual(
  errors({
    tierAEvidence: "DGR 67th Edition 2026 1.1",
    frState: "FROZEN FR / SOURCE VERIFIED",
    frVerifier: "Qualified Reviewer — 2026-09-06",
  }),
  [],
  "canonical DGR shorthand + legitimate bare dotted section locator must remain valid",
);

assert.deepEqual(
  errors({
    tierAEvidence: "DGR 67th Edition 2026 §1.1; internal cross-reference p.2",
    frState: "FROZEN FR / SOURCE VERIFIED",
    frVerifier: "Qualified Reviewer — 2026-09-06",
  }),
  [],
  "secondary source notes must remain allowed when current DGR identity and locator are already bound",
);

assert.deepEqual(
  errors({
    tierAEvidence: "SOURCE CONFLICT",
    frState: "SOURCE CONFLICT",
    frVerifier: "",
  }),
  [],
  "non-verified FR states may carry explicit conflict evidence state",
);

assert.deepEqual(
  errors({
    tierAEvidence: "SOURCE GAP",
    frState: "NOT YET VERIFIED",
    frVerifier: "",
  }),
  [],
  "NOT YET VERIFIED must not be misclassified as a verified FR state",
);

assert.ok(
  errors({
    tierAEvidence: "IATA DGR 67th Edition 2026 source requested",
    frState: "SOURCE GAP",
    frVerifier: "",
  }).length > 0,
  "vague provisional evidence without an explicit non-verified marker must fail",
);

console.log("DGR Tier-A matrix policy regression fixtures: PASS");
