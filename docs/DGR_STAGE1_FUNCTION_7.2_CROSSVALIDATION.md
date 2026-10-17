# DGR Stage 1 — Function 7.2 — Cross-validation index

**Status:** governance pointer to the existing Function 7.2 second-pass cross-validation. This file does **not** create a new regulatory verification, does not mark any question `APPROVED`, and does not imply ANAC/IATA acceptance.

## Canonical evidence location

Function 7.2 is the one Stage 1 package in the current 7.2–7.10 sequence whose independent second-pass cross-validation was recorded **inside the draft artifact itself**, rather than in a separate companion file.

Canonical artifact:

- `docs/DGR_STAGE1_FUNCTION_7.2_DRAFT.md`
- document status/title: `CROSS-VALIDATED 2026-08-25 (second pass — CONFIRMED, no corrections)`
- canonical section: `## Second-pass cross-validation (2026-08-25)`

The draft states that a second Claude Code session independently re-read the same source PDFs and reproduced the Stage 1 findings. That record remains the source of truth; this companion file exists only so deterministic readiness tooling can require the same per-function artifact shape without duplicating or silently rewriting the evidence.

## What that cross-validation does and does not establish

The existing Function 7.2 cross-validation supports the Stage 1 task/source reconstruction recorded in the draft, including the Function 7.2-specific structure derived from its own source material. It must **not** be treated as current Tier A regulatory verification.

In particular, the canonical draft explicitly states that:

- Stage 1 regulatory paragraph references are as cited by KOST course material and were not independently revalidated against the current IATA DGR 67th Edition 2026 Tier A text in that pass;
- the available 66th Edition addendum is not the repository's 67th Edition 2026 baseline and was not used to validate current regulatory claims;
- qualified human instructor review remains pending;
- cross-validation does not itself constitute Stage 2A, production approval, or ANAC/IATA approval.

## Readiness consequence

For Function 7.2, the deterministic Stage 1 cross-validation presence gate may use this file as the stable companion/index artifact, but regulatory readiness still requires all program-wide gates, including:

1. Function 7.2's own source/competency matrix derived from its current CBTA task table;
2. direct current IATA DGR 67th Edition 2026 Tier A evidence for regulatory claims, or explicit `SOURCE GAP` / `SOURCE CONFLICT` / other truthful non-approved states;
3. item-specific FR source verification;
4. separate EN bilingual review;
5. no `APPROVED` state without a named qualified reviewer and ISO review date;
6. complete production-bank ↔ EN-package ↔ official-task traceability.

Until those gates and the platform's technical readiness gates pass, Function 7.2 and the wider 7.1–7.10 program remain **pre-production / human regulatory review pending**.
