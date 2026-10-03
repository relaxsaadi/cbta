# DGR Stage 1 — Function 7.6 — SECOND-PASS CROSS-VALIDATION — CONFIRMED

**Verdict: CONFIRMED.** An independent second pass re-read the same source
files cited in `docs/DGR_STAGE1_FUNCTION_7.6_DRAFT.md` (the first-pass Stage
1 draft) — including direct visual inspection of the rendered TABLEAU 7.6.A
PDF page at 300dpi (full page) and 400dpi (dedicated, further-upscaled
crops isolating just the star-rating column, produced specifically because
the task brief flagged a genuine cross-session single-star/double-star
misread already found and corrected once in this program on a nearby page
of the same source document — treated as high-stakes, not routine), MD5
checksums of every disputed/cross-referenced file, an independent render of
TABLEAU 7.4.A for the complementary-role structural check, targeted
`grep`/joined-text keyword searches of the 140-slide course, the
20-question exam, and the 20-question practice book, and a full independent
re-extraction of the "Cadre CBTA" matrix's raw XML. Every load-bearing claim
in the draft is verified accurate. **No correction** to the 28-leaf-sub-task
enumeration, the block structure, the star ratings, the two SOURCE GAPs, or
the 0.4.3/4.1.1 thin-evidence notes is required.

This file does not replace `docs/DGR_STAGE1_FUNCTION_7.6_DRAFT.md`; it
records the independent second pass against it, per the same two-pass
discipline Functions 7.1, 7.3, 7.4, and 7.5 used (draft → corrected/confirmed
final).

## Method

All checks performed directly against the same folder the draft cites:
`/Users/mac/Documents/Fichiers/Algerie/CBTA final/yasmine cbta/wetransfer_supports-pedagogiques-dgr-cbta-kost-academy_2025-10-12_1842/COURS DGR-CBTA-IATA/DGR-FONCTION 7.6/`.

- `md5` on the course, exam, practice book, and Training Guidance PDF,
  compared against the draft's own reported hashes and, for the practice
  book, independently re-compared against all nine other functions'
  practice-book MD5s already on disk (7.1, 7.2, 7.3, 7.4, 7.5, 7.7, 7.8, 7.9,
  7.10).
- `pdftotext -layout` full extraction of the 140-slide course, the
  20-question exam, and the 20-question practice book, with an `awk`
  form-feed page counter, cross-checked against every page citation the
  draft makes.
- `pdftoppm -r 300` and `-r 400` rendering of the IATA "Orientations"/
  "Training Guidance" PDF page carrying TABLEAU 7.6.A (located independently
  via `pdftotext` form-feed page-counting at PDF page 32/printed page 28,
  exactly as the draft states), viewed first as a full page, then as a
  dedicated, 2×-upscaled crop of just the star-rating column, split into
  three vertically-overlapping segments so every row from the top-level "0"
  row through 7.4 could be read individually at high confidence.
- `pdftoppm -r 200` rendering of PDF page 33 (TABLEAU 7.7.A) to independently
  re-confirm Table 7.6.A does not continue onto a second page.
- `pdftoppm -r 200` rendering of PDF pages 29–30 (TABLEAU 7.4.A, located via
  the same form-feed page count against the identical Training Guidance
  document already on disk in this function's own folder — confirmed by MD5
  to be the same file used for 7.1–7.5) to independently verify the
  complementary-role structural claim against Function 7.4's own official
  table, not merely re-quote the 7.4 draft's prose.
- Extraction of `word/document.xml` from the "Cadre CBTA" `.docx` found
  inside `Archive.zip`'s Function 7.6 folder, independently re-extracted via
  both `textutil` and a raw XML tag-strip, read in full.
- Joined-text (whitespace-normalized) regex search of the course, exam, and
  practice book for every keyword the draft's SOURCE GAP notes depend on
  (`entreposage`, `transmettre`, `transmission`, `primaire`, `subsidiaire`,
  `responsab`, `agent des opérations`, `régulateur de vols`, `urgence`),
  deliberately including a joined-text pass (not just per-line `grep`) after
  discovering that "agent des opérations aériennes" is split across two
  physical lines by the PDF's own line-wrapping at p.122 — a per-line `grep`
  alone would have produced a false negative on this exact phrase.

## (a) TABLEAU 7.6.A content and star-rating column — CONFIRMED, including the specific single-star/double-star/triple-star distinctions

Located TABLEAU 7.6.A at PDF page 32 (printed page 28) of
`12_IATA_CBTA_Dangerous_Goods_Training_Guidance_Edition1_2023_FR.PDF`
(MD5 `88fca4d5aa6a0dca0000dbc64b0acbdb`, matching the draft's own reported
hash) via independent form-feed page-counting, rendered it at 300dpi and
400dpi, and read it directly — first as a full page, then via a further
upscaled crop isolating just the star-rating column, split into three
vertically-overlapping segments for row-by-row reading.

- **Block 0** (row "0" through 0.6.2): every one of the 18 leaf rows, every
  sub-block header row (0.1–0.6), and the top-level "0" row itself carries a
  single **★**. Verified individually in the high-resolution star-column
  crop — no row in Block 0 shows two or three stars. Composition confirmed
  exactly as the draft states: 0.1.1–0.1.4 (4), 0.2.1–0.2.3 (3), 0.3.1–0.3.3
  (3, including 0.3.2 present and active), 0.4.1–0.4.3 (3), 0.5.1–0.5.3 (3),
  0.6.1–0.6.2 (2). **Count: 4+3+3+3+3+2 = 18, confirmed.**
- **Block 4** ("Gestion du préchargement du fret"): the top-level "4" row is
  confirmed **blank** (no star), while "4.1 Planifier le chargement" and its
  two leaves (4.1.1, 4.1.2), and "4.3 Émettre une NOTOC" and its three leaves
  (4.3.1, 4.3.2, 4.3.3), each carry a clearly distinct **★★★** — three
  separate, individually countable star glyphs on every one of those eight
  rows, confirmed in the same high-resolution crop. **4.2 confirmed absent**
  — the table jumps directly from 4.1's rows to 4.3's header row, with no
  intervening 4.2 row of any kind. **Count: 5 leaves (4.1.1, 4.1.2, 4.3.1,
  4.3.2, 4.3.3), confirmed.**
- **Block 6** ("Transport du fret et des bagages"): the top-level "6" row
  and the "6.1 Charger l'aéronef" sub-block row are both confirmed **blank**
  (no star each), while the single leaf **6.1.6** carries a clearly distinct
  **★★★**, immediately following the two blank rows in the cropped image —
  ruling out any ambiguity about which row the triple star belongs to. No
  other 6.1.x row, no 6.2, no 6.3 appears anywhere in the table. **Count: 1,
  confirmed.**
- **Block 7** ("Collecte de données pour la sécurité"): the top-level "7"
  row is confirmed **blank**, and 7.1, 7.2, 7.3, 7.4 each carry a clearly
  distinct **★★**, immediately following Block 6's unambiguous triple star in
  the same cropped image — so the double-star reading is directly
  adjacent-compared against the triple-star reading in a single crop, not an
  artifact of a different rendering pass. **This is the specific comparison
  the task brief asked to be re-verified with extra care, given the genuine
  single-star/double-star correction already made once in this program on a
  nearby page of the same document — independently reconfirmed here at
  400dpi with a dedicated close-up crop showing the ★★★→★★ transition
  directly: Block 7 is ★★, not ★ and not ★★★.** Count: 4, confirmed.
- **Total: 18 + 5 + 1 + 4 = 28, confirmed independently**, matching the
  draft's own total exactly. The block-level blank-row pattern (0's row
  rated, 4/6/6.1/7's rows blank) is also independently confirmed exactly as
  the draft describes it — an observed IATA-table formatting characteristic,
  not a smoothing error.

**PDF page 33 independently re-rendered** (200dpi) and confirmed to open a
fresh "TABLEAU 7.7.A — Fonction : Équipage de conduite" table with its own
"Fonction : Équipage de conduite" column header (not "Personnel responsable
de planifier le chargement des aéronefs"), confirming Table 7.6.A does not
continue onto a second page, exactly as the draft states. This same
rendering also independently corroborates two secondary claims already in
the draft without needing to re-open them separately: Function 7.7's own
Block 0 is also 18 items with 0.3.2 present, and its own 0.2.2 wording
reads "Reconnaître les marchandises **dangereuses** potentiellement
cachées" — one word longer than 7.6's own 0.2.2 ("Reconnaître les
marchandises potentiellement cachées") — independently reconfirming the
minor wording-variant finding the draft records as unique to Function 7.6.

## (b) Block 0 has 18 items, activates 0.3.2, no numbering gap — CONFIRMED

Directly visible and counted in the same rendered table image: 0.1 (4
items), 0.2 (3 items), 0.3 (3 items, **0.3.2 "Comprendre les responsabilités
des passagers" present** between 0.3.1 and 0.3.3), 0.4 (3 items), 0.5 (3
items), 0.6 (2 items) = **18, with no gap anywhere in the numbering
sequence** — independently re-tallied row by row from the full-page image,
not merely re-asserted from the draft's own table. This is a genuine
structural difference from 7.1/7.2/7.3 (17 items, 0.3.2 skipped) and from
7.4 (16 items, 0.3.2 skipped and 0.5.3 absent), confirmed directly, matching
the draft's claim exactly.

## (c) The "Cadre CBTA" matrix for 7.6 actively describes the WRONG function — CONFIRMED

Independently re-extracted `PACK COMPLET FORMATION CBTA - FONCTION 7.6/📁
09_CADRE_CBTA/📁 09_CADRE_CBTA.docx` (MD5 `d0f8b38f7a79c22b13d200f2c344c687`)
from `Archive.zip`, via two independent methods (`textutil -convert txt` and
a raw `word/document.xml` tag-strip), and read the full resulting text.

Confirmed word-for-word:

- Headed **"MATRICE DES COMPÉTENCES FONCTION 7.6 — ALIGNEMENT AVEC LA TABLE
  1.5.A DGR IATA"** (the "Table 1.5.A" citation is confirmed present exactly
  once, in this header line itself — there is no separate "Spécificités
  réglementaires" section in this particular document, unlike the
  equivalent 7.4/7.5 Cadre CBTA files, but the wrong-table citation is
  present and identical in substance).
- Its own definition box reads: **"FONCTION 7.6 - PERSONNEL DE L'EXPÉDITEUR
  (Shipper's Personnel) — Personnel responsable de la préparation des
  marchandises dangereuses pour l'expédition par voie aérienne, incluant la
  classification, l'emballage, le marquage, l'étiquetage et la
  documentation"** — confirmed verbatim, and confirmed to be Function 7.1's
  job description, not Function 7.6's load-planning role.
- Its four competency headings are independently re-confirmed verbatim:
  "COMPÉTENCE 1 : CLASSIFICATION ET IDENTIFICATION", "COMPÉTENCE 2 :
  EMBALLAGE ET CONDITIONNEMENT", "COMPÉTENCE 3 : MARQUAGE ET ÉTIQUETAGE",
  "COMPÉTENCE 4 : DOCUMENTATION" (this fourth section's table body is
  truncated in the underlying file itself, right after its header row — an
  independent finding not previously recorded, noted below, but irrelevant
  to the wrong-function conclusion since the first three sections alone
  already fully confirm it).
- A keyword search of the full independently re-extracted text confirms
  **zero occurrences** of "chargement", "planification", "NOTOC",
  "compartiment", or "séparation" — the same five-word check the draft
  performed, independently re-run here with the same zero-hit result.

**New, minor finding not previously recorded (does not change the
conclusion):** the underlying `.docx` file's own Compétence 4 (Documentation)
table is truncated mid-table in the source file itself — it ends right after
the "TÂCHE / OBJECTIF / MÉTHODE / ÉVALUATION" header row, with no data rows
following. This is a property of the low-rigor document itself, not an
extraction artifact of this pass (confirmed by inspecting the raw
`document.xml`, which also ends at the same point) — recorded here as
corroborating evidence that this document class is low-quality/unreliable,
consistent with, not contradicting, the draft's overall "never treat as
ground truth" conclusion.

**Confirmed: this document contributes zero usable Stage 1 evidence and must
continue to be treated as unreliable**, exactly as the draft concludes.

## (d) Complementary-role finding vs. Function 7.4 — CONFIRMED, independently re-derived from Function 7.4's own table

Rather than only re-reading the 7.4 draft's prose, this pass independently
rendered **TABLEAU 7.4.A** (PDF pages 29–30, printed pages 25–26, located by
the same form-feed page-count method, in the identical Training Guidance
document already confirmed present in this function's own folder) at
200dpi and read it directly.

- **Function 7.4's own Block 4** is confirmed to contain **only** "4.1
  Planifier le chargement" (4.1.1, 4.1.2) and "4.2 Préparer la cargaison pour
  l'aéronef" (4.2.1–4.2.5) — there is **no "4.3 Émettre une NOTOC" sub-block
  anywhere in Function 7.4's own table.** Function 7.4's personnel are
  structurally never asked to issue a NOTOC.
- **Function 7.4's own Block 6** is confirmed to contain "6.1 Charger
  l'aéronef" with leaves 6.1.1–6.1.6, explicitly including **6.1.5
  "Vérifier que la NOTOC reflète la cargaison de l'aéronef"** (★★★) — a
  leaf that does not exist anywhere in Function 7.6's own table (confirmed
  absent in the part (a) re-count above, which finds only 6.1.6 under Block
  6). This directly, structurally confirms the draft's claim: **Function 7.6
  issues the NOTOC (its own Block 4.3), Function 7.4 only verifies an
  already-issued one (its own 6.1.5) — independently re-derived from both
  functions' own official tables, not merely re-asserted from either draft.**

**The 6.1.6 "fully covered vs. Function 7.4's confirmed partial gap" claim —
independently re-verified from course text, not just structural inference.**
A joined-text (whitespace-normalized) search of the 140-slide 7.6 course
finds the phrase **"agent des opérations"** exactly once, at course p.122:
*"Un exemplaire lisible des renseignements fournis au commandant de bord
doit être facile d'accès à l'agent des opérations aériennes, au personnel au
sol désigné qui est chargé des opérations aériennes jusqu'à l'arrivée du
vol."* A naïve per-line `grep` on this exact phrase returns **zero** hits,
because the PDF's own line-wrapping splits "l'agent" onto one line and "des
opérations aériennes" onto the next — this pass deliberately used a
joined-text search specifically to avoid that false negative, which a less
careful re-check could have missed. "Régulateur de vols" independently
confirmed to have **zero** occurrences anywhere in the 7.6 course (the only
"régulateur" hits are p.4's "régulateurs" [regulatory bodies, generic] and
p.48's "Régulateurs de carburant" [fuel pressure regulators, unrelated
hardware] — neither is the flight-dispatch role). Since sub-task 6.1.6's own
official wording is "...et l'agent des opérations aériennes **ou** le
régulateur de vols" (an "or," not an "and"), coverage of the "agent des
opérations aériennes" half alone is sufficient to satisfy the full official
sub-task — **independently confirmed complete, not partial, coverage**,
exactly as the draft concludes. This stands in direct, independently
verified contrast to Function 7.4's own course, where the already-published
`docs/DGR_STAGE1_FUNCTION_7.4_CROSSVALIDATION.md` documents a `grep`-verified
**zero** hits for "agent des opérations"/"régulateur de vols"/"dispatch"
anywhere in that function's own 155-slide course.

## (e) The two SOURCE GAPs and the 0.4.3 thin-evidence note — CONFIRMED

**4.3.3 "Transmettre au personnel s'occupant du chargement" — CONFIRMED full
SOURCE GAP.** Both a per-line `grep` and a joined-text search of the full
140-slide course for "transmettre" and "transmission" independently return
**zero** hits. The closest adjacent content remains p.122's accessibility
statement (quoted above under (d)), which describes downstream
*accessibility* to ground/flight-ops personnel, not the planner's own act of
*transmitting* the completed NOTOC to loading personnel specifically — a
distinct concept from 6.1.6's own (fully evidenced) informing-the-captain/
agent duty. Confirmed exactly as the draft states.

**4.1.1 "Déterminer les conditions d'entreposage" — CONFIRMED thin/adjacent
evidence, not a clean general match.** `grep`/joined-text search for
"entreposage" across the full course returns exactly **4** hits, independently
re-located at the same four points the draft cites: p.55 (one unelaborated
item, "Entreposage," in the Exploitant's eight-item duty wheel — shared
evidence base with 0.3.1), p.99 (the dry-ice-specific loading-arrangement
factor: "du type d'avion, du taux de renouvellement de l'air de l'avion, de
la méthode d'emballage et d'entreposage, de la présence ou non d'animaux à
bord"), and p.101 (two generic acceptance-to-planning handoff mentions
introducing the separation section). No dedicated general storage-conditions
slide (of the kind Function 7.4's course gives this identical sub-task,
independently confirmed already in `docs/DGR_STAGE1_FUNCTION_7.4_
CROSSVALIDATION.md`) exists anywhere in 7.6's own course. Confirmed exactly.

**0.4.3 "Envisager de multiples dangers" — CONFIRMED thin/adjacent evidence,
not a clean classification-stage match.** `grep`/joined-text search for
"primaire" and "subsidiaire" across the full course independently locates
exactly the three page numbers the draft cites — p.102 ("...qu'ils
s'agissent de risques primaires ou subsidiaires"), p.106 ("...risque
primaire ou subsidiaire"), and p.117 (NOTOC content-field list: "La classe
ou la division ou les risques subsidiaires") — plus one additional,
correctly-excluded hit at p.98 ("Primaires [non rechargeables] / Secondaires
[rechargeables]," a lithium-battery-chemistry distinction unrelated to
hazard-label primary/subsidiary risk, which the draft does not cite and this
pass confirms is rightly excluded). None of the three genuine hits teaches
*how to determine* a primary/subsidiary hazard at the classification stage;
all three are operational-context (separation/NOTOC) acknowledgements that a
package may already carry more than one hazard label. Practice Q9's
"Subsidiary Risk" multiple-choice definitional question independently
re-located and re-read in full, confirmed to read exactly as the draft
quotes it. Confirmed exactly, including the "slightly better anchored than
Function 7.4's identical finding, because of Practice Q9" nuance.

## Additional independent spot-checks performed this pass (not exhaustive, but load-bearing)

- Course PDF confirmed 140 pages via `pdfinfo`; exam PDF confirmed 7 pages;
  practice book confirmed 9 pages — all matching the draft's stated counts
  exactly. Exam metadata "Vous avez 45 minutes" and "Note de passage est :
  80%" independently re-confirmed verbatim.
- Course title slide (p.1) independently re-confirmed verbatim: "DGR IATA
  CBTA - Fonction 7.6 — Personnel chargé de la planification du chargement
  des aéronefs," instructor "Boufas Yasmina," dated 02/09/2025; slide 3
  independently re-confirmed to read "Exemple : Fonction 7.6 planificateur
  du chargement."
- Exam Q10 (hidden dangers: "Pièces de rechange d'avion," "COMAT," "Aliments
  surgelés") independently re-located and re-read in full, confirming the
  frozen-food example matches the course's own p.51 exercise, exactly as the
  draft's positive cross-function note states.
- Exam Q17 ("Quelle est la responsabilité du planificateur si une
  marchandise dangereuse apparaît sur le plan de chargement mais n'est pas
  reprise sur la NOTOC ?" — correct answer "Préparer une NOTOC amendé avant
  le départ"), Q19 (UN3373 Biological Substance Cat. B stowed with
  foodstuff), and Q20 (full NOTOC-completion exercise: UN1203 gasoline,
  UN1072 compressed oxygen, UN3373 biological substance, UN1845 dry ice, each
  with quantity/compartment given) all independently re-located and re-read
  in full, confirmed to match the draft's citations exactly, including the
  UN1845 dry-ice detail as the exam's fourth NOTOC line item.
- `grep -i "urgence"` independently re-run across both the full exam and the
  full practice book text: **zero** hits in either, independently
  reconfirming the draft's "0.6.1/0.6.2 taught but entirely untested by both
  instruments" finding — a first for this program.
- `grep -i "responsab"` independently re-run (joined-text) across the full
  course: 12 hits, every one tied to shipper (Expéditeur) or operator
  (Exploitant) duties/training, **none** to passenger responsibilities —
  independently reconfirming the 0.3.2 SOURCE GAP.
- Practice book MD5 (`80cf42f32ea1276ba5f07887990d0e3b`) independently
  re-derived and compared against all nine other functions' practice-book
  MD5s currently on disk (7.1 `20c06b5481669957131185b12afd86ad`, 7.2
  `7dee3dcf6b644daf29954770e6971928`, 7.3 `20c06b5481669957131185b12afd86ad`
  [the same as 7.1's, its own already-documented misfiling], 7.4
  `3e75aa010e214c98673ee88d8ab174f2`, 7.5 `f40262cc4478e48782a2cdd7541045a2`,
  7.7 `8230dd60c4ad1a6e684d56bdc1dda8f6`, 7.8
  `7c66b841b9e6c5f4aafe5c7ac897cc3c`, 7.9 `43be30eb9aca670946e1f0da2766db3c`,
  7.10 `cf300e211bd43d8a720108e8713ca182`) — Function 7.6's own hash matches
  none of them, independently reconfirming the draft's "correctly filed,
  genuinely distinct" finding.
- Course, exam, and Training Guidance PDF MD5s (`dc226430988c3441c506eca00
  fbbf9c4`, `5bfc0cba52879f2ee3a676be3ff65b31`, and
  `88fca4d5aa6a0dca0000dbc64b0acbdb` respectively) independently re-derived
  and confirmed to match the draft's own reported hashes exactly (where the
  draft reported them).

## Outcome

**CONFIRMED — no correction required to the 28-leaf-sub-task enumeration,
the Block 0/4/6/7 structure, the star ratings (including the specific ★
Block 0 / ★★★ Block 4 / ★★★ Block 6 (6.1.6 only) / ★★ Block 7 pattern, with
particular re-verified care on the ★★→★★★ and ★★★→★★ transitions), the
18-item non-gapped Block 0 finding, the wrong-function "Cadre CBTA" finding,
the NOTOC-issue-vs-verify complementary-role finding against Function 7.4's
own independently re-rendered table, the 6.1.6 full-coverage finding, or the
two SOURCE GAP findings (4.3.3, and — by extension — 0.3.2, already
independently reconfirmed under (b)/(e)) in
`docs/DGR_STAGE1_FUNCTION_7.6_DRAFT.md`.** One minor, non-substantive finding
is recorded above (the Cadre CBTA `.docx`'s own Compétence 4 table is
truncated mid-file in the source document itself) — it does not change any
count, mapping, or conclusion.

`docs/DGR_STAGE1_FUNCTION_7.6_DRAFT.md` may now be treated as
**cross-validated** (second pass complete) rather than first-pass-only, and
is the basis for the Stage 2A blueprint in
`docs/DGR_STAGE2A_FUNCTION_7.6_BLUEPRINT.md`. It remains **not** reviewed by
a qualified instructor, **not** accepted by ANAC, and **not** Tier
A–verified against the current 67th Edition/Addendum 1 text (the course is
confirmed built on the 66th Edition) — those gates are unaffected by this
pass and remain open.
