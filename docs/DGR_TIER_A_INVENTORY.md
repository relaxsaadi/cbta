# DGR Tier A Inventory — Second Tier A Phase (2026-08-25)

## ⚠️ STATUS RECONCILIATION (added 2026-08-25, during Moodle integration / pre-audit data sync — read this before using any total below)

**This file's "Current totals" line ("218 FROZEN…") reflects topic/
priority-item ANALYSIS CONCLUSIONS reached during the second Tier A phase
— it is not what is actually stamped in each item's own `**FR status:**`
field inside its `docs/DGR_PRODUCTION_BANK_7.X.md` file.** Those two
things have diverged: several topic-based findings recorded here (e.g.
"Q-7.2-036 → PARTIAL") were never written back into that item's own file.

A strict, read-only, per-item re-count — reading each item's own `FR
status` field directly, via a parser built and self-validated against
Function 7.1's already-known-correct data — found:

| Status (per item's own FR status field, current as of 2026-08-25) | Count |
|---|---|
| FROZEN FR / SOURCE VERIFIED | **97** |
| FR SOURCE GAP CONFIRMED | 5 |
| STALE CITATION / SOURCE CONFLICT | 2 |
| PARTIALLY CONFIRMED (stamped at the item's own file level) | 0 — see note below |
| DRAFT (Tier B only / not Tier-A-attempted / inconclusive search — not distinguished from each other at the file level) | 349 |
| **Total** | **453** |

**Concrete, checkable example of the gap:** `Q-7.2-036` is listed later in
this file (§ "PARTIALLY CONFIRMED") as a topic-analysis finding. Its own
file, `docs/DGR_PRODUCTION_BANK_7.2.md`, still reads verbatim: `**FR
status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.` — unchanged.
The same pattern (a real analysis conclusion, not yet propagated to the
item's own stamped field) plausibly accounts for most of the gap between
this file's 218/33/17/3/182 figures and the 97/0/5/2/349 figures above —
not an error in either accounting, but two different things being counted
("analysed and concluded" vs. "actually stamped on the item").

**No item's status was changed to produce this reconciliation** — it is a
read-only re-count, run specifically because 97, not 218, is what the
downstream Moodle-integration work actually consumed (an item's own file
field is the only thing that can be imported as real question text). Of
the 97 FROZEN items, **92 are now integrated into Moodle** across
Functions 7.1–7.10; **5 Function 7.1 items remain excluded** (FROZEN per
status, but their full administered wording is not safely recoverable
from any source reached this session — see
`docs/DGR_MOODLE_BANK_INTEGRATION_PLAN.md` and the per-function
`docs/DGR_MOODLE_IMPORT_TRACEABILITY_7.X.csv` files, on branch
`console/finalization-2026-08-25`, for the full audit trail). No DRAFT/
PARTIAL/STALE item was imported.

**Audit-facing summary statement:** 453 questions exist in the working
program. 97 currently carry individually-stamped FROZEN FR / SOURCE
VERIFIED status. 92 of those are integrated in Moodle across Functions
7.1–7.10. 5 Function 7.1 items remain excluded because their exact full
question wording is not safely recoverable. No DRAFT/PARTIAL/STALE item
was imported.

The table below and the rest of this file are left exactly as originally
written (a valid historical record of the analysis pass) — do not read
"218 FROZEN" as the current per-item-stamped count without this note.

---

Durable exact inventory of the 453-item KOST DGR/CBTA production question bank
(Functions 7.1–7.10), taken at the start of the second Tier A verification
phase. Source of truth: `docs/DGR_STAGE_2B_STATUS.md` (Function 7.1, 19 items)
and `docs/DGR_PRODUCTION_BANK_7.2.md` … `docs/DGR_PRODUCTION_BANK_7.10.md`
(Functions 7.2–7.10, 434 items). Regulatory baseline: IATA DGR 67th Edition
2026, French, Addendum 1 integrated.

**Live status note (2026-08-25, updated after Topic 5 — all 5 priority
topics complete):** the category counts and topic sublists below are a
snapshot taken *before* topic-based navigation began. Topics 1–5 are now
all resolved — see `docs/DGR_SOURCE_REGISTER.md`'s "Topic 1"–"Topic 5"
entries:
- Topic 1 (lithium batteries, 14 items) — all confirmed.
- Topic 2 (NOTOC, 23 items) — 20 confirmed, 3 moved to PARTIAL.
- Topic 3 (Part 6/UN-spec marks, 10 items) — all confirmed.
- Topic 4 (§2.8 divergences, 22 items incl. 1 Topic-2 overlap) — 14
  confirmed, 7 moved to PARTIAL, 1 moved to STALE.
- Topic 5 (§2.5 operator-property, 7 items) — 2 confirmed, 3 moved to
  PARTIAL, 2 moved to STALE (KOST's "pièces pour avions" 5th-category
  claim conflicts with current DGR's real 5th category, "Produits
  d'hygiène," §2.5.1.4).

The 4 original STALE items (`Q-7.2-021`, `Q-7.2-022`, `Q-7.2-045`,
`Q-7.3-039`, priority item 7) were also re-examined: §9.5.1.2 was read in
full and confirmed to cover only pilot-in-command access to ICAO Doc 9481,
and a further search of §9.3.6 plus a direct phrase search both failed to
locate the tested content anywhere in current DGR. All 4 reclassified from
STALE to **GAP** (a confirmed, exhaustively-searched absence, not merely a
wrong citation) — see `docs/DGR_SOURCE_REGISTER.md`'s "Priority item 7"
entry.

Current totals: **218 FROZEN, 17 GAP, 33 PARTIAL, 3 STALE, 182
NOTATTEMPTED** (453 total). All 4 original STALE items are now GAP; the 3
STALE items still open (`Q-7.3-025`, `Q-7.4-028`, `Q-7.5-026`) were newly
found during Topics 4–5 this session and remain accurately labeled STALE
(a specific wrong citation/claim, not an exhaustively-confirmed absence).
Remaining phase work per the navigation plan: priority item 6 (33 PARTIAL
items), priority item 7 (the 3 still-open STALE items), priority item 8
(remaining NOTATTEMPTED items). The tables below are left as the original
baseline snapshot for audit purposes; do not re-derive counts from them
without applying this note.

Counting method: each function's own batch summary table is the canonical
row set. For 7.1 the 19-row table in `DGR_STAGE_2B_STATUS.md` is used (its
duplicate 7-row summary inside `DGR_PRODUCTION_BANK_7.1.md` is excluded to
avoid double-counting). This produces exactly **453** items — not an
approximate total.

## Category totals (exact, 453/453 accounted for)

| Category | Count |
|---|---|
| FROZEN FR / SOURCE VERIFIED | 158 |
| FR SOURCE GAP CONFIRMED | 13 |
| PARTIALLY CONFIRMED (DRAFT, partial Tier A) | 21 |
| STALE CITATION / SOURCE CONFLICT | 4 |
| NOT ATTEMPTED (DRAFT, Tier A not attempted / Tier B only) | 257 |
| **Total** | **453** |

## Per-function breakdown

| Function | FROZEN | GAP | PARTIAL | STALE | NOTATTEMPTED | Total |
|---|---|---|---|---|---|---|
| 7.1 | 18 | 1 | 0 | 0 | 0 | 19 |
| 7.2 | 25 | 2 | 7 | 3 | 12 | 49 |
| 7.3 | 20 | 1 | 2 | 1 | 21 | 45 |
| 7.4 | 11 | 1 | 2 | 0 | 39 | 53 |
| 7.5 | 13 | 1 | 3 | 0 | 27 | 44 |
| 7.6 | 16 | 1 | 2 | 0 | 37 | 56 |
| 7.7 | 16 | 1 | 3 | 0 | 33 | 53 |
| 7.8 | 12 | 2 | 1 | 0 | 36 | 51 |
| 7.9 | 15 | 2 | 0 | 0 | 22 | 39 |
| 7.10 | 12 | 1 | 1 | 0 | 30 | 44 |
| **Total** | **158** | **13** | **21** | **4** | **257** | **453** |

## FR SOURCE GAP CONFIRMED — full list (13 items)

DGR is silent by design on these points (KOST/Tier B or Tier C basis
retained; not an open lookup task).

| ID | Note |
|---|---|
| Q-7.1-001 | DGR silent by design; Tier B/C basis retained (originating finding) |
| Q-7.2-002 | Cross-applied from Q-7.1-001 |
| Q-7.2-031 | Cross-applied |
| Q-7.3-017 | Cross-applied |
| Q-7.4-027 | Cross-applied |
| Q-7.5-018 | Cross-applied |
| Q-7.6-018 | Cross-applied |
| Q-7.7-019 | Cross-applied |
| Q-7.8-018 | Cross-applied |
| Q-7.8-036 | Cross-applied |
| Q-7.9-022 | Cross-applied |
| Q-7.9-023 | Cross-applied |
| Q-7.10-019 | Cross-applied |

## PARTIALLY CONFIRMED — full list (originally 21; now 24 after Topic 2 added 3)

3 items added by Topic 2 (2026-08-25): `Q-7.4-013`, `Q-7.6-009` (KOST's
"plan de chargement" exact-match terminology not found anywhere in current
DGR text — zero hits on a full in-book search; general accuracy duty
confirmed via §9.5.1.1.7 only) and `Q-7.8-050` (KOST's "principle
justifying the NOTOC" framing not found as a standalone DGR clause; one
distractor independently confirmed wrong via §9.5.1.1.6). See
`docs/DGR_SOURCE_REGISTER.md`'s "Topic 2" entry for full citations. The
table below is the original 21-item baseline; it is not re-derived here.

Priority-order item 6. Each needs one further targeted lookup to close.

| ID | Gap |
|---|---|
| Q-7.2-003 | General duty Tier A-confirmed; specific cue Tier B only |
| Q-7.2-006 | General duty Tier A-confirmed; itemized list Tier B only |
| Q-7.2-008 | Tier A search found no direct match |
| Q-7.2-023 | Mechanism + "Not Restricted" term Tier A-confirmed; SDS example itself Tier B |
| Q-7.2-028 | Underlying duty Tier A-confirmed (shares Q-7.2-024's §9.1.7); distinct citation unconfirmed |
| Q-7.2-036 | Partially confirmed — competency-framework finding, flagged for revision |
| Q-7.2-047 | General duty Tier A-confirmed; itemization unconfirmed |
| Q-7.3-020 | Partially confirmed — competency-framework finding, flagged for revision |
| Q-7.3-036 | General duty Tier A-confirmed; exact citation unconfirmed |
| Q-7.4-003 | Passenger-side clause Tier A-confirmed; cargo-side comparison not independently cited |
| Q-7.4-042 | Likely shares Q-7.2-036's competency-framework finding, not independently confirmed |
| Q-7.5-019 | Distractors Tier A-confirmed absent from §1.4.1; correct answer's own citation unconfirmed |
| Q-7.5-037 | Likely shares Q-7.2-036's competency-framework finding, not independently confirmed |
| Q-7.5-041 | General duty Tier A-confirmed; exact citation unconfirmed |
| Q-7.6-008 | General duty Tier A-confirmed; exact citation unconfirmed |
| Q-7.6-041 | Likely shares Q-7.2-036's competency-framework finding, not independently confirmed |
| Q-7.7-006 | General duty Tier A-confirmed; exact citation unconfirmed |
| Q-7.7-038 | Not DGR text (KOST commentary); Tier B unchanged |
| Q-7.7-042 | Distractors Tier A-confirmed absent from §1.4.1; correct answer's own citation unconfirmed |
| Q-7.8-010 | General duty Tier A-confirmed; exact citation unconfirmed |
| Q-7.10-008 | General duty Tier A-confirmed; exact citation unconfirmed |

Cross-cutting sub-groups inside this list:
- **Competency-framework finding** (§1.5.1.1–1.5.2 vs KOST's simpler model): Q-7.2-036, Q-7.3-020, Q-7.4-042, Q-7.5-037, Q-7.6-041 (5 items, same root cause).
- **§1.4.1 distractor-set items**: Q-7.5-019, Q-7.7-042 (2 items, same root cause).

## STALE CITATION / SOURCE CONFLICT — full list (4 items)

Priority-order item 7. KOST's cited "§9.5.1.2" does not match current DGR
(that section number now covers ICAO Doc 9481 availability to
pilot-in-command, not the cited topic).

| ID | Note |
|---|---|
| Q-7.2-021 | Citation stale — current §9.5.1.2 covers a different topic (originating finding) |
| Q-7.2-022 | Same finding as Q-7.2-021 |
| Q-7.2-045 | Likely shares Q-7.2-021/022's stale-citation issue, not independently confirmed |
| Q-7.3-039 | Citation likely stale (same finding as Q-7.2-021/022) |

## NOT ATTEMPTED — topic-tagged sublists (priority topics 1–5)

257 NOTATTEMPTED items total. Tagging is by keyword match against each
item's sub-task title (not the abbreviated "KOST slide NNN" source-basis
column alone, which under-matches). 74 unique items match at least one of
the 5 priority topics; 2 items match two topics each (noted below). The
remaining 183 NOTATTEMPTED items are untagged by these 5 topics and fall
under priority-order item 8 ("remaining NOT ATTEMPTED items with genuine
Tier A source paths").

### Topic 1 — Lithium batteries (14 items) — ✅ RESOLVED 2026-08-25

Passenger/baggage thresholds, installed/spare batteries, PI/restrictions,
stale 66e thresholds. All 14 items below are now `FROZEN FR / SOURCE
VERIFIED` (see `docs/DGR_SOURCE_REGISTER.md`'s "Topic 1" entry for the
four DGR sections read: §2.3.5.8.3/.3.1/.4(c)/.4(f), §3.9.2.6.0,
§9.3.2.1.3, §7.1.5.5.2(b)/.3). No SOURCE GAP or SOURCE CONFLICT found.

| ID | Sub-task |
|---|---|
| Q-7.2-034 | 0.2.2 Batteries lithium |
| Q-7.3-002 | 0.2.3 Batterie lithium en bagage |
| Q-7.3-012 | 3.3.2 Séparation batteries lithium |
| Q-7.3-034 | 0.5.1 Marque piles lithium (Fig. 7.1.C) *(also Part 6 mark)* |
| Q-7.4-044 | 0.4.1 UN 3090 — lithium métal seules |
| Q-7.5-011 | 5.1.2 Seuils d'approbation AEP/batteries |
| Q-7.5-013 | 5.2.2 Seuil batterie installée (cadre WCHC borné) |
| Q-7.5-044 | 5.2.2 Lithium métal vs lithium-ion (UN 3480/3481) |
| Q-7.6-002 | 4.1.2 Restriction chargement batteries lithium PI 965/968 |
| Q-7.9-032 | 5.2.1 Seuils d'approbation AEP/batteries de rechange |
| Q-7.9-034 | 5.2.2 Batteries de rechange — cabine uniquement |
| Q-7.10-006 | 0.4.1 UN3481 — batterie lithium-ion en équipement |
| Q-7.10-012 | 5.1.2 Seuils d'approbation AEP/batteries |
| Q-7.10-031 | 0.4.1 UN3090 — batterie lithium métal seule |

### Topic 2 — NOTOC (23 items) — ✅ RESOLVED 2026-08-25 (20 confirmed, 3 partial)

Required fields, operational duties, radioactive/exception interactions.
20 of 23 now `FROZEN FR / SOURCE VERIFIED` via §9.5.1.1.1(a)/.3(a)-(j)/.6/
.9/.10 and Tableau 9.5.A. 3 items (`Q-7.4-013`, `Q-7.6-009`, `Q-7.8-050`)
moved to PARTIAL — see `docs/DGR_SOURCE_REGISTER.md`'s "Topic 2" entry.

| ID | Sub-task |
|---|---|
| Q-7.3-038 | 0.6.1 Support documentaire du NOTOC |
| Q-7.4-012 | 6.1.5 Champs obligatoires NOTOC |
| Q-7.4-013 | 6.1.5 Correspondance exacte NOTOC |
| Q-7.4-035 | 6.1.6 Notification du commandant de bord (restricted) |
| Q-7.4-052 | 6.1.5 Document NOTOC distinct de la LTA/déclaration/factures |
| Q-7.4-053 | 6.1.5 Catégorie exemptée de la NOTOC |
| Q-7.6-003 | 4.3.1 Champs obligatoires NOTOC |
| Q-7.6-004 | 4.3.1 Qui/quand fournit la NOTOC |
| Q-7.6-009 | 4.3.2 Divergence NOTOC/plan de chargement *(also §2.8 divergence)* |
| Q-7.6-030 | 4.3.1 NOTOC — exemptions (contre-exemple) |
| Q-7.6-031 | 4.3.1 NOTOC ≠ LTA (document distinct) |
| Q-7.7-001 | 6.2.2 Qui/quand fournit la NOTOC |
| Q-7.7-012 | 0.4.3 Champ NOTOC — risques subsidiaires (restreint) |
| Q-7.7-031 | 6.2.2 NOTOC — catégorie non exemptée |
| Q-7.7-032 | 6.2.2 NOTOC — aéroport déchargement/dérogations |
| Q-7.7-033 | 6.2.2 NOTOC — exigence de langue anglaise |
| Q-7.8-001 | 6.2.2 Champs obligatoires NOTOC |
| Q-7.8-006 | 6.2.4 Accessibilité NOTOC — agent des opérations (routinier) |
| Q-7.8-023 | 0.5.3 NOTOC non requise — quantités exceptées |
| Q-7.8-024 | 6.2.2 Situation où la NOTOC n'est pas exigée |
| Q-7.8-025 | 6.2.2 Qui fournit la NOTOC au commandant |
| Q-7.8-049 | 6.2.2 Langue anglaise exigée pour la NOTOC |
| Q-7.8-050 | 6.2.2 Principe fondamental de la NOTOC |

### Topic 3 — Part 6 / UN specification packaging marks (10 items) — ✅ RESOLVED 2026-08-25 (all 10 confirmed)

Exact mark decoding, X/Y/Z, packaging type/material codes, year/state/
manufacturer elements. All 10 now `FROZEN FR / SOURCE VERIFIED` via
§6.0.3.1, §6.0.3.2, §6.0.4.0.1, §6.0.4.2.1(c) — see
`docs/DGR_SOURCE_REGISTER.md`'s "Topic 3" entry.

| ID | Sub-task |
|---|---|
| Q-7.3-033 | 0.5.1 Portée du marquage ONU |
| Q-7.3-034 | 0.5.1 Marque piles lithium (Fig. 7.1.C) *(also lithium)* |
| Q-7.4-032 | 0.5.1 Code "Y" du marquage UN |
| Q-7.5-021 | 0.5.1 Décoder marquage UN/4G/Y30/S/13/CH |
| Q-7.5-022 | 0.5.1 Code de type d'emballage DGR 6.0.3.1 |
| Q-7.6-024 | 0.5.1 Lettre "Y" marquage UN-spec |
| Q-7.7-025 | 0.5.1 Code matériau — A = Acier |
| Q-7.9-028 | 0.5.1 Code « Y » du marquage UN |
| Q-7.10-023 | 0.5.1 Code « Y » du marquage UN (DGR 6.0.3) |
| Q-7.10-042 | 0.5.1 Code de type d'emballage (4=Caisse) |

### Topic 4 — State/operator divergences, §2.8 (22 items) — ✅ RESOLVED 2026-08-25 (14 confirmed, 7 partial, 1 stale)

14 now `FROZEN FR / SOURCE VERIFIED` via §2.8.3.1 (operator rule),
§2.8.3.5/§2.8.1.3 (AH/ITG lists), §2.0 (Table 2.3.A limitability), and the
exact PKG-02 divergence text. 7 items (`Q-7.2-037`, `Q-7.4-043`,
`Q-7.5-012`, `Q-7.5-025`, `Q-7.6-009` [Topic 2 overlap], `Q-7.7-043`,
`Q-7.10-041`) moved to PARTIAL — KOST's 3-State scope list, hierarchy
diagram, and OACI+IATA notification claim not independently confirmed as
stated. 1 item (`Q-7.3-025`) moved to STALE CITATION — its own "2.8.3.4 et
2.8.4" reference doesn't match current DGR structure. See
`docs/DGR_SOURCE_REGISTER.md`'s "Topic 4" entry for full citations.

| ID | Sub-task |
|---|---|
| Q-7.2-017 | 0.3.3 Divergences exploitant |
| Q-7.2-037 | 0.3.3 Divergence d'État — États concernés |
| Q-7.3-021 | 0.3.3 Divergence exploitant DGR 2.8.3 |
| Q-7.3-025 | 3.1.4 Divergences (doc) |
| Q-7.3-029 | 3.2.5 Divergences (colis) PKG-02 |
| Q-7.4-030 | 0.3.3 Divergence de l'Exploitant DGR 2.8.3 |
| Q-7.4-043 | 0.3.3 Portée divergence d'État DGR 2.8.1 |
| Q-7.5-009 | 0.3.3 Divergence d'exploitant DGR 2.8.3 |
| Q-7.5-012 | 5.2.1 Hiérarchie des divergences appliquée |
| Q-7.5-025 | 5.2.1 Portée des divergences d'État DGR 2.8.1 |
| Q-7.5-036 | 0.2.3 Limitation tableau 2.3.A par divergences |
| Q-7.6-009 | 4.3.2 Divergence NOTOC/plan de chargement *(also NOTOC)* |
| Q-7.6-022 | 0.3.3 Divergence exploitant — Air Algérie |
| Q-7.6-042 | 0.3.3 Règle divergence exploitant DGR 2.8.3 |
| Q-7.7-023 | 0.3.3 Divergence exploitant — AH Air Algérie |
| Q-7.7-043 | 0.3.3 Divergences notifiées à l'OACI/IATA |
| Q-7.8-020 | 0.3.3 Exemple de divergence d'État (ITG) |
| Q-7.8-041 | 0.3.3 Règle des divergences de l'Exploitant |
| Q-7.9-026 | 0.3.3 Divergence de l'Exploitant — Air Algérie |
| Q-7.9-037 | 0.2.3 Tableau 2.3.A limité par les divergences |
| Q-7.10-022 | 0.3.3 Divergence de l'Exploitant (DGR 2.8.3) |
| Q-7.10-041 | 0.3.3 Divergence d'État (ITG/Italie) |

### Topic 5 — Operator-property, §2.5 (7 items) — ✅ RESOLVED 2026-08-25 (2 confirmed, 3 partial, 2 source conflict)

**Significant finding:** current DGR §2.5.1's real 5th exempted category
is "Produits d'hygiène" (§2.5.1.4) — KOST's course substitutes "pièces
pour avions" instead, which is actually governed by the separate,
non-exemption §2.5.2. `Q-7.4-028`/`Q-7.5-026` moved to STALE (own claim
asserts the wrong category); `Q-7.6-038`/`Q-7.9-009` moved to PARTIAL (a
distractor, not the correct answer, is affected); `Q-7.5-027` moved to
PARTIAL (worked-examples wording not verbatim-located); `Q-7.8-012`/
`Q-7.10-028` FROZEN (their own tested fact is unaffected). See
`docs/DGR_SOURCE_REGISTER.md`'s "Topic 5" entry for full citations.

| ID | Sub-task |
|---|---|
| Q-7.4-028 | 0.2.2 MD de la propriété de l'exploitant |
| Q-7.5-026 | 5.2.2 Catégories générales exemptées DGR 2.5 |
| Q-7.5-027 | 5.2.2 Exemples nommés DGR 2.5 |
| Q-7.6-038 | 0.2.1 Catégories exemptées DGR 2.5 |
| Q-7.8-012 | 0.2.3 Exemption DGR 2.5 — glace carbonique |
| Q-7.9-009 | 5.2.1 Catégories exemptées DGR 2.5 |
| Q-7.10-028 | 0.2.3 Exemption propriété de l'exploitant (DGR 2.5) |

### Untagged NOTATTEMPTED remainder

183 of the 257 NOTATTEMPTED items do not match any of the 5 priority
topics above by title keyword. These are addressed under priority-order
item 8 ("remaining NOT ATTEMPTED items with genuine Tier A source paths"),
after topics 1–7 are closed. No separate list is enumerated here; they
remain identifiable as `DRAFT — Tier A not attempted` / `DRAFT — Tier B
only, SOURCE REQUIRED for Tier A` rows in each function's production bank
that are not already listed under Topics 1–5, GAP, PARTIAL, or STALE above.

## Navigation plan (this phase)

Per the user's priority order:
1. Lithium batteries (14 items) — **next**
2. NOTOC (23 items)
3. Part 6 / UN-spec marks (10 items, 1 overlap with Topic 1)
4. §2.8 divergences (22 items, 1 overlap with Topic 2)
5. §2.5 operator-property (7 items)
6. All 21 PARTIALLY CONFIRMED items
7. All 4 STALE CITATION items
8. Remaining ~183 untagged NOTATTEMPTED items with genuine Tier A source paths

Each topic lookup will identify every item across Functions 7.1–7.10 that
the same evidence resolves, verify both the correct answer and the
distractors, record concise exact DGR 67e + Addendum 1 references, and
record SOURCE GAP / SOURCE CONFLICT rather than guess. Commits are batched
by topic, not by function.
