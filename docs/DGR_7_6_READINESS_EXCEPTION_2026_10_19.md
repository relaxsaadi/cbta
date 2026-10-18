# Function 7.6 — regulatory and bilingual readiness exception (2026-10-19)

**Scope:** Stage 2B.1, PR #3, KOST DGR/CBTA Functions 7.1–7.10. This exception documents Function **7.6** only; **PRE-PRODUCTION / NOT APPROVED**. It records CI findings; it does not independently re-verify the licensed IATA DGR.

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
