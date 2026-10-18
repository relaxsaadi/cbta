# Function 7.4 — regulatory and bilingual readiness exception (2026-10-18)

**Scope:** Stage 2B.1, PR #3, Functions 7.1–7.10 program; this exception covers Function 7.4 only. **Status: PRE-PRODUCTION / NOT APPROVED.**

## Verified evidence / baseline

- Canonical Function 7.4 task set: `docs/DGR_OFFICIAL_TASK_SET_7.4.md`, **37 official leaf tasks** from Function 7.4's own TABLEAU 7.4.A (Blocks 0, 4, 6, 7); do not substitute Function 7.1's task breakdown.
- Function 7.4 source/competency matrix: `docs/DGR_SOURCE_COMPETENCY_MATRIX_7.4.md`; current 53 drafted question IDs are described in `docs/DGR_PRODUCTION_BANK_7.4.md` and the parallel draft EN package.
- At PR #3 head `03ee79c0daeccb7726c28466f0938651cafec3ad`, workflow run `39097670138` / job `117587408782` fails the full regulatory-readiness artifact gate for **10 Function 7.4 items recorded as FROZEN despite representative/cross-applied evidence**: Q-7.4-002, 004, 006, 014, 015, 026, 029, 031, 040, 046.
- That run also flags **14 bank/EN effective-FR-status reconciliation mismatches**, covering Q-7.4-002, 004, 006, 013, 014, 015, 016, 026, 027, 029, 031, 040, 043, 046. This list is a CI finding, *not* proof of true regulatory validity or the correct final per-item status.
- The initial EN-package overview still says all 53 entries remain Tier-B-only DRAFT, while some later per-item EN records state `TIER_A_PROVENANCE_UNRESOLVED — DIRECT_ITEM_EVIDENCE_REQUIRED`. Interpret this initial blanket statement as historical drafting context, **not** as an authoritative current sign-off or universal DRAFT classification.

## Required fail-closed work

1. Reconcile each affected item individually against **direct** IATA DGR **67th Edition 2026** evidence for the exact claim; preserve edition, section locator, evidence artifact identity, source language, item binding and explicit `SOURCE GAP` / `SOURCE CONFLICT` where appropriate. A prior cross-function or representative verification is not a direct item-level conclusion.
2. Align production-bank, FR source-status record, matrix, EN draft package and import/reconciliation CSV effective states. Never relabel to make CI green without authentic evidence.
3. Require a **named qualified FR reviewer and date** for successful FR regulatory verification, then separate qualified EN bilingual technical review, and only subsequently any `APPROVED` / import promotion under the controlled approval procedure.
4. Keep every questioned item out of production import, and separately inventory/withdraw any previously published candidate-visible questions if present in runtime. Repository-level import holds alone do not modify deployed Moodle/console state.

This note neither changes question text/answers nor supplies or paraphrases the licensed DGR. It does not declare ANAC/IATA approval or establish runtime/exam-platform technical readiness. Owner/qualified reviewer sign-off is still outstanding.
