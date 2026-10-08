# DGR direct provenance gate — 2026-10-08

Scope: CBTA Functions 7.1–7.10. Source: PR #3 head `8919c7c75cb9d617a9a47fb38dad71303d1d0e74`.

The 107-item V2 import-eligibility fail-closed correction is now reflected in a PASS for the import-candidate provenance consistency gate. This is an import-control result, **not** regulatory item validation.

Two issues remain in `scripts/check-dgr-readiness-artifacts-core.mjs`:

1. Canonical `TIER_A_PROVENANCE_UNRESOLVED — DIRECT_ITEM_EVIDENCE_REQUIRED` is not recognized by `frStatusClass()` as `UNRESOLVED`.
2. Representative/sampled Tier-A evidence is rejected for FROZEN status but not for terminal `FR SOURCE GAP CONFIRMED` states, even if the item was not directly re-searched.

The thirteen affected SOURCE GAP items are Q-7.2-002/031/045, Q-7.3-017, Q-7.4-027, Q-7.5-018, Q-7.6-018, Q-7.7-019, Q-7.8-018/036, Q-7.9-022/023 and Q-7.10-019. They must remain non-importable/non-terminal absent direct IATA DGR 67th Edition 2026 item-level research and qualified reviews.

Regulatory readiness, direct Tier-A provenance, production-bank precedence and deployment remain blocked. No claim of ANAC approval or exam-production readiness is warranted.

Evidence: https://github.com/relaxsaadi/cbta/actions/runs/37718629683 and https://github.com/relaxsaadi/cbta/actions/runs/37718629693.
