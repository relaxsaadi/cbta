# DGR Stage 2B — Function 7.5 Production Bank (Batch 1)

**Function 7.5**: *Personnel chargé d'accepter les bagages des passagers et
des membres d'équipage, de gérer les zones d'embarquement des aéronefs et
d'effectuer d'autres tâches impliquant un contact direct avec les passagers
dans un aéroport.*

First production batch drafted against
`docs/DGR_STAGE2A_FUNCTION_7.5_BLUEPRINT.md` (PROVISIONAL/CEILING,
67-question maximum across 25 sub-tasks: Block 0 = 45, Block 5 = 16,
Block 7 = 6). Function 7.5 has no prior pilot, so numbering starts at
`Q-7.5-001`, following the exact ID convention already used for
`Q-7.2-XXX`, `Q-7.3-XXX`, and `Q-7.4-XXX`.

## Status of this batch — read before using any item below

**All 16 items in this batch are `DRAFT`, Tier B basis only. None has been
Tier A-verified against the current IATA DGR 67th Edition (2026, French,
Addendum 1) text.**

- Per `.claude/rules/dgr-stage2b.md` and the readiness reporting already on
  record for Functions 7.1/7.2/7.3/7.4, the IATA Digital Publications
  Bookshelf session remains **blocked** — it requires the owner to manually
  re-authenticate with 2FA. Per standing instruction, no attempt was made to
  log in, and **no Tier A content was fabricated to compensate.** This entire
  batch is therefore Tier B only, exactly like Functions 7.1's, 7.2's,
  7.3's, and 7.4's Batch 1s — expected and correct, not a gap introduced by
  this pass.
- Every item below is sourced directly and verbatim-traced to the actual
  **KOST Function 7.5 training material** (Tier B), read this session
  (extracted with `pdftotext -layout`, page-split so every quote is tied to
  an exact printed slide number, cross-checked against each page's own
  footer number) from
  `/Users/mac/Documents/Fichiers/Algerie/CBTA final/yasmine cbta/wetransfer_supports-pedagogiques-dgr-cbta-kost-academy_2025-10-12_1842/COURS DGR-CBTA-IATA/DGR-FONCTION 7.5/`:
  - `03_KOST_DGR_CBTA_Course_Function_7.5_FR_2025.pdf` — course, **106 slides**
    (confirmed via `pdfinfo`), formatrice Yasmina Boufas, dated 02/09/2025.
    Primary source, cited below by printed slide number. The shortest course
    examined in this program so far.
  - `01_KOST_DGR_CBTA_Exam_Function_7.5_FR_Rev00_2025.pdf` (F-KOST 05, 20Q,
    60 min, 80% pass mark) — corroborating cross-reference, read in full
    this session; used as the **primary** evidentiary anchor for one item
    (Q-7.5-013) where the course's own slide text does not spell out the
    exact figures the exam does — flagged explicitly at that item, per the
    task's own permitted citation forms ("course slide page number, exam
    question number, or practice-book question number").
  - `04_KOST_DGR_CBTA_Practice_Book_Function_7.5_FR_2025.pdf` (F-KOST 09,
    25Q) — **confirmed genuinely filed for Function 7.5** by Stage 1's and
    the cross-validation pass's MD5 check (unique hash, matching none of
    Functions 7.1–7.4's practice-book MD5s) — corroborating cross-reference,
    read in full this session, never copied verbatim as a question stem.
  - `02_IATA_DGR_Table_2.3A_Passengers_Crew_FR_2023.pdf` — used once, only
    to confirm the meaning of the acronym "AEP" (Appareils Électroniques
    Portables) referenced by the course's own p.41 note — not used as an
    independent evidentiary source beyond that confirmation.
- Every "DGR x.y.z" section number cited below is **as displayed on the
  KOST slide itself** — Tier B, not independently re-verified against the
  current 67th Edition/Addendum 1 text in this pass. The course is
  explicitly built on the **66th Edition** (its own "Structure du DGR de
  l'IATA" slide, p.25, reads "66ème édition"), confirmed by the standalone
  66th Edition Addendum document sitting in this function's own source
  folder. Do not treat any section number or figure below (e.g. the 0.3g
  lithium metal/2.7 Wh installed-battery threshold, the 15-AEP/20-battery
  operator-approval figures, the 2.5 kg dry-ice baggage-marking threshold)
  as confirmed-current.
- Per `.claude/rules/dgr-stage2b.md` rule 4, **no item in this batch may be
  marked `APPROVED`.** Status is `DRAFT` only.
- **The four confirmed SOURCE GAP leaves (0.3.2, 0.5.3, 0.6.2, 5.2.3) are
  hard-gated to 0 and no item was drafted against any of them.** No new
  evidence was found this session to change that status.
- Next session should re-attempt the Bookshelf technique once the owner has
  re-authenticated, to move these 16 items from `DRAFT` toward
  `FR SOURCE VERIFIED` / `FR SOURCE GAP CONFIRMED`.

## Sub-task selection and ceiling compliance

This batch drafts **16 items**, at the top of the task's 12–16 target range
and well below the 67-question provisional ceiling — per the task's own
instruction and the blueprint's own framing ("a ceiling to draft *up to*,
not a quota that must be filled"). Selection follows the blueprint's own
"richest, best-evidenced leaves first" logic: the three leaves with the
richest cross-reference counts in each active block (0.2.3/0.2.1 in Block 0,
5.2.2 in Block 5) are drawn at their full sample ceiling (2 items each),
while every other leaf drawn is taken at 1 item, at or below its own sample.

| Sub-task | Title | Blueprint ceiling / sample | Drawn this batch | New item |
|---|---|---|---|---|
| 0.1.1 | Comprendre la définition | 4 / 1 | 1 | Q-7.5-001 |
| 0.1.2 | Reconnaître le cadre juridique | 4 / 1 | 1 | Q-7.5-002 |
| 0.2.1 | Développer un flair pour les MD cachées | 5 / 2 | 2 | Q-7.5-003, Q-7.5-004 |
| 0.2.3 | Être au courant des dispositions s'appliquant aux passagers | 6 / 2 | 2 | Q-7.5-005, Q-7.5-006 |
| 0.3.3 | Reconnaître l'impact des divergences des États et des exploitants | 3 / 1 | 1 | Q-7.5-009 |
| 0.5.2 | Reconnaître les prescriptions de base concernant l'étiquetage | 4 / 1 | 1 | Q-7.5-007 |
| 0.6.1 | Créer une sensibilisation aux procédures d'urgence générales | 4 / 1 | 1 | Q-7.5-008 |
| 5.1.1 | Identifier les marchandises dangereuses interdites | 4 / 1 | 1 | Q-7.5-010 |
| 5.1.2 | Appliquer les prescriptions d'approbation | 2 / 1 | 1 | Q-7.5-011 |
| 5.2.1 | Appliquer les prescriptions des exploitants | 3 / 1 | 1 | Q-7.5-012 |
| 5.2.2 | Vérifier les prescriptions concernant les bagages des passagers | 7 / 2 | 2 | Q-7.5-013, Q-7.5-014 |
| 7.3 | Signaler les MD non déclarées ou mal déclarées | 2 / 1 | 1 | Q-7.5-015 |
| 7.4 | Signaler les situations mettant en cause des MD | 2 / 1 | 1 | Q-7.5-016 |
| **Total** | | | **16** | |

**Block spread:** Block 0 = 9 items (7 distinct leaves), Block 5 = 5 items
(4 distinct leaves), Block 7 = 2 items (2 distinct leaves) — a
cross-section of all three active blocks, weighted toward Block 0's larger
leaf count and Block 5's richest single pool (5.2.2), per this batch's own
"richest leaves first" instruction and the blueprint's own recommended
drafting order (Block 0 first, Block 7 next in terms of care needed, Block 5
last with 5.2.2 drafted deliberately).

**No per-sub-task ceiling or sample is exceeded.** 0.2.1, 0.2.3, and 5.2.2
are each drawn at their full sample figure (2); every other sub-task drawn
is at 1, at or below its own sample.

**Deliberately not drafted this batch, and why:**

- **0.3.2, 0.5.3, 0.6.2, 5.2.3 — confirmed `SOURCE GAP`, count = 0 for all
  four, per blueprint binding caveat 1.** No item was drafted against any of
  these four leaves. No new evidence was found this session to change that
  status.
- **The WCHC/reduced-mobility-passenger scenario was drafted once
  (Q-7.5-013), strictly bounded to 5.2.2's genuinely-evidenced
  installed-lithium-battery-threshold content (p.42), per blueprint binding
  caveat 2.** It deliberately does not test the wheelchair-as-mobility-device
  application itself, any wheelchair-specific acceptance procedure, or the
  captain-notification fact (5.2.3) — none of which the course evidences.
  See the compliance note inside Q-7.5-013 itself.
- **0.4.2/0.4.3-equivalent packing-group content — explicitly out of scope,
  per blueprint binding caveat 3.** The course (p.73–75), Exam Q6, and
  Practice Q17 all teach/test packing groups, but Table 7.5.A's own official
  task list for Function 7.5 does not include 0.4.2 or 0.4.3 at all, so no
  leaf sub-task exists in this blueprint to attach such an item to. None was
  drafted.
- **0.2.2 (shares 0.2.1's evidence pool, ceiling 2, sample 1) — left at 0
  this batch.** Per blueprint binding caveat 4, 0.2.2's pool is deliberately
  kept smaller than 0.2.1's; this batch drew 0.2.1 at its own full sample
  (2) instead, leaving 0.2.2 for a future batch that can give its distinct
  "recognize already-flagged" framing the dedicated attention binding
  caveat 4 requires, rather than rushing a thin, easily-conflated item in
  alongside 0.2.1's two items here.
- **7.1 and 7.2 (thin/merged evidence pool, ceiling 1/sample 1 each,
  binding caveat 6) — left at 0 this batch.** Both share one
  undifferentiated slide (p.100–101) with no independent wording for either
  official code, the same recurring pattern already confirmed five times
  across Functions 7.1–7.4 and this function's own Stage 1/cross-validation
  passes. With Block 7 already covered by its two richer, dedicated-slide
  leaves (7.3, 7.4) this batch, this thinnest pool is deliberately left for
  a later batch rather than padded in now.
- **The remaining 6 of Block 0's 16 non-gap leaves** (0.1.3, 0.1.4, 0.3.1,
  0.4.1, 0.5.1, plus 0.2.2 above) were not drafted this batch — real source
  exists for all of them (see `docs/DGR_STAGE2A_FUNCTION_7.5_BLUEPRINT.md`),
  left for a future batch. In particular, 0.1.3 is genuinely thin
  (single-slide, ceiling 1/sample 1) and should stay minimal even then.

## Method notes on distractor sourcing (rule 6 compliance)

Every distractor below is grounded in something actually read this session:
either (a) a different, correctly-stated fact from elsewhere in the same
KOST Function 7.5 course, repurposed here as a wrong answer to *this*
question (a "swapped-fact" or "wrong-checkpoint" distractor), (b) a direct
contradiction of a specific clause in the same source passage the correct
answer comes from (a "parsing" distractor — the same sentence read
incorrectly), or (c) — for Q-7.5-013's spare-battery item only — one of the
KOST exam's own listed wrong options for the same question, already vetted
by the same assessment instrument. No distractor asserts an invented
regulatory fact, an invented numeric threshold, or a fact sourced from a
different function's course material. Where a distractor's wrongness rests
on a fact drawn from a different slide, that slide is cited so the
wrongness is traceable.

---

## Q-7.5-001 — Accident industriel (non aéronautique) cité dans « Pourquoi Réglementer? »

**Sub-task:** 0.1.1 Comprendre la définition
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Généralités — « Pourquoi Réglementer? »), à
quel accident industriel (non aéronautique) le cours associe-t-il un
dégagement de gaz isocyanate de méthyle ayant causé environ 7 000 morts,
parmi les événements historiques cités comme motivation de la
réglementation du transport aérien des marchandises dangereuses ?

**Options:**
- **(Correct)** Union Carbide, Bhopal, 3 décembre 1984.
- ValuJet, Everglades, 11 mai 1996 (générateurs d'oxygène, 110 morts).
- Saudi Arabian Airlines, Riyadh, 19 août 1980 (réchaud de camping dans les
  bagages, 301 morts).
- UPS B-747, Dubaï, 3 septembre 2010 (2 membres d'équipage).

**Correct answer rationale:** Slide 18 ("Pourquoi Réglementer?"): "Union
Carbide, Bhopal, 3 Dec 1984, Gaz isocynate de méthyle(MIC)–7 000 personnes
sont mortes."

**Distractor rationale (source-grounded — each is a different accident
named on the same slide, with its own distinct cause and toll):**
- ValuJet Everglades 1996 — same slide: "Générateurs d'oxygène - 110 morts,"
  a different cause and toll.
- Saudi Arabian Airlines Riyadh 1980 — same slide: "Réchaud de camping dans
  les bagages – 301 morts," a different cause and toll.
- UPS B-747 Dubaï 2010 — same slide: "02 membres d'équipage ont perdu la
  vie," a different accident with no cause named on this slide.

**Source basis:** Tier B — KOST Function 7.5 course, slide 18
("Généralités", "Pourquoi Réglementer?"). Note: this slide names **five**
accidents (also including Pan Am Boston 1973, not used as a distractor
here), one more than the four-accident version of this same slide found in
Function 7.4's own course folder — Bhopal/Union Carbide is unique to this
version, so this item is independently grounded in Function 7.5's own
material, not copied from Function 7.4's equivalent item (Q-7.4-001, which
tested the ValuJet fact). No direct exam/practice hit for this specific
historical-accident fact; Exam Q1 (source publication for the legal basis)
tests a different fact from the same general 0.1.1 area, noted honestly as
topic-level, not direct, corroboration.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.5-002 — Rôle de l'OACI dans le cadre juridique du DGR

**Sub-task:** 0.1.2 Reconnaître le cadre juridique (mondial, national)
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Fondements de la Réglementation DGR 1.1),
quel organisme s'est fondé sur les recommandations du SCoETDG et de l'AIEA
pour élaborer la Réglementation pour le transport sécuritaire des
marchandises dangereuses par voie aérienne, codifiée dans l'annexe 18 et
dans les Instructions techniques (IT) ?

**Options:**
- **(Correct)** L'Organisation de l'Aviation Civile Internationale (OACI).
- Le Sous-comité d'experts du Conseil économique et social des Nations-Unies
  (SCoETDG).
- L'Agence internationale de l'énergie atomique (AIEA).
- L'Association Internationale du Transport Aérien (IATA).

**Correct answer rationale:** Slide 21: "L'OACI s'est fondée sur ces
recommandations pour élaborer la Réglementation pour le transport
sécuritaire des marchandises dangereuses par voie aérienne. Cette
Réglementation est codifiée dans l'annexe 18 et dans les Instructions
techniques (IT) pour la sécurité du transport aérien des marchandises
dangereuses."

**Distractor rationale (source-grounded — each is a different body in the
same slide sequence, with its own distinct, correctly-stated role):**
- SCoETDG — slide 19: "Le SCoETDG élabore des procédures recommandées pour
  le transport de toutes les marchandises dangereuses, à l'exception des
  matières radioactives... applicables à tous les modes de transport" — an
  upstream, all-modes body, not the air-transport-specific codifying body
  the stem asks about.
- AIEA — slide 20: "L'AIEA élabore des recommandations pour le transport
  sécuritaire des matières radioactives. Ces prescriptions... sont
  reflétées dans la partie 10 du manuel de l'IATA" — a different,
  radioactive-materials-specific upstream body, not the source of annexe
  18/IT.
- IATA — slide 22: "La Réglementation de l'IATA comporte toutes les
  spécifications des Instructions techniques (IT)... l'IATA a ajouté des
  spécifications plus restrictives" — a further downstream body that builds
  on the IT the OACI itself codified, not the body that codified them.

**Source basis:** Tier B — KOST Function 7.5 course, slides 19–22 ("Cadre
juridique", DGR 1.1, SCoETDG→AIEA→OACI→IATA hierarchy). Corroborated at a
topic level by Exam Q1 ("Quelle publication fournit la base légale... Les
Instructions techniques de l'OACI" among the answer options), a related but
distinct fact from the same general hierarchy, noted honestly as
topic-level corroboration, not a direct match for the OACI-specific fact
tested here.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.5-003 — Contenu potentiel des COMAT (DGR 2.2.4)

**Sub-task:** 0.2.1 Développer un flair pour les marchandises dangereuses cachées
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Exemples de DG cachées DGR 2.2.4), les COMAT
(pièces détachées d'avion ou autres articles tels que fusées de détresse,
trousses de premiers secours) ne sont généralement pas déclarés comme
marchandises dangereuses. Selon le cours, lesquels des éléments suivants ces
articles peuvent-ils néanmoins contenir ?

**Options:**
- **(Correct)** Des générateurs chimiques d'oxygène, des gaz comprimés, des
  liquides inflammables.
- Des aliments surgelés et des instruments scientifiques.
- Exclusivement des batteries au lithium-ion (UN 3480/3481).
- Rien : les COMAT sont par définition exemptés de toute classification en
  tant que marchandises dangereuses.

**Correct answer rationale:** Slide 53: "Les COMAT: pièces détachées
d'avion ou autres articles tels que les fusées de détresse, les trousses de
premiers secours, etc. ne sont généralement pas déclarés. Cependant, ils
peuvent contenir: Des générateurs chimiques d'oxygène[,] Des gaz comprimés,
des liquides inflammables..."

**Distractor rationale (source-grounded):**
- "Aliments surgelés et instruments scientifiques" — real terms, but they
  come from Exam Q16 and Practice Q9(c) respectively, not from the course's
  own COMAT-example slide — the course's own text nowhere names either as a
  COMAT-content example, an exam/practice-beyond-course pattern deliberately
  used here as a wrong-checkpoint distractor rather than fabricated content.
- "Exclusivement des batteries au lithium-ion" — lithium-ion batteries (UN
  3480/3481) are a real, separately-taught course category (slides 89–90),
  but the COMAT slide's own named contents are chemical oxygen
  generators/compressed gases/flammable liquids, not lithium-ion batteries,
  and "exclusivement" contradicts the slide's own broader, non-exclusive
  list.
- "Rien: les COMAT sont par définition exemptés" — directly contradicts the
  slide's own closing sentence: "Les COMAT doivent être classées et
  transportées conformément aux règlements."

**Source basis:** Tier B — KOST Function 7.5 course, slide 53 (DGR 2.2.4,
COMAT example), cross-checked against slide 54 (AOG parts/automobiles/
dental equipment/etc.) and slides 89–90 (lithium battery table).
Corroborated at a topic level by Exam Q16 ("Quels dangers cachés
pourriez-vous trouver... Pièces de rechange d'avion / COMAT / Aliments
surgelés") and Practice Q9 (hidden DG in medical equipment/automobile
parts/scientific instruments), each testing the same general hidden-DG-in-
COMAT topic with some named examples beyond the course's own slide, noted
honestly per the exam/practice-beyond-course pattern already flagged in
`docs/DGR_STAGE1_FUNCTION_7.5_DRAFT.md`'s SOURCE GAP note 8.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.5-004 — Indices de reconnaissance des MD cachées (DGR 2.2.4)

**Sub-task:** 0.2.1 Développer un flair pour les marchandises dangereuses cachées
**Type:** MCQ, single-answer ("laquelle NE figure PAS")

**Stem (FR):** Selon le cours (Comment reconnaître les marchandises
dangereuses cachées? DGR 2.2.4), laquelle des observations suivantes ne
figure **PAS** parmi les indices cités par le cours pour soupçonner la
présence de marchandises dangereuses cachées dans un colis ?

**Options:**
- **(Correct)** Le colis est accompagné d'une facture douanière indiquant
  une valeur déclarée élevée.
- Un emballage indiquant un déversement ou une fuite, ou un paquet au
  centre de gravité variable avec un contenu liquide à l'intérieur.
- Un emballage qui fait des bruits, ou qui génère de la fumée ou des
  émanations.
- Un emballage réutilisé portant des indications de matières dangereuses et
  d'anciens étiquetages.

**Correct answer rationale:** The course's own "Comment reconnaître les
marchandises dangereuses cachées?" sequence (slides 55–58) lists exactly
four categories of indices: leaking/variable-centre-of-gravity packaging
(slide 56), noise/smoke/fumes and camping equipment (slide 57), and reused
packaging with old DG markings/labels (slide 58: "Emballages réutilisés
portant des indications de matières dangereuses et d'anciens
étiquetages"). A customs-invoice declared value is never mentioned anywhere
in this sequence or elsewhere in the course as an indicator of hidden DG.

**Distractor rationale (source-grounded — each of the three wrong-to-select
options is one of the course's own genuinely listed indices, verbatim or
near-verbatim):**
- Slide 56: "Emballage pouvant indiquer un déversement ou une fuite ou
  paquet avec centre de gravité variable, avec contenu liquide à
  l'intérieur."
- Slide 57: "Emballage qui fait des bruits[,] Emballage générant de la
  fumée ou des émanations[,] Équipement de camping."
- Slide 58: "Emballages réutilisés portant des indications de matières
  dangereuses et d'anciens étiquetages."

**Source basis:** Tier B — KOST Function 7.5 course, slides 55–58 (DGR
2.2.4, "Comment reconnaître les MD cachées?" sequence), cross-checked
against slide 61 (exercise: fauteuil pour dentiste/équipement de
plongée/trousse à outils) and slide 62 ("Questions 5–11" practice-book
pointer). Per blueprint binding caveat 4, this item is drawn from the same
evidence pool as 0.2.2 but tests 0.2.1's own "développer un flair"/
detection-indicator framing directly, not 0.2.2's "recognize
already-flagged" framing — 0.2.2 itself is left undrafted this batch (see
"Deliberately not drafted" above). Corroborated at a topic level by Exam
Q12 (agent d'escale suspects hidden DG — alert supervisor) and Practice
Q9/Q11, noted honestly as topic-level corroboration for the broader
hidden-DG-detection skill, not a direct match for this specific
indicator-list fact.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.5-005 — Interdiction des systèmes à base d'oxygène liquide (DGR 2.3.A)

**Sub-task:** 0.2.3 Être au courant des dispositions s'appliquant aux passagers
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (DGR 2.3.A), quelle affirmation concernant le
transport, par un passager, d'un système à base d'oxygène liquide est
correcte ?

**Options:**
- **(Correct)** Son transport est interdit.
- Il est autorisé sans condition, au même titre que les fournitures
  d'oxygène portables relevant de la propriété de l'exploitant (DGR 2.5).
- Il est autorisé uniquement avec l'accord préalable de la compagnie
  aérienne, comme pour une petite bouteille d'oxygène médicale (gaz
  comprimé).
- Il est autorisé uniquement en soute, jamais en cabine.

**Correct answer rationale:** Slide 43: "Note: le transport des systèmes à
base d'oxygène liquide est interdit."

**Distractor rationale (source-grounded):**
- "Autorisé sans condition... fournitures d'oxygène portables... DGR 2.5" —
  slide 47 does list "Fournitures d'oxygène portables" among the DGR 2.5
  operator-property-exempted examples, a real course fact, but that
  exemption is a separate category (operator's own property) from a
  passenger's personal liquid-oxygen system, which slide 43 flatly
  prohibits — a genuine wrong-checkpoint distractor.
- "Autorisé uniquement avec l'accord préalable... bouteille d'oxygène
  médicale (gaz comprimé)" — Exam Q10 does test exactly this rule ("Un
  passager souhaite transporter une petite bouteille d'oxygène médicale
  (gaz comprimé)... c) Autorisé seulement avec l'accord de la compagnie
  aérienne"), a real, correctly-stated adjacent rule, but it concerns
  compressed-gas medical oxygen bottles, a different item from the
  liquid-oxygen systems slide 43 addresses.
- "Autorisé uniquement en soute" — contradicts slide 43's own unqualified
  "est interdit," which carries no cargo-hold exception.

**Source basis:** Tier B — KOST Function 7.5 course, slide 43 (DGR 2.3.A),
cross-checked against slide 47 (DGR 2.5 operator-property exemptions) and
Exam Q10 (medical-oxygen-bottle rule). No direct exam/practice hit for the
liquid-oxygen-system prohibition specifically — noted honestly as an
uncorroborated but directly source-traced item.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.5-006 — Interdiction générale et exceptions (DGR 2.3)

**Sub-task:** 0.2.3 Être au courant des dispositions s'appliquant aux passagers
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (DGR 2.3), les marchandises
dangereuses, y compris les colis exceptés de matières radioactives, sont
interdites au transport par les passagers ou l'équipage — que ce soit comme
ou dans les bagages enregistrés, en tant que bagage à main, ou sur leur
personne — sauf dans les cas autorisés aux points 2.3.2 à 2.3.5, et
uniquement pour un usage personnel.

**Correct answer:** Vrai.

**Rationale:** Slide 44: "Les marchandises dangereuses, y compris les colis
exceptés de matières radioactives, sont interdites au transport par les
passagers ou l'équipage: comme ou dans les bagages enregistrés; en tant que
bagage à main ou; sur leur personne; sauf dans les cas autorisés aux points
2.3.2 à 2.3.5 pour un usage personnel." Direct, complete match — the stem
tests every clause of the same sentence (scope: registered baggage/carry-on/
on-person; the radioactive-excepted-packages inclusion; the
2.3.2–2.3.5/personal-use exception).

**Source basis:** Tier B — KOST Function 7.5 course, slide 44 (DGR 2.3),
cross-checked against slide 49 ("Dispositions relatives aux passagers" —
"Les DG sont généralement interdits au transport par des passagers ou
l'équipage... Seuls les articles spécifiés aux points 2.3.2 à 2.3.5 sont
autorisés, et uniquement pour un usage personnel"). Corroborated at a topic
level by Exam Q7 ("Les marchandises dangereuses (DGR) sont: ... b)
Réglementées et parfois autorisées sous conditions"), a related but more
general framing, noted honestly as topic-level corroboration only.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.5-007 — Les deux types d'étiquettes sur un colis de marchandises dangereuses

**Sub-task:** 0.5.2 Reconnaître les prescriptions de base concernant l'étiquetage
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Étiquetage DGR 7.2.2.2), laquelle des
affirmations suivantes décrit correctement la classification des étiquettes
que doit porter un colis de marchandises dangereuses ?

**Options:**
- **(Correct)** Il existe deux types d'étiquettes : les étiquettes de
  danger et les étiquettes de manutention.
- Il existe trois types distincts : les étiquettes de danger, de
  manutention, et une catégorie séparée pour les matières biologiques de
  Catégorie B (UN 3245).
- Seules les étiquettes de danger sont obligatoires ; les étiquettes de
  manutention sont facultatives.
- Les étiquettes de danger chimique (« autres étiquettes ») suffisent à
  elles seules à classifier une marchandise comme dangereuse selon la
  Réglementation.

**Correct answer rationale:** Slide 81: "Tous colis contenant des
marchandises dangereuses doit être étiqueté pour indiquer son contenu. Il
existe 2 types d'étiquettes: Les étiquettes de danger[,] Les étiquettes de
manutention."

**Distractor rationale (source-grounded):**
- "Trois types distincts... UN 3245" — slide 83 does show biological
  Category B/UN 3245, environmentally-hazardous, and GMO labels as worked
  examples, but nothing on that slide reframes them as a third category
  outside the danger/handling structure slide 81 states — they are
  themselves danger labels (biological substances being a hazard class),
  not a separate third type.
- "Seules les étiquettes de danger sont obligatoires... facultatives" —
  contradicts slide 81's own opening line, "Tous colis... doit être
  étiqueté," stated before the two-type list, with no optionality carved
  out for either type.
- "Les étiquettes de danger chimique... suffisent à elles seules à
  classifier" — directly contradicts slide 84 ("Autres étiquettes"):
  "Certains colis portent des étiquettes de danger chimique. Les articles
  qui y sont contenus ne répondent pas forcement à la classification des DG
  conformément à la réglementation. Cependant avant acceptation, pensez à
  demander des clarifications à l'expéditeur."

**Source basis:** Tier B — KOST Function 7.5 course, slide 81 (DGR 7.2.2.2,
two-type statement), cross-checked against slides 80, 82–84
(importance-of-marking intro, handling-label image slide, biological/
environmental/GMO examples, "autres étiquettes" note) and the dedicated
label reference sheet (source item 8). Corroborated by Exam Q14 (DGR label
shape — losange), Q17, Q18 (why colis must be marked/labelled) and Practice
Q20 (DGR danger-label shape), Q23 (CAO label), each testing the broader
labelling topic without directly matching this specific two-type-
classification fact, noted honestly as topic-level corroboration.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.5-008 — Obligation de l'exploitant face à un bagage ou fret contaminé

**Sub-task:** 0.6.1 Créer une sensibilisation aux procédures d'urgence générales
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Fret ou bagages contaminés), lorsque
l'exploitant constate la contamination d'un bagage ou d'un fret non déclaré
comme contenant des marchandises dangereuses, et soupçonne que des
marchandises dangereuses pourraient être la cause de cette contamination,
quelle est son obligation ?

**Options:**
- **(Correct)** Prendre les mesures nécessaires pour lever le doute avant de
  poursuivre le chargement, et, s'il est déterminé que la contamination
  provient bien d'une matière dangereuse, prendre les mesures appropriées
  pour écarter tout risque identifié avant que le transport par voie
  aérienne puisse se poursuivre.
- Poursuivre le chargement normalement, la contamination seule ne
  constituant jamais une preuve suffisante de la présence de marchandises
  dangereuses.
- Refuser définitivement le bagage ou le fret contaminé, sans possibilité de
  vérification ou de mesure corrective ultérieure.
- Signaler immédiatement le cas à l'Agence Nationale de l'Aviation Civile
  (ANAC), sans procéder à aucune vérification locale au préalable.

**Correct answer rationale:** Slide 97: "Obligation de l'exploitant: Si
constatation de contamination de bagage ou fret non déclaré comme contenant
des marchandises dangereuses et soupçon que des marchandises dangereuses
peuvent être la cause de la contamination, [m]esures nécessaires pour lever
le doute avant de poursuivre le chargement du bagage ou du fret contaminé."
Slide 98: "S'il est déterminé que la matière à l'origine de la
contamination est une matière dangereuse... l'exploitant doit prendre des
mesures appropriées pour écarter tout risque identifié avant que le
transport par voie aérienne puisse se poursuivre."

**Distractor rationale (source-grounded):**
- "Poursuivre le chargement normalement" — directly contradicts slide 97's
  own instruction to take measures to resolve the doubt before continuing to
  load.
- "Refuser définitivement... sans possibilité de vérification" — overstates
  the source; slides 97–98 frame this as a doubt-resolution and
  risk-elimination process, not a blanket, unconditional refusal.
- "Signaler immédiatement... ANAC, sans vérification locale" — conflates
  this immediate contamination-handling procedure with the separate,
  later-stage state-authority reporting duty taught under Block 7 (slides
  100–102), a distinct obligation, not a substitute for the on-the-spot
  verification slides 97–98 require.

**Source basis:** Tier B — KOST Function 7.5 course, slides 97–98 ("Fret ou
bagages contaminés"), cross-checked against slides 100–102 (Block 7
reporting duty, a distinct later-stage obligation). Corroborated at a topic
level by Exam Q20 (agents d'enregistrement suspecting hidden DG —
refuse/inquire/isolate) and Practice Q24 (chemical-spill first response),
each testing an adjacent but distinct emergency-response fact from the same
general 0.6.1 area, noted honestly as topic-level corroboration only.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.5-009 — Divergence de l'exploitant (DGR 2.8.3)

**Sub-task:** 0.3.3 Reconnaître l'impact des divergences des États et des exploitants
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Divergence de l'Exploitant DGR 2.8.3),
laquelle des affirmations suivantes est correcte ?

**Options:**
- **(Correct)** Les divergences d'exploitant ne doivent pas être moins
  restrictives que la Réglementation, et sont applicables à tous les
  transports effectués par les exploitants concernés (exemple donné par le
  cours : AH — Air Algérie, codes AH-01, AH-02).
- Les divergences d'exploitant peuvent être moins restrictives que la
  Réglementation si l'exploitant le juge nécessaire pour des raisons
  commerciales.
- Les divergences d'exploitant ne s'appliquent qu'aux vols internationaux de
  l'exploitant concerné, jamais à ses vols domestiques.
- Les divergences d'exploitant ne sont notifiées qu'à l'État de
  l'exploitant, jamais à l'OACI ni à l'IATA.

**Correct answer rationale:** Slide 69: "Divergence de l'Exploitant DGR
2.8.3[:] Ne doivent pas être moins restrictives que le Règlement; Les
divergences de l'exploitant sont applicables à tous les transports
effectués par les exploitants concernés. Exemple: AH: AIR ALGERIE[,]
AH-01, AH-02."

**Distractor rationale (source-grounded):**
- "Peuvent être moins restrictives... raisons commerciales" — directly
  contradicts the same slide's own first clause, "Ne doivent pas être moins
  restrictives que le Règlement."
- "Ne s'appliquent qu'aux vols internationaux... jamais... domestiques" — a
  fabricated scope restriction; the slide's own wording ("applicables à
  tous les transports effectués par les exploitants concernés") carries no
  such international/domestic distinction.
- "Ne sont notifiées qu'à l'État de l'exploitant, jamais... OACI ni...
  IATA" — contradicts slide 67's own general statement: "Tout État ou
  exploitant peut ainsi marquer sa différence avec la Réglementation. On
  parle alors de divergences. Ces divergences sont notifiées à l'OACI et à
  l'IATA."

**Source basis:** Tier B — KOST Function 7.5 course, slide 69 (DGR 2.8.3),
cross-checked against slides 66–68 (divergence concept intro, DGR 2.8.1
State-divergence example — Italy/ITG) and slide 70 (restriction-hierarchy
diagram). Per blueprint binding caveat 5, this item shares its evidence
pool with 5.2.1 but is drafted here to test 0.3.3's own generic-awareness
framing of the divergence concept, not 5.2.1's applied-acceptance-decision
framing (see Q-7.5-012 below for that distinct depth). Corroborated by Exam
Q15 (compagnie stricter than IATA on lithium batteries — "une divergence
d'exploitant") and Practice Q13 (State divergence prohibiting an item IATA
allows conditionally), each testing the broader divergence concept without
directly matching this specific DGR 2.8.3 operator-divergence-rule fact.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.5-010 — Critères DGR 2.1 d'interdiction totale au transport aérien

**Sub-task:** 5.1.1 Identifier les marchandises dangereuses interdites
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (DGR 2.1), une marchandise dangereuse est
rigoureusement interdite au transport aérien lorsqu'elle est susceptible de
faire laquelle des choses suivantes ?

**Options:**
- **(Correct)** D'exploser ou de réagir dangereusement ; de produire une
  flamme ou un dégagement dangereux de chaleur, un dégagement de gaz ou de
  vapeur toxique ; ou de produire un gaz inflammable ou corrosif dans des
  conditions normales de transport.
- D'être classée dans le groupe d'emballage I, quel que soit son
  comportement physique ou chimique lors du transport.
- D'être transportée par un passager plutôt qu'en tant que fret commercial.
- De dépasser un poids de 30 kg par colis, indépendamment de sa nature
  chimique.

**Correct answer rationale:** Slide 37: "DGR 2.1[:] Marchandises
dangereuses dont le transport aérien est rigoureusement interdit: Celles
susceptibles: D'exploser ou de réagir dangereusement; De produire une
flamme ou un dégagement dangereux de chaleur, un dégagement de gaz ou
vapeur toxique; De produire un gaz inflammable ou corrosif dans des
conditions normales de transport."

**Distractor rationale (source-grounded):**
- "Groupe d'emballage I" — a real, correctly-stated course concept (slide
  73, DGR 3.0.3 — packing groups I/II/III by degree of danger), but
  packing-group assignment is a separate downstream classification step,
  not itself one of DGR 2.1's own behavioural criteria — a wrong-checkpoint
  distractor.
- "Transportée par un passager plutôt qu'en tant que fret" — conflates the
  DGR 2.1 criteria (which describe a substance's own physical/chemical
  behaviour, applicable regardless of who carries it) with the separate
  passenger-vs-cargo distinction taught elsewhere (slide 36 diagram; slide
  44).
- "Dépasser un poids de 30 kg" — a fabricated numeric threshold; DGR 2.1's
  stated criteria are behavioural, not weight-based, and no weight figure
  appears anywhere on this slide.

**Source basis:** Tier B — KOST Function 7.5 course, slide 37 (DGR 2.1),
cross-checked against slide 36 (DG-types diagram), slide 38 (DGR 4.2
illustrative table — image-only slide, no extractable text), slide 44
(passenger/crew prohibition scope), and slide 73 (packing groups).
Corroborated at a topic level by Exam Q7 ("Les marchandises dangereuses
(DGR) sont: ... b) Réglementées et parfois autorisées sous conditions") and
Q11 (paint-pot scenario — refuse, informed prohibited) and Practice Q21
(colis conforme mais sans étiquette), each testing an adjacent
prohibited/permitted-item application rather than this specific
criteria-list fact, noted honestly as topic-level corroboration.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.5-011 — Seuils d'approbation de l'exploitant (AEP et batteries)

**Sub-task:** 5.1.2 Appliquer les prescriptions d'approbation
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (DGR 2.3.A — note relative à l'approbation de
l'exploitant), laquelle des affirmations suivantes est correcte ?

**Options:**
- **(Correct)** L'exploitant peut approuver le transport de plus de 15
  appareils électroniques portables (AEP), et le transport de plus de 20
  batteries.
- L'exploitant peut approuver le transport de plus de 20 AEP, et de plus de
  15 batteries.
- Aucune approbation de l'exploitant n'est jamais requise, quel que soit le
  nombre d'AEP ou de batteries transportés.
- L'approbation de l'exploitant ne concerne que les batteries, jamais les
  AEP eux-mêmes.

**Correct answer rationale:** Slide 41: "Note: L'exploitant peut approuver
le transport de plus de 15 AEP. L'exploitant peut approuver le transport de
plus de 20 batteries."

**Distractor rationale (source-grounded):**
- "Plus de 20 AEP... plus de 15 batteries" — a parsing-error distractor
  that swaps the two figures the same slide states.
- "Aucune approbation... jamais requise" — directly contradicts the slide's
  own approval-threshold framing, which explicitly names an
  operator-approval mechanism.
- "Ne concerne que les batteries... jamais les AEP" — contradicts the
  slide, which names both AEP and batteries as subject to the same
  operator-approval note.

**Source basis:** Tier B — KOST Function 7.5 course, slide 41 (DGR 2.3.A).
"AEP" (Appareils Électroniques Portables) confirmed by the supporting Table
2.3.A reference document (source item 6: "Batteries au lithium: Appareils
électroniques portables (AEP)... Chaque personne est limitée à un maximum
de 15 AEP"), used here only to confirm the acronym's meaning, not as an
independent evidentiary source beyond the course's own slide. Corroborated
at a topic level by Exam Q10 (medical-oxygen-bottle operator-approval rule
— a related but distinct approval scenario), noted honestly as topic-level
corroboration only.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.5-012 — Application de la hiérarchie des divergences à une décision d'acceptation

**Sub-task:** 5.2.1 Appliquer les prescriptions des exploitants
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (hiérarchie des niveaux de restriction —
OACI, IATA, divergences d'État, divergences d'exploitant), lorsqu'un agent
d'escale accepte un bagage soumis à plusieurs niveaux de règles
simultanément, quelle règle doit-il appliquer ?

**Options:**
- **(Correct)** La règle la plus restrictive parmi celles applicables — la
  hiérarchie du cours plaçant les divergences d'exploitant au niveau le
  plus restrictif, après les divergences d'État, après l'IATA (DGR), après
  l'OACI (IT).
- Toujours la règle de l'OACI (IT), la plus générale, quelles que soient
  les divergences d'État ou d'exploitant en vigueur.
- Toujours la règle IATA (DGR), sans tenir compte des divergences notifiées
  par l'État ou par l'exploitant.
- La divergence d'exploitant ne s'applique jamais si une divergence d'État
  existe déjà pour le même article.

**Correct answer rationale:** Slide 70's hierarchy diagram lists, from
least to most restrictive: "OACI (IT)[,] IATA (DGR)[,] Divergences
(Etats)[,] Divergences (exploitants)" — a stacked, cumulative structure in
which each successive layer is at least as restrictive as the one below
it, so the applicable rule for any given acceptance decision is the most
restrictive layer that applies.

**Distractor rationale (source-grounded):**
- "Toujours la règle de l'OACI... quelles que soient les divergences" —
  inverts the diagram's own ordering, which places OACI (IT) at the
  *least* restrictive/base level, not the level that always prevails over
  State/operator divergences.
- "Toujours la règle IATA (DGR), sans tenir compte des divergences" —
  ignores the two divergence layers the diagram explicitly stacks above
  IATA (DGR).
- "La divergence d'exploitant ne s'applique jamais si une divergence d'État
  existe déjà" — fabricates an exclusion rule; the diagram stacks all four
  levels cumulatively and states nothing about a State divergence
  cancelling or blocking an Operator divergence for the same article.

**Source basis:** Tier B — KOST Function 7.5 course, slide 70
(restriction-hierarchy diagram), cross-checked against slides 66–69 (DGR
2.8 divergence concept, DGR 2.8.1 State-divergence example — Italy/ITG, DGR
2.8.3 Operator-divergence example — Air Algérie/AH). Per blueprint binding
caveat 5, this item shares its evidence base with 0.3.3 (Q-7.5-009 above)
but is drafted here to test *applying* the hierarchy to an acceptance
decision, a distinct procedural depth from 0.3.3's generic-concept framing.
Strongly corroborated by Practice Q13 ("Si une divergence d'État interdit
un article que l'IATA DGR autorise sous conditions, quelle règle doit
appliquer l'agent d'escale? ... b) Toujours la règle la plus stricte, donc
la divergence d'État"), a direct, concretely-worded confirmation of the
same most-restrictive-rule-wins principle tested here (independently
reworded, not copied verbatim, per this task's instruction), and by Exam
Q15 (operator stricter than IATA on lithium batteries — "une divergence
d'exploitant").
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.5-013 — Seuil d'interdiction : batterie au lithium installée et non amovible

**Sub-task:** 5.2.2 Vérifier les prescriptions concernant les bagages des passagers
**Type:** MCQ, single-answer

**Stem (FR):** Un passager à mobilité réduite se présente à l'enregistrement
avec son fauteuil roulant électrique équipé d'une batterie au lithium
installée et non amovible. Selon le cours (DGR 2.3.A), à partir de quel
seuil un bagage contenant une batterie au lithium installée et non amovible
est-il interdit au transport ?

**Options:**
- **(Correct)** Au-delà de 0,3 g de lithium métal, ou de 2,7 Wh.
- Aucun seuil n'est fixé : toute batterie au lithium installée, quelle que
  soit sa capacité, est interdite au transport.
- Le seuil ne concerne que la teneur en lithium métal (0,3 g) ; la capacité
  énergétique en Wh n'entre pas en compte.
- Le seuil ne s'applique qu'aux batteries amovibles ; une batterie
  installée non amovible n'est jamais soumise à une limite.

**Correct answer rationale:** Slide 42: "Bagage avec batteries au lithium
installées batteries non amovibles excédant 0.3g de lithium métal ou 2.7
Wh est interdit."

**Distractor rationale (source-grounded — each is the same sentence's own
components, deliberately misread):**
- "Aucun seuil n'est fixé... quelle que soit sa capacité" — directly
  contradicts the source, which states a threshold ("excédant..."),
  implying batteries below that threshold are not covered by this specific
  prohibition.
- "Uniquement la teneur en lithium métal... Wh n'entre pas en compte" —
  directly contradicts the source's own "ou" structure, which states the
  threshold as an alternative between the two units.
- "Uniquement aux batteries amovibles... jamais soumise à une limite" —
  inverts the source's own wording, which explicitly concerns batteries
  described as "installées... non amovibles," not "amovibles."

**Binding-caveat-2 compliance note:** the wheelchair-passenger framing in
this stem is used only as a real-world application context for the general
installed-lithium-battery threshold rule the course actually teaches
(slide 42) — it does **not** test any wheelchair-specific acceptance
procedure, the wheelchair-as-mobility-device application itself, or the
captain-notification question (Exam Q5's other sub-questions), none of
which has course-slide evidence (SOURCE GAP notes 4/5 in
`docs/DGR_STAGE1_FUNCTION_7.5_DRAFT.md`; leaf 5.2.3 remains hard-gated to 0
and is not drawn anywhere in this batch).

**Source basis:** Tier B — KOST Function 7.5 course, slide 42 (DGR 2.3.A).
No direct exam/practice hit for this exact installed-battery threshold
under a wheelchair framing specifically: Exam Q5's first sub-question
("Qu'est-ce que l'exploitant devra vérifier avant d'accepter la chaise")
tests the same general checkpoint (verifying the installed battery) in an
open-ended, non-multiple-choice format, corroborating that this is
genuinely examined content, though not a direct multiple-choice match; Exam
Q8 (spare 100 Wh batteries, cabin-only, max 2) tests a related but distinct
passenger-battery rule (spare, not installed), noted honestly as
topic-adjacent, not direct corroboration.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.5-014 — Marquage des bagages contenant du dioxyde de carbone solide (glace carbonique)

**Sub-task:** 5.2.2 Vérifier les prescriptions concernant les bagages des passagers
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Chargement du dioxyde de
carbone solide — glace carbonique), il est impératif de marquer les
bagages de soute des passagers et des équipages contenant du dioxyde de
carbone solide en indiquant la quantité transportée, laquelle ne doit pas
dépasser 2,5 kg.

**Correct answer:** Vrai.

**Rationale:** Slide 92: "Tel que requis par la réglementation, il est
impératif de marquer les bagages de soute des passagers et des équipages
comme tel et de signaler la quantité de glace carbonique (2.5 kg ou moins)
qu'elles contiennent." Direct, complete match.

**Source basis:** Tier B — KOST Function 7.5 course, slide 92 (dioxyde de
carbone solide/glace carbonique, baggage marking requirement), cross-checked
against slide 91 (operator arrangement conditions: aircraft type,
ventilation rate, packing/storage method, presence of live animals) and
slide 47 (glace carbonique listed among DGR 2.5 operator-property exempted
examples for catering use — a related but distinct, non-passenger-baggage
context). Corroborated by Practice Q7 ("La glace carbonique utilisée pour
conserver des produits dans un bagage: ... b) Est autorisée avec une limite
de poids et une étiquette spéciale"), a direct, closely matching
confirmation of both the weight-limit and special-label requirement tested
here.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.5-015 — Portée du signalement des MD non déclarées (fret/courrier ET bagages/personne)

**Sub-task:** 7.3 Signaler les marchandises dangereuses non déclarées ou mal déclarées
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Compte rendu DG non
déclarées), l'obligation de l'exploitant de signaler les marchandises
dangereuses non déclarées ou mal déclarées découvertes dans le fret ou le
courrier s'étend également à celles découvertes dans les bagages ou sur la
personne de voyageurs ou de membres d'équipage.

**Correct answer:** Vrai.

**Rationale:** Slide 99: "L'exploitant doit signaler tout cas où des
marchandises dangereuses non déclarées ou mal déclarées ont été découvertes
dans le fret ou le courrier[.] le signalement s'applique aux marchandises
dangereuses non déclarées ou mal déclarées découvertes dans les bagages ou
sur la personne de voyageurs ou de membres d'équipage." Direct, complete
match — the course explicitly extends the duty to baggage/on-person
discoveries, directly relevant to this function's passenger/baggage-facing
scope.

**Source basis:** Tier B — KOST Function 7.5 course, slide 99 (dedicated
slide, own content, not shared with 7.1/7.2's merged slide). Per blueprint
binding caveat 6, this leaf has zero direct exam/practice cross-reference
in this function's own material, independently confirmed in
`docs/DGR_STAGE1_FUNCTION_7.5_CROSSVALIDATION.md`; no exam/practice item was
found testing this fact directly, noted honestly as an uncorroborated but
directly source-traced item.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.5-016 — Autorité algérienne destinataire des comptes rendus (ANAC)

**Sub-task:** 7.4 Signaler les situations mettant en cause des marchandises dangereuses
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Compte rendu accidents et
incidents), pour l'Algérie, tous les comptes rendus sont adressés à
l'Agence Nationale de l'Aviation Civile (ANAC), dont le siège social est
situé Lot 225, Route Nationale N°5, Rouiba, Alger.

**Correct answer:** Vrai.

**Rationale:** Slide 102: "Pour l'Algerie, tous les compte-rendu sont
adressés à: L'Agence Nationale de l'Aviation Civile ANAC[.] Siège social:
Lot 225, Route Nationale N°5, Rouiba, Alger, Algérie." Direct, explicit
match — this is the course's own Algeria-specific enrichment beyond the
generic IATA wording, following the general "Compte rendu accidents et
incidents" heading (slides 100–101).

**Source basis:** Tier B — KOST Function 7.5 course, slide 102,
cross-checked against slides 100–101 (general reporting-duty statement,
shared evidence base with 7.1/7.2). Per blueprint binding caveat 6, no
direct exam/practice cross-reference exists for this leaf either,
independently confirmed in `docs/DGR_STAGE1_FUNCTION_7.5_CROSSVALIDATION.md`.
Note: the ANAC postal/registered-office detail (Rouiba address) is
administrative contact information as taught by the course, not a DGR
regulatory provision — flagged so a future reviewer does not mistake it for
a DGR-numbered requirement (same flag already used in Functions 7.3/7.4's
equivalent items).
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Summary table

| ID | Sub-task | FR status | Type | Current source basis (Tier) | EN status | Approval |
|---|---|---|---|---|---|---|
| Q-7.5-001 | 0.1.1 Accident Bhopal 1984 | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.5 course slide 18 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.5-002 | 0.1.2 Rôle de l'OACI | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.5 course slides 19–22 (DGR 1.1) | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.5-003 | 0.2.1 Contenu COMAT | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.5 course slide 53 (DGR 2.2.4) | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.5-004 | 0.2.1 Indices de reconnaissance MD cachées | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.5 course slides 55–58 (DGR 2.2.4) | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.5-005 | 0.2.3 Interdiction oxygène liquide | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.5 course slide 43 (DGR 2.3.A) | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.5-006 | 0.2.3 Interdiction générale + exceptions | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | True/False | KOST F7.5 course slide 44 (DGR 2.3) | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.5-007 | 0.5.2 Deux types d'étiquettes | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.5 course slides 80–84 (DGR 7.2.2.2) | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.5-008 | 0.6.1 Bagage/fret contaminé | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.5 course slides 97–98 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.5-009 | 0.3.3 Divergence d'exploitant DGR 2.8.3 | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.5 course slide 69 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.5-010 | 5.1.1 Critères DGR 2.1 | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.5 course slide 37 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.5-011 | 5.1.2 Seuils d'approbation AEP/batteries | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.5 course slide 41 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.5-012 | 5.2.1 Hiérarchie des divergences appliquée | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.5 course slide 70 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.5-013 | 5.2.2 Seuil batterie installée (cadre WCHC borné) | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.5 course slide 42 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.5-014 | 5.2.2 Marquage glace carbonique (2,5 kg) | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | True/False | KOST F7.5 course slide 92 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.5-015 | 7.3 Portée signalement MD non déclarées | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | True/False | KOST F7.5 course slide 99 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.5-016 | 7.4 ANAC (Algérie) | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | True/False | KOST F7.5 course slide 102 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |

**Batch composition:** 11 MCQ + 5 True/False. Block spread: Block 0 = 9,
Block 5 = 5, Block 7 = 2.

## What this batch does NOT do

- Does not exceed any per-sub-task ceiling or sample in
  `docs/DGR_STAGE2A_FUNCTION_7.5_BLUEPRINT.md` (see the ceiling-compliance
  table above — every drawn count is at or below its "sample" figure).
- Does not draft any item against the four confirmed `SOURCE GAP` leaves
  (0.3.2, 0.5.3, 0.6.2, 5.2.3) — count remains 0 for all four, no exception,
  per binding caveat 1.
- Does not draft any item asserting wheelchair-specific acceptance
  procedure content or a captain-notification fact — Q-7.5-013's
  WCHC-flavoured framing is strictly bounded to 5.2.2's evidenced
  installed-lithium-battery-threshold rule, per binding caveat 2 (see the
  compliance note inside that item).
- Does not allocate any count to 0.4.2/0.4.3-equivalent packing-group
  content — no leaf sub-task exists in the blueprint to attach it to, per
  binding caveat 3.
- Does not draft any item from 0.2.2, 7.1, or 7.2 (thin/shared-evidence
  pools) or the remaining 5 of Block 0's non-gap leaves (0.1.3, 0.1.4,
  0.3.1, 0.4.1, 0.5.1) — real source exists for most of these, left for a
  future batch.
- Does not perform Tier A (current DGR 67th Ed./Addendum 1) verification for
  any of the 16 items — that remains the mandatory next step before any of
  these can move past `DRAFT`, blocked this pass on the owner's pending
  Bookshelf re-authentication.
- Does not mark any item `APPROVED` — no qualified reviewer exists in this
  pass.
- Does not touch Moodle or any live/production question-bank copy.
