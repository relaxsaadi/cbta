# DGR Stage 1 — Function 7.7 — SECOND-PASS CROSS-VALIDATION — CONFIRMED

**Verdict: CONFIRMED.** An independent second pass re-read the same source
files cited in `docs/DGR_STAGE1_FUNCTION_7.7_DRAFT.md` (the first-pass Stage
1 draft) — including a fresh 300dpi full-page render plus a dedicated 600dpi,
2×-upscaled crop of TABLEAU 7.7.A's own qualification (★) column (produced
specifically because the task brief flagged this function's own ★★ Block 7
rating for confident re-checking, the same discipline Function 7.5's pass
used after the genuine single-star/double-star misread found and corrected
for Functions 7.9/7.10 on a nearby page of the same source document), an
independent full re-render of Function 7.6's own TABLEAU 7.6.A page for a
direct side-by-side Block 0 comparison, a systematic `pdftotext`+`awk`
cross-function extraction of the 0.2.1/0.2.2 wording for **all ten**
functions' tables in one pass, MD5 checksums, a direct `unzip -l` listing of
the low-rigor archive's 7.6/7.7/7.8 folders, and targeted keyword
(`grep -i`) spot-checks of the 131-slide course and 30-question practice book
for every claimed SOURCE GAP. Every load-bearing claim in the draft is
**verified accurate**. **No correction** to the 27-leaf-sub-task
enumeration, the block/sub-block structure, the star ratings (including the
specific ★★ Block 7 reading the task brief asked to be re-checked with
particular care), the Block 0 cross-function wording finding, the confirmed
absence of a Cadre CBTA matrix, the complementary NOTOC-role pairing with
Function 7.6, or the SOURCE GAP/partial-gap findings is required.

This file does not replace `docs/DGR_STAGE1_FUNCTION_7.7_DRAFT.md`; it
records the independent second pass against it, per the same two-pass
discipline Functions 7.1, 7.3, 7.4, and 7.5 used (draft →
corrected/confirmed final).

## Method

All checks performed directly against the same folder the draft cites:
`/Users/mac/Documents/Fichiers/Algerie/CBTA final/yasmine cbta/wetransfer_supports-pedagogiques-dgr-cbta-kost-academy_2025-10-12_1842/COURS DGR-CBTA-IATA/DGR-FONCTION 7.7/`,
plus a direct re-open of Function 7.6's own folder and the low-rigor archive
for cross-checks.

- `pdftoppm -r 300` full-page render of TABLEAU 7.7.A (PDF page 33, printed
  page 29 of `01_IATA_CBTA_Dangerous_Goods_Training_Guidance_Edition1_2023_FR.pdf.PDF`),
  read directly, followed by a dedicated `pdftoppm -r 600` re-render of the
  same page, cropped (via Pillow) to isolate just the qualification-level
  (★) column across every row of Block 0, Block 6.2, and Block 7, then
  upscaled 2× — specifically to rule out a single-star/double-star or
  double-star/triple-star misread on the exact Block 7 rows the task brief
  flagged, at higher confidence than the first-pass draft's 200dpi read.
- The identical page-33 render repeated against Function 7.6's own copy of
  the same guide PDF (MD5-confirmed identical to Function 7.7's copy,
  `88fca4d5aa6a0dca0000dbc64b0acbdb`), and Function 7.6's own TABLEAU 7.6.A
  page (PDF page 32) rendered fresh at 300dpi for a direct, independent
  side-by-side Block 0 comparison — not reused from the draft's own
  citations.
- `pdftotext -layout` full extraction of the IATA Training Guidance PDF, with
  an `awk` form-feed page counter, used to build a single cross-function
  table of every one of the ten functions' TABLEAU 7.x.A own 0.2.1/0.2.2
  wording in one pass (a broader, independently-designed check than the
  draft's own function-by-function citations).
- `pdftotext -layout` full extraction of the 131-slide course (confirmed 132
  PDF pages via `pdfinfo`, matching the draft's "131 numbered + 1 blank"
  claim), the 20-question exam, and the 30-question practice book, with
  `grep -i` keyword spot-checks for every claimed SOURCE GAP/partial-gap
  term ("responsab"+"passager" co-occurrence, "régulateur", "agent des
  opérations", "circulation aérienne"/ATC, "contamin", "incompatib",
  "séparat"/"separat").
- `unzip -l` direct listing of
  `/Users/mac/Documents/Fichiers/14_ARCHIVES_ANCIENNES/Bureau_MacBookPro/PACK COMPLET FORMATION CBTA.docx/Archive.zip`'s
  `FONCTION 7.6/`, `FONCTION 7.7/`, and `FONCTION 7.8/` folders side by side.
- `md5` on the practice book and the Training Guidance PDF, compared against
  the draft's own reported hashes.

## (a) TABLEAU 7.7.A content and star-rating column — CONFIRMED, including the specific ★★ Block 7 reading

Located TABLEAU 7.7.A at PDF page 33 (printed page 29) via independent
form-feed page-counting (matches the draft's citation exactly), rendered it
first at 300dpi as a full page, then at 600dpi with a dedicated 2×-upscaled
crop isolating just the star column for direct row-by-row comparison.

- **Block 0** (row "0" through 0.6.2, 25 rows: the top-level "0" row, six
  sub-block header rows 0.1–0.6, and 18 leaf rows): every row carries a
  single **★**, confirmed both in the full-page read and the high-resolution
  crop, with no row showing two or three stars. Leaf composition confirmed
  exactly as the draft states: 0.1.1–0.1.4 (4), 0.2.1–0.2.3 (3), 0.3.1–0.3.3
  (3, including 0.3.2 present and active), 0.4.1–0.4.3 (3), 0.5.1–0.5.3 (3),
  0.6.1–0.6.2 (2). **Count: 4+3+3+3+3+2 = 18, confirmed.**
- **Bare top-level "6" and "7" block-name rows are blank** (no star glyph at
  all) in both the full-page render and the high-resolution crop — confirmed
  exactly as the draft describes this as an "inconsistently populated"
  formatting characteristic of IATA's own table, not a claim these blocks
  are zero-rated.
- **Sub-block 6.2** ("Gérer les marchandises dangereuses avant et pendant le
  vol") and its five leaves (6.2.1–6.2.5): every row carries a clearly
  distinct **★★★** — three separate, individually countable star glyphs,
  confirmed in the same high-resolution crop, sitting directly above Block
  7's rows in one continuous image so the two ratings are not artifacts of
  separate crops/rendering passes. **Count: 5, confirmed.**
- **Block 7** ("Collecte de données pour la sécurité"): 7.1, 7.2, 7.3, 7.4
  each carry exactly **★★** — two clearly distinct, individually countable
  star glyphs on every row. **This is the specific claim the task brief
  asked to be re-verified with particular confidence, given this function's
  own draft already reporting ★★ here and the precedent of a genuine
  single-star/double-star misread found and corrected for Functions
  7.9/7.10 on a nearby page of the same document.** Independently
  reconfirmed at 600dpi with a dedicated 2×-upscaled close-up crop showing
  Block 0's single stars, Block 6.2's triple stars, and Block 7's double
  stars all in one continuous image — the ★★ reading is unambiguous and not
  a rendering artifact. **Count: 4, confirmed.**
- **Total: 18 + 5 + 4 = 27, confirmed independently**, matching the draft's
  own total exactly.
- **Page-overflow check confirmed:** PDF page 34 was independently re-rendered
  and found to contain TABLEAU 7.8.A in full (a different function's table,
  beginning "7.8 Fonction : Agents des opérations aériennes et régulateurs
  de vols") — TABLEAU 7.7.A does not continue onto a second page, confirming
  the draft's claim.

## (b) Block 0 identical count/structure to Function 7.6, non-verbatim wording at 0.2.1/0.2.2 — CONFIRMED

Independently re-rendered Function 7.6's own TABLEAU 7.6.A page (PDF page 32
of the identical, MD5-matched guide document) at 300dpi and read it directly
side by side with Function 7.7's page 33 render:

- **Function 7.6's Block 0 is independently confirmed to be 18 items**
  (0.1=4, 0.2=3, 0.3=3 with 0.3.2 present, 0.4=3, 0.5=3, 0.6=2), the identical
  count/structure already confirmed for Function 7.7 above — re-derived
  directly from Function 7.6's own page image, not copied from the 7.7
  draft's citation of the (not-yet-cross-validated) 7.6 draft.
- **0.2.1 wording is identical between the two functions**: both read
  "Développer un flair pour les marchandises dangereuses interdites" —
  confirmed by direct visual comparison of both rendered pages.
- **0.2.2 wording genuinely differs, confirmed by two independent methods
  agreeing exactly:**
  - Direct visual read of Function 7.6's own rendered page: **"Reconnaître
    les marchandises potentiellement cachées"** — the shortened wording,
    missing "dangereuses" from the middle, exactly as the draft describes.
  - Direct visual read of Function 7.7's own rendered page: **"Reconnaître
    les marchandises dangereuses potentiellement cachées"** — the full
    wording, matching 7.1/7.2/7.3.
  - A separately-designed, broader check — an `awk`-scripted extraction of
    every one of the **ten** functions' own 0.2.1/0.2.2 wording from a single
    pass through the guide's full text — independently reproduces the same
    result: 7.1/7.2/7.3/7.6/7.7/7.9/7.10 all read "interdites" at 0.2.1
    (7.4/7.5 alone read "cachées"); at 0.2.2, only **Function 7.6** drops
    "dangereuses" ("...marchandises potentiellement cachées"), while
    7.1/7.2/7.3/7.5/7.7/7.9/7.10 all carry the full "...marchandises
    dangereuses potentiellement cachées" wording, Function 7.4 reads the
    broadened "...marchandises potentiellement dangereuses" (no "cachées" at
    all), and **Function 7.8** — independently confirmed in this same pass —
    reads yet another variant, "...marchandises dangereuses non déclarées
    potentiellement cachées," exactly matching the draft's own forward-looking
    note about Function 7.8's table.
- **Conclusion independently reconfirmed**: two functions sharing an
  identical Block 0 leaf count and numbering shape (7.6 and 7.7) genuinely
  differ in one leaf's exact wording (0.2.2) while matching exactly at an
  adjacent leaf (0.2.1) — not a text-extraction artifact, verified by direct
  image inspection of both functions' own table pages plus an independently
  designed ten-function cross-check.

## (c) "Cadre CBTA" archive folder — confirmed absent for Function 7.7 — CONFIRMED

Ran `unzip -l` directly against
`/Users/mac/Documents/Fichiers/14_ARCHIVES_ANCIENNES/Bureau_MacBookPro/PACK COMPLET FORMATION CBTA.docx/Archive.zip`
and compared the full folder listings for `FONCTION 7.6/`, `FONCTION 7.7/`,
and `FONCTION 7.8/` side by side, independently of the draft's own prose
description:

- **`FONCTION 7.7/` contains exactly seven sub-folders**
  (`01_POWERPOINT_PRESENTATION`, `02_GUIDE_FORMATEUR`,
  `03_GUIDE_PARTICIPANT`, `04_EXERCICES_ET_SCENARIOS`, `05_EVALUATIONS`,
  `06_GRILLES_EVALUATION`, `07_ATTESTATIONS_ET_LOGS`) — **no `08_` or
  `09_CADRE_CBTA` folder appears anywhere in the archive listing for this
  function.**
- **`FONCTION 7.6/` contains the same seven folders PLUS a `09_CADRE_CBTA`
  folder**, independently confirmed present in the listing.
- **`FONCTION 7.8/` contains the same seven folders PLUS an `08_CADRE_CBTA`
  folder** (differently numbered from 7.6's, as the draft notes), also
  independently confirmed present.
- **Confirmed exactly**: Function 7.7 is the genuine, plain absence the
  draft describes — not a differently-numbered folder, not a
  suspicious/wrong-function document requiring active-distrust handling like
  7.4/7.5/7.6/7.8's own Cadre CBTA files. Nothing exists to cross-check for
  this function.

## (d) Complementary NOTOC-role pairing with Function 7.6 — CONFIRMED

Independently re-extracted and read both functions' own exam PDFs in full
(`12_KOST_DGR_CBTA_Exam_Function_7.7_FR_2025.pdf` and
`01_KOST_DGR_CBTA_Exam_Function_7.6_FR_Rev00_2025.pdf`):

- **Function 7.7's exam Q17/Q18** (independently re-located, read in full):
  Q17 — *"En se référant au formulaire NOTOC ci-dessous, quelle est la
  position de chargement de l'UN2879"*; Q18 — *"En se référant au formulaire
  NOTOC ci-dessus, quelle marchandise dangereuse corrosive est chargée?"* —
  both keyed to a single attached, already-filled NOTOC form image. A
  genuine **NOTOC-reading/interpretation** capstone, confirmed word for word
  against the draft's description.
- **Function 7.6's exam Q20** (independently re-located, read in full):
  *"À partir des données suivantes concernant le vol AF 456 : Remplir la
  NOTOC (Une copie vierge du NOTOC ci-joint)"*, followed by four DG items
  (UN1203 gasoline, UN1072 oxygen, UN3373 biological substance Category B,
  UN1845 dry ice) with class/quantity/stowage-location data to transcribe
  onto a **blank** NOTOC form. A genuine **NOTOC-completion/issuance**
  capstone, confirmed word for word.
- **Confirmed**: these are directly complementary capstone tasks on the same
  underlying document — 7.6 (load planner) issues/completes the NOTOC from
  raw shipment data, 7.7 (flight crew) reads/interprets an already-completed
  NOTOC — exactly the pairing the draft describes, independently verified by
  reading both exams' actual question text rather than trusting the draft's
  characterization.

## (e) The three SOURCE GAPs/partial gaps and the Exam Q16/Practice Q25 finding — CONFIRMED

**0.3.2 "Comprendre les responsabilités des passagers" — CONFIRMED full
SOURCE GAP.** `grep -i "responsab"` across the full 131-slide course returns
8 hits, every one tied to shipper (Expéditeur, DGR 1.3) or operator
(Exploitant, DGR 1.4) duty wheels — zero co-occurrence with "passager"
anywhere in the course, independently confirmed by a targeted
context-window grep. No exam or practice-book question is framed around
passenger obligations either. Confirmed exactly as the draft states, now a
fourth consecutive function (after 7.5, 7.6, and this one) with this precise
gap in this program's ongoing pattern.

**6.2.1 "S'occuper des marchandises dangereuses non permises dans les
bagages" — CONFIRMED thin/adjacent, not a clean match.** `grep -i
"contamin"` independently re-locates the closest content at course p.123–124
("Fret ou bagages contaminés" — "Obligation de l'exploitant... Mesures
nécessaires pour lever le doute avant de poursuivre le chargement du bagage
ou du fret contaminé"), confirmed to be an operator/ground-side pre-loading
decision, not the flight crew's own in-flight response to non-permitted DG
in baggage. `grep -i "non permis"` returns zero hits anywhere in the course.
Confirmed exactly.

**6.2.4 "Informer l'agent des opérations aériennes/le régulateur de vols/le
contrôle de la circulation aérienne en cas d'urgence" — CONFIRMED partial,
one of three named parties.** Independently re-confirmed by three separate
keyword searches:
- `grep -i "régulateur"` returns exactly two hits in the whole course, one
  generic ("répondre aux nouvelles exigences des régulateurs") and one
  unrelated hardware term ("Régulateurs de carburant") — **"régulateur de
  vols" does not appear anywhere in the course**, confirmed.
- `grep -i "agent des opérations"` returns exactly one hit, in the routine
  pre-arrival NOTOC-accessibility context: *"Un exemplaire lisible... doit
  être facile d'accès à l'agent des opérations aériennes, au personnel au
  sol désigné..."* — not the emergency-notification context this leaf
  specifies, confirmed exactly.
- The ATC clause is independently confirmed present in the correct
  emergency context: *"Si la situation le permet, informer l'ATC des
  marchandises dangereuses transportées"* (Guide OACI — en vol section).
- **Confirmed exactly**: only the ATC third of this three-part leaf has
  direct, correctly-contextualized evidence.

**Exam Q16 and Practice Q25 — general DG-incompatibility content tested with
zero course coverage — CONFIRMED.** Independently re-located and read in
full: Exam Q16 — *"Les marchandises dangereuses incompatibles: ... c)
Doivent être séparées pour éviter toute interaction en cas de fuite"*
(correct answer); Practice Q25 — *"Les colis contenant des marchandises
dangereuses qui pourraient réagir dangereusement entre elles doivent être
physiquement séparés lorsqu'ils sont chargés sur des palettes ou dans la
soute de l'avion"* (True). `grep -i "incompatib"` returns **zero** matches in
both the course and the practice book. `grep -i "séparat\|separat"` across
the course returns five hits, every one tied to radioactive-material
minimum-separation-distance content (TI-based, DGR Table 10.9C/10.9D
territory) — never a general DG-incompatibility principle. Confirmed exactly
as the draft states: this is a standalone assessment-instrument finding, not
attributable to any of the 27 official leaf sub-tasks (no Block 4 exists in
Function 7.7's own table).

## Additional independent spot-checks performed this pass

- `pdfinfo` confirms the course PDF is 132 pages, matching the draft's "131
  numbered content slides + 1 blank closing page" claim.
- `md5` of the practice book
  (`09_KOST_DGR_CBTA_Practice_Book_Function_7.7_FR_2025.pdf` =
  `8230dd60c4ad1a6e684d56bdc1dda8f6`) and the Training Guidance PDF
  (`88fca4d5aa6a0dca0000dbc64b0acbdb`) both independently re-derived and
  match the draft's own reported hashes exactly.
- Practice Q30 (the capstone in-flight fire-alarm/NOTOC scenario)
  independently re-located and read in full: *"En vol, alarme feu en soute
  arrière. La NOTOC indique: Classe 3 – Liquides inflammables, 8 colis /
  Classe 5.1 – Agents oxydants, 2 colis. a) Décris la situation de risque
  combiné... b) les actions immédiates PNT et les conséquences possibles"* —
  confirmed word for word against the draft's description.
- Exam question count (20, numbered 1–20) and practice-book question count
  (30, numbered 1–30) both independently re-confirmed by direct line-level
  inspection of the extracted text, matching the draft's stated counts
  exactly.

## Outcome

**CONFIRMED — no correction required to the 27-leaf-sub-task enumeration,
the Block 0/6.2/7 structure, the star ratings (★ Block 0, ★★★ Block 6.2, and
specifically ★★ Block 7 — the reading the task brief asked to be
re-verified with particular confidence), the Block 0 cross-function wording
finding (18 items identical in count/structure to Function 7.6, non-verbatim
at 0.2.2), the confirmed absence of a Cadre CBTA archive folder for this
function, the complementary NOTOC-role pairing with Function 7.6, or the
three SOURCE GAP/partial-gap findings (0.3.2, 6.2.1, 6.2.4) and the
standalone Exam Q16/Practice Q25 finding in
`docs/DGR_STAGE1_FUNCTION_7.7_DRAFT.md`.** No error was found in this pass.

`docs/DGR_STAGE1_FUNCTION_7.7_DRAFT.md` may now be treated as
**cross-validated** (second pass complete) rather than first-pass-only, and
is the basis for the Stage 2A blueprint in
`docs/DGR_STAGE2A_FUNCTION_7.7_BLUEPRINT.md`. It remains **not** reviewed by
a qualified instructor, **not** accepted by ANAC, and **not** Tier
A–verified against the current 67th Edition/Addendum 1 text (the course is
confirmed built on the 66th Edition) — those gates are unaffected by this
pass and remain open.
