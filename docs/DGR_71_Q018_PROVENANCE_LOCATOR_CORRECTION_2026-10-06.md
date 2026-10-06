# Function 7.1 Q-7.1-018 provenance locator correction

**Scope:** documentation/data-integrity correction only. No question text, answer, review status, approval status, or regulatory claim is promoted by this note.

## Confirmed current-source-of-record

For `Q-7.1-018`, the authoritative repository evidence records:

- current item-specific Tier-A support: IATA DGR 67th Edition 2026 **Table 4.2, UN1830**, with **Appendix A** corroboration for the battery-acid/common-term relationship;
- **§3.0.2 is taxonomy only** for the distractor class labels and is not the item-specific evidence for sulfuric acid being Class 8.

This is stated consistently in:

- `docs/DGR_SOURCE_REGISTER.md`;
- `docs/DGR_STAGE_2B_STATUS.md`;
- `docs/DGR_PRODUCTION_BANK_7.1.md`;
- `docs/DGR_EN_REVIEW_PACKAGE_7.1.md`.

## Cross-artifact mismatch

Two CSV artifacts on the Stage 2B handoff head still carry only `§3.0.2` as the locator for `Q-7.1-018`:

- `docs/DGR_TIER_A_RECONCILIATION_453_PER_ITEM.csv`;
- `docs/DGR_V2_IMPORT_CANDIDATES_AFTER_RECONCILIATION.csv`.

Treat those two locator cells as stale until aligned to the current source-of-record. The conservative replacement meaning is:

`Table 4.2, UN1830 + Appendix A; §3.0.2 distractor taxonomy only`

## Required state

This correction does **not** make the item APPROVED. EN bilingual review remains separate and approval remains pending a named qualified reviewer + date.
