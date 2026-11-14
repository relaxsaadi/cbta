# DGR/CBTA 7.1–7.10 — Canonical Official Task-Set Gate

**Status:** binding pre-production structural-governance requirement. This document does **not** validate licensed IATA DGR regulatory text, does not grant ANAC/IATA approval, and does not mark any question `APPROVED`.

## Why this exists

A source/competency matrix cannot prove its own completeness merely by containing unique task IDs and linking every current bank question. The expected set of official CBTA tasks must be represented independently so CI can detect an omitted or invented matrix row.

For each Function **7.1 through 7.10**, maintain one machine-checkable canonical official task set derived from that function's **own current CBTA task table/source artifact**. Do not copy Function 7.1's structure, counts, weights, or task IDs into another function unless that function's own source independently contains the same task.

## Accepted storage

Either:

- `docs/DGR_OFFICIAL_TASK_SET_<function>.md`, or
- a delimited section in that function's recovered/Stage 1 source artifact:

```text
<!-- DGR_OFFICIAL_TASK_SET:<function>:START -->
...
<!-- DGR_OFFICIAL_TASK_SET:<function>:END -->
```

The canonical table must contain at least:

| Function | Official task ID | CBTA task-source reference |
|---|---|---|
| 7.x | task identifier | exact current task-table/source locator |

The task-source reference must identify where the task identity comes from. It is structural provenance, not a substitute for the separate **IATA DGR 67th Edition 2026 Tier A** evidence required for regulatory claims in the source/competency matrix.

## Acceptance criteria

For each Function 7.1–7.10:

1. every applicable official leaf task appears exactly once in the canonical task set;
2. the set is independently derived from that function's own current task table/source set;
3. the source/competency matrix contains exactly the same official task IDs — no missing task and no invented/extra task;
4. combined or dual-tagged local pools must not erase separately listed official tasks;
5. a source gap may leave a task with no production question, but the official task row must remain visible and truthfully state the gap in the matrix;
6. structural task-set equality does not imply regulatory correctness, FR source verification, EN bilingual review, qualified human approval, or ANAC/IATA approval.

The deterministic companion gate is `scripts/check-dgr-official-task-coverage.mjs`.

Until all ten independently derived task sets exist and match their matrices exactly, the regulatory program remains **pre-production / human regulatory review pending**.
