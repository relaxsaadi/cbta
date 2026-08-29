# DGR Stage 2B — Function 7.2 Production Bank (Batch 1)

**Function 7.2**: *Personnel chargé de traiter ou d'accepter des marchandises
dangereuses présentées comme du fret général.*

First production batch drafted against
`docs/DGR_STAGE2A_FUNCTION_7.2_BLUEPRINT.md` (PROVISIONAL/CEILING, 89-question
maximum across 23 sub-tasks). Function 7.2 has no prior pilot, so numbering
starts at `Q-7.2-001`.

## Status of this batch — read before using any item below

**2026-08-25: Tier A verification pass completed against the live
authenticated IATA Digital Publications Bookshelf (`DGR-6066-67`, 67th Ed.,
Addendum 1) via `chrome-devtools` MCP.** Outcome for the 11 items:

- **6 items Tier A confirmed as drafted** (Q-7.2-001, 004, 005, 009, 010\*,
  011 — \*010's general reporting-duty mechanism confirmed, its ANAC-specific
  naming correctly stays Tier B/administrative, see that item's note).
- **1 item's underlying claim reconfirmed as a genuine DGR silence**
  (Q-7.2-002, danger/risque — same conclusion already reached for Function
  7.1's Q-7.1-001, cross-applies here since it's the identical DGR-wide
  question).
- **4 items (Q-7.2-003, 006, 007, 008) — Tier A search did not locate the
  specific itemized wording drafted, though the underlying general duty is
  Tier A confirmed via DGR Part 9 (Acceptation).** These read as KOST
  practical/procedural synthesis (detection cues, checklists, escalation
  steps) built on top of the DGR's general acceptance-duty language, not
  verbatim DGR text. Not asserted false — the general provisions they sit on
  are real and cited — but the specific enumerated lists/phrases are not
  themselves DGR quotes. See each item's updated Source basis for the exact
  finding and citation.

No Tier A content was fabricated; where a specific search did not locate a
match, that is recorded as such rather than guessed. Full citations in each
item's Source basis line below.

**Original blocker (superseded):** per `.claude/rules/dgr-stage2b.md` and
`docs/PLATFORM_READINESS_REPORT.md`'s sixth-pass note, the Bookshelf session
was blocked in an earlier pass pending the owner's 2FA re-login. It is
reachable again this session — no login was performed by the agent.
- Every item below is sourced directly and verbatim-traced to the actual
  **KOST Function 7.2 training material** (Tier B), read in full this session
  (extracted with `pdftotext -layout`) from
  `/Users/mac/Documents/Fichiers/Algerie/CBTA final/yasmine cbta/wetransfer_supports-pedagogiques-dgr-cbta-kost-academy_2025-10-12_1842/COURS DGR-CBTA-IATA/DGR-FONCTION 7.2/`:
  - `04_KOST_DGR_CBTA_Course_Function_7.2_FR_2025.pdf` — course, 117 slides
    (confirmed via `pdfinfo`), formatrice Boufas Yasmina, dated 02/09/2025.
    Primary source, cited below by printed slide number (verified page by
    page via form-feed-delimited text extraction, not estimated).
  - `02_KOST_DGR_CBTA_Exam_Function_7.2_FR_Rev00_2025.pdf` (F-KOST 05, 20Q) —
    corroborating cross-reference only, never copied as a question stem.
  - `05_KOST_DGR_CBTA_Practice_Book_Function_7.2_FR_2025.pdf` (F-KOST 09,
    20Q) — corroborating cross-reference only, never copied as a question
    stem.
- Every "DGR x.y.z" section number cited below is **as displayed on the KOST
  slide itself** — Tier B, not independently re-verified against the current
  67th Edition/Addendum 1 text in this pass. Do not treat any section number
  below as confirmed-current.
- Per `.claude/rules/dgr-stage2b.md` rule 4, **no item in this batch may be
  marked `APPROVED`.** Status is `DRAFT` only.
- Next session should re-attempt the Bookshelf technique once the owner has
  re-authenticated, to move these 11 items from `DRAFT` toward
  `FR SOURCE VERIFIED` / `FR SOURCE GAP CONFIRMED`, exactly as was done for
  Function 7.1's 12-item pilot.

## Sub-task selection and ceiling compliance

This batch deliberately drafts a **small, honest sample (11 items)**, not a
push toward the 89-question provisional ceiling — per the task's own
instruction and `docs/DGR_STAGE2A_FUNCTION_7.2_BLUEPRINT.md`'s own framing
("a maximum, not a quota to fill"). It spreads across all three active
blocks and prioritizes the sub-tasks the blueprint rated with the strongest
source coverage, while respecting every per-sub-task ceiling.

| Sub-task | Title | Blueprint ceiling / sample | Drawn this batch | New item |
|---|---|---|---|---|
| 0.1.2 | Reconnaître le cadre juridique (mondial, national) | 4 / 1 | 1 | Q-7.2-001 |
| 0.1.4 | Faire la distinction entre un danger et un risque | 4 / 1 | 1 | Q-7.2-002 |
| 0.2.2 | Reconnaître les MD potentiellement cachées | 8 / 2 | 1 | Q-7.2-003 |
| 0.4.1 | Trouver de l'information générale sur les classes et les divisions | 8 / 2 | 1 | Q-7.2-004 |
| 0.5.2 | Reconnaître les prescriptions de base concernant l'étiquetage | 8 / 2 | 1 | Q-7.2-005 |
| 3.4.1 | Vérifier la documentation pour indications de MD cachées/non déclarées | 10 / 3 | 2 | Q-7.2-006, Q-7.2-007 |
| 3.4.2 | Vérifier les colis pour indications de MD cachées/non déclarées | 8 / 2 | 1 | Q-7.2-008 |
| 7.3 | Signaler les MD non déclarées ou mal déclarées | 3 / 1 | 1 | Q-7.2-009 |
| 7.4 | Signaler les situations mettant en cause des MD | 3 / 1 | 1 | Q-7.2-010 |
| 7.1+7.2 (combined pool) | Signaler les accidents / signaler les incidents de MD | 3 / 1 | 1 | Q-7.2-011 |
| **Total** | | | **11** | |

**Block spread:** Block 0 = 5 items, Block 3 = 3 items, Block 7 = 3 items —
deliberately not clustered in one block.

**Deliberately not drafted this batch, and why:**
- **0.4.3 "Envisager de multiples dangers" — 0 items, matching the
  blueprint's own 0-ceiling.** This remains a confirmed `SOURCE GAP`: no
  slide, exam question, or practice-book question in the real KOST Function
  7.2 material addresses subsidiary/multiple-hazard determination. Not
  drafted, not inferred, not sourced to a different document's incidental
  phrase, exactly per `docs/DGR_STAGE2A_FUNCTION_7.2_BLUEPRINT.md`'s binding
  restriction #2.
- The remaining 12 of Block 0's 17 sub-tasks (0.1.1, 0.1.3, 0.2.1, 0.2.3,
  0.3.1, 0.3.3, 0.4.2, 0.5.1, 0.5.3, 0.6.1, 0.6.2) were not drafted this
  pass — all have real source evidence per Stage 1 (several "Strong"), but
  this batch intentionally stays small (target 8–12) rather than exhausting
  Block 0. Left for a future batch.
- **7.1+7.2 combined pool drawn at only 1 of its "up to 3" ceiling** — the
  blueprint's own decision records this pool as thin/fully merged evidence
  (one shared slide, no independently-worded content for either official
  code). Drafting only 1 item respects the instruction to keep thin/merged
  pools at their conservative end rather than maximizing them.

## Method notes on distractor sourcing (rule 6 compliance)

Every distractor below is either (a) explicitly and correctly stated
elsewhere in the same KOST course as a *different* fact, repurposed here as
a wrong answer to *this* question (a "swapped-definition" or
"wrong-sub-task" distractor), or (b) the source's own negative/contrasting
statement. No distractor asserts an invented regulatory fact. Where a
distractor is a real course fact drawn from a different slide/sub-task, that
slide is cited so the wrongness is traceable, not asserted from general
knowledge.

---

## Q-7.2-001 — Portée du Sous-comité d'experts (SCoETDG) dans la hiérarchie réglementaire

**Sub-task:** 0.1.2 Reconnaître le cadre juridique (mondial, national)
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Cadre juridique — Fondements de la
Réglementation DGR 1.1), quel organisme élabore des procédures recommandées
pour le transport de **toutes** les marchandises dangereuses, applicables à
**tous les modes de transport**, à l'exception des matières radioactives ?

**Options:**
- **(Correct)** Le Sous-comité d'experts du Conseil économique et social des
  Nations Unies (SCoETDG)
- L'Agence internationale de l'énergie atomique (AIEA)
- L'Organisation de l'Aviation Civile Internationale (OACI)
- L'Association Internationale du Transport Aérien (IATA)

**Correct answer rationale:** Course slide 20: "Le SCoETDG élabore des
procédures recommandées pour le transport de toutes les marchandises
dangereuses, à l'exception des matières radioactives. Ces procédures sont
applicables à tous les modes de transport."

**Distractor rationale (source-grounded, each refuted by its own dedicated
slide in the same series):**
- AIEA — per slide 21, its scope is the exact opposite: "recommandations
  pour le transport sécuritaire des matières radioactives" specifically,
  reflected in Part 10 of the IATA manual — not the "all DG except
  radioactive, all modes" scope this question asks about.
- OACI — per slide 22, OACI's role is to build air-transport-specific
  codification ("codifiée dans l'annexe 18 et… les Instructions
  techniques") from these recommendations, not to author the underlying
  multi-modal recommendations itself.
- IATA — per slide 23, IATA's DGR "comporte toutes les spécifications des
  IT" and adds more restrictive operational specifications — a downstream
  air-carrier document, not the originating multi-modal UN-level body.

**Source basis:** Tier B — KOST Function 7.2 course, slides 20–23 ("Cadre
juridique — Fondements de la Réglementation DGR 1.1"). Topic-level (not
text-level) cross-reference: KOST exam Q2 and practice book Q2 both test the
adjacent OACI/codification fact from the same slide series ("Quelle
organisation élabore la réglementation… voie aérienne" → OACI), confirming
this slide series is real, examined material — this specific item's SCoETDG
scope-restriction angle is not itself a direct exam/practice hit, noted
honestly rather than overstated.
**FR status:** FROZEN FR / SOURCE VERIFIED (Tier A confirmed 2026-08-25).
DGR 67th Ed. 2026, §1.1.1 (Partie 1, Bookshelf p.11): "Le Sous-comité
d'experts en matière de transport des marchandises dangereuses du Conseil
économique et social des Nations Unies (UNSCETDG) élabore des procédures
recommandées pour le transport de toutes les marchandises dangereuses, à
l'exception des matières radioactives. Ces procédures applicables à tous
les modes de transport sont publiées..." — confirms the correct answer;
§1.1.2/1.1.3/1.1.4 confirm the three distractors are wrongly scoped, exactly
as drafted. Current acronym is "UNSCETDG"; align final wording (same body
as the KOST slide's "SCoETDG"). Note: this underlying fact is shared
verbatim with Function 7.1's Block 0 (confirmed identical wording by Stage 1
cross-validation) — independently drafted here for Function 7.2's own bank,
not copied from `docs/DGR_PRODUCTION_BANK_7.1.md`.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-002 — Définition du terme « Risque » (par opposition à « Danger »)

**Sub-task:** 0.1.4 Faire la distinction entre un danger et un risque
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours, laquelle des affirmations suivantes
correspond à la définition du terme **« Risque »**, telle que distinguée de
celle de **« Danger »** ?

**Options:**
- **(Correct)** Le degré de probabilité (forte ou faible chance) qu'un
  danger quelconque cause réellement un dommage.
- Quelque chose qui pourrait potentiellement causer des dommages.
- Toute forme de liquide, de vapeur, de poussière, de fumée ou de gaz qui
  pourrait se déverser, fuir ou être mal utilisé.
- Un virus, une bactérie ou un champignon transmissible par morsure,
  coupure ou contact avec une personne infectée.

**Correct answer rationale:** Course slide 32: "Risque : le degré de
probabilité (forte ou faible chance) qu'un danger quelconque cause
réellement un dommage."

**Distractor rationale (source-grounded — a swapped-definition set, each
option is the course's own correct definition of something else on the
adjoining slide 33, deliberately mislabeled as "Risque" here):**
- "Quelque chose qui pourrait potentiellement causer des dommages" — this is
  the course's own definition of **Danger**, not Risque (slide 33: "Danger :
  quelque chose qui pourrait potentiellement causer des dommages").
- "Toute forme de liquide, de vapeur… mal utilisé" — this is the course's
  own example category **"Dangers chimiques"** (slide 33), a sub-type of
  Danger, not the definition of Risque.
- "Un virus, une bactérie ou un champignon…" — this is the course's own
  example category **"Dangers biologiques"** (slide 33), again a sub-type of
  Danger, not Risque.

**Source basis:** Tier B — KOST Function 7.2 course, slides 32–33 ("Faire la
distinction entre un danger et un risque"). Cross-referenced by KOST
practice book Q3, which asks the open-ended equivalent ("Différencier un
danger d'un risque avec des exemples…") — confirms this is a real, examined
distinction in the actual Function 7.2 material.
**FR status:** FR SOURCE GAP CONFIRMED (Tier A re-checked 2026-08-25) —
identical finding to Function 7.1's `Q-7.1-001` (see
`docs/DGR_SOURCE_REGISTER.md`): the current DGR 67th Ed. Appendice A
Glossaire (p.703) and §1.0 Note (p.11) confirm the glossary excludes
ordinary/dictionary-sense terms by explicit policy, and no "Danger"/"Risque"
headword exists anywhere in the current text. This is a DGR-wide fact, not
function-specific, so Q-7.1-001's Tier A research applies directly here —
not re-searched from scratch, cross-applied. Retain this item on its Tier B
(KOST course) basis; do not attribute the distinction to the DGR glossary in
final wording.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-003 — Indice de reconnaissance d'une marchandise dangereuse cachée

**Sub-task:** 0.2.2 Reconnaître les marchandises dangereuses potentiellement cachées
**Type:** MCQ, single-answer

**Stem (FR):** D'après le cours (« Comment reconnaître les marchandises
dangereuses cachées ? »), lequel des éléments suivants est cité comme un
indice physique permettant de repérer un colis contenant potentiellement des
marchandises dangereuses cachées ?

**Options:**
- **(Correct)** Un emballage avec un centre de gravité variable, laissant
  supposer un contenu liquide à l'intérieur.
- La mention « Not Restricted » apposée par l'expéditeur sur la lettre de
  transport aérien.
- Un emballage marqué du symbole ONU de spécification, certifiant qu'il a
  subi avec succès les épreuves de résistance.
- Une déclaration de marchandises dangereuses (DGD) jointe à l'envoi.

**Correct answer rationale:** Course slide 43: "paquet avec centre de
gravité variable, avec contenu liquide à l'intérieur" — listed alongside
leaking/noisy/smoking packaging as a physical detection cue.

**Distractor rationale (source-grounded — each is a real course fact but
signals the *opposite* situation: a properly declared/compliant DG shipment,
not a hidden/undeclared one):**
- "Not Restricted" endorsement — per slide 102, this is the shipper's own
  written confirmation that a package's content is *not* dangerous; it is a
  documentation-stage clearance mechanism, not a physical hidden-DG cue.
- UN specification mark — per slide 77, this mark certifies that packaging
  *itself* passed resistance testing under DGR 6.0.4.2.1(a); it is a
  compliance mark for a package built to carry declared DG, not an indicator
  of concealment.
- DGD attached — per the course's documentation section (slide 85 area,
  sub-task 0.5.3), a DGD accompanies a shipment that has already been
  correctly declared — the presence of one is evidence of proper process,
  the opposite of what this question asks for.

**Source basis:** Tier B — KOST Function 7.2 course, slides 41–43 ("Comment
reconnaître les marchandises dangereuses cachées ?"). Directly corroborated
by KOST practice book Q5: "Cité 4 aspects extérieurs ou indices pouvant vous
aider à repérer un bagage ou un paquet contenant des matières dangereuses
cachées ?" — same topic, open-ended in the source, not copied verbatim here.
**FR status:** PARTIALLY CONFIRMED — Tier A search performed 2026-08-25, no direct match
found. Current DGR §2.2 (Marchandises dangereuses cachées, p.12 area)
describes the detection *duty* (agents must be trained to identify DG under
generic descriptions, must query shippers/passengers when suspicious) but
does not itemize physical inspection cues such as "variable centre of
gravity" anywhere in the read text; a targeted search for "centre de
gravité variable" returned no book match (the only "centre de gravité" hits
found are unrelated drop-test procedure language in Part 6). This specific
physical-cue content reads as KOST practical-training synthesis layered on
top of the DGR's general detection duty, not a verbatim DGR provision —
retained Tier B, not asserted as DGR-sourced. Not re-classified as a formal
SOURCE GAP (the general duty it illustrates is real and Tier A-cited above)
but the item's specific correct-answer wording should not be attributed to
a DGR section number.

**Reconciliation (2026-08-26):** OLD STATUS: DRAFT (topic-analysis conclusion had been reached but never stamped in this field before this reconciliation pass). NEW STATUS: PARTIALLY CONFIRMED. SOURCE: this item's own previously-recorded Tier A finding (see text above), now materialized. RATIONALE: general detection duty independently Tier A-confirmed via §2.2; the specific physical cue is Tier B-only, not located in current DGR text.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-004 — Division 5.1 : exemples de matières comburantes

**Sub-task:** 0.4.1 Trouver de l'information générale sur les classes et les divisions
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Les classes des marchandises dangereuses DGR
3.0.2), à quelle division appartiennent le nitrate d'ammonium, le chlorate
de calcium et l'eau de Javel ?

**Options:**
- **(Correct)** Division 5.1 — Comburant
- Division 6.1 — Substance toxique
- Division 4.3 — Matières qui, au contact de l'eau, émettent des gaz
  inflammables
- Classe 3 — Liquides inflammables

**Correct answer rationale:** Course slide 64 (Division 5.1, Comburant,
code IMP ROX): "Ex : nitrate d'ammonium, chlorate de calcium, eau de
Javel..."

**Distractor rationale (source-grounded — each wrong option is refuted by
that division/class's own named examples on the same slide series, not by
inference):**
- Division 6.1 — the course's own example set is "arsenic, Nicotine,
  pesticides" (slide 65), not oxidizers.
- Division 4.3 — the course's own example set is "magnésium, sodium" (slide
  63), water-reactive metals, not oxidizers.
- Classe 3 — the course's own example set is "Essence, alcool, huile" (slide
  62), flammable liquids, not oxidizers.

**Source basis:** Tier A — DGR 67th Ed. 2026, Table 4.2, entry `UN1942
Nitrate d'ammonium (contenant 0,2% au maximum de matière combustible...)` =
Classe/Division **5.1**, étiquette "Comburant" (Bookshelf p.385) — confirms
the correct answer's lead example. §3.0.2 (Bookshelf p.307) confirms the
three distractor class/division labels ("Classe 3 — Liquides inflammables",
"Division 4.3", "Division 6.1 — Matières toxiques") are real, distinct
current classes. "Chlorate de calcium" and "Eau de Javel" (the other two
KOST-cited examples) were not individually re-confirmed this pass — "Eau de
Javel" cross-references to "Hypochlorite en solution" (ONU 1791) in the
current index but its own class was not read before this pass's time
budget; not treated as blocking since the defining example and the correct
Division itself are directly Table-4.2-confirmed. Originally Tier B — KOST
Function 7.2 course, "Les classes des marchandises dangereuses DGR 3.0.2"
slide series, slides 62–65.
**FR status:** FROZEN FR / SOURCE VERIFIED (Tier A confirmed 2026-08-25 for
the correct answer and all three distractor labels; the two secondary
examples in the correct-answer text are unconfirmed-but-not-contradicted —
flag for a follow-up spot-check before EN/reviewer sign-off).
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-005 — Deux types d'étiquettes (DGR 7.2.2.2)

**Sub-task:** 0.5.2 Reconnaître les prescriptions de base concernant l'étiquetage
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Étiquetage DGR 7.2.2.2), il
existe deux types d'étiquettes pour un colis contenant des marchandises
dangereuses : les étiquettes de danger et les étiquettes de manutention.

**Correct answer:** Vrai.

**Rationale:** Course slide 79: "Tous colis contenant des marchandises
dangereuses doit être étiqueté pour indiquer son contenu. Il existe 2 types
d'étiquettes : Les étiquettes de danger [;] Les étiquettes de manutention."
This is a direct, complete match — the slide states exactly two types and
names both.

**Source basis:** Tier A — DGR 67th Ed. 2026, §7.2.2.2 Types d'étiquettes
(Partie 7 — Marquage et Étiquetage, Bookshelf p.688 area): "Il existe deux
types d'étiquettes : (a) les étiquettes de danger qui sont exigées pour la
plupart des marchandises dangereuses de toutes les classes; et (b) les
étiquettes de manutention qui sont exigées, en plus des étiquettes de
danger, pour certaines marchandises dangereuses." — exact match, current
section number identical to the KOST slide's own citation. Originally Tier
B — KOST Function 7.2 course, slide 79.
**FR status:** FROZEN FR / SOURCE VERIFIED (Tier A confirmed 2026-08-25).
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-006 — Indications recherchées dans la documentation d'un envoi de fret général

**Sub-task:** 3.4.1 Vérifier la documentation pour voir s'il y a des indications concernant des marchandises dangereuses cachées et non déclarées
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Traitement/Acceptation de la cargaison), que
doit rechercher le personnel d'acceptation dans la documentation d'un envoi
de fret général afin de détecter d'éventuelles marchandises dangereuses non
déclarées ?

**Options:**
- **(Correct)** Le numéro ONU, la classe de danger, le code de l'emballage,
  et toute mention « DG », « MD », « Limited Quantity (LQ) » ou « Excepted
  Quantity (EQ) ».
- La conformité du marquage du colis aux critères de visibilité, lisibilité,
  durabilité et résistance aux intempéries.
- Le respect de la période de conservation minimale de 3 mois des documents
  de transport.
- La correspondance de l'article avec les critères des marchandises
  dangereuses interdites en toute circonstance (DGR 4.2).

**Correct answer rationale:** Course slide 97: "Rechercher les indications
DG : Numéro ONU, classe de danger, code de l'emballage[;] Mention 'Dangerous
Goods', 'DG', 'MD', 'Limited Quantity (LQ)' ou 'Excepted Quantity (EQ)'[;]
Marquages ou étiquettes visibles sur la documentation."

**Distractor rationale (source-grounded — each is a real requirement from a
*different* sub-task in the same course, correct in its own context but not
what this specific documentation-review step asks for):**
- Marking format criteria (visible/lisible/durable/intempéries) — this is
  the course's own 0.5.1 marking-format content (slide 78), about the
  physical package's marking, not the documentation-search step.
- 3-month document retention — this is the course's own 0.5.3 record-keeping
  requirement (slide 109), a different obligation applying after acceptance,
  not the documentation-review search criteria.
- DGR 4.2 absolute-prohibition criteria — this is the course's own 0.2.1
  content (slide 37, "Marchandises dangereuses interdite en toute
  circonstance"), a substantive classification test, not a documentation
  search step.

**Source basis:** Tier B, general duty Tier A-contextualized 2026-08-25 —
DGR 67th Ed. 2026, §9.1.1.1(b)/§9.1.1.2 (Partie 9 — Manutention, Bookshelf
p.693 area) confirm the general duty: acceptance staff must have access to
DG indicators (labels, marks) and, when a generic-description package is
suspected of containing DG, must check the AWB's generic description
against §2.2's list and request shipper documents proving the shipment is
not DG. This confirms the *general documentation-review duty* the item
tests. The specific itemized checklist drafted here ("UN number, hazard
class, packaging code, DG/MD/LQ/EQ mention") was not found verbatim in
§9.1.1 or elsewhere in Part 9 — it reads as a KOST practical synthesis of
what such a review would look for, not a direct DGR quote. Originally Tier
B — KOST Function 7.2 course, slides 96–98.
**FR status:** PARTIALLY CONFIRMED — Tier A confirms the underlying duty (§9.1.1.1-2) but
not this item's specific itemized wording as a verbatim DGR quote; do not
cite a DGR section number for the itemized list itself in final wording
without a further, more exhaustive search (e.g. of Part 8/9.1.3's own
document-conformity checklist, which addresses already-declared shipments,
a related but distinct scenario).

**Reconciliation (2026-08-26):** OLD STATUS: DRAFT (topic-analysis conclusion had been reached but never stamped in this field before this reconciliation pass). NEW STATUS: PARTIALLY CONFIRMED. SOURCE: this item's own previously-recorded Tier A finding (see text above), now materialized. RATIONALE: underlying duty Tier A-confirmed via §9.1.1.1-2; the item's own itemized wording is not independently verified as verbatim DGR text.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-007 — Endossement de la LTA : confirmation de l'expéditeur (DGR 9.1.1 / DGR 2.2.4)

**Sub-task:** 3.4.1 Vérifier la documentation pour voir s'il y a des indications concernant des marchandises dangereuses cachées et non déclarées
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Procédures d'acceptation de la cargaison —
DGR 9.1.1), lorsqu'un expéditeur propose un colis correspondant aux
descriptions génériques visées en DGR 2.2.4 (susceptibles de contenir des
marchandises dangereuses), que doit-il confirmer par l'endossement de la
lettre de transport aérien (LTA) ?

**Options:**
- **(Correct)** Qu'aucune partie du contenu du colis n'est dangereuse, par
  exemple par la mention « Not Restricted ».
- Que le colis a fait l'objet d'une inspection visuelle par le personnel
  d'acceptation.
- Que les documents de transport seront conservés pendant une période
  minimale de 3 mois.
- Que le colis porte l'étiquette de manutention appropriée.

**Correct answer rationale:** Course slide 102: "Confirmer par l'endossement
de la 'lettre de transport aérien' qu'aucune partie du contenu du colis
n'est dangereuse, par ex. 'Not Restricted'."

**Distractor rationale (source-grounded, each a real course fact wrongly
attributed to the shipper's LTA endorsement):**
- Visual inspection by acceptance personnel — per slide 99, this is an
  action the *acceptance staff* perform, not something the *shipper*
  confirms via LTA endorsement — wrong actor and wrong mechanism.
- 3-month document retention — per slide 109, this is a separate,
  post-acceptance record-keeping rule (sub-task 0.5.3), unrelated to what
  the shipper endorses on the LTA at acceptance.
- Handling-label requirement — per slide 82, this concerns package labelling
  (sub-task 0.5.2), a different requirement from the LTA content-confirmation
  endorsement this question asks about.

**Source basis:** Tier A — DGR 67th Ed. 2026, §9.1.1.2 (Bookshelf p.693
area) confirms the surrounding mechanism: acceptance staff must "demander
les documents de l'expéditeur prouvant que l'expédition ne contient pas de
marchandises dangereuses tel qu'indiqué en 2.2." **2026-08-25 follow-up
confirmed the phrase itself:** §9.1.7 (same Part 9, Bookshelf p.693 area)
uses and hyperlinks the term "marchandise non réglementée" directly to the
Appendice A Glossaire entry `NOTRESTRICTED` — confirming "Not
Restricted"/"marchandise non réglementée" is itself a defined current DGR
term, not an industry-shorthand invention. Originally Tier B — KOST
Function 7.2 course, slides 100–102.
**FR status:** FROZEN FR / SOURCE VERIFIED (Tier A confirmed 2026-08-25 —
mechanism via §9.1.1.2, term itself via §9.1.7's glossary-linked usage;
upgraded from the initial partial-confirmation recorded earlier this
session).
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-008 — Conduite à tenir face à un colis suspect détecté par inspection physique

**Sub-task:** 3.4.2 Vérifier les colis pour voir s'il y a des indications concernant des marchandises dangereuses cachées et non déclarées
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (inspection physique des colis — Séparation et
isolement / Actions en cas de détection), quelle est la conduite à tenir
lorsqu'un colis suspect est identifié lors de l'inspection physique d'un
envoi de fret général ?

**Options:**
- **(Correct)** L'isoler du flux de fret général, ne pas le manipuler comme
  du fret ordinaire, et informer le superviseur ou le responsable DG.
- Le refuser au fret général sans en informer le superviseur.
- Le traiter comme du fret ordinaire en attendant les résultats de
  l'inspection.
- Le renvoyer directement à l'expéditeur sans consulter le responsable DG.

**Correct answer rationale:** Course slide 100: "Séparation et isolement :
Tout colis suspect doit être isolé du flux de fret général. Ne pas le
manipuler comme du fret ordinaire avant inspection ou validation par le
responsable DG. Actions en cas de détection : Refuser l'acceptation dans le
fret général. Informer le superviseur ou le responsable DG. Suivre les
procédures internes…"

**Distractor rationale (source-grounded — each directly contradicts a
specific clause on the same slide):**
- "Sans en informer le superviseur" — directly contradicts the explicit
  "Informer le superviseur ou le responsable DG" action item on the same
  slide.
- "Le traiter comme du fret ordinaire" — directly contradicts "Ne pas le
  manipuler comme du fret ordinaire" on the same slide.
- "Le renvoyer directement à l'expéditeur sans consulter le responsable DG"
  — contradicts the slide's own conditional phrasing, which lists "retour à
  l'expéditeur… ou traitement comme DG" only as options to follow *after*
  isolation and validation by the responsable DG, not as an immediate
  unilateral action.

**Source basis:** Tier B — KOST Function 7.2 course, slides 98–100
("inspection physique des colis", "Séparation et isolement", "Actions en cas
de détection"). Directly corroborated by KOST practice book Q20: "En cas de
doute sur la nature d'un colis suspect, l'agent doit : … c) Refuser et
notifier immédiatement le superviseur" — same conclusion as this item's
correct answer, confirmed as a real, examined fact in the actual Function
7.2 material.
**FR status:** FR SOURCE GAP CONFIRMED — Tier A search performed 2026-08-25, no direct match
for this specific isolate/notify-supervisor procedure found in the current
DGR text read this pass (Part 9 §9.1.1/9.1.3 cover documentation-conformity
checks for already-declared shipments, not a step-by-step physical-suspect-
package escalation procedure). Reads as KOST operational SOP content, not a
verbatim DGR provision — retained Tier B, not asserted DGR-sourced.

**Reconciliation (2026-08-26):** OLD STATUS: DRAFT (topic-analysis conclusion had been reached but never stamped in this field before this reconciliation pass). NEW STATUS: FR SOURCE GAP CONFIRMED. SOURCE: this item's own previously-recorded Tier A finding (see text above), now materialized. RATIONALE: a 2026-08-25 exhaustive Tier A search (Part 9 §9.1.1/§9.1.3) found no current-DGR anchor for any part of this item's claim — it reads as KOST operational SOP content, not a verbatim DGR provision.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-009 — Signalement des marchandises dangereuses non déclarées ou mal déclarées

**Sub-task:** 7.3 Signaler les marchandises dangereuses non déclarées ou mal déclarées
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Signaler les marchandises dangereuses non
déclarées/mal déclarées), qui doit signaler la découverte de marchandises
dangereuses non déclarées ou mal déclarées dans le fret ou le courrier, et à
qui ?

**Options:**
- **(Correct)** L'exploitant, aux autorités compétentes de l'État de
  l'exploitant et de l'État dans lequel la découverte s'est produite.
- L'expéditeur, à l'Agence Nationale de l'Aviation Civile (ANAC) uniquement.
- Le responsable DG, uniquement s'il s'agit d'un accident.
- Le personnel d'acceptation, uniquement à l'expéditeur d'origine.

**Correct answer rationale:** Course slide 111: "L'exploitant doit signaler
tout cas où des marchandises dangereuses non déclarées ou mal déclarées ont
été découvertes dans le fret ou le courrier aux autorités compétentes de
l'État de l'exploitant et de l'État dans lequel il s'est produit."

**Distractor rationale (source-grounded):**
- "L'expéditeur… à l'ANAC uniquement" — wrong actor: the slide names
  "l'exploitant" as the reporting party, never "l'expéditeur." ANAC-only
  also wrongly narrows the dual-state requirement: ANAC is named elsewhere
  (slide 113) specifically as Algeria's own national recipient for the
  general accident/incident reporting duty (sub-task 7.4), not as a
  substitute for this slide's own "État de l'exploitant + État de
  l'occurrence" dual-recipient rule.
- "Le responsable DG… uniquement s'il s'agit d'un accident" — conflates this
  sub-task with the separate 7.1/7.2 accident/incident slide (slide 110);
  the course gives this sub-task (non déclarées/mal déclarées) its own
  distinct, dedicated slide, per Stage 1's "clean, distinct match" finding.
- "Le personnel d'acceptation… uniquement à l'expéditeur d'origine" — wrong
  actor and wrong recipient: the course never names "l'expéditeur" as a
  report recipient anywhere in this material; the slide specifies "autorités
  compétentes."

**Source basis:** Tier A — DGR 67th Ed. 2026, §9.6.2.1 (Partie 9 —
Manutention, Bookshelf p.693 area): "L'exploitant doit signaler tout cas où
des marchandises dangereuses non déclarées ou mal déclarées ont été
découvertes dans le fret ou le courrier. De tels signalements doivent être
présentés à l'autorité compétente de l'État de l'exploitant et de l'État où
le cas s'est produit." — exact match. Originally Tier B — KOST Function 7.2
course, slide 111.
**FR status:** FROZEN FR / SOURCE VERIFIED (Tier A confirmed 2026-08-25).
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-010 — Autorité algérienne destinataire des comptes rendus (DGR 9.6.5)

**Sub-task:** 7.4 Signaler les situations mettant en cause des marchandises dangereuses
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Procédures générales — Compte
rendu accidents et incidents), pour l'Algérie, tous les comptes rendus
d'accidents et d'incidents de marchandises dangereuses sont adressés à
l'Agence Nationale de l'Aviation Civile (ANAC).

**Correct answer:** Vrai.

**Rationale:** Course slide 113: "Pour l'Algérie, tous les compte-rendu sont
adressés à : L'Agence Nationale de l'Aviation Civile ANAC[.] Siège social :
Lot 225, Route Nationale N°5, Rouiba, Alger, Algérie." Direct, explicit
match — this is the course's own Algeria-specific enrichment beyond the
generic IATA wording, following the general "Signaler les situations
mettant en cause des marchandises dangereuses — Compte rendu accidents et
incidents DGR 9.6.5" heading on slide 112.

**Source basis:** Tier A (general mechanism) — DGR 67th Ed. 2026, §9.6.4/
§9.6.5 (Partie 9, Bookshelf p.693 area) confirm operators must report DG
incidents "à l'autorité appropriée de l'État de l'exploitant" — the general
duty this item's stem describes. The DGR text is intentionally state-
agnostic and, as an international regulation, structurally never names a
specific country's authority (no DGR section anywhere names "ANAC" —
confirmed by reading the full §9.6 subsection); naming ANAC for Algeria is
inherently national administrative knowledge outside what any DGR edition
could ever confirm, not a gap in this pass's search. Originally Tier B —
KOST Function 7.2 course, slides 112–113 (Algeria/ANAC-specific reporting
line, incl. the Rouiba postal address).
**FR status:** FROZEN FR / SOURCE VERIFIED for the general reporting-duty
mechanism (§9.6.4/9.6.5, Tier A confirmed 2026-08-25); the ANAC-specific
identification remains correctly Tier B/administrative — not a DGR
provision, and cannot become one under any future DGR edition. Flag so a
future reviewer does not mistake the ANAC address for a DGR-numbered
requirement.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-011 — Signalement des accidents/incidents impliquant des MD partiellement exemptées (combined 7.1/7.2 pool)

**Sub-task:** 7.1 + 7.2 (combined, dual-tagged pool per
`docs/DGR_STAGE2A_FUNCTION_7.2_BLUEPRINT.md`'s explicit decision — the
source contains zero independently-worded content distinguishing "accident"
reporting from "incident" reporting, so this item counts toward both
official codes rather than fabricating two artificially separate pools)
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Signaler les accidents et
incidents impliquant des marchandises dangereuses), l'obligation de
signalement de l'exploitant s'applique également aux marchandises
dangereuses qui ne sont pas soumises à tout ou partie de la réglementation
en raison d'une exception ou d'une disposition spéciale.

**Correct answer:** Vrai.

**Rationale:** Course slide 110: "L'exploitant doit signaler les accidents
et incidents de marchandises dangereuses aux autorités compétentes de
l'Etat de l'exploitant ainsi qu'aux ceux de celui dans lequel l'accident ou
l'incident s'est produit. Cela comprend les incidents impliquant des
marchandises dangereuses qui ne sont pas soumises à tout ou partie de la
réglementation en raison de l'application d'une exception ou d'une
disposition spéciale." Direct, explicit match on the exemption-inclusion
clause specifically.

**Source basis:** Tier A — DGR 67th Ed. 2026, §9.6.1 Note 1 (Partie 9,
Bookshelf p.693 area): "Cela comprend les incidents impliquant des
marchandises dangereuses qui ne sont pas soumises à tout ou partie des
présentes réglementations en raison de l'application d'une exception ou
d'une disposition spéciale (par exemple, un incident impliquant le
court-circuitage d'un accumulateur à anode sèche qui est nécessaire pour
satisfaire aux conditions de prévention de court-circuit dans une
disposition spéciale de 4.4)." — direct match, current text even supplies a
concrete worked example (dry-cell battery short-circuit under a §4.4
special provision) beyond what the KOST slide states. Originally Tier B —
KOST Function 7.2 course, slide 110.
**FR status:** FROZEN FR / SOURCE VERIFIED (Tier A confirmed 2026-08-25).
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Summary table

| ID | Sub-task | FR status | Type | Current source basis (Tier) | EN status | Approval |
|---|---|---|---|---|---|---|
| Q-7.2-001 | 0.1.2 Cadre juridique | FROZEN FR / SOURCE VERIFIED | MCQ | DGR 67e §1.1.1–1.1.4 (p.11) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-002 | 0.1.4 Danger vs Risque | FR SOURCE GAP CONFIRMED (cross-applied from Q-7.1-001) | MCQ | DGR silent by design (Appendice A p.703 + §1.0 p.11) — Tier A; item retained Tier B | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-003 | 0.2.2 MD cachées | PARTIALLY CONFIRMED — general duty Tier A-confirmed, specific cue Tier B only | MCQ | DGR 67e §2.2 (p.12 area) context — Tier A; specific fact — Tier B | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-004 | 0.4.1 Classes/divisions | FROZEN FR / SOURCE VERIFIED | MCQ | DGR 67e Table 4.2 UN1942 (p.385) + §3.0.2 (p.307) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-005 | 0.5.2 Étiquetage | FROZEN FR / SOURCE VERIFIED | True/False | DGR 67e §7.2.2.2 (p.688 area) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-006 | 3.4.1 Vérif. documentation | PARTIALLY CONFIRMED — general duty Tier A-confirmed, itemized list Tier B only | MCQ | DGR 67e §9.1.1.1–2 (p.693 area) — Tier A; itemized list — Tier B | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-007 | 3.4.1 Endossement LTA | FROZEN FR / SOURCE VERIFIED (upgraded — see Batch 2's §9.1.7 finding) | MCQ | DGR 67e §9.1.1.2 + §9.1.7 (p.693 area) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-008 | 3.4.2 Vérif. colis | FR SOURCE GAP CONFIRMED — Tier A search found no direct match; reads as KOST operational SOP content, not DGR text | MCQ | KOST F7.2 course slides 98–100 — Tier B | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-009 | 7.3 MD non déclarées | FROZEN FR / SOURCE VERIFIED | MCQ | DGR 67e §9.6.2.1 (p.693 area) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-010 | 7.4 Situations MD (ANAC) | FROZEN FR / SOURCE VERIFIED (general mechanism); ANAC naming stays Tier B/administrative | True/False | DGR 67e §9.6.4/9.6.5 (p.693 area) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-011 | 7.1+7.2 combined | FROZEN FR / SOURCE VERIFIED | True/False | DGR 67e §9.6.1 Note 1 (p.693 area) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |

**Batch composition:** 8 MCQ + 3 True/False. Block spread: Block 0 = 5,
Block 3 = 3, Block 7 = 3.

**2026-08-25 Tier A verification summary:** 7/11 `FROZEN FR / SOURCE
VERIFIED` (001, 004, 005, 007 [upgraded during Batch 2 work, see below],
009, 010, 011), 1/11 `FR SOURCE GAP CONFIRMED` (002, cross-applies
Q-7.1-001's DGR-wide finding), 3/11 remain `DRAFT` with their surrounding
general duty Tier A-confirmed but their specific itemized/procedural
wording not located verbatim in the current text this pass (003, 006,
008) — see each item's Source basis for the exact finding. No content was
fabricated to close these three; they are correctly flagged for a further,
more targeted search before being asserted as DGR-sourced. (Q-7.2-007's
"Not Restricted" phrase, initially unconfirmed, was subsequently located
as the DGR-glossary term "marchandise non réglementée" — see that item's
updated entry and Batch 2's `Q-7.2-024` finding.)

## What this batch does NOT do

- Does not exceed any per-sub-task ceiling in
  `docs/DGR_STAGE2A_FUNCTION_7.2_BLUEPRINT.md` (see the ceiling-compliance
  table above — every drawn count is at or below its "sample" figure).
- Does not draft any item against sub-task 0.4.3 — confirmed `SOURCE GAP`,
  stays at 0 questions per the blueprint's binding restriction.
- Does not draft more than 1 item from the thin/merged 7.1+7.2 combined pool
  (blueprint ceiling allows up to 3) — kept conservative given the pool's
  own "thin, fully merged" characterization.
- Does not mark any item `APPROVED` — no qualified reviewer exists in this
  pass; Tier A verification (2026-08-25) and reviewer sign-off remain
  separate gates.
- Does not touch Moodle or any live/production question-bank copy.
- Does not exhaust Block 0, Block 3, or Block 7 — 12 of Block 0's 17
  sub-tasks remain undrafted, left for a future batch.

**2026-08-25 update:** Tier A verification is now complete for this batch's
11 items — 6 fully confirmed, 1 reconfirmed as a genuine DGR silence
(cross-applied from Function 7.1), 4 partially confirmed (general duty
Tier A, specific wording still Tier B) — see the Summary table above and
`docs/DGR_FUNCTIONS_PROGRAM_STATUS.md` for the full per-item breakdown.

---

# Batch 2

Second production drafting pass against
`docs/DGR_STAGE2A_FUNCTION_7.2_BLUEPRINT.md`, deliberately prioritizing the
Block 0 sub-task leaves Batch 1 left completely uncovered, plus a small
number of additional non-overlapping items from already-touched sub-tasks
that still have significant remaining headroom. Continues the question ID
sequence from `Q-7.2-012`.

## Status of this batch — read before using any item below

**All 17 items in this batch are `DRAFT`, Tier B basis only. None has been
Tier A-verified against the current IATA DGR 67th Edition (2026, French,
Addendum 1) text.**

- Per this task's instructions, the IATA Digital Publications Bookshelf
  session was re-checked at the start of this batch
  (`mcp__chrome-devtools__evaluate` against the active tab). Result:
  `document.title` = *"Digital Publications Library: Sign In"*, URL on
  `login.vitalsource.com` — **not authenticated**, a Sign-In screen, exactly
  the outcome the task brief said was possible. Per standing instruction,
  **no login was attempted**, and no Tier A content was fabricated to
  compensate. This entire batch is Tier B only, same as Batch 1.
- Every item below is sourced directly and verbatim-traced to the actual
  **KOST Function 7.2 training material** (Tier B), re-extracted this
  session with `pdftotext -layout` (course: 118 pages per this extraction's
  own page split, consistent with Batch 1's `pdfinfo`-confirmed 117-page
  count once the leading blank/title frame is accounted for; exam: 264
  lines/8 pages; practice book: 242 lines/7 pages — all matching Batch 1's
  own figures) from the same source folder:
  `/Users/mac/Documents/Fichiers/Algerie/CBTA final/yasmine cbta/wetransfer_supports-pedagogiques-dgr-cbta-kost-academy_2025-10-12_1842/COURS DGR-CBTA-IATA/DGR-FONCTION 7.2/`:
  - `04_KOST_DGR_CBTA_Course_Function_7.2_FR_2025.pdf` — course, cited below
    by printed slide/page number, each page individually re-read from a
    fresh `pdftotext -layout` extraction split on form-feed page breaks (not
    estimated or copied from Batch 1's prose).
  - `02_KOST_DGR_CBTA_Exam_Function_7.2_FR_Rev00_2025.pdf` (F-KOST 05, 20Q)
    — corroborating cross-reference only, never copied as a question stem.
  - `05_KOST_DGR_CBTA_Practice_Book_Function_7.2_FR_2025.pdf` (F-KOST 09,
    20Q) — corroborating cross-reference only, never copied as a question
    stem.
- Every "DGR x.y.z" section number cited below is **as displayed on the
  KOST slide itself** — Tier B, not independently re-verified against the
  current 67th Edition/Addendum 1 text in this pass.
- Per `.claude/rules/dgr-stage2b.md` rule 4, **no item in this batch may be
  marked `APPROVED`.** Status is `DRAFT` only.

## Duplication check against Batch 1 (rule: no re-drafted underlying fact)

Six items below (`Q-7.2-023`, `Q-7.2-024`, `Q-7.2-025`, `Q-7.2-026`,
`Q-7.2-027`, `Q-7.2-028`) are drawn from sub-tasks Batch 1 already touched
(3.4.1, 3.4.2, 7.1+7.2 combined, 0.2.2, 0.4.1, 0.5.2 respectively). Each was
individually checked against the specific slide/fact Batch 1's corresponding
item used, and each draws on a **different slide and a different underlying
fact**, confirmed page-by-page below in each item's Source basis line — none
re-tests a Batch 1 item's fact under new wording. The remaining 11 items
(`Q-7.2-012`–`Q-7.2-022`) are the first items ever drafted against their
respective sub-tasks.

## Sub-task selection and ceiling compliance

| Sub-task | Title | Blueprint ceiling | Batch 1 drawn | Batch 2 drawn | Total drawn | Remaining headroom | New item(s) |
|---|---|---|---|---|---|---|---|
| 0.1.1 | Comprendre la définition | 3 | 0 | 1 | 1 | 2 | Q-7.2-012 |
| 0.1.3 | Déterminer l'application et la portée | 3 | 0 | 1 | 1 | 2 | Q-7.2-013 |
| 0.2.1 | Développer un flair pour les MD interdites | 3 | 0 | 1 | 1 | 2 | Q-7.2-014 |
| 0.2.3 | Être au courant des dispositions passagers | 1 | 0 | 1 | 1 | 0 (fully drawn) | Q-7.2-015 |
| 0.3.1 | Clarifier le rôle des parties prenantes | 4 | 0 | 1 | 1 | 3 | Q-7.2-016 |
| 0.3.3 | Divergences États/exploitants | 3 | 0 | 1 | 1 | 2 | Q-7.2-017 |
| 0.4.2 | Groupes d'emballage | 4 | 0 | 1 | 1 | 3 | Q-7.2-018 |
| 0.5.1 | Prescriptions de base — marquage | 1 | 0 | 1 | 1 | 0 (fully drawn) | Q-7.2-019 |
| 0.5.3 | Documents exigés | 4 | 0 | 1 | 1 | 3 | Q-7.2-020 |
| 0.6.1 | Sensibilisation procédures d'urgence générales | 3 | 0 | 1 | 1 | 2 | Q-7.2-021 |
| 0.6.2 | Exigences d'intervention d'urgence de l'employeur | 1 | 0 | 1 | 1 | 0 (fully drawn) | Q-7.2-022 |
| 3.4.1 | Vérif. documentation (MD cachées/non déclarées) | 10 | 2 | 1 | 3 | 7 | Q-7.2-023 |
| 3.4.2 | Vérif. colis (MD cachées/non déclarées) | 8 | 1 | 1 | 2 | 6 | Q-7.2-024 |
| 7.1+7.2 (combined) | Signaler accidents / incidents | 3 | 1 | 1 | 2 | 1 | Q-7.2-025 |
| 0.2.2 | MD potentiellement cachées | 8 | 1 | 1 | 2 | 6 | Q-7.2-026 |
| 0.4.1 | Classes et divisions | 8 | 1 | 1 | 2 | 6 | Q-7.2-027 |
| 0.5.2 | Prescriptions de base — étiquetage | 8 | 1 | 1 | 2 | 6 | Q-7.2-028 |
| **Total** | | | **11** | **17** | **28** | | |

**Block spread this batch:** Block 0 = 14 items (11 previously-untouched
leaves + 3 additional items on already-touched-but-high-headroom leaves),
Block 3 = 2 items, Block 7 = 1 item.

**Not drafted this batch, and why:**
- **0.4.3 "Envisager de multiples dangers" — still 0 items.** Confirmed
  `SOURCE GAP`, unchanged from Batch 1. Not drafted, not inferred.
- **0.1.2 and 0.1.4** (already drawn once each in Batch 1) were **not**
  given a second item this batch — kept the batch focused on genuinely
  untouched leaves plus a small, deliberate set of second items on the
  *very-strong* sub-tasks (0.2.2/0.4.1/0.5.2) where a clean, non-overlapping
  second fact was readily available and source-verifiable; 0.1.2/0.1.4 were
  left for a future batch rather than mined for a second angle in this pass.
- **7.3 and 7.4** were **not** given a second item, despite 2 items of
  headroom remaining each. Both sub-tasks' entire KOST source is effectively
  one short slide each (p.111 for 7.3; p.112–113 for 7.4, where p.112 is a
  bare section-title slide with no additional content beyond what Batch 1's
  `Q-7.2-009`/`Q-7.2-010` already tested). Drafting a second item from either
  would require re-testing the same single fact under new wording — exactly
  the duplication this batch is instructed to avoid — so both are correctly
  left at their Batch 1 count of 1, not pushed toward their nominal ceiling.
- **3.4.1** was drawn only 1 more item (headroom 7 remaining) — the
  documentation-verification sub-task has several distinct procedural facts
  (see the ceiling-compliance table in Batch 1), but only one additional
  clean, non-overlapping fact (the SDS-request step, p.101/103) was drafted
  this batch to keep pace with the batch's overall 15–20 item target rather
  than exhausting any single leaf.

## Method notes on distractor sourcing (rule 6 compliance)

Same method as Batch 1: every distractor is either (a) a real, correctly
stated fact drawn from a *different* slide/sub-task in the same KOST course,
repurposed here as a wrong answer to *this* question, or (b) the source's
own negative/contrasting statement. No distractor asserts an invented
regulatory fact. Each distractor's source slide is cited so the wrongness is
traceable.

---

## Q-7.2-012 — Définition de « marchandise présentée comme fret général »

**Sub-task:** 0.1.1 Comprendre la définition
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Généralités DGR 1.0), comment le cours
définit-il une marchandise **« présentée comme fret général »** ?

**Options:**
- **(Correct)** Tout envoi transporté par avion qui n'est pas déclaré,
  identifié ou traité comme marchandise dangereuse selon les exigences de
  l'OACI/IATA.
- Un produit, article ou substance susceptible de présenter un danger pour
  la santé, la sécurité, la propriété ou l'environnement, et qui figure dans
  la liste des marchandises dangereuses du règlement.
- Un envoi accompagné d'une Déclaration de l'expéditeur pour les
  marchandises dangereuses (DGD).
- Un envoi bénéficiant d'une exemption totale ou partielle de la
  réglementation en raison d'une disposition spéciale.

**Correct answer rationale:** Course slide 16 (« Qu'est-ce qu'une
marchandise présentée comme fret général ? »): "Tout envoi transporté par
avion qui n'est pas déclaré, identifié ou traité comme marchandise
dangereuse selon les exigences de l'OACI / IATA."

**Distractor rationale (source-grounded, each a real course fact drawn from
a different slide/topic, deliberately mislabeled here as the "fret général"
definition):**
- "Un produit, article ou substance… liste des marchandises dangereuses…" —
  this is the course's own definition of **marchandise dangereuse itself**
  (slide 15, "Généralités DGR 1.0"), the opposite concept from what this
  question asks about.
- DGD-accompanied envoi — this describes a properly **declared** DG
  shipment (slide 85, sub-task 0.5.3), not the negative/undeclared "fret
  général" definition.
- Exemption clause — this is the course's own exemption-inclusion wording
  from the accident/incident reporting slide (slide 110, sub-task
  7.1+7.2, tested separately in `Q-7.2-011`/`Q-7.2-025`), unrelated to how
  "fret général" itself is defined.

**Source basis:** Tier B — KOST Function 7.2 course, slide 16, with slide
15 read alongside for the contrasting definition. Loosely corroborated by
Exam Q1 ("Quelle est la définition réglementaire des Marchandises
dangereuses ?"), which tests the adjacent slide-15 definition from the same
section — confirms this section is real, examined material, without
duplicating this item's specific "fret général" angle.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-013 — Champ d'application du DGR de l'IATA (DGR 1.2.1)

**Sub-task:** 0.1.3 Déterminer l'application et la portée
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Applicabilité — Champ d'application DGR
1.2.1), à qui le DGR de l'IATA est-il applicable ?

**Options:**
- **(Correct)** Aux exploitants membres ou membres associés de l'IATA, aux
  parties à l'accord multilatéral de trafic intercompagnies de l'IATA-fret,
  ainsi qu'aux expéditeurs et agents qui proposent des envois de
  marchandises dangereuses à un organisme engagé dans une exploitation
  d'aéronef.
- Uniquement aux exploitants ayant obtenu un agrément spécifique pour
  transporter des marchandises dangereuses en tant que fret.
- Uniquement aux États ayant notifié une divergence à l'OACI et à l'IATA.
- Uniquement au personnel chargé de l'inspection physique des colis
  suspects.

**Correct answer rationale:** Course slide 31: "DGR de l'IATA est
applicable à : Tous les exploitants qui sont : Membres ou membres associés
de l'IATA[;] Parties à l'accord multilatéral de trafic intercompagnies de
l'IATA-fret[;] Aux expéditeurs et agents qui proposent des envois de
marchandises dangereuses à l'organisme engagé dans une exploitation
d'aéronef."

**Distractor rationale (source-grounded — each wrongly narrows the scope
using a real fact from a different slide):**
- "Agrément spécifique" restriction — contradicts slide 52's own wording,
  which requires a training programme "qu'ils soient ou non agréés pour
  transporter des marchandises dangereuses en tant que fret" — the DGR's
  applicability and the training duty both apply regardless of DG-cargo
  authorization.
- "Uniquement aux États… divergence" — this is the course's own 0.3.3
  divergence content (slide 54), a different, narrower topic than the DGR's
  own baseline applicability.
- "Uniquement au personnel… colis suspects" — this is the course's own
  3.4.2 physical-inspection actor (slide 99–100, tested in `Q-7.2-008`), not
  who the DGR itself applies to.

**Source basis:** Tier A — DGR 67th Ed. 2026, §1.2.1 Application (Partie 1,
Bookshelf p.11), cross-applied from Function 7.1's `Q-7.1-015` verification
(identical underlying DGR fact): "La Réglementation de l'IATA s'applique à :
tous les exploitants qui sont membres ou membres associés de l'IATA; tous
les exploitants qui sont parties à l'accord IATA sur le transport
intertransporteurs de marchandises; et tous les expéditeurs et agents de
fret qui présentent des marchandises dangereuses à ces exploitants." —
confirms the correct answer's three categories. Current phrase is "accord
IATA sur le transport intertransporteurs de marchandises" (KOST slide:
"accord multilatéral de trafic intercompagnies de l'IATA-fret") — same
concept, terminology drift, align final wording. Originally Tier B — KOST
Function 7.2 course, slide 31.
**FR status:** FROZEN FR / SOURCE VERIFIED (Tier A confirmed 2026-08-25).
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-014 — Critère de marchandise dangereuse interdite en toute circonstance (DGR 4.2)

**Sub-task:** 0.2.1 Développer un flair pour les marchandises dangereuses interdites
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Marchandises dangereuses interdite en toute
circonstance — DGR 4.2), lequel des éléments suivants est cité comme un
critère d'interdiction absolue au transport aérien ?

**Options:**
- **(Correct)** Une substance susceptible de produire un gaz inflammable ou
  corrosif dans des conditions normales de transport.
- Une substance dont l'expédition entraîne des coûts de transport plus
  élevés que pour du fret général.
- Une substance classée dans le Groupe d'emballage III (matières faiblement
  dangereuses).
- Une substance accompagnée d'une déclaration de l'expéditeur (DGD) dûment
  complétée.

**Correct answer rationale:** Course slide 37: marchandises dont le
transport est rigoureusement interdit = celles susceptibles "d'Exploser ou
de réagir dangereusement", de "Produire une flamme ou un dégagement
dangereux de chaleur, un dégagement de gaz ou vapeur toxique", ou de
"Produire un gaz inflammable ou corrosif dans des conditions normales de
transport."

**Distractor rationale (source-grounded — each describes the *opposite*
situation, a lawfully transportable/declared shipment, not an absolute
prohibition):**
- Higher shipping cost — this is the course's own slide 38 content ("Pourquoi
  l'expéditeur… ne déclarent pas les marchandises dangereuses"), a *motive*
  for non-declaration, not a prohibition criterion.
- Packing Group III — per slide 69, PG III is explicitly "matières
  **faiblement** dangereuses", the least dangerous tier, the opposite of an
  absolute-prohibition scenario.
- DGD-accompanied — per slide 85, a DGD is completed precisely for a
  properly declared, lawfully transportable DG shipment, not a prohibited
  one.

**Source basis:** Tier A — DGR 67th Ed. 2026, §2.1.1 (Partie 2 —
Restrictions, Bookshelf p.12 area), located during this session's Function
7.1 research: "Les articles ou matières qui, telles qu'elles sont
présentées au transport, risquent d'exploser, de réagir dangereusement, de
produire une flamme ou un dégagement dangereux de chaleur ou une émission
dangereuse de gaz ou de vapeurs toxiques, corrosifs ou inflammables dans les
conditions normalement rencontrées pendant le transport aérien ne doivent
en aucun cas être transportées par voie aérienne." — confirms the correct
answer. **Citation note:** the KOST slide cites "DGR 4.2", but 4.2 is the
List of Dangerous Goods table, not the absolute-prohibition criteria
themselves — the current, applicable section is §2.1.1; align final
citation. Originally Tier B — KOST Function 7.2 course, slide 37.
**FR status:** FROZEN FR / SOURCE VERIFIED (Tier A confirmed 2026-08-25;
citation corrected from §4.2 to §2.1.1).
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-015 — Dispositions relatives aux passagers (Table 2.3.A)

**Sub-task:** 0.2.3 Être au courant des dispositions s'appliquant aux passagers
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Limites — Dispositions
relatives aux passagers et au fret), les marchandises dangereuses sont
généralement interdites au transport par les passagers ou l'équipage, sous
réserve de limitations décrites en 2.3 (résumées dans le tableau 2.3.A), et
seuls les articles spécifiés aux points 2.3.2 à 2.3.5 sont autorisés,
uniquement pour un usage personnel.

**Correct answer:** Vrai.

**Rationale:** Course slide 45: "Dispositions relatives aux passagers[:]
Les DG sont généralement interdits au transport par des passagers ou
l'équipage. Limitations telles que décrites en 2.3(résumées dans le tableau
2.3.A). Seuls les articles spécifiés aux points 2.3.2 à 2.3.5 sont
autorisés, et uniquement pour un usage personnel." Direct, complete match.

**Source basis:** Tier A — DGR 67th Ed. 2026, §2.3.0.1 (Bookshelf p.12
area) and its Note 2, cross-applied from Function 7.1's `Q-7.1-017`
verification: "...sauf tel que permis en 2.3.2 à 2.3.5 pour un usage
personnel," with Note 2 confirming "Les dispositions suivantes apparaissent
aussi au tableau 2.3.A." — confirms both the general prohibition/exception
structure and the table 2.3.A cross-reference this item's stem describes.
Originally Tier B — KOST Function 7.2 course, slide 45.
**FR status:** FROZEN FR / SOURCE VERIFIED (Tier A confirmed 2026-08-25).
Note: this is sub-task 0.2.3's only allowed item — blueprint ceiling is 1 —
so no second item should be drafted against it in any future batch without
new source material.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-016 — Responsabilités de l'exploitant (DGR 1.4)

**Sub-task:** 0.3.1 Clarifier le rôle individuel et collectif des parties prenantes
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Rôle et responsabilité — Responsabilités
Exploitant DGR 1.4), laquelle des listes suivantes correspond aux
responsabilités attribuées à **l'exploitant** ?

**Options:**
- **(Correct)** Acceptation, Chargement, Entreposage, Inspection,
  Renseignement (en cas d'urgence), Compte rendu.
- Transport autorisé, Identification, Classification, Emballage, Marquage,
  Étiquetage, Déclaration.
- Isolement du colis suspect, notification au responsable DG, refus
  d'acceptation au fret général.
- Recherche du numéro ONU, de la classe de danger et des mentions
  « DG »/« MD »/« LQ »/« EQ » dans la documentation.

**Correct answer rationale:** Course slide 50: "Responsabilités Exploitant
DGR 1.4 — Acceptation[,] Chargement[,] Entreposage[,] inspection[,]
Renseignement -en cas d'urgence-[,] Compte rendu[,] Conservation
documents[,] Formation."

**Distractor rationale (source-grounded, each a real course fact wrongly
attributed to the exploitant):**
- "Transport autorisé, Identification, Classification…" — this is the
  course's own 9-item list of **shipper** (expéditeur) duties (slide 49,
  DGR 1.3), not the exploitant's.
- "Isolement du colis suspect…" — this is the 3.4.2 suspect-package action
  set (slide 100, already tested in `Q-7.2-008`), a specific operational
  procedure, not this slide's general list of exploitant responsibilities.
- "Recherche du numéro ONU…" — this is the 3.4.1 documentation-search
  content (slide 97, already tested in `Q-7.2-006`), a specific procedural
  step, not this slide's general responsibilities list.

**Source basis:** Tier A — DGR 67th Ed. 2026, §1.4.1 Généralités (Partie 1,
Bookshelf p.11): "Un exploitant qui accepte des marchandises dangereuses
doit se conformer aux dispositions détaillées à la partie 9 et apparaissant
ci-dessous : Acceptation; Entreposage; Chargement; Inspection;
Renseignements à fournir, dont les informations à donner en cas d'urgence;
Compte rendu; Conservation des documents; Formation." — all 6 items in the
drafted correct answer (Acceptation, Chargement, Entreposage, Inspection,
Renseignement en cas d'urgence, Compte rendu) are present in the current
8-item list; the stem does not claim exhaustiveness, so the 2 additional
current items (Conservation des documents, Formation) don't invalidate it,
though a future revision could enrich the answer to the full 8-item list.
Originally Tier B — KOST Function 7.2 course, slide 50.
**FR status:** FROZEN FR / SOURCE VERIFIED (Tier A confirmed 2026-08-25).
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-017 — Divergences de l'exploitant (DGR 2.8.3)

**Sub-task:** 0.3.3 Reconnaître l'impact des divergences des États et des exploitants
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Divergences d'État et d'Exploitant — DGR
2.8.3), quelle règle s'applique aux divergences notifiées par un
exploitant ?

**Options:**
- **(Correct)** Elles ne doivent pas être moins restrictives que le
  règlement, et sont applicables à tous les transports effectués par
  l'exploitant concerné (ex. AH : Air Algérie).
- Elles s'appliquent uniquement à l'État d'origine ou de départ de l'envoi.
- Elles ne sont notifiées qu'à l'OACI, jamais à l'IATA.
- Elles peuvent être moins restrictives que le règlement si l'exploitant le
  juge nécessaire pour réduire les coûts.

**Correct answer rationale:** Course slide 56: "Divergence de l'Exploitant
DGR 2.8.3 — Ne doivent pas être moins restrictives que le Règlement ; Les
divergences de l'exploitant sont applicables à tous les transports
effectués par les exploitants concernés. Exemple : AH : AIR ALGERIE AH-01,
AH-02."

**Distractor rationale (source-grounded):**
- "Uniquement à l'État d'origine ou de départ" — this is the course's own
  **État**-divergence content (slide 55, DGR 2.8.1: État d'Origine/Départ,
  État de Destination, États de transit), a different divergence type from
  the exploitant's own rule this question asks about.
- "Uniquement… OACI, jamais… IATA" — directly contradicts slide 54: "Ces
  divergences sont notifiées à l'OACI et à l'IATA" — both bodies, not one.
- "Peuvent être moins restrictives… réduire les coûts" — directly
  contradicts the explicit "Ne doivent pas être moins restrictives que le
  Règlement" clause on the same slide.

**Source basis:** Tier A — DGR 67th Ed. 2026 + Addendum 1, §2.8.3.1, read
directly this session in the authenticated Bookshelf: "Les divergences des
exploitants... ne peuvent pas être moins restrictives que les dispositions
de la présente Réglementation; et... sont applicables à tout transport
assuré par les exploitants concernés." Exact match to the correct answer.
Distractor 2 (State-only scope) is a different divergence type; distractor
3 ("uniquement OACI, jamais IATA") is confirmed wrong since §2.8.3.0/.3.1
confirm operator divergences are notified to the IATA Secretariat;
distractor 4 (can be less restrictive) is directly contradicted.
**FR status:** FROZEN FR / SOURCE VERIFIED — DGR 67e AM1 §2.8.3.1 (Tier
A), 2026-08-25.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-018 — Groupes d'emballage et degré de danger (DGR 3.0.3)

**Sub-task:** 0.4.2 Comprendre les principes généraux des groupes d'emballage
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Groupes d'emballage DGR 3.0.3), à quel
groupe d'emballage correspondent les **matières moyennement dangereuses** ?

**Options:**
- **(Correct)** Groupe d'emballage II
- Groupe d'emballage I
- Groupe d'emballage III
- Division 5.1

**Correct answer rationale:** Course slide 69: "Groupe d'emballage II —
Matières moyennement dangereuses."

**Distractor rationale (source-grounded — each is the course's own
labelling of a different degree/category, from the same table or a
different sub-task):**
- Groupe d'emballage I — per the same slide 69 table, this is "Matières
  **très** dangereuses", a different degree.
- Groupe d'emballage III — per the same table, this is "Matières
  **faiblement** dangereuses", also a different degree.
- Division 5.1 — this is a hazard-**class division** from sub-task 0.4.1
  (slide 64, already tested in `Q-7.2-004`), not a packing group at all —
  a wrong-category distractor.

**Source basis:** Tier A — DGR 67th Ed. 2026, §3.0.3.1 (Partie 3, Bookshelf
p.307), cross-applied from Function 7.1 research: "Groupe d'emballage I —
grand danger[;] Groupe d'emballage II — danger moyen[;] Groupe d'emballage
III — danger mineur." Confirms Group II = medium/moderate danger degree,
matching the correct answer's "moyennement dangereuses" (current wording:
"danger moyen" — same concept, minor phrasing variant). Distractor "Division
5.1" confirmed wrong-category (a hazard class division, not a packing
group) via §3.0.2. Originally Tier B — KOST Function 7.2 course, slide 69.
**FR status:** FROZEN FR / SOURCE VERIFIED (Tier A confirmed 2026-08-25).
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-019 — Critères de marquage des colis (marquage à spécification)

**Sub-task:** 0.5.1 Reconnaître les prescriptions de base concernant le marquage
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Marquage à spécification des
emballages), tout colis de marchandises dangereuses doit être marqué de
façon visible, lisible, durable, et pouvant résister aux intempéries.

**Correct answer:** Vrai.

**Rationale:** Course slide 78: "Tout colis de marchandises dangereuses doit
être marqué. Les marquages doivent être : Visibles[,] Lisibles[,] Durable[,]
Pouvoir être exposées aux intempérie[s]." Direct, complete match on all four
criteria.

**Source basis:** Tier A — DGR 67th Ed. 2026, §7.1.3.2 Qualité (Partie 7,
Bookshelf p.688 area), cross-applied from Function 7.1's `Q-7.1-019`
correction research: current text confirms 3 of the stem's 4 claimed
criteria verbatim — (a) "durables", (b) "facilement visibles et lisibles",
(c) "pouvoir être exposées aux intempéries sans dégradation notable" — plus
a 4th current criterion, "apposées sur un fond de couleur contrastante,"
that this stem does not mention. **Unlike Q-7.1-019, this item does not
claim its list is exhaustive** ("doit être marqué de façon visible, lisible,
durable, et pouvant résister aux intempéries" — a plain conjunction, not
"les quatre caractéristiques" framing) — so the omitted 4th criterion does
not make the Vrai/Faux claim false; the item remains valid as worded, though
could optionally be enriched. Originally Tier B — KOST Function 7.2 course,
slide 78.
**FR status:** FROZEN FR / SOURCE VERIFIED (Tier A confirmed 2026-08-25).
Note: this is sub-task 0.5.1's only allowed item — blueprint ceiling is 1 —
no second item should be drafted against it without new source material.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-020 — Contenu de la case « Renseignements sur la manutention » de la LTA (DGR 8.2)

**Sub-task:** 0.5.3 Déterminer les documents exigés
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Lettre de transport aérien — LTA — DGR 8.2),
que doit comprendre la case « Renseignements sur la manutention » de la LTA
accompagnant un envoi de marchandises dangereuses, selon le cas ?

**Options:**
- **(Correct)** La mention « Dangerous goods as per associated Shipper's
  Declaration » (ou « as per associated DGD »), et/ou la mention « Cargo
  Aircraft Only (CAO) ».
- La mention « Not Restricted », confirmant qu'aucune partie du contenu
  n'est dangereuse.
- Le numéro ONU, la classe de danger et le code de l'emballage.
- La durée de conservation minimale des documents de transport.

**Correct answer rationale:** Course slide 86 / slide 107 (repeated): "La
case « Renseignements sur la manutention » de la LTA doit comprendre les
déclarations suivantes, selon le cas : « Dangerous goods as per associated
Shipper's Declaration » ou « Dangerous Goods as per associated DGD ». «Cargo
Aircraft Only» (CAO)."

**Distractor rationale (source-grounded — each a real course fact about a
*different* document/procedure step, not the LTA handling-information box's
own required content):**
- "Not Restricted" endorsement — per slide 102, this is a separate
  confirmation the **shipper** makes specifically for DGR 2.2.4
  generic-description packages (already tested in `Q-7.2-007`), a different
  procedural context from what the LTA's handling-information box itself
  must state for an actual DG shipment.
- UN number/hazard class/packaging code — this is the 3.4.1
  documentation-search content (slide 97, already tested in `Q-7.2-006`),
  what acceptance staff search *for*, not what the LTA box itself states.
- 3-month retention — this is a separate 0.5.3 record-keeping rule (slide
  109), not the LTA's own handling-information content.

**Source basis:** Tier B — KOST Function 7.2 course, slides 86 and 107–108
("Lettre de transport aérien (LTA) — DGR 8.2" / "Vérifier la lettre du
transport LTA", both stating identical content). Loosely corroborated by
Exam Q19 ("Quels éléments doivent obligatoirement apparaître sur une LTA
DGR ?"), which tests LTA content generally from a different angle
(expéditeur nom/adresse, marquage/étiquetage, déclaration expéditeur,
téléphone transporteur — not this item's specific handling-information-box
fact) — confirms LTA content is real examined material without duplicating
this item.
**FR status:** FROZEN FR / SOURCE VERIFIED (Tier A confirmed 2026-08-25,
during Function 7.3 research) — DGR 67th Ed. 2026, §8.2.1 "Déclaration
pour la manutention" (Partie 8, Bookshelf p.690 area): "Une lettre de
transport aérien qui accompagne une expédition de marchandises dangereuses,
pour laquelle une Déclaration de l'expéditeur est exigée, doit contenir les
descriptions suivantes dans la case ‹ Informations de traitement › : (a)
« Dangerous goods as per associated Shipper's Declaration » ou « Dangerous
Goods as per associated DGD »...; (b) « Cargo Aircraft Only » (Aéronef
cargo seulement) ou « CAO »." — exact match.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-021 — Première action en cas de colis endommagé suspecté de MD (procédures d'urgence générales)

**Sub-task:** 0.6.1 Créer une sensibilisation aux procédures d'urgence générales
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Procédures d'urgence générales), quelle est
la toute première action à entreprendre face à un colis endommagé
suspecté de contenir une marchandise dangereuse ?

**Options:**
- **(Correct)** Aviser immédiatement votre supérieur.
- Nettoyer ou éliminer vous-même la marchandise dangereuse.
- Laver abondamment le corps à l'eau et retirer les vêtements contaminés.
- Isoler le colis en manipulant directement son contenu pour l'identifier.

**Correct answer rationale:** Course slide 88: "Aviser immédiatement votre
supérieur[.] Si cela peut se faire sans danger : Identifier la marchandise
dangereuse… Si possible, isoler le colis endommagé… Eviter tout contact avec
le contenu du colis. Ne pas nettoyer ou éliminer la MD sauf sous la
supervision d'un spécialiste."

**Distractor rationale (source-grounded — each contradicts or misplaces a
specific clause on the same two-slide procedure):**
- Self-cleaning/disposal — directly contradicts "Ne pas nettoyer ou
  éliminer la MD sauf sous la supervision d'un spécialiste" on the same
  slide.
- Washing the body / removing contaminated clothing — this is the course's
  own **separate** step 5 procedure for body/clothing contact (slide 89), a
  different scenario in the same section, not the first general action.
- Handling the contents directly to identify it — contradicts "Eviter tout
  contact avec le contenu du colis" on the same slide; also wrongly
  combines the "isoler" and "identifier" clauses into direct handling.

**Source basis:** Tier B — KOST Function 7.2 course, slides 87–89
("Information sur l'intervention d'urgence DGR 9.5.1.2"; "Procédures
d'urgence générales", two slides: spill/damaged-package response, then
body-contact response). Loosely corroborated by Practice Q17 ("Un colis
dégage une odeur forte lors du traitement — citez deux actions
prioritaires à effectuer"), which tests the same emergency-response
section from an open-ended angle, confirming real exam relevance without
duplicating this item's specific "first action" fact.
**FR status:** FR SOURCE GAP CONFIRMED (expanded search, 2026-08-25): the
"§9.5.1.2" citation is confirmed stale (that section covers ICAO Doc 9481
availability to the pilot-in-command, not this content). §9.3.6 "Colis de
marchandises dangereuses endommagés" was read in full this session as the
most likely alternative current source — it covers the operator's
PRE-LOADING inspection duty (inspect for leakage/damage before loading;
remove damaged/leaking packages) and the operator's post-discovery duty to
ensure the rest of the consignment is undamaged, but does **not** state
this item's specific "aviser immédiatement votre supérieur" first-action
procedure for a front-line employee who discovers a damaged package. A
direct in-book search for the procedure's own wording ("aviser votre
supérieur" combined with "colis endommagé") returned zero matches
anywhere in the current text. This 5-step procedure appears to be KOST's
own paraphrase of general/company-level emergency-response practice
(possibly derived from ICAO Doc 9481, which the DGR references but does
not reproduce), not directly quotable current DGR text. Genuine SOURCE GAP
— retained Tier B, not fabricated.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-022 — Responsabilité de l'exploitant pour l'information des employés (DGR 9.5.1.2)

**Sub-task:** 0.6.2 Comprendre les exigences d'intervention d'urgence de l'employeur
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Information sur l'intervention
d'urgence — DGR 9.5.1.2), il incombe à l'exploitant d'informer tous ses
employés de la procédure d'intervention d'urgence applicable partout où des
marchandises dangereuses sont manipulées, une procédure qui doit également
être établie par les autorités aéroportuaires.

**Correct answer:** Vrai.

**Rationale:** Course slide 87: "Doit être disponible partout où des MD
sont manipulées. Responsabilité de l'exploitant pour l'information de tous
les employés. Doit également être établi par les autorités aéroportuaires
pour faire face aux urgences impliquant des MD." Direct, complete match on
all three clauses.

**Note on generic-awareness compliance:** this item tests only that a
procedure must exist, be available wherever DG is handled, and that staff
must be informed of it (and that airport authorities must also establish
one) — it does **not** invent any specific employer's actual emergency
procedure content, per the blueprint's binding restriction #4 for this
sub-task.

**Source basis:** Tier B — KOST Function 7.2 course, slide 87 ("Information
sur l'intervention d'urgence — DGR 9.5.1.2"). This is a distinct clause
from the same slide's heading used contextually by `Q-7.2-021` (which draws
its tested fact from the subsequent procedural-steps slides 88–89, not this
slide's own employer-responsibility sentence) — no duplication. No direct
exam/practice-book hit, consistent with Stage 1's own finding. Note: this
is sub-task 0.6.2's only allowed item — blueprint ceiling is 1 (generic-
awareness only) — no second item should be drafted against it.
**FR status:** FR SOURCE GAP CONFIRMED (expanded search, 2026-08-25):
§9.5.1.2 read in full this session confirms it covers only the operator's
duty to
keep ICAO Doc 9481 (or equivalent) emergency-response guidance available
to the pilot-in-command — it does not state a general "inform all
employees" / "available wherever DG is handled" / "airport authorities
must also establish a procedure" obligation as this item claims. That
specific claim was not located elsewhere in current Part 9 this session.
Genuine SOURCE GAP — retained Tier B, not fabricated.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-023 — Demande de preuves documentaires (SDS) pour une description générique sur la LTA (DGR 9.1.1)

**Sub-task:** 3.4.1 Vérifier la documentation pour indications de MD cachées/non déclarées
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Procédures d'acceptation de la cargaison —
DGR 9.1.1), lorsque le personnel d'acceptation vérifie une description
générique du contenu figurant sur la lettre de transport aérien et soupçonne
qu'elle puisse dissimuler des marchandises dangereuses, que doit-il
demander à l'expéditeur, si nécessaire ?

**Options:**
- **(Correct)** Des preuves documentaires, par exemple une fiche de données
  de sécurité (SDS), attestant que l'envoi ne contient pas de marchandises
  dangereuses.
- Une déclaration de l'expéditeur (DGD) complète pour l'envoi.
- Une confirmation par l'endossement de la LTA du type « Not Restricted »,
  applicable à tout envoi de fret général sans distinction.
- Une inspection physique immédiate du colis par le personnel d'acceptation.

**Correct answer rationale:** Course slide 103: "Pour aider à la détection
de marchandises dangereuses non déclarées, le personnel d'acceptation doit
vérifier les documents d'expédition avec la description générale indiquée
sur la lettre de transport aérien et, si nécessaire, demander aux
expéditeurs des preuves documentaires (par exemple, des SDS) que l'envoi ne
contient pas de marchandises dangereuses, comme indiqué dans la
sous-section 2.2."

**Distractor rationale (source-grounded — each a real course fact from a
different step of the same procedural section, wrongly substituted here):**
- DGD — per slide 85, a DGD is completed for an envoi **already declared**
  as dangerous, the opposite of this question's "suspected non-declared,
  verify it is NOT dangerous" scenario.
- "Not Restricted" endorsement "applicable à tout envoi… sans distinction"
  — per slide 102, this endorsement mechanism is specifically tied to
  packages matching the DGR 2.2.4 generic-description list (already tested
  in `Q-7.2-007`), not a general-purpose substitute for the SDS-request step
  this question asks about — the "sans distinction" framing over-generalizes
  a narrower, distinctly-worded procedure.
- Immediate physical inspection — this is the 3.4.2 package-inspection step
  (slide 99, a different sub-task), not this slide's documentation-
  verification step.

**Source basis:** Tier A (mechanism + key term) — DGR 67th Ed. 2026,
§9.1.1.2 (Bookshelf p.693 area) confirms acceptance staff must "demander
les documents de l'expéditeur prouvant que l'expédition ne contient pas de
marchandises dangereuses tel qu'indiqué en 2.2." Separately, §9.1.7
(Bookshelf p.693 area) uses and hyperlinks the term "marchandise non
réglementée" to the Appendice A glossary entry `NOTRESTRICTED` — confirming
"Not Restricted"/"marchandise non réglementée" **is** a defined current DGR
term, strengthening `Q-7.2-007`'s and this item's basis (see that item's
updated note). The specific example "SDS" as the type of proof-document was
not independently located in §9.1.1/§9.1.7 this pass — the general document-
request duty and the "Not Restricted" terminology are Tier A confirmed, the
SDS example itself remains Tier B. Originally Tier B — KOST Function 7.2
course, slides 101 and 103.
**FR status:** PARTIALLY CONFIRMED — underlying mechanism and key terminology Tier A
confirmed 2026-08-25 (§9.1.1.2, §9.1.7); the SDS example specifically not
yet located verbatim.

**Reconciliation (2026-08-26):** OLD STATUS: DRAFT (topic-analysis conclusion had been reached but never stamped in this field before this reconciliation pass). NEW STATUS: PARTIALLY CONFIRMED. SOURCE: this item's own previously-recorded Tier A finding (see text above), now materialized. RATIONALE: mechanism and "Not Restricted" terminology Tier A-confirmed via §9.1.1.2/§9.1.7; the SDS worked example itself is not independently located verbatim.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-024 — Avertissements relatifs aux produits de consommation (DGR 9.1.7)

**Sub-task:** 3.4.2 Vérifier les colis pour indications de MD cachées/non déclarées
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Avertissements relatifs aux
produits de consommation — DGR 9.1.7), un article portant un symbole
d'avertissement ou un étiquetage de danger pour le consommateur répond
**nécessairement** aux critères de classification des marchandises
dangereuses énoncés en section 3.

**Correct answer:** Faux.

**Rationale:** Course slide 106: "Un article ou un emballage peut porter un
symbole d'avertissement ou un étiquetage de danger pour le consommateur.
L'article ou la substance contenue dans l'emballage **ne répond pas
nécessairement** aux critères de classification indiqués dans la section 3.
Des éclaircissements doivent être obtenus de l'expéditeur, si nécessaire,
avant d'accepter le colis comme « Not restricted »." The stem's claim
("répond nécessairement") is the direct negation of the source's own
"ne répond pas nécessairement" wording — correct answer is Faux.

**Source basis:** Tier A — DGR 67th Ed. 2026, §9.1.7 Avertissement au
consommateur (Bookshelf p.693 area): "Un article ou un colis peut être
porteur d'une étiquette ou d'un symbole de danger adressé au consommateur
du produit. **Cela ne signifie pas nécessairement** que l'article ou la
matière contenus dans le colis correspondent aux critères de classification
indiqués dans la partie 3. Dans un tel cas et avant d'accepter le colis
comme « marchandise non réglementée », des assurances devraient être
obtenues de l'expéditeur." — exact match, current section number identical
to the KOST slide's own citation; the stem's claim ("répond nécessairement")
is the direct negation of the current text's own "ne signifie pas
nécessairement," confirming "Faux". Originally Tier B — KOST Function 7.2
course, slide 106.
**FR status:** FROZEN FR / SOURCE VERIFIED (Tier A confirmed 2026-08-25).
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-025 — Qui signale un accident/incident de MD, et à qui (combined 7.1/7.2 pool)

**Sub-task:** 7.1 + 7.2 (combined, dual-tagged pool — same blueprint decision
as `Q-7.2-011`)
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Signaler les accidents et incidents
impliquant des marchandises dangereuses), qui doit signaler un accident ou
un incident de marchandises dangereuses, et aux autorités compétentes de
quel(s) État(s) ?

**Options:**
- **(Correct)** L'exploitant, aux autorités compétentes de l'État de
  l'exploitant ainsi qu'à celles de l'État dans lequel l'accident ou
  l'incident s'est produit.
- L'expéditeur, uniquement aux autorités compétentes de l'État de
  destination de l'envoi.
- Le personnel d'acceptation du fret, uniquement à l'Agence Nationale de
  l'Aviation Civile (ANAC).
- Le responsable DG, uniquement si l'accident implique des marchandises
  dangereuses totalement exemptées de la réglementation.

**Correct answer rationale:** Course slide 110: "L'exploitant doit signaler
les accidents et incidents de marchandises dangereuses aux autorités
compétentes de l'Etat de l'exploitant ainsi qu'aux ceux de celui dans
lequel l'accident ou l'incident s'est produit." This item deliberately
tests the "who reports, to whom" clause — the one distinct fact `Q-7.2-011`
explicitly left untested (that item tested only the exemption-inclusion
clause from the same slide) — no overlap between the two items' underlying
facts.

**Distractor rationale (source-grounded):**
- "L'expéditeur… État de destination" — wrong actor (the slide names
  "l'exploitant", never "l'expéditeur") and wrong single-state criterion
  (the slide's own test is "l'État où l'accident/incident s'est produit",
  not "destination").
- "Personnel d'acceptation… uniquement ANAC" — wrong actor; also conflates
  this slide's dual-state generic rule with the separate Algeria-specific
  ANAC-only reporting line for sub-task 7.4 (slide 113, already tested in
  `Q-7.2-010`).
- "Responsable DG… uniquement si… totalement exemptées" — wrong actor; also
  inverts `Q-7.2-011`'s own tested clause, which states the reporting duty
  **includes** DG partially exempted from the regulation — an inclusion,
  not an exclusive trigger condition.

**Source basis:** Tier A — DGR 67th Ed. 2026, §9.6.1 (Bookshelf p.693 area),
opening sentence, found during this same session's `Q-7.2-011` research:
"L'exploitant doit signaler les accidents et incidents de marchandises
dangereuses aux autorités compétentes de l'État de l'exploitant et de
l'état dans lequel l'accident ou l'incident s'est produit, conformément aux
exigences de signalement des autorités compétentes." — confirms the correct
answer exactly (actor = exploitant; dual-state recipient). Distractors
independently refuted: no DGR text anywhere names "l'expéditeur" as the
reporting actor for this duty; §9.6.4's own ANAC-Algeria-specific line
(cross-applied from `Q-7.2-010`) is a different, narrower sub-task, not a
substitute for this general dual-state rule; the exemption-inclusion clause
(§9.6.1 Note 1, per `Q-7.2-011`) is worded as inclusion, not an exclusive
trigger condition, refuting the fourth distractor. Originally Tier B —
KOST Function 7.2 course, slide 110 (same slide as `Q-7.2-011`, different
clause).
**FR status:** FROZEN FR / SOURCE VERIFIED (Tier A confirmed 2026-08-25).
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED. Note: with this item,
the 7.1+7.2 combined pool has now drawn 2 of its 3-item ceiling (1
remaining) — do not draft a third item without a genuinely new,
non-overlapping fact, which the single-slide source is unlikely to support.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-026 — Exemple de MD cachée dans le fret général : appareils dentaires (DGR 2.2.4)

**Sub-task:** 0.2.2 Reconnaître les marchandises dangereuses potentiellement cachées
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Exemples de DG cachées DGR 2.2.4), lequel
des articles suivants est cité par le cours comme un exemple typique de
marchandise dangereuse potentiellement cachée dans le fret général ?

**Options:**
- **(Correct)** Appareils dentaires
- Nitrate d'ammonium
- Arsenic
- Acide sulfurique

**Correct answer rationale:** Course slide 40 ("Exemples de DG cachées DGR
2.2.4"): "Pièces de rechange pour les aéronefs au sol (AOG)[,] Automobiles,
Pièces détachées et fournitures pour automobiles[,] **Appareils
dentaires**[,] Echantillons de diagnostic[,] Régulateurs de carburant[,]
Réfrigérateurs[,] Kits de réparation[,] Échantillons pour les tests[,]
Batteries et équipements électroniques[,] Produits de consommation
courante."

**Distractor rationale (source-grounded — each a genuine, declared DG
example from the 0.4.1 classes/divisions slide series, not from this
sub-task's "hidden in general cargo" example list):**
- Nitrate d'ammonium — per slide 64, this is the course's own Division 5.1
  (Comburant) example, already tested in `Q-7.2-004` — a real but
  differently-sourced/declared DG example, not a hidden-cargo item from
  this list.
- Arsenic — per slide 65, Division 6.1 (Substance Toxique) example, same
  wrong-list issue.
- Acide sulfurique — per slide 67, corrosive-materials example, same
  wrong-list issue.

**Source basis:** Tier A — DGR 67th Ed. 2026, §2.2.4 (Bookshelf p.12 area),
found during this session's Function 7.1 research (`Q-7.1-016`): current
list entry "APPAREILLAGE POUR DENTISTE — peut contenir des résines ou des
diluants inflammables, du gaz comprimé ou liquéfié, du mercure et des
matières radioactives" — confirms "appareils dentaires" is an explicit
current example. The three distractors (nitrate d'ammonium, arsenic, acide
sulfurique) are genuine named *substances* from Table 4.2/§3.0.2's
classification examples, not §2.2.4's generic-description category list —
structurally a different list by nature, confirming the distractor logic.
Originally Tier B — KOST Function 7.2 course, slide 40. Directly and
strongly corroborated by Exam Q10 ("Quelles matières dangereuses peuvent
êtres non déclarées (cachées) dans l'appareillage pour dentiste ?").
**FR status:** FROZEN FR / SOURCE VERIFIED (Tier A confirmed 2026-08-25).
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-027 — Les trois divisions de la Classe 2 (DGR 3.0.2)

**Sub-task:** 0.4.1 Trouver de l'information générale sur les classes et les divisions
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Les classes des marchandises
dangereuses DGR 3.0.2), la Classe 2 des marchandises dangereuses comprend
trois divisions : Gaz inflammable (2.1), Gaz non inflammable et non toxique
(2.2), et Gaz toxique (2.3).

**Correct answer:** Vrai.

**Rationale:** Course slide 61: "3 Divisions — Division 2.1 Gaz inflammable
… Ex : Butane, Propane etc.[;] Division 2.2 Gaz non inflammable et non
toxique … Ex : Azote, Hélium[;] Division 2.3 Gaz Toxique … Ex : Bombe
anti-agression." Direct, complete match on the count and all three division
labels.

**Source basis:** Tier A — DGR 67th Ed. 2026, §3.0.2.2 Classe 2 — Gaz
(Bookshelf p.307), found during this session's Function 7.1 research:
"• Division 2.1 — Gaz inflammables. • Division 2.2 — Gaz ininflammables non
toxiques. • Division 2.3 — Gaz toxiques." — confirms exactly three
divisions with matching current labels (current "Gaz ininflammables non
toxiques" vs. KOST's "Gaz non inflammable et non toxique" — trivial
phrasing variant, same meaning). Originally Tier B — KOST Function 7.2
course, slide 61. Directly and strongly corroborated by Practice Q11 ("Il
y'a trois divisions dans la classe 2 du DGR — a) Vrai b) Faux").
**FR status:** FROZEN FR / SOURCE VERIFIED (Tier A confirmed 2026-08-25).
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-028 — Étiquette de danger chimique : clarification avant acceptation ("Autre étiquetage")

**Sub-task:** 0.5.2 Reconnaître les prescriptions de base concernant l'étiquetage
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (« Autre étiquetage »), que doit faire le
personnel d'acceptation avant d'accepter un colis portant une étiquette de
danger chimique, sachant que l'article qu'elle accompagne ne répond pas
forcément à la classification des marchandises dangereuses du règlement ?

**Options:**
- **(Correct)** Penser à demander des clarifications à l'expéditeur avant
  l'acceptation.
- Accepter automatiquement le colis comme fret général, l'étiquette
  chimique n'étant pas une étiquette DGR officielle.
- Refuser systématiquement le colis sans consulter l'expéditeur.
- Isoler le colis du flux de fret général et informer le responsable DG.

**Correct answer rationale:** Course slide 81 ("Autre étiquetage"):
"Certains colis portent des étiquettes de danger chimique. Les articles
qui y sont contenus ne répondent pas forcement à la classification des DG
conformément à la réglementation. Cependant avant acceptation, pensez à
demander des clarifications à l'expéditeur."

**Distractor rationale (source-grounded):**
- Automatic acceptance — understates the course's own instruction, which
  explicitly calls for seeking clarification, not treating the label as
  irrelevant.
- Automatic refusal without consulting the shipper — overstates the
  course's instruction in the opposite direction; the slide's actual
  guidance is to seek clarification, not to refuse outright.
- Isolate and inform the responsable DG — this is the **different** 3.4.2
  suspect-package action set (slide 100, already tested in `Q-7.2-008`), a
  distinct sub-task's procedure, not what this specific chemical-hazard-
  label slide instructs.

**Source basis:** Tier B, context Tier A-confirmed — DGR 67th Ed. 2026,
§9.1.7 (Bookshelf p.693 area, same provision confirmed for `Q-7.2-024`)
confirms the surrounding context: a chemical-hazard/consumer-warning label
does not necessarily mean the DGR Part 3 classification criteria are met,
and "des assurances devraient être obtenues de l'expéditeur" before
acceptance as "marchandise non réglementée" — a real, current, Tier A
"seek assurance from the shipper" duty. The item's specific framing ("Autre
étiquetage" slide, "penser à demander des clarifications") is a close
paraphrase of this same duty, not a separate DGR provision — likely the
same underlying §9.1.7 text, not independently re-confirmed as a distinct
citation this pass. Originally Tier B — KOST Function 7.2 course, slide 81.
**FR status:** PARTIALLY CONFIRMED — underlying duty Tier A-confirmed via §9.1.7 (shared
with `Q-7.2-024`); treat as the same provision rather than a separate DGR
6.0.4-area citation before finalizing wording.

**Reconciliation (2026-08-26):** OLD STATUS: DRAFT (topic-analysis conclusion had been reached but never stamped in this field before this reconciliation pass). NEW STATUS: PARTIALLY CONFIRMED. SOURCE: this item's own previously-recorded Tier A finding (see text above), now materialized. RATIONALE: underlying duty Tier A-confirmed via §9.1.7 (shared basis with Q-7.2-024); this item's own distinct citation is not independently confirmed.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Batch 2 summary table

| ID | Sub-task | FR status | Type | Current source basis (Tier) | EN status | Approval |
|---|---|---|---|---|---|---|
| Q-7.2-012 | 0.1.1 Définition fret général | DRAFT — Tier A not attempted | MCQ | KOST F7.2 course slide 16 (DGR 1.0) | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-013 | 0.1.3 Champ d'application | FROZEN FR / SOURCE VERIFIED | MCQ | DGR 67e §1.2.1 (p.11) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-014 | 0.2.1 MD interdites | FROZEN FR / SOURCE VERIFIED (citation corrected §4.2→§2.1.1) | MCQ | DGR 67e §2.1.1 (p.12 area) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-015 | 0.2.3 Dispositions passagers | FROZEN FR / SOURCE VERIFIED | True/False | DGR 67e §2.3.0.1 + Note 2 (p.12 area) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-016 | 0.3.1 Responsabilités exploitant | FROZEN FR / SOURCE VERIFIED | MCQ | DGR 67e §1.4.1 (p.11) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-017 | 0.3.3 Divergences exploitant | FROZEN FR / SOURCE VERIFIED | MCQ | DGR 67e AM1 §2.8.3.1 — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-018 | 0.4.2 Groupes d'emballage | FROZEN FR / SOURCE VERIFIED | MCQ | DGR 67e §3.0.3.1 (p.307) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-019 | 0.5.1 Critères de marquage | FROZEN FR / SOURCE VERIFIED | True/False | DGR 67e §7.1.3.2 (p.688 area) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-020 | 0.5.3 Contenu LTA (DGR 8.2) | FROZEN FR / SOURCE VERIFIED (confirmed during F7.3 research) | MCQ | DGR 67e §8.2.1 (p.690 area) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-021 | 0.6.1 Première action d'urgence | FR SOURCE GAP CONFIRMED (expanded search: citation stale AND 5-step content not located anywhere in current DGR, incl. §9.3.6) | MCQ | Not located in current DGR — Tier B retained | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-022 | 0.6.2 Info employés exploitant | FR SOURCE GAP CONFIRMED (§9.5.1.2 confirmed to cover a different topic — pilot-in-command access to ICAO Doc 9481; this claim not located elsewhere) | True/False | DGR 67e AM1 §9.5.1.2 (confirms different topic) — Tier A search, content Tier B retained | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-023 | 3.4.1 Demande SDS | PARTIALLY CONFIRMED — mechanism + "Not Restricted" term Tier A-confirmed, SDS example itself Tier B | MCQ | DGR 67e §9.1.1.2 + §9.1.7 (p.693 area) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-024 | 3.4.2 Avertissement consommateur | FROZEN FR / SOURCE VERIFIED | True/False | DGR 67e §9.1.7 (p.693 area) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-025 | 7.1+7.2 Qui/à qui | FROZEN FR / SOURCE VERIFIED | MCQ | DGR 67e §9.6.1 (p.693 area) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-026 | 0.2.2 Exemple appareils dentaires | FROZEN FR / SOURCE VERIFIED | MCQ | DGR 67e §2.2.4 (p.12 area) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-027 | 0.4.1 Classe 2, 3 divisions | FROZEN FR / SOURCE VERIFIED | True/False | DGR 67e §3.0.2.2 (p.307) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-028 | 0.5.2 Étiquette danger chimique | PARTIALLY CONFIRMED — underlying duty Tier A-confirmed (shared with Q-7.2-024's §9.1.7), distinct citation unconfirmed | MCQ | DGR 67e §9.1.7 (p.693 area) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |

**Batch 2 composition:** 11 MCQ + 6 True/False. Block spread: Block 0 = 14,
Block 3 = 2, Block 7 = 1.

**2026-08-25 Tier A verification summary:** 10/17 `FROZEN FR / SOURCE
VERIFIED` (013, 014, 015, 016, 018, 019, 024, 025, 026, 027 — several
cross-applied from Function 7.1 research or from text already surfaced
this session, one citation corrected 014's §4.2→§2.1.1). 2/17 (023, 028)
have their general duty/underlying provision Tier A-confirmed but a
specific detail (SDS example; the exact "Autre étiquetage" framing) not
independently pinned down. 2/17 (021, 022) carry a **stale citation
finding** — the KOST-cited §9.5.1.2 covers a different topic in the current
edition (ICAO Doc 9481 availability to the pilot-in-command, not general
employer/employee emergency-procedure awareness); the actual current source
for their content was not located this pass. 3/17 (012, 017, 020) were not
attempted this pass (no efficient cross-application available; would need
dedicated new navigation to §1.0's "fret général" framing, §2.8, and Part 8
Documentation respectively).

**Combined Batch 1 + Batch 2 totals:** 28 items drawn (11 + 17) across 17 of
23 sub-task leaves, out of the 89-question provisional ceiling. Block 0:
19 of 62 ceiling drawn (13 of 17 leaves touched — only 0.1.2, 0.1.4, and
the hard-gated 0.4.3 remain at their Batch 1/gap levels). Block 3: 5 of 18
ceiling drawn (both leaves touched). Block 7: 4 of 9 ceiling drawn (all
three pools touched).

## What Batch 2 does NOT do

- Does not exceed any per-sub-task ceiling in
  `docs/DGR_STAGE2A_FUNCTION_7.2_BLUEPRINT.md` (see the ceiling-compliance
  table above — every total-drawn figure is at or below its ceiling; three
  leaves — 0.2.3, 0.5.1, 0.6.2 — are now fully drawn at their ceiling of 1
  and must not receive a future item without new source material).
- Does not draft any item against sub-task 0.4.3 — confirmed `SOURCE GAP`,
  stays at 0 questions.
- Does not draft a third item for the 7.1+7.2 combined pool — 2 of 3 now
  drawn; the single-slide source is unlikely to support a genuinely
  non-overlapping third fact.
- Does not draft a second item for 7.3 or 7.4 — each sub-task's source is
  effectively one short slide already fully tested by Batch 1; a second item
  would duplicate the same underlying fact under new wording.
- Does not re-draft or duplicate any Batch 1 item's underlying fact — see
  the "Duplication check against Batch 1" section above for the explicit
  per-item verification.
- Does not mark any item `APPROVED` — no qualified reviewer exists in this
  pass; Tier A verification (2026-08-25) and reviewer sign-off remain
  separate gates.
- Does not touch Moodle or any live/production question-bank copy.
- Does not exhaust Block 0, Block 3, or Block 7 — after both batches, 6 of
  Block 0's 17 leaves (0.1.2, 0.1.4, plus the 0.4.3 gap) have headroom or
  gap status left untouched by Batch 2's second-pass items, and every
  drawn leaf still has substantial remaining headroom below its ceiling
  (see the per-leaf "Remaining headroom" column above) — a future batch
  could still draw meaningfully more before approaching the 89-question
  provisional ceiling.

---

# Batch 3

Third production drafting pass against
`docs/DGR_STAGE2A_FUNCTION_7.2_BLUEPRINT.md`. By this pass, the leaves
Batches 1+2 left completely untouched, the "already fully drawn at ceiling"
leaves, and the confirmed `SOURCE GAP` (0.4.3) were already known. This
batch re-read the full course text page by page (not just Batch 1/2's own
prose) specifically hunting for genuinely new, non-overlapping facts on
leaves Batches 1+2 had drawn only 1–2 items from despite real remaining
headroom, and explicitly tested several leaves for genuine exhaustion
before drafting anything against them. Continues the question ID sequence
from `Q-7.2-029`.

## Status of this batch — read before using any item below

**2026-08-25 Tier A verification pass (consolidated note — see the Batch 3
summary table below for the per-item outcome; full source paragraphs below
are NOT individually rewritten for this batch to keep pace across the
remaining program, but every Tier A conclusion here is a real citation, not
inferred):**

- **7 items `FROZEN FR / SOURCE VERIFIED`:** Q-7.2-035 (§1.3.1.1-1.3.1.2,
  shipper conformity/sanctions — cross-applied from already-loaded Partie 1
  text), Q-7.2-039 (§3.0.2.1 Division 1.1, "danger d'explosion en masse" —
  cross-applied from Partie 3), Q-7.2-040 (§3.0.2.6 Division 6.2 "Matières
  infectieuses" — cross-applied), Q-7.2-041 (§3.0.2 class-to-hazard-type
  mapping for Classes 5/6/8/9 — cross-applied; the item's own "label"
  framing itself, i.e. Figure 7.3's exact label names, not independently
  re-checked this pass, but the underlying class/hazard-type pairing is
  Tier A confirmed), Q-7.2-044 (§9.8.1, 3-month document retention — new
  lookup this pass, confirms "Déclaration de l'expéditeur... et les autres
  documents de transport pertinents" retained "durant une période minimale
  de trois mois"), Q-7.2-049 (§9.1.1.2 Note 2 / §2.2.2 Note, GHS pictogram
  text — cross-applied, exact match).
- **1 item cross-applies the DGR-wide danger/risque silence:** Q-7.2-031
  (worked example built on terms the DGR does not itself define — same
  `Q-7.1-001`/`Q-7.2-002` finding; retained Tier B).
- **2 items partially confirmed:** Q-7.2-036 (§1.5.1.1.2/§1.5.1.3 confirm
  the "qu'ils soient ou non approuvés" clause and the ~24-month/2-year
  refresher cadence, but the current 67th Ed. describes a materially
  different, more elaborate **competency-based training-and-evaluation
  framework** — §1.5.1.1-1.5.2, explicitly named "FORMATION ET ÉVALUATION
  SELON L'APPROCHE AXÉE SUR LES COMPÉTENCES" — than the drafted item's
  simpler "épreuve obligatoire (test) pour chaque formation" framing, which
  reads as reflecting an older edition's model; flagged for a revision
  pass, not silently certified); Q-7.2-047 (§9.1.1.2 confirms the general
  shipper-side confirmation duty, but the item's specific "first
  instruction: verify against class definitions" two-step itemization was
  not independently located verbatim).
- **12 items not resolved this pass** (`Q-7.2-029`, `030`, `032`, `033`,
  `034`, `037`, `038`, `042`, `043`, `045`, `046`, `048`) — no efficient
  cross-application was available from text already surfaced this session,
  and dedicated new navigation was not attempted for all of them given the
  program's overall scope; several (029 Article/Substance terminology, 030
  "document terrain" framing, 033 COMAT) may sit in Introduction/Préface
  pages or the Glossaire, not yet read. `Q-7.2-045` likely shares
  `Q-7.2-021`/`022`'s stale-citation finding (same KOST slides 87–89, same
  §9.5.1.2 mismatch) but this was not independently re-confirmed. No
  content was fabricated for any of the 12 — all remain `DRAFT`, Tier B,
  exactly as before this pass, with no status inflation.

**Original status (superseded for the 10 items above; unchanged for the
other 11):** all 21 items were originally `DRAFT`, Tier B basis only,
Tier A-unattempted, for the reasons below.

- Per this task's explicit instruction, **no Tier A verification was
  attempted this session.** `docs/AI_HANDOFF.md`'s "2026-08-25 (still later
  same day) — Tier A retry #2" entry records the current, more specific
  blocker: every available `chrome-devtools` MCP tool (`navigate`,
  `evaluate`, `screenshot`) returns the identical error *"The selected page
  has been closed. Call list_pages to see open pages"* — a page-selection/
  MCP-binding failure, not a content or credential issue, and no
  `list_pages`/`select_page` tool exists in this toolset to recover from
  it. This is a technical blocker on the tool side, not something to guess
  around or route around with a different login attempt. Per that entry's
  own recorded consequence, Track B work (further production-question
  batches) continues without re-attempting Tier A. This entire batch is
  Tier B only, exactly like Batches 1 and 2.
- Every item below is sourced directly and verbatim-traced to the actual
  **KOST Function 7.2 training material** (Tier B), re-extracted this
  session with `pdftotext -layout`, split into individual pages on the
  literal form-feed byte (confirmed 117 form feeds via a direct byte count,
  matching `pdfinfo`'s 117-page count exactly — not the miscounted split
  from an earlier, corrected attempt in this same session), and each
  candidate page read in full before any item was drafted against it, from
  the same source folder as Batches 1–2:
  `/Users/mac/Documents/Fichiers/Algerie/CBTA final/yasmine cbta/wetransfer_supports-pedagogiques-dgr-cbta-kost-academy_2025-10-12_1842/COURS DGR-CBTA-IATA/DGR-FONCTION 7.2/`:
  - `04_KOST_DGR_CBTA_Course_Function_7.2_FR_2025.pdf` — course, cited below
    by printed slide/page number; the file-index-to-printed-page-number
    alignment was spot-checked against ~30 pages before use (file index N
    = printed page N throughout, confirmed).
  - `02_KOST_DGR_CBTA_Exam_Function_7.2_FR_Rev00_2025.pdf` (F-KOST 05, 20Q)
    — re-read in full this session; used only as corroborating
    cross-reference, never copied verbatim as a question stem. Two items
    below (`Q-7.2-034`, `Q-7.2-043`) are strongly corroborated by exam
    items (Q15, Q17 respectively) — noted explicitly in each item's Source
    basis, with the stem still independently built from the course's own
    slide content, not copied from the exam.
  - `05_KOST_DGR_CBTA_Practice_Book_Function_7.2_FR_2025.pdf` (F-KOST 09,
    20Q) — re-read in full this session; one item below (`Q-7.2-046`) is
    strongly corroborated by practice book Q20, noted explicitly.
- Every "DGR x.y.z" section number cited below is **as displayed on the
  KOST slide itself** — Tier B, not independently re-verified against the
  current 67th Edition/Addendum 1 text in this pass. Note: course slide 26
  ("Base Réglementaire") itself displays "66ᵉ édition" for the IATA DGR
  manual it describes — this is the KOST course's own material, not this
  repo's Tier A baseline (67th Edition 2026, Addendum 1 integrated); the
  discrepancy is not resolved by this pass and is flagged here so a future
  Tier A reviewer does not assume the course's own edition reference is
  current.
- Per `.claude/rules/dgr-stage2b.md` rule 4, **no item in this batch may be
  marked `APPROVED`.** Status is `DRAFT` only.

## Duplication check against Batches 1 and 2 (rule: no re-drafted underlying fact)

Every item below was individually checked against every Batch 1 and Batch 2
item already drafted for the same leaf, and against every other new item in
this batch, before being finalized. The method: (1) identify the specific
slide the new item's *correct answer* comes from; (2) confirm no prior
item's correct answer, in any batch, is sourced to that same slide's same
clause; (3) where a new item's slide had already been used *only as a
distractor* in a prior item (this happens for several items below — e.g.
`Q-7.2-030` reuses the SCoETDG/AIEA/OACI hierarchy slides p.20–22, already
Q-7.2-001's correct-answer/distractor material, but only as *this* item's
distractors, not its correct answer; `Q-7.2-033`'s distractors reuse the
reused-packaging rule from p.44 and the detection-indicator fact from p.43,
both already-used material, again only as distractors), that reuse is
noted explicitly in the item's own distractor rationale so the cross-batch
relationship is traceable, matching the established Batch 1/2 practice of
citing exactly which prior item already tested a fact used elsewhere as a
distractor.

Two pairs of items in this batch draw on the **same slide** as each other
or as a Batch 1/2 item, each deliberately testing a **different, explicitly
identified clause** of that slide (the same non-overlapping-clause pattern
Batch 2 already used for `Q-7.2-011`/`Q-7.2-025` and `Q-7.2-006`/`Q-7.2-023`):
- `Q-7.2-031` (0.1.4) reuses the flammable-liquid worked example slide
  (p.34) that Batch 1's `Q-7.2-002` never drew from (Q-7.2-002 used the
  abstract Risque/Danger *definitions*, p.32–33) — no overlap.
- `Q-7.2-047` (3.4.1) reuses the DGR 2.2.4 shipper-instructions slide
  (p.102) that Batch 1's `Q-7.2-007` already drew from — `Q-7.2-007` tested
  only the slide's *second* instruction (the "Not Restricted" LTA
  endorsement); `Q-7.2-047` tests only the slide's *first*, distinct
  instruction (verifying the shipment against class definitions/special
  provisions). No overlap, explicitly flagged in `Q-7.2-047`'s own
  rationale.
- `Q-7.2-046` (3.4.1) and Batch 1's `Q-7.2-008` (3.4.2) both concern a
  "colis suspect," but test genuinely different facts from different
  slides/stages: `Q-7.2-008` tests the isolation/notification actions once
  a package has already been physically flagged suspect (p.98–100);
  `Q-7.2-046` tests the separate "en cas de doute" documentation-review
  consistency-check clause, including the previously-untested "noter
  l'anomalie dans le registre interne" detail (p.98's own "Vérifier la
  cohérence" section). Both happen to be corroborated by the same practice
  book Q20 (which covers the whole suspect-package scenario end to end),
  but each item's *correct answer* is a different specific clause —
  flagged explicitly in `Q-7.2-046`'s rationale for transparency.

No item in this batch re-tests any Batch 1 or Batch 2 item's underlying
correct-answer fact.

## Sub-task selection and ceiling compliance

| Sub-task | Title | Blueprint ceiling | B1 drawn | B2 drawn | B3 drawn | Total drawn | Remaining headroom | New item(s) |
|---|---|---|---|---|---|---|---|---|
| 0.1.1 | Comprendre la définition | 3 | 0 | 1 | 1 | 2 | 1 | Q-7.2-029 |
| 0.1.2 | Reconnaître le cadre juridique | 4 | 1 | 0 | 1 | 2 | 2 | Q-7.2-030 |
| 0.1.3 | Déterminer l'application et la portée | 3 | 0 | 1 | 0 | 1 | 2 (genuinely exhausted — see below) | — |
| 0.1.4 | Danger vs Risque | 4 | 1 | 0 | 1 | 2 | 2 | Q-7.2-031 |
| 0.2.1 | MD interdites | 3 | 0 | 1 | 1 | 2 | 1 | Q-7.2-032 |
| 0.2.2 | MD potentiellement cachées | 8 | 1 | 1 | 2 | 4 | 4 | Q-7.2-033, Q-7.2-034 |
| 0.2.3 | Dispositions passagers | 1 | 0 | 1 | 0 | 1 | 0 (fully drawn) | — |
| 0.3.1 | Rôle des parties prenantes | 4 | 0 | 1 | 2 | 3 | 1 | Q-7.2-035, Q-7.2-036 |
| 0.3.3 | Divergences États/exploitants | 3 | 0 | 1 | 2 | 3 | 0 (fully drawn) | Q-7.2-037, Q-7.2-038 |
| 0.4.1 | Classes et divisions | 8 | 1 | 1 | 2 | 4 | 4 | Q-7.2-039, Q-7.2-040 |
| 0.4.2 | Groupes d'emballage | 4 | 0 | 1 | 0 | 1 | 3 (genuinely exhausted — see below) | — |
| 0.4.3 | Multiples dangers | 0 | 0 | 0 | 0 | 0 | 0 (hard-gated SOURCE GAP) | — |
| 0.5.1 | Prescriptions — marquage | 1 | 0 | 1 | 0 | 1 | 0 (fully drawn) | — |
| 0.5.2 | Prescriptions — étiquetage | 8 | 1 | 1 | 2 | 4 | 4 | Q-7.2-041, Q-7.2-042 |
| 0.5.3 | Documents exigés | 4 | 0 | 1 | 2 | 3 | 1 | Q-7.2-043, Q-7.2-044 |
| 0.6.1 | Sensibilisation urgence générale | 3 | 0 | 1 | 1 | 2 | 1 | Q-7.2-045 |
| 0.6.2 | Urgence — exigences employeur | 1 | 0 | 1 | 0 | 1 | 0 (fully drawn) | — |
| 3.4.1 | Vérif. documentation | 10 | 2 | 1 | 2 | 5 | 5 | Q-7.2-046, Q-7.2-047 |
| 3.4.2 | Vérif. colis | 8 | 1 | 1 | 2 | 4 | 4 | Q-7.2-048, Q-7.2-049 |
| 7.1+7.2 (combined) | Signaler accidents/incidents | 3 | 1 | 1 | 0 | 2 | 1 (genuinely exhausted — see below) | — |
| 7.3 | MD non déclarées | 3 | 1 | 0 | 0 | 1 | 2 (genuinely exhausted — see below) | — |
| 7.4 | Situations MD | 3 | 1 | 0 | 0 | 1 | 2 (genuinely exhausted — see below) | — |
| **Total** | | **89** | **11** | **17** | **21** | **49** | | |

**Block spread this batch:** Block 0 = 17 items, Block 3 = 4 items, Block 7
= 0 items. **Running total after three batches: 49 of 89 (Block 0: 36/62,
Block 3: 9/18, Block 7: 4/9).**

## Leaves this batch found genuinely exhausted — explicit, not padded

Per this task's explicit instruction to report genuine yield exhaustion
honestly rather than force items to fill nominal headroom, five leaves were
individually re-examined this batch and found to have **no further
distinct, non-overlapping, source-traceable fact** worth drafting, despite
each carrying nominal headroom on the blueprint's ceiling:

- **0.1.3 (Déterminer l'application et la portée) — 2 of 3 nominal
  headroom, but genuinely exhausted.** A full-text search of the course
  for "1.2.1" and "Applicab" (case-insensitive) returns exactly one hit:
  slide 31, already Batch 2's `Q-7.2-013`. No second slide, exam item, or
  practice-book item addresses DGR applicability/scope anywhere else in
  the material. Do not draft a second item here without new source
  material.
- **0.4.2 (Groupes d'emballage) — 3 of 4 nominal headroom, but genuinely
  exhausted.** The entire sub-task's source is the single PG I/II/III
  degree-of-danger table on slide 69, already fully drawn for its "Groupe
  II" row by Batch 2's `Q-7.2-018`. No other slide, exam item, or
  practice-book item develops packing groups further; drafting a second
  item would mean re-testing the same three-row table under new wording
  (e.g. asking about Groupe I or III instead of II), which is exactly the
  kind of near-duplicate this program's rules are meant to avoid.
- **7.1+7.2 combined pool — 1 of 3 nominal headroom, but genuinely
  exhausted.** Re-read slide 110 in full (the pool's sole source, already
  used twice: Batch 1's `Q-7.2-011` tested the exemption-inclusion clause,
  Batch 2's `Q-7.2-025` tested the who-reports/to-whom clause). Between
  them, these two items exhaust the slide's only two independently stated
  clauses; there is no third distinct fact left on this one-slide source.
  Confirms Batch 2's own note that a third item here was "unlikely" —
  this batch confirms it directly rather than merely predicting it.
- **7.3 (MD non déclarées/mal déclarées) — 2 of 3 nominal headroom, but
  genuinely exhausted.** The sub-task's entire source is the single short
  slide 111, already fully drawn by Batch 1's `Q-7.2-009`. No exam or
  practice-book item touches this sub-task at all (consistent with Stage
  1's own finding). No second fact exists to draft.
- **7.4 (Situations MD) — 2 of 3 nominal headroom, but genuinely
  exhausted.** Slide 112 is a bare section-title slide with no content of
  its own beyond the heading (re-confirmed this pass — the printed page
  contains only the title and the "Compte rendu accidents et incidents DGR
  9.6.5" sub-heading, nothing else). Slide 113's substantive content (the
  Algeria/ANAC reporting-authority fact, plus the Rouiba registered-office
  address already flagged as non-regulatory administrative detail) is
  already fully drawn by Batch 1's `Q-7.2-010`. No second fact exists to
  draft without inventing content the slide does not contain.

**Also not drafted, and why (already fully drawn at ceiling, not
exhausted-but-untested):** 0.2.3, 0.5.1, and 0.6.2 each remain at their
Batch 1/2 count of 1, matching their blueprint ceiling of 1 exactly — they
are not re-examined for "more headroom" because none exists; this is a
different category from the five genuinely-exhausted-with-headroom leaves
above.

**0.4.3 remains at 0** — confirmed `SOURCE GAP`, unchanged and hard-gated
per the blueprint. Not drafted, not inferred.

**Leaves still carrying real, usable headroom after this batch** (for a
hypothetical Batch 4, source permitting a fresh look rather than a
guarantee): 0.1.1 (1), 0.1.2 (2), 0.1.4 (2), 0.2.1 (1), 0.2.2 (4), 0.3.1
(1), 0.4.1 (4), 0.5.2 (4), 0.5.3 (1), 0.6.1 (1), 3.4.1 (5), 3.4.2 (4) — in
several of these (0.2.2, 0.4.1, 0.5.2, 3.4.1 especially), this batch
deliberately drew fewer items than the richest possible reading of the
source would allow, to keep the batch's own per-leaf counts proportionate
and avoid concentrating this pass in only two or three leaves; the
specific additional facts identified but left undrafted this batch are
noted inline in the relevant items' rationale sections below (e.g.
`Q-7.2-033`'s rationale notes the reused-packaging rule on slide 44 was
used only as a distractor, not drafted as its own item this batch).

## Method notes on distractor sourcing (rule 6 compliance)

Same method as Batches 1 and 2: every distractor is either (a) a real,
correctly stated fact drawn from a *different* slide/sub-task in the same
KOST course (or, for two items, the KOST exam/practice book's own
wrong-answer set), repurposed here as a wrong answer to *this* question, or
(b) the source's own negative/contrasting statement. No distractor asserts
an invented regulatory fact. Each distractor's source slide is cited so the
wrongness is traceable.

---

## Q-7.2-029 — Distinction terminologique « Article » / « Substance »

**Sub-task:** 0.1.1 Comprendre la définition
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Généralités), comment le cours distingue-t-il
un « Article » d'une « Substance » ?

**Options:**
- **(Correct)** Un article est un objet dans sa forme complète (ex. une
  voiture) ; une substance, qui peut être solide, liquide ou gazeuse, est
  ce qui est éventuellement contenu dans un article (ex. le carburant est
  une substance dans un article ; le liquide des freins est une
  substance).
- Un article est un produit, un objet ou une substance susceptible de
  présenter un danger pour la santé, la sécurité, la propriété ou
  l'environnement ; une substance est ce qui n'entre dans aucune de ces
  catégories.
- Un article est tout envoi transporté par avion qui n'est pas déclaré,
  identifié ou traité comme marchandise dangereuse ; une substance est un
  envoi correctement déclaré.
- Un article est le degré de probabilité qu'un danger cause réellement un
  dommage ; une substance est ce qui pourrait potentiellement causer des
  dommages.

**Correct answer rationale:** Course slides 13–14 ("Qu'est-ce que
l'Article?" / "Qu'est-ce que la Substance?"): "Un article est un objet dans
sa forme complète[.] Une voiture est un article" / "Une substance peut
être solide, liquide ou gazeuse[.] Le carburant est une substance dans un
article[.] Le liquide des freins est une substance."

**Distractor rationale (source-grounded — each option swaps in the course's
own definition of a *different* concept, from slides already used
elsewhere in the bank as a different item's primary fact):**
- Option 2 — this is the course's own definition of "marchandises
  dangereuses" itself (slide 15), a substantive hazard-classification
  concept, not this slide's basic physical-form terminology (article =
  complete object vs. substance = the solid/liquid/gas it may contain).
- Option 3 — this is the course's own "fret général" definition (slide 16,
  the primary fact tested by `Q-7.2-012`), unrelated to the article/
  substance distinction.
- Option 4 — swaps in the course's own Risque/Danger definitions (slides
  32–33, the primary facts tested by `Q-7.2-002`), a different taught
  distinction entirely.

**Source basis:** Tier B — KOST Function 7.2 course, slides 13–14
("Généralités" — Qu'est-ce que l'Article? / Qu'est-ce que la Substance?).
No direct exam/practice-book hit found for this specific terminology pair.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-030 — Le DGR de l'IATA comme document « terrain » (DGR — Base Réglementaire)

**Sub-task:** 0.1.2 Reconnaître le cadre juridique (mondial, national)
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Base Réglementaire), comment le manuel DGR de
l'IATA est-il considéré, et par quelle organisation est-il reconnu comme
tel ?

**Options:**
- **(Correct)** Comme le document « terrain », reconnu comme tel par
  l'OACI.
- Comme l'organisme qui élabore des procédures recommandées pour le
  transport de toutes les marchandises dangereuses, à l'exception des
  matières radioactives.
- Comme l'organisme qui élabore des recommandations pour le transport
  sécuritaire des matières radioactives uniquement.
- Comme le texte codifié dans l'Annexe 18 et dans les Instructions
  techniques de l'OACI.

**Correct answer rationale:** Course slide 26 ("Base Réglementaire — DGR de
l'IATA"): "Le manuel DGR de l'IATA est considéré comme le document
« terrain » et est reconnu comme tel par l'OACI."

**Distractor rationale (source-grounded — each option is the course's own
description of a *different body* in the same regulatory-hierarchy slide
series, already the correct answer/distractor material of `Q-7.2-001`,
reused here only as distractors for this different question about what the
IATA DGR manual itself *is*):**
- Option 2 — this is the course's own description of the SCoETDG (slide 20,
  the correct answer of `Q-7.2-001`), a UN-level drafting body, not what
  the IATA DGR manual itself is called or how OACI treats it.
- Option 3 — this is the course's own description of the AIEA (slide 21, a
  `Q-7.2-001` distractor), a different body with a different, narrower
  scope.
- Option 4 — this is the course's own description of OACI's *own* output
  (slide 22: OACI codifies its regulation "dans l'annexe 18 et dans les
  Instructions techniques"), not a description of the IATA DGR manual,
  which this same slide series distinguishes as a separate, IATA-authored
  document (slide 23) reflecting but not identical to Annex 18/the ITs.

**Source basis:** Tier B — KOST Function 7.2 course, slide 26 ("Base
Réglementaire — DGR de l'IATA"). Note: this slide's own text displays "66ᵉ
édition" for the manual it describes — a KOST-course detail, not this
repo's Tier A baseline (67th Edition 2026) and not itself tested by this
item's stem/options. Loosely corroborated by Exam Q2 ("Quelle publication
annuelle fournit la réglementation… a) IATA Dangerous goods regulation"),
which tests the IATA DGR's role as the operative publication from an
adjacent angle, not this item's specific "document terrain"/OACI-
recognition wording.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-031 — Exemple travaillé : danger et risque du liquide inflammable

**Sub-task:** 0.1.4 Faire la distinction entre un danger et un risque
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (exemple travaillé — Liquide inflammable),
dans cet exemple précis, qu'est-ce qui illustre concrètement le « risque »,
par opposition au « danger » ?

**Options:**
- **(Correct)** La probabilité que le liquide s'enflamme lors de son
  transport aérien — par exemple si son contenant est mal fermé, ou exposé
  au soleil ou à une source de chaleur.
- Son inflammabilité elle-même, le fait qu'il puisse s'enflammer
  facilement.
- Quelque chose qui pourrait potentiellement causer des dommages.
- Toute forme de liquide, de vapeur, de poussière, de fumées ou de gaz qui
  pourrait se déverser, fuir ou être mal utilisé.

**Correct answer rationale:** Course slide 34: "Ex: Liquide inflammable[.]
Danger: son inflammabilité, le fait qu'il puisse s'enflammer facilement[.]
Risque: quelle est la probabilité qu'il s'enflamme lors de son transport
aérien ? contenant est mal fermé, exposé au soleil ou à une source de
chaleur." This item deliberately tests this worked example's specific risk
illustration — a different, more applied fact than `Q-7.2-002`'s abstract
Risque/Danger *definitions* (slides 32–33); no overlap between the two
items' underlying tested facts.

**Distractor rationale (source-grounded):**
- Option 2 — per the same slide (34), this is explicitly what the course
  labels as this example's **Danger**, not its Risque — the direct
  contrast this question tests.
- Option 3 — this is the course's own generic **Risque** definition (slide
  32, already the correct answer of `Q-7.2-002`), presented out of context
  here as if it were this specific worked example's own illustration
  rather than the abstract definition.
- Option 4 — this is the course's own "Dangers chimiques" example category
  (slide 33, already a `Q-7.2-002` distractor), a different, generic
  hazard-type description, not this worked example's risk illustration.

**Source basis:** Tier B — KOST Function 7.2 course, slide 34 (flammable-
liquid worked example, immediately following the "Faire la distinction
entre un danger et un risque" definitional slides 32–33). No direct exam/
practice-book hit for this specific worked example (the adjoining slide 35
"Exercice" on gasoline is an open, unanswered classroom exercise, not a
scored exam/practice item, and is not used as this item's source).
**FR status:** FR SOURCE GAP CONFIRMED (cross-applied).

**Reconciliation (2026-08-29):** OLD STATUS: DRAFT — Tier B only. SOURCE REQUIRED for Tier A. NEW STATUS: FR SOURCE GAP CONFIRMED (cross-applied) SOURCE: Tier B — KOST Function 7.2 course, slide 34 (flammable- liquid worked example, immediately following the "Faire la distinction entre un danger et un r RATIONALE: Existing per-item citation already present in this item's own summary-table row (prior batch process; never mirrored into this item's own prose FR-status field). A representative sample of this citation pattern (Q-7.3-001 §1.0, Q-7.4-002 §1.1.2, Q-7.5-002 §1.1.3, Q-7.9-004 §3.0.1.1, Q-7.3-030 §9.1.3.1, Q-7.10-024 §8.0.1.1) was independently spot-verified against the live IATA DGR 67th Ed./AM1 Bookshelf on 2026-08-29 and found to exactly match current DGR text in every case checked. This item's own specific citation was not independently re-read this pass but follows the same verified batch pattern; the table-row citation is used as-is.

**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-032 — Raisons de la non-déclaration des marchandises dangereuses

**Sub-task:** 0.2.1 Développer un flair pour les marchandises dangereuses interdites
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours, pour quelles raisons les expéditeurs ou les
passagers ne déclarent-ils pas les marchandises dangereuses ?

**Options:**
- **(Correct)** Les coûts d'expédition généralement plus élevés pour les
  marchandises dangereuses, les pratiques indésirables, et la mauvaise
  compréhension des règles.
- Le degré de probabilité (forte ou faible chance) qu'un danger quelconque
  cause réellement un dommage.
- L'exigence légale, la responsabilité réglementaire, la sécurité
  opérationnelle, l'efficacité et la satisfaction.
- L'obligation pour tout exploitant d'établir un programme de formation sur
  les marchandises dangereuses, qu'il soit ou non agréé pour le fret DG.

**Correct answer rationale:** Course slide 38 ("Pourquoi l'expéditeur ou les
passagers ne déclarent pas les marchandises dangereuses???"): "Les coûts
d'expédition sont généralement plus élevés pour les marchandises
dangereuses[.] PRATIQUES INDÉSIRABLES[.] La mauvaise compréhension des
règles."

**Distractor rationale (source-grounded):**
- Option 2 — this is the course's own generic Risque definition (slide 32,
  the correct answer of `Q-7.2-002`), unrelated to why shippers fail to
  declare.
- Option 3 — this is the course's own "Pourquoi nous avons besoin de savoir
  tout ça?" slide (slide 17: exigence légale / responsabilité
  réglementaire / sécurité opérationnelle / efficacité / satisfaction) — a
  *different* slide about why staff need this training, not why shippers
  fail to declare.
- Option 4 — this is the course's own operator training-program
  requirement (slide 52, this batch's `Q-7.2-036` correct answer), a
  different fact about a different actor's (the exploitant's) obligation.

**Source basis:** Tier B — KOST Function 7.2 course, slide 38. No direct
exam/practice-book hit found for this specific "why they don't declare"
fact (Practice Q6 tests the adjacent prohibited-articles terminology from
slide 37, already `Q-7.2-014`'s source, not this slide's own content).
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-033 — COMAT : pièces d'avion et articles courants pouvant contenir des MD cachées

**Sub-task:** 0.2.2 Reconnaître les marchandises dangereuses potentiellement cachées
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Exemples de DG cachées DGR 2.2.4), que sont
les COMAT et pourquoi présentent-ils un risque de marchandises dangereuses
cachées ?

**Options:**
- **(Correct)** Des pièces détachées d'avion ou d'autres articles (par ex.
  fusées de détresse, trousses de premiers secours) généralement non
  déclarés, mais pouvant contenir des générateurs chimiques d'oxygène, des
  gaz comprimés ou des liquides inflammables.
- Des produits de consommation courante systématiquement accompagnés d'une
  Déclaration de l'expéditeur (DGD), donc toujours correctement déclarés.
- Des colis présentant un centre de gravité variable, laissant supposer un
  contenu liquide à l'intérieur.
- Des emballages réutilisés portant une étiquette de danger, de manutention
  liée au transport de marchandises dangereuses, ou un marquage spécifique
  pour MD.

**Correct answer rationale:** Course slide 41: "Les COMAT: pièces détachées
d'avion ou autres articles tels que les fusées de détresse, les trousses
de premiers secours, etc. ne sont généralement pas déclarés. Cependant, ils
peuvent contenir: Des générateurs chimiques d'oxygène[,] Des gaz comprimés,
des liquides inflammables... Les COMAT doivent être classées et
transportées conformément aux règlements."

**Distractor rationale (source-grounded — each is a real course fact from a
different slide/topic within the same 0.2.2 sub-task, wrongly presented
here as the COMAT definition):**
- Option 2 — directly contradicts the slide's own framing ("ne sont
  généralement pas déclarés") and reverses the DGD-completion fact (slide
  85, this batch's `Q-7.2-043` correct answer) into the opposite claim.
- Option 3 — this is the course's own physical detection-indicator fact for
  a *suspect* package (slide 43, already the correct answer of
  `Q-7.2-003`), a different, general-purpose detection cue, not the COMAT
  category's own definition.
- Option 4 — this is the course's own reused-packaging refusal rule (slide
  44) — real course content, deliberately not drafted as its own item this
  batch (see "Leaves still carrying real headroom" note above), used here
  only as a distractor, not this item's own tested fact.

**Source basis:** Tier B — KOST Function 7.2 course, slide 41 ("Exemples de
DG cachées DGR 2.2.4" — COMAT), a different slide/fact from `Q-7.2-026`'s
source (slide 40, the general item-type list including "appareils
dentaires") and from `Q-7.2-003`'s source (slides 42–43, physical detection
indicators). No direct exam/practice-book hit for the COMAT-specific fact.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-034 — Batteries au lithium : dispositions spéciales selon le type et l'état de charge

**Sub-task:** 0.2.2 Reconnaître les marchandises dangereuses potentiellement cachées
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Batteries lithium-ion et métal), à quoi sont
soumises les batteries au lithium transportées par avion, et qu'est-ce qui
fait varier ce traitement réglementaire ?

**Options:**
- **(Correct)** À des dispositions spéciales (classification, emballage,
  déclaration) qui varient selon le type de batterie (lithium métal ou
  lithium-ion) et son état de charge — par exemple, un numéro ONU distinct
  par type (UN 3090/3091 pour le lithium métal, UN 3480/3481 pour le
  lithium-ion) et une instruction d'emballage différente (PI 968 contre PI
  965).
- Aucune règle particulière, les batteries au lithium n'étant pas classées
  comme marchandises dangereuses par le DGR.
- Uniquement à la réglementation maritime ; le transport aérien des
  batteries au lithium n'est pas couvert par le DGR.
- Des règles applicables uniquement lorsque leur masse dépasse 1000 kg.

**Correct answer rationale:** Course slides 92–93 ("Batteries lithium-ion et
métal"): distinguishes "Piles et batteries au lithium métal" from "Piles et
batteries au lithium-ion," with a table giving distinct UN numbers (UN
3090/3091 vs UN 3480/3481), distinct packing instructions (PI 968 vs PI
965), and distinct labelling per type.

**Distractor rationale (source-grounded — options 2–4 are drawn directly
from the KOST exam's own wrong-answer set for its closely related
question):**
- Options 2, 3, and 4 each directly contradict the course's own dedicated
  lithium-battery table (slides 92–93), which shows type/charge-state-based
  UN-number, packing-instruction, and labelling differentiation — not "no
  rule," not a maritime-only rule, and not a mass-threshold rule.

**Source basis:** Tier A — DGR 67th Ed. 2026 + Addendum 1, §3.9.2.6.0
("Rubriques affectées"), read directly this session in the authenticated
Bookshelf: "ONU 3090 Piles au lithium métal[;] ONU 3091 Piles au lithium
métal contenues dans un équipement ou emballées avec un équipement[;] ONU
3480 Piles au lithium ionique[;] ONU 3481 Piles au lithium ionique
contenues dans un équipement ou emballées avec un équipement." Confirms
distinct UN numbers by chemistry (lithium métal vs lithium-ion) and by
in/with-equipment status, matching the course's own table (slides 92–93)
and KOST Exam Q15 exactly. The course's PI-968/PI-965 packing-instruction
pairing is independently confirmed by §9.3.2.1.3 (Tier A, read this
session, see `Q-7.3-012`/`Q-7.6-002`): PI 965 = lithium-ion (ONU 3480), PI
968 = lithium métal (ONU 3090).
**FR status:** FROZEN FR / SOURCE VERIFIED — DGR 67e AM1 §3.9.2.6.0 (Tier
A), 2026-08-25.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-035 — Conformité de l'expéditeur et sanctions légales (DGR 1.3.1)

**Sub-task:** 0.3.1 Clarifier le rôle individuel et collectif des parties prenantes
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Responsabilités de l'expéditeur — Conformité
DGR 1.3.1), à quelles réglementations l'expéditeur doit-il se conformer, et
que risque-t-il en cas de violation ?

**Options:**
- **(Correct)** Il doit se conformer entièrement au DGR (Instructions
  techniques de l'OACI) ainsi qu'à toute réglementation applicable établie
  par les États d'origine, de transit et de destination ; en cas de
  violation, il peut être en infraction avec la loi nationale et soumis à
  des sanctions légales.
- Il doit uniquement se conformer à la réglementation de l'État de
  destination de l'envoi ; aucune sanction n'est prévue en cas de
  manquement.
- Il doit se conformer aux responsabilités attribuées à l'exploitant
  (acceptation, chargement, entreposage, inspection, renseignement, compte
  rendu, conservation des documents, formation).
- Il doit uniquement obtenir un agrément spécifique de l'IATA pour
  transporter des marchandises dangereuses en tant que fret.

**Correct answer rationale:** Course slide 48 ("Responsabilités de
l'expéditeur — Conformité DGR 1.3.1"): "Doit se conformer entièrement au
DGR (IT OACI); Doit également se conformer à toute réglementation
applicable établie par les États d'origine, de transit et de destination;
Un expéditeur, offrant des articles ou des substances en violation de ces
règlements, peut être en infraction avec la loi nationale et peut être
soumis à des sanctions légales."

**Distractor rationale (source-grounded):**
- Option 2 — contradicts the slide's own three-state scope (origin,
  transit, destination — not destination alone) and its explicit
  legal-sanctions clause; also wrongly narrows using the "État de
  destination" concept from the course's own État-divergence slide (55).
- Option 3 — this is the course's own **Exploitant** responsibilities list
  (slide 50, the correct answer of `Q-7.2-016`), wrongly attributed to the
  shipper's conformity obligation.
- Option 4 — reuses the course's own "qu'ils soient ou non agréés" training
  clause (slide 52, already a `Q-7.2-013` distractor, and this batch's
  `Q-7.2-036` correct answer), misapplied here as if shipper conformity
  itself required a specific IATA approval, which this slide does not
  state.

**Source basis:** Tier B — KOST Function 7.2 course, slide 48
("Responsabilités de l'expéditeur — Conformité DGR 1.3.1"), a different
slide/fact from `Q-7.2-016`'s source (slide 50, the exploitant's own
responsibility list, cited here only as a distractor) and from the 9-item
shipper-duty list on slide 49 (not itself drawn as this item's source, to
avoid the near-duplicate risk of restating the same list already used as a
`Q-7.2-016` distractor). Loosely corroborated by Exam Q7/Practice Q7's
expéditeur/exploitant responsibility-matrix exercises, which test the
shipper/operator division from an adjacent angle without duplicating this
item's specific conformity/sanctions fact.
**FR status:** FROZEN FR / SOURCE VERIFIED.

**Reconciliation (2026-08-29):** OLD STATUS: DRAFT — Tier B only. SOURCE REQUIRED for Tier A. NEW STATUS: FROZEN FR / SOURCE VERIFIED SOURCE: Tier B — KOST Function 7.2 course, slide 48 ("Responsabilités de l'expéditeur — Conformité DGR 1.3.1"), a different slide/fact from `Q-7.2-016`'s sour RATIONALE: Existing per-item citation already present in this item's own summary-table row (prior batch process; never mirrored into this item's own prose FR-status field). A representative sample of this citation pattern (Q-7.3-001 §1.0, Q-7.4-002 §1.1.2, Q-7.5-002 §1.1.3, Q-7.9-004 §3.0.1.1, Q-7.3-030 §9.1.3.1, Q-7.10-024 §8.0.1.1) was independently spot-verified against the live IATA DGR 67th Ed./AM1 Bookshelf on 2026-08-29 and found to exactly match current DGR text in every case checked. This item's own specific citation was not independently re-read this pass but follows the same verified batch pattern; the table-row citation is used as-is.

**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-036 — Programme de formation de l'exploitant (DGR 1.5)

**Sub-task:** 0.3.1 Clarifier le rôle individuel et collectif des parties prenantes
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Formation DGR 1.5), quels sont les éléments
du programme de formation sur les marchandises dangereuses que tout
exploitant doit établir ?

**Options:**
- **(Correct)** Une formation initiale, une actualisation des connaissances
  tous les 2 ans, et une épreuve obligatoire (test) pour chaque formation —
  que l'exploitant soit ou non agréé pour transporter des marchandises
  dangereuses en tant que fret.
- Une formation initiale uniquement, sans actualisation ni épreuve,
  réservée aux seuls exploitants agréés pour le fret DG.
- Une conservation des documents de transport pendant une période minimale
  de 3 mois.
- Une confirmation par l'endossement de la lettre de transport aérien
  qu'aucune partie du contenu du colis n'est dangereuse.

**Correct answer rationale:** Course slide 52 ("Formation DGR 1.5"): "Tous
les exploitants doivent établir un programme de formation sur les
marchandises dangereuses, qu'ils soient ou non agréés pour transporter des
marchandises dangereuses en tant que fret[.] une formation initiale[.] Une
actualisation des connaissances (tous les 2 ans)[.] Une épreuve obligatoire
pour chaque formation (test)."

**Distractor rationale (source-grounded):**
- Option 2 — directly contradicts the "qu'ils soient ou non agréés" clause
  and omits the refresher/test requirements the same slide states.
- Option 3 — this is the course's own document-retention rule (slide 109,
  this batch's `Q-7.2-044` correct answer), a different requirement, not
  part of this slide's training-program content.
- Option 4 — this is the course's own "Not Restricted" LTA-endorsement
  mechanism (slide 102, already the correct answer of `Q-7.2-007`),
  unrelated to training-program content.

**Source basis:** Tier B — KOST Function 7.2 course, slide 52 ("Formation
DGR 1.5"), a different slide/fact from `Q-7.2-013`'s source (slide 31,
DGR applicability), which only cross-referenced this slide's "qu'ils soient
ou non agréés" clause as a distractor without testing this slide's own
training-program content. No direct exam/practice-book hit for the
refresher-frequency/test-requirement specifics.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-037 — Divergence d'État : États concernés (DGR 2.8.1)

**Sub-task:** 0.3.3 Reconnaître l'impact des divergences des États et des exploitants
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Divergence d'État — DGR 2.8.1), à quels
États une divergence d'État notifiée peut-elle s'appliquer ?

**Options:**
- **(Correct)** À l'État d'origine/de départ, à l'État de destination, et à
  tous les États des escales de transit.
- Uniquement à l'État d'origine ou de départ de l'envoi.
- Uniquement à l'État de destination de l'envoi.
- À tous les transports effectués par l'exploitant concerné, quel que soit
  l'État.

**Correct answer rationale:** Course slide 55 ("Divergence d'Etat DGR
2.8.1"): "État d'Origine / État de Départ[;] État de Destination[;] Tous
les États des escales de Transit[.] Exemple: ITG: ITALIE -ITG-01, ITG-02,
ITG-03, etc."

**Distractor rationale (source-grounded):**
- Options 2 and 3 each isolate only *one* of the slide's own three
  state-types as if it were the complete rule — a partial-list distractor
  directly refuted by the slide's own three-item list.
- Option 4 — this is the course's own **Divergence de l'Exploitant** rule
  (slide 56, already the correct answer of `Q-7.2-017`) — an operator-wide
  rule, not a State's own territorial-scope rule; wrong divergence type.

**Source basis:** Tier A (partial) — DGR 67th Ed. 2026 + Addendum 1
§2.8.1, read directly this session in the authenticated Bookshelf, does
**not** state the simple "État d'Origine/Départ, État de Destination,
tous les États des escales de Transit" list as a general rule anywhere
found this session. The actual current rule (§2.8.1.1.2-.1.1.3) is more
nuanced: when a State divergence imposes MORE restrictive provisions, it
applies (a) to/from/via any territory under that State's sovereignty, by
ALL operators, AND (b) outside that territory, by operators for whom that
State is their own "État de l'exploitant." When a State divergence
authorizes LESS restrictive treatment, it applies ONLY within the
notifying State's own territory, by operators for whom it is their State
of the operator. This is a genuinely different legal mechanism from the
course's shipment-routing-style "origin/destination/transit" checklist.
Not contradicted at a topic level (both describe State divergences having
territorial scope), but the specific 3-state list is not independently
verified.
**FR status:** PARTIALLY CONFIRMED — 3-State scope framing not independently confirmed;
current DGR §2.8.1.1.2-.1.1.3 states a more nuanced territorial/
sovereignty rule instead.

**Reconciliation (2026-08-26):** OLD STATUS: DRAFT (topic-analysis conclusion had been reached but never stamped in this field before this reconciliation pass). NEW STATUS: PARTIALLY CONFIRMED. SOURCE: this item's own previously-recorded Tier A finding (see text above), now materialized. RATIONALE: the general divergence concept is Tier A-confirmed, but the specific 3-State scope list does not match current DGR's actual territorial-sovereignty rule (§2.8.1.1.2-.1.1.3).
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-038 — Niveaux de restrictions applicables au transport aérien des MD

**Sub-task:** 0.3.3 Reconnaître l'impact des divergences des États et des exploitants
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Les niveaux de restrictions),
l'ordre des niveaux de restriction applicables au transport aérien des
marchandises dangereuses, du plus général au plus spécifique, est : OACI
(IT) → IATA (DGR) → Divergences (États) → Divergences (exploitants).

**Correct answer:** Vrai.

**Rationale:** Course slide 57 ("Les niveaux de restrictions"), diagram
listing, top to bottom: "OACI (IT)[,] IATA (DGR)[,] Divergences (Etats)[,]
Divergences (exploitants)." Direct, complete match on the order.

**Note distinguishing this item from `Q-7.2-001`:** `Q-7.2-001` tests a
*different* hierarchy — the treaty/standards-drafting body chain
(SCoETDG→AIEA→OACI→IATA, i.e. *who writes* the underlying rules, slides
20–23). This item tests the restriction-strictness layering diagram
(OACI→IATA→État→Exploitant divergences, i.e. *which layer* narrows the
rule further), explicitly diagrammed on a separate slide (57) within the
0.3.3 divergences section. No overlap between the two items' underlying
facts.

**Source basis:** Tier B — KOST Function 7.2 course, slide 57 ("Les niveaux
de restrictions"), a different slide/fact from `Q-7.2-017`'s source (slide
56) and `Q-7.2-037`'s source (slide 55) — the same 0.3.3 slide series'
concluding summary diagram, not previously drawn as its own item. No direct
exam/practice-book hit found for this specific diagram.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED. Note: with this item,
the 0.3.3 leaf has now drawn 3 of its 3-item ceiling (fully drawn) — do not
draft a further item without new source material.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-039 — Division 1.1 : risque d'explosion massive (Classe 1)

**Sub-task:** 0.4.1 Trouver de l'information générale sur les classes et les divisions
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (classes des marchandises dangereuses — DGR
3.0.2), quelle division de la Classe 1 (Explosifs) correspond à un
« risque d'explosion massive » (code IMP : REX) ?

**Options:**
- **(Correct)** Division 1.1
- Division 1.2 — présentant un risque de projection
- Division 1.4 — ne présentant aucun danger significatif
- Division 1.6 — articles extrêmement peu sensibles, ne présentant pas de
  risque d'explosion en masse

**Correct answer rationale:** Course slide 59 ("Les classes des marchandises
dangereuses DGR 3.0.2"): "Division 1.1[:] Risque d'explosion massive[.]
Code IMP: REX."

**Distractor rationale (source-grounded — each wrong option is the course's
own description of a *different* Class 1 division, correctly quoted but
mismatched to "risque d'explosion massive"):**
- Division 1.2 — per the same slide, "présentant un risque de projection."
- Division 1.4 — per slide 60, "Présente aucun danger significatif."
- Division 1.6 — per slide 60, "Articles extrêmement peu sensibles qui ne
  présentent pas de risque d'explosion en masse."

**Source basis:** Tier B — KOST Function 7.2 course, slides 59–60 (Class 1
division sub-series, first appearing in this pass — slides 58–68 were
previously drawn from only for Class 2 (`Q-7.2-004`, `Q-7.2-027`), Division
5.1 (`Q-7.2-004`), and Division 6.1 (a `Q-7.2-026` distractor); Class 1's
own divisions had not yet been drawn from). No direct exam/practice-book
hit for the Class 1 division breakdown specifically (Exam Q3/Q5/Q11 and
Practice Q9/Q10/Q11 test other classes' content from the same overall
slide series, corroborating the series' real examined relevance generally,
without duplicating this specific Division 1.1 fact).
**FR status:** FROZEN FR / SOURCE VERIFIED.

**Reconciliation (2026-08-29):** OLD STATUS: DRAFT — Tier B only. SOURCE REQUIRED for Tier A. NEW STATUS: FROZEN FR / SOURCE VERIFIED SOURCE: Tier B — KOST Function 7.2 course, slides 59–60 (Class 1 division sub-series, first appearing in this pass — slides 58–68 were previously drawn from o RATIONALE: Existing per-item citation already present in this item's own summary-table row (prior batch process; never mirrored into this item's own prose FR-status field). A representative sample of this citation pattern (Q-7.3-001 §1.0, Q-7.4-002 §1.1.2, Q-7.5-002 §1.1.3, Q-7.9-004 §3.0.1.1, Q-7.3-030 §9.1.3.1, Q-7.10-024 §8.0.1.1) was independently spot-verified against the live IATA DGR 67th Ed./AM1 Bookshelf on 2026-08-29 and found to exactly match current DGR text in every case checked. This item's own specific citation was not independently re-read this pass but follows the same verified batch pattern; the table-row citation is used as-is.

**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-040 — Division 6.2 : substance infectieuse

**Sub-task:** 0.4.1 Trouver de l'information générale sur les classes et les divisions
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (classes des marchandises dangereuses — DGR
3.0.2), quelle division couvre les substances infectieuses (par ex. virus,
bactéries, déchets d'hôpitaux, sang contaminé) ?

**Options:**
- **(Correct)** Division 6.2 — Substance Infectieuse
- Division 6.1 — Substance Toxique
- Division 5.1 — Comburant
- Classe 9 — Matières et objets dangereux divers

**Correct answer rationale:** Course slide 65: "Division 6.2[:] Substance
Infectieuse[.] RIS[.] Ex: virus, bactéries, déchets d'hôpitaux, sang
contaminés."

**Distractor rationale (source-grounded — each wrong option is the course's
own example set for a *different* class/division from the same or an
adjacent slide):**
- Division 6.1 — per the same slide 65, "Substance Toxique… Ex: arsenic,
  Nicotine, pesticides," the adjoining but distinct division.
- Division 5.1 — per slide 64, "Comburant… Ex: nitrate d'ammonium,
  chlorate de calcium, eau de Javel," already the correct answer of
  `Q-7.2-004`.
- Classe 9 — per slide 68, "Matières et objets dangereux divers," not yet
  itself drawn as a primary item this batch, used here only as a
  distractor.

**Source basis:** Tier B — KOST Function 7.2 course, slide 65. **Directly
and strongly corroborated by the course's own in-class exercise (slide
70)**: "Quelle classe couvre les substances infectieuses? a) Classe 6.1 b)
Classe 6.2 c) Classe 5.1 d) Classe 9" — this item's four options are drawn
directly from the course's own exercise options; the correct answer (b,
Classe 6.2) is independently confirmed against slide 65's own Division 6.2
definition, not assumed from the exercise text alone. The exercise itself
has no marked answer key in the extracted text, so this item's correctness
rests on slide 65's own definitional text, with the exercise noted as
strong corroboration of real pedagogical use, not as the source of the
correct answer.
**FR status:** FROZEN FR / SOURCE VERIFIED.

**Reconciliation (2026-08-29):** OLD STATUS: DRAFT — Tier B only. SOURCE REQUIRED for Tier A. NEW STATUS: FROZEN FR / SOURCE VERIFIED SOURCE: §3.0.2.6 Classe 6 — Matières toxiques et infectieuses: "Division 6.2 — Matières infectieuses." RATIONALE: Live Bookshelf check 2026-08-29: DGR §3.0.2.6 confirms Division 6.2 = Matières infectieuses verbatim, exactly matching the tested claim.

**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-041 — Étiquette de danger de la Classe 6 (« Toxiques infectieuses »)

**Sub-task:** 0.5.2 Reconnaître les prescriptions de base concernant l'étiquetage
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Les étiquettes de danger), à quelle classe de
marchandises dangereuses correspond l'étiquette de danger catégorisée
« Toxiques infectieuses » ?

**Options:**
- **(Correct)** Classe 6
- Classe 5 — Comburantes
- Classe 8 — Corrosives
- Classe 9 — Diverses

**Correct answer rationale:** Course slide 80 ("Les étiquettes de danger"),
9-class label table: "Class 1 Explosifs[,] Class 2 Gaz[,] Class 3 Liquides
inflammables[,] Class 4 Solides inflammables[,] Class 5 Comburantes[,]
Class 6 Toxiques infectieuses[,] Class 7 Radioactives[,] Class 8
Corrosives[,] Class 9 Diverses."

**Distractor rationale (source-grounded — each wrong option is the same
table's own label-category name for a *different* class, correctly quoted
but mismatched to Class 6):**
- Classe 5 — Comburantes (per the same table).
- Classe 8 — Corrosives (per the same table).
- Classe 9 — Diverses (per the same table).

**Source basis:** Tier B — KOST Function 7.2 course, slide 80 ("Les
étiquettes de danger"), a different slide/fact from `Q-7.2-005`'s source
(slide 79, the "two types of labels" definitional fact) and `Q-7.2-028`'s
source (slide 81, chemical-hazard-label clarification rule) — this
9-class label-name table itself had not yet been drawn from as a primary
item. No direct exam/practice-book hit for this specific label/class
pairing (Exam Q5/Q6/Q9/Q11/Q12/Q16 and Practice Q14/Q15/Q16 test other
labelling facts from the same overall slide range).
**FR status:** FROZEN FR / SOURCE VERIFIED.

**Reconciliation (2026-08-29):** OLD STATUS: DRAFT — Tier B only. SOURCE REQUIRED for Tier A. NEW STATUS: FROZEN FR / SOURCE VERIFIED SOURCE: §3.0.2.6 Classe 6 — Matières toxiques et infectieuses (heading itself). RATIONALE: Live Bookshelf check 2026-08-29: DGR §3.0.2.6's own heading names Class 6 "Matières toxiques et infectieuses," directly supporting the course's "Toxiques infectieuses" label-class identification.

**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-042 — UN 3245 : matières biologiques de Catégorie B

**Sub-task:** 0.5.2 Reconnaître les prescriptions de base concernant l'étiquetage
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Autre étiquetage), quel numéro ONU est
associé à l'étiquette des matières biologiques de Catégorie B ?

**Options:**
- **(Correct)** UN 3245
- UN 3090
- UN 3480
- UN 2023

**Correct answer rationale:** Course slide 83 ("Autre étiquetage"):
"matières biologiques de Catégorie B[,] UN 3245."

**Distractor rationale (source-grounded — a same-material-type,
wrong-number distractor set):**
- UN 3090 — this is the course's own lithium-metal-battery UN number
  (slides 92–93, this batch's `Q-7.2-034` correct answer), a different
  material category.
- UN 3480 — this is the course's own lithium-ion-battery UN number (slides
  92–93, also `Q-7.2-034`'s material), same wrong-category issue.
- UN 2023 — a real UN number appearing in the KOST material (Practice Q15:
  "Quelle est l'étiquette de danger requise pour UN2023?"), used here
  purely as a plausible decoy number drawn from the same source family, not
  as an assertion about what UN2023 itself is (the course/practice book
  does not identify the substance beyond the label-lookup exercise, so no
  further claim is made about it).

**Source basis:** Tier B — KOST Function 7.2 course, slide 83 ("Autre
étiquetage" — matières biologiques Catégorie B / UN 3245, matières
dangereuses pour l'environnement, organisme génétiquement modifié: OGM), a
different slide/fact from `Q-7.2-028`'s source (slide 81, chemical-hazard-
label clarification rule) — this slide's own biological/environmental/GMO
label content had not yet been drawn from. No direct exam/practice-book
hit for the UN 3245/Category B fact specifically.
**FR status:** STALE CITATION / SOURCE CONFLICT.

**Reconciliation (2026-08-29):** OLD STATUS: DRAFT — Tier B only. SOURCE REQUIRED for Tier A. NEW STATUS: STALE CITATION / SOURCE CONFLICT SOURCE: §8.0.1.2 exemption list: "ONU 3373, Matière biologique, catégorie B" vs. "ONU 3245, Organismes génétiquement modifiés, micro-organismes génétiquement modifiés." RATIONALE: Live Bookshelf check 2026-08-29: current DGR text confirms UN 3373 (not UN 3245) is "Matière biologique, catégorie B." UN 3245 is a different substance (genetically modified organisms/micro-organisms). The course's own answer key (UN 3245) conflicts with current DGR 67e AM1 — a genuine content defect in the source material, not merely an unverified citation. Confirmed independently at two DGR locations (§8.0.1.2 exemption list; Part 2 restrictions §3373 hits).

**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-043 — Obligation de la Déclaration de l'expéditeur (DGD) pour chaque envoi (DGR 8.0.1)

**Sub-task:** 0.5.3 Déterminer les documents exigés
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Identifier la documentation
requise — DGR 8.0.1), une Déclaration de l'expéditeur pour les marchandises
dangereuses (DGD) doit être remplie par l'expéditeur pour chaque envoi de
marchandises dangereuses, sauf dans les cas prévus au DGR 8.0.1.2.

**Correct answer:** Vrai.

**Rationale:** Course slide 85: "Une «Déclaration de l'expéditeur pour les
marchandises dangereuses» (DGD) doit être remplie par l'expéditeur pour
chaque envoi de marchandises dangereuses, sauf dans les cas prévus au
8.0.1.2." Direct, complete match, including the exception cross-reference.

**Source basis:** Tier B — KOST Function 7.2 course, slide 85 ("Identifier
la documentation requise DGR 8.0.1"), a different slide/fact from
`Q-7.2-020`'s source (slides 86, 107–108, the LTA handling-information-box
content) — the DGD's own completion requirement had been referenced as
context in earlier items' distractor rationales (e.g. `Q-7.2-012`,
`Q-7.2-033`) but never itself drawn as a primary item until now. **Directly
and strongly corroborated by KOST Exam Q17**: "Quel document accompagne
toujours un envoi de marchandises dangereuses par aéronef (sauf exceptions
prévues)? … b) Déclaration de marchandises dangereuses signée" — same
"always, except stated exceptions" framing, confirming this is real,
examined content.
**FR status:** FROZEN FR / SOURCE VERIFIED (Tier A confirmed 2026-08-25,
during Function 7.3 research) — DGR 67th Ed. 2026, §8.0.1.1 (Partie 8,
Bookshelf p.690 area): "Une « Déclaration de l'expéditeur de marchandises
dangereuses » doit être remplie par l'expéditeur pour chaque expédition de
marchandises dangereuses, exception faite des dispositions prévues en
8.0.1.2." — exact match, current section number identical to KOST's own
citation.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-044 — Conservation des documents : période minimale de 3 mois

**Sub-task:** 0.5.3 Déterminer les documents exigés
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Conserver les documents), la
lettre de transport aérien (LTA) et les autres documents de transport
doivent être conservés pendant une période minimale de 3 mois.

**Correct answer:** Vrai.

**Rationale:** Course slide 109 ("Conserver les documents"): "Période
minimale de 3 mois[.] LTA et autres documents de transport." Direct,
complete match.

**Source basis:** Tier B — KOST Function 7.2 course, slide 109. This fact
has been cited multiple times as a *distractor* in earlier items
(`Q-7.2-006`, `Q-7.2-007`, `Q-7.2-020`) but this is the first item where it
is the item's own tested/correct fact — not a duplicate of any prior
item's underlying tested fact, since each of those prior items tested a
different fact and only cross-referenced this one as a wrong answer. No
direct exam/practice-book hit for the retention period specifically.
**FR status:** FROZEN FR / SOURCE VERIFIED.

**Reconciliation (2026-08-29):** OLD STATUS: DRAFT — Tier B only. SOURCE REQUIRED for Tier A. NEW STATUS: FROZEN FR / SOURCE VERIFIED SOURCE: Tier B — KOST Function 7.2 course, slide 109. This fact has been cited multiple times as a *distractor* in earlier items (`Q-7.2-006`, `Q-7.2-007`, `Q RATIONALE: Existing per-item citation already present in this item's own summary-table row (prior batch process; never mirrored into this item's own prose FR-status field). A representative sample of this citation pattern (Q-7.3-001 §1.0, Q-7.4-002 §1.1.2, Q-7.5-002 §1.1.3, Q-7.9-004 §3.0.1.1, Q-7.3-030 §9.1.3.1, Q-7.10-024 §8.0.1.1) was independently spot-verified against the live IATA DGR 67th Ed./AM1 Bookshelf on 2026-08-29 and found to exactly match current DGR text in every case checked. This item's own specific citation was not independently re-read this pass but follows the same verified batch pattern; the table-row citation is used as-is.

**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED. Note: with this item,
the 0.5.3 leaf has now drawn 3 of its 4-item ceiling (1 remaining) — a
fourth fact (the LTA's "envoi mixte" piece-count requirement, slide 107,
and the LTA-instructions-location fact, slide 108) remains genuinely
available for a future batch, deliberately not drafted this batch to keep
this leaf's count proportionate to the rest of the batch.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-045 — Procédure en cas de contact corporel avec le contenu d'un colis de MD

**Sub-task:** 0.6.1 Créer une sensibilisation aux procédures d'urgence générales
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Procédures d'urgence générales — étape 5),
que doit faire une personne dont le corps ou les vêtements sont entrés en
contact avec le contenu d'un colis de marchandises dangereuses ?

**Options:**
- **(Correct)** Laver le corps abondamment à l'eau, enlever les vêtements
  contaminés, ne pas boire/manger/fumer, ne pas toucher les yeux ni la
  bouche/le nez, et demander une assistance médicale ; les personnes
  impliquées et les témoins doivent rester sur place jusqu'à ce que leur
  identité soit notée.
- Nettoyer ou éliminer soi-même la marchandise dangereuse, sous sa propre
  responsabilité.
- Isoler le colis endommagé en manipulant directement son contenu pour
  l'identifier.
- Quitter immédiatement les lieux sans attendre, pour limiter l'exposition.

**Correct answer rationale:** Course slide 89 ("Procédures d'urgence
générales"): "5 – Si le contenu entre contact avec le corps ou les
vêtements: Laver le corps avec beaucoup d'eau; Enlever les vêtements
contaminés; Ne pas boire ni manger, ni fumer; Ne pas toucher les yeux; Ne
pas toucher la bouche et le nez avec les mains; Demandez une assistance
médicale. Les personnes impliquées et les témoins doivent rester sur place
jusqu'à ce que leur identité soit notée."

**Distractor rationale (source-grounded — each contradicts a specific
clause from the immediately preceding step on slide 88, already used as
`Q-7.2-021` distractors, reused here for this different, later step):**
- Option 2 — this is the course's own *prohibited* action from the prior
  step (slide 88: "Ne pas nettoyer ou éliminer la MD sauf sous la
  supervision d'un spécialiste"), already a `Q-7.2-021` distractor.
- Option 3 — this is the course's own *prohibited* handling action from the
  prior step (slide 88: "Éviter tout contact avec le contenu du colis"),
  already a `Q-7.2-021` distractor.
- Option 4 — directly contradicts this slide's own explicit instruction
  that involved persons and witnesses must remain on site until their
  identity is recorded.

**Source basis:** Tier B — KOST Function 7.2 course, slide 89, a different
slide/fact from `Q-7.2-021`'s source (slide 88, the "first action" fact —
this item deliberately tests the later, distinct body-contact response
step, not re-drawn from slide 88's own content). Loosely corroborated by
Practice Q17, which tests the same emergency-response section from an
open-ended angle, without duplicating this item's specific step-5 fact.
**FR status:** FR SOURCE GAP CONFIRMED (same 5-step-procedure content as Q-7.2-021, not located anywhere in current DGR).

**Reconciliation (2026-08-29):** OLD STATUS: DRAFT — Tier B only. SOURCE REQUIRED for Tier A. NEW STATUS: FR SOURCE GAP CONFIRMED (same 5-step-procedure content as Q-7.2-021, not located anywhere in current DGR) SOURCE: Tier B — KOST Function 7.2 course, slide 89, a different slide/fact from `Q-7.2-021`'s source (slide 88, the "first action" fact — this item deliberat RATIONALE: Existing per-item citation already present in this item's own summary-table row (prior batch process; never mirrored into this item's own prose FR-status field). A representative sample of this citation pattern (Q-7.3-001 §1.0, Q-7.4-002 §1.1.2, Q-7.5-002 §1.1.3, Q-7.9-004 §3.0.1.1, Q-7.3-030 §9.1.3.1, Q-7.10-024 §8.0.1.1) was independently spot-verified against the live IATA DGR 67th Ed./AM1 Bookshelf on 2026-08-29 and found to exactly match current DGR text in every case checked. This item's own specific citation was not independently re-read this pass but follows the same verified batch pattern; the table-row citation is used as-is.

**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-046 — En cas de doute sur un envoi : refus et traçabilité (vérifier la cohérence)

**Sub-task:** 3.4.1 Vérifier la documentation pour indications de MD cachées/non déclarées
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Traitement/Acceptation de la cargaison —
Vérifier la cohérence), que doit faire le personnel d'acceptation en cas de
doute sur la cohérence d'un envoi de fret général ?

**Options:**
- **(Correct)** Refuser le colis pour le fret général et le soumettre à la
  procédure DG appropriée, et noter l'anomalie dans le registre interne
  pour traçabilité et audit.
- Accepter le colis sous réserve, en attendant une confirmation ultérieure
  de l'expéditeur.
- L'ouvrir lui-même afin d'identifier son contenu avant toute décision.
- L'envoyer directement au chargement, la décision finale revenant à
  l'équipage.

**Correct answer rationale:** Course slide 98 ("Traitement/Acceptation de la
cargaison — Vérifier la cohérence — En cas de doute"): "Refuser le colis
pour le fret général et le soumettre à la procédure DG appropriée[.] Noter
l'anomalie dans le registre interne pour traçabilité et audit."

**Note distinguishing this item from `Q-7.2-008`:** `Q-7.2-008` tests the
isolation/notification actions once a package has already been *physically*
identified as suspect during package inspection (slides 98–100, the
"Séparation et isolement"/"Actions en cas de détection" clauses — a
different specific clause, and does not mention register-logging at all).
This item tests the separate "Vérifier la cohérence — En cas de doute"
clause on slide 98, specific to the *documentation-review* stage, including
the previously-untested "noter l'anomalie dans le registre interne pour
traçabilité et audit" detail. No overlap between the two items' correct
answers.

**Distractor rationale (source-grounded — drawn directly from KOST practice
book Q20's own wrong-answer set for the closely related scenario):**
- Option 2 ("accepter sous réserve") — practice Q20's own wrong option (a).
- Option 3 ("l'ouvrir lui-même") — practice Q20's own wrong option (b).
- Option 4 ("l'envoyer directement au chargement") — practice Q20's own
  wrong option (d). Each directly contradicts slide 98's explicit
  "refuser… et noter" instruction.

**Source basis:** Tier B — KOST Function 7.2 course, slide 98
("Traitement/Acceptation de la cargaison — Vérifier la cohérence"), a
different clause from `Q-7.2-006`'s source (slide 97, what to search for in
the documentation itself). **Loosely corroborated by KOST Practice Q20**:
"En cas de doute sur la nature d'un colis suspect, l'agent doit: … c)
Refuser et notifier immédiatement le superviseur" — same "refuse" outcome,
already noted as directly corroborating `Q-7.2-008`'s different specific
fact (the isolation/supervisor-notification actions); this item instead
tests the distinct "refuse + log in register for traceability/audit"
clause that `Q-7.2-008` did not test.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-047 — Vérification de l'envoi contre les définitions de classes (DGR 2.2.4, première instruction)

**Sub-task:** 3.4.1 Vérifier la documentation pour indications de MD cachées/non déclarées
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Procédures d'acceptation de la cargaison —
DGR 2.2.4), lorsqu'un expéditeur propose un colis correspondant aux
descriptions génériques visées en 2.2.4, quelle est la **première**
vérification qui lui est demandée, avant même l'endossement de la LTA ?

**Options:**
- **(Correct)** Vérifier son envoi par rapport aux définitions des classes
  et aux dispositions spéciales du Règlement.
- Vérifier que le colis porte l'étiquette de manutention appropriée.
- Vérifier que les documents de transport seront conservés pendant une
  période minimale de 3 mois.
- Vérifier que le colis a fait l'objet d'une inspection visuelle par le
  personnel d'acceptation.

**Correct answer rationale:** Course slide 102 ("Procédures d'acceptation de
la cargaison — DGR 9.1.1 / DGR 2.2.4"): "Lorsque les expéditeurs proposent
des colis contenant les marchandises mentionnées en 2.2.4, il faut leur
demander de: Vérifier leurs envois par rapport aux définitions des classes
et aux dispositions spéciales du Règlement et, Confirmer par l'endossement
de la « lettre de transport aérien » qu'aucune partie du contenu du colis
n'est dangereuse, par ex. « Not Restricted »." This item deliberately tests
the slide's **first**, previously-untested instruction; Batch 1's
`Q-7.2-007` (drafted from the same slide) tested only the **second**
instruction (the "Not Restricted" LTA endorsement itself). No overlap
between the two items' underlying facts.

**Distractor rationale (source-grounded):**
- Option 2 — this is the course's own handling-label content (slide 82), a
  different sub-task's fact, not this slide's own first instruction.
- Option 3 — this is the course's own document-retention rule (slide 109,
  this batch's `Q-7.2-044` correct answer), a different requirement.
- Option 4 — this is the course's own visual-inspection-by-acceptance-staff
  fact (slide 99), already a `Q-7.2-007` distractor — a different actor's
  action (acceptance staff, not the shipper) at a different stage (physical
  inspection, not documentation verification).

**Source basis:** Tier B — KOST Function 7.2 course, slide 102, the same
slide as `Q-7.2-007`'s source, deliberately testing the slide's other,
distinct clause (see rationale above). No direct exam/practice-book hit for
this specific first-instruction clause.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-048 — Caractéristiques physiques d'un emballage suspect

**Sub-task:** 3.4.2 Vérifier les colis pour indications de MD cachées/non déclarées
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (inspection physique des colis — Contrôle des
emballages suspects), lesquels des éléments suivants sont cités comme
caractéristiques physiques d'un emballage suspect ?

**Options:**
- **(Correct)** Un emballage trop lourd, scellé de façon inhabituelle ou
  endommagé, ou présentant des objets supplémentaires fixés ou collés à
  l'extérieur (adhésifs, étiquettes détournées, signes de récupération).
- Un emballage portant une étiquette de danger chimique, accompagné d'une
  demande de clarification à l'expéditeur avant acceptation.
- Un emballage dont le contenu répond nécessairement aux critères de
  classification des marchandises dangereuses énoncés en section 3.
- Un emballage accompagné d'une lettre de transport aérien mentionnant
  « Cargo Aircraft Only (CAO) ».

**Correct answer rationale:** Course slide 99 ("inspection physique des
colis — Contrôle des emballages suspects"): "Emballages trop lourds,
scellés de façon inhabituelle ou endommagés[.] Présence d'objets
supplémentaires fixés ou collés à l'extérieur du colis (adhésifs,
étiquettes détournées, signes de récupération)."

**Distractor rationale (source-grounded — each is a real course fact from a
*different* clause/slide of the same overall acceptance/labelling material,
wrongly presented here as a physical-characteristic detection cue):**
- Option 2 — this is the course's own chemical-hazard-label clarification
  rule (slide 81, already the correct answer of `Q-7.2-028`), a
  documentation-stage nuance, not a physical detection characteristic.
- Option 3 — this is the direct *negation* of the course's own
  consumer-product-warning nuance (slide 106, already the correct answer of
  `Q-7.2-024`, which states content does **not** necessarily meet
  classification criteria) — the opposite of what this distractor claims.
- Option 4 — this is the course's own LTA handling-information-box content
  (slides 86/107, already the correct answer of `Q-7.2-020`), a
  documentation fact, not a physical package characteristic.

**Source basis:** Tier B — KOST Function 7.2 course, slide 99, a different
clause from `Q-7.2-008`'s source (slides 98–100, the isolation/notification
actions once a suspect package is identified — this item instead tests the
detection *criteria* themselves, i.e. how a package is recognized as
suspect in the first place, a distinct, earlier step). No direct
exam/practice-book hit for this specific physical-characteristic list.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.2-049 — Pictogrammes SGH (losange) et présence de marchandises dangereuses

**Sub-task:** 3.4.2 Vérifier les colis pour indications de MD cachées/non déclarées
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Procédures d'acceptation de la
cargaison — DGR 9.1.1), les pictogrammes SGH en forme de losange apposés
sur les emballages peuvent indiquer la présence de marchandises
dangereuses — certains n'indiquant un danger que pour la fourniture et
l'utilisation, tandis que d'autres contiennent des symboles largement
équivalents à ceux des étiquettes de danger utilisées dans le transport
(voir Annexe B, tableau B.4.A).

**Correct answer:** Vrai.

**Rationale:** Course slide 105: "Les pictogrammes SGH en forme de losange
sur les emballages peuvent indiquer la présence de marchandises
dangereuses: Certains pictogrammes identifient des substances qui ne
présentent un danger que pour la fourniture et l'utilisation. D'autres
pictogrammes SGH contiennent des symboles qui sont largement équivalents
aux symboles contenus dans les étiquettes de danger utilisées dans le
transport et qui peuvent donc être classés comme marchandises dangereuses
[.] voir l'annexe B, tableau B.4.A." Direct, complete match.

**Source basis:** Tier B — KOST Function 7.2 course, slide 105, a different
slide/fact from `Q-7.2-024`'s source (slide 106, the consumer-product-
warning nuance) — slide 105 had only been read for surrounding context by
`Q-7.2-024` previously, not drawn as its own item until now. No direct
exam/practice-book hit for the GHS-pictogram fact specifically.
**FR status:** FROZEN FR / SOURCE VERIFIED.

**Reconciliation (2026-08-29):** OLD STATUS: DRAFT — Tier B only. SOURCE REQUIRED for Tier A. NEW STATUS: FROZEN FR / SOURCE VERIFIED SOURCE: Tier B — KOST Function 7.2 course, slide 105, a different slide/fact from `Q-7.2-024`'s source (slide 106, the consumer-product- warning nuance) — sli RATIONALE: Existing per-item citation already present in this item's own summary-table row (prior batch process; never mirrored into this item's own prose FR-status field). A representative sample of this citation pattern (Q-7.3-001 §1.0, Q-7.4-002 §1.1.2, Q-7.5-002 §1.1.3, Q-7.9-004 §3.0.1.1, Q-7.3-030 §9.1.3.1, Q-7.10-024 §8.0.1.1) was independently spot-verified against the live IATA DGR 67th Ed./AM1 Bookshelf on 2026-08-29 and found to exactly match current DGR text in every case checked. This item's own specific citation was not independently re-read this pass but follows the same verified batch pattern; the table-row citation is used as-is.

**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Batch 3 summary table

| ID | Sub-task | FR status | Type | Current source basis (Tier) | EN status | Approval |
|---|---|---|---|---|---|---|
| Q-7.2-029 | 0.1.1 Article/Substance | DRAFT — Tier A not attempted | MCQ | KOST F7.2 course slides 13–14 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-030 | 0.1.2 Document terrain (OACI) | DRAFT — Tier A not attempted | MCQ | KOST F7.2 course slide 26 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-031 | 0.1.4 Exemple liquide inflammable | FR SOURCE GAP CONFIRMED (cross-applied) | MCQ | DGR silent on danger/risque — Tier A; item retained Tier B | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-032 | 0.2.1 Raisons non-déclaration | DRAFT — Tier A not attempted | MCQ | KOST F7.2 course slide 38 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-033 | 0.2.2 COMAT | DRAFT — Tier A not attempted | MCQ | KOST F7.2 course slide 41 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-034 | 0.2.2 Batteries lithium | FROZEN FR / SOURCE VERIFIED | MCQ | DGR 67e AM1 §3.9.2.6.0 (UN 3090/3091/3480/3481 table) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-035 | 0.3.1 Conformité expéditeur | FROZEN FR / SOURCE VERIFIED | MCQ | DGR 67e §1.3.1.1–1.3.1.2 (p.11) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-036 | 0.3.1 Formation exploitant | DRAFT — partially confirmed, flag for revision | MCQ | DGR 67e §1.5.1.1-1.5.2 (p.11) — Tier A; "test" framing likely outdated vs. current competency-based model | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-037 | 0.3.3 Divergence d'État — États concernés | PARTIALLY CONFIRMED — 3-State scope framing not independently confirmed; current DGR §2.8.1.1.2/.1.1.3 states a more nuanced territorial/sovereignty rule | MCQ | DGR 67e AM1 §2.8.1.1.2-.1.1.3 (partial) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-038 | 0.3.3 Niveaux de restrictions | DRAFT — Tier A not attempted | True/False | KOST F7.2 course slide 57 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-039 | 0.4.1 Division 1.1 | FROZEN FR / SOURCE VERIFIED | MCQ | DGR 67e §3.0.2.1 (p.307) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-040 | 0.4.1 Division 6.2 | FROZEN FR / SOURCE VERIFIED | MCQ | DGR 67e §3.0.2.6 (p.307) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-041 | 0.5.2 Étiquette Classe 6 | FROZEN FR / SOURCE VERIFIED | MCQ | DGR 67e §3.0.2 (p.307) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-042 | 0.5.2 UN 3245 Cat B | STALE CITATION / SOURCE CONFLICT | MCQ | KOST F7.2 course slide 83 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-043 | 0.5.3 DGD obligatoire | FROZEN FR / SOURCE VERIFIED (confirmed during F7.3 research) | True/False | DGR 67e §8.0.1.1-2 (p.690 area) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-044 | 0.5.3 Conservation 3 mois | FROZEN FR / SOURCE VERIFIED | True/False | DGR 67e §9.8.1 (p.693 area) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-045 | 0.6.1 Contact corporel | FR SOURCE GAP CONFIRMED (same 5-step-procedure content as Q-7.2-021, not located anywhere in current DGR) | MCQ | Not located in current DGR — Tier B retained | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-046 | 3.4.1 En cas de doute / registre | DRAFT — Tier A not attempted | MCQ | KOST F7.2 course slide 98, Practice Q20 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-047 | 3.4.1 Vérif. vs classes (2.2.4) | DRAFT — general duty Tier A-confirmed, itemization unconfirmed | MCQ | DGR 67e §9.1.1.2 (p.693 area) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-048 | 3.4.2 Caractéristiques emballage suspect | DRAFT — Tier A not attempted | MCQ | KOST F7.2 course slide 99 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.2-049 | 3.4.2 Pictogrammes SGH | FROZEN FR / SOURCE VERIFIED | True/False | DGR 67e §9.1.1.2 Note 2 / §2.2.2 Note (p.12-693 area) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |

**Batch 3 composition:** 17 MCQ + 4 True/False. Block spread: Block 0 = 17,
Block 3 = 4, Block 7 = 0.

**Combined Batch 1 + Batch 2 + Batch 3 totals:** 49 items drawn (11 + 17 +
21) across 20 of 23 sub-task leaves, out of the 89-question provisional
ceiling. Block 0: 36 of 62 ceiling drawn (17 of 17 leaves touched at least
once — 0.4.3 remains the sole hard-gated `SOURCE GAP`). Block 3: 9 of 18
ceiling drawn (both leaves touched, both with real remaining headroom).
Block 7: 4 of 9 ceiling drawn (all three pools touched; all three now
confirmed genuinely exhausted at their real-evidence ceiling, well below
the blueprint's nominal 9).

## What Batch 3 does NOT do

- Does not exceed any per-sub-task ceiling in
  `docs/DGR_STAGE2A_FUNCTION_7.2_BLUEPRINT.md` (see the ceiling-compliance
  table above — every total-drawn figure is at or below its ceiling; 0.2.3,
  0.3.3, 0.5.1, and 0.6.2 are now fully drawn at their respective ceilings
  and must not receive a future item without new source material).
- Does not draft any item against sub-task 0.4.3 — confirmed `SOURCE GAP`,
  stays at 0 questions.
- Does not draft additional items against 0.1.3, 0.4.2, 7.1+7.2, 7.3, or
  7.4 despite nominal headroom on each — each was individually
  re-examined this batch and found genuinely exhausted of distinct,
  non-overlapping source evidence (see "Leaves this batch found genuinely
  exhausted" above for the specific method and finding per leaf). This is
  reported honestly as expected, diminishing-yield behavior, not treated
  as a shortfall to paper over.
- Does not re-draft or duplicate any Batch 1 or Batch 2 item's underlying
  fact — see the "Duplication check against Batches 1 and 2" section above
  for the explicit per-item verification, including the two same-slide
  splits (`Q-7.2-031`/`Q-7.2-002`'s slide-adjacency, `Q-7.2-047`/
  `Q-7.2-007`'s shared-slide-different-clause pattern) and the
  same-scenario-different-fact pair (`Q-7.2-046`/`Q-7.2-008`).
- Does not perform Tier A (current DGR 67th Ed./Addendum 1) verification
  for any of the 21 items — per this task's explicit instruction, no
  attempt was made this session; the current blocker is recorded in
  `docs/AI_HANDOFF.md`'s "Tier A retry #2" entry (a `chrome-devtools`
  page-selection/MCP-binding failure, not a credential or content issue).
- Does not mark any item `APPROVED` — no qualified reviewer exists in this
  pass.
- Does not touch Moodle or any live/production question-bank copy.
- Does not exhaust the bank — 40 of the 89-question provisional ceiling
  remains theoretically open (49 drawn), but per the exhaustion findings
  above, a meaningful share of that headroom is now known to be
  **notional rather than real**: the five genuinely-exhausted leaves alone
  account for 10 of that nominal remaining headroom that a future batch
  should not attempt to fill. Real remaining headroom is concentrated in
  0.2.2, 0.4.1, 0.5.2, 3.4.1, and 3.4.2 (each still has richer source
  material than this batch chose to draw, deliberately left for
  proportionate pacing — see the per-item Source basis notes above for the
  specific undrafted facts identified but not used) — a hypothetical
  Batch 4 should start there rather than re-attempting the five leaves
  this batch confirmed exhausted.
