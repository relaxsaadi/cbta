# Function 7.10 — Stage 2B.1 evidence exceptions (2026-10-19)

## 2026-11-12 new item-level conflict: Q-7.10-012

This function's own question Q-7.10-012 historically used DGR 67th Edition/AM1 §§2.3.5.8.3 and 2.3.5.8.4(c) (2026-08-25) for operator-approval thresholds of >15 PED and >20 spare batteries, while including external batteries. [IATA's public operator guidance, 31 March 2026](https://www.iata.org/contentassets/90f8038b0eea42069554b2f4530f49ea/guidance-to-operators---power-banks.pdf), discussing the ICAO TI addendum effective 27 March 2026, distinguishes personal-use power banks and limits them to two (pp. 1, 4, 10). The effective item state is now **`SOURCE CONFLICT — 2026 POWER_BANK_ADDENDUM_REVIEW_REQUIRED`** until independently reviewed direct licensed 2026 FR DGR/addendum text, State/operator applicability, named qualified FR/date and separate EN/date support a scoped decision. No claim that ordinary spare-battery threshold itself is universally false. No question answer was changed; do not import or approve.

**DRAFT / NOT APPROVED / NOT READY.** Repository/CI audit only; no direct licensed IATA DGR 67th Edition 2026 source examination or qualified signoff performed.

Function-specific canonical basis: `docs/DGR_OFFICIAL_TASK_SET_7.10.md`, IATA CBTA Training Guidance Ed.1 (2023), TABLEAU 7.10.A; 23 leaf tasks: Block 0 (16), 3.4 (2), 5.1 (2), Block 7 (3, without 7.4). Do not copy 7.1's 44 tasks. The distinct source/competency matrix and provisional blueprint exist. The draft bank contains 44 items, also represented in the separate draft EN package.

At PR #3 commit `864afaa03c982cd6a409cc84fcf18592372fbaac`, [DGR regulatory readiness](https://github.com/relaxsaadi/cbta/actions/runs/39182766947) and [direct Tier-A provenance](https://github.com/relaxsaadi/cbta/actions/runs/39182766679) both fail.

The readiness job flags **10 FROZEN/source-verified items** with non-item-specific evidence: `Q-7.10-005`, `007`, `013`, `014`, `016`, `017`, `018`, `020`, `026`, `030`. `Q-7.10-019` additionally requires direct evidence before any `FR SOURCE GAP CONFIRMED` claim.

A separate check flags **13 stale/missing EN-package mirrors of FR source status**: `Q-7.10-005`, `007`, `013`, `014`, `015`, `016`, `017`, `018`, `019`, `020`, `026`, `030`, `041`. The two issue sets overlap; counts must not be added. The stronger affirmative-current-edition test reports other unresolved item-level claims beyond these 10.

Required: per-question source/competency tracing, direct current 2026 Tier-A evidence, explicit `SOURCE GAP` or `SOURCE CONFLICT` when unresolved, qualified **named/date** French verification, independently qualified **named/date** English review. Do not mirror an unsupported FROZEN state into EN just to pass CI. Do not set `APPROVED` or enable production import based on structural tests. Leave PR #3 DRAFT; platform technical, security, deployment, recovery and human-review gates remain open.

**This document records only test findings; it changes no question, answer, review decision, secret or approval claim.**
