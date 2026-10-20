# Function 7.10 — Stage 2B.1 evidence exceptions (2026-10-19)

**DRAFT / NOT APPROVED / NOT READY.** Repository/CI audit only; no direct licensed IATA DGR 67th Edition 2026 source examination or qualified signoff performed.

Function-specific canonical basis: `docs/DGR_OFFICIAL_TASK_SET_7.10.md`, IATA CBTA Training Guidance Ed.1 (2023), TABLEAU 7.10.A; 23 leaf tasks: Block 0 (16), 3.4 (2), 5.1 (2), Block 7 (3, without 7.4). Do not copy 7.1's 44 tasks. The distinct source/competency matrix and provisional blueprint exist. The draft bank contains 44 items, also represented in the separate draft EN package.

At PR #3 commit `864afaa03c982cd6a409cc84fcf18592372fbaac`, [DGR regulatory readiness](https://github.com/relaxsaadi/cbta/actions/runs/39182766947) and [direct Tier-A provenance](https://github.com/relaxsaadi/cbta/actions/runs/39182766679) both fail.

The readiness job flags **10 FROZEN/source-verified items** with non-item-specific evidence: `Q-7.10-005`, `007`, `013`, `014`, `016`, `017`, `018`, `020`, `026`, `030`. `Q-7.10-019` additionally requires direct evidence before any `FR SOURCE GAP CONFIRMED` claim.

A separate check flags **13 stale/missing EN-package mirrors of FR source status**: `Q-7.10-005`, `007`, `013`, `014`, `015`, `016`, `017`, `018`, `019`, `020`, `026`, `030`, `041`. The two issue sets overlap; counts must not be added. The stronger affirmative-current-edition test reports other unresolved item-level claims beyond these 10.

Required: per-question source/competency tracing, direct current 2026 Tier-A evidence, explicit `SOURCE GAP` or `SOURCE CONFLICT` when unresolved, qualified **named/date** French verification, independently qualified **named/date** English review. Do not mirror an unsupported FROZEN state into EN just to pass CI. Do not set `APPROVED` or enable production import based on structural tests. Leave PR #3 DRAFT; platform technical, security, deployment, recovery and human-review gates remain open.

**This document records only test findings; it changes no question, answer, review decision, secret or approval claim.**
