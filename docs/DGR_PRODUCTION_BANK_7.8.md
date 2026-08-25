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

---

# Batch 2

Second production-drafting pass, appended to the same file per the shared
handoff convention. Continues the question ID sequence from
`Q-7.8-016`. Drafts **17 items**, inside the task's 15–20 target range,
against `docs/DGR_STAGE2A_FUNCTION_7.8_BLUEPRINT.md`'s per-leaf ceilings —
prioritizing the 8 Block 0 leaves Batch 1 left completely undrafted, then
rounding out remaining headroom in 6.2.2 and in several of Block 0's
partially-drawn leaves, per this batch's own task instruction.

## Status of this batch — read before using any item below

**All 17 items in this batch are `DRAFT`, Tier B basis only. None has been
Tier A-verified against the current IATA DGR 67th Edition (2026, French,
Addendum 1) text.** Exactly the same standing blocker as Batch 1 and every
prior function's batches in this program: the IATA Digital Publications
Bookshelf session remains blocked pending the owner's manual 2FA
re-authentication. Per this task's own explicit instruction, **no attempt
was made this pass either** — no Tier A content was fabricated to
compensate. This batch is Tier B only, exactly like Batch 1.

- Every item below is sourced directly and re-traced to the actual **KOST
  Function 7.8 training material** (Tier B) — the same three files Batch 1
  used, re-extracted page-by-page this session
  (`10_KOST_DGR_CBTA_Course_Function_7.8_FR_2025.pdf`,
  `12_KOST_DGR_CBTA_Exam_Function_7.8_FR_2025.pdf`,
  `09_KOST_DGR_CBTA_Practice_Book_Function_7.8_FR_2025.pdf`) — plus, for two
  items only (Q-7.8-026, Q-7.8-028), direct inspection of two further
  supplied supporting documents already listed among this function's own
  source artifacts in `docs/DGR_STAGE1_FUNCTION_7.8_DRAFT.md`:
  `11_IATA_DGR_Table_2.3A_Passengers_Crew_FR_2023.pdf` (the supplied Table
  2.3.A itself, read directly this session for Q-7.8-026) and
  `05_IATA_DGR_Danger_and_Handling_Labels_FR.pdf` (the supplied KOST label
  reference sheet, rendered to a 150dpi PNG and visually inspected this
  session for Q-7.8-028, since danger-label shape is not recoverable from
  plain text extraction of the course slides). Both are Tier B — supplied
  KOST/IATA course material, not the current 67th Edition Bookshelf text —
  and both were already on record as this function's own supporting
  artifacts before this pass, not newly introduced.
- Every "DGR x.y.z" section number cited below is, as in Batch 1, **as
  displayed on the KOST slide itself** — Tier B, not independently
  re-verified against the current 67th Edition/Addendum 1 text. The course
  remains built on the 66th Edition (confirmed again this session at slide
  25, unchanged from Batch 1's own finding).
- Per `.claude/rules/dgr-stage2b.md` rule 4, **no item in this batch may be
  marked `APPROVED`.** Status is `DRAFT` only.

### Resolved discrepancy: leaf 0.3.2 remains a confirmed SOURCE GAP — count stays 0

The task brief for this batch stated, in its reading-list summary of the
blueprint, that *"0.3.2 is NOT a gap for this function (confirmed active,
same as 7.6) — you may draft against it if there's headroom."* This
parenthetical does not match what `docs/DGR_STAGE2A_FUNCTION_7.8_BLUEPRINT.md`
itself says, and this batch follows the blueprint document, not the task
brief's summary of it, per the standing rule that evidence gaps must be
recorded honestly rather than guessed past (`.claude/rules/dgr-stage2b.md`
rules 1 and 7) and that no instruction — including a summary inside a task
brief — overrides the project's own source-tier rules.

- The blueprint's own binding caveat 1 states in full: *"Two confirmed
  SOURCE GAPs get a hard 0, no exceptions. 0.3.2... and 6.2.5... each have
  zero course-slide, exam, or practice-book evidence, independently
  re-confirmed in the cross-validation pass (0.3.2: 12 'responsab*' hits in
  the course, all tied to shipper/operator duties, none to passenger
  obligations)... Do not draft any item against these two leaf sub-tasks
  without new evidence."* The blueprint's own Block 0 table row for 0.3.2
  states count = 0, sample = 0, "SOURCE GAP."
- What "confirmed active" actually means for 0.3.2 (per both the Stage 1
  draft and the blueprint) is that the **leaf slot itself is present** in
  Table 7.8.A's own official structure — i.e., it is not one of the slots
  some other functions' tables omit entirely — **not** that the KOST course
  contains usable content for it. Those are two different claims; the task
  brief's parenthetical conflates them.
- The "(same as 7.6)" comparison does not hold either: `docs/DGR_STAGE2A_FUNCTION_7.6_BLUEPRINT.md`
  independently confirms 0.3.2 is **also** a confirmed SOURCE GAP for
  Function 7.6 (row: *"0.3.2 | Comprendre les responsabilités des
  passagers | **0** | **0** | SOURCE GAP — no course slide, exam question,
  or practice question addresses passengers' own obligations... Do not
  draft without new evidence — binding caveat 1"*) — checked directly this
  session, not assumed.
- This session independently re-ran the same keyword check the
  cross-validation pass used: `grep -i -n "responsab"` against the full
  extracted course text returns exactly the same 12 hits already recorded
  (lines tied to slides 53–57's "Rôle et responsabilité" section — the
  shipper's DGR 1.3 wheel and the operator's DGR 1.4 wheel — and one later
  occurrence at slide/line ~1434, "Responsabilités de l'exploitant:", the
  same emergency-information sentence already used as 0.6.2's own evidence
  base). **None** ties to a passenger's own responsibilities. No new
  evidence was found this session.
- The task brief's own numeric framing is actually self-consistent with
  this conclusion once 0.3.2 is excluded: it names "8 remaining Block 0
  leaves Batch 1 left uncovered" while listing 9 IDs
  (0.1.2/0.1.3/0.1.4/0.2.1/**0.3.2**/0.3.3/0.4.2/0.5.1/0.5.3) — excluding
  0.3.2 from the actually-draftable set makes the list exactly 8, matching
  the brief's own stated count. This batch treats that "8" as the operative
  instruction and drafts against the other 8 IDs only.

**Conclusion: 0.3.2's ceiling remains 0 this batch, unchanged from Batch 1.
No item was drafted against it.** This is recorded transparently here so
the discrepancy is visible to both agents and the owner, per
`.claude/rules/dgr-stage2b.md` rule 9 (keep the shared status files
consistent) — it is not a silent deviation from the task brief, and it does
not require an owner decision to resolve (the blueprint's own binding
caveat is unambiguous and independently re-confirmed twice above).

## Sub-task selection and ceiling compliance

| Sub-task | Title | Ceiling (Batch 1 + Batch 2 drawn / ceiling) | New this batch | New item(s) |
|---|---|---|---|---|
| 0.1.2 | Reconnaître le cadre juridique (mondial, national) | 1/4 | 1 | Q-7.8-016 |
| 0.1.3 | Déterminer l'application et la portée | 1/1 (full ceiling) | 1 | Q-7.8-017 |
| 0.1.4 | Faire la distinction entre un danger et un risque | 1/3 | 1 | Q-7.8-018 |
| 0.2.1 | Développer un flair pour les MD interdites | 1/4 | 1 | Q-7.8-019 |
| 0.3.3 | Reconnaître l'impact des divergences des États et des exploitants | 1/2 | 1 | Q-7.8-020 |
| 0.4.2 | Comprendre les principes généraux des groupes d'emballage | 1/3 | 1 | Q-7.8-021 |
| 0.5.1 | Reconnaître les prescriptions de base concernant le marquage | 1/4 | 1 | Q-7.8-022 |
| 0.5.3 | Déterminer les documents exigés | 1/3 | 1 | Q-7.8-023 |
| 6.2.2 | Interpréter la NOTOC | 3+2=5/8 | 2 | Q-7.8-024, Q-7.8-025 |
| 0.2.3 | Être au courant des dispositions s'appliquant aux passagers | 2+1=3/6 | 1 | Q-7.8-026 |
| 0.4.1 | Trouver de l'information générale sur les classes et les divisions | 2+1=3/8 | 1 | Q-7.8-027 |
| 0.5.2 | Reconnaître les prescriptions de base concernant l'étiquetage | 2+1=3/8 | 1 | Q-7.8-028 |
| 0.3.1 | Clarifier le rôle individuel et collectif des parties prenantes | 1+1=2/5 | 1 | Q-7.8-029 |
| 6.2.1 | S'occuper des MD non permises dans les bagages | 1+1=2/2 (full ceiling) | 1 | Q-7.8-030 |
| 6.2.3 | Appliquer les procédures en cas d'urgence | 1+1=2/3 | 1 | Q-7.8-031 |
| 0.6.1 | Créer une sensibilisation aux procédures d'urgence générales | 0+1=1/3 | 1 | Q-7.8-032 |
| **Total** | | | **17** | |

**No per-leaf ceiling is exceeded.** Two leaves now sit at their **full
ceiling** after this batch (0.1.3 at 1/1 — a genuinely single-fact,
single-slide sub-task where the blueprint itself set ceiling = sample = 1;
6.2.1 at 2/2 — see below), and all others remain strictly below ceiling,
most with substantial headroom left for a future batch (0.4.1 and 0.5.2
both remain at 3/8, 0.2.3 at 3/6, 6.2.2 at 5/8).

**Sample vs. ceiling, carried forward from Batch 1's own established
reading:** several leaves are drawn above their blueprint "sample" figure
(the recommended per-sitting draw) but still strictly below their "count"
ceiling (the hard bank-size limit) — the same distinction Batch 1 relied on
for 6.2.2, and the same "a ceiling to draft *up to*, not a quota that must
be filled" framing from the blueprint's own preamble. This batch's
sample-vs-ceiling overages, and their justification, are:

- **6.2.2 (sample 2, drawn 5 total across both batches)** — this batch adds
  2 more items to Batch 1's 3, per this task's own explicit instruction to
  "round out remaining headroom in 6.2.2." Both new items test facts
  genuinely distinct from Batch 1's three (the NOTOC's own required-field
  list, exam Q20's stowage location, practice Q30's class count) — the
  NOTOC's own **exemptions** list (slide 104) and the **"who provides the
  NOTOC to the captain"** fact (slide 101) — so no item duplicates another
  item's underlying fact. 6.2.2 remains this function's single richest,
  best-evidenced pool (both instruments' own capstones), 3 items of
  headroom remain (5/8) for a future batch.
- **0.2.3 (sample 2, drawn 3 total)**, **0.4.1 (sample 2, drawn 3 total)**,
  **0.5.2 (sample 2, drawn 3 total)** — each one item above sample, per the
  task's own instruction to round out "Block 0's other partially-drawn
  leaves." Each new item tests a fact genuinely distinct from its own
  Batch 1 items (0.2.3: the allumettes/briquet "sur la personne" rule,
  distinct from Batch 1's general-prohibition and DGR 2.5-exemption items;
  0.4.1: the DGR 4.2 list's own `*`/`†` symbol meanings, distinct from
  Batch 1's column-D and subdivided-class items; 0.5.2: danger-label shape,
  distinct from Batch 1's two-label-type and chemical-label items).
- **6.2.1 (sample 1, drawn 2 total — now at its full ceiling of 2)** — the
  same style of justification Batch 1 gave for 6.2.2: this leaf's own two
  count-worthy facts in the source material (the reporting-obligation actor
  fact already drawn in Batch 1, and the separate pre-loading
  contaminated-baggage decision procedure drawn here) are genuinely
  distinct, both within binding caveat 5's restricted framing, and drawing
  both exhausts this leaf's own small ceiling exactly rather than leaving a
  single usable fact stranded.
- **6.2.3 (sample 1, drawn 2 total)** — one item above sample, testing a
  distinct applied scenario (body/clothing-contact response, slide 109)
  from Batch 1's own item (damaged-package response, slide 108), per
  binding caveat 4's own requirement that 6.2.3 items test *applied*
  execution — two genuinely different procedure sequences exist in the
  source, so two distinct applied items are drawn rather than one.
- **0.3.1 (sample "1–2", drawn 2 total)** — within the blueprint's own
  stated sample range, not an overage.

No leaf is drawn to a point where a future batch would have to invent new
facts to fill remaining ceiling headroom with non-duplicate content —
0.4.1 and 0.5.2 in particular (this function's two richest Block 0 leaves,
ceiling 8 each) still have 5 items of genuine, already-identified headroom
each (per Stage 1's own listed exam/practice cross-references not yet
drawn on: e.g. 0.4.1's exam Q3/Q5/Q6/Q11 and practice Q12/Q13/Q18/Q19;
0.5.2's exam Q18/Q19 and practice Q21/Q22/Q23/Q24/Q28).

**Block spread this batch:** Block 0 = 13 items (13 distinct leaves: the 8
newly-touched leaves plus 0.2.3/0.3.1/0.4.1/0.5.2/0.6.1), Block 6.2 = 4
items (6.2.1×1, 6.2.2×2, 6.2.3×1). Combined with Batch 1, **19 of the
function's 21 non-gapped leaves have now been drawn on at least once** —
only 0.4.3 and 0.6.2 (both restricted, sample 0–1, deliberately left at 0
in Batch 1 "for a future batch") remain completely undrafted, plus the two
hard-gated SOURCE GAPs (0.3.2, 6.2.5).

## Method notes on distractor sourcing (rule 6 compliance, carried forward from Batch 1)

Every distractor below is grounded in something actually read this session:
either (a) a different, correctly-stated fact from elsewhere in this same
KOST Function 7.8 course/exam/practice book (including, in several items,
a fact already established as correct by a Batch 1 item — explicitly cited
as such below), repurposed here as a wrong answer, or (b) a direct
contradiction of a specific clause in the same source passage the correct
answer comes from. Two items (Q-7.8-020, Q-7.8-029) each include exactly
one distractor explicitly flagged as a plausible-but-unfounded construction
not grounded in any specific course passage, per the same honest-disclosure
practice Batch 1 used for Q-7.8-015's food distractor — never presented as
if it were source-grounded.

---

## Q-7.8-016 — L'organisme à l'origine des recommandations pour toutes les MD, hors matières radioactives

**Sub-task:** 0.1.2 Reconnaître le cadre juridique (mondial, national)
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Cadre juridique — Fondements de la
Réglementation DGR 1.1), quel organisme élabore des procédures
recommandées pour le transport de **toutes** les marchandises dangereuses,
à l'**exception** des matières radioactives, applicables à tous les modes
de transport ?

**Options:**
- **(Correct)** Le Sous-comité d'experts du Conseil économique et social
  des Nations-Unies (SCoETDG).
- L'Agence internationale de l'énergie atomique (AIEA).
- L'Organisation de l'Aviation Civile Internationale (OACI).
- L'Association Internationale du Transport Aérien (IATA).

**Correct answer rationale:** Slide 19: "Le SCoETDG élabore des procédures
recommandées pour le transport de toutes les marchandises dangereuses, à
l'exception des matières radioactives. Ces procédures sont applicables à
tous les modes de transport." Direct, complete match.

**Distractor rationale (source-grounded — each is the same slide-pool's own
different, correctly-described body, wrong for this specific question):**
- AIEA — slide 20's own role is the exact carved-out exception itself:
  "élabore des recommandations pour le transport sécuritaire des matières
  radioactives," not "toutes les MD" — the opposite scope.
- OACI — slide 21: "s'est fondée sur ces recommandations pour élaborer la
  Réglementation... par voie aérienne," codified in Annexe 18/IT — a
  downstream air-transport-specific regulator, not the original
  all-modes recommendation source.
- IATA — slide 22: "comporte toutes les spécifications des IT... a ajouté
  des spécifications plus restrictives" — adds operational restrictions on
  top of OACI's own IT, not the originating body.

**Source basis:** Tier B — KOST Function 7.8 course, slides 19–22 (DGR 1.1,
SCoETDG→AIEA→OACI→IATA hierarchy, each body's role individually stated),
cross-checked against slide 23 (the same hierarchy as a combined diagram).
Corroborated at a topic level by exam Q2 (which organization originated the
DGR — testing the OACI/IATA distinction, not this SCoETDG-specific fact)
and practice Q2/Q3 (ICAO technical document, DGR revision frequency), noted
honestly as topic-adjacent only.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-017 — Champ d'application du DGR de l'IATA (DGR 1.2.1)

**Sub-task:** 0.1.3 Déterminer l'application et la portée
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Applicabilité — Champ d'application DGR
1.2.1), à qui le Règlement DGR de l'IATA est-il applicable ?

**Options:**
- **(Correct)** Aux exploitants membres ou membres associés de l'IATA, aux
  parties à l'accord multilatéral de trafic intercompagnies de l'IATA-fret,
  ainsi qu'aux expéditeurs et agents de fret.
- Uniquement aux exploitants disposant d'une autorisation délivrée par
  l'OACI.
- Uniquement aux compagnies aériennes opérant des vols passagers.
- Uniquement aux autorités nationales de l'aviation civile, telles que
  l'ANAC.

**Correct answer rationale:** Slide 30, verbatim and exhaustive: "DGR de
l'IATA est applicable à: Tous les exploitants qui sont: Membres ou membres
associés de l'IATA[;] Parties à l'accord multilatéral de trafic
intercompagnies de l'IATA-fret[;] Aux expéditeurs et agents de fret."

**Distractor rationale:**
- "OACI-authorized operators" — not this slide's own wording; OACI is not
  named anywhere on slide 30 as an authorizing body for DGR applicability.
- "Uniquement... vols passagers" — contradicts the slide's own inclusion of
  freight shippers/agents, and this leaf's own richest sub-task in the
  function (0.2.3) is built entirely around passenger provisions existing
  alongside, not instead of, cargo/freight scope.
- "Autorités nationales... ANAC" — a fabricated addition; national civil
  aviation authorities are never named on slide 30's own applicability
  list, and this course's only ANAC reference anywhere sits in the
  over-taught reporting content (p.116), a different topic entirely.

**Source basis:** Tier B — KOST Function 7.8 course, slide 30 (DGR 1.2.1,
the only slide addressing this sub-task, a genuinely single-fact,
single-slide pool per the blueprint's own count=1/sample=1 rating). No
exam/practice-book reinforcement exists for this sub-task, the same
untested-but-taught pattern Stage 1 already recorded for it.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-018 — Définition du terme « Risque »

**Sub-task:** 0.1.4 Faire la distinction entre un danger et un risque
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Faire la distinction entre un danger et un
risque), quelle est la définition correcte du terme « Risque » ?

**Options:**
- **(Correct)** Le degré de probabilité qu'un danger quelconque cause
  réellement un dommage — la possibilité qu'un préjudice (dommage,
  blessure, maladie ou mort) se produise en cas d'exposition à un danger.
- Quelque chose qui pourrait potentiellement causer des dommages.
- Toute forme de liquide, de vapeur, de poussière, de fumées ou de gaz qui
  pourrait se déverser, fuir ou être mal utilisé.
- La probabilité qu'un accident aérien se produise, indépendamment de la
  présence de marchandises dangereuses à bord.

**Correct answer rationale:** Slide 31, verbatim: "Risque: le degré de
probabilité (forte ou faible chance) qu'un danger quelconque cause
réellement un dommage[.] La possibilité qu'un préjudice (dommage, blessure,
maladie ou mort) se produise en cas d'exposition à un danger."

**Distractor rationale (source-grounded — each is a genuine course
statement, but the wrong one for "Risque"):**
- "Quelque chose qui pourrait potentiellement causer des dommages" — the
  course's own definition of **Danger**, not Risque (slide 32) — a direct
  swapped-definition distractor.
- "Toute forme de liquide, de vapeur..." — the course's own worked example
  of a *chemical hazard* under the Danger definition (slide 32), not a
  definition of Risque at all.
- "La probabilité qu'un accident aérien se produise..." — an invented
  generic aviation-safety claim; the course's own risk definition is tied
  specifically to exposure to a hazard, not aviation accidents in general.

**Source basis:** Tier B — KOST Function 7.8 course, slides 31–33
(Risque/Danger definitions, chemical/radiation/biological hazard examples,
flammable-liquid worked example), cross-checked against slide 34 (the
course's own gasoline danger/risk exercise). Corroborated by practice Q4
(differentiate danger/risque with named DG examples).
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-019 — Exemple de marchandise interdite en toute circonstance (DGR 4.2)

**Sub-task:** 0.2.1 Développer un flair pour les marchandises dangereuses interdites
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Marchandises dangereuses interdites en toute
circonstance, DGR 4.2), lequel des éléments suivants est cité par le cours
comme exemple de marchandise strictement interdite au transport aérien,
quelle que soit la voie d'acheminement (passagers, quantité limitée, ou
avion-cargo uniquement) ?

**Options:**
- **(Correct)** L'acétylène liquéfié (Acetylene, liquefied).
- Le dioxyde de carbone solide (glace carbonique).
- Les batteries au lithium-ion emballées avec un équipement (UN 3481,
  Classe 9).
- Le White Spirit, solvant inflammable (UN 1261, Classe 3).

**Correct answer rationale:** The slide's own worked table (DGR 4.2,
directly viewed this session) lists two example rows, "Acetylene
(liquefied)" and "Acetylene silver nitrate," both marked "Forbidden" across
every applicability column shown (Passenger and Cargo Aircraft, Ltd Qty,
Cargo Aircraft Only) — the slide's own worked illustration of this
sub-task's own title concept.

**Distractor rationale (source-grounded — each is a genuine item named
elsewhere in this same function's material, at the opposite extreme):**
- "Le dioxyde de carbone solide" — named on slide 43 (DGR 2.5) as
  explicitly **exempted** from DG requirements entirely, the opposite of
  prohibited.
- "Les batteries au lithium-ion..." (UN 3481) — the exact shipment exam
  Q20's own NOTOC-completion capstone requires the candidate to accept and
  document for carriage (Class 9, forward hold position 12A) — accepted
  under conditions, not prohibited (see Q-7.8-002).
- "Le White Spirit..." (UN 1261) — one of the four DG items actually
  carried aboard the flight in practice Q30's own worked NOTOC scenario
  (see Q-7.8-003) — carried, not prohibited.

**Source basis:** Tier B — KOST Function 7.8 course, slide 37 (DGR 4.2
prohibited-in-all-circumstances table, viewed directly as a 200dpi PNG
render this session since the table is image-based and does not survive
plain-text extraction), cross-checked against slide 38–39 (DGR
1.2.5/1.2.6/1.2.7 dérogation/approbation/exception categories, the
surrounding regulatory context). Practice Q6 poses a related "which of five
items is prohibited in all circumstances" question (ID 8001, installed
lithium batteries, aluminium dross, UN 2626, diethylene glycol dinitrate)
but carries no marked key and none of its five options matches either of
slide 37's own two worked examples exactly — not used as this item's
evidentiary basis to avoid inferring an unconfirmed answer, noted honestly
as a related-but-unused instrument.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-020 — Exemple de divergence d'État (DGR 2.8.1)

**Sub-task:** 0.3.3 Reconnaître l'impact des divergences des États et des exploitants
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Divergences d'États et d'Exploitant DGR
2.8), quel exemple de **divergence d'État** (par opposition à une
divergence d'exploitant) est cité par le cours ?

**Options:**
- **(Correct)** ITG : Italie (codes ITG-01, ITG-02, ITG-03, etc.).
- AH : Air Algérie (codes AH-01, AH-02).
- OACI (Instructions techniques).
- DZ : Algérie (codes DZ-01, DZ-02).

**Correct answer rationale:** Slide 60 ("Divergence d'Etat DGR 2.8.1"):
"Exemple: ITG: ITALIE -ITG-01, ITG-02, ITG-03, etc."

**Distractor rationale:**
- "AH: Air Algérie" — a genuine course example, but explicitly the
  **Divergence de l'Exploitant** example (slide 61, DGR 2.8.3), not a
  divergence d'État — a direct category-swap distractor.
- "OACI (Instructions techniques)" — named on the same course's own
  "niveaux de restrictions" hierarchy diagram (slide 62) as the base
  international regulatory layer itself, not an example of a State-level
  divergence from it.
- "DZ: Algérie" — flagged explicitly as a **fabricated, unfounded**
  option: the course names only Italy (ITG) as its own worked État
  divergence example; no Algeria-specific État divergence code appears
  anywhere in the 119-slide course.

**Source basis:** Tier B — KOST Function 7.8 course, slides 58–62
(Divergences d'États et d'Exploitant DGR 2.8, État/Exploitant examples,
niveaux-de-restrictions diagram). No exam/practice-book reinforcement
exists for this sub-task — independently re-confirmed this session (`grep
-i "divergence"` against the extracted exam and practice-book text returns
zero hits in both), the same "taught but, for the first time in this
program, entirely untested" finding already recorded in Stage 1.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-021 — Groupe d'emballage correspondant aux matières très dangereuses (DGR 3.0.3)

**Sub-task:** 0.4.2 Comprendre les principes généraux des groupes d'emballage
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Groupes d'emballage DGR 3.0.3), quel groupe
d'emballage correspond aux matières **très dangereuses** ?

**Options:**
- **(Correct)** Groupe d'emballage I.
- Groupe d'emballage II.
- Groupe d'emballage III.
- Il n'existe pas de groupe d'emballage dédié au degré de danger ; celui-ci
  est indiqué uniquement par la classe.

**Correct answer rationale:** Slide 65's own three-row table: "Groupe
d'emballage I – Matières très dangereuses[;] Groupe d'emballage II –
Matières moyennement dangereuses[;] Groupe d'emballage III – Matières
faiblement dangereuses."

**Distractor rationale (source-grounded — each names the same table's own,
differently-tiered row):**
- Groupe II — the same table's own "moyennement dangereuses" row.
- Groupe III — the same table's own "faiblement dangereuses" row.
- "Il n'existe pas..." — directly contradicts the table itself, which
  exists specifically to tie packing-group numbers to degree-of-danger
  tiers.

**Source basis:** Tier B — KOST Function 7.8 course, slide 65 (DGR 3.0.3,
PG I/II/III table), cross-checked against slide 66 (exercise: which class
covers infectious substances — a related but distinct fact, not this
item's own basis). Corroborated by exam Q10 (list packing groups for
high/medium/low danger degrees — same table, inverse framing) and practice
Q17 (which packing group is used for weakly-dangerous materials).
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-022 — Signification de la lettre « Y » dans un marquage d'emballage à spécification ONU

**Sub-task:** 0.5.1 Reconnaître les prescriptions de base concernant le marquage
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Marquage des emballages à spécifications),
dans le marquage d'emballage « 4G/Y30/S/13/CH/2176/CG », que signifie la
lettre « Y » ?

**Options:**
- **(Correct)** Le groupe d'emballage II (X = groupe I, Y = groupe II, Z =
  groupe III).
- Le code de l'emballage (caisse en carton).
- L'année de fabrication de l'emballage.
- L'État d'origine de l'emballage.

**Correct answer rationale:** Slide 86, verbatim: "4G = Code de l'emballage
(4G = caisse en carton)[;] Y= Groupe d'emballage (X=groupe I -Y=groupe II
et Z =groupe III)[;] 30 = Masse brut maximal autorisée...[;] S = indique
que l'emballage est fait pour contenir des solides...[;] 13 = Année de
fabrication de l'emballage (2013)[;] CH = Etat d'origine de l'emballage
(Suisse)."

**Distractor rationale (source-grounded — each names the same slide's own,
different marking element):**
- "Le code de l'emballage" — that is what "4G" itself signifies on the
  same slide, not "Y".
- "L'année de fabrication" — that is what "13" signifies on the same slide
  (2013), not "Y".
- "L'État d'origine de l'emballage" — that is what "CH" signifies on the
  same slide (Suisse), not "Y".

**Source basis:** Tier B — KOST Function 7.8 course, slide 86 (full UN-mark
breakdown), cross-checked against slide 85 (visible/lisible/durable
marking criteria) and slide 88 (DGR 6.0.3.1/6.0.3.2 packaging-type/material
codes). Corroborated by exam Q14 (circled letter on package photo) and
practice Q25/Q26 (full UN-spec marking exercise, packaging-symbol meaning).
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-023 — La NOTOC n'est pas requise pour un envoi en quantités exceptées (DGR 2.6)

**Sub-task:** 0.5.3 Déterminer les documents exigés
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Quantités exceptées DGR 2.6),
pour un envoi de marchandises dangereuses en quantités **exceptées**, la
NOTOC est requise.

**Correct answer:** Faux.

**Rationale:** Slide 68, verbatim: "La déclaration de l'expéditeur n'est
pas requise[;] La NOTOC n'est pas requise[;] La LTA doit inclure la mention
« Dangerous goods in excepted quantities » et le nombre de colis[;] La
liste de contrôle d'acceptation n'est pas requise." Direct, complete match
— the opposite of the stem's claim.

**Corroboration (internal course consistency, strengthening confidence in
this Tier B fact):** Slide 70 (Quantités limitées DGR 2.7) states the
explicit contrast for the *other* small-quantity category: "La NOTOC est
requis" — showing the course itself draws this exact exceptées/limitées
distinction in two independently-worded slides, not a one-off statement.
Slide 104's own NOTOC-exemptions list (see Q-7.8-024 below) independently
names "les marchandises dangereuses en quantités exceptées" as one of the
situations for which "La « NOTOC » n'est pas exigée" — a third,
independent restatement of the same fact.

**Source basis:** Tier B — KOST Function 7.8 course, slide 68 (DGR 2.6
documentation requirements for excepted quantities), cross-checked against
slide 67 (DGR 2.6 definition/classification/identification), slide 70
(DGR 2.7 limited-quantities contrast), and slide 104 (NOTOC exemptions
list). Exam Q12 is topic-adjacent only (glossary recall — net quantity,
solid carbon dioxide — not a "which documents are required" question).
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-024 — Situation pour laquelle la NOTOC n'est PAS exigée

**Sub-task:** 6.2.2 Interpréter la NOTOC
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Notification des pilotes — exemptions), pour
laquelle des situations suivantes la NOTOC n'est-elle **PAS** exigée ?

**Options:**
- **(Correct)** Les marchandises dangereuses en quantités exceptées (DGR
  2.6).
- Les marchandises dangereuses en quantités limitées (DGR 2.7).
- Les batteries au lithium-ion emballées avec un équipement, Classe 9
  (comme dans l'exercice de complétion de la NOTOC de l'examen, Question
  20).
- Les marchandises dangereuses classiques nécessitant une déclaration de
  l'expéditeur (DGD).

**Correct answer rationale:** Slide 104, verbatim opening list: "La
« NOTOC » n'est pas exigée pour: les marchandises dangereuses en quantités
exceptées[;] les colis de matières radioactives en quantités exceptées[;]
Les masses magnétisées[;] Les OGM[;] Les Matières biologiques, catégories
B[;] Les marchandises dangereuses du tableau 9.5.A."

**Distractor rationale (source-grounded — each is the genuine opposite
case, drawn from elsewhere in this same NOTOC section or from a Batch 1
item's own established fact):**
- "Quantités limitées" — the course explicitly states the opposite for
  this category (slide 70: "La NOTOC est requis") — a direct
  category-swap distractor.
- "Les batteries au lithium-ion..." — precisely the shipment exam Q20's own
  NOTOC-completion capstone requires a full NOTOC to be filled in for
  (already established in Q-7.8-002) — the opposite of an exemption.
- "Les marchandises dangereuses classiques... DGD" — the general case the
  NOTOC's own required-field enumeration (slides 99–100, tested in
  Q-7.8-001) is built around — the default NOTOC-requiring case, not an
  exemption.

**Source basis:** Tier B — KOST Function 7.8 course, slide 104 (NOTOC
exemptions list), cross-checked against slide 68 (excepted-quantities
documentation rules, corroborating "La NOTOC n'est pas requise") and slide
70 (limited-quantities rule, the contrasting "La NOTOC est requis"). No
direct exam/practice hit naming this specific exemptions list.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-025 — Qui fournit les renseignements NOTOC au commandant de bord

**Sub-task:** 6.2.2 Interpréter la NOTOC
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Notification des pilotes — Quand ? Qui ?
Quoi ?), qui est chargé de fournir au commandant de bord les
renseignements écrits ou imprimés précis sur les marchandises dangereuses
transportées en fret (NOTOC) ?

**Options:**
- **(Correct)** L'exploitant ou son assistant.
- Le commandant de bord lui-même.
- L'expéditeur de la marchandise dangereuse.
- Les services de la circulation aérienne.

**Correct answer rationale:** Slide 101, verbatim: "Quand? : Avant le
départ[;] Qui? : L'exploitant ou son assistant[;] Quoi? Renseignements
écrits ou imprimés précis sur les marchandises dangereuses à transporter en
fret."

**Distractor rationale (source-grounded):**
- "Le commandant de bord lui-même" — contradicts the course's own framing
  throughout this entire section (slides 97–98, 101): the captain is
  consistently the **recipient** of this information ("le commandant de
  bord soit informé"), never its provider.
- "L'expéditeur..." — the shipper's own 9-item responsibility wheel (slide
  54, DGR 1.3: Transport autorisé, Identification, Classification,
  Emballage, Marquage, Étiquetage, Déclaration, Conservation des
  documents, Formation) does not include NOTOC provision anywhere.
- "Les services de la circulation aérienne" — never named anywhere in this
  function's 119-slide course as a NOTOC-related party — independently
  reconfirmed absent this session (`grep -i "circulation aérienne"`
  returns zero hits), the identical finding already documented for leaf
  6.2.4 in Batch 1 (Q-7.8-006).

**Source basis:** Tier B — KOST Function 7.8 course, slide 101, cross-checked
against slides 97–98 (captain as the information's recipient, not its
source) and slide 54 (shipper's wheel, no NOTOC item). No direct
exam/practice hit naming this specific "who provides" fact.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-026 — Transport d'allumettes de sûreté ou d'un petit briquet par un passager (Tableau 2.3.A)

**Sub-task:** 0.2.3 Être au courant des dispositions s'appliquant aux passagers
**Type:** MCQ, single-answer

**Stem (FR):** Selon l'examen (Question 9) et le Tableau 2.3.A
(Dispositions pour les marchandises dangereuses transportées par les
passagers ou les membres d'équipage), comment le transport d'allumettes de
sûreté (une petite boîte) ou d'un petit briquet, sans liquide non absorbé
autre que du gaz liquéfié, est-il autorisé pour le passager qui les
utilisera lui-même ?

**Options:**
- **(Correct)** Sur la personne uniquement.
- En bagage à main (cabine) uniquement.
- En bagage enregistré (soute) uniquement.
- En cabine ou en soute, au choix du passager.

**Correct answer rationale:** Table 2.3.A's own row for this exact item
(read directly this session from the supplied
`11_IATA_DGR_Table_2.3A_Passengers_Crew_FR_2023.pdf`) reads: "Allumettes de
sûreté (une petite boîte) ou petit briquet qui ne contient pas de liquide
non absorbé, autre que du gaz liquéfié, qui sera utilisé par la personne
qui le transporte..." with the row's own explicit, distinctively-placed
"SUR LA PERSONNE" callout — the only affirmative-carriage marker in the
row; neither a cabin-baggage nor a checked-baggage affirmative marker
appears anywhere in that same row (both show "NON"). This matches exam
Q9's own three-option structure ("a) En cabine b) En soute c) Sur la
personne") exactly, with (c) being the only option the table's own row
text affirmatively supports.

**Distractor rationale (source-grounded — each is one of exam Q9's own
listed wrong options, directly contradicted by the same table row):**
- "En bagage à main (cabine) uniquement" — exam Q9's own option (a); the
  table row carries no affirmative cabin-baggage marker.
- "En bagage enregistré (soute) uniquement" — exam Q9's own option (b);
  same reasoning, no affirmative checked-baggage marker in this row.
- "En cabine ou en soute, au choix du passager" — contradicts the row's
  own single, distinctive "SUR LA PERSONNE" callout, which would be
  redundant if general cabin/hold carriage were also permitted.

**Source basis:** Tier B — exam Q9 (F-KOST 05), cross-checked directly this
session against the supplied Table 2.3.A document's own row for this exact
item (a supporting source already listed among this function's own source
artifacts in Stage 1, not newly introduced). This item deliberately reports
only the row's own distinctive "SUR LA PERSONNE" callout and the two "NON"
markers, not a full column-by-column reading of Table 2.3.A's own four-
column header (whose exact column order is not confidently recoverable
from this session's plain-text extraction of a rotated table header) — no
claim is made here beyond what the row's own text directly supports.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-027 — Signification du symbole « * » dans la Liste des marchandises dangereuses (DGR 4.2)

**Sub-task:** 0.4.1 Trouver de l'information générale sur les classes et les divisions
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Liste des marchandises dangereuses DGR 4.2 —
Symboles), que signifie le symbole « * » apposé à côté d'une désignation
exacte d'expédition dans la Liste des marchandises dangereuses ?

**Options:**
- **(Correct)** Un ou des noms techniques sont requis (voir 4.1.2.1(d)).
- Des informations supplémentaires figurent à l'annexe A.
- La marchandise dangereuse est interdite au transport aérien en toute
  circonstance.
- La marchandise nécessite un complément à la Déclaration de l'expéditeur
  (DGD) en quantité exceptée.

**Correct answer rationale:** Slide 73, verbatim: "«*» -Nom(s)
technique(s) requis. Voir 4.1.2.1(d)."

**Distractor rationale (source-grounded):**
- "Des informations supplémentaires figurent à l'annexe A" — the same
  slide's own stated meaning of the **different** symbol "†", not "*" — a
  direct swapped-symbol distractor.
- "...interdite... en toute circonstance" — not stated anywhere on slide
  73; this function's own dedicated "interdit en toute circonstance"
  content (DGR 4.2's own separate prohibited-items table, tested in
  Q-7.8-019) uses no "*"/"†" symbol system at all.
- "...complément... DGD... quantité exceptée" — invented; the course's own
  excepted-quantities content (slides 67–68) uses a distinct E0–E5
  alphanumeric coding system (Tableau 2.6.A, column F), not the "*"/"†"
  symbols.

**Source basis:** Tier B — KOST Function 7.8 course, slide 73 (DGR 4.2
symbol key), cross-checked against slide 74 (bold vs. non-bold PSN
wording convention) and slide 67 (the genuinely distinct E0–E5 excepted-
quantities coding system, the source of the fourth distractor). No direct
exam/practice hit for this specific symbol-meaning fact; exam Q3/Q5/Q11 and
practice Q12/Q13/Q18/Q19 test adjacent but distinct facts from the same
general DGR 4.2 area.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-028 — Forme des étiquettes de danger DGR

**Sub-task:** 0.5.2 Reconnaître les prescriptions de base concernant l'étiquetage
**Type:** MCQ, single-answer

**Stem (FR):** Selon l'examen (Question 15) et le practice book (Question
20), quelle est la forme des étiquettes de danger DGR ?

**Options:**
- **(Correct)** Losange (carré posé sur la pointe).
- Carrée.
- Ronde.
- Rectangulaire.

**Correct answer rationale:** Confirmed by direct visual inspection this
session of the KOST label reference sheet
(`05_IATA_DGR_Danger_and_Handling_Labels_FR.pdf`, a supporting source
already listed among this function's own source artifacts in Stage 1,
rendered to a 150dpi PNG since label shape does not survive plain-text
extraction): every one of the danger labels shown for Classes 1 through 9
(including all Class 1 divisions, 1.1–1.6/B/D/E/F/G/N/S) is rendered as a
diamond/losange shape — none square, round, or any other shape.

**Distractor rationale (source-grounded — each is exam Q15's/practice
Q20's own listed wrong option, directly contradicted by the label
reference sheet):**
- "Carrée" — exam Q15's/practice Q20's own option (a).
- "Ronde" — exam Q15's/practice Q20's own option (b).
- "Rectangulaire" — one of practice Q24's own listed shape options (for
  the separate handling-label-shape question, not the danger-label
  question this item tests); included as a plausible-sounding option
  drawn from the same instrument's adjacent question — this item makes no
  claim about handling labels' own actual shape, which it does not test.

**Source basis:** Tier B — exam Q15, practice Q20 (both, identical
question, no marked key in either extracted PDF), resolved by direct visual
inspection of the supplied KOST label reference sheet this session (Tier
B — a KOST/IATA-supplied course document, not the current 67th Edition
Bookshelf text). Cross-checked against course slide 81 (the two-type
danger/handling-label structure already tested in Q-7.8-009).
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-029 — Responsabilité de « l'identification » des marchandises dangereuses

**Sub-task:** 0.3.1 Clarifier le rôle individuel et collectif des parties prenantes dans la chaîne d'approvisionnement
**Type:** MCQ, single-answer

**Stem (FR):** Selon l'examen (Question 4, matrice des responsabilités) et
les roues de responsabilités du cours (DGR 1.3 / DGR 1.4), à qui incombe la
responsabilité de « l'identification » des marchandises dangereuses ?

**Options:**
- **(Correct)** L'expéditeur.
- L'exploitant.
- L'agent des opérations aériennes personnellement, indépendamment de
  l'expéditeur ou de l'exploitant.
- Les deux, à parts égales.

**Correct answer rationale:** Slide 54 ("Responsabilités Expéditeur DGR
1.3") lists "2-Identification" explicitly as one of the shipper's own
9-item wheel (Transport autorisé, Identification, Classification,
Emballage, Marquage, Étiquetage, Déclaration, Conservation des documents,
Formation). Slide 55 ("Responsabilités Exploitant DGR 1.4"), the operator's
own separate 8-item wheel (Acceptation, Chargement, Entreposage,
inspection, Renseignement -en cas d'urgence-, Compte rendu, Conservation
documents, Formation), does not include "identification" anywhere on its
own list.

**Distractor rationale (source-grounded — each contradicts the course's own
two dedicated wheel diagrams):**
- "L'exploitant" — the wrong wheel per the course's own two diagrams;
  "identification" is absent from the exploitant's own 8-item list.
- "L'agent des opérations aériennes personnellement... indépendamment" — a
  fabricated third-party framing; the course's own two wheels name only
  "Expéditeur" and "Exploitant" as role categories, never a third
  independent one.
- "Les deux, à parts égales" — contradicts the course's own two distinct,
  non-overlapping wheels, each of which assigns "identification" to only
  one of the two named roles.

**Source basis:** Tier B — exam Q4 (F-KOST 05, the responsibility matrix
Acceptation/Identification/Chargement/Rédaction de la NOTOC, Expéditeur vs.
Exploitant columns, no marked key), resolved by direct cross-reference
against the course's own two role-wheel diagrams (slides 54–55), the same
method already used for Q-7.8-013 (practice Q10). This item deliberately
tests "Identification" rather than "Rédaction de la NOTOC" (already the
basis of Q-7.8-013's own fact) to avoid duplicating that item's underlying
evidence.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-030 — Obligation de l'exploitant avant de poursuivre le chargement d'un bagage/fret contaminé

**Sub-task:** 6.2.1 S'occuper des marchandises dangereuses non permises dans les bagages
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Fret ou bagages contaminés),
si une contamination d'un bagage ou d'un fret non déclaré comme contenant
des marchandises dangereuses est constatée, et qu'un soupçon existe que des
marchandises dangereuses peuvent en être la cause, l'exploitant doit
prendre les mesures nécessaires pour lever le doute **avant** de poursuivre
le chargement du bagage ou du fret concerné.

**Correct answer:** Vrai.

**Rationale:** Slide 110, verbatim: "Obligation de l'exploitant: Si
constatation de contamination de bagage ou fret non déclaré comme
contenant des marchandises dangereuses et soupçon que des marchandises
dangereuses peuvent être la cause de la contamination, Mesures nécessaires
pour lever le doute avant de poursuivre le chargement du bagage ou du fret
contaminé." Direct, complete match.

**Compliance note (binding caveat 5):** This item tests the pre-loading
contaminated-baggage **decision procedure** itself (slide 110) — genuinely
distinct from Q-7.8-004's own **reporting-obligation actor** fact (slides
111–112, practice Q29: who must file a report once undeclared DG is
confirmed), drawn from the same restricted slide pool but testing a
different specific fact. It does not fabricate an in-flight, real-time
"dealing with" procedure the course does not contain. Drawing both items
exhausts leaf 6.2.1's own small ceiling (2) exactly, per the sub-task
selection notes above.

**Source basis:** Tier B — KOST Function 7.8 course, slide 110, cross-checked
against slide 111 (the follow-on obligation once contamination is
confirmed as DG-related: "l'exploitant doit prendre des mesures appropriées
pour écarter tout risque identifié avant que le transport... puisse se
poursuivre") and slide 112 (the reporting-obligation content already used
as Q-7.8-004's own basis, deliberately not re-tested here).
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-031 — Première mesure en cas de contact du produit avec le corps ou les vêtements

**Sub-task:** 6.2.3 Appliquer les procédures en cas d'urgence
**Type:** MCQ, single-answer

**Stem (FR):** Mise en situation : le produit d'une marchandise dangereuse
endommagée entre en contact avec le corps ou les vêtements d'un agent au
sol. Selon les procédures générales du cours, quelle doit être la
**première** mesure à prendre ?

**Options:**
- **(Correct)** Laver le corps avec beaucoup d'eau.
- Enlever les vêtements contaminés.
- Appeler un médecin.
- Rester sur place jusqu'à ce que l'identité soit notée.

**Correct answer rationale:** Slide 109 lists the sequence explicitly and
in order under "5 – Si le produit entre contact avec le corps ou les
habits:" "Laver le corps avec beaucoup d'eau[;] Enlever les vêtements
contaminés[;] Ne pas boire ni manger, ni fumer[;] Ne pas toucher les
yeux[;] Ne pas toucher la bouche et le nez avec les mains[;] Appeler un
médecin[;] Les personnes impliquées et les témoins doivent rester sur
place jusqu'à ce que leur identité soit notée." Washing with water is
listed first.

**Distractor rationale (source-grounded — each of the three wrong-to-select
options is a genuine step from the same list, but out of order):**
- "Enlever les vêtements contaminés" — the slide's own second-listed
  action.
- "Appeler un médecin" — listed near the end of the same sequence, not
  first.
- "Rester sur place jusqu'à ce que l'identité soit notée" — the slide's own
  concluding instruction (for involved persons/witnesses), not the first
  action for the affected person.

**Compliance note (binding caveat 4):** This item tests applied execution
of a specific procedure step within a scenario genuinely distinct from
Q-7.8-005's own scenario (damaged/leaking package, slide 108, "5 – Aviser
immédiatement votre supérieur..." 4-step sequence) — this item uses the
separate body/clothing-contact sequence (slide 109) — the same
higher-qualification, applied-execution depth 6.2.3 requires, not a
restatement of Q-7.8-005's own 4-step list at a different framing.

**Source basis:** Tier B — KOST Function 7.8 course, slide 109, shared
evidence base with 0.6.1 per Stage 1/2A (see Q-7.8-032 below, which draws
on the same p.106–111 pool at the generic-awareness level instead).
Corroborated at a topic level by exam Q13 ("Prévenir son supérieur et
suivre les recommandations du Red book de l'OACI" — already the primary
basis for Q-7.8-005, topic-adjacent here only).
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.8-032 — Sensibilisation : deux séquences de procédure générale distinctes selon le type d'incident

**Sub-task:** 0.6.1 Créer une sensibilisation aux procédures d'urgence générales
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Procédures générales), le
cours présente deux séquences de procédure générale **distinctes** selon la
nature de l'incident — l'une pour un colis endommagé ou qui fuit, l'autre
pour un contact du produit avec le corps ou les vêtements.

**Correct answer:** Vrai.

**Rationale:** Slide 108 presents a distinct 4-step sequence specifically
for a damaged/leaking package ("1 – Aviser immédiatement votre
supérieur... 4 - Eviter le contact avec le contenu du colis"), and slide
109 presents a separate, structurally distinct sequence specifically for
body/clothing contact ("Laver le corps avec beaucoup d'eau... Appeler un
médecin... Les personnes impliquées et les témoins doivent rester sur
place..."). The course does structure its emergency-response content as
two distinct, scenario-specific sequences.

**Compliance note (binding caveat 4):** This item tests only the general,
generic-awareness fact that the course's emergency-response content is
organized into two distinct scenario-specific sequences — it does **not**
test correctly ordering or applying either sequence's own individual
steps, which is 6.2.3's own higher-qualification territory (already tested
by Q-7.8-005 and Q-7.8-031, both drawn from this identical shared evidence
pool at the applied-execution depth). This is the distinct, non-duplicate
framing Batch 1 flagged as available for a future batch when it left 0.6.1
undrafted "to avoid two items that would otherwise paraphrase the same
four-step list at only slightly different framings" — this item does not
paraphrase either specific list, testing only the higher-level fact that
two separate lists exist.

**Source basis:** Tier B — KOST Function 7.8 course, slides 108–109, shared
evidence base with 6.2.3 per Stage 1/2A (see Q-7.8-005, Q-7.8-031).
Corroborated at a topic level by exam Q13 (shared cross-reference for this
entire p.106–111 pool, as already noted for 0.6.1/6.2.3 in Stage 1).
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Summary table — Batch 2

| ID | Sub-task | FR status | Type | Current source basis (Tier) | EN status | Approval |
|---|---|---|---|---|---|---|
| Q-7.8-016 | 0.1.2 Organisme SCoETDG (cadre juridique) | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.8 course slides 19–23 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-017 | 0.1.3 Champ d'application DGR 1.2.1 | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.8 course slide 30 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-018 | 0.1.4 Définition du Risque | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.8 course slides 31–33 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-019 | 0.2.1 Exemple interdit en toute circonstance | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.8 course slide 37 (DGR 4.2 table) | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-020 | 0.3.3 Exemple de divergence d'État (ITG) | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.8 course slides 58–62 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-021 | 0.4.2 Groupe d'emballage I = très dangereuses | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.8 course slide 65 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-022 | 0.5.1 Lettre « Y » = groupe d'emballage II | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.8 course slide 86 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-023 | 0.5.3 NOTOC non requise — quantités exceptées | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | True/False | KOST F7.8 course slides 67–70, 104 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-024 | 6.2.2 Situation où la NOTOC n'est pas exigée | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.8 course slide 104 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-025 | 6.2.2 Qui fournit la NOTOC au commandant | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.8 course slide 101 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-026 | 0.2.3 Allumettes/briquet — sur la personne | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | Exam Q9; Table 2.3.A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-027 | 0.4.1 Symbole « * » = noms techniques requis | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.8 course slide 73 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-028 | 0.5.2 Forme des étiquettes de danger — losange | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | Exam Q15/practice Q20; label reference sheet | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-029 | 0.3.1 Responsabilité de l'identification | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | Exam Q4; course slides 54–55 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-030 | 6.2.1 Lever le doute avant chargement | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | True/False | KOST F7.8 course slide 110 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-031 | 6.2.3 Premier geste — contact corps/vêtements | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.8 course slide 109 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.8-032 | 0.6.1 Sensibilisation — deux séquences distinctes | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | True/False | KOST F7.8 course slides 108–109 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |

**Batch composition:** 14 MCQ + 3 True/False. Block spread: Block 0 = 13
items (leaves 0.1.2/0.1.3/0.1.4/0.2.1/0.2.3/0.3.1/0.3.3/0.4.1/0.4.2/0.5.1/0.5.2/0.5.3/0.6.1,
one item each), Block 6.2 = 4 items (leaves 6.2.1×1, 6.2.2×2, 6.2.3×1).

## What this batch does NOT do

- Does not exceed any per-leaf ceiling in
  `docs/DGR_STAGE2A_FUNCTION_7.8_BLUEPRINT.md` — see the ceiling-compliance
  table above; two leaves (0.1.3, 6.2.1) now sit at their full ceiling
  after this batch, all others remain strictly below ceiling. Several
  leaves are drawn above their recommended per-sitting "sample" but still
  below their bank-size "count" ceiling, explicitly justified above, per
  the same sample-vs-ceiling reading Batch 1 already established.
- Does not draft any item against leaf **0.3.2** despite the task brief's
  own inline summary describing it as "not a gap" — independently
  re-verified this session (fresh keyword search, unchanged 12
  "responsab*" hits, none passenger-related) that
  `docs/DGR_STAGE2A_FUNCTION_7.8_BLUEPRINT.md`'s own binding caveat 1 still
  applies in full; the discrepancy is recorded explicitly above rather than
  silently resolved either way, per `.claude/rules/dgr-stage2b.md` rules 1,
  7, and 9.
- Does not draft any item against leaf **6.2.5** — remains a confirmed full
  SOURCE GAP, count 0, no exception, unchanged from Batch 1.
- Does not draft any item against leaves **0.4.3** or **0.6.2** —
  restricted/thin pools (sample 0–1) deliberately left at 0 in Batch 1 "for
  a future batch"; this batch prioritized the task's own explicitly-named 8
  new leaves plus rounding out already-partially-drawn leaves instead, per
  the task's own instruction. Both remain available, real, minimal-ceiling
  (1 each) headroom for a future batch.
- Does not draft any item against the over-taught accident/incident/
  undeclared-DG reporting content (course pp.112–114, 116) as an unofficial
  Block-7-equivalent leaf — unchanged from Batch 1's own treatment, still
  explicitly excluded at 0 per blueprint binding caveat 6.
- Does not use practice Q27 ("Le commandant garde une copie du NOTOC
  pendant le vol et l'opérateur l'archive après — Vrai ou Faux ?") as a
  scored item this batch: the extracted practice-book PDF carries no marked
  key, and no other course passage (slide 55's "Conservation documents"
  wheel item is a generic duty label with no further detail; slide 103's
  own accessibility statement, already Q-7.8-006's basis, does not address
  captain in-flight custody or post-flight archiving) supplies enough
  detail to determine this specific claim's truth value without inferring
  regulatory content beyond what this function's own material states — left
  unresolved (SOURCE REQUIRED) rather than guessed, per rule 1.
- Does not use practice Q6's own five-option "which is prohibited in all
  circumstances" list, exam Q17's own five-item Table 2.3.A classification
  exercise (beyond the single allumettes/briquet row independently
  resolved for Q-7.8-026), or practice Q14's "acide Arsénique liquide"
  classification question as the basis for any item — each carries no
  marked key and, on this session's own check, no confident, non-inferred
  way to determine the intended correct answer from the supplied source
  material alone (Table 2.3.A's own multi-column rotated-header structure
  in particular could not be confidently column-mapped from this session's
  plain-text extraction) — left unresolved rather than guessed.
- Does not perform Tier A (current DGR 67th Ed./Addendum 1) verification
  for any of the 17 items — remains blocked on the owner's pending
  Bookshelf re-authentication, exactly as for Batch 1; no attempt was made
  this pass either, per this task's own explicit instruction.
- Does not mark any item `APPROVED` — no qualified reviewer exists in this
  pass.
- Does not touch Moodle or any live/production question-bank copy.
- Does not touch any other function's files (7.5, 7.10, or any other) in
  this shared working tree.
