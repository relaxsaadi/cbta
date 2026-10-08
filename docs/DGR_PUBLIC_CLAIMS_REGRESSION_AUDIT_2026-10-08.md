# DGR/CBTA marketing evidence gate — 2026-10-08

Scope: review of current GitHub `main` at the new FAQ update in commit `8005a2acf971d026a52ef0a770e5255a2fb337b3`.

## Open claims requiring correction

The FAQ structured data in `app/page.tsx` and the visible copy in `components/FAQ.tsx` now assert universal recognition by 300+ airlines and that the training/certificate is required by ANAC Algeria. Neither claim is evidenced by the IATA CBTA Provider registry. Both files also contain a pre-existing broader assertion of acceptance by every national civil aviation authority.

The `app/layout.tsx` metadata independently claims 'Seul centre' and recognition by 300+ airlines. Present-day provider directory listing does not prove historical priority or blanket certificate acceptance.

## Gate / safe action

- Remove unsupported universal recognition, ANAC acceptance or mandatory-course claims from FAQ and metadata.
- Distinguish IATA's current listing of provider/functions from accreditation by any national authority.
- Explain function assignment on task/competence grounds; never blanket-assign 7.1–7.10 from a job title.
- Keep all question-bank SOURCE GAP / CONFLICT and Tier-A evidence gates unchanged.
- Do not use this document as evidence of production readiness.

This report does not alter executable question-bank state or claim an ANAC/IATA review decision.
