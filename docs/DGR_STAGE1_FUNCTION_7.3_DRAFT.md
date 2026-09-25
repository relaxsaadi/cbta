# DGR Stage 1 — Function 7.3 — CROSS-VALIDATED (second pass CONFIRMED)

**Function 7.3**: *Personnel chargé de traiter ou d'accepter des expéditions
de marchandises dangereuses.*

**Status: CROSS-VALIDATED — an independent second pass
(`docs/DGR_STAGE1_FUNCTION_7.3_CROSSVALIDATION.md`) re-read the same source
PDFs, re-rendered the TABLEAU 7.1.A/7.2.A/7.3.A pages as images, re-checked
MD5s, and re-derived the 33-leaf-sub-task count, the star ratings, the
3.1–3.3 (not 3.4) Block 3 activation, the practice-book SOURCE GAP, and the
0.4.3 coverage claim independently. Verdict: CONFIRMED, no correction to the
enumeration below required (one precision-only addition recorded in the
cross-validation file, not affecting any count or conclusion). This draft is
still not reviewed by a qualified instructor, not accepted by ANAC, and this
file alone is not a Stage 2A blueprint** — see
`docs/DGR_STAGE2A_FUNCTION_7.3_BLUEPRINT.md` for that. This file remains the
Function 7.3 counterpart to
`docs/RECOVERED_STAGE2A_CONTEXT.md` (Function 7.1) and
`docs/DGR_STAGE1_FUNCTION_7.2_DRAFT.md` (Function 7.2), produced independently
from Function 7.3's own source material per `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md`.
Do **not** assume Function 7.1's 44-subtask/3-block/two-column structure or
Function 7.2's 23-subtask structure apply here — they do not. Function 7.3 has
its own structure, derived below strictly from Function 7.3's own material,
and it turns out to differ from both in a genuine, source-confirmed way (see
"Official structure recovered" below).

This file records **Stage 1 only**: an enumerated, source-traced list of the
leaf-level sub-tasks Function 7.3's training actually covers. It does **not**
attempt a Stage 2A exam blueprint, does not draft/verify any exam questions,
and does not perform IATA DGR 67th Edition Tier A revalidation of any
specific regulatory reference cited by the KOST course. All regulatory
paragraph numbers below (e.g. "DGR 9.1.3", "DGR 3.10") are **as cited by the
KOST course slides themselves** — Tier B, not independently re-verified
against the current 67th Edition/Addendum 1 Tier A text in this pass. The
course itself is explicitly built on the **66th Edition** (its own title
slide says "66ᵉ édition", and it contains multiple dedicated "Changement IATA
66ème Edition 2025" slides), the same non-current baseline already flagged
for Function 7.2.

## Source artifacts read

All from
`/Users/mac/Documents/Fichiers/Algerie/CBTA final/yasmine cbta/wetransfer_supports-pedagogiques-dgr-cbta-kost-academy_2025-10-12_1842/COURS DGR-CBTA-IATA/DGR-FONCTION 7.3/`,
full text extracted with `pdftotext -layout` and read in full (course/exam/
rubric/Orientations guide section), plus two pages viewed as rendered PDF
images (TABLEAU 7.3.A's star-rating column, which does not survive plain
text extraction):

1. `03_KOST_DGR_CBTA_Course_Function_7.3_FR_2025.pdf` — **KOST training
   course, 348 slides, read in full** (via a page-split extraction so every
   slide's title and body could be traced to its exact slide number).
   Instructor: Boufas Yasmina, dated 02/09/2025. Title slide: "DGR IATA-CBTA
   - Fonction 7.3 — personnel chargé de traiter ou d'accepter des expéditions
   de marchandises dangereuses" — confirmed real, function-specific content,
   not boilerplate, and by far the largest of the three functions' courses
   examined so far in this program (117 slides for 7.2, 348 for 7.3).
2. `01_KOST_DGR_CBTA_Exam_Function_7.3_FR_Rev00_2025.pdf` — **KOST exam
   (F-KOST 05), 30 questions, 14 pages, read in full.** 3 hours, 80% pass
   mark — a materially larger/heavier exam than Function 7.2's (20 questions,
   45 minutes), consistent with Function 7.3's much larger course and its
   ★★★ (highest) qualification rating on its central block.
3. `13_KOST_DGR_CBTA_Assessment_Rubric_F-KOST-08_FR_2025.pdf` — **KOST
   grading scheme, read in full.** Same generic 40% formative / 60%
   summative weighting seen for 7.1/7.2; contains no task/sub-task-specific
   content, so it contributes no Stage 1 evidence — noted for completeness
   only.
4. `14_IATA_CBTA_Dangerous_Goods_Training_Guidance_Edition1_2023_FR.PDF` —
   **the same IATA "Orientations concernant la formation sur les
   marchandises dangereuses (CBTA)" guide already used for Functions 7.1 and
   7.2**, confirmed identical by MD5 checksum to the copy in the Function 7.2
   folder (`88fca4d5aa6a0dca0000dbc64b0acbdb`) despite being filed under a
   different name here (`..._Training_Guidance_...` vs 7.2's
   `..._Orientations_...`) — it is the same multi-function PDF, just renamed
   inconsistently between function folders. Read in full for this pass with
   direct visual inspection of PDF pages 28–29 (printed pages 24–25), which
   contain **TABLEAU 7.3.A**, IATA's own official generic task/sub-task list
   for exactly this function, with a qualification-level (★) column. This is
   the single most load-bearing source in this draft — see below.
5. `02_IATA_DGR_Table_2.3A_Passengers_Crew_FR_2023.pdf` — Table 2.3.A
   (passenger/crew provisions), read in full. Supporting/cross-reference
   only, same role as for 7.1/7.2.
6. `08_ICAO_Doc10147_Generic_Competency_Framework_DG_Personnel_FR.pdf` —
   confirmed identical by MD5 to the copy in the Function 7.2 folder
   (`00615e9649a74f132f44d384804b20e3`). Generic human-factors competencies,
   not function-specific task content — same supporting role as for other
   functions.
7. `09_IATA_DGR_Danger_and_Handling_Labels_FR.pdf` — hazard/handling label
   reference sheet, read in full (2 pages). Supporting reference for
   0.5.2/3.2.2.
8. `10_ICAO_DGR_Emergency_Response_Guidance_ERG_Codes_FR.pdf` — ERG code
   reference sheet (2 pages), read in full. Directly referenced by the
   course's emergency-response slides ("Code ERG mentionné dans la colonne N
   … Guide des mesures d'urgence de l'OACI (Livre rouge)") — supporting
   0.6.1.
9. `05_DGR_NOTOC_Notification_to_Captain_Form.pdf` — blank NOTOC form
   template (1 page, non-extractable as text — a scanned/image form),
   directly referenced by the course's "Notification au commandant de bord —
   DGR 9.5.1.1" / "Exemple de NOTOC" slides (p.179–180). Reference-only
   supporting document, not narrative training content.
10. `07_IATA_Safety_Information_for_Passengers_EN.pdf` — passenger safety
    card (2 pages, English), read for metadata; not referenced by name
    anywhere in the KOST course text extracted. Supporting/background
    reference only, contributes no distinct Stage 1 evidence.
11. `12_IATA_DGR_66th_Edition_Addendum_2025_FR.pdf` — DGR 66th Edition
    Addendum 1 (33 pages, title "DGR-66 Addendum 1 - FR - Final"), metadata
    checked. **Confirms** the course's own repeated internal claim that it is
    built on the 66th Edition — not the repo's current Stage 2B baseline
    (67th Edition 2026, Addendum 1 integrated). Not used as a source for any
    conclusion below and not reconciled with the current baseline — flagged
    for whoever does Function 7.3's eventual Tier A pass.
12. `06_DGR_Case_Study_Saudia_Flight_163_1980.mp4` — case-study video
    referenced by the course (slide p.13, "Vidéo vol Saudia 163") — not
    transcribed/watched in this text-based pass; its content is safety-case
    narrative, not new task/sub-task material, so this does not create a gap
    for Stage 1 purposes.
13. `11_DGR_Training_Module_4_Marking_and_Labelling.mp4` — a supplementary
    marking/labelling training video sitting in the folder; not explicitly
    cross-referenced by name in the extracted course slide text and not
    watched in this pass. Supporting-only, same non-gap treatment as the
    Saudia video.

### The file present as "the Function 7.3 practice book" is actually Function 7.1's — a genuine SOURCE GAP

The folder's only practice-book-shaped file is named
`KOST_DGR_CBTA_Practice_Book_Function_7.1_FR_2025.pdf`. Reading it confirms
it literally **is** Function 7.1's practice book, not Function 7.3's:
identical MD5 checksum
(`20c06b5481669957131185b12afd86ad`) to the file of the same name in the
`DGR-FONCTION 7.1/` folder, and its own title page reads *"Le personnel
chargé de préparer des expéditions de marchandises dangereuses"* — Function
7.1's title, not 7.3's — with 20 shipper-preparation-oriented questions
(classification, packing groups, marking) that do not match Function 7.3's
acceptance-procedure focus.

This is not a harmless duplicate: the Function 7.3 **course itself**
repeatedly instructs students to work specific question ranges in "the"
practice book — "Questions 1–2" (p.38), "3–5" (p.62), "6–12" (p.101), "13–18"
(p.119), "19–24" (p.178), and "25–30" (p.345) — which implies a genuine
Function 7.3 practice book of **at least 30 questions**, mirroring the exam's
30-question count, exists or existed. That document is **not present
anywhere in this folder**; only the misfiled Function 7.1 one (20 questions)
is. This draft therefore has **zero genuine Function 7.3 practice-book
evidence** — every "practice book" reference in the tables below is recorded
as absent/unavailable, not inferred from the misfiled file.

### "Cadre CBTA / Matrice des compétences" cross-check

Per `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md`'s 2026-08-25 discovery pass,
Function 7.3 was one of the functions where this lower-rigor document was
recorded as **missing entirely**. This pass **confirms that finding again**:
the Function 7.3 source folder listed above contains no file matching that
document class (no "Cadre CBTA", no separately assembled generic-labels
matrix) — only TABLEAU 7.3.A (IATA's own official document, item 4 above)
provides generic/structural evidence, exactly as was already true for
Function 7.2. There is nothing of the unreliable "Cadre CBTA" class to
cross-check against or warn about here.

## Official structure recovered — TABLEAU 7.3.A

IATA's "Orientations"/"Training Guidance" guide devotes section **7.3** to
this exact function: *"Fonction : Personnel chargé de traiter ou d'accepter
des expéditions de marchandises dangereuses"* (PDF p.28, printed p.24),
immediately followed by **TABLEAU 7.3.A**, IATA's own generic task list for
this function, continuing onto PDF p.29 (printed p.25). This has **one**
qualification-level column, headed **"Traitement/acceptation du fret"** —
the same single-column scheme as Function 7.2's Table 7.2.A, not Function
7.1's two-column (Classification/Préparation) scheme.

The table covers three of the framework's numbered top-level blocks — **0**,
**3**, and **7** — the same three blocks Function 7.2 uses, but with a
**materially different Block 3**: where Function 7.2's Table 7.2.A activates
only sub-block **3.4** (2 leaves, "traiter et accepter le fret *autre que*
des marchandises dangereuses" — i.e. detecting hidden/undeclared DG in
general cargo), Function 7.3's Table 7.3.A instead activates sub-blocks
**3.1, 3.2, and 3.3** (12 leaves total) and does **not** include 3.4 at all.
This is a genuine, source-confirmed structural difference, not smoothing: 7.2
is the "general cargo, detect hidden DG" function, while 7.3 is the
"shipments already declared/presented *as* dangerous goods, verify and accept
them" function — exactly matching Table 7.3.A's own descriptive text ("Les
employés chargés de traiter ou d'accepter des expéditions de marchandises
dangereuses doivent avoir les compétences voulues pour accomplir les tâches
visant à vérifier et à valider que les marchandises dangereuses présentées au
transport sont conformes… Ils peuvent travailler pour des transitaires de
fret, des agents d'assistance en escale ou des exploitants aériens.").

**Leaf-level sub-task count: 33**, distributed as:

| Block | Title | Qualification (★) | Leaf sub-tasks | Count |
|---|---|---|---|---|
| 0 | Compréhension des principes de base des marchandises dangereuses | ★ (1 star, uniform) | 0.1.1–0.1.4, 0.2.1–0.2.3, 0.3.1, 0.3.3, 0.4.1–0.4.3, 0.5.1–0.5.3, 0.6.1–0.6.2 | 17 |
| 3 | Traitement et acceptation du fret (sub-blocks 3.1, 3.2, 3.3 — **not** 3.4) | ★★★ (3 stars, uniform across all of 3.1/3.2/3.3) | 3.1.1–3.1.4, 3.2.1–3.2.5, 3.3.1–3.3.3 | 12 |
| 7 | Collecte de données pour la sécurité | ★★ (2 stars, uniform) | 7.1, 7.2, 7.3, 7.4 (no further decomposition in the source table) | 4 |
| **Total** | | | | **33** |

This is a **different total from both Function 7.1 (44) and Function 7.2
(23)** — a genuine structural finding to report, not a smoothing error. The
higher count relative to 7.2 comes entirely from Block 3 (12 leaves vs 2),
consistent with 7.3's much heavier documentation/package/checklist workload
as an actual DG-acceptance role, and matches the much larger course (348
slides vs 117) and heavier exam (30 questions/3 hours vs 20 questions/45
minutes) found for this function.

Notes on this structure:
- Block 0's 17 sub-tasks are **verbatim identical in wording and count** to
  both Function 7.1's and Function 7.2's own Block 0, confirmed by directly
  comparing the rendered TABLEAU 7.3.A image against the TABLEAU 7.2.A image
  captured on the same two PDF pages (7.2's table is printed immediately
  above 7.3's on PDF page 28) — same 0.1–0.6 grouping, same item wording,
  same `0.3.2` numbering gap (the table jumps 0.3.1 → 0.3.3, exactly as for
  7.1 and 7.2). This is the third independent confirmation (7.1, 7.2, 7.3
  all match) that Block 0 is IATA's shared "basic principles" block reused
  verbatim across functions, not a coincidence or an assumption carried
  over from the other drafts.
- All three active blocks (0, 3, 7) carry a **single uniform star rating**
  each (★, ★★★, ★★★ respectively) — there is no per-item variation within a
  block in Table 7.3.A, the same uniform-rating pattern already seen in
  Function 7.2's table.
- Block 3's full activation of 3.1/3.2/3.3 (and omission of 3.4) is the
  clearest evidence in this program so far that Blocks 1–4's sub-blocks are
  allocated differently to different functions depending on what that
  function's personnel actually do — 7.1 (shippers) uses Blocks 1–2
  (classification/packing preparation), 7.2 (general cargo acceptance) uses
  only 3.4 (hidden-DG detection), and 7.3 (declared-DG acceptance) uses
  3.1–3.3 (documentation/package/checklist verification for shipments
  already presented as DG). None of these three functions' Block
  3/1/2 allocations can be assumed from either of the other two.
- Block 7's four items (7.1–7.4) are leaf-level themselves, identical
  wording to 7.1's and 7.2's Block 7, same ★★ uniform rating as 7.2's (7.1's
  Block 7 rating was not separately recorded in the recovered 7.1 context).

## Sub-task enumeration with KOST source trace

Each row states the official IATA sub-task (from Table 7.3.A) and what was
actually found, verbatim-referenced by course slide number (of 348) or exam
question number (F-KOST 05, 30Q), in the real KOST Function 7.3 material.
Because the genuine Function 7.3 practice book is missing (see SOURCE GAP
above), there is no practice-book column with real content — it is omitted
except where explicitly noted as absent.

### Block 0 — Compréhension des principes de base (★, all rows)

| ID | Sub-task (official wording) | KOST course trace | Exam trace | Coverage assessment |
|---|---|---|---|---|
| 0.1.1 | Comprendre la définition | Slides "Généralités" (p.14–20), DG defined per DGR 1.0 as products/articles/substances presenting a danger to health/safety/property/environment, appearing in the DG list or classified per the regulation; "Article" vs "Substance" distinction (p.15–16); "pourquoi nous avons besoin de savoir tout ça" (p.18); historical-accident motivation slide (Pan Am 1973, Saudia 1980, ValuJet 1996, Bhopal 1984, UPS Dubai 2010) (p.20) | Exam Q1 | Strong — direct, near-verbatim match, plus unusually rich historical-accident framing |
| 0.1.2 | Reconnaître le cadre juridique (mondial, national) | Slides "Cadre juridique" (p.21–25): SCoETDG → AIEA → OACI → IATA hierarchy, each body's role explained individually; "Base Réglementaires"/"Structure du DGR de l'IATA" (p.26–31): sections, annexes (Annexe A Glossaire, Annexe B Nomenclature/IMP codes), DGR symbols | Exam Q2 | Strong — global framework explicit; no distinct Algeria/ANAC-specific slide found in this block (unlike 7.2's course, which had one at this point) — see note below |
| 0.1.3 | Déterminer l'application et la portée | Slides "Applicabilité" (p.32–33): DGR 1.2.1 scope (IATA members/associate members, multilateral traffic agreement parties, shippers/agents), DGR 1.2.4 (what the Regulation does *not* require of an operator) | — | Strong — direct match, plus the 1.2.4 "what it does not oblige" nuance not seen in the 7.1/7.2 drafts |
| 0.1.4 | Faire la distinction entre un danger et un risque | Slides literally titled "Faire la distinction entre un danger et un risque" (p.34–36): Risque/Danger definitions, chemical/radiation/biological hazard examples, flammable-liquid worked example (gasoline); exercise (p.37); Practice-book reference "Questions 1–2" (p.38, **book itself unavailable — see SOURCE GAP**) | — | Strong — verbatim title match |

| ID | Sub-task | KOST course trace | Exam trace | Coverage |
|---|---|---|---|---|
| 0.2.1 | Développer un flair pour les marchandises dangereuses interdites | Slides "Types" of DG diagram (p.39); "Marchandises dangereuses interdite en toute circonstance" DGR 2.1/4.2 (p.40–41: explode/dangerous heat/toxic gas/flammable-corrosive gas criteria); "interdite sauf dérogation" DGR 2.1.2 (p.42): radioactive materials, listed-prohibited UN numbers, infected live animals, PG I vapour-toxicity liquids, ≥100°C liquids/≥240°C solids; "interdites sauf dérogation, interdites sauf approbation" (p.43–44): Approvals (DGR 1.2.5), Derogations (DGR 1.2.6), Exceptions (DGR 1.2.7) | Exam Q7 | Strong — more granular treatment (four separate prohibition/approval/derogation/exception categories) than 7.1/7.2's material on the same sub-task |
| 0.2.2 | Reconnaître les marchandises dangereuses potentiellement cachées | Slides "Reconnaissance des Marchandises dangereuses non déclarées" DGR 2.2/2.2.4 (p.57–60): definition, COMAT examples (chemical oxygen generators, compressed gases, flammable liquids), AOG parts/automobiles/dental equipment/diagnostic samples/fuel regulators/refrigerators/repair kits/test samples, prevention recommendations (train staff, posters, verbal questioning, baggage inspection, SDS request); exercise (p.61: dentist chair, diving equipment, toolkit, paint) | Exam Q17, Q19 | Strong |
| 0.2.3 | Être au courant des dispositions s'appliquant aux passagers | Slides "MD transportées par les passagers et l'équipages" DGR 2.3/2.3.A (p.45–48): explicit pointer to "2.3 et du tableau 2.3.A", lithium-battery-installed-baggage prohibition example (>0.3g lithium metal/2.7 Wh); "MD par voie postale" DGR 2.4 (p.49); "Limites" — passenger vs cargo provisions comparison (p.53–54); exercise on Table 2.3.A scenarios (lithium battery 120 Wh, gas lighters, medical oxygen) (p.55–56) | Exam Q5 (reduced-mobility passenger's lithium-battery wheelchair — spare batteries, stowage, captain notification), Q9 (alcoholic beverage cabin limit), Q11 (matches/lighters to Venezuela) | Very strong — the exam devotes three separate, materially worked questions to this sub-task (more than any other function's exam seen so far), consistent with an acceptance role needing to recognize passenger-side exceptions when cargo/baggage interfaces occur |

| ID | Sub-task | KOST course trace | Exam trace | Coverage |
|---|---|---|---|---|
| 0.3.1 | Clarifier le rôle individuel et collectif des parties prenantes dans la chaîne d'approvisionnement | Slides "Rôle et responsabilité" (p.63–67): shipper duties DGR 1.3 (compliance, then a 9-item wheel: transport autorisé, identification, classification, emballage, marquage, étiquetage, déclaration, conservation 3 mois, formation); operator duties DGR 1.4 (acceptation, chargement, entreposage, inspection, renseignement urgence, compte rendu, conservation documents, formation); employee/passenger information duties DGR 1.4.2–1.4.5; training DGR 1.5 (initial + biennial refresher + mandatory test) | Exam Q4 (responsibility matrix: acceptance/identification/loading/marking-labelling, expéditeur vs exploitant) | Strong |
| 0.3.3 | Reconnaître l'impact des divergences des États et des exploitants | Slides "Divergences d'États et d'Exploitant" DGR 2.8 (p.68–74): State variation example (ITG = Italy), Operator variation example (AH = Air Algérie), restriction-hierarchy diagram (OACI→IATA→État→Exploitant), two dedicated "Changement IATA 66ème Edition" slides on Canada's variation changes; exercise (p.75–76) | — | Strong — and reinforced later at the acceptance-procedure stage (3.1.4/3.2.5, with named Pakistan/Colombia examples — see Block 3 below), giving this sub-task unusually deep, applied treatment for an acceptance-role function |

| ID | Sub-task | KOST course trace | Exam trace | Coverage |
|---|---|---|---|---|
| 0.4.1 | Trouver de l'information générale sur les classes et les divisions | Slides "Les classes des marchandises dangereuses" DGR 3.0.2 (p.77–94): all 9 classes/divisions with IMP codes and worked examples (explosives 1.1–1.6 + compatibility groups 3.1.4, gases 2.1–2.3 + priority rule 3.2.4, flammable liquids 3.3 with flash-point/boiling-point definitions, solids 4.1–4.3, oxidizers/organic peroxides 5.1–5.2, toxic/infectious 6.1–6.2 incl. Category A/B, radioactive 7 incl. fissile, corrosives 8, miscellaneous/environmentally-hazardous 9); DGR Section 4 identification (p.108–117): the ~3,000-entry DG list, PSN rules, numeric list DGR 4.3, list columns A–N, special provisions DGR 4.4 with worked examples, 66th-edition list changes (new UN numbers for Li-ion/Li-metal/sodium-ion vehicles and batteries) | Exam Q3, Q8, Q10, Q13, Q23, Q27 | Very strong — the single most extensively developed sub-task in the course by slide count |
| 0.4.2 | Comprendre les principes généraux des groupes d'emballage | Slide "Groupes d'emballage" DGR 3.0.3 (p.98): PG I/II/III degree-of-danger table; reinforced quantitatively through Section 5/6 packaging-instruction material (p.120–142, 138–155) which goes considerably deeper than "general principles" (types of packaging, UN-spec packaging codes, Q-value calculation for combination packaging, overpack rules, packaging performance tests) | Exam Q6, Q12, Q20, Q22, Q25 | Very strong, and — as for 7.1/7.2 — a depth note: the course and exam go well beyond the "general principles" framing of this ★-rated sub-task into practical packaging-instruction-level calculation (e.g. Q22's "how many drums are needed" fibre-drum calculation), better justified by this function's ★★★ Block 3 package-verification duties than by 0.4.2 alone |
| 0.4.3 | Envisager de multiples dangers | Slides "Classification des matières présentant des dangers multiples" DGR 3.10 (p.95–97): primary vs subsidiary hazard determination, Table 3.10.A (used when both hazards fall in Classes 3/4/8 or Divisions 5.1/6.1), worked example (Class 8 PG II liquid + Class 3 PG II), exceptions DGR 3.10.2(a)-(f) (Classes 1/2/7, Division 5.2/6.2, Division 4.1 self-reactives) | — | **Strong — a genuine positive structural difference from Function 7.2, where this identical sub-task was a confirmed SOURCE GAP.** Function 7.3's course dedicates three full slides with a worked example and explicit exceptions list; no equivalent existed anywhere in the Function 7.2 material |

| ID | Sub-task | KOST course trace | Exam trace | Coverage |
|---|---|---|---|---|
| 0.5.1 | Reconnaître les prescriptions de base concernant le marquage | Slides "Marquage et Étiquetage" intro (p.143); "Marquage des emballages de spécification ONU" DGR 6.0.4 (p.144–147): visible/legible/durable/weather-resistant criteria, UN-mark meaning/limits; "Format des marques" DGR 6.0.4.2, combined/single-packaging marking examples (p.148–152); DGR 7.1.2/7.1.4 marks of use (p.156–165): general marking DGR 7.1.4.1, environmentally-hazardous marking DGR 7.1.5.3, lithium-battery mark DGR 7.1.5.5, other-regulation marks DGR 7.1.5.6, overpack marking DGR 7.1.7 | Exam Q18 (partial — marking/labelling purpose combined) | Strong — considerably more developed than the equivalent 7.1/7.2 slides (dedicated Section 6 + Section 7.1 treatment, not a single summary slide) |
| 0.5.2 | Reconnaître les prescriptions de base concernant l'étiquetage | Slides "Étiquetage" DGR 7.2.2.2 (p.166): two label types; "Les étiquettes de danger" (p.167), example label (p.168); "Quantités limitées" marking/labelling DGR 7.1.4.2 (p.169); "Apposition des étiquettes" DGR 7.2.6 (p.170); "Autre étiquetage" (p.171–172): consumer/chemical-hazard, GHS pictograms; "Etiquette de manutention" (p.173); plus dedicated label reference sheet (source item 7) | Exam Q3, Q15, Q16, Q18 | Very strong |
| 0.5.3 | Déterminer les documents exigés | Slides "Identifier la documentation requise" DGR 8.0.1 (p.174: DGD purpose/exceptions); "Lettre de transport aérien (LTA)" DGR 8.2 (p.174–175): handling-information box wording, "Documents supplémentaires" DGR 8.3; exercises (p.176–177); Practice-book reference "Questions 19–24" (p.178, **book itself unavailable**) | Exam Q26 (dry-ice AWB "Nature and Quantity of Goods" wording) | Strong |

| ID | Sub-task | KOST course trace | Exam trace | Coverage |
|---|---|---|---|---|
| 0.6.1 | Créer une sensibilisation aux procédures d'urgence générales | Slides "Notification au commandant de bord" DGR 9.5.1.1 / NOTOC example (p.179–180, supported by source item 9's blank NOTOC form); "Information sur l'intervention d'urgence" DGR 9.5.1.2 (p.181–182): ERG code in column N of the DG list, ICAO Emergency Response Guidance ("Livre rouge") — matching source item 8; detailed 5-step spill/body-contact response procedure (p.183–185); this entire block is **repeated verbatim later** in the radioactive-material section (p.339–344) with additional radioactive-specific caveats (medical priority over radiological concerns; radioactivity does not change flammability) | Exam Q14 | Strong — taught twice (general + radioactive-specific), the deepest emergency-response treatment seen in this program so far |
| 0.6.2 | Comprendre les exigences d'intervention d'urgence de l'employeur | Same slides as 0.6.1 (p.182, repeated p.341): "Doit être disponible partout où des MD sont manipulées… Responsabilité de l'exploitant pour l'information de tous les employés… doit également être établi par les autorités aéroportuaires" | — | Adequate, **generic-awareness only** — same constraint already recorded for 7.1's and 7.2's 0.6.2: states that an employer procedure must exist and staff must be informed, without inventing or testing any specific employer's actual procedure |

### Block 3 — Traitement et acceptation du fret (★★★, sub-blocks 3.1–3.3 only; 3.4 does not appear in this function's table)

This is the course's dominant focus by slide count (roughly p.206–267, then
**repeated in full for radioactive-material shipments** at p.299–336) and by
exam weight (Q21, Q24, Q26–Q30 all test this block directly, several as
multi-part worked scenarios). The course walks through IATA's own
recommended acceptance checklist point-by-point (explicitly citing checklist
items 1 through 48 across the DGD/LTA/package-verification slides), which is
unusually granular sourcing compared to what was found for 7.1/7.2.

| ID | Sub-task | KOST course trace (non-radioactive pass) | KOST course trace (radioactive-specific repeat) | Exam trace | Coverage |
|---|---|---|---|---|---|
| 3.1.1 | Vérifier la Déclaration de l'expéditeur | Slides "Vérifier la déclaration de l'expéditeur" (p.224–241, **18 slides**): DGR 8.1.6 form-completion instructions, checklist items 1–24 walked through individually with worked examples (NEQ item 15, APIO/Overpack items 16–17, multiple-overpack item 17.3, lithium-battery items 18–19, Div 5.2 item 22, fireworks item 22, signature item 23, item 24) | Slides "Vérifier la déclaration de l'expéditeur" (p.303–316, **14 slides**), radioactive-specific worked fields (activity, TI, special form certificate, emergency contact) | Exam Q29 (complete IATA non-radioactive acceptance checklist from given DGD fields), Q30 (complete radioactive acceptance checklist) | Very strong — the single most extensively covered leaf item in the whole function (32 slides across both passes), matching its ★★★ rating |
| 3.1.2 | Vérifier les autres documents de transport (p. ex. lettre de transport aérien) | Slides "Vérifier la lettre du transport LTA" (p.242–244): DGR 8.2/TACT rules/CSC Resolution 600(a), handling-info box wording, mixed-consignment piece count, checklist items 25–27 | Slides "Vérification des autres documents de transport - LTA" (p.317–319) | Exam Q26 | Strong |
| 3.1.3 | Vérifier les autres documents (dérogations, approbations, etc.) | Slides "Vérification des autres documents : (exemptions, approbations, etc.)" (p.245–246): DGR 8.3 supplementary documents (A1/A2 special-provision approvals, tank approvals, Div 4.1/5.2 approvals, derogations under 1.2.6) | Slides "Vérification des autres documents : (approbations, …)" (p.320) | — | Strong |
| 3.1.4 | Vérifier les divergences des États et des exploitants | Slide "Vérifier les divergences de l'État/Exploitant" (p.247): named worked examples — Pakistan state variation PKG-02 (hazard-label English-text requirement), Lanco (Colombia) operator variation L7-06 (label placement on package sides) | Slides "Vérifier les divergences de l'État et de l'exploitant" (p.321–322) | — | Strong — concrete, named, different examples from the 0.3.3 ones (Italy/Air Algérie), showing this sub-task is taught with its own distinct evidence rather than just repeating 0.3.3 |
| 3.2.1 | Vérifier les marques | Slides "Vérifier les marques" (p.248–249): marks must match the DGD and be clearly visible; checklist items 32–41 worked examples (minor-punctuation tolerance, net-quantity exemptions for single/identical-multiple packages, ID 8000/Class 7 exemption) | Slides "Vérifier les marques" (p.323–324, 326) | — | Strong |
| 3.2.2 | Vérifier les étiquettes | Slide "Vérifier les étiquettes" (p.250–251): labelling per 10.7.2 (radioactive) / 7.2 (other DG); checklist items 42–48 (This-Way-Up orientation labels for combined/overpacked liquids, obliteration of irrelevant prior labelling) | Slide "Vérifier les étiquettes" (p.325) | Exam Q15 (label-photo interpretation) | Strong |
| 3.2.3 | Vérifier le type d'emballage | Slide "Vérifier le type de colis" (p.253): packaging-specification letter must match the required packing group; outer/inner packaging conformity to the applicable packing instruction | Not given a separately titled slide in the radioactive-specific repeat (see SOURCE GAP note 3 below) | Exam Q22, Q25 | Strong in the primary pass; not independently reinforced for the radioactive case in this course, though Section 10's own Type A/B/C package-classification material (p.280–293) covers radioactive package-type verification in more depth than a repeated slide would |
| 3.2.4 | Vérifier l'état du colis | Slide "Vérification de l'état du colis" (p.254): package/overpack/freight-container/ULD must not leak and show no sign of compromised integrity | Slide "Vérification de l'état du colis" (p.328) | — | Adequate — a single, short but clear slide in each pass |
| 3.2.5 | Vérifier les divergences des États et des exploitants | Slide "Vérifier les divergences de l'État/exploitant" (p.255): same Pakistan PKG-02 / Lanco L7-06 named examples repeated at the package-verification stage | Slides "Vérifier les divergences de l'État et de l'exploitant" (p.329–330) | — | Strong (shares its evidence base with 3.1.4 — see coverage note below) |
| 3.3.1 | Remplir la liste de contrôle pour l'acceptation | Slides "Remplir la liste de contrôle pour l'acceptation" (p.256–259): DGR 9.1.3.1 mandatory-checklist requirement, 9.1.3.1 notes (ULD/overpack exceptions), minor-discrepancy tolerance rule, rejection-comment/verifier-identification fields (9.1.3.2), Table 9.1.A (which items are exempt from full acceptance procedures), dry-ice-specific checklist variant | Slides "Compléter la liste de contrôle de l'acceptation" (p.331–333) | Exam Q21 (30 kg sodium chlorate acceptance decision), Q29, Q30 | Very strong — matches ★★★ rating, the exam's two most elaborate scenario questions (Q29/Q30, each with a blank checklist form attached) test exactly this sub-task |
| 3.3.2 | Fournir les renseignements sur l'expédition pour la planification du chargement | Slides "Planification du chargement"/"Fournir les renseignements…" (p.260–263): DGR 9.3.2.1 separation notification duty, Table 9.3.A (segregation between packages), lithium-battery PI 965/968 Section IA/IB segregation rule (must not be loaded with explosives/Div 2.1/Class 3/Div 4.1/Div 5.1), dry ice/cryogenic-liquid/self-reactive/expandable-polymer/magnetized-material/ULD notifications | Slides "Fournir des informations sur les expéditions pour…" (p.334–335) | Exam Q24 (Division 6.1+Class 3, Division 4.1+Class 8, Class 3+Class 8, Division 5.1+Class 3 co-loading questions), Q28 (radioactive TI-based horizontal separation distance) | Very strong |
| 3.3.3 | Conserver les documents | Slide "Conserver les documents" DGR 9.8 (p.264): DGD/LTA/checklist/verifier-identification/NOTOC retention, minimum 3-month period, US divergence USG-13(b) 12-month period named example | Slide "Conserver les documents" (p.336) | — | Strong |

### Block 7 — Collecte de données pour la sécurité (★★, all four leaf items)

| ID | Sub-task | KOST course trace | Exam trace | Coverage |
|---|---|---|---|---|
| 7.1 | Signaler les accidents de marchandises dangereuses | Slide "Signaler les accidents et incidents impliquant des marchandises dangereuses" (p.264–265): operator must report to competent authorities of the operator's state and the state where it occurred, including incidents involving DG exempted from part of the regulation; repeated in summary at p.336–337 | Exam Q14 (partial — accident/incident response generically) | Adequate, **but shares one slide with 7.2 — see note below** |
| 7.2 | Signaler les incidents de marchandises dangereuses | Same slide as 7.1 (p.264–265) — accidents and incidents are not given separately titled treatment, exactly the same pattern already recorded for Function 7.2 | Exam Q14 (partial) | **Thin/merged evidence**, carried forward as a cross-function pattern (see SOURCE GAP note below), not newly discovered here |
| 7.3 | Signaler les marchandises dangereuses non déclarées ou mal déclarées | Slide "Signaler les marchandises dangereuses non déclarées/mal déclarées" (p.265–266) — near-verbatim title match, own dedicated content; repeated at p.337 | Exam Q19 (undeclared aerosol package discovered in transit — what class, why hidden, what action) | Strong — clean, distinct match, and the exam gives it its own worked scenario |
| 7.4 | Signaler les situations mettant en cause des marchandises dangereuses | Slide "Signaler les situations mettant en cause des marchandises dangereuses" DGR 9.6.5 (p.266–267) + "Procédures générales… Pour l'Algérie, tous les compte-rendu sont adressés à: l'Agence Nationale de l'Aviation Civile (ANAC)" (p.338) — same Algeria/ANAC enrichment already seen in Function 7.2's material | — | Strong — verbatim title match plus the genuine Algeria-specific enrichment |

## Explicit SOURCE GAP notes

1. **No genuine Function 7.3 practice book is available — SOURCE GAP.** The
   file present under that name in the source folder is Function 7.1's
   practice book (confirmed by identical MD5 checksum and by its own title
   page), not Function 7.3's. The Function 7.3 course itself clearly expects
   a dedicated ≥30-question practice book (six numbered exercise checkpoints
   totalling "Questions 1–30" across the deck). Do not draft or validate any
   question against "the KOST Function 7.3 practice book" until the real
   file is located or confirmed permanently lost — and do not substitute the
   misfiled Function 7.1 book's content as if it were Function 7.3 evidence.
   This same misfiling risk should be checked for the remaining
   as-yet-unexamined function folders (7.4–7.10) before assuming their
   practice books are correctly filed.
2. **7.1 vs 7.2 (accident vs incident reporting) — thin, merged evidence,
   now confirmed a third time.** Exactly as already recorded for Function
   7.2, Function 7.3's course also gives "accidents" and "incidents" a
   single shared slide with no clear conceptual separation. This appears to
   be a structural characteristic of the underlying KOST slide deck template
   reused across functions, not an isolated omission. Recorded honestly
   rather than forcing two distinct question pools from one shared slide;
   whoever drafts Stage 2A across functions should decide once whether
   7.1/7.2 can ever support genuinely separate question pools in this KOST
   material, rather than re-deciding it per function.
3. **3.2.3 (package type) is not independently reinforced in the
   radioactive-specific repeat pass** — a minor completeness note, not a
   gap: the primary (non-radioactive) pass covers it clearly (p.253), and
   Section 10's own Type A/B/C radioactive package-classification material
   (p.280–293) provides equivalent or deeper radioactive-specific
   package-type content, just not under a slide titled "vérifier le type de
   colis" a second time.
4. **Regulatory paragraph numbers are Tier B, not yet Tier A-verified.**
   Every "DGR x.y.z" citation above is copied from what the KOST slide
   itself displays; none of them has been checked against the current IATA
   DGR 67th Edition (French, Addendum 1) text in this pass. The course is
   explicitly built on the 66th Edition (own title slide + repeated "66ème
   Edition 2025" changelog slides), confirmed also by the standalone 66th
   Edition Addendum document sitting in this function's own source folder —
   neither is the current baseline. A future Tier A pass for Function 7.3
   must not assume any of these section numbers, checklist item numbers
   (e.g. "item 15", "item 33"), or table numbers (3.10.A, 9.1.A, 9.3.A) are
   unchanged in the 67th Edition.
5. **0.1.2's national/ANAC layer is present in 7.3's course but not inside
   the same slide range as 7.1's/7.2's** — a minor structural note, not a
   gap: Algeria/ANAC-specific content does appear in this course, but under
   Block 7's reporting section (p.338, "Pour l'Algérie, tous les
   compte-rendu sont adressés à… ANAC"), not alongside the global
   SCoETDG→AIEA→OACI→IATA hierarchy slides the way it did for 7.2. The
   sub-task is still adequately covered overall; the national layer is just
   taught at a different point in the deck.

## What this draft does NOT do

- Does not produce a Stage 2A exam blueprint (question counts, sample
  sizes, item types) — that is a separate, later step, exactly as it was
  for Functions 7.1 and 7.2.
- Does not verify any DGR paragraph, checklist item number, or table number
  against current Tier A (67th Edition) text.
- Does not draft, word, or approve any exam question.
- Does not watch/transcribe the two embedded videos (Saudia 163 case study,
  Module 4 marking/labelling) or view the blank NOTOC form as an image —
  none of these were judged to hold distinct task/sub-task content beyond
  what the slide text already documents.
- Does not assume Function 7.3's structure generalizes to any other
  function (7.4–7.10) — each needs its own independent Stage 1 pass, per
  `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md`. In particular, do not assume
  Block 3's 3.1–3.3-only shape carries over to 7.4 (cargo/ULD handling and
  loading), which Table 7.4.A's own text suggests will again have a
  different active-block shape ("Gérer le préchargement du fret" appears as
  its column header, per the same PDF page already viewed).

## Recommended next steps

1. Have a second pass (or a qualified instructor) confirm or correct this
   33-item enumeration before treating it as frozen, the same two-pass
   discipline Function 7.1 used (draft → corrected final).
2. Locate the genuine Function 7.3 practice book (≥30 questions) — check
   other local copies of the WeTransfer package, the user's File Library,
   or request it directly — before relying on any "practice book" evidence
   for this function.
3. Check whether the same practice-book misfiling pattern affects any of
   Functions 7.4–7.10's folders before their own Stage 1 passes, so the
   issue is caught once rather than rediscovered per function.
4. Decide how to handle the recurring 7.1/7.2 thin/merged reporting evidence
   (now confirmed across two functions' worth of KOST material) before
   Stage 2A question-count allocation for any function.
5. When Function 7.3 reaches its own Tier A revalidation gate, re-verify
   every DGR section/table/checklist-item number cited above against the
   current 67th Edition (French, Addendum 1) text, the same way
   Q-7.1-001 through Q-7.1-012 were handled for Function 7.1.
