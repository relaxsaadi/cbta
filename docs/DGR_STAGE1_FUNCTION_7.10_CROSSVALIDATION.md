# DGR Stage 1 — Function 7.10 — SECOND-PASS CROSS-VALIDATION — CONFIRMED (two minor, non-substantive corrections)

**Verdict: CONFIRMED.** An independent second pass re-read the same source
files cited in `docs/DGR_STAGE1_FUNCTION_7.10_DRAFT.md` (the first-pass
Stage 1 draft) — including a fresh 300dpi full-page render of TABLEAU
7.10.A plus a dedicated 400dpi, 2×-upscaled star-column-only crop covering
every row from the top-level "0" through 7.3 in two continuous images
(produced with particular care on Function 7.10's own Block 7 rating, per
the task brief's explicit instruction not to assume it is automatically
fine just because the separate 7.9-related star-rating error is already
fixed), a dedicated crop of the full page area below row 7.3 extended to
the footer specifically to rule out a hidden/truncated 7.4, an independent
fresh render of Function 7.5's own TABLEAU 7.5.A page and Function 7.9's
own TABLEAU 7.9.A page (not a re-quote of either draft's own prose) for
direct side-by-side Block 0/Block 5 wording comparisons, an independent
`unzip`-located re-extraction of the "Cadre CBTA" matrix via two methods
(`textutil -convert txt` and a raw `word/document.xml` tag-strip) with a
word-boundary-consistent keyword count, an independently rebuilt
ten-function practice-book MD5 comparison table, and targeted joined-text
keyword re-searches of the 114-slide course, the 6-page/20-question exam,
and the 8-page/20-question practice book for every claimed SOURCE GAP and
title-vs-content finding. Every load-bearing structural claim in the draft
is **verified accurate**: the 23-leaf-sub-task enumeration, the Block
0/3/5/7 structure, all four star ratings (including Function 7.10's own
Block 7 single-★ rating — re-confirmed independently, not assumed), the
three distinct Block 0 wording variants vs. Function 7.5, the Block 5
sub-block 5.1-vs-5.2 distinction from Function 7.9, the Cadre CBTA
wrong-function finding, both SOURCE GAP/thin-evidence findings (0.3.2,
5.1.2), the DGR Part 1.7 over-teaching finding, and the p.68–69 role/
responsibility finding. **Two minor, non-substantive corrections are
recorded**: (1) the Cadre CBTA cross-check's own claim of "zero occurrences
of 'sûreté'" is imprecise — the word appears once, inside the document's
own internally self-contradictory function-mapping table (mislabeling
*Function 7.6*, not 7.10, as "Personnel sûreté / Contrôle sécurité"); (2)
the "fret et courrier" keyword count undercounts "fret" by one — the true
course-wide count is **5**, not 4, because course page 30 contains two
separate "fret" occurrences ("...intercompagnies de l'IATA-fret" and
"agents de fret"), not one. Neither correction changes the wrong-function
conclusion, the thin-freight-evidence conclusion, any Stage 1 leaf count,
or any SOURCE GAP finding.

This file does not replace `docs/DGR_STAGE1_FUNCTION_7.10_DRAFT.md`; it
records the independent second pass against it, per the same two-pass
discipline Functions 7.1, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, and 7.9 used
(draft → corrected/confirmed final). Function 7.10 is the **final
function** in the 7.1–7.10 program to receive this treatment.

## Method

All checks performed directly against the same folder the draft cites:
`/Users/mac/Documents/Fichiers/Algerie/CBTA final/yasmine cbta/wetransfer_supports-pedagogiques-dgr-cbta-kost-academy_2025-10-12_1842/COURS DGR-CBTA-IATA/DGR-FONCTION 7.10/`,
plus direct re-opens of Function 7.5's own folder, Function 7.9's own table
page (same Training Guidance document), and the low-rigor Cadre CBTA
archive (both on-disk copies).

- `md5` on all eleven files in the Function 7.10 source folder (course,
  exam, practice book, rubric, Training Guidance PDF, DGR 66th Edition
  Addendum, Table 2.3.A, ICAO Doc 10147, label reference sheet, and both
  videos), compared against the draft's own reported hashes — **all match
  exactly**.
- `pdftotext -layout` full-document scan of the Training Guidance PDF (with
  a Python form-feed page counter) to independently re-locate TABLEAU
  7.10.A, TABLEAU 7.5.A, and TABLEAU 7.9.A by page number, confirming PDF
  page 36 (printed page 32) for 7.10.A, PDF page 31 (printed page 27) for
  7.5.A, and PDF page 35 (printed page 31) for 7.9.A.
- `pdftotext -layout -f 37 -l 41` independent re-extraction of every page
  following TABLEAU 7.10.A, confirming page 37 opens "APPENDICE A —
  GLOSSAIRE" cleanly (no leftover 7.10 content) and pages 38–41 contain
  Appendice B (FEAC program description) — **directly confirming TABLEAU
  7.10.A is genuinely the last function table in the document and nothing
  is missed after it**, the task brief's own explicit instruction.
- `pdftoppm -r 300` full-page PNG render of PDF page 36, read directly,
  followed by an independent `pdftoppm -r 400` re-render with two
  purpose-built Pillow crops: (1) a full-height, 2×-upscaled isolation of
  the qualification-level (★) column spanning Block 0 through the start of
  Block 3/5, and (2) a second crop spanning Blocks 3/5/7 through the page
  footer, specifically to independently re-verify Function 7.10's own Block
  7 rating and to rule out a hidden/truncated 7.4 row — not merely
  re-reading the first full-page render.
- `pdftoppm -r 300` fresh, independent full-page renders of TABLEAU 7.5.A
  (PDF page 31) and TABLEAU 7.9.A (PDF page 35) from the identical,
  MD5-matched Training Guidance document sitting in Function 7.10's own
  folder — read directly for the Block 0 and Block 5 wording/structure
  comparisons, not copied from either function's own draft prose.
- `unzip -l` independent listing of
  `PACK COMPLET FORMATION CBTA - FONCTION 7.10.zip` (confirming its
  internal path and byte size), followed by independent extraction and
  full reading of its `09_Cadre_CBTA MATRICE DES COMPÉTENCES FONCTION
  7.10.docx` member via two separate methods (`textutil -convert txt` and
  a raw `word/document.xml` regex tag-strip, both methods' outputs
  cross-checked and found identical after whitespace normalization), plus
  an independent `md5` comparison of both on-disk copies of the zip
  (`.../Bureau_MacBookPro/...` and `.../Desktop_macbook_old_copy/...`),
  confirmed byte-for-byte identical.
- Word-boundary-consistent Python regex keyword counts (both extraction
  methods agreeing) for every term the wrong-function conclusion and the
  draft's own supporting counts depend on: "sûreté", "sécurité",
  "screening", "scanner", "contrôle de sécurité", "NOTOC", "chargement",
  "acceptation", "1.5.A", "agent de fret".
- `pdftotext -layout` full extraction of the 114-page course, 6-page exam,
  and 8-page practice book (page counts independently re-confirmed via
  `pdfinfo`, matching the draft's stated counts exactly), with per-page
  spot-reads for every page citation checked below, plus joined-text
  (whitespace-normalized) Python regex searches for every keyword the
  draft's SOURCE GAP/thin-evidence notes and the "fret et courrier" finding
  depend on ("fret", "courrier", "responsab", "approb", "approuv").
- Direct reading of course pages 1, 25, 30, 41, 45, 52–55, and 68–69 in
  full (not just the draft's own excerpted quotes) to independently verify
  the title-slide/regulatory-baseline metadata, the "fret" p.30 context,
  the 5.1.2 approval evidence, the DGR Part 1.7 security-plan content, and
  the p.68–69 role-and-responsibility slides.
- Independently rebuilt ten-function practice-book MD5 comparison table,
  re-derived from scratch directly against the files on disk for all of
  7.1–7.10 (not copied from the draft's own table).

## (a) TABLEAU 7.10.A structure and star-rating column — CONFIRMED, including Function 7.10's own Block 7 rating and the "genuinely last table" claim

Independently located TABLEAU 7.10.A at PDF page 36 (printed page 32) via
form-feed page counting, confirmed via both `pdftotext -layout` extraction
and a 300dpi full-page render (fully legible without cropping), followed by
a dedicated 400dpi/2×-upscaled star-column crop split into two overlapping
bands (Block 0, then Blocks 3/5/7) so every row could be read individually.

- **Block 0** (row "0" through 0.6.2, 25 rows: the top-level "0" row, six
  sub-block header rows 0.1–0.6, and 16 leaf rows): every row — including
  the top-level "0" row itself and every "0.x" sub-block header row —
  independently confirmed to carry a single **★** in both the full-page
  render and the isolated star-column crop. Leaf composition independently
  re-tallied: 0.1.1–0.1.4 (4), 0.2.1–0.2.3 (3), 0.3.1–0.3.3 (3, **0.3.2
  present**), **0.4 contains only 0.4.1** (the table jumps directly from
  "0.4 Comprendre l'importance critique de la classification et de
  l'emballage" to its single leaf, no gap in the row sequence), 0.5.1–0.5.3
  (3), 0.6.1–0.6.2 (2). **Count: 4+3+3+1+3+2 = 16, confirmed exactly.**
- **Block 3** ("Traitement et acceptation du fret"): the bare top-level "3"
  row is confirmed blank (no star). Only sub-block **3.4 "Traiter et
  accepter le fret autre que des marchandises dangereuses"** appears; its
  own row and both leaves (3.4.1, 3.4.2) each carry a clearly distinct
  **★★★** — three individually countable star glyphs, confirmed at 400dpi.
  **Count: 2, confirmed.**
- **Block 5** ("Acceptation des bagages des passagers et des membres
  d'équipage"): the bare top-level "5" row is confirmed blank. Only
  sub-block **5.1 "Traiter les bagages"** appears (no 5.2 row at all); its
  own row and both leaves (5.1.1, 5.1.2) each carry a clearly distinct
  **★★★**, confirmed in the same crop, sitting immediately below Block 3's
  own triple-star rows in one continuous image. **Count: 2, confirmed.**
- **Block 7** ("Collecte de données pour la sécurité"): the bare top-level
  "7" row is confirmed blank. **7.1, 7.2, and 7.3 each carry exactly one
  star glyph**, confirmed unambiguously in a dedicated close-up crop
  showing all three rows' single stars in isolation with clear surrounding
  whitespace and no adjacent second star anywhere. **Count: 3, confirmed —
  single star (★), not ★★.** This is the specific rating the task brief
  flagged for independent re-verification (distinct from the separate,
  already-resolved Function 7.9 Block-7 star-count error in 7.10's own
  cross-function claim) — **independently re-derived from a fresh render
  of Function 7.10's own table, not assumed correct because the unrelated
  7.9 error is already fixed.**
- **No 7.4 row exists anywhere on this page — independently confirmed by a
  dedicated, purpose-built check, not merely by not seeing one.** A
  separate crop of the entire page area below row 7.3's closing border,
  extended generously down to the page footer, shows the table's own
  border closing completely and cleanly immediately after row 7.3,
  followed by roughly 60% of the remaining page as plain white space, then
  the standard page footer ("32" / "Édition 1, 1er Janvier 2023") — no
  truncated row, no continuation marker, no partial border suggesting a
  cut-off table.
- **"Genuinely the last function table" claim independently confirmed**:
  PDF page 37 was independently re-extracted and found to open "APPENDICE
  A — GLOSSAIRE" cleanly, with no leftover 7.10 table content; pages 38–41
  were also independently checked and contain only the glossary (continued)
  and Appendice B (the FEAC accreditation-program description) — no further
  function table (7.11 or otherwise) exists anywhere in the document.
- **Total: 16 + 2 + 2 + 3 = 23, confirmed independently**, matching the
  draft's own total exactly.

## (b) Block 0 wording variants vs. Function 7.5 — CONFIRMED by direct side-by-side image comparison of both functions' own fresh renders

Independently rendered Function 7.5's own TABLEAU 7.5.A (PDF page 31,
printed page 27, from the identical MD5-matched Training Guidance document
sitting in Function 7.10's own folder) at 300dpi and read it directly,
rather than re-quoting `docs/DGR_STAGE1_FUNCTION_7.5_DRAFT.md`'s own prose.

- **0.4's block-level title**: Function 7.10's own table reads "Comprendre
  l'importance **critique** de la classification et de l'emballage";
  Function 7.5's own table (fresh render) reads "Comprendre l'importance de
  la classification et de l'emballage" — **no "critique." Confirmed exactly
  as the draft states.**
- **0.5.1/0.5.2**: Function 7.10's own table reads "Reconnaître les
  **différentes** prescriptions de base concernant le marquage/
  l'étiquetage"; Function 7.5's own table (fresh render) reads "Reconnaître
  les prescriptions de base concernant..." — **no "différentes." Confirmed
  exactly.**
- **0.6.2**: Function 7.10's own table reads "Comprendre les **mesures**
  d'intervention d'urgence **prescrites par** l'employeur"; Function 7.5's
  own table (fresh render) reads "Comprendre les **exigences** d'intervention
  d'urgence **de** l'employeur" — **a materially different construction,
  confirmed exactly.**
- **Composition-route match independently reconfirmed**: Function 7.5's own
  Block 0, re-counted directly from this fresh render, is also 16 items via
  the identical route (0.3.2 present, 0.4 reduced to only 0.4.1).
- **Additional finding, beyond what the task brief required but consistent
  with its own theme**: Function 7.10's own **0.2.1** reads "Développer un
  flair pour les marchandises dangereuses **interdites**" (the standard
  wording), while Function 7.5's own 0.2.1 (fresh render, matching the
  outlier wording already independently confirmed in
  `docs/DGR_STAGE1_FUNCTION_7.9_CROSSVALIDATION.md` part (b)) reads
  "...marchandises dangereuses **cachées**" — a fourth wording point of
  difference between the two functions' otherwise identically-structured
  Block 0, not previously called out in Function 7.10's own draft. This
  does not contradict anything in the draft; it reinforces the same "same
  count/slot-pattern ≠ same text" finding with one more data point.

**Confirmed exactly as the draft states**: all three claimed distinct
wording variants are genuine and independently reproduced from a fresh,
direct side-by-side render — not assumed from either draft's own prose.

## (c) Block 5 sub-block 5.1 vs. Function 7.9's own 5.2 — CONFIRMED by a fresh render of Function 7.9's own table

Independently rendered Function 7.9's own TABLEAU 7.9.A (PDF page 35,
printed page 31, same document) at 300dpi and read it directly, rather than
quoting `docs/DGR_STAGE1_FUNCTION_7.9_DRAFT.md`'s own prose.

- **Function 7.9's own Block 5** is headed **"5.2 Accepter les bagages"**
  (no 5.1 row appears anywhere in its table), with leaves **5.2.1
  "Appliquer les prescriptions des exploitants"** and **5.2.2 "Vérifier les
  prescriptions concernant les bagages des passagers"** — confirmed by
  direct visual read of the fresh render.
- **Function 7.10's own Block 5** is headed **"5.1 Traiter les bagages"**
  (no 5.2 row appears anywhere in its table), with leaves **5.1.1
  "Identifier les marchandises dangereuses interdites"** and **5.1.2
  "Appliquer les prescriptions d'approbation"** — from part (a) above.
- **Confirmed: genuinely different sub-block number (5.1 vs. 5.2) AND
  genuinely different leaf wording** — not a case of the same content
  merely renumbered. This is a clean, source-confirmed complementary-role
  pairing exactly as the draft describes: cabin crew (7.9) apply the
  operator's own baggage-acceptance policy from a service perspective,
  while security-screening personnel (7.10) identify prohibited DG and
  apply approval provisions from an enforcement/detection perspective.
- **Additional observation**: Function 7.9's own 0.5.3 (fresh render) reads
  "Déterminer les documents exigés **pour les expéditions de marchandises
  dangereuses**" — a fuller construction than both Function 7.10's own
  plain "Déterminer les documents exigés" (confirmed in part (a)) and
  Function 7.5's own identically plain wording (confirmed in part (b)) — a
  further, previously unremarked data point for the same "same slot ≠ same
  text" theme, not a correction to anything in the draft.

## (d) "Cadre CBTA" matrix — CONFIRMED wrong-function finding; one correction to the "zero occurrences of 'sûreté'" claim

Independently located both on-disk copies of
`PACK COMPLET FORMATION CBTA - FONCTION 7.10.zip` (confirmed byte-identical
by `md5`: `8e0ef8d71a263cbe990afef3498740c7` in both
`.../14_ARCHIVES_ANCIENNES/Bureau_MacBookPro/...` and
`.../PC/Desktop_macbook_old_copy/.../Bureau - MacBook Pro de mac/...`),
extracted `09_Cadre_CBTA MATRICE DES COMPÉTENCES FONCTION 7.10.docx` (MD5
`dca08137e7b06a5eef7b7f3beb2b288b`) via two independent methods
(`textutil -convert txt`: 5,652 bytes; raw `word/document.xml` tag-strip:
5,439 bytes after whitespace normalization — both methods agree on content).

**Wrong-function finding — CONFIRMED exactly:**

- Header confirmed verbatim: **"MATRICE DES COMPÉTENCES FONCTION 7.10"** /
  **"Référence réglementaire : Table 1.5.A du DGR IATA - Agent de fret /
  Compagnie aérienne"**.
- The seven "compétences" rows confirmed verbatim: "Contrôle documentaire"
  (verify DGD/certificates), "Procédures acceptation" (accept/refuse
  workflow), "Séparation matières" (compatibility table/loading-plan
  segregation), "Information équipage" (draft the NOTOC), "Gestion
  incidents", "Limitations transport", "Traçabilité opérations" — all
  cargo/freight-acceptance and NOTOC-drafting competencies, confirmed to
  match the draft's characterization exactly.
- "Table 1.5.A" independently confirmed cited exactly **2** times (matching
  the draft), and "agent de fret" independently confirmed cited exactly
  **2** times (matching the draft): once in the reference line, once in the
  document's own internal "correspondance Table 1.5.A" mapping table's
  "7.10 | Agent de fret" row.
- The internal mapping table's self-contradiction independently
  re-confirmed exactly: it labels "7.4 | Pilote commandant" and "7.5 |
  Équipage cabine," both directly contradicting this program's own
  independently-confirmed findings (7.4 = ramp/warehouse cargo-handling
  personnel; 7.7, not 7.5, = flight crew/pilots).
- Sources section independently re-confirmed to cite exclusively French
  national bodies (DGAC, DSAC, BEA), with no ANAC/Algeria reference
  anywhere.

**Correction found: the draft's claim of "zero occurrences of 'sûreté'...
anywhere in it" is imprecise — it is not zero.** An independent
word-boundary-consistent keyword count (both extraction methods agreeing
exactly) finds:

| Term | Independent count |
|---|---|
| "sûreté" | **1** (not 0) |
| "sécurité" | 2 |
| "screening" | 0 |
| "scanner" | 0 |
| "contrôle de sécurité" (exact 3-word phrase) | 0 |

The single "sûreté" occurrence is located inside the same internally
self-contradictory "correspondance Table 1.5.A" mapping table already
flagged above — it reads, verbatim: **"7.6 | Personnel sûreté | OUI | 24
mois | Contrôle sécurité"** — i.e., the document's own internal table
mislabels **Function 7.6**, not Function 7.10 itself, as the
security/sûreté role. The exact 3-word phrase "contrôle de sécurité" the
draft specifically checked for is genuinely absent (0 hits, confirmed), so
the draft's core conclusion — *this document never describes Function 7.10
in security/screening terms anywhere, including in its own résumé or
competency list* — remains accurate and is independently reconfirmed. But
the narrower parenthetical claim that "sûreté" itself appears zero times is
corrected here to one occurrence, which (perhaps ironically) sits under the
*wrong* function code in the same self-contradictory mapping table already
used as evidence of the document's unreliability — if anything, this
strengthens, not weakens, the "must never be treated as ground truth"
conclusion, since the one place the document does associate "sûreté" with
a function code, it assigns that code incorrectly (7.6, not 7.10).

**Second, related minor correction**: the draft's parenthetical "'NOTOC'
(1)" undercounts — an independent count finds **NOTOC = 3** occurrences,
all three clustered inside the single "Information équipage" competency
row ("Rédiger NOTOC complet..." / "Rédaction NOTOC guidée..." / "NOTOC
complet..."), i.e., one competency mentioning NOTOC three times across its
objective/method/evaluation columns, not three independently-placed
mentions. This is the same class of narrow, non-substantive
supporting-detail undercount already found and corrected in Function 7.8's
own Cadre CBTA cross-check ("manutention"/"chargement" counts). It does not
change the wrong-function conclusion.

**Confirmed: this document contributes zero usable Stage 1 evidence for
Function 7.10's own task/sub-task content and must continue to be treated
as unreliable**, exactly as the draft concludes — a sixth confirmed-wrong
instance in this program (after 7.4, 7.5, 7.6, 7.8, and 7.9; 7.7 remains
the sole confirmed-correct/absent exception).

## (e) "Fret et courrier" title-vs-content finding — CONFIRMED for "courrier", CORRECTED for "fret" (5, not 4, occurrences)

Independent joined-text keyword search of the freshly-extracted 114-slide
course:

| Term | Draft's claimed count | Independently re-derived count |
|---|---|---|
| "fret" | 4 | **5** |
| "courrier" | 2 | **2 (confirmed exactly)** |

The discrepancy is located entirely on **course page 30** (the
"Applicabilité DGR 1.2.1" scope slide), which independently re-read in
full contains **two** separate "fret" occurrences, not one:

> "Parties à l'accord multilatéral de trafic intercompagnies de l'IATA-
> **fret**" / "Aux expéditeurs et agents de **fret**"

The draft's own description ("one incidental mention inside the
IATA-membership/applicability slide (p.30, 'agents de fret' as a class of
entity...)") correctly identifies the *content* of p.30 but undercounts its
own occurrence total by treating the slide as contributing one hit instead
of two. The other three locations the draft cites — the title slide (p.1),
the security-role slide (p.68: "...bagages, **fret**, zones sécurisées"),
and the reporting slide (p.107: "...découvertes dans le **fret** ou le
courrier") — are all independently reconfirmed exactly as described, each
contributing exactly one hit.

**This does not change the underlying finding**: the course still develops
no dedicated freight/mail-specific acceptance procedure comparable to
Function 7.2's own multi-slide cargo-acceptance workflow, and the
documentation/package-inspection content (pp.58–66, 101–103) is still
taught in a general, passenger-baggage-framed narrative that must be
inferred to also cover freight/mail via the single p.68 clause and Table
7.10.A's own shared leaf wording. The correction is a precise recount only
(5, not 4) — the same class of minor, non-substantive count correction
already made in Function 7.8's own cross-validation pass, and is corrected
in `docs/DGR_STAGE1_FUNCTION_7.10_DRAFT.md` accordingly.

## (f) SOURCE GAP re-verification (0.3.2, 5.1.2) — CONFIRMED, with one precision nuance on 0.3.2

**0.3.2 "Comprendre les responsabilités des passagers" — CONFIRMED SOURCE
GAP, with one word-search precision nuance.** An independent joined-text
search for "responsab\w*" across the full 114-slide course returns **9**
hits (draft did not report an exact hit count for 7.10's own course, unlike
the analogous checks already done for 7.8/7.9). All 9 were individually
re-located and read: a table-of-contents topic heading, a generic
"Exigence légale / Responsabilité" framing statement (p.16), the p.67–71
"Rôle et responsabilité" section (5 hits: the security-personnel role
slides themselves, the shipper's DGR 1.3 wheel, the operator's DGR 1.4
wheel, the DGR 1.7.2 training slide), and 2 further hits inside that same
section. **A direct proximity check (searching whether "responsab*" appears
within 100 characters of "passager" anywhere in the joined text) finds
exactly one near-match**: "...71 Rôle et responsabilité Formation DGR 1.7.2
Le personnel chargé du contrôle de sécurité **des passagers**, membres
d'équipage..." — but this sentence describes the **security screener's own
role controlling passengers** ("le personnel chargé du contrôle de
sécurité des passagers"), not any responsibility that belongs to
passengers themselves. **This is a false-positive proximity match, not
genuine 0.3.2 content, and does not overturn the gap** — independently
confirmed exactly as the draft concludes: no slide anywhere teaches what a
passenger's own duties/responsibilities are (as opposed to what a passenger
may carry, or how a screener should treat a passenger's items). A fifth
confirmed-recurring function (after 7.5/7.6/7.7/7.8/7.9 — reconfirming this
is now the sixth consecutive function in the program with this identical
gap, not the fourth as the draft's own prose states before Function 7.9's
own cross-validation was available — see note below).

**Correction note on the recurrence count**: the draft's own text describes
this as "a fourth consecutive function with this exact gap" (after
7.5/7.6/7.7), written before Function 7.9's own Stage 1 draft (also
confirming this identical gap) was available for cross-reference. With
7.9's own confirmed 0.3.2 gap now on record, Function 7.10 is the **sixth**
function with this gap (7.5, 7.6, 7.7, 7.8, 7.9, 7.10), not the fourth. This
is an artifact of drafting order/parallel-session timing, not a
factual error in what was found — flagged here for completeness, not as a
substantive correction to any conclusion.

**5.1.2 "Appliquer les prescriptions d'approbation" — CONFIRMED thin/
untested evidence.** Independent search for "approb\w*" across the course
finds **4** hits, all on pages 40–41 (the general "Approbations DGR 1.2.5"
definition — "Dans certains cas, les états concernés peuvent accordés Des
Approbations DGR 1.2.5..."), confirming the draft's p.41 citation exactly.
The baggage-specific p.45 note independently re-located and read in full:
**"Note : L'exploitant peut approuver le transport de plus de 15 AEP.
L'exploitant peut approuver le transport de plus de 20 batteries"** —
confirmed verbatim (this uses "approuver," not "approbation," so it is not
captured by a plain "approb" search, an implementation detail worth noting
for anyone re-running this check). **Independent search of both the exam
and practice book for "approb\w*" AND "approuv\w*" returns zero hits in
both instruments for both word forms** — confirming the draft's "zero exam/
practice reinforcement" claim exactly, with the additional rigor of
checking both relevant French word forms rather than one.

## (g) Practice book MD5 — CONFIRMED genuinely distinct from all 9 other functions, ten-way table rebuilt from scratch

Independently re-derived `md5` for every function's own practice book,
rebuilt from scratch directly against the files on disk (not copied from
the draft's own table):

| Function | Practice-book MD5 (independently re-derived) |
|---|---|
| 7.1 | `20c06b5481669957131185b12afd86ad` |
| 7.2 | `7dee3dcf6b644daf29954770e6971928` |
| 7.3 (misfiled — 7.1's own file) | `20c06b5481669957131185b12afd86ad` |
| 7.4 | `3e75aa010e214c98673ee88d8ab174f2` |
| 7.5 | `f40262cc4478e48782a2cdd7541045a2` |
| 7.6 | `80cf42f32ea1276ba5f07887990d0e3b` |
| 7.7 | `8230dd60c4ad1a6e684d56bdc1dda8f6` |
| 7.8 | `7c66b841b9e6c5f4aafe5c7ac897cc3c` |
| 7.9 | `43be30eb9aca670946e1f0da2766db3c` |
| **7.10** | **`cf300e211bd43d8a720108e8713ca182`** |

**Every hash matches the draft's own reported table exactly.** Function
7.10's own hash matches none of the other nine — independently
reconfirming the "correctly filed, genuinely distinct, no misfiling issue"
finding. This is the **first full, independently-rebuilt ten-way
comparison run in this program's cross-validation history** (prior
passes rebuilt the table against the then-available 9 functions; this is
now the complete set).

## (h) DGR Part 1.7 over-teaching claim and p.68–69 "Rôle et responsabilité" finding — CONFIRMED, word for word

**DGR Part 1.7 content (pp.52–55) independently re-located and read in
full.** Confirmed verbatim: p.52 "Dispositions générales concernant la
sureté DGR1.7.1" (1.7.1.1/1.7.1.2); p.53–54 "Dispositions relatives aux
marchandises dangereuses à haut risque DGR 1.7.3" (High-Consequence DG
definition, Table 1.7.A's own class/division list referenced and partially
reproduced: Class 1 Div 1.1–1.5, Class 2 Div 2.3, Class 3, Class 4 Div 4.1,
Class 6 Div 6.1/6.2); p.55 "Plan de sureté DGR 1.7.4" (1.7.4.1/1.7.4.2).
**Confirmed exactly as the draft describes** — genuine DGR Part 1.7
content, the first and only such content found anywhere in this ten-function
program.

**p.68–69 "Rôle et responsabilité" slides independently re-located and read
in full, confirmed word for word.** p.68 opens: *"Dans le cadre du plan de
sûreté 1.7.4.2, le personnel de sûreté occupe un rôle central en mettant en
œuvre, sur le terrain, l'ensemble des mesures prévues..."* — directly
linking this role-definition section to the DGR 1.7 security-plan content
above, then lists five concrete duties (implement control procedures
including "inspection des passagers, équipages, bagages, **fret**, zones
sécurisées"; verify access to sensitive areas; monitor/protect DG;
identify suspicious behavior; detect prohibited items/undeclared DG); p.69
continues with six more (apply emergency procedures; isolate the threat;
communicate with the chain of command/PAF/pompiers; participate in audits;
undergo initial/recurrent training; act as first line of defense).
**Confirmed to be the strongest, most explicit first-person security-role
job description found anywhere in this ten-function program**, exactly as
the draft claims, and confirmed to explicitly tie the DGR Part 1.7 content
to leaf 0.3.1 via its own opening clause — supporting the draft's tentative
attachment of the DGR 1.7 over-teaching finding to 0.3.1 as a reasonable,
source-grounded placement, not an arbitrary one.

## Additional independent spot-checks performed this pass

- `pdfinfo` confirms the course PDF is 114 pages, the exam PDF is 6 pages,
  and the practice book is 8 pages — matching the draft's stated counts
  exactly.
- Course title slide (p.1) independently re-confirmed verbatim:
  "Règlementation pour le transport des marchandises dangereuses. (DGR IATA
  CBTA - Fonction 7.10) Personnel chargé du contrôle de sécurité (bagages,
  fret et courrier des passagers et des membres d'équipage)", instructor
  "Boufas Yasmina," dated 02/09/2025. Author metadata independently
  reconfirmed: Sidali KARA.
- Course p.25 independently re-confirmed to read verbatim **"66ème
  Edition"** — confirming the course's own DGR 66th Edition baseline, not
  the repo's current 67th Edition/Addendum-1 standard.
- All eleven files in the Function 7.10 source folder independently
  re-hashed and confirmed to match every hash the draft reports exactly
  (see the file-inventory table above; course
  `aee456268737b0a4e99e597b89613480`, exam
  `fc30963d24da5847565dc3d643d12b88`, practice book
  `cf300e211bd43d8a720108e8713ca182`, Training Guidance PDF
  `88fca4d5aa6a0dca0000dbc64b0acbdb`, rubric
  `1b47a0e2a6ab3d201aeb0fac7221e60b`, DGR 66th Edition Addendum
  `8ad20a8007e3268b6b5fb306baa67a3c`, Table 2.3.A
  `5128dcff81b9a4295705cf8218d0642a`, ICAO Doc 10147
  `00615e9649a74f132f44d384804b20e3`, label reference sheet
  `8b63d112469b719e992e0b45da335024`, Module 4 video
  `0dc176eb4ac4ac53b936d585c4261220`, Saudia video
  `00562622c21b1b4ea7b6eaa697333173`).
- Both on-disk copies of the Cadre CBTA zip independently confirmed
  byte-identical by `md5` (`8e0ef8d71a263cbe990afef3498740c7`), matching
  the draft's own "confirmed to also exist as an identical second copy"
  note.

## Outcome

**CONFIRMED — no correction required to the 23-leaf-sub-task enumeration,
the Block 0/3/5/7 structure, the star ratings (uniform ★ across Block 0
including the top-level "0" row, blank top-level "3"/"5"/"7" block-summary
rows, uniform ★★★ across Block 3's and Block 5's leaves, and — the specific
item flagged for independent re-verification — the uniform single-★ rating
across all three of Block 7's own leaves, with no 7.4 row anywhere on the
page, independently confirmed via a dedicated below-the-table crop built
specifically to rule out a missed/truncated block), the three distinct
Block 0 wording variants vs. Function 7.5, the Block 5 sub-block 5.1-vs-5.2
distinction from Function 7.9 (confirmed via a fresh render of 7.9's own
table, not a re-quote), the Cadre CBTA wrong-function finding, the 0.3.2
and 5.1.2 SOURCE GAP/thin-evidence findings, or the DGR Part 1.7/p.68–69
findings in `docs/DGR_STAGE1_FUNCTION_7.10_DRAFT.md`.**

**Two minor, non-substantive corrections are recorded**: (1) the Cadre CBTA
document's own claim of zero "sûreté" occurrences is corrected to one
occurrence, located inside the document's own self-contradictory
function-mapping table under the wrong function code (7.6, not 7.10) —
this strengthens rather than weakens the "must never be treated as ground
truth" conclusion; (2) the course-wide "fret" keyword count is corrected
from 4 to 5 (page 30 contains two separate occurrences, not one). Neither
correction changes the wrong-function conclusion, the thin-freight-evidence
conclusion, any Stage 1 leaf count, any star rating, or any SOURCE GAP
finding. Both corrections are applied to
`docs/DGR_STAGE1_FUNCTION_7.10_DRAFT.md` directly (see that file's own
revision note).

**No new cross-function SOURCE CONFLICT was found in this pass.** The
already-resolved Block-7 star-rating conflict (which concerned 7.10's own
draft's claim about *Function 7.9's* Block 7, not about 7.10's own table)
remains resolved; this pass independently re-confirms Function 7.10's own
Block 7 rating (single ★) directly from a fresh render of its own table,
consistent with the already-settled cross-function picture (7.5, 7.9, and
7.10 all carry single-★ Block 7s; 7.1–7.4/7.6/7.7 carry ★★; 7.8 has no
Block 7 at all).

`docs/DGR_STAGE1_FUNCTION_7.10_DRAFT.md` may now be treated as
**cross-validated** (second pass complete) and is the basis for the Stage
2A blueprint in `docs/DGR_STAGE2A_FUNCTION_7.10_BLUEPRINT.md`. It remains
**not** reviewed by a qualified instructor, **not** accepted by ANAC, and
**not** Tier A–verified against the current 67th Edition/Addendum 1 text
(the course is confirmed built on the 66th Edition) — those gates are
unaffected by this pass and remain open.

**Programmatic note**: this is the tenth and final Stage 1 cross-validation
in the 7.1–7.10 program. All ten functions now have a completed second
independent pass. See `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md` for the
program-wide milestone note.
