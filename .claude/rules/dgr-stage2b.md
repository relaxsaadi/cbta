# DGR Stage 2B shared handoff

When working on the KOST DGR/CBTA question-bank revalidation, first read:

- `docs/AI_HANDOFF.md`
- `docs/DGR_STAGE_2B_STATUS.md`
- `docs/DGR_SOURCE_REGISTER.md`

These files are the shared coordination state between Claude Code and ChatGPT.

Rules:

1. Never infer regulatory content that is not directly supported by the supplied current source.
2. Tier A means direct current official regulatory text actually read/verified. A KOST course that cites a regulation remains Tier B evidence unless the official text itself was supplied.
3. Current regulatory baseline: IATA DGR 67th Edition 2026, French, with Addendum 1 integrated.
4. Do not mark any question `APPROVED` without a named qualified reviewer and review date.
5. French source verification and English bilingual technical review are separate gates.
6. Do not modify Moodle or production question-bank data unless the user explicitly authorizes that step.
7. Do not paste or commit large licensed IATA extracts. Store only concise source references, validation conclusions, and user-supplied evidence metadata.
8. If evidence is missing, record `SOURCE REQUIRED`, `SOURCE GAP`, or another explicit unresolved state rather than guessing.
9. Before changing a frozen item, record the reason: source change/addendum impact, documented reviewer correction, or user instruction.
10. Update `docs/DGR_STAGE_2B_STATUS.md` and `docs/DGR_SOURCE_REGISTER.md` after each material revalidation decision so both agents see the same state.
