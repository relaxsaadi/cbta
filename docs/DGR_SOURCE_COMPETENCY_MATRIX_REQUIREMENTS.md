# DGR/CBTA 7.1–7.10 — Source / Competency Matrix Readiness Gate

**Status:** binding pre-production governance requirement. This document does **not** validate any IATA DGR regulatory fact, does not grant ANAC/IATA approval, and does not mark any question `APPROVED`.

## Purpose

Every CBTA function 7.1 through 7.10 must have a durable source/competency matrix before the production question-bank program can be described as ready. Existing Stage 1 cross-validation, Stage 2A blueprint, production-bank, and EN-review artifacts remain authoritative inputs; the matrix is the auditable join between the function's own current CBTA task structure, its source evidence, and the questions produced from that evidence.

A matrix may be maintained as a dedicated per-function file or as a clearly delimited machine-checkable section in an existing function artifact. It must not be satisfied by prose that only states that mapping was performed.

## Function-specific derivation rule

Each function must be derived independently from its own current CBTA task table and source set.

- Do **not** copy Function 7.1 questions, weights, pool sizes, or its 44-subtask structure into another function.
- Do **not** copy the task count or blueprint distribution from one later function into another.
- Where an official CBTA task is separately listed, preserve that official task identity in the matrix even when local training material is thin, overlapping, or absent. If evidence cannot support an independent production claim/question, record the limitation as `SOURCE GAP`, `SOURCE CONFLICT`, or another truthful non-approved state rather than inventing coverage.
- Combined/dual-tagged local pools, if used for operational drafting, must not erase the underlying official task rows. The matrix must show which official tasks the item is intended to assess and why the available source supports that relationship.

## Minimum matrix fields

Each official leaf task applicable to the function must have a row containing, at minimum:

| Field | Required meaning |
|---|---|
| Function | `7.1` … `7.10` |
| Official task ID | Current CBTA task/leaf identifier for that function |
| Competency/task description | Concise task description; no invented regulatory rule |
| CBTA task-source reference | Source of the task structure (edition/document/locator) |
| Local source evidence | KOST training/exam/checklist/source artifact and precise locator where available |
| Current IATA DGR Tier A evidence | **67th Edition 2026** direct locator for each regulatory claim, or explicit `SOURCE GAP`/`SOURCE CONFLICT`/`NOT YET VERIFIED`; never infer from an older edition |
| FR source-verification state | Current FR governance state, kept distinct from bilingual review |
| FR verifier + date | Named verifier and ISO date when a verification claim is made; otherwise pending |
| Production question IDs | Every bank item mapped to this task, if any |
| EN bilingual-review state | Separate EN review state; FR verification does not satisfy it |
| EN reviewer + date | Named reviewer and ISO date when EN review is complete; otherwise pending |
| Notes / limitations | Thin evidence, overlap, stale locator, conflicting source, local-only procedure, etc. |

## Tier A and source-state rules

1. Any regulatory fact that contributes to a production question must be traceable to direct current **IATA DGR 67th Edition 2026 Tier A** evidence before it can be treated as source verified.
2. Older DGR editions, KOST slides, prior exams, checklists, practice books, recovered notes, or summaries may support drafting/context, but they do not replace the current Tier A gate for regulatory claims.
3. If current Tier A evidence is unavailable, inaccessible, contradictory, or does not support the proposed claim, record the truthful state (`SOURCE GAP`, `SOURCE CONFLICT`, `STALE CITATION`, `PARTIALLY CONFIRMED`, `DRAFT`, etc.). Do not silently promote the item.
4. Representative/sample verification is not item-specific verification. A production item cannot remain `FROZEN FR / SOURCE VERIFIED` solely because another item using a similar citation pattern was checked.
5. No matrix row or linked question may be `APPROVED` without a **named qualified reviewer and an ISO review date**. A role name, `pending`, `TBD`, or an automated agent is not a substitute for the qualified human reviewer required by the governance gate.

## FR and EN separation

FR source verification and EN bilingual review are independent gates.

- FR verifies source fidelity and the controlled French item state.
- EN review verifies the English rendering against the controlled source/item, including meaning, terminology, answer-key equivalence, and absence of semantic drift.
- Synchronizing the FR status into an EN package is bookkeeping only; it does not mean EN review is complete.

## Readiness acceptance criteria

The program-wide matrix gate passes only when all of the following are true for **each** Function 7.1–7.10:

1. every applicable official leaf task appears exactly once as a canonical matrix row (with explicit cross-references where a local pool spans multiple official tasks);
2. every production-bank question ID maps back to at least one official task row;
3. every regulatory claim used by a source-verified item has direct current 67th Edition 2026 Tier A evidence or the item is truthfully downgraded;
4. all unresolved source gaps/conflicts are explicit and cannot be mistaken for verified coverage;
5. FR verification provenance is durable and item/task-specific;
6. EN bilingual review is separately represented and cannot be inferred from FR status;
7. `APPROVED` cannot exist without a named qualified reviewer and date;
8. matrix coverage and question-ID linkage are checked deterministically in CI/readiness tooling, while regulatory correctness remains a human/source-evidence decision.

Until this gate is satisfied together with the technical platform gates, the repository must remain **pre-production / human regulatory review pending** and must not be described as `platform ready to use`.