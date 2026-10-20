# DGR Tier-A direct-evidence correction — 2026-09-22

This correction is a readiness/provenance safeguard for the DGR 67th Edition 2026 question-bank program. It does **not** assert that any affected question is factually wrong, does not promote or approve any item, does not alter EN bilingual-review status, and does not imply ANAC/IATA approval.

## Finding

The per-item reconciliation contains a repeated promotion pattern across multiple Functions 7.2–7.10 in which an item is labelled `FROZEN FR / SOURCE VERIFIED` and `Import-eligible for V2 (pending reviewer sign-off)`, while that same item's rationale explicitly states that its **own specific current-DGR citation was not independently re-read** during the pass and that only a representative sample of a broader citation pattern was spot-verified.

That evidence model is insufficient for the production bar now required by this program: **direct, current IATA DGR 67th Edition 2026 Tier-A evidence for each regulatory claim**. A representative/sample verification can support triage or batching, but it cannot by itself establish item-specific Tier-A closure.

Concrete examples are present in the reconciliation for items such as `Q-7.2-044`, `Q-7.3-026`, `Q-7.4-002`, `Q-7.5-002`, `Q-7.6-005`, `Q-7.7-003`, `Q-7.8-047`, `Q-7.9-004`, and `Q-7.10-005`. These examples are evidence of the pattern, not an exhaustive affected-item list.

A second symptom of the same provenance weakness is that some sampled rows carry generic locator bundles (for example a recurring group of Part 1 / Part 3 sections) that are not obviously item-specific to the tested claim. Those locator bundles must not substitute for a direct per-item current-DGR citation.

### Confirmed SOURCE GAP claims are subject to the same evidence bar

A fresh re-audit found the same sampled-only provenance wording on rows already labelled `FR SOURCE GAP CONFIRMED`, including examples such as `Q-7.2-031`, `Q-7.2-045`, `Q-7.3-017`, and `Q-7.4-027`. Those rows state that the item's own specific citation was not independently re-read during the pass while also presenting a confirmed current-DGR absence/silence conclusion.

The re-audit also found an equivalent wording variant that the first detector version did not catch: `Q-7.2-002` says the Function 7.1 research is **"not re-searched from scratch, cross-applied"** while the row is still labelled `FR SOURCE GAP CONFIRMED`. Under this program's item-specific production bar, that is the same unresolved provenance condition: prior research may remain a valid lead, but the 7.2 item cannot carry a terminal confirmed-gap state until its own current-DGR search is durably recorded.

A confirmed source gap is itself a current-regulatory evidence conclusion: it says the tested claim is absent from, unsupported by, or outside the current DGR text after an adequate search. That conclusion cannot be treated as directly established for an individual item when the row itself admits that the item-specific current-DGR check was not performed. Cross-applied or representative evidence can remain a research lead, but the durable item state must remain unresolved until the item-specific current-text search is recorded.

## Correct readiness interpretation

For readiness/import purposes, any item whose only Tier-A closure rationale relies on representative/sample verification **and explicitly says its own specific citation was not independently read/re-read or its own search was not independently performed** must be treated as:

`TIER_A_PROVENANCE_UNRESOLVED / DIRECT_ITEM_EVIDENCE_REQUIRED`

until all of the following are satisfied for that item:

1. the exact tested regulatory claim is identified;
2. the current DGR 67th Edition 2026 source is read directly for that claim;
3. the exact current source locator is recorded item-by-item;
4. the correct answer and material distractors are checked against that current source where they make regulatory claims;
5. `SOURCE_GAP` or `SOURCE_CONFLICT` is recorded instead of `FROZEN` when the current source does not support the tested claim as written; and
6. the per-item artifact is updated so the direct evidence, result, verifier/date, and next action are durable and auditable.

For a row currently claiming `FR SOURCE GAP CONFIRMED` while also admitting no item-specific read/re-read/search, the truthful interim interpretation is:

`SOURCE_GAP_UNRESOLVED / DIRECT_ITEM_EVIDENCE_REQUIRED`

The row may return to `FR SOURCE GAP CONFIRMED` only after a direct item-specific current-DGR search is durably recorded and supports that conclusion. This is a provenance correction, not a finding that the gap conclusion is necessarily wrong.

This correction applies only where direct item-specific evidence is missing. Items that already contain an explicit item-specific live-Bookshelf/current-DGR verification remain governed by their own durable evidence and are **not** demoted by this addendum.

## Import and approval gate

Until direct item-specific Tier-A provenance is closed:

- sampled-only rows must **not** be treated as production-import-eligible on the strength of the representative sample alone;
- sampled-only or cross-applied `FR SOURCE GAP CONFIRMED` rows must not be counted as a directly established current-DGR gap until the item-specific search is recorded;
- they must not be counted as direct Tier-A-complete in a readiness dashboard;
- they must not be upgraded to `APPROVED`;
- EN bilingual review remains a separate gate and must still be completed by a named qualified reviewer with a review date and durable evidence;
- final approval remains prohibited without the named qualified reviewer + date required by the program governance.

## Function-by-function follow-up

The currently observed sampled-only pattern is present across Functions 7.2 through 7.10, and it must be reconciled independently for each of those functions from that function's own CBTA task table, source set, source/competency matrix, blueprint, and production bank. Do **not** infer that the same question count, subtask structure, or evidence map applies across functions, and do not copy Function 7.1 question structures into other functions.

The enforcement rule itself applies to the **entire Functions 7.1–7.10 program**. Function 7.1 is not exempt from the direct-evidence requirement; however, no 7.1 item is demoted merely because the observed sampled-only examples above are from 7.2–7.10. A 7.1 item remains governed by its own durable per-item/source-register evidence and must be held if that evidence explicitly admits that the item's own current-DGR citation was not independently read or that its own required current-DGR search was not independently performed.

The required pass is deterministic:

1. identify every reconciliation row whose own rationale admits sample-only, cross-applied-only, or otherwise explicitly missing direct item verification;
2. place that row on direct-evidence hold when it claims `FROZEN`, import eligibility, or a confirmed current-DGR gap;
3. perform and record the item-specific current-DGR check;
4. resolve to `FROZEN FR / SOURCE VERIFIED`, `PARTIALLY CONFIRMED`, `SOURCE_GAP`, or `SOURCE_CONFLICT` based only on the item-specific evidence;
5. regenerate downstream FR status mirrors and import eligibility from the reconciled per-item state; and
6. keep EN review and qualified-reviewer approval separate.

## CI hardening — 2026-09-22

`scripts/check-dgr-direct-item-tier-a-provenance.mjs` fails on the decisive evidence defect itself — an explicit statement that the item's own specific current-DGR citation was **not independently read/re-read** or that the item was **not independently searched/re-searched** — rather than requiring that statement to appear together with one particular "representative sample" phrase. This prevents a wording change in the rationale from bypassing the gate while the same evidence deficiency remains.

The gate now applies that same rule to sampled-only/cross-applied rows claiming `FR SOURCE GAP CONFIRMED`, because a confirmed absence/silence finding is also a direct current-DGR evidence conclusion. The regression fixtures cover a sampled-only FROZEN/import-eligible row, a sampled-only confirmed-gap row, and a cross-applied confirmed-gap row using the `not re-searched from scratch` wording observed on `Q-7.2-002`. A genuine item-specific direct Bookshelf/current-DGR verification — including a directly established source gap — remains accepted by the detector.

This is intentionally a negative safety gate only. It does not infer `APPROVED`, reviewer completion, a source gap, or regulatory correctness from the absence of a violation phrase. Truthful `DRAFT`/`PARTIAL`/otherwise unresolved rows may retain reconciliation leads without being promoted merely to make the gate pass.

## Readiness impact

This is a **regulatory production-readiness blocker**, not a technical runtime blocker. It strengthens the existing Full DGR readiness gate and does not change the separate platform blocker tracked under #58 / PR #284.

Accordingly, the platform/question-bank program must remain **PRE-PRODUCTION** until both the critical technical gates and the regulatory direct-evidence/human-review gates are closed.
