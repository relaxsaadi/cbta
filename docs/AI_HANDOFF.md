# AI Handoff — DGR / CBTA Stage 2B.1

## Purpose

This file is the shared working checkpoint between Claude Code and ChatGPT for the KOST DGR/CBTA question-bank revalidation work.

## Current scope

- Function: 7.1
- Stage: 2B.1 — DGR 67th Edition / 2026 regulatory revalidation gate
- Language currently being source-verified: French
- English: separate bilingual technical review required
- Production/Moodle changes: not authorized in this stage

## Regulatory baseline

- IATA Dangerous Goods Regulations
- 67th Edition — 2026
- French digital edition
- Addendum 1 integrated

Do not assume a specific addendum delta unless separately established. Record `SPECIFIC ADDENDUM DELTA: NOT DETERMINED` when needed.

## Source hierarchy

- Tier A: direct current official regulatory material actually supplied/read/verified.
- Tier B: KOST approved training material with explicit regulatory citations/extracts.
- Tier C: legacy exams/practice books. Coverage/style only; never regulatory authority.

## Hard gates

- Never invent regulatory content.
- Missing evidence => `SOURCE REQUIRED`, `SOURCE GAP`, or equivalent unresolved state.
- No `APPROVED` status without named qualified reviewer + review date.
- `FR SOURCE VERIFIED` does not satisfy the English review gate.
- Do not edit frozen questions unless triggered by current-source change, addendum impact, documented reviewer correction, or explicit user instruction.
- Do not modify Moodle unless explicitly authorized.

## Current pilot status

Source-verified/frozen on FR side:

- Q-7.1-002 — Acétylène (liquide), T/F, absolute prohibition vs derogation distinction
- Q-7.1-003 — nine hazard classes
- Q-7.1-004 — Class 8 corrosive hazard label
- Q-7.1-005 — Propane UN 1978, Division 2.1
- Q-7.1-009 — PI 965 / UN 3480, Section IA = 35 kg cargo only
- Q-7.1-010 — UN 1845 dry ice package marking, net quantity
- Q-7.1-011 — overpack hazard labels visible/reproduced, labels-only scope
- Q-7.1-012 — document retention, T/F, shipper minimum 3 months

Pending 67th Edition revalidation:

- Q-7.1-001
- Q-7.1-006
- Q-7.1-007
- Q-7.1-008

Current count: 8/12 FR source-verified; 4/12 pending.

## Next action

Revalidate the remaining four items in one batch where possible, rather than one conversational round-trip per question.

Expected source targets:

- Q001: current Tier A definition/support for danger vs risk used by the pilot item.
- Q006: current Tier A packing-group definitions, especially Group I / II / III.
- Q007: current Tier A A1/A2 wording and exact approval/derogation terminology. Do not label A2 a derogation unless the current source literally supports that wording.
- Q008: current Tier A Table 2.6.A entry/code E0 and the exact regulatory consequence tested by the pilot item.

## Update discipline

After each batch:

1. Update `docs/DGR_STAGE_2B_STATUS.md`.
2. Update `docs/DGR_SOURCE_REGISTER.md` with source references and unresolved gaps.
3. Keep concise citations/locations only; do not commit large licensed IATA passages.
4. Record any question text change and why it was necessary.
