# Function 7.4 / 7.7 Tier-A import fail-closed audit — 2026-10-07

## Scope

This note records a cross-artifact readiness defect found on `ai/dgr-stage2b-handoff`. It does not change any question text, answer, regulatory claim, reviewer state, Moodle/runtime data, security control, or ANAC/IATA approval status.

Each function remains derived from its own official CBTA task set and source/competency matrix.

## Function 7.4

The Function 7.4 EN review package marks the following items as:

`TIER_A_PROVENANCE_UNRESOLVED — DIRECT_ITEM_EVIDENCE_REQUIRED`

while `DGR_V2_IMPORT_CANDIDATES_AFTER_RECONCILIATION.csv` still records `IMPORT_ELIGIBLE=YES`:

- Q-7.4-002
- Q-7.4-004
- Q-7.4-006
- Q-7.4-014
- Q-7.4-015
- Q-7.4-026
- Q-7.4-029
- Q-7.4-031
- Q-7.4-040
- Q-7.4-046

Function 7.4's official task set contains 37 leaf tasks. Its matrix also separately preserves explicit SOURCE GAP / SOURCE CONFLICT states; those must not be collapsed into this import mismatch.

## Function 7.7

The Function 7.7 EN review package marks the following items as:

`TIER_A_PROVENANCE_UNRESOLVED — DIRECT_ITEM_EVIDENCE_REQUIRED`

while the V2 import-candidate CSV still records `IMPORT_ELIGIBLE=YES`:

- Q-7.7-003
- Q-7.7-005
- Q-7.7-013
- Q-7.7-014
- Q-7.7-016
- Q-7.7-017
- Q-7.7-018
- Q-7.7-022
- Q-7.7-024
- Q-7.7-026
- Q-7.7-041
- Q-7.7-044
- Q-7.7-045
- Q-7.7-048

Function 7.7's official task set contains 27 leaf tasks. Its matrix separately records SOURCE GAP states, including task 0.1.4, 0.3.2, 6.2.1 and 6.2.4.

## Required state

Until direct current IATA DGR 67th Edition 2026 Tier-A evidence is tied to the exact tested claim for each item, these 24 items must be treated fail-closed and not imported.

Re-enabling import requires, item by item:

1. direct current-edition Tier-A evidence;
2. FR source verification;
3. separate EN bilingual technical review;
4. a named qualified reviewer and review date.

No item should become `APPROVED` merely because an historical locator, representative sample, or cross-applied evidence exists.

## Write limitation

An attempted direct fail-closed edit of the V2 import-candidate CSV was rejected by the connector safety layer. Therefore this branch records the defect and required correction only; the executable CSV remains unchanged and still requires correction.
