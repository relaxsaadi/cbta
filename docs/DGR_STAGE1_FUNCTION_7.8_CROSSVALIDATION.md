# DGR Stage 1 — Function 7.8 — SECOND-PASS CROSS-VALIDATION — CONFIRMED (one minor, non-substantive correction)

**Verdict: CONFIRMED.** An independent second pass re-read the same source
files cited in `docs/DGR_STAGE1_FUNCTION_7.8_DRAFT.md` (the first-pass Stage
1 draft) — including a fresh 300dpi full-page render of TABLEAU 7.8.A plus
dedicated 2×-upscaled star-column-only crops (one covering Block 0 in full,
one covering the ★→★★★ transition and the whitespace below 6.2.5, produced
specifically to independently re-verify this function's own unusual "no
Block 7 at all" claim, the first such claim in this program), MD5 checksums
of every file the draft cites, an independent `unzip -l`-located re-extraction
of the "Cadre CBTA" matrix via two methods (`textutil -convert txt` and a raw
`word/document.xml` tag-strip), page-mapped keyword searches (`grep`,
joined-text/windowed regex) of the 119-slide course, 20-question exam, and
30-question practice book for every claimed SOURCE GAP, and direct reading of
the exam's and practice book's own capstone question text. Every load-bearing
claim in the draft is **verified accurate**. **No correction** to the
23-leaf-sub-task enumeration, the block structure (0 and 6.2 only, no Block
7), the star ratings, the Block 0 composition/wording finding, the wrong-
function Cadre CBTA finding, the two SOURCE GAPs, or the capstone-item claims
is required. **One minor, non-substantive correction is recorded**: the
Cadre CBTA cross-check's own supporting word-frequency counts ("manutention"
(9), "chargement" (6), "arrimage" (6)) undercount two of the three words —
see part (c) below. This does not change the wrong-function conclusion or
any count in the draft's sub-task enumeration or SOURCE GAP notes.

This file does not replace `docs/DGR_STAGE1_FUNCTION_7.8_DRAFT.md`; it
records the independent second pass against it, per the same two-pass
discipline Functions 7.1, 7.3, 7.4, 7.5, 7.6, and 7.7 used (draft →
corrected/confirmed final).

## Method

All checks performed directly against the same folder the draft cites:
`/Users/mac/Documents/Fichiers/Algerie/CBTA final/yasmine cbta/wetransfer_supports-pedagogiques-dgr-cbta-kost-academy_2025-10-12_1842/COURS DGR-CBTA-IATA/DGR-FONCTION 7.8/`,
plus a direct re-open of the low-rigor archive for the Cadre CBTA cross-check.

- `md5` on all twelve files in the Function 7.8 source folder (course, exam,
  practice book, rubric, Training Guidance PDF, DGR 66th Edition Addendum,
  Table 2.3.A, ICAO Doc 10147, label reference sheet, NOTOC form, both
  videos), compared against the draft's own reported hashes, and, for the
  practice book, independently re-compared against all nine other functions'
  practice-book MD5s freshly re-derived from disk (7.1, 7.2, 7.3's misfiled
  copy, 7.4, 7.5, 7.6, 7.7, 7.9, 7.10).
- `pdftotext -layout` full extraction of the IATA Training Guidance PDF, with
  a direct page-by-page scan (`grep -i "TABLEAU\|7\.8\|7\.7\|7\.9"` across
  every one of its 41 pages) to independently locate TABLEAU 7.8.A rather
  than trusting the draft's own stated page number, confirming it at PDF
  page 34 (printed page 30) before any rendering was done.
- `pdftoppm -r 300` full-page PNG render of PDF page 34, read directly, then
  two independent, purpose-built crops: (1) a full-height, 2×-upscaled
  isolation of just the qualification-level (★) column, split into top/bottom
  halves so every row from the top-level "0" row through 6.2.5 could be read
  individually at high confidence, deliberately re-verifying the exact
  ★→★★★ transition; (2) a separate, generous crop of the page area *below*
  row 6.2.5 running down to the page footer, specifically to rule out a
  hidden/truncated Block 7 that a tighter crop might miss — this was the
  task brief's own explicit instruction to verify the "no Block 7" claim
  "carefully by checking the full table has no missed block, not just
  assuming the draft's read is right."
- `pdftotext -layout -f 35 -l 35` independent re-render/re-extraction of PDF
  page 35 to confirm TABLEAU 7.9.A begins cleanly with no leftover 7.8
  content, matching the draft's own boundary check.
- `pdftotext -layout` full extraction of the 119-page course, 7-page exam,
  and 12-page practice book (page counts independently re-confirmed via
  `pdfinfo`, matching the draft's stated counts exactly), with per-page
  (`pdftotext -f N -l N`) spot-reads for every page citation checked below,
  plus `grep -i` and a windowed joined-text Python regex search for every
  keyword the draft's SOURCE GAP/thin-evidence notes depend on ("services
  d'urgence", "secours", "circulation aérienne", "ATC", "agent des
  opérations", "régulateur", "divergence", "subsidiaire", "responsab").
- `unzip -l` direct listing of
  `/Users/mac/Documents/Fichiers/14_ARCHIVES_ANCIENNES/Bureau_MacBookPro/PACK COMPLET FORMATION CBTA.docx/Archive.zip`'s
  `FONCTION 7.8/` folder to independently locate and confirm the
  `08_CADRE_CBTA/09_CADRE_CBTA.docx` path the draft cites, followed by direct
  extraction and reading of its full text via two independent methods
  (`textutil -convert txt` and a raw `word/document.xml` regex tag-strip),
  plus an independent word-boundary-consistent frequency count (Python
  regex, both extraction methods cross-checked against each other) for every
  keyword the draft's wrong-function conclusion depends on.
- Direct reading of exam Q20 and practice-book Q30 in full (not just the
  draft's own excerpted quotes) to independently verify the capstone-item
  claims, plus practice Q10 and Q29 in full for the role-definition and
  SOURCE GAP-adjacent findings.
- `pdfinfo` on the course PDF to independently re-confirm author metadata
  (Sidali KARA), title-slide instructor/date (Boufas Yasmina, 02/09/2025),
  and the "66 ème Edition" regulatory-baseline slide (p.25).

## (a) TABLEAU 7.8.A structure and star-rating column — CONFIRMED, including the "no Block 7 at all" claim

Independently located TABLEAU 7.8.A at PDF page 34 (printed page 30) via a
fresh full-document page-by-page keyword scan (not by trusting the draft's
citation), confirmed via both `pdftotext -layout` extraction and a 300dpi
full-page render, followed by dedicated high-resolution star-column crops.

- **Block 0** (row "0" through 0.6.2, 25 rows: the top-level "0" row, six
  sub-block header rows 0.1–0.6, and 18 leaf rows): every row independently
  confirmed to carry a single **★** in both the full-page render and the
  isolated, upscaled star-column crop — no row shows two or three stars.
  Leaf composition independently re-tallied from both the raw text
  extraction and the rendered image: 0.1.1–0.1.4 (4), 0.2.1–0.2.3 (3),
  0.3.1–0.3.3 (3, 0.3.2 present and active), 0.4.1–0.4.3 (3), 0.5.1–0.5.3
  (3), 0.6.1–0.6.2 (2). **Count: 4+3+3+3+3+2 = 18, confirmed exactly.**
- **The top-level "0" row itself carries a ★** matching its children
  (uniform), while **the top-level "6" row and the "6.2" sub-block header
  row are both confirmed blank** (no star glyph at all) in the same
  high-resolution crop — the identical "inconsistently populated
  block-summary row" formatting characteristic already documented for every
  prior function's table in this program, independently reconfirmed here,
  not smoothed into a false uniform value.
- **Sub-block 6.2** ("Gérer les marchandises dangereuses avant et pendant le
  vol") and its five leaves (6.2.1–6.2.5): every row independently confirmed
  to carry a clearly distinct **★★★** — three separate, individually
  countable star glyphs on every one of the five rows, confirmed in a crop
  showing Block 0's single stars, the two blank block-summary rows, and
  Block 6.2's triple stars all in one continuous image, so the ★→★★★
  transition is directly comparison-verified, not an artifact of separate
  rendering passes. **Count: 5, confirmed exactly.**
- **No Block 7 exists anywhere on this page — independently confirmed by a
  dedicated, purpose-built check, not merely by not seeing one.** A separate
  crop of the entire page area below row 6.2.5's closing border, extended
  generously down to the page footer, shows the table's own border closing
  completely and cleanly immediately after row 6.2.5, followed by nothing
  but white space and the standard page footer ("30" / "Édition 1, 1er
  Janvier 2023") — no truncated row, no continuation marker, no partial
  border suggesting a cut-off table. **This directly answers the task
  brief's own explicit instruction to verify this unusual claim "carefully
  by checking the full table has no missed block, not just assuming the
  draft's read is right."**
- **Page-boundary check independently re-confirmed:** PDF page 35 was
  independently re-rendered/re-extracted and found to open a fresh "7.9
  Fonction : Personnel de cabine" / "TABLEAU 7.9.A" table with its own
  distinct column header ("Transport du fret/des bagages," not "Gérer le
  préchargement") and its own from-scratch Block 0 enumeration — confirming
  Table 7.8.A does not continue onto a second page and that no 7.8 content
  is stranded on page 35, exactly as the draft states.
- **Total: 18 + 5 = 23, confirmed independently**, matching the draft's own
  total exactly. The qualification-column header ("Gérer le préchargement,"
  a shortened variant of the header text already documented as recycled
  boilerplate across Functions 7.4/7.6/7.7's tables) is independently
  re-confirmed to read identically in the rendered image.

## (b) Block 0 composition/wording vs. 7.6/7.7 — CONFIRMED, including the sixth distinct 0.2.2 variant

Directly re-read from both the independent text extraction and the rendered
table image, cross-checked against the wording already independently
re-confirmed for Functions 7.6 and 7.7 in their own cross-validation passes:

- **0.1 (all four items), 0.3.1, 0.3.3, 0.4 (all three items), 0.5 (all
  three items), and 0.6 (both items) are independently confirmed worded
  identically** to the 7.1/7.2/7.3/7.7 pattern.
- **0.2.1 independently confirmed as the standard "...marchandises
  dangereuses interdites" wording**, unchanged from 7.1/7.2/7.3/7.6/7.7.
- **0.2.2 independently confirmed to carry a sixth genuinely distinct
  wording variant**: the rendered image reads, verbatim and unambiguously,
  **"0.2.2 Reconnaître les marchandises dangereuses non déclarées
  potentielle-ment cachées"** (the line-wrap hyphenation is the source
  document's own layout, not a transcription artifact) — inserting "non
  déclarées" into the phrase, distinct from every prior function's own
  wording (7.1/7.2/7.3/7.7: "...dangereuses potentiellement cachées"; 7.4:
  "...potentiellement dangereuses"; 7.5: "...dangereuses potentiellement
  cachées" with "cachées" also moved to 0.2.1; 7.6: "...potentiellement
  cachées", dropping "dangereuses"). Independently confirmed by both direct
  text extraction and image inspection — not a transcription artifact.
- **0.3.2 "Comprendre les responsabilités des passagers" independently
  confirmed present and active** in the rendered table, consistent with
  7.5/7.6/7.7's tables.
- **0.4.3 "Envisager de multiples dangers" independently confirmed present**,
  consistent with 7.1/7.2/7.3/7.4/7.6/7.7's tables, not 7.5's (which drops
  both 0.4.2 and 0.4.3).
- **Net result independently re-tallied: 4+3+3+3+3+2 = 18**, confirming the
  draft's claim of an item-by-item composition identical to Function 7.6's
  own 18-item Block 0, differing only in the 0.2.2 wording variant.

## (c) "Cadre CBTA" matrix — CONFIRMED wrong-function finding; one minor, non-substantive word-count correction

Independently located the file via a fresh `unzip -l` listing of
`Archive.zip`'s `FONCTION 7.8/` folder (not by trusting the draft's stated
path), confirming `📁 08_CADRE_CBTA/📁 09_CADRE_CBTA.docx` (19,870 bytes)
exists exactly where the draft states, then independently extracted and read
its full text via two separate methods: `textutil -convert txt` and a raw
`word/document.xml` regex tag-strip (13,838 characters of visible text via
the second method).

**Wrong-function finding — CONFIRMED exactly, word for word:**

- Header independently re-confirmed verbatim: **"MATRICE COMPÉTENCES
  FONCTION 7.8"** / **"ALIGNEMENT TABLE 1.5.A DGR IATA"**.
- Definition box independently re-confirmed verbatim: **"FONCTION 7.8 -
  PERSONNEL DE MANUTENTION MD (Handling Personnel)"** — *"Personnel
  responsable de la manipulation physique des marchandises dangereuses,
  incluant le chargement, l'arrimage, le stockage temporaire et
  l'utilisation d'équipements de manutention spécialisés"* — the document is
  internally labeled "Fonction 7.8" but describes a physical ramp/warehouse
  cargo-handling role, not the real Function 7.8's flight-operations/
  dispatch documentation-verification role — confirmed to be an internal
  self-mislabeling, not merely a generic-boilerplate mismatch.
- The five "compétences" headings independently re-confirmed verbatim:
  "IDENTIFICATION ET RECONNAISSANCE," "MANIPULATION SÉCURISÉE," "PROTECTION
  ET ÉQUIPEMENTS," "SÉGRÉGATION ET CHARGEMENT," "GESTION D'URGENCE" — all
  physical-handling competencies (explosives/gas/flammable-liquid handling
  by hand, ATEX equipment, PPE selection, physical loading/lashing).
- A targeted keyword search of the full independently re-extracted text
  (both methods agreeing) confirms **zero occurrences** of "NOTOC,"
  "régulateur," "opérations aériennes," "commandant," or "dispatch" — the
  words that would be unavoidable in any genuine description of a
  flight-operations/dispatch function.
- "Table 1.5.A" independently confirmed cited (not Table 7.8.A) in two
  places ("ALIGNEMENT TABLE 1.5.A DGR IATA" and "ALIGNEMENT RÉGLEMENTAIRE
  TABLE 1.5.A"), and the "sources" section independently re-confirmed to
  cite exclusively French national bodies — DGAC France, INRS, CEFCM,
  AFTIM, INERIS, CRAM/CARSAT — with no ANAC/Algeria reference anywhere.

**Minor, non-substantive correction found: the draft's own supporting
word-frequency parenthetical counts are imprecise.** The draft states
*"'manutention' (9), 'chargement' (6), and 'arrimage' (6) all appear
repeatedly."* An independent, word-boundary-consistent regex count (Python
`\b...\b`-equivalent matching, run identically against both the `textutil`
output and the raw-XML tag-strip output, with both methods agreeing exactly)
finds **"manutention" = 10** (not 9 — the draft's own plain `grep -io`
count of exactly "manutention" without accounting for a header-line
"MANUTENTIONNAIRE"/"MANUTENTIONNAIRES" variant nearby produces an
inconsistent boundary read depending on method) and **"chargement" = 8**
(not 6); **"arrimage" = 6" is confirmed exactly as stated.** This is a
narrow, supporting-detail correction only — it does not change the
wrong-function conclusion (which rests on the zero-hit NOTOC/régulateur/
opérations aériennes/commandant/dispatch check, independently reconfirmed
above with the identical zero result by both extraction methods) and does
not affect any count in the Stage 1 sub-task enumeration or the Stage 2A
blueprint below. No change to `docs/DGR_STAGE1_FUNCTION_7.8_DRAFT.md`'s own
Cadre CBTA section is needed beyond noting this correction here, per the
same treatment Function 7.6's cross-validation gave its own minor,
non-substantive finding (the truncated Compétence 4 table).

**Confirmed: this document contributes zero usable Stage 1 evidence and must
continue to be treated as unreliable**, exactly as the draft concludes — now
a fourth independently reconfirmed instance of this exact failure mode in
this program (after Functions 7.4, 7.6, and 7.8 itself was already the
draft's own third; this pass adds independent re-confirmation, not a new
instance).

## (d) The two SOURCE GAPs (6.2.5, 6.2.4) — CONFIRMED via independent keyword search

**6.2.5 "Informer les services d'urgence des marchandises dangereuses
figurant sur la NOTOC en cas d'urgence" — CONFIRMED full SOURCE GAP.** An
independent `grep -i` search for "services d'urgence" and "secours" across
the full 119-slide course returns exactly **one** hit: *"les trousses de
premiers secours"* (first-aid kits), independently re-located at course PDF
page 48 (printed page 48) inside the "Exemples de DG cachées" hidden-DG
example list — confirmed to be an unrelated hidden-DG example, not an
emergency-services-notification concept, exactly as the draft states. No
exam or practice-book question addresses this leaf.

**6.2.4 "Informer l'agent des opérations aériennes/le régulateur de vols/le
contrôle de la circulation aérienne en cas d'urgence" — CONFIRMED partial
SOURCE GAP.** Three independent keyword searches:

- `grep -i "circulation aérienne"` and a case-insensitive `"ATC"` search
  across the full course both return **zero** hits — the ATC clause has no
  course evidence at all, confirmed exactly.
- `grep -in "agent des opérations"` returns exactly **one** hit, independently
  re-located and page-confirmed at **PDF page 103** (printed page 103,
  matching the draft's own citation exactly, not the adjacent page 102 a
  naive line-context read might suggest): *"Un exemplaire lisible des
  renseignements fournis au commandant de bord doit être facile d'accès à
  l'agent des opérations aériennes, au personnel au sol désigné qui est
  chargé des opérations aériennes jusqu'à l'arrivée du vol"* — independently
  confirmed to be a routine, pre-arrival accessibility statement, not an
  emergency-triggered notification, exactly as the draft characterizes it.
- `grep -in "régulateur"` across the course returns hits only for unrelated
  senses (regulatory bodies, generic) — "régulateur de vols" as a phrase does
  not appear, the same pattern already independently confirmed for Functions
  7.6 and 7.7.
- **Confirmed exactly**: the routine-accessibility half is adjacent but not
  emergency-specific; the ATC-notification half is a clean, independently
  reconfirmed absence.

## (e) Practice book genuinely distinct — CONFIRMED via independent MD5 re-check against all nine other functions

Independently re-derived `md5` for Function 7.8's own practice book
(`09_KOST_DGR_CBTA_Practice_Book_Function_7.8_FR_2025.pdf` =
`7c66b841b9e6c5f4aafe5c7ac897cc3c`) and freshly re-derived `md5` for every
other function's practice book currently on disk, run directly against the
files rather than copied from any prior draft's citation:

| Function | Practice book MD5 |
|---|---|
| 7.1 | `20c06b5481669957131185b12afd86ad` |
| 7.2 | `7dee3dcf6b644daf29954770e6971928` |
| 7.3 (misfiled, = 7.1's) | `20c06b5481669957131185b12afd86ad` |
| 7.4 | `3e75aa010e214c98673ee88d8ab174f2` |
| 7.5 | `f40262cc4478e48782a2cdd7541045a2` |
| 7.6 | `80cf42f32ea1276ba5f07887990d0e3b` |
| 7.7 | `8230dd60c4ad1a6e684d56bdc1dda8f6` |
| **7.8** | **`7c66b841b9e6c5f4aafe5c7ac897cc3c`** |
| 7.9 | `43be30eb9aca670946e1f0da2766db3c` |
| 7.10 | `cf300e211bd43d8a720108e8713ca182` |

**Confirmed**: Function 7.8's own hash matches none of the other nine —
independently reconfirming the draft's "correctly filed, genuinely distinct,
no misfiling issue" finding, and independently reconfirming the practice
book's own content (agent-des-opérations role definition in Q10, three-part
NOTOC-analysis scenario in Q30) is self-consistently Function 7.8's own
flight-operations/dispatch material, read in full below.

## (f) Exam Q20 and Practice Q30 capstone claims — CONFIRMED by direct reading of the actual question text

**Exam Q20 — independently re-located and read in full, confirmed word for
word against the draft's description.** The question reads: *"Complétez la
NOTOC DGR : (une copie de la NOTOC est jointe). En utilisant les
informations ci-dessus, remplissez les champs suivants de la NOTOC :
Informations sur le vol... Description des marchandises dangereuses...
Emplacement dans l'avion... Instructions spéciales pour le capitaine..."*
followed by the worked shipment data: *Vol AF456, Expéditeur PhotoPro SARL,
ONU 3481, PSN "Batteries au lithium-ion emballées avec un équipement,"
quantité totale 9 kg de batteries réparties dans 3 colis, puissance 88 Wh
par batterie, Classe de danger 9, emplacement "Soute avant, position 12A
(avion-cargo mixte)."* This is confirmed to be exactly the full
NOTOC-completion exercise the draft describes, with every cited detail
(UN3481, 9 kg, 3 colis, 88 Wh, Class 9, position 12A) verified present and
accurate.

**Practice Q30 — independently re-located and read in full, confirmed word
for word against the draft's description.** The question reads: *"Vous
recevez la NOTOC suivant pour le vol AFR 512 – Paris CDG - Nairobi"*,
followed by a four-line table (UN1202 Gazole/Diesel Fuel, Classe 3, 30 L,
Soute avant; UN1845 Glace carbonique, Classe 9, 150 kg, Soute arrière;
UN3480 Batteries au lithium-ion, Classe 9, 50 kg, Soute arrière; UN1261
White Spirit, Classe 3, 40 L, Soute avant), then three sub-questions: (a)
*"Quelles marchandises dangereuses sont présentes à bord et à quelles
classes appartiennent-elles ?"*, (b) *"Quelles irrégularités ou points de
vigilance identifiez-vous dans ce NOTOC ?"*, (c) *"Quelles informations
essentielles doivent être confirmées par l'agent des opérations avant de
valider ce NOTOC au Commandant de bord ?"* — confirmed to be exactly the
three-part NOTOC-analysis scenario the draft describes, with every cited UN
number, class, quantity, and stowage location verified present and
accurate, and sub-question (c) independently confirmed to name "l'agent des
opérations" and "valider... au Commandant de bord" explicitly, directly
anchoring this function's own role.

**Practice Q10 — independently re-located and read in full, confirmed word
for word.** *"Selon la réglementation OACI/IATA, l'agent des opérations est
responsable de : ... c) Vérifier les informations dans la NOTOC et
s'assurer de la communication avec le Commandant de bord"* — confirmed as
the correct-answer option, exactly as the draft quotes it, independently
verified to be this function's own strongest, most explicit role-definition
statement.

**Practice Q29 — independently re-located and read in full, confirmed word
for word.** *"Qui doit effectuer un rapport lorsqu'il est découvert des
marchandises dangereuses non autorisées dans les bagages des passagers ?
(Ce rapport doit être transmis aux autorités compétentes de l'État de
l'exploitant et de l'État dans lequel l'incident s'est produit)"* with
options including *"c) L'exploitant"* (correct) and *"d) Les services de la
circulation aérienne"* (distractor) — confirmed exactly as the draft
describes, independently verified to be the closest genuine practice-book
match to leaf 6.2.1's own wording, sitting at the imperfect-fit boundary
with the over-taught reporting content the draft already flags.

**Over-taught reporting content (pp.112–116) — independently re-confirmed.**
Direct page-by-page reads of PDF pages 112–114 and 116 confirm, verbatim:
p.112 *"L'exploitant doit signaler tout cas où des marchandises dangereuses
non déclarées ou mal déclarées ont été découvertes dans le fret ou le
courrier"* (plus the baggage/passenger extension); p.113 the general
accident/incident reporting obligation; p.116 the Algeria/ANAC enrichment
(*"Pour l'Algerie, tous les compte-rendu sont adressés à : l'Agence
Nationale de l'Aviation Civile (ANAC), Siège social : Lot 225, Route
Nationale N°5, Rouiba, Alger, Algérie"*) — confirmed exactly as the draft
describes, with no official Block 7 leaf in Table 7.8.A to attach any of it
to, independently reconfirmed by part (a) above.

## Additional independent spot-checks performed this pass

- All twelve files in the Function 7.8 source folder independently
  re-hashed via `md5` and confirmed to match every hash the draft reports
  exactly: course `3794e231645a1f0ffb78b04675a3baf4`, exam
  `8422fcfa762b843502e0221c536163ff`, practice book
  `7c66b841b9e6c5f4aafe5c7ac897cc3c`, rubric
  `1b47a0e2a6ab3d201aeb0fac7221e60b`, Training Guidance PDF
  `88fca4d5aa6a0dca0000dbc64b0acbdb`, DGR 66th Edition Addendum
  `8ad20a8007e3268b6b5fb306baa67a3c`, Table 2.3.A `5128dcff81b9a4295705cf8218d0642a`,
  ICAO Doc 10147 `00615e9649a74f132f44d384804b20e3`, label reference sheet
  `8b63d112469b719e992e0b45da335024`, NOTOC form `4ea4e59b90face2e7b60f9495f19a7b5`,
  Saudia video `00562622c21b1b4ea7b6eaa697333173`, Module 4 video
  `0dc176eb4ac4ac53b936d585c4261220`.
- `pdfinfo` independently confirms course = 119 pages, exam = 7 pages,
  practice book = 12 pages, matching the draft's stated counts exactly.
  Course metadata independently re-confirmed: Author "Sidali KARA"; title
  slide (p.1) reads *"Règlementation pour le transport des marchandises
  dangereuses. (DGR IATA CBTA - Fonction 7.8) Agents des opérations
  aériennes et régulateurs de vols" / "Formatrice Boufas Yasmina" /
  "02/09/2025"*; p.5's "Objectifs de la formation" independently
  re-confirmed to explicitly name verifying DG information "dans le
  dossier de vol et sur la NOTOC," ensuring crew/service communication, and
  controlling loading-procedure conformity.
- Exam metadata independently re-confirmed verbatim: *"Vous avez 60 minutes
  pour répondre aux questions"*, *"Note de passage est : 80%"*.
- Course's own regulatory-baseline slide (p.25) independently re-confirmed
  verbatim: *"Réglementation pour le transport des marchandises dangereuses
  (IATA Dangerous Goods Regulations) — 66 ème Edition"* — confirming the
  course is built on the 66th Edition, not the current 67th/Addendum-1
  baseline, exactly as the draft states.
- `grep -i "divergence"` independently re-run across the exam and practice
  book: **zero** hits in both, independently reconfirming the draft's
  "0.3.3 taught but, for the first time in this program, entirely untested"
  finding (11 hits in the course itself, all on-topic, page-mapped to
  pp.58–62 exactly as the draft states).
- `grep -i "responsab"` independently re-run (joined-text, windowed) across
  the full course: 12 hits, every one tied to shipper (Expéditeur, DGR 1.3)
  or operator (Exploitant, DGR 1.4) duties/training, **none** to passenger
  responsibilities — independently reconfirming the 0.3.2 SOURCE GAP.
- "Subsidiaire" independently re-located: exactly **one** hit in the full
  course, at PDF page 99 (*"La classe ou la division ou les risques
  subsidiaires"*, inside the NOTOC content-field list) — matching the
  draft's page citation exactly and confirming the 0.4.3 thin/adjacent
  finding.
- Exam Q4's responsibility matrix ("Acceptation / Identification /
  Chargement / **Rédaction de la NOTOC**") and Practice Q11's parallel
  matrix ("Acceptation / Identification / Chargement / La formation")
  independently re-located and read in full, confirming the draft's own
  observation that Function 7.8's exam is the first in this program to put
  NOTOC-drafting directly into this standard responsibility-matrix question.
- Exam Q7 (reduced-mobility passenger electric wheelchair scenario), Q16
  (hidden DG in dentist equipment), and Q17 (Table 2.3.A five-item
  classification) all independently re-located and read in full, confirmed
  to match the draft's citations exactly.
- "Fret ou bagages contaminés" (pp.110–111) independently re-located and
  read in full, confirmed to match the draft's citation for leaf 6.2.1's
  imperfect-fit evidence exactly.
- 0.6.2's own course quote (p.106: *"Pour toute expédition avec déclaration
  de marchandises dangereuses exigée, l'exploitant doit s'assurer que les
  renseignements appropriés sont immédiatement disponibles en tout temps...
  Ces renseignements doivent être à la disposition du commandant de
  bord"*) independently re-located and confirmed verbatim.

## Outcome

**CONFIRMED — no correction required to the 23-leaf-sub-task enumeration,
the Block 0/6.2-only structure (no Block 7 at all, independently
re-verified with a dedicated below-the-table crop specifically built to
rule out a missed/truncated block), the star ratings (uniform ★ across
Block 0 including the top-level "0" row, blank top-level "6"/"6.2"
block-summary rows, uniform ★★★ across all five 6.2.x leaves), the Block 0
composition/wording finding (18 items, identical route to Function 7.6's,
sixth distinct 0.2.2 variant), the wrong-function Cadre CBTA finding, the
two SOURCE GAPs (6.2.5 full, 6.2.4 partial), or the exam Q20/practice Q30
capstone-item claims in `docs/DGR_STAGE1_FUNCTION_7.8_DRAFT.md`.** One
minor, non-substantive correction is recorded above (the Cadre CBTA
document's own supporting word-frequency counts: "chargement" is 8, not 6
as originally stated; "manutention" is 10, not 9) — it does not change the
wrong-function conclusion, any Stage 1 sub-task count, or any SOURCE GAP
finding. No SOURCE CONFLICT with any other function's already-committed
draft was found.

`docs/DGR_STAGE1_FUNCTION_7.8_DRAFT.md` may now be treated as
**cross-validated** (second pass complete) rather than first-pass-only, and
is the basis for the Stage 2A blueprint in
`docs/DGR_STAGE2A_FUNCTION_7.8_BLUEPRINT.md`. It remains **not** reviewed by
a qualified instructor, **not** accepted by ANAC, and **not** Tier
A–verified against the current 67th Edition/Addendum 1 text (the course is
confirmed built on the 66th Edition) — those gates are unaffected by this
pass and remain open.
