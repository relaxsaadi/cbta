# DGR 2026 — power-bank cross-function evidence hold (7.5 / 7.9 / 7.10)

**Audit date:** 2026-10-23  
**Scope:** Function 7.5, 7.9 and 7.10 question wording/rationales; all ten functions remain subject to independent current-edition review.  
**Disposition:** **SOURCE CONFLICT / HOLD FOR DIRECT TIER-A RECONCILIATION**. This is a non-approval, non-import, documentation-only hold. It does not change runtime Moodle/E-EXAM content or rewrite historical per-item evidence.

## Fresh primary-publication evidence

- ICAO Doc 9284 (2025–2026), Addendum No. 1, **27 March 2026** (official current addenda index): https://www.icao.int/publications/doc-series/doc-9284
- IATA, *Changes Regarding Power Banks — Guidance Document for Operators*, **31 March 2026**, pp. 1, 4 and Appendix B p. 10: https://www.iata.org/contentassets/90f8038b0eea42069554b2f4530f49ea/guidance-to-operators---power-banks.pdf
- Irish Aviation Authority, passenger DG information: https://www.iaa.ie/safety/dangerous-goods/dangerous-goods--passenger-information

The 31 March IATA guidance expressly separates personal-use **power banks** from **spare batteries**. Its Appendix B distinguishes a maximum of **two power banks** per person from the up-to-**20 spare batteries** provision (with an operator approval route for larger spare-battery counts), and the **15 portable electronic devices** provision. The guidance is to be read **alongside**, not in place of, the 67th Edition DGR for 2026. The IAA warns that the independently published IATA Table 2.3.A can remain less restrictive until the 2027 update.

**Additional reconciliation point:** The IATA guidance narrative (p. 4) discusses the ICAO addendum's operator-approval language for 100–160 Wh power banks, but its Appendix B (p. 10) marks that power-bank configuration forbidden. Do not silently resolve this by selecting whichever passage is convenient. Obtain a qualified current-edition and competent-authority/operator interpretation, including applicable State/operator variations.

These public primary documents establish an **interim contradiction with older generic battery wording**, not individual direct authenticated **IATA DGR 67th Edition 2026 Tier-A sign-off** for the items below.

## Affected questions — preserve provenance; block promotion

| Item | Function / task | Observed source/answer risk | Audit disposition |
| --- | --- | --- | --- |
| `Q-7.5-011` | 7.5 / 5.1.2 | The correct option and explanation describe an operator approval route above 20 “batteries” without excluding personal-use power banks. Historical FR FROZEN text refers to power banks within the 20-spare-battery pool. | **SOURCE CONFLICT / REVERIFY** |
| `Q-7.9-032` | 7.9 / 5.2.1 | The same generic 20-spare-battery threshold and rationale can be misread as applying to power banks. | **SOURCE CONFLICT / REVERIFY** |
| `Q-7.10-012` | 7.10 / 5.1.2 | Same generic “more than 20 batteries” operator-approval claim. | **SOURCE CONFLICT / REVERIFY** |
| `Q-7.10-038` | 7.10 / 0.2.1 | The first distractor invokes the older 15/20 approval note as a valid alternative rule. The correct answer about exceptions is **not** thereby found incorrect; the distractor rationale needs current-edition review. | **SOURCE GAP / REVERIFY DISTRACTOR** |

At the audited `ai/dgr-stage2b-handoff` head `d7048ac3e458c941cb9c954882b898b30e157d02`, the historical item files for the first three still say `FROZEN FR / SOURCE VERIFIED`, while the reconciled import-candidate CSV states `IMPORT_ELIGIBLE=NO` for **all four**. Historical FROZEN claims are **not** current cross-source approval or import permission. The separate `Q-7.10-038` item remains `DRAFT — Tier B only`. Do not extrapolate from CSV import eligibility to questions already deployed into a running database.

## Required close-out (each question independently)

1. Retrieve and inspect the relevant **direct current IATA DGR 67th Edition (2026) Tier-A** wording and applicable amendments, matched to the exact stem, correct answer and **every distractor**; note exact edition, section, locator, date and evidence record without copying licensed material wholesale.
2. Compare the 27 March ICAO addendum, 31 March IATA operational guidance, and any applicable State/operator variations; explicitly resolve or retain any source conflict.
3. Reconcile `docs/DGR_PRODUCTION_BANK_7.5.md`, `7.9.md`, `7.10.md`, their function-specific matrices/blueprints, the 453-row per-item reconciliation, import-candidate status and any already-imported runtime copies. Where evidence is inadequate, keep **SOURCE GAP/CONFLICT**, do not promote to FROZEN/APPROVED, and hold affected imports.
4. Perform **FR source verification**, then a **separate EN bilingual technical review**. Record the **named qualified human reviewer and actual date** before `APPROVED`. No inferred ANAC/IATA endorsement.
5. Run the regulatory provenance/readiness checks and platform integrity gates on the exact candidate head, and independently confirm Moodle/E-EXAM historical-question handling and any required controlled withdrawal.

**Non-goals:** No change to scored historical attempts, grading rules, live question availability, DRMs, access controls, credentials, or production deployment. This note is a defensible evidence hold, **not** a ready-to-use verdict.
