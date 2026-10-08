# DGR 67th Edition 2026 — importable-item direct-reference triage (2026-10-08)

Scope: KOST DGR/CBTA Functions 7.1–7.10; branch `ai/dgr-stage2b-handoff`, commit `8919c7c75cb9d617a9a47fb38dad71303d1d0e74`.

## Evidence reviewed

- GitHub Actions `DGR direct Tier-A provenance`, workflow run `37718629693`, job `113120869286` (failed on 2026-10-08).
- `docs/DGR_V2_IMPORT_CANDIDATES_AFTER_RECONCILIATION.csv`, blob `f3ff5dbf447752ec4334e754ab37992b0fc7306b`.
- There are 453 candidate records across Functions 7.1–7.10; 137 currently marked `IMPORT_ELIGIBLE=YES`. Successful CSV structure/import-provenance checks are not a substitute for the direct Tier-A evidence gate.

## Specific unresolved importability conflicts

| Item | Current CSV import | Recorded source field | Direct-evidence gate finding | Required conservative action |
|---|---|---|---|---|
| Q-7.3-029 | YES | PKG-02 (Pakistan) excerpt appears truncated (ends mid-word) | Terminal regulatory state without a concrete per-item DGR_Reference; historical non-direct evidence wording detected | Mark `IMPORT_ELIGIBLE=NO` pending item-specific direct 67e/2026 Tier-A citation and qualified FR verification |
| Q-7.1-009 | YES | PI 965, Sections IA/IB, Tables 965-IA/965-IB | Terminal regulatory state without a concrete per-item DGR_Reference; historical non-direct evidence wording detected | Inspect the full bound evidence artifact to determine whether direct, current-edition verification is actually recorded; keep out of production unless proven |

A checker warning concerning historical/batch text **does not automatically establish** that the current item-level regulatory evidence is invalid; validate against the actual current, direct evidence artifact rather than using a blanket inference. Do not claim either item's substantive regulatory answer is wrong solely because a citation string or automated check failed.

## Pending implementation

- At a minimum, fail close the `Q-7.3-029` CSV import eligibility; retain the truncated source text for audit traceability until a direct reference is recovered.
- Independently verify `Q-7.1-009` against the licensed current-edition source and bound evidence before any approval.
- Align the FR terminal state, EN mirrored FR state, and matrix when per-item evidence actually changes; no automatic promotion to `APPROVED`.
- Re-run structure, import/provenance, FR/EN drift, Tier-A, reviewer-admission, and full-readiness gates after merging a correction.
- Keep PR #3 draft/pre-production until technical, deployment, regulatory, and named-qualified-reviewer gates actually pass.

No IATA text reproduced; no ANAC/IATA approval asserted.
