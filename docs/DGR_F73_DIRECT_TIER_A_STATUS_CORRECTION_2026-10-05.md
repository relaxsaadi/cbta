# Function 7.3 direct Tier-A provenance correction — 2026-10-05

## Finding

The Function 7.3 production bank contains 19 terminal-looking regulatory states whose durable reconciliation evidence explicitly says that the item's own current-DGR citation/search was not independently performed.

Affected items:

- Q-7.3-001
- Q-7.3-005
- Q-7.3-006
- Q-7.3-008
- Q-7.3-011
- Q-7.3-013
- Q-7.3-015
- Q-7.3-016
- Q-7.3-017
- Q-7.3-018
- Q-7.3-022
- Q-7.3-026
- Q-7.3-027
- Q-7.3-028
- Q-7.3-040
- Q-7.3-041
- Q-7.3-042
- Q-7.3-043
- Q-7.3-044

The current direct-provenance workflow rejects these same items. The separate EN package already treats them as `TIER_A_PROVENANCE_UNRESOLVED — DIRECT_ITEM_EVIDENCE_REQUIRED` and keeps bilingual review pending.

## Required current state

Until direct item-specific evidence from the current IATA DGR 67th Edition 2026 is recorded, each affected item must be treated fail-closed as:

`TIER_A_PROVENANCE_UNRESOLVED — DIRECT_ITEM_EVIDENCE_REQUIRED`

This supersedes sampled, representative, cross-applied, import-eligible, FROZEN, or confirmed-SOURCE-GAP treatment for these items.

No affected item may be imported or promoted to APPROVED without:

1. direct current-edition evidence tied to the exact tested claim and regulatory distractors;
2. FR source verification;
3. separate EN bilingual technical review;
4. a named qualified reviewer and review date.

## Scope

This correction changes governance/readiness status only. It does not assert a new regulatory answer, alter question wording, or claim ANAC/IATA approval.

The canonical production bank and per-item reconciliation CSV still require status-field updates. Those updates must preserve historical text while making the current state above authoritative.
