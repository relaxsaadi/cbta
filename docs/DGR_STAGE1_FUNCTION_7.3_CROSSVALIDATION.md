# DGR Stage 1 — Function 7.3 — SECOND-PASS CROSS-VALIDATION — CONFIRMED

**Verdict: CONFIRMED.** An independent second pass re-read the same source
files cited in `docs/DGR_STAGE1_FUNCTION_7.3_DRAFT.md` (the first-pass
Stage 1 draft) — including direct visual inspection of the rendered
TABLEAU 7.1.A / 7.2.A / 7.3.A PDF pages (not just extracted text), MD5
checksums of the disputed files, and targeted `pdftotext`/`grep` spot-checks
of the 348-slide course and 30-question exam. Every load-bearing claim in
the draft is verified accurate. No correction to the 33-leaf-sub-task
enumeration, the block structure, the star ratings, or the practice-book
SOURCE GAP is required. One precision-level addition is recorded below
(minor cross-table header-wording micro-variants) that does not change any
count or conclusion.

This file does not replace `docs/DGR_STAGE1_FUNCTION_7.3_DRAFT.md`; it
records the independent second pass against it, per the same two-pass
discipline Function 7.1 used (draft → corrected/confirmed final).

## Method

All checks performed directly against the same folder the draft cites:
`/Users/mac/Documents/Fichiers/Algerie/CBTA final/yasmine cbta/wetransfer_supports-pedagogiques-dgr-cbta-kost-academy_2025-10-12_1842/COURS DGR-CBTA-IATA/DGR-FONCTION 7.3/`.

- `md5` on the disputed practice-book file and the two claimed cross-function
  duplicate files (Training Guidance PDF, ICAO Doc 10147).
- `pdftoppm -r 200` rendering of the IATA "Orientations"/"Training Guidance"
  PDF pages carrying TABLEAU 7.1.A, 7.2.A, and 7.3.A, viewed as images (the
  star-rating column does not survive plain-text extraction, exactly as the
  draft notes) — all three tables rendered and visually compared side by
  side in this pass, not just 7.2 vs 7.3 as the draft describes.
- `pdftotext -layout` full extraction of the 348-slide course and the
  30-question exam, with an `awk` page-counter (splitting on form-feed) so
  every grep hit could be tied to an exact slide/page number and checked
  against the draft's citations.

## (a) TABLEAU 7.3.A content and star-rating column — CONFIRMED

Rendered `14_IATA_CBTA_Dangerous_Goods_Training_Guidance_Edition1_2023_FR.PDF`
pages 28–29 (printed pages 24–25) as images and read them directly.

- Page 24 (bottom half, below TABLEAU 7.2.A's continuation and the 7.3
  section intro paragraph): TABLEAU 7.3.A Block 0, single column headed
  "Traitement/acceptation du fret", uniform **★** on every row from the
  top-level "0" row down through every leaf: 0.1.1–0.1.4, 0.2.1–0.2.3,
  0.3.1, 0.3.3 (table visibly skips 0.3.2, jumping straight from 0.3.1 to
  0.3.3), 0.4.1–0.4.3, 0.5.1–0.5.3, 0.6.1–0.6.2. Count: 4+3+2+3+3+2 = **17**,
  confirmed.
- Page 25: TABLEAU 7.3.A continued, Block 3 "Traitement et acceptation du
  fret" with three sub-blocks each rated uniform **★★★**: 3.1 "Examiner la
  documentation" (3.1.1–3.1.4, 4 leaves), 3.2 "Examiner le ou les colis"
  (3.2.1–3.2.5, 5 leaves), 3.3 "Suivre les procédures d'acceptation"
  (3.3.1–3.3.3, 3 leaves) = **12 leaves**. **3.4 does not appear anywhere in
  this table** — confirmed absent. Block 7 "Collecte de données pour la
  sécurité", 7.1–7.4, uniform **★★**, 4 leaves, confirmed.
- **Total: 17 + 12 + 4 = 33**, confirmed independently.

## (b) Block 0 verbatim match across 7.1 / 7.2 / 7.3 — CONFIRMED, with one precision note

Rendered and compared all three functions' printed Block 0 tables directly
(TABLEAU 7.1.A on PDF p.25/printed p.21, TABLEAU 7.2.A on PDF p.27/printed
p.23, TABLEAU 7.3.A on PDF p.28/printed p.24 — this is a third table beyond
what the draft itself directly re-rendered, since the draft's own
comparison was 7.2-image-vs-7.3-image only).

All **17 leaf items' wording is identical, word-for-word, across all three
functions**: 0.1.1 "Comprendre la définition" through 0.6.2 "Comprendre les
exigences d'intervention d'urgence de l'employeur", including the same
0.3.2 numbering gap in all three tables. Star ratings are uniform ★ in all
three (7.1 carries the rating in both its Classification and Préparation
columns, since 7.1's table has two qualification columns; 7.2/7.3 have one
column each).

**Precision note not previously recorded:** the *non-leaf sub-block header*
rows (0.1, 0.3, 0.4, 0.6 — the grouping rows above the numbered leaves, which
are not themselves among the 17 counted leaf sub-tasks) carry trivial
wording micro-variants between the three functions' printings of this
generic block, apparently just inconsistent re-typesetting of the same
underlying content across the IATA guide's per-function sections rather
than a substantive difference:

| Row | 7.1 wording | 7.2 wording | 7.3 wording |
|---|---|---|---|
| 0.1 header | "Déterminer l'applicabilité des marchandises dangereuses" | "Applicabilité des marchandises dangereuses" | "Déterminer l'applicabilité des marchandises dangereuses" |
| 0.1.2 | "cadre juridique (mondial **et** national)" | "cadre juridique (mondial**,** national)" | "cadre juridique (mondial**,** national)" |
| 0.2.2 | "Reconnaître **des** marchandises..." | "Reconnaître **les** marchandises..." | "Reconnaître **les** marchandises..." |
| 0.3 header | "Identifier les rôles et responsabilités" | "Identifier **différents** rôles et responsabilités" | "Identifier **différents** rôles et responsabilités" |
| 0.4 header | "Comprendre l'importance de la classification..." | "Comprendre l'importance de la classification..." | "Comprendre l'importance **critique** de la classification..." |
| 0.6 header | "Se familiariser avec les interventions d'urgence" | "Se familiariser avec les interventions d'urgence" | "Se familiariser avec les interventions d'urgence **de base**" |

None of these affect the 17-item count, the leaf wording, or the star
ratings — they are cosmetic differences in the IATA source PDF's own
repeated typesetting of the same generic block, not a KOST-course artifact
and not something that changes any Stage 1 conclusion. Recorded here purely
for completeness since this pass re-rendered a table (7.1.A) the original
draft did not itself re-render.

**Conclusion: the draft's "third independent confirmation" claim is
correct** — Block 0 is genuinely IATA's shared, verbatim-reused "basic
principles" block across at least Functions 7.1, 7.2, and 7.3.

## (c) Block 3 activates sub-blocks 3.1–3.3, not 3.4 — CONFIRMED

Directly visible on the same rendered page 25 image described in (a): the
table lists only 3.1/3.2/3.3 under Block 3 for Function 7.3, and TABLEAU
7.2.A (rendered on PDF p.28/printed p.24 top half) lists only 3.4 for
Function 7.2, with completely different leaf wording (3.4.1/3.4.2 =
"Vérifier la documentation/les colis pour voir s'il y a des indications
concernant des marchandises dangereuses cachées et non déclarées" — the
hidden/undeclared-DG detection framing) vs 7.3's 3.1–3.3 (declared-DG
verification framing: expéditeur declaration, transport documents, other
documents, marks, labels, package condition, State/operator divergences,
acceptance checklist, load-planning information, document retention). This
is a genuine, source-confirmed structural difference, independently
re-derived from the table images themselves, not inferred from prose.

## (d) Practice-book misfiling — CONFIRMED by MD5 + directory listing

```
7.3 folder file: KOST_DGR_CBTA_Practice_Book_Function_7.1_FR_2025.pdf
  MD5 = 20c06b5481669957131185b12afd86ad, size 859877 bytes
7.1 folder file: KOST_DGR_CBTA_Practice_Book_Function_7.1_FR_2025.pdf
  MD5 = 20c06b5481669957131185b12afd86ad, size 859877 bytes
```

Identical MD5 and identical byte size — this is the literal same file, not
a coincidentally similar one. **No genuine Function 7.3 practice book is
present in the folder.** This pass additionally confirms, via
`pdftotext -layout` + page-counting, that the course's own internal
practice-book pointers are exactly as the draft states — found at the exact
page numbers cited:

| Course reference | Page found (independent re-check) | Draft's citation |
|---|---|---|
| "Questions 1 - 2" | p.38 | p.38 ✓ |
| "Questions 3 - 5" | p.62 | p.62 ✓ |
| "Questions 6 - 12" | p.101 | p.101 ✓ |
| "Questions 13 - 18" | p.119 | p.119 ✓ |
| "Questions 19 - 24" | p.178 | p.178 ✓ |
| "Questions 25 - 30" | p.345 | p.345 ✓ |

All six checkpoints found at the exact cited slide numbers, confirming the
course expects a real, distinct ≥30-question Function 7.3 practice book
(matching the exam's own 30-question count) that is **not present anywhere
in the folder**. This is a genuine, confirmed SOURCE GAP, carried forward
unchanged into the Stage 2A blueprint as a binding caveat — it must not be
papered over, and the misfiled Function 7.1 book must never be used as
Function 7.3 evidence.

Also independently re-confirmed by MD5: the "Training Guidance" PDF filed
under Function 7.3 is byte-identical to the "Orientations" PDF filed under
Function 7.2 (`88fca4d5aa6a0dca0000dbc64b0acbdb`, same multi-function IATA
document renamed inconsistently between folders), and the ICAO Doc 10147
copy is likewise identical across both folders
(`00615e9649a74f132f44d384804b20e3`) — both exactly as the draft states.

## (e) 0.4.3 "multiple hazards" well-covered — CONFIRMED, genuine contrast with 7.2's gap

`grep`/page-count re-check of the course text independently located the
exact same slide range the draft cites:

```
p.95: "Classification des matières présentant des dangers multiples DGR 3.10"
      "le Tableau 3.10.A doit être utilisé pour déterminer lequel des deux
       dangers doit être [primaire/subsidiaire]"
p.96: "Tableau 3.10.A" (referenced again, worked example)
p.97: "Exceptions DGR 3.10.2" — "(a)-(f): Classe 1, Classe 2 et Classe 7..."
```

Three dedicated slides with a named table reference and an explicit
exceptions list — this is real, substantive, function-specific coverage of
0.4.3, independently confirmed. Function 7.2's Stage 1 draft (already
committed) records no equivalent material for the same official sub-task —
the contrast is genuine, not an artifact of different reading depth between
the two passes.

## Additional independent spot-checks performed this pass (not exhaustive, but load-bearing)

- Course PDF confirmed 348 pages via `pdfinfo`; exam PDF confirmed 14 pages,
  **30 numbered questions** (`grep -c` on the question-number pattern),
  "Vous avez **03 heures**" and "Note de passage est : **80%**" — all
  matching the draft's exam metadata claims exactly.
- p.14–20 ("Généralités", Article/Substance distinction, DGR 1.0 definition,
  "pourquoi nous avons besoin de savoir tout ça", the five-accident
  historical slide — Pan Am 1973 / Saudia 1980 / ValuJet 1996 / Bhopal 1984
  / UPS Dubai 2010) — confirmed verbatim, supporting 0.1.1.
- p.224 and p.241 both independently confirmed titled "Vérifier la
  déclaration de l'expéditeur", confirming the 18-slide span claimed for
  3.1.1's primary (non-radioactive) pass.
- Exam Q1 ("Quelle est la définition des Marchandises dangereuses ?") and Q2
  ("D'où vient la règlementation ?") confirmed to map to 0.1.1/0.1.2
  respectively; Q4 (expéditeur/exploitant responsibility matrix) confirmed
  to map to 0.3.1; Q5 (reduced-mobility passenger's lithium-battery
  wheelchair, multi-part) confirmed to map to 0.2.3; Q21 ("30 kg de chlorate
  de sodium") confirmed to map to 3.3.1; Q29/Q30 confirmed to be the two
  full blank-checklist scenario questions (non-radioactive lithium-ion
  shipment / radioactive As-77 special-form shipment respectively) described
  in the draft.
- Checklist granularity confirmed genuine, not an exaggeration: found
  "Élément 35" and "Élément 48" referenced individually in the course text,
  and the summary line "Points importants à prendre en compte pour remplir
  les points 42 à 48 de la liste de contrôle" at p.316 — the course really
  does walk a  numbered IATA acceptance checklist up to at least item 48,
  supporting the draft's "unusually granular" characterization of Block 3's
  sourcing.

## Outcome

**CONFIRMED — no correction required to the 33-leaf-sub-task enumeration,
block/sub-block structure, star ratings, or SOURCE GAP findings in
`docs/DGR_STAGE1_FUNCTION_7.3_DRAFT.md`.** The one addition recorded above
(non-leaf header wording micro-variants across the three functions' tables)
is a precision note, not a correction — it does not change any count,
mapping, or conclusion. `docs/DGR_STAGE1_FUNCTION_7.3_DRAFT.md` may now be
treated as **cross-validated** (second pass complete) rather than
first-pass-only, and is the basis for the Stage 2A blueprint in
`docs/DGR_STAGE2A_FUNCTION_7.3_BLUEPRINT.md`. It remains **not** reviewed by
a qualified instructor, **not** accepted by ANAC, and **not** Tier
A–verified against the current 67th Edition/Addendum 1 text — those gates
are unaffected by this pass and remain open.
