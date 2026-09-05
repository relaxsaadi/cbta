# DGR Stage 1 — Function 7.9 — SECOND-PASS CROSS-VALIDATION — CONFIRMED (one precision correction)

**Verdict: CONFIRMED, with one non-substantive precision correction.** An
independent second pass re-read the same source files cited in
`docs/DGR_STAGE1_FUNCTION_7.9_DRAFT.md` (the first-pass Stage 1 draft) —
including a fresh 300dpi full-page render of TABLEAU 7.9.A plus a dedicated
400dpi, 2.5×-upscaled crop isolating just the qualification (★) column for
Blocks 5/6/7 (produced with particular care because the same page's Block 7
star rating was the subject of a genuine cross-session SOURCE CONFLICT
already resolved once in this program, per the draft's own note 10), an
independent fresh render of Function 7.5's own TABLEAU 7.5.A page for a
direct side-by-side Block 0/5/7 comparison (not a re-quote of the 7.5 draft's
prose), a full independent re-extraction of the "Cadre CBTA" matrix's raw
text, `md5` checksums of the course/exam/practice-book/Training-Guidance PDFs
and a full ten-function practice-book MD5 comparison table rebuilt from
scratch, and targeted joined-text keyword searches of the 120-slide course,
the 20-question exam, and the 20-question practice book for every claimed
SOURCE GAP and "over-teaching beyond the table" finding. Every load-bearing
claim in the draft is verified accurate. **One correction** is made: the
DGR 4.2/DGR 2.1 citation-inconsistency note (SOURCE GAP note 8) is refined —
Function 7.5's own course is found to cite **both** DGR 2.1 and DGR 4.2 for
the "prohibited in all circumstances" concept, across a two-slide treatment,
not DGR 2.1 alone as the draft's prose could be read to imply. This does not
change the 24-leaf-sub-task enumeration, the block structure, the star
ratings (including the already-resolved Block 7 single-star finding), the
0.2.1/0.2.2 wording-diff finding, the Cadre CBTA wrong-function finding, the
6.2.3 major partial SOURCE GAP, the 0.3.2 SOURCE GAP, or any of the four
over-teaching findings.

This file does not replace `docs/DGR_STAGE1_FUNCTION_7.9_DRAFT.md`; it
records the independent second pass against it, per the same two-pass
discipline Functions 7.1, 7.3, 7.4, 7.5, 7.6, and 7.7 used (draft →
corrected/confirmed final).

## Method

All checks performed directly against the same folder the draft cites:
`/Users/mac/Documents/Fichiers/Algerie/CBTA final/yasmine cbta/wetransfer_supports-pedagogiques-dgr-cbta-kost-academy_2025-10-12_1842/COURS DGR-CBTA-IATA/DGR-FONCTION 7.9/`,
plus direct re-opens of Function 7.5's own folder and the low-rigor Cadre
CBTA archive.

- `md5` on the Training Guidance PDF, the course, the exam, and the practice
  book, compared against the draft's own reported hashes, and, for the
  practice book, an independently rebuilt ten-function MD5 comparison table
  (7.1–7.10), not copied from the draft's own table.
- `pdftotext -layout` full extraction of the Training Guidance PDF (with an
  `awk` form-feed page counter) to independently re-locate TABLEAU 7.9.A and
  TABLEAU 7.5.A by page number, plus full-page extraction of the 120-slide
  course, the 20-question exam, and the 20-question practice book, each with
  its own `awk` page counter so every citation could be traced to an exact
  printed page.
- `pdftoppm -r 300` full-page render of TABLEAU 7.9.A (PDF page 35, printed
  page 31), read directly, followed by a dedicated `pdftoppm -r 400` re-render
  cropped (via Pillow) and 2.5×-upscaled to isolate just the qualification
  column for the Block 5/Block 6/Block 7 rows in one continuous image — the
  same close-up-crop discipline already used for this exact page in the
  original SOURCE CONFLICT resolution, repeated independently here rather
  than assumed settled.
- `pdftoppm -r 300` fresh full-page render of TABLEAU 7.5.A (PDF page 31,
  printed page 27, independently re-located via the same form-feed method,
  confirmed via MD5 to be the identical Training Guidance document already on
  disk in Function 7.9's own folder) for a direct, independent side-by-side
  wording comparison at 0.2.1/0.2.2, not a re-quote of
  `docs/DGR_STAGE1_FUNCTION_7.5_DRAFT.md`'s own prose.
- `unzip -j` extraction of
  `PACK COMPLET FORMATION CBTA - FONCTION 7.9/📁 09_Cadre_CBTA/📁 09_Cadre_CBTA.docx`
  from `Archive.zip`, independently re-extracted via `textutil -convert txt`,
  read in full, with a keyword count for "cabine"/"PNC"/"passager"/"bagage"/
  "Expéditeur"/"1.5.A".
- Joined-text (whitespace-normalized) `python3`/`re` keyword searches of the
  full course text for every term the 6.2.3 major-partial-SOURCE-GAP finding
  depends on ("extincteur", "feu", "fumée", "confinement", "PAN PAN",
  "MAYDAY", "livre rouge", "couverture anti-feu", "sac de confinement"), and
  `grep`/joined-text searches for "responsab" (0.3.2) and the exact page
  citations for the four "over-teaching beyond the table" findings.
- Direct extraction and full reading of Exam Q5, Q6, Q7, Q20 and Practice
  Q5, Q7, Q9, Q12, Q17, Q20's own question text, and of course pages 3, 25,
  39–40, 65–67, 74, 98–99, 107–110.
- A fresh, independent extraction and read of Function 7.5's own course pages
  36–39 to verify the DGR 2.1/4.2 citation claim directly from the source,
  not from the 7.5 draft's own quoted prose.

## (a) TABLEAU 7.9.A content and star-rating column — CONFIRMED, including the already-resolved Block 7 single-star reading

Located TABLEAU 7.9.A at PDF page 35 (printed page 31) of
`01_IATA_CBTA_Dangerous_Goods_Training_Guidance_Edition1_2023_FR.PDF` (MD5
`88fca4d5aa6a0dca0000dbc64b0acbdb`, matching the draft's own reported hash)
via independent form-feed page-counting, rendered at 300dpi as a full page
(directly legible without further cropping) and again at 400dpi with a
dedicated 2.5×-upscaled crop of the qualification column for Blocks 5–7.

- **Block 0** (row "0" through 0.6.2): every row carries a single **★**.
  Composition independently re-counted directly from the full-page image:
  0.1.1–0.1.4 (4), 0.2.1–0.2.3 (3), 0.3.1–0.3.3 (3, **0.3.2 present**),
  **0.4 contains only 0.4.1** (0.4.2/0.4.3 both absent — the table jumps
  directly from "0.4 Comprendre l'importance de la classification et de
  l'emballage" to its single leaf 0.4.1, with no gap in the visible row
  sequence), 0.5.1–0.5.3 (3), 0.6.1–0.6.2 (2). **Count: 4+3+3+1+3+2 = 16,
  confirmed exactly**, matching the draft's own total and its stated
  composition-route.
- **Block 5** ("Acceptation des bagages des passagers et des membres
  d'équipage"): the bare top-level "5" row is confirmed blank (no star). Only
  sub-block **5.2 "Accepter les bagages"** appears (no 5.1 row at all); its
  own row and both of its leaves (5.2.1, 5.2.2) each carry a clearly distinct
  **★★★** — three individually countable star glyphs, confirmed at 400dpi in
  the dedicated crop. **5.2.3 is confirmed absent** — the table's row
  sequence goes directly from 5.2.2 to Block 6's own header row, with no
  intervening 5.2.3 row. **Count: 2, confirmed.**
- **Block 6** ("Transport du fret et des bagages"): the bare top-level "6"
  row is confirmed blank. Only sub-block **6.2 "Gérer les marchandises
  dangereuses avant et pendant le vol"** appears; its own row, **6.2.1**, and
  **6.2.3** each carry a clearly distinct **★★★**, confirmed in the same
  400dpi crop, sitting immediately below Block 5's own triple-star rows in
  one continuous image. **6.2.2, 6.2.4, and 6.2.5 are all confirmed absent**
  — the row sequence goes 6.2 → 6.2.1 → 6.2.3 → Block 7's header row directly,
  with no intervening rows. **Count: 2, confirmed.**
- **Block 7** ("Collecte de données pour la sécurité"): the bare top-level
  "7" row is confirmed blank. 7.1, 7.2, 7.3, 7.4 each carry exactly **one**
  star glyph, confirmed unambiguously in a dedicated further-cropped,
  2.5×-upscaled close-up showing all four rows' single stars in isolation
  with clear surrounding whitespace and no adjacent second star anywhere —
  the same specific check this task brief asked to be re-confirmed given the
  prior cross-session SOURCE CONFLICT on this exact page (already resolved
  2026-08-25 per the draft's own note 10, and independently re-confirmed
  again here, a fifth independent render of this page in this program's
  history). **Count: 4, confirmed — single star (★), not ★★.**
- **Total: 16 + 2 + 2 + 4 = 24, confirmed independently**, matching the
  draft's own total exactly. The "inconsistently populated" top-level
  block-row formatting (Block 0's own "0" row carries a star matching its
  children; the bare "5", "6", "7" block-name rows are all blank even though
  their own children are individually rated) is also independently confirmed
  exactly as the draft describes it.

**Page-boundary check independently re-confirmed:** PDF page 34 (printed
page 30) was independently re-rendered at 200dpi and found to contain
TABLEAU 7.8.A in full ("7.8 Fonction : Agents des opérations aériennes et
régulateurs de vols"), and PDF page 36 (printed page 32) was independently
re-rendered and found to open TABLEAU 7.10.A ("7.10 Fonction : Personnel
chargé de contrôler les passagers et les membres d'équipage") — confirming
TABLEAU 7.9.A occupies exactly one page and does not overflow in either
direction, exactly as the draft states.

## (b) 0.2.1/0.2.2 wording diff vs Function 7.5 — CONFIRMED by direct side-by-side image comparison

Independently located and rendered Function 7.5's own TABLEAU 7.5.A at PDF
page 31 (printed page 27) of the identical, MD5-matched Training Guidance
document, at 300dpi, and read it directly rather than re-quoting
`docs/DGR_STAGE1_FUNCTION_7.5_DRAFT.md`'s own prose.

- **Function 7.5's own 0.2.1** reads **"Développer un flair pour les
  marchandises dangereuses cachées"** — confirmed by direct visual read of
  the freshly rendered page, using "cachées" where the standard wording
  across most other functions uses "interdites".
- **Function 7.9's own 0.2.1** (from the part (a) render above) reads
  **"Développer un flair pour les marchandises dangereuses interdites"** —
  the standard wording, **not** matching Function 7.5's own outlier phrasing.
- **Function 7.5's own 0.2.2** reads **"Reconnaître les marchandises
  dangereuses potentiellement cachées"** — the full wording including
  "dangereuses".
- **Function 7.9's own 0.2.2** (from part (a)) reads the identical
  **"Reconnaître les marchandises dangereuses potentiellement cachées"** —
  matching Function 7.5's own 0.2.2 exactly.
- **Independent confirmation of the composition-route match**: Function
  7.5's own Block 0, re-counted directly from this fresh render, is also 16
  items via the identical route (0.3.2 present, 0.4 reduced to only 0.4.1),
  and its own Block 7 is also uniform single-star (★) — both independently
  re-confirmed from Function 7.5's own table image in this pass, not assumed
  from its own draft's prose.

**Confirmed exactly as the draft states**: Function 7.9 shares Function
7.5's Block 0 count and composition-route, and shares 7.5's own 0.2.2 exact
wording, but does **not** reproduce 7.5's own outlier "cachées" wording at
0.2.1 — it uses the standard "interdites" phrasing instead. Two functions
sharing an identical leaf count and structural route can still diverge in
one leaf's exact wording while agreeing on an adjacent one — independently
re-derived from both functions' own rendered table images, not copied
forward from either draft's own citation.

## (c) The "Cadre CBTA" matrix for 7.9 actively describes the WRONG function — CONFIRMED, word for word

Independently re-extracted `PACK COMPLET FORMATION CBTA - FONCTION 7.9/📁
09_Cadre_CBTA/📁 09_Cadre_CBTA.docx` (MD5 `8dccd6d4aa5cbf5274d27a64b91549f7`)
from `Archive.zip` via `textutil -convert txt`, and read the full resulting
text (5,448 bytes plain text).

Confirmed word-for-word:

- Headed **"MATRICE DES COMPÉTENCES FONCTION 7.9"**, with the very next line
  reading **"Référence : Table 1.5.A du DGR IATA - Expéditeur de
  marchandises dangereuses"** — describing Function 7.1's shipper/consignor
  role, not Function 7.9's cabin-crew role, exactly as the draft states.
- Its own closing "RÉSUMÉ EXÉCUTIF" section independently re-located and
  re-read, confirmed to state verbatim: **"Ce pack complet de formation
  CBTA pour la Fonction 7.9 (Expéditeur de marchandises dangereuses) répond
  intégralement aux exigences réglementaires IATA DGR et OACI."**
- Its five listed "Compétences spécifiques Fonction 7.9" are independently
  re-confirmed verbatim: "Classification marchandises dangereuses",
  "Sélection emballages et instructions", "Marquage et étiquetage
  réglementaire", "Remplissage DGD (Dangerous Goods Declaration)",
  "Coordination avec transporteurs" — plus a sixth, "Signalement incidents
  et anomalies", present in the task table but not repeated in the draft's
  own quoted five-item list (a minor completeness note, not a substantive
  correction — the draft's own characterization of "all shipper-side
  competencies, none of which describe a cabin crew's actual duties" remains
  accurate for all six).
- Independent keyword count of the full extracted text: **"cabine" = 0,
  "PNC" = 0, "passager" = 0, "bagage" = 0, "Expéditeur" = 5, "1.5.A" = 2** —
  matching the draft's own reported zero/five counts exactly.
- Its "ALIGNEMENT RÉGLEMENTAIRE" table is independently re-confirmed to
  mislabel Function 7.9 itself as **"7.9 | Expéditeur"** in its own
  function-code list, alongside 7.1 "Agent acceptation", 7.2 "Agent fret",
  7.3 "Personnel chargement" — an internally self-contradictory function-code
  mapping (these labels do not match this program's own independently
  derived findings for 7.1/7.2/7.3 either), a minor corroborating finding not
  previously called out in the draft, consistent with, not contradicting,
  its "must never be treated as ground truth" conclusion.

**Confirmed: this document contributes zero usable Stage 1 evidence and must
continue to be treated as unreliable**, exactly as the draft concludes — a
fifth confirmed-wrong instance in this program (after 7.4, 7.6, 7.8, and, by
the draft's own count, this is the fourth wrong-function Cadre CBTA finding
independently authored for 7.9, consistent with 7.10's own separately
packaged fifth instance).

## (d) 6.2.3 major partial SOURCE GAP — CONFIRMED by independent keyword search and direct reading of Exam Q20/Practice Q20

**Keyword search, independently re-run (joined-text, whitespace-normalized,
case-insensitive) across the full 120-slide course:**

| Term | Independent hit count | Location(s) |
|---|---|---|
| "extincteur" | 1 | p.66, unrelated Exploitant-property list item ("Extincteurs") |
| "feu" (standalone) | 0 | — |
| "fumée" | 2 | p.13 (generic chemical-hazard definition), p.59 (hidden-DG "emballage générant de la fumée" recognition cue) — **neither is a fire-response procedure** |
| "confinement" | 0 | — |
| "PAN PAN" | 0 | — |
| "MAYDAY" | 0 | — |
| "livre rouge" | 0 | — |
| "couverture anti-feu" | 0 | — |
| "sac de confinement" | 0 | — |

**Confirmed exactly as the draft states** (its own combined "feu"/"fumée": 2
hits" figure is independently reproduced exactly). The only course-taught
emergency-response content, independently re-located at p.107–110, is the
generic 4-step initial-response procedure (aviser son supérieur / identifier
la MD si possible / isoler le colis / éviter le contact) and the separate
5-step spill/body-contact response (laver à l'eau / retirer les vêtements
contaminés / ne pas manger-boire-fumer / ne pas toucher les yeux-bouche-nez /
appeler un médecin) — independently re-read in full, confirmed to contain no
fire/smoke/radio-communication content whatsoever.

**Exam Q20 independently re-located and read in full** (course p.7–8 of the
exam PDF): a full four-part scenario — passenger's UN3481 lithium-ion laptop
producing smoke/sparks at 35,000 ft, cabin mid-flight, full passenger load;
sub-questions ask (1) which specific fire-fighting materials to use
(**"Extincteur à poudre sèche, couverture anti-feu et sac de confinement"**
is the keyed correct answer, all three items independently confirmed named
in the scenario's own setup text), (2) what the PNC should do to prevent
fire spread, (3) what notification procedure to follow (**"Informer
immédiatement le commandant de bord et suivre les procédures de l'équipage
pour incendie cabine"**), and (4) the ultimate safety measure if the fire
cannot be controlled (**"Déclarer une urgence (PAN PAN / MAYDAY) et
envisager un atterrissage prioritaire"**) — plus a fifth, follow-up
reporting sub-question. **Confirmed word for word against the draft's own
description.**

**Practice Q20 independently re-located and read in full**: **"Quelles sont
les étapes de la procédure en cas de fumée suspecte provenant d'un bagage
cabine ?"** — an open-ended question, confirmed exactly as the draft states,
and confirmed to be the practice book's own final (20th) item.

**Confirmed: this is the single most consequential coverage gap in Function
7.9's material** — the leaf carries this function's highest qualification
level (★★★) and both assessment instruments' own capstone/final items test
content (specific fire-fighting equipment, cabin-crew fire coordination,
PAN PAN/MAYDAY emergency declaration) with zero traceable course-slide
backing anywhere in the 120-slide deck, exactly as the draft concludes.

## (e) 0.3.2 "Comprendre les responsabilités des passagers" — CONFIRMED SOURCE GAP

Independent joined-text search for "responsab" across the full 120-slide
course returns **8 hits**, individually re-located and read: one table-of-
contents-style topic heading ("Identifier les rôles et responsabilités"),
one generic "Exigence légale / Responsabilité (Réglementation)" framing
statement (p.16), the shipper's own 9-item DGR 1.3 duty wheel (p.65, 2 hits),
the operator's own 8-item DGR 1.4 duty wheel (p.65–66, 2 hits), the training
DGR 1.5 slide (p.67), and the operator's own emergency-information duty
(p.107, "Responsabilités de l'exploitant"). **Zero of the 8 hits co-occur
with "passager"** — every one is tied to shipper (Expéditeur) or operator
(Exploitant) obligations, and the passenger-facing slides that do exist
(pp.36–52, per the draft's own citation) teach what passengers may carry,
not their own responsibilities. **Confirmed exactly as the draft states —
fifth consecutive function (after 7.5, 7.6, 7.7, 7.8) with this identical
gap.**

## (f) Four "over-teaching beyond the table" findings — all CONFIRMED by direct content spot-check

1. **Captain-notification/5.2.3-style content (Exam Q6, Practice Q5),
   despite 5.2.3 being absent from 7.9's own table.** Exam Q6 independently
   re-located and read in full: reduced-mobility passenger's lithium-battery
   electric wheelchair scenario, four sub-questions, the fourth reading
   verbatim **"Le commandant de bord doit-il être informé de l'emplacement
   de la chaise roulante ? □ Oui □ Non."** Practice Q5 independently
   re-located and read in full: **"Le commandant de bord doit être informé
   de l'endroit où un fauteuil roulant avec batterie installée est chargé
   dans l'avion. a) Vrai b) Faux."** Both confirmed word for word against
   the draft's description; TABLEAU 7.9.A's own row sequence (part (a)
   above) independently reconfirms no 5.2.3 row exists anywhere in Function
   7.9's own table.
2. **Packing groups (0.4.2-equivalent content), taught p.74, tested by Exam
   Q7 and Practice Q12, despite 0.4 being reduced to only 0.4.1.** Course
   p.74 independently re-located and read in full: "Groupes d'emballage DGR
   3.0.3" slide, Groupe I/II/III degree-of-danger table. Exam Q7 and
   Practice Q12 both independently re-located, confirmed near-identical in
   wording (**"Énumérez les groupes d'emballage correspondants pour les
   degrés de danger suivants"**, grand danger/danger moyen/danger mineur).
   Confirmed exactly as the draft states, and TABLEAU 7.9.A's own row
   sequence (part (a)) independently reconfirms 0.4.2 does not exist in
   Function 7.9's own table.
3. **Radioactive-materials/Transport-Index content (p.98–102), tested by
   Exam Q5 and Practice Q17.** Course p.98–99 independently re-located and
   read, confirming category I-Blanc/II-Jaune/III-Jaune loading-restriction
   content and Transport Index framing (fuller detail through p.102, per the
   draft's own citation, not separately re-transcribed here). Exam Q5
   independently re-located: **"Une expédition de matières radioactives
   avec un TI 3.2, peut-elle être acceptée pour le transport sur un avion
   passager vers les Etats-Unis pour un traitement médical ?"** Practice Q17
   independently re-located: **"Quelle unité est utilisée pour définir les
   distances minimales de séparation des matières radioactives ? ... c)
   Indice de transport"**. Confirmed exactly as the draft states — no 6.2.2
   ("Interpréter la NOTOC") leaf exists in Function 7.9's own table to anchor
   this content to, independently reconfirmed by part (a)'s own row count.
4. **Lithium-battery physical-loading precautions (Practice Q7), with no
   Block 4 leaf to attach to.** Practice Q7 independently re-located and
   read in full: **"Quelles précautions doit en prendre lors du chargement
   d'équipements électroniques équipés de batteries en lithium ? ... b)
   S'assurer que les batteries en été isolés de l'équipement et que les
   contacteurs (cosses) soient isolés par un ruban adhésifs... c) Séparer
   les batteries les unes des autres pour éviter tout contact pouvant créer
   une étincelle."** Confirmed exactly as the draft states; no Block 4
   exists anywhere in Function 7.9's own table (independently reconfirmed —
   TABLEAU 7.9.A's row sequence in part (a) contains no Block 4 rows at
   all).

## (g) Practice book MD5 — CONFIRMED genuinely distinct from all 9 other functions

Independently re-derived MD5s for every function's own practice book,
rebuilt from scratch (not copied from the draft's own table):

| Function | Practice-book MD5 (independently re-derived) |
|---|---|
| 7.1 | `20c06b5481669957131185b12afd86ad` |
| 7.2 | `7dee3dcf6b644daf29954770e6971928` |
| 7.3 (misfiled — 7.1's own file, independently reconfirmed) | `20c06b5481669957131185b12afd86ad` |
| 7.4 | `3e75aa010e214c98673ee88d8ab174f2` |
| 7.5 | `f40262cc4478e48782a2cdd7541045a2` |
| 7.6 | `80cf42f32ea1276ba5f07887990d0e3b` |
| 7.7 | `8230dd60c4ad1a6e684d56bdc1dda8f6` |
| 7.8 | `7c66b841b9e6c5f4aafe5c7ac897cc3c` |
| **7.9** | **`43be30eb9aca670946e1f0da2766db3c`** |
| 7.10 | `cf300e211bd43d8a720108e8713ca182` |

**Every hash matches the draft's own reported table exactly.** Function
7.9's own hash matches none of the other nine, independently reconfirming
the "correctly filed, genuinely distinct" finding — its own title page
("Equipage de cabine") and question content (PNC-specific open question at
Q9, wheelchair-battery/captain-notification T/F at Q5, cabin-baggage-smoke
open question at Q20) are self-consistently this function's own cabin-crew
material, independently re-read in full during this pass.

## (h) DGR 4.2 vs. DGR 2.1 citation note — CONFIRMED to exist, but REFINED

**Independent re-check of Function 7.9's own course, p.39–40**: confirmed
verbatim, both slides of the two-slide "Marchandises dangereuses interdite
en toute circonstance" treatment cite **DGR 4.2** (p.39: "DGR 4.2"; p.40:
repeated title slide, "DGR 4,2" — an OCR-rendered comma standing in for a
period, the same citation repeated, not a second distinct one).

**Independent re-check of Function 7.5's own course, p.36–38 — NOT simply
"DGR 2.1"; the correction.** The draft's own SOURCE GAP note 8 states
"Function 7.5's own course... cites 'DGR 2.1' for the identical concept,"
which a reader could take to mean Function 7.5's course cites *only* DGR
2.1, in a clean, one-for-one conflict with 7.9's DGR 4.2. Direct extraction
of Function 7.5's own course PDF (independently re-opened this pass, not
assumed from `docs/DGR_STAGE1_FUNCTION_7.5_DRAFT.md`'s own prose) finds
Function 7.5 also runs the identical two-slide treatment of this topic: **p.
37 cites "DGR 2.1"**, and **the very next slide, p.38 (a repeated title
slide, the same pattern as 7.9's own p.39–40 pair), cites "DGR 4.2"** — i.e.
**Function 7.5's own course cites both DGR 2.1 and DGR 4.2** across its
two-slide pair, not DGR 2.1 alone.

**Refined finding**: the two functions' courses do not disagree on a single
citation for a single slide — they agree on the *second* slide's citation
(both read "DGR 4.2") and diverge only in that Function 7.5's *first* slide
carries an additional "DGR 2.1" citation that Function 7.9's own first slide
(p.39, also headed "Marchandises dangereuses interdite en toute
circonstance") does not reproduce (7.9's p.39 already reads "DGR 4.2", not
"DGR 2.1"). This is a narrower, more precisely characterized inconsistency
than the draft's own prose could be read to suggest, though the underlying
conclusion — an unresolved, Tier B, cross-deck citation discrepancy that
must be checked during a future Tier A pass, not silently resolved here — is
unchanged. **`docs/DGR_STAGE1_FUNCTION_7.9_DRAFT.md`'s SOURCE GAP note 8 is
corrected accordingly** (see the corresponding edit made to that file).

## Additional independent spot-checks performed this pass

- `pdfinfo` confirms the course PDF is 120 pages, the exam PDF is 8 pages,
  and the practice book is 8 pages — all matching the draft's stated counts
  exactly.
- Course title slide (p.1) independently re-confirmed verbatim:
  "Règlementation pour le transport des marchandises dangereuses. (DGR IATA
  CBTA - Fonction 7.9) Equipage de cabine", instructor "Boufas Yasmina",
  dated 02/09/2025.
- Course p.3's own CBTA-concept worked example independently re-confirmed to
  read **"Exemple : Fonction 7.6 pour personnel de cabine"** — the minor
  course-authoring-error finding (should read "Fonction 7.9") — confirmed
  exactly as the draft describes it, cosmetic only.
- Course p.25 independently re-confirmed to read **"66ème Edition"** —
  confirming the course's own DGR 66th Edition baseline, not the repo's
  current 67th Edition/Addendum-1 standard.
- Course p.65–67 (the shipper DGR 1.3 / operator DGR 1.4 / training DGR 1.5
  role wheels) independently re-read in full: confirmed no PNC-specific role
  statement exists anywhere in this slide range, supporting the draft's
  0.3.1/Practice Q9 partial-gap finding (Practice Q9 independently
  re-located: **"Quelles sont les principales responsabilités du PNC
  vis-à-vis des marchandises dangereuses ?"**, confirmed word for word).
- Training Guidance PDF MD5 (`88fca4d5aa6a0dca0000dbc64b0acbdb`) confirmed
  identical across Function 7.9's own folder and Function 7.5's own folder,
  independently re-verified — the same document used for both functions'
  own table cross-checks.

## Outcome

**CONFIRMED, with one non-substantive precision correction** — no error
requiring a structural or count change was found in
`docs/DGR_STAGE1_FUNCTION_7.9_DRAFT.md`'s 24-leaf-sub-task enumeration, its
Block 0/5.2/6.2/7 structure, its star ratings (★ Block 0, ★★★ Block 5.2, ★★★
Block 6.2, and specifically the already-resolved single-★ Block 7 —
independently re-confirmed a fifth time), the Block 0 composition-route
match to Function 7.5 with the non-verbatim 0.2.1 wording, the Cadre CBTA
wrong-function finding, the major partial 6.2.3 SOURCE GAP, the 0.3.2 SOURCE
GAP, the four over-teaching-beyond-the-table findings, or the practice-book
distinctness finding. **One correction was made**: the DGR 4.2/DGR 2.1
citation note (SOURCE GAP note 8) is refined to state that Function 7.5's
own course cites both DGR 2.1 and DGR 4.2 across its own two-slide
treatment, not DGR 2.1 alone — narrowing, not resolving, the underlying
Tier B citation discrepancy.

**No new cross-function SOURCE CONFLICT was found in this pass.**
`docs/DGR_STAGE1_FUNCTION_7.9_DRAFT.md` may now be treated as
**cross-validated** (second pass complete) and is the basis for the Stage 2A
blueprint in `docs/DGR_STAGE2A_FUNCTION_7.9_BLUEPRINT.md`. It remains
**not** reviewed by a qualified instructor, **not** accepted by ANAC, and
**not** Tier A–verified against the current 67th Edition/Addendum 1 text
(the course is confirmed built on the 66th Edition) — those gates are
unaffected by this pass and remain open.
