# Function 7.4 — regulatory and bilingual readiness exception (2026-10-18)

**Scope:** Stage 2B.1, PR #3, Functions 7.1–7.10 program; this exception covers Function 7.4 only. **Status: PRE-PRODUCTION / NOT APPROVED.**

## 2026-11-15 strict affirmative Tier-A evidence gate — additional item-level scope

At PR #3 head `6b12b59af3aed9116b4316d221b157d7287a3ed2`, the [exact-head regulatory-readiness CI job](https://github.com/relaxsaadi/cbta/actions/runs/43737689936/job/132883875661) also fails `scripts/check-dgr-affirmative-direct-tier-a-evidence.mjs` for **25 unique Function 7.4 question IDs** with representative/batch/cross-applied rather than affirmative item-specific evidence and/or no explicit item-level IATA DGR 67th Edition 2026 binding: Q-7.4-002, 004, 006, 010, 012, 014, 015, 021, 026, 029, 030, 031, 032, 034, 035, 037, 038, 039, 040, 044, 046, 048, 049, 052, 053. Of these, **eight** (010, 021, 034, 037, 038, 039, 048, 049) also lack an explicit per-item current-edition binding in this diagnostic.

This **25-item stricter diagnostic is broader than, and overlaps with, the 10 historically FROZEN provenance failures** described below; it must not be misreported as merely ten provenance problems. The separate **13-item FR/EN status-mirror diagnostic** is another overlapping control, not an additional set to sum. A CI diagnostic is not a licensed source review or proof that every unflagged item is valid. All 53 draft items remain non-importable pending genuine direct current-edition source evidence as applicable, a named qualified and dated FR review, a separate qualified EN review, and controlled final authorization. No answer text, key, reviewer record or approval status is changed by this note.

## 2026-11-14 exact-head CI reconciliation — Function 7.4

At PR #3 head `f691c5df2ad607c6c7244fea8511145b486985b3`, the [full regulatory-readiness workflow](https://github.com/relaxsaadi/cbta/actions/runs/43639057464) (job `132582320013`) reports **13** overlapping Function 7.4 bank/EN questions with stale or missing mirrored FR status, not the **14** recorded in the 2026-10-18 historical baseline below. Current CI IDs: Q-7.4-002, 004, 006, 013, 014, 015, 016, 026, 029, 031, 040, 043, 046. **Q-7.4-027** is no longer in *that particular FR/EN drift diagnostic*, but remains **`SOURCE GAP UNRESOLVED — DIRECT_ITEM_EVIDENCE_REQUIRED`**, and is not thereby FR-verified, approved, or importable. Retain the earlier 14-item result below solely as dated audit history; do not silently erase that evidence or infer that Q-7.4-027 is resolved.

The same current CI still reports **10** historically FROZEN Function 7.4 questions lacking sufficient direct per-item current-edition Tier-A provenance: Q-7.4-002, 004, 006, 014, 015, 026, 029, 031, 040, 046. Function 7.4 still has **37 independent official CBTA tasks**, **53 provisional bank/EN items**, and **zero import-eligible questions**. Program-wide CI still reports **453** provisional items / **287** task-matrix rows, **107** FROZEN-provenance exceptions and **139** FR/EN status mismatches. The [direct Tier-A workflow](https://github.com/relaxsaadi/cbta/actions/runs/43639057522) and full regulatory-readiness workflow both remain **FAIL / release-blocking**. All counts are repository CI diagnostics, not a regulatory or qualified-human review; no authorized licensed DGR 67th Edition 2026 item-level validation or separate EN sign-off is established here. No bank text, answer key, reviewer status, import flag or runtime setting was modified by this documentation correction.

## 2026-11-12 evidence-scope correction — Q-7.4-027

The historical `FR SOURCE GAP CONFIRMED` statement was cross-applied from Q-7.1-001, where the recorded 2026 source check covered §1.0, Appendice A and a targeted glossary search, **not** an exhaustive current-edition review of the entire DGR. This cannot substantiate a categorical DGR-wide absence. Current item state: `SOURCE GAP UNRESOLVED — DIRECT_ITEM_EVIDENCE_REQUIRED`; the KOST example remains Tier B and blocked from production import. The 2026-08-29 status persists solely as audit history. Direct authorized IATA DGR 67e 2026 item-specific FR verification, a named qualified FR reviewer/date and separate qualified EN bilingual review remain outstanding. No question/key, deployed exam, licensed text, `APPROVED` status or runtime import has been changed.

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
