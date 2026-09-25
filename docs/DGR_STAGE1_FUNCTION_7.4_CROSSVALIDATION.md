# DGR Stage 1 — Function 7.4 — SECOND-PASS CROSS-VALIDATION — CONFIRMED

**Verdict: CONFIRMED**, with one minor precision addendum (does not change any
count or conclusion). An independent second pass re-read the same source
files cited in `docs/DGR_STAGE1_FUNCTION_7.4_DRAFT.md` (the first-pass Stage 1
draft) — including a 300dpi direct visual rendering of TABLEAU 7.4.A's own
two PDF pages (not just extracted text), a direct 300dpi rendering + text
extraction of TABLEAU 7.1.A for line-by-line Block 0 comparison, `md5`
checksums of the practice book against four other functions' practice books,
`grep`/page-count spot-checks of the 155-slide course, 20-question exam, and
20-question practice book, and a full re-open of the "Cadre CBTA" `.docx`.
Every load-bearing claim in the draft is verified accurate.

This file does not replace `docs/DGR_STAGE1_FUNCTION_7.4_DRAFT.md`; it
records the independent second pass against it, per the same two-pass
discipline Functions 7.1 and 7.3 used (draft → corrected/confirmed final).

## Method

All checks performed directly against the same folder the draft cites:
`/Users/mac/Documents/Fichiers/Algerie/CBTA final/yasmine cbta/wetransfer_supports-pedagogiques-dgr-cbta-kost-academy_2025-10-12_1842/COURS DGR-CBTA-IATA/DGR-FONCTION 7.4/`.

- `pdftoppm -r 300` rendering of the IATA "Orientations"/"Training Guidance"
  PDF pages carrying TABLEAU 7.4.A (PDF pp.29–30 / printed pp.25–26) as
  images, viewed directly (the star-rating column does not survive plain-text
  extraction, exactly as the draft notes).
- `pdftotext -layout` extraction of TABLEAU 7.1.A (PDF pp.25–26 / printed
  pp.21–22) for a line-by-line Block 0 wording diff against 7.4.A — the exact
  comparison the draft's "Block 0 cross-check" section describes performing.
- `pdftotext -layout` full extraction of the 155-slide course, the 8-page/
  20-question exam, and the 8-page/20-question practice book, with an `awk`
  form-feed page counter, `grep`-verified against the draft's own page
  citations.
- Re-extraction (via `textutil`) of the `09_Cadre_CBTA.docx` file inside
  `PACK COMPLET FORMATION CBTA - FONCTION 7.4/📁 09_Cadre_CBTA/` from
  `Archive.zip`, read in full.
- `md5` on the Function 7.4 practice book and four other functions' (7.1,
  7.2, 7.3, 7.5) practice books.

## (a) TABLEAU 7.4.A content and star-rating column — CONFIRMED

Rendered `11_IATA_CBTA_Dangerous_Goods_Training_Guidance_Edition1_2023_FR.PDF`
pages 29–30 (printed pages 25–26) as 300dpi images and read them directly.

- Page 25: Block 0 "Compréhension des principes de base des marchandises
  dangereuses" carries a uniform **★** (single star) on every row, from the
  top-level "0" row down through every visible leaf on this page: 0.1.1–0.1.4,
  0.2.1–0.2.3, 0.3.1, 0.3.3 (visibly skips 0.3.2, jumping straight from 0.3.1
  to 0.3.3), 0.4.1, 0.4.2. The single qualification column is headed **"Gérer
  le préchargement du fret"** — confirmed, single-column scheme like 7.2's and
  7.3's tables.
- Page 26 (continuation): 0.4.3, 0.5.1–0.5.2, 0.6.1–0.6.2 all continue the
  uniform **★**. Block 4 "Gestion du préchargement du fret" (4.1.1–4.1.2,
  4.2.1–4.2.5) carries a uniform **★★★**. Block 6 "Transport du fret et des
  bagages" (6.1.1–6.1.6, 6.3.1–6.3.4 — **6.2 confirmed absent**, table jumps
  6.1 straight to 6.3) carries a uniform **★★★**. Block 7 "Collecte de
  données pour la sécurité" (7.1–7.4) carries a uniform **★★**.
- Leaf count independently re-tallied directly from the two rendered pages:
  Block 0 = 4+3+2+3+2+2 = **16**; Block 4 = 2+5 = **7**; Block 6 = 6+4 = **10**;
  Block 7 = **4**. **Total: 16+7+10+4 = 37**, confirmed independently,
  matching the draft's table exactly.

## (b) Block 0 divergence from 7.1/7.2/7.3 (16 items, not 17; 0.2.1/0.2.2
wording; 0.5.3 absent) — CONFIRMED

Directly extracted TABLEAU 7.1.A (PDF pp.25–26/printed pp.21–22) and compared
every Block 0 leaf's wording against TABLEAU 7.4.A's own wording (rendered
above), line by line:

| Leaf | 7.1.A wording | 7.4.A wording | Match? |
|---|---|---|---|
| 0.1.1 | Comprendre la définition | Comprendre la définition | Identical |
| 0.1.2 | Reconnaître le cadre juridique (mondial **et** national) | Reconnaître le cadre juridique (mondial**,** national) | **Differs from 7.1.A** — but matches 7.2/7.3's own wording (comma, not "et"); see precision note below |
| 0.1.3 | Déterminer l'application et la portée | Déterminer l'application et la portée | Identical |
| 0.1.4 | Faire la distinction entre un danger et un risque | Faire la distinction entre un danger et un risque | Identical |
| 0.2.1 | Développer un flair pour les MD **interdites** | Développer un flair pour les MD **cachées** | **Differs — confirmed genuine wording change** |
| 0.2.2 | Reconnaître des MD **dangereuses potentiellement cachées** | Reconnaître les marchandises **potentiellement dangereuses** | **Differs — confirmed genuine wording change** (drops "dangereuses" from mid-phrase and "cachées" from the end; broadens the sub-task) |
| 0.3.1 | Clarifier le rôle individuel et collectif... | Clarifier le rôle individuel et collectif... | Identical |
| 0.3.3 | Reconnaître l'impact des divergences des États et des exploitants | (same) | Identical |
| 0.4.1 | Trouver de l'information générale sur les classes et les divisions | (same) | Identical |
| 0.4.2 | Comprendre les principes généraux des groupes d'emballage | (same) | Identical |
| 0.4.3 | Envisager de multiples dangers | (same) | Identical |
| 0.5.1 | Reconnaître les prescriptions de base concernant le marquage | (same) | Identical |
| 0.5.2 | Reconnaître les prescriptions de base concernant l'étiquetage | (same) | Identical |
| **0.5.3** | **Déterminer les documents exigés** | **— row does not exist —** | **Confirmed absent.** Table jumps directly from 0.5.2 to 0.6 in the rendered 7.4.A image |
| 0.6.1 | Créer une sensibilisation aux procédures d'urgence générales | (same) | Identical |
| 0.6.2 | Comprendre les exigences d'intervention d'urgence de l'employeur | (same) | Identical |

**Leaf-count re-confirmed: 16 for 7.4 (0.5.3 absent), vs. 17 for 7.1.A.**
0.3.2 is confirmed absent from **both** tables (same numbering gap in both,
not a 7.4-specific omission). The draft's central claim — that 7.4's Block 0
is mostly shared but genuinely diverges at 0.2.1/0.2.2 wording and at the
0.5.3 leaf's presence/absence — is **independently reconfirmed**, item by
item, not merely re-asserted.

**Precision note (does not change the draft's conclusion):** the draft states
0.1 "all four items" are "verbatim identical" to 7.1/7.2/7.3's Block 0. This
pass finds 0.1.2 specifically differs from **TABLEAU 7.1.A's own** wording
("mondial et national" vs. 7.4's "mondial, national") — though it does match
7.2/7.3's wording exactly, which is what the draft's own text actually
anchors its "verbatim identical" claim to when it says "confirmed by direct
text comparison against TABLEAU 7.1.A." This is the same class of
inter-function micro-variant `docs/DGR_STAGE1_FUNCTION_7.3_CROSSVALIDATION.md`
already documented (7.1 uses "et", 7.2/7.3 use a comma) — a cosmetic
IATA-source retypesetting difference, not a KOST-course artifact, and not
something that changes the leaf-count or the substantive 0.2.1/0.2.2/0.5.3
findings. Recorded here for precision only.

## (c) "Cadre CBTA" matrix — actively describes the WRONG function — CONFIRMED

Re-opened `PACK COMPLET FORMATION CBTA.docx/Archive.zip` →
`PACK COMPLET FORMATION CBTA - FONCTION 7.4/📁 09_Cadre_CBTA/📁 09_Cadre_CBTA.docx`
and read it in full via `textutil` text extraction. Independently confirmed,
word for word:

- Headed **"MATRICE DE COMPÉTENCES FONCTION 7.4"**, but every row is labeled
  "TÂCHE PNC" (Personnel Navigant Commercial = cabin crew) and every
  task/competency (T1 "Détecter incidents MD" via "Vigilance cabine", T4
  "Communiquer" via "jeux de rôle radio", T5 "Gérer passagers" via "leadership
  cabine", T6 "Coordonner équipage") describes **in-flight cabin-crew
  emergency-response duties**, not warehouse/ramp/ULD/cargo-hold handling.
- Its own "SPÉCIFICITÉS RÉGLEMENTAIRES FONCTION 7.4" section states, verbatim:
  **"IATA DGR - Tableau 1.5.A : Personnel de cabine d'aéronef de transport de
  passagers."** This is confirmed the exact wording the draft quotes — a
  named citation of a completely different IATA table for a completely
  different function.
- Further confirms the mismatch throughout: "Recyclage : Annuel," "Compatible
  avec recyclage PNC standard," "Simulations haute fidélité en environnement
  cabine," references to EASA Part-CC/FAA Part 121/JAR-OPS cabin-crew
  regulatory frameworks — none of which relate to cargo/ULD/aircraft-hold
  handling personnel.

**Confirmed: this document is not merely generic/templated — it is actively,
concretely wrong for Function 7.4**, exactly as the draft states. It
contributes zero usable evidence and was correctly excluded from the Stage 1
enumeration.

## (d) Three linked SOURCE GAPs (4.2.5/6.1.1/6.3.4) and the 6.1.6 partial gap — CONFIRMED

Full-text `grep` re-search of the 155-slide course (`03_KOST_DGR_CBTA_Course_
Function_7.4_FR_2025.pdf`), the 20-question exam, and the 20-question
practice book for physical-cargo-movement and flight-ops-notification
vocabulary:

- **Cargo-transport vocabulary** — `achemin*`, `convoy*`, `camion`,
  `tracteur`, `véhicule`, `chariot`, `tarmac`, `aire de trafic`, `piste`,
  `remorque`, `dolly`, `tractage`, `navette`: **zero matches** anywhere in the
  course, exam, or practice book. The generic `transport*` root returns many
  hits, but every one is either "transport aérien" (air transport, the
  regulatory domain generally), "indice de transport"/"transport index"
  (radioactive-materials TI concept, an unrelated Block 6.1.4 topic), or
  "marchandises transportées" (goods being carried, not the act of moving
  cargo between warehouse and aircraft). **No slide, exam question, or
  practice-book question anywhere addresses the physical movement of cargo
  between the warehouse and the aircraft as its own taught step.** This
  independently reconfirms the 4.2.5/6.1.1/6.3.4 SOURCE GAP for all three
  linked official sub-tasks.
- **Flight-ops/dispatch vocabulary** — `agent des opérations`, `régulateur de
  vols`, `dispatch`: **zero matches** anywhere in the course, exam, or
  practice book. The only `régulateur` hits found are "régulateurs de
  carburant" (fuel pressure regulators, an unrelated hardware term, slide
  p.??) and "nouvelles exigences des régulateurs" (regulatory bodies in
  general) — neither is the flight-dispatch role 6.1.6 names. By contrast,
  `commandant` (captain) returns 8 hits, all tied to the NOTOC
  slides (p.135–141) and the employer-emergency-info slide (p.??), confirming
  the draft's "captain half strong, dispatch half absent" characterization
  exactly.
- Page-number spot-checks: the "risques primaires ou subsidiaires" passing
  mentions cited by the draft for 0.4.3 were independently re-located at
  course pages 106 ("Les prescriptions relatives à la séparation
  s'appliquent à toutes les étiquettes de danger... qu'il s'agisse de risques
  primaires ou subsidiaires") and 137 ("La classe ou la division ou les
  risques subsidiaires" in the NOTOC content-field list) — both page numbers
  match the draft's own citations exactly, confirming no dedicated
  classification-stage (DGR 3.10-equivalent) treatment exists, only these two
  operational-context mentions.
- Exam Q16 ("Pourquoi est-il interdit de fumer à proximité des colis de
  matières...") independently re-located at exam text line 185; the word
  "fumer"/"fumée" in the course text appears only once, inside the emergency
  spill-response procedure step list ("Ne pas boire ni manger, ni fumer") —
  confirming the draft's SOURCE GAP note 8 (no dedicated fire-safety teaching
  point).
- Practice book Q17 ("Les manutentionnaires sont autorisés à ouvrir les colis
  de marchandises dangereuses...") independently re-located at practice-book
  text line 202; the word "ouvrir" does not appear anywhere in the course
  text — confirming the draft's SOURCE GAP note 7.

**All four findings in (d) are independently reconfirmed with zero
correction.**

## Additional independent spot-check: practice-book filing

`md5` of the Function 7.4 practice book
(`04_KOST_DGR_CBTA_Practice_Book_Function_7.4_FR_2025.pdf` =
`3e75aa010e214c98673ee88d8ab174f2`) compared against Function 7.1's practice
book (`20c06b5481669957131185b12afd86ad`, the file that turned out to be
misfiled into Function 7.3's own folder), Function 7.2's own practice book
(`7dee3dcf6b644daf29954770e6971928`), Function 7.3's folder's misfiled copy
(same hash as 7.1's, confirming that pre-existing finding again), and
Function 7.5's practice book (`f40262cc4478e48782a2cdd7541045a2`) — all four
are distinct from Function 7.4's own hash. **Reconfirms the draft's "correctly
filed, unique" finding** for Function 7.4's practice book.

## Outcome

**CONFIRMED — no correction required to the 37-leaf-sub-task enumeration, the
Block 0/4/6/7 structure, the star ratings, the Block 0 divergence findings
(16 items, 0.2.1/0.2.2 wording, 0.5.3 absence), the "Cadre CBTA" wrong-function
finding, or the four SOURCE GAP findings (4.2.5/6.1.1/6.3.4 cargo-transport;
6.1.6 dispatch-half) in `docs/DGR_STAGE1_FUNCTION_7.4_DRAFT.md`.** One
precision-level addendum is recorded above (0.1.2's cross-function wording
micro-variant relative to TABLEAU 7.1.A specifically) — it does not change
any count, mapping, or conclusion.

`docs/DGR_STAGE1_FUNCTION_7.4_DRAFT.md` may now be treated as
**cross-validated** (second pass complete) rather than first-pass-only, and
is the basis for the Stage 2A blueprint in
`docs/DGR_STAGE2A_FUNCTION_7.4_BLUEPRINT.md`. It remains **not** reviewed by
a qualified instructor, **not** accepted by ANAC, and **not** Tier
A–verified against the current 67th Edition/Addendum 1 text (the course is
confirmed built on the 66th Edition) — those gates are unaffected by this
pass and remain open.
