# Function 7.6 — regulatory and bilingual readiness exception (2026-10-19)

**Scope:** Stage 2B.1, PR #3, KOST DGR/CBTA Functions 7.1–7.10. This exception documents Function **7.6** only; **PRE-PRODUCTION / NOT APPROVED**. It records CI findings; it does not independently re-verify the licensed IATA DGR.

## 2026-11-16 strict direct Tier-A evidence diagnostic reconciliation — 31 distinct items (13 FROZEN subset)

At PR #3 exact head `c82bf8f6fcbe8329f4e138e1dc55a47aabaae258`, the completed [DGR direct Tier-A provenance run 43805320529, job 133094643840](https://github.com/relaxsaadi/cbta/actions/runs/43805320529/job/133094643840) executes both the narrow source-verified provenance check and the stricter affirmative direct-current-edition evidence check. The **narrow** check continues to identify **13** historically `FROZEN FR / SOURCE VERIFIED` items with insufficient individual evidence (listed below). The **stricter** check flags **31 distinct Function 7.6 terminal-state question IDs** whose evidence wording remains representative/batch/cross-applied or otherwise non-direct. Those 31 IDs are:

`Q-7.6-002`, `003`, `004`, `005`, `006`, `007`, `008`, `010`, `011`, `012`, `015`, `016`, `017`, `020`, `022`, `023`, `024`, `025`, `027`, `029`, `030`, `031`, `032`, `036`, `040`, `042`, `043`, `046`, `052`, `055`, `056` (short suffixes retain the `Q-7.6-` prefix).

The **18 additional items beyond the narrow 13-item subset** are `Q-7.6-002`, `003`, `004`, `006`, `008`, `010`, `022`, `024`, `027`, `029`, `030`, `031`, `032`, `036`, `042`, `052`, `055`, `056`. Within the 31, **10** items also lack explicit per-item `IATA DGR 67th Edition 2026` binding: `Q-7.6-006`, `008`, `010`, `027`, `029`, `032`, `036`, `052`, `055`, `056`. These are overlapping diagnostics, not additive defect counts, and **do not by themselves establish that a question's answer is incorrect**.

The separate [exact-head regulatory readiness run 43805320503](https://github.com/relaxsaadi/cbta/actions/runs/43805320503), Full DGR readiness job `133094770792`, still reports **13 narrow FROZEN provenance blockers and 18 bank↔EN FR-status mirror discrepancies**. The historical 19-mismatch count below is not current. Retain `Q-7.6-001` as `SOURCE CONFLICT`, `Q-7.6-018` as `SOURCE GAP UNRESOLVED`, and unmapped official tasks `0.3.2` and `4.3.3` as source gaps; the strict 31-item list does **not** supersede these independent holds.

Remediation requires per-question claim/answer/distractor-level direct, licensed IATA DGR 67th Edition 2026 plus applicable addendum evidence, effective FR state reconciliation, independent qualified dated EN review, and named qualified dated approval before any import/production promotion. **All 56 items remain non-importable, with 0 APPROVED**. No new direct licensed DGR check, reviewer verification, answer correction, ANAC/IATA approval or platform acceptance occurred in this report. This correction changes documentation only, and does not resolve Moodle/console, RBAC, audit, security, deployment or backup/recovery gates.


## 2026-11-14 exact-head FR/EN mirror count reconciliation (18, not historical 19)

At PR #3 HEAD `ccf226ab0fcb27f62ac567e8512de3672737d2fe`, the completed [DGR regulatory readiness run 43627222015](https://github.com/relaxsaadi/cbta/actions/runs/43627222015), **Full DGR readiness** job `132545790953` (2026-11-14), reports **18** overlapping Function 7.6 bank/EN entries with stale, missing, or unclassifiable mirrored **FR status**, rather than the **19** from the historical 2026-10-19 snapshot preserved below. The current set is:

`Q-7.6-005`, `007`, `009`, `011`, `012`, `013`, `015`, `016`, `017`, `020`, `023`, `025`, `038`, `040`, `043`, `044`, `045`, `046` (short suffixes in this list retain the `Q-7.6-` prefix).

**`Q-7.6-018` is no longer in this particular FR-status-mirror mismatch set**, following the effective-state correction of 2026-11-12. It nonetheless **remains `SOURCE GAP UNRESOLVED — DIRECT_ITEM_EVIDENCE_REQUIRED`**, not independently verified against the licensed current 2026 DGR. Do not infer that its teaching-level Tier-B danger/risk example has become DGR-verified or eligible for approval/import. The same exact-head full-readiness CI still flags **13** Function 7.6 historically `FROZEN FR / SOURCE VERIFIED` items with insufficiently individualized Tier-A support; these sets overlap and must not be added as independent defects. The separate affirmative direct-evidence gate also fails.

This is a **documentation-only correction of the current CI classification count**. Function 7.6's own 28-leaf official task set, provisional 89-question source ceiling, 56 draft items and independent FR matrix/EN package remain unchanged; **all 56 items remain non-importable**. Direct item-specific IATA DGR 67th Edition 2026 evidence (including answers/distractors), a named qualified FR reviewer and date, separate qualified dated EN technical review, and final controlled approval are still required. Historical findings below remain intact for audit; no question, answer, source artifact, reviewer admission, security setting, merge or deployment is changed by this note.

## 2026-11-12 superseding Q-7.6-018 provenance correction

Historical `FR SOURCE GAP CONFIRMED (cross-applied)` used Q-7.1-001's limited glossary/§1.0/targeted-term review to infer DGR-wide silence. That conclusion is not established. **Effective state: `SOURCE GAP UNRESOLVED — DIRECT_ITEM_EVIDENCE_REQUIRED`**, aligned in F7.6 bank, independent matrix, reconciliation and blocked import CSVs, and unapproved EN review package. The KOST Function 7.6 course worked example stays Tier B. No new licensed 2026 direct evidence, proved DGR absence, qualified dated FR/EN review, answer change, approval, import, merge or deployment is claimed. Historical CI counts below are preserved as earlier exact-head findings, not new verification.

## Exact-head evidence and independent task set

- Exam-planning task authority: `docs/DGR_OFFICIAL_TASK_SET_7.6.md`, cross-validated from **IATA CBTA Training Guidance Ed.1 (2023), TABLEAU 7.6.A**, contains **28 distinct leaf tasks**: 18 in Block 0, 5 in Block 4 (4.1/4.3 only), 1 in Block 6 (6.1.6 only), and 4 in Block 7. This CBTA task-identity source is **not** direct Tier-A evidence for DGR 67th Edition 2026 regulatory claims. Do not copy Function 7.1's structure or infer universal task coverage from question counts.
- Program artifacts: `docs/DGR_STAGE2A_FUNCTION_7.6_BLUEPRINT.md` (provisional source-yield ceiling), `docs/DGR_SOURCE_COMPETENCY_MATRIX_7.6.md` (task-to-source-to-question trace), `docs/DGR_PRODUCTION_BANK_7.6.md` (**56 drafted items, Q-7.6-001–056**), and `docs/DGR_EN_REVIEW_PACKAGE_7.6.md` (unapproved FR→EN draft). The matrix identifies independent local **SOURCE GAP** tasks **0.3.2** and **4.3.3**, with no production question assigned.
- GitHub Actions at PR #3 head `88cc772b3181db0d8f7fb1e2413d4b19cef329c6`: **DGR regulatory readiness** run [39169473318](https://github.com/relaxsaadi/cbta/actions/runs/39169473318), **Full DGR readiness** job `117799420130`, reported the exact function-specific findings below. **DGR direct Tier-A provenance** run [39169473267](https://github.com/relaxsaadi/cbta/actions/runs/39169473267) likewise failed. These are actual gate failures, not a qualified human regulatory adjudication.

## CI findings: direct item evidence

The full-readiness job flags **13 Function 7.6 items** as `FROZEN FR / SOURCE VERIFIED` while still relying on representative or otherwise non-item-specific evidence:

`Q-7.6-005`, `007`, `011`, `012`, `015`, `016`, `017`, `020`, `023`, `025`, `040`, `043`, `046`.

The direct provenance gate additionally questions the current-edition evidence required for `Q-7.6-018`'s `FR SOURCE GAP CONFIRMED` conclusion. A teaching-level danger/risk distinction may be marked pedagogical/Tier B, but a *confirmed absence in the current DGR* must not be treated as proven merely by citing a representative search. Preserve unresolved proof state until the exact source search and qualified verification can be documented. This is **not** a new determination that the DGR contains or excludes that claim.

## CI findings: bank versus EN mirrored FR status

The full-readiness job separately reports **19 overlapping items with stale or unclassifiable EN-package FR-status mirrors**:

`Q-7.6-005`, `007`, `009`, `011`, `012`, `013`, `015`, `016`, `017`, `018`, `020`, `023`, `025`, `038`, `040`, `043`, `044`, `045`, `046`.

These **19 are not additional independently proven regulatory errors**; both CI lists overlap. Do not blindly stamp the bank's possibly over-promoted `FROZEN` label into EN to silence the checker. Reconcile authoritative **effective** FR evidence status first, then mirror it in the EN review package while leaving `BILINGUAL TECHNICAL REVIEW REQUIRED` and all reviewer/approval fields pending until a genuine review.

## Fail-closed remediation and platform consequence

1. For each flagged item, bind its exact regulatory assertion, answer and distractors to **direct current IATA DGR 67th Edition 2026 Tier-A evidence** (edition, page/section/table, source language, authenticated artifact identity and per-item reviewer trace). Mark `TIER_A_PROVENANCE_UNRESOLVED`, `SOURCE GAP` or `SOURCE CONFLICT` where justified rather than claiming verification from a cross-application or sample. No DRM bypass or licensed-text reproduction.
2. Reconcile production-bank effective FR states, the source/competency matrix, per-item reconciliation/import CSV and EN review-package FR mirror without making unsupported approvals. Require a **named qualified FR verifier and date**, **separate qualified EN bilingual reviewer and date**, and the controlled approval chain before any `APPROVED`/import promotion.
3. Keep unresolved items out of new production imports. Separately inspect **live Moodle/console candidate-visible banks** for already-imported material and remove/restrict invalid items through auditable runtime procedures if found; a repository CSV import hold cannot undo a past deployment.
4. These findings do not verify candidate workflow, RBAC, audit/historical attempt integrity, Moodle/console integration, security, backups, deployment or recovery. Track those independent technical gates in `docs/PLATFORM_READY_CHECKLIST.md` and do not infer any technical success or failure from the separate `kost-funnel` commercial Vercel status.

**Conclusion:** Function 7.6 remains **NOT APPROVED / regulatory human review pending**, and KOST exam-platform **NOT READY**. No question text, answer, scoring logic, source claim, runtime database, reviewer approval or IATA/ANAC accreditation is changed by this exception note.
