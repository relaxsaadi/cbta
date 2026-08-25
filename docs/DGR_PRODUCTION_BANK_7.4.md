# DGR Stage 2B — Function 7.4 Production Bank (Batch 1)

**Function 7.4**: *Personnel chargé de manutentionner le fret dans un
entrepôt, de charger et décharger des unités de chargement (UC), et de
charger et décharger des compartiments de fret des aéronefs.*

First production batch drafted against
`docs/DGR_STAGE2A_FUNCTION_7.4_BLUEPRINT.md` (PROVISIONAL/CEILING,
111-question maximum across 37 sub-tasks). Function 7.4 has no prior pilot,
so numbering starts at `Q-7.4-001`, following the exact ID convention already
used for `Q-7.2-XXX` and `Q-7.3-XXX`.

## Status of this batch — read before using any item below

**All 16 items in this batch are `DRAFT`, Tier B basis only. None has been
Tier A-verified against the current IATA DGR 67th Edition (2026, French,
Addendum 1) text.**

- Per `.claude/rules/dgr-stage2b.md` and the readiness reporting already on
  record for Functions 7.1/7.2/7.3, the IATA Digital Publications Bookshelf
  session remains **blocked** — it requires the owner to manually
  re-authenticate with 2FA. Per standing instruction, no attempt was made to
  log in, and **no Tier A content was fabricated to compensate.** This entire
  batch is therefore Tier B only, exactly like Functions 7.1's, 7.2's, and
  7.3's Batch 1s — expected and correct, not a gap introduced by this pass.
- Every item below is sourced directly and verbatim-traced to the actual
  **KOST Function 7.4 training material** (Tier B), read this session
  (extracted with `pdftotext -layout`, page-split so every quote is tied to
  an exact printed slide number) from
  `/Users/mac/Documents/Fichiers/Algerie/CBTA final/yasmine cbta/wetransfer_supports-pedagogiques-dgr-cbta-kost-academy_2025-10-12_1842/COURS DGR-CBTA-IATA/DGR-FONCTION 7.4/`:
  - `03_KOST_DGR_CBTA_Course_Function_7.4_FR_2025.pdf` — course, **155 slides**
    (confirmed via `pdfinfo`), formatrice Yasmina Boufas, dated 02/09/2025.
    Primary source, cited below by printed slide number.
  - `01_KOST_DGR_CBTA_Exam_Function_7.4_FR_Rev00_2025.pdf.pdf` (F-KOST 05, 20Q,
    60 min, 80% pass mark) — corroborating cross-reference only, read in full
    this session, never copied as a question stem.
  - `04_KOST_DGR_CBTA_Practice_Book_Function_7.4_FR_2025.pdf` (F-KOST 09, 20Q)
    — **confirmed genuinely filed for Function 7.4** by Stage 1's MD5 check
    (unlike Function 7.3's folder, which had a real misfiling issue) —
    corroborating cross-reference only, read in full this session.
  - A handful of slide footers on image-heavy "classes des marchandises
    dangereuses" diagram slides (e.g. p.63, p.65) do not render a visible
    page number in the text layer — the same extraction quirk already noted
    for this deck in `docs/DGR_STAGE1_FUNCTION_7.4_DRAFT.md`. Where this
    occurs below, the page number is still the confirmed PDF page index
    (independently single-page-extracted and checked against the
    immediately preceding/following slides' own visible footers), not a
    guess.
- Every "DGR x.y.z" section number cited below is **as displayed on the KOST
  slide itself** — Tier B, not independently re-verified against the current
  67th Edition/Addendum 1 text in this pass. The course is explicitly built
  on the **66th Edition** (confirmed by its own "Base Réglementaire" slide,
  p.25, and by the standalone 66th Edition Addendum document sitting in this
  function's own source folder). Do not treat any section number below as
  confirmed-current.
- Per `.claude/rules/dgr-stage2b.md` rule 4, **no item in this batch may be
  marked `APPROVED`.** Status is `DRAFT` only.
- Next session should re-attempt the Bookshelf technique once the owner has
  re-authenticated, to move these 16 items from `DRAFT` toward
  `FR SOURCE VERIFIED` / `FR SOURCE GAP CONFIRMED`.

## Sub-task selection and ceiling compliance

This batch drafts **16 items**, inside the task's 12–16 target range and
below the 111-question provisional ceiling — per the task's own instruction
and the blueprint's own framing ("a ceiling to draft *up to*, not a quota
that must be filled"). Selection deliberately follows the blueprint's own
"Recommended next steps" order (Block 0 first, then Block 7, then Blocks 4
and 6 together) and picks each block's **richest, best-evidenced leaves
first** — the two "Very strong" leaves (0.4.1 and 4.1.2) and the two other
richest leaves in Blocks 4/6 (4.2.3's stowage material and 6.1.5's NOTOC
material, both "Strong"/"Very strong") are each drawn at their full sample
ceiling (2 items), while every other leaf drawn is taken at 1 item, at or
below its own sample.

| Sub-task | Title | Blueprint ceiling / sample | Drawn this batch | New item |
|---|---|---|---|---|
| 0.1.1 | Comprendre la définition | 3 / 1 | 1 | Q-7.4-001 |
| 0.1.2 | Reconnaître le cadre juridique | 4 / 1 | 1 | Q-7.4-002 |
| 0.2.3 | Être au courant des dispositions s'appliquant aux passagers | 4 / 1 | 1 | Q-7.4-003 |
| 0.4.1 | Trouver de l'information générale sur les classes et les divisions | 8 / 2 | 2 | Q-7.4-004, Q-7.4-005 |
| 0.5.2 | Reconnaître les prescriptions de base concernant l'étiquetage | 4 / 1 | 1 | Q-7.4-006 |
| 4.1.1 | Déterminer les conditions d'entreposage | 4 / 1 | 1 | Q-7.4-007 |
| 4.1.2 | Déterminer les restrictions de tri et de séparation | 8 / 2 | 2 | Q-7.4-008, Q-7.4-009 |
| 4.2.3 | Appliquer les prescriptions de rangement | 5 / 1 | 1 | Q-7.4-010 |
| 6.1.4 | Appliquer les prescriptions de rangement (stade chargement) | 8 / 2 | 1 | Q-7.4-011 |
| 6.1.5 | Vérifier que la NOTOC reflète la cargaison de l'aéronef | 6 / 2 | 2 | Q-7.4-012, Q-7.4-013 |
| 7.1 + 7.2 (combined pool) | Signaler les accidents / incidents de MD | 3 / 1 | 1 | Q-7.4-014 |
| 7.3 | Signaler les MD non déclarées ou mal déclarées | 3 / 1 | 1 | Q-7.4-015 |
| 7.4 | Signaler les situations mettant en cause des MD | 3 / 1 | 1 | Q-7.4-016 |
| **Total** | | | **16** | |

**Block spread:** Block 0 = 6 items (5 distinct leaves), Block 4 = 4 items
(3 distinct leaves), Block 6 = 3 items (2 distinct leaves), Block 7 = 3 items
(3 pools, 7.1+7.2 dual-tagged per binding caveat 5) — 16 items total, a
reasonable cross-section of all four active blocks, weighted toward Blocks
0/4's richest pools per this batch's own "richest leaves first" instruction.

**No per-sub-task ceiling is exceeded.** 0.4.1, 4.1.2, and 6.1.5 are each
drawn at their full sample figure (2); every other sub-task drawn is at 1,
at or below its own sample.

**Deliberately not drafted this batch, and why:**

- **4.2.5, 6.1.1, 6.3.4 — confirmed `SOURCE GAP`, count = 0 for all three,
  per blueprint binding caveat 1.** No item was drafted against any of these
  three "transporter le fret [...] jusqu'à/à l'aéronef/l'entrepôt/l'aérogare"
  leaves. No new evidence was found this session to change that status.
- **6.1.6 (partial coverage — captain-notification half only, sample 0–1,
  binding caveat 2) — left at 0 this batch.** Real, restricted-framing
  evidence exists (the captain-notification obligation via the same
  p.135–141 NOTOC slides already drawn on for 6.1.5), but this batch
  prioritized the richer, unrestricted 6.1.5 pool first per the "richest
  leaves first" instruction; 6.1.6's own single permitted item (which must
  never test informing "l'agent des opérations aériennes" or "le régulateur
  de vols" — that half stays an open `SOURCE GAP`) is left for a future
  batch rather than rushed in alongside 6.1.5 in this one.
- **0.4.3 (thin/adjacent evidence, sample 0–1, binding caveat 3) — left at 0
  this batch**, for the same reason as 6.1.6: real but thin, restricted-
  framing-only evidence exists (two operational-context passing mentions,
  p.106/p.137), but the richer 0.4.1/0.4.2-adjacent pools were prioritized
  first. Any future item from this pool must test only the operational-stage
  awareness fact (stowage/separation rules apply to every hazard label on a
  package, primary or subsidiary) — never a classification-stage
  "determine which hazard is primary" procedure, which this course does not
  teach.
- **4.2.1, 4.2.2, 6.1.2, 6.1.3, 6.3.2, 6.3.3 — the six caveat-4
  shared-evidence-pool leaves — deliberately deferred as a group, not drawn
  piecemeal.** Per blueprint binding caveat 4, each of these six leaves
  shares its underlying slide pool with two or three sibling leaves at other
  lifecycle stages (hidden-DG verification: 0.2.1+4.2.1+6.1.2+6.3.2;
  damage/leak verification: 4.2.2+6.1.3+6.3.3), and every item drawn from
  them must demonstrably test its own distinct lifecycle-stage checkpoint
  (warehouse pre-load / aircraft loading / aircraft unloading), not restate
  the same fact with only the stage name changed. That discipline deserves
  its own careful, dedicated batch — drafting one or two of these six now
  and leaving the rest for later would risk exactly the kind of
  same-fact-repeated drift the caveat warns against. 0.2.1 itself (their
  Block 0 anchor leaf) is likewise left for that same future batch, for
  consistency.
- **4.2.4 (ULD labelling, ceiling 3, sample 1) and 6.3.1 (unloading
  instructions, ceiling 2, sample 1)** — both have real, usable evidence
  (DGR 9.3.8.2 red-hatched-border label p.112–114; unloading-inspection
  slide p.102) but were not among this batch's richest picks; left for a
  future batch.
- **The remaining 10 of Block 0's 16 leaves** (0.1.3, 0.1.4, 0.2.1, 0.2.2,
  0.3.1, 0.3.3, 0.4.2, 0.5.1, 0.6.1, 0.6.2) were not drafted this batch —
  left for a future batch. **0.6.2 in particular should stay minimal even
  then**: per blueprint binding caveat 7, it is generic-awareness-only
  evidence (an employer procedure/information must exist and be available to
  the commandant de bord; no specific procedure content is taught).

## Method notes on distractor sourcing (rule 6 compliance)

Every distractor below is grounded in something actually read this session:
either (a) a different, correctly-stated fact from elsewhere in the same
KOST Function 7.4 course, repurposed here as a wrong answer to *this*
question (a "swapped-fact" or "wrong-checkpoint" distractor), or (b) a direct
contradiction of a specific clause in the same source passage the correct
answer comes from (a "parsing" distractor — the same sentence read
incorrectly). No distractor asserts an invented regulatory fact, an invented
numeric threshold, or a fact sourced from a different function's course
material. Where a distractor's wrongness rests on a fact drawn from a
different slide, that slide is cited so the wrongness is traceable.

---

## Q-7.4-001 — Accident historique associé aux générateurs d'oxygène chimiques

**Sub-task:** 0.1.1 Comprendre la définition
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Généralités — « Pourquoi Réglementer ? »), à
quel accident historique le cours associe-t-il la découverte de générateurs
d'oxygène chimiques non déclarés dans le compartiment cargo d'un avion, un
événement ayant causé 110 morts ?

**Options:**
- **(Correct)** ValuJet, Everglades, 11 mai 1996.
- Saudi Arabian Airlines, Riyadh, 19 août 1980 (réchaud de camping dans les
  bagages, 301 morts).
- Pan Am, Boston, 3 novembre 1973 (acide nitrique, 3 membres d'équipage).
- UPS B-747, Dubaï, 3 septembre 2010 (2 membres d'équipage).

**Correct answer rationale:** Slide 18 ("Pourquoi Réglementer?"): "ValuJet,
Everglades, 11 Mai 1996, Générateurs d'oxygène - 110 morts."

**Distractor rationale (source-grounded — each is a different accident
named on the same slide, with its own distinct cause and toll):**
- Saudi Arabian Airlines Riyadh 1980 — same slide: "Réchaud de camping dans
  les bagages – 301 morts," a different cause (camping stove) and toll.
- Pan Am Boston 1973 — same slide: "Acide nitrique - 3 membres d'équipage
  périssent," a different cause and toll.
- UPS B-747 Dubaï 2010 — same slide: "02 membres d'équipage ont perdu la
  vie," a different accident with no cause named on this slide.

**Source basis:** Tier B — KOST Function 7.4 course, slide 18 ("Généralités",
"Pourquoi Réglementer?"). No direct exam/practice hit for this specific
historical-accident fact; Exam Q1 ("Quelle organisation élabore la
réglementation...") tests a different fact from the same general 0.1
area, noted honestly as topic-level only, not direct corroboration.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-002 — Rôle de l'AIEA dans le cadre juridique du DGR

**Sub-task:** 0.1.2 Reconnaître le cadre juridique (mondial, national)
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Cadre juridique — Fondements de la
Réglementation DGR 1.1), quel organisme élabore les recommandations pour le
transport sécuritaire des matières radioactives, recommandations qui, telles
qu'applicables au transport aérien, sont reflétées dans la partie 10 du
manuel de l'IATA ?

**Options:**
- **(Correct)** L'Agence internationale de l'énergie atomique (AIEA).
- Le Sous-comité d'experts du Conseil économique et social des Nations-Unies
  (SCoETDG).
- L'Organisation de l'Aviation Civile Internationale (OACI).
- L'Association Internationale du Transport Aérien (IATA).

**Correct answer rationale:** Slide 20: "L'Agence internationale de l'énergie
atomique (AIEA)... L'AIEA élabore des recommandations pour le transport
sécuritaire des matières radioactives. Ces prescriptions, telles
qu'applicables au transport aérien, sont reflétées dans la partie 10 du
manuel de l'IATA."

**Distractor rationale (source-grounded — each is a different body in the
same slide sequence, with its own distinct, correctly-stated role):**
- SCoETDG — slide 19 explicitly *excludes* radioactive materials from its
  own remit: "Le SCoETDG élabore des procédures recommandées pour le
  transport de toutes les marchandises dangereuses, **à l'exception des
  matières radioactives**." The near-opposite of the correct answer.
- OACI — slide 21: "L'OACI s'est fondée sur ces recommandations pour
  élaborer la Réglementation... codifiée dans l'annexe 18 et dans les
  Instructions techniques (IT)" — a downstream body that builds on the
  AIEA's recommendations, not their source.
- IATA — slide 22: "La Réglementation de l'IATA comporte toutes les
  spécifications des Instructions techniques (IT)" plus added restrictive
  specifications — a further downstream body, not the source of the
  radioactive-materials recommendations.

**Source basis:** Tier B — KOST Function 7.4 course, slides 19–22 ("Cadre
juridique", DGR 1.1, SCoETDG→AIEA→OACI→IATA hierarchy). Corroborated at a
topic level by Exam Q1 ("Quelle organisation élabore la réglementation
internationale... par voie aérienne?" — answer OACI, a related but distinct
fact from the same hierarchy) and Exam Q3 ("Quelle publication annuelle
fournit la réglementation..." — answer IATA DGR), noted honestly as
topic-level corroboration, not a direct match for the AIEA-specific fact
tested here.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-003 — Régime passager/équipage vs régime fret (DGR 2.3)

**Sub-task:** 0.2.3 Être au courant des dispositions s'appliquant aux passagers
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Limites — Dispositions relatives aux
passagers et au fret), quelle est la différence fondamentale entre le régime
applicable aux marchandises dangereuses transportées par un passager ou un
membre d'équipage, et celui applicable aux marchandises dangereuses
transportées en tant que fret ?

**Options:**
- **(Correct)** Pour les passagers/l'équipage, seuls les articles spécifiés
  aux points 2.3.2 à 2.3.5 sont autorisés, et uniquement pour un usage
  personnel ; pour le fret, une marchandise dangereuse peut être transportée
  dès lors qu'elle n'est pas « interdite en toutes circonstances » et que
  toutes les dispositions applicables du DGR sont respectées.
- Les deux régimes sont identiques : dans les deux cas, seuls les articles
  listés aux points 2.3.2 à 2.3.5 sont autorisés.
- Le régime passager est plus permissif que le régime fret, car le fret
  exige systématiquement une approbation préalable de l'État avant tout
  transport.
- Les marchandises dangereuses ne peuvent jamais être transportées en tant
  que fret ; seul le régime passager (points 2.3.2 à 2.3.5) permet leur
  transport par voie aérienne.

**Correct answer rationale:** Slide 45: "Dispositions relatives aux
passagers — Les DG sont généralement interdits au transport par des
passagers ou l'équipage... Seuls les articles spécifiés aux points 2.3.2 à
2.3.5 sont autorisés, et uniquement pour un usage personnel." vs.
"Dispositions relatives au chargement — Un DG peut être transportée en tant
que chargement si il n'est pas «interdit en toutes circonstances»... Toutes
les dispositions du DGR doivent être respectées, le cas échéant... Les DG
sont principalement transportés en tant que chargement commercial."
Cross-checked against slide 41 (DGR 2.3): "sauf dans les cas autorisés aux
points 2.3.2 à 2.3.5 pour un usage personnel."

**Distractor rationale (source-grounded — each contradicts a specific
clause of the same comparison slide):**
- "Les deux régimes sont identiques" — directly contradicts the slide's own
  two-column contrast structure; the cargo side explicitly uses a different
  test ("pas interdit en toutes circonstances"), not the passenger side's
  2.3.2–2.3.5 list.
- "Le régime passager est plus permissif... le fret exige une approbation
  préalable systématique" — inverts the slide's own framing, which states
  DG are *generally prohibited* for passengers/crew (with only a narrow
  personal-use exception) while DG *can* be transported as commercial cargo
  once the applicable DGR provisions are met — no blanket state-approval
  requirement is stated for cargo on this slide.
- "Les MD ne peuvent jamais être transportées en tant que fret" — directly
  contradicts the slide's own closing line: "Les DG sont principalement
  transportés en tant que chargement commercial."

**Source basis:** Tier B — KOST Function 7.4 course, slide 45 ("Limites —
Dispositions relatives aux passagers et au fret"), cross-checked against
slide 41 (DGR 2.3) and the explicit Table 2.3.A pointer on slide 45 itself.
Corroborated at a topic level by Practice Q5 (lithium-battery electronics in
checked baggage — permitted?), a related but distinct scenario from the same
general passenger-provisions area, noted honestly as topic-level
corroboration only.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-004 — Colonne de la liste des marchandises dangereuses indiquant le groupe d'emballage (DGR 4.2)

**Sub-task:** 0.4.1 Trouver de l'information générale sur les classes et les divisions
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Liste des marchandises dangereuses DGR 4.2),
quelle colonne de la liste indique le groupe d'emballage applicable à une
marchandise dangereuse ?

**Options:**
- **(Correct)** Colonne E.
- Colonne A.
- Colonne C.
- Colonne D.

**Correct answer rationale:** Slide 80: "Colonnes ... E – Groupe
d'emballage."

**Distractor rationale (source-grounded — each names a different, correctly-
labelled column from the same slide):**
- Colonne A — same slide: "A – numéro ONU," a different field entirely.
- Colonne C — same slide: "C – Classes ou Divisions," a different field.
- Colonne D — same slide: "D – Etiquettes de danger," a different field.

**Source basis:** Tier B — KOST Function 7.4 course, slide 80 (DGR 4.2, DG
list column structure A–N), cross-checked against slide 79 ("La liste des
marchandises dangereuses contient environ 3000 articles et matières"). No
direct exam/practice hit for this exact column-identification fact; Exam
Q12 (circled letter on a package-marking photo) tests a different,
packaging-code fact from the same general classification area, noted
honestly as topic-adjacent, not direct corroboration.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-005 — Division du Classe 2 illustrée par le butane et le propane

**Sub-task:** 0.4.1 Trouver de l'information générale sur les classes et les divisions
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Les classes des marchandises dangereuses DGR
3.0.2), le butane et le propane sont cités en exemples typiques de laquelle
des divisions suivantes de la Classe 2 ?

**Options:**
- **(Correct)** Division 2.1 — Gaz inflammable (RFG).
- Division 2.2 — Gaz non inflammable et non toxique (RNG).
- Division 2.3 — Gaz toxique (RPG).
- Classe 3 — Liquides inflammables (RFL).

**Correct answer rationale:** Slide 63: "Division 2.1 Gaz inflammable RFG
Ex: Butane, Propane etc."

**Distractor rationale (source-grounded — each is a different class/division
named with its own distinct examples on the same or an adjacent slide):**
- Division 2.2 — same slide: "Gaz non inflammable et non toxique RNG Ex:
  Azote, Hélium" — a real division with real named examples, but not the one
  butane/propane illustrate.
- Division 2.3 — same slide: "Gaz Toxique RPG Ex: Bombe anti-agression" —
  likewise a real division/example pairing, but the wrong one.
- Classe 3 — slide 64: "Liquides inflammables RFL Ex: Essence, alcool,
  huile" — a real, correctly-stated adjacent class (flammable *liquids*, not
  gases), a plausible trap for a student who conflates "flammable" gas with
  "flammable" liquid.

**Source basis:** Tier B — KOST Function 7.4 course, slide 63 (DGR 3.0.2,
Classe 2 divisions with named examples; page index confirmed by direct
single-page extraction — this slide's own footer number does not render in
the text layer, the same image-heavy-slide extraction quirk already
recorded in `docs/DGR_STAGE1_FUNCTION_7.4_DRAFT.md`), cross-checked against
slide 64 (Classe 3). Corroborated by Practice Q9 ("Il y'a trois divisions
dans la classe 2 du DGR — Vrai/Faux," correct answer Vrai), a direct,
closely related corroboration that Class 2 has exactly three divisions,
though not the specific butane/propane example fact tested here.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-006 — Les deux types d'étiquettes sur un colis de marchandises dangereuses

**Sub-task:** 0.5.2 Reconnaître les prescriptions de base concernant l'étiquetage
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Étiquetage DGR 7.2.2.2), laquelle des
affirmations suivantes décrit correctement la classification des étiquettes
que doit porter un colis de marchandises dangereuses ?

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

**Correct answer rationale:** Slide 85: "Tous colis contenant des
marchandises dangereuses doit être étiqueté pour indiquer son contenu... Il
existe 2 types d'étiquettes : Les étiquettes de danger[,] Les étiquettes de
manutention."

**Distractor rationale (source-grounded):**
- "Trois types distincts... UN 3245" — slide 87 does show a biological
  Category B / UN 3245 label as a worked example, but nothing on that slide
  or elsewhere reframes it as a third category outside the danger/handling
  structure stated on slide 85 — it is itself a danger label (biological
  substances being a hazard class), not a separate third type.
- "Seules les étiquettes de danger sont obligatoires... manutention...
  facultatives" — contradicts slide 85's own opening line, "Tous colis...
  **doit** être étiqueté," stated before the two-type list, with no
  optionality carved out for either type.
- "Les étiquettes de danger chimique... suffisent à elles seules à
  classifier" — directly contradicts slide 88 ("Autres étiquettes"):
  "Certains colis portent des étiquettes de danger chimique. Les articles
  qui y sont contenus **ne répondent pas forcement à la classification des
  DG** conformément à la réglementation. Cependant avant acceptation, pensez
  à demander des clarifications à l'expéditeur."

**Source basis:** Tier B — KOST Function 7.4 course, slide 85 (DGR 7.2.2.2,
two-type statement), cross-checked against slides 86–88 (handling-label
slide, biological/environmental/GMO label examples, "autres étiquettes"
note). Corroborated by Practice Q14 ("Quelle est la forme des étiquettes de
manutention des marchandises dangereuses?"), a direct confirmation that
handling labels are examined as their own distinct category, reinforcing
the two-type distinction tested here.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-007 — Entreposage des peroxydes organiques et matières auto-réactives (DGR 9.2.1)

**Sub-task:** 4.1.1 Déterminer les conditions d'entreposage
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Entreposage des peroxydes
organiques et des matières réagissant spontanément, DGR 9.2.1), les colis et
unités de chargement contenant des marchandises dangereuses de la division
4.1 ou de la division 5.2 doivent être protégés du soleil, maintenus à
distance de toute source de chaleur, et placés dans une zone convenablement
ventilée pendant le chargement, le déchargement **et** le stockage.

**Correct answer:** Vrai.

**Rationale:** Slide 100: "Les colis et unités de chargement contenant des
marchandises dangereuses de la division 4.1 ou de la division 5.2 devront
être protégés du soleil, maintenus à distance de toute source de chaleur et
placés dans de zone convenablement ventilée pendant le chargement, le
déchargement et le stockage." Direct, complete match — the stem tests all
three named stages (loading, unloading, storage), each present in the
source sentence.

**Source basis:** Tier B — KOST Function 7.4 course, slide 100 ("Procédures
de stockage et de chargement", DGR 9.2.1), cross-checked against slides
97–99 (general storage-integrity principles, DGR 9.3.5 operator's duty to
protect packages). Corroborated at a topic level by Practice Q6 (storage/
authorization checks for flammable paint, dry ice, medical oxygen, toxic
chemicals — a related but distinct storage-conditions scenario, not this
specific organic-peroxide/self-reactive fact), noted honestly as
topic-level corroboration only.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-008 — Classes/divisions absentes du Tableau 9.3.A et pourquoi

**Sub-task:** 4.1.2 Déterminer les restrictions de tri et de séparation
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Base de la séparation des marchandises
dangereuses — Tableau 9.3.A), pourquoi la division 4.1 et les classes 6, 7 et
9 n'apparaissent-elles **PAS** dans le Tableau 9.3.A ?

**Options:**
- **(Correct)** Parce que les marchandises dangereuses appartenant à cette
  division et à ces classes n'ont pas besoin d'être séparées des autres
  marchandises dangereuses.
- Parce qu'elles sont totalement interdites au transport aérien, quelle que
  soit la configuration de l'avion.
- Parce qu'elles doivent au contraire être séparées de toutes les autres
  marchandises dangereuses sans exception, une règle trop stricte pour être
  représentée dans un tableau.
- Parce que le Tableau 9.3.A ne s'applique qu'aux avions cargos, jamais aux
  avions passagers.

**Correct answer rationale:** Slide 108, note directly beneath Table 9.3.A:
"La division 4.1 et les classes 6, 7,9 n'apparaissent pas dans le tableau
9.3.A puisque les marchandises dangereuses appartenant à cette division et à
ces classe de risque n'ont pas besoin d'être séparées des autres
marchandises dangereuses."

**Distractor rationale (source-grounded — each contradicts the same note or
an adjacent fact on the same slide sequence):**
- "Totalement interdites au transport aérien" — contradicts the note's own
  wording, which concerns a *separation* exemption, not a transport ban;
  Class 7 (radioactive) and Class 9 in particular are extensively discussed
  elsewhere in this same course (slides 125–131) as routinely transported
  cargo.
- "Doivent au contraire être séparées de toutes les autres... sans
  exception" — directly inverts the note's own stated reason (no separation
  needed), the opposite conclusion from the same sentence.
- "Ne s'applique qu'aux avions cargos" — no aircraft-type restriction is
  stated anywhere on slide 108 or the surrounding separation slides
  (105–111); a fabricated scope not present in the source.

**Source basis:** Tier B — KOST Function 7.4 course, slide 108 (DGR 9.3.2.1,
Table 9.3.A and its own scope note), cross-checked against slides 105–106
(separation principle, primary/subsidiary-risk scope). No direct exam hit
for this specific table-scope-exception fact; Exam Q9, Q17, Q19, Q20 test
the broader radioactive-separation topic area, noted honestly as
topic-adjacent, not direct corroboration.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-009 — Limitation de chargement (DGR 9.3.1) — cabine, CAO, matériel de séparation

**Sub-task:** 4.1.2 Déterminer les restrictions de tri et de séparation
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Limitation de chargement DGR 9.3.1), laquelle
des affirmations suivantes est correcte ?

**Options:**
- **(Correct)** Les marchandises dangereuses portant l'étiquette CAO
  (« Cargo Aircraft Only ») ne doivent pas être transportées dans un avion
  passager.
- Les marchandises dangereuses peuvent être transportées dans la cabine d'un
  avion occupé par des passagers, à condition d'être bien arrimées.
- Les bagages, les cargaisons de fret ou les ballasts ne peuvent jamais être
  utilisés comme matériel de séparation ou de sécurisation des marchandises
  dangereuses.
- Aucune dérogation n'existe à l'interdiction de transport en cabine, pas
  même pour les colis de matières radioactives en quantités exceptées.

**Correct answer rationale:** Slide 109: "Les DG portant l'étiquette CAO
«Cargo Aircraft Only» ne doivent pas être transportées dans un avion
passager."

**Distractor rationale (source-grounded — each contradicts a different
clause of the exact same slide):**
- "Peuvent être transportées dans la cabine... à condition d'être bien
  arrimées" — directly contradicts the same slide's own first clause: "Les
  DG ne peuvent être transportées dans la cabine d'un avion occupé par des
  passagers ni dans le poste de pilotage."
- "Ne peuvent jamais être utilisés comme matériel de séparation" — inverts
  the same slide's closing clause: "Les bagages, les cargaisons de fret ou
  des ballasts peuvent être utilisés comme matériels de séparation ou de
  sécurisation des marchandises dangereuses à conditions que cela soit
  autorisé par l'exploitant."
- "Aucune dérogation n'existe... pas même... quantités exceptées" —
  contradicts the same slide's own parenthetical exception: "sauf cas de
  dérogations et colis de radioactif en quantités exceptées."

**Source basis:** Tier B — KOST Function 7.4 course, slide 109 (DGR 9.3.1).
Corroborated directly by Exam Q10: "Les colis portant la mention 'Cargo
Aircraft Only' doivent être chargés: ... b) Uniquement dans des
avions-cargos" — a direct, exact match for the correct answer tested here.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-010 — Séparation des animaux vivants des liquides cryogéniques/glace carbonique (DGR 9.3.13)

**Sub-task:** 4.2.3 Appliquer les prescriptions de rangement
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Animaux vivants DGR 9.3.13), quelle distance
minimale de séparation est exigée entre les animaux vivants et les colis,
suremballages ou conteneurs de fret des catégories II-Jaune et III-Jaune,
pour un voyage de plus de 24 heures ?

**Options:**
- **(Correct)** Au moins 1 mètre.
- Au moins 0,5 mètre.
- Aucune distance minimale n'est fixée ; les animaux vivants peuvent être
  chargés directement à côté de ces colis.
- 2 mètres, quelle que soit la durée du voyage.

**Correct answer rationale:** Slide 119: "Les colis, suremballages ou
conteneurs de fret des catégories II-Jaune et III-Jaune doivent être séparés
des animaux vivants d'une distance d'au moins 0,5 m (voyages de 24 heures ou
moins) ou d'au moins 1 m (voyages de plus de 24 heures)."

**Distractor rationale (source-grounded):**
- "Au moins 0,5 mètre" — the same slide's own correct threshold, but for the
  *other* named condition (voyages of 24 hours or less), not the
  more-than-24-hours condition this stem asks about — a genuine adjacent
  course fact used as a wrong-checkpoint distractor.
- "Aucune distance minimale n'est fixée" — directly contradicts the source's
  own explicit distance requirements.
- "2 mètres, quelle que soit la durée" — a fabricated figure and a
  fabricated single-threshold framing; the source names exactly two
  duration-dependent thresholds (0.5 m / 1 m), never 2 m and never a
  duration-independent figure.

**Source basis:** Tier B — KOST Function 7.4 course, slide 119 (DGR 9.3.13,
live-animal separation from cryogenic liquids/dry ice). No direct exam/
practice hit found for this specific numeric fact — noted honestly as an
uncorroborated but directly source-traced item.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-011 — Indice de transport des colis radioactifs de Catégorie I-Blanche

**Sub-task:** 6.1.4 Appliquer les prescriptions de rangement (stade chargement de l'aéronef)
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Séparation des matières radioactives en
fonction de l'indice de transport), laquelle des affirmations suivantes
concernant les colis de matières radioactives de Catégorie I-Blanche est
correcte ?

**Options:**
- **(Correct)** Leur indice de transport (IT) est de 0, ce qui permet de les
  charger en quantités illimitées sans aucune séparation.
- Leur IT est de 50, le maximum autorisé pour un compartiment de fret.
- Comme les catégories II-Jaune et III-Jaune, elles ne doivent jamais être
  transportées dans des compartiments passagers.
- Leur IT doit être mesuré directement par l'exploitant avant chaque vol,
  car il varie en fonction de la température ambiante.

**Correct answer rationale:** Slide 130: "Les colis de la catégorie
I-Blanche ont un indice de transport de 0 et peuvent être chargés en
quantités illimitées sans aucune séparation."

**Distractor rationale (source-grounded):**
- "IT de 50, le maximum autorisé pour un compartiment de fret" — confuses
  Category I-White's own TI (0) with a *different* rule from slide 104: "A
  noter que l'indice de transport de l'une des catégories avec l'étiquette
  jaune stocké ensemble ne doit pas excéder 50" — a real course fact, but
  about the yellow-label categories' stacking limit, not I-White's own TI
  value.
- "Ne doivent jamais être transportées dans des compartiments passagers" —
  the same slide 130 restricts *only* the yellow categories from passenger
  compartments ("Les matières radioactives des catégories II-Jaune et
  III-Jaune ne doivent pas être transportées dans des compartiments
  passagers"); Category I-White is not named in that restriction.
- "Doit être mesuré... avant chaque vol... varie en fonction de la
  température" — a fabricated procedural claim; slide 127 states the TI is
  "affecté à un colis" (assigned to a package) and determined by summing
  package TIs or measuring radiation intensity, not by a pre-flight
  temperature-dependent measurement.

**Source basis:** Tier B — KOST Function 7.4 course, slide 130 (radioactive
separation by transport index), cross-checked against slides 104 and
125–129 (TI definition DGR, Tables 10.5.C/10.9.3.7). Corroborated by Exam
Q17 and Practice Q15 (both: "Quelle unité indique le niveau de radiation...
— c) Indice de transport"), a direct confirmation that Transport Index is
the examined concept, though not the specific Category I-White = 0 numeric
fact tested here.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-012 — Champs obligatoires de la NOTOC (DGR 9.5.1.1.3)

**Sub-task:** 6.1.5 Vérifier que la NOTOC reflète la cargaison de l'aéronef
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Notification des pilotes — DGR 9.5.1.1.3),
laquelle des informations suivantes ne fait **PAS** partie des
renseignements que la NOTOC doit obligatoirement comprendre pour une
marchandise dangereuse classique ?

**Options:**
- **(Correct)** Le nom et les coordonnées personnelles de l'expéditeur.
- Le numéro d'AWB (LTA).
- L'emplacement exact de chargement dans l'avion.
- Le nombre de colis, la quantité nette ou brute.

**Correct answer rationale:** Slides 137–138 enumerate the NOTOC's required
fields exhaustively: "Le numéro d'AWB (LTA)[;] La désignation exacte
d'expédition et le numéro ONU ou ID[;] La classe ou la division ou les
risques subsidiaires[;] Le groupe d'emballage[;] Le nombre de colis, la
quantité nette ou brut[;] L'emplacement exacte de chargement dans l'avion[;]
le nombre de colis ou de conteneurs de fret[;] Leur catégorie, leur indice
de transport[;] leur emplacement exacte de chargement dans l'avion[;]
Indication avion cargo uniquement (CAO) le cas échéant[;] L'aéroport de
déchargement du colis[;] La ou les dérogations d'Etat le cas échéant." The
shipper's own name/personal contact details are never named anywhere in
this list.

**Distractor rationale (source-grounded — each of the three wrong-to-select
options is drawn verbatim from the enumerated list itself):**
- "Le numéro d'AWB (LTA)" — first item on slide 137's list.
- "L'emplacement exact de chargement dans l'avion" — named on both slide 137
  and slide 138's list.
- "Le nombre de colis, la quantité nette ou brute" — named on slide 137's
  list.

**Source basis:** Tier B — KOST Function 7.4 course, slides 137–138 ("DGR
9.5.1.1.3", full field enumeration). Strongly corroborated by Practice Q20,
the practice book's own capstone loading-plan-vs-NOTOC discrepancy scenario
(package B absent from NOTOC, package C quantity mismatch), which requires
exactly this field-by-field knowledge of what the NOTOC must contain to
identify a non-conforming package.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-013 — Obligation de correspondance exacte entre la NOTOC et la cargaison

**Sub-task:** 6.1.5 Vérifier que la NOTOC reflète la cargaison de l'aéronef
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Notification des pilotes), il
est acceptable que la NOTOC diffère légèrement de la cargaison réellement
embarquée, tant que l'écart concerne uniquement des marchandises **non**
dangereuses.

**Correct answer:** Faux.

**Rationale:** Slide 139: "Le responsable du chargement doit veiller à ce
que la NOTOC corresponde **exactement** à la cargaison embarquée." The
course states an unqualified exact-match requirement with no carve-out for
discrepancies limited to non-dangerous cargo — the stem's implied exception
is not supported by the source.

**Source basis:** Tier B — KOST Function 7.4 course, slide 139 (DGR
9.5.1.1.3, exact-correspondence statement), cross-checked against slides
135–138 (NOTOC purpose and required fields) and slide 141 (NOTOC exemptions
list — magnetized masses, GMOs, Category B biological substances, excepted
quantities, and Table 9.5.A items are not required to appear on the NOTOC
at all, a distinct fact from the exact-match requirement tested here).
Strongly corroborated by Practice Q20's capstone scenario, which directly
tests the practical consequence of this exact-match requirement (identifying
non-conforming packages and the immediate pre-departure actions required).
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-014 — Signalement des accidents et incidents de marchandises dangereuses (DGR 9.6.1)

**Sub-task:** 7.1 + 7.2 (combined pool) Signaler les accidents / les incidents de marchandises dangereuses
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Accidents et incidents de marchandises
dangereuses DGR 9.6.1), à qui l'exploitant doit-il signaler un accident ou
un incident de marchandises dangereuses ?

**Options:**
- **(Correct)** Aux autorités compétentes de l'État de l'exploitant ainsi
  qu'à celles de l'État dans lequel l'accident ou l'incident s'est produit.
- Uniquement aux autorités compétentes de l'État de l'exploitant, jamais à
  celles de l'État où l'événement s'est produit.
- Uniquement à l'expéditeur d'origine du colis concerné, à charge pour lui
  de prévenir les autorités.
- Uniquement si la marchandise dangereuse concernée est pleinement soumise à
  la Réglementation, jamais si elle bénéficie d'une exception ou d'une
  disposition spéciale.

**Correct answer rationale:** Slide 150: "L'exploitant doit signaler les
accidents et incidents de marchandises dangereuses aux autorités compétentes
de l'Etat de l'exploitant ainsi qu'aux ceux de celui dans lequel l'accident
ou l'incident s'est produit."

**Distractor rationale (source-grounded):**
- "Uniquement... l'État de l'exploitant, jamais... l'État où l'événement
  s'est produit" — drops the second required recipient the same sentence
  explicitly names.
- "Uniquement à l'expéditeur d'origine" — wrong actor and wrong recipient;
  the slide names "l'exploitant" as the reporting party and "autorités
  compétentes" as the recipient, never the shipper.
- "Uniquement si... pleinement soumise... jamais si elle bénéficie d'une
  exception" — directly contradicts the same slide's second paragraph:
  "Cela comprend les incidents impliquant des marchandises dangereuses qui
  ne sont pas soumises à tout ou partie de la réglementation en raison de
  l'application d'une exception ou d'une disposition spéciale."

**Source basis:** Tier B — KOST Function 7.4 course, slide 150 (DGR 9.6.1).
Per blueprint binding caveat 5, this item is dual-tagged to both 7.1
(accidents) and 7.2 (incidents) — the course gives "accidents" and
"incidents" a single shared slide with no independently-worded treatment of
either term, the same pattern already confirmed across Functions
7.1/7.2/7.3's own material. Corroborated at a topic level by Exam Q11
("Que doit-on faire en cas d'incident ou d'accident... Prévenir son
supérieur et suivre les recommandations du Red book de l'OACI"), which
tests the personnel-level immediate response rather than the operator's
formal state-authority reporting duty tested here, noted honestly as
topic-level corroboration only.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-015 — Portée du signalement des MD non déclarées (fret/courrier ET bagages/personne)

**Sub-task:** 7.3 Signaler les marchandises dangereuses non déclarées ou mal déclarées
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Compte rendu DG non déclarées
DGR 9.6.2), l'obligation de signalement des marchandises dangereuses non
déclarées ou mal déclarées s'applique **uniquement** à celles découvertes
dans le fret ou le courrier, et non à celles découvertes dans les bagages ou
sur la personne des voyageurs ou des membres d'équipage.

**Correct answer:** Faux.

**Rationale:** Slide 149: "L'exploitant doit signaler tout cas où des
marchandises dangereuses non déclarées ou mal déclarées ont été découvertes
dans le fret ou le courrier[.] le signalement s'applique aux marchandises
dangereuses non déclarées ou mal déclarées découvertes dans les bagages ou
sur la personne de voyageurs ou de membres d'équipage." The course
explicitly extends this duty to baggage/on-person discoveries as well — the
stem's "uniquement... fret ou courrier" framing is false.

**Source basis:** Tier B — KOST Function 7.4 course, slide 149 (DGR 9.6.2).
No direct exam/practice hit for this specific baggage/person-scope-extension
fact; Exam Q15 (undeclared-aerosol-package scenario) tests the applied
consequence of the underlying reporting duty in a freight-context scenario,
not this specific scope question, noted honestly as topic-level
corroboration only.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-016 — Autorité algérienne destinataire des comptes rendus (DGR 9.6.5)

**Sub-task:** 7.4 Signaler les situations mettant en cause des marchandises dangereuses
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Compte rendu accidents et
incidents, DGR 9.6.5), pour l'Algérie, tous les comptes rendus sont adressés
à l'Agence Nationale de l'Aviation Civile (ANAC), dont le siège social est
situé Lot 225, Route Nationale N°5, Rouiba, Alger.

**Correct answer:** Vrai.

**Rationale:** Slide 152: "Pour l'Algerie, tous les compte-rendu sont
adressés à: L'Agence Nationale de l'Aviation Civile ANAC[.] Siège social:
Lot 225, Route Nationale N°5, Rouiba, Alger, Algérie." Direct, explicit
match — this is the course's own Algeria-specific enrichment beyond the
generic IATA wording, following the general "Compte rendu accidents et
incidents DGR 9.6.5" heading (slide 151).

**Source basis:** Tier B — KOST Function 7.4 course, slide 152 ("Compte
rendu accidents et incidents", Algeria/ANAC-specific reporting line), slide
151 (DGR 9.6.5 heading). No direct exam/practice hit, consistent with Stage
1's finding for this sub-task.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A. Note: the
ANAC postal/registered-office detail (Rouiba address) is administrative
contact information as taught by the course, not a DGR regulatory provision
— flagged so a future reviewer does not mistake it for a DGR-numbered
requirement.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Summary table

| ID | Sub-task | FR status | Type | Current source basis (Tier) | EN status | Approval |
|---|---|---|---|---|---|---|
| Q-7.4-001 | 0.1.1 Accident ValuJet 1996 | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slide 18 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-002 | 0.1.2 Rôle de l'AIEA | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slides 19–22 (DGR 1.1) | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-003 | 0.2.3 Régime passager vs fret | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slide 45 (DGR 2.3) | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-004 | 0.4.1 Colonne E — groupe d'emballage | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slide 80 (DGR 4.2) | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-005 | 0.4.1 Division 2.1 — butane/propane | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slide 63 (DGR 3.0.2) | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-006 | 0.5.2 Deux types d'étiquettes | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slides 85–88 (DGR 7.2.2.2) | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-007 | 4.1.1 Entreposage DGR 9.2.1 | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | True/False | KOST F7.4 course slide 100 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-008 | 4.1.2 Tableau 9.3.A — classes absentes | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slide 108 (DGR 9.3.2.1) | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-009 | 4.1.2 Limitation de chargement DGR 9.3.1 | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slide 109 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-010 | 4.2.3 Séparation animaux vivants DGR 9.3.13 | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slide 119 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-011 | 6.1.4 IT Catégorie I-Blanche | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slide 130 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-012 | 6.1.5 Champs obligatoires NOTOC | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slides 137–138 (DGR 9.5.1.1.3) | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-013 | 6.1.5 Correspondance exacte NOTOC | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | True/False | KOST F7.4 course slide 139 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-014 | 7.1+7.2 Signalement accidents/incidents DGR 9.6.1 | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slide 150 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-015 | 7.3 Portée signalement MD non déclarées | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | True/False | KOST F7.4 course slide 149 (DGR 9.6.2) | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-016 | 7.4 ANAC (DGR 9.6.5) | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | True/False | KOST F7.4 course slides 151–152 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |

**Batch composition:** 12 MCQ + 4 True/False. Block spread: Block 0 = 6,
Block 4 = 4, Block 6 = 3, Block 7 = 3.

## What this batch does NOT do

- Does not exceed any per-sub-task ceiling in
  `docs/DGR_STAGE2A_FUNCTION_7.4_BLUEPRINT.md` (see the ceiling-compliance
  table above — every drawn count is at or below its "sample" figure).
- Does not draft any item against the three confirmed `SOURCE GAP` leaves
  (4.2.5, 6.1.1, 6.3.4) — count remains 0 for all three, no exception, per
  binding caveat 1.
- Does not draft any item against 6.1.6 or 0.4.3 this batch — both carry
  real but thin/restricted-framing-only evidence (sample 0–1); left
  deliberately at 0 in favor of this batch's richer picks, not because the
  restriction was violated or ignored.
- Does not draft any item against the six caveat-4 shared-evidence-pool
  leaves (4.2.1, 4.2.2, 6.1.2, 6.1.3, 6.3.2, 6.3.3) or their Block 0 anchor
  (0.2.1) — deliberately deferred as a group to a future batch that can give
  the distinct-lifecycle-stage-framing discipline the careful, dedicated
  attention it requires.
- Does not draft any item from 4.2.4, 6.3.1, or the remaining 10 of Block
  0's 16 leaves (0.1.3, 0.1.4, 0.2.2, 0.3.1, 0.3.3, 0.4.2, 0.5.1, 0.6.1,
  0.6.2) — real source exists for most of these, left for a future batch.
  0.6.2 in particular should stay minimal even then, per binding caveat 7.
- Does not perform Tier A (current DGR 67th Ed./Addendum 1) verification for
  any of the 16 items — that remains the mandatory next step before any of
  these can move past `DRAFT`, blocked this pass on the owner's pending
  Bookshelf re-authentication.
- Does not mark any item `APPROVED` — no qualified reviewer exists in this
  pass.
- Does not touch Moodle or any live/production question-bank copy.


---

# Batch 2

Second production-drafting pass against
`docs/DGR_STAGE2A_FUNCTION_7.4_BLUEPRINT.md` (PROVISIONAL/CEILING,
111-question maximum across 37 sub-tasks). Batch 1 drafted 16 items
(`Q-7.4-001`–`016`) across 13 of 37 leaves. This batch continues the ID
sequence from `Q-7.4-017`.

## Status of this batch — read before using any item below

**All 19 items in this batch are `DRAFT`, Tier B basis only. None has been
Tier A-verified against the current IATA DGR 67th Edition (2026, French,
Addendum 1) text.**

- A quick, cautious check of the `chrome-devtools` Bookshelf session was made
  at the start of this batch, per standing instruction. Result: **no page was
  open at all** (`evaluate` returned "The selected page has been closed. Call
  list_pages to see open pages.") — not even a Sign-In screen, simply no
  active browser session in this environment. No attempt was made to open a
  new session, navigate to a login flow, or authenticate. Per standing
  instruction, this is expected and correct, not a failure, and this entire
  batch is Tier B only, exactly like Batch 1 and every prior function's
  Batch 1/2s.
- Every item below is sourced directly and verbatim-traced to the same real
  **KOST Function 7.4 training material** already used for Batch 1 (Tier B),
  re-extracted this session with `pdftotext -layout` on the exact page ranges
  cited per item, from
  `/Users/mac/Documents/Fichiers/Algerie/CBTA final/yasmine cbta/wetransfer_supports-pedagogiques-dgr-cbta-kost-academy_2025-10-12_1842/COURS DGR-CBTA-IATA/DGR-FONCTION 7.4/`:
  - `03_KOST_DGR_CBTA_Course_Function_7.4_FR_2025.pdf` — course, 155 slides.
    Primary source, cited below by printed slide number (confirmed against
    each extracted page's own visible footer number).
  - `01_KOST_DGR_CBTA_Exam_Function_7.4_FR_Rev00_2025.pdf.pdf` (F-KOST 05,
    20Q) — corroborating cross-reference only, re-read in full this session.
  - `04_KOST_DGR_CBTA_Practice_Book_Function_7.4_FR_2025.pdf` (F-KOST 09,
    20Q) — corroborating cross-reference only, re-read in full this session;
    also used directly as the source of one distractor (Q-7.4-021, Practice
    Q17), flagged honestly per Stage 1's own SOURCE GAP note 7.
- Every "DGR x.y.z" section number cited below is, exactly as in Batch 1,
  **as displayed on the KOST slide itself** — Tier B, built on the course's
  own 66th Edition baseline, not independently re-verified against the
  current 67th Edition/Addendum 1 text in this pass.
- Per `.claude/rules/dgr-stage2b.md` rule 4, **no item in this batch may be
  marked `APPROVED`.** Status is `DRAFT` only.

## Sub-task selection and ceiling compliance

This batch drafts **19 items**, inside the task's 15–20 target range. Per
Priority 1, it deliberately tackles the six caveat-4 shared-evidence-pool
leaves plus their 0.2.1 Block 0 anchor — left as a group at the end of
Batch 1 specifically so they could be drafted together, carefully, with each
item genuinely tied to its own distinct lifecycle-stage checkpoint rather
than restating the same underlying fact with only the stage label changed.
Per Priority 2, it rounds out most of Block 0's remaining leaves and two more
Block 6 leaves, and — as explicitly invited by this task's brief — draws the
single permitted item from each of the two restricted-framing leaves
(0.4.3, 6.1.6) left at 0 by Batch 1.

| Sub-task | Title | Blueprint ceiling / sample | Batch 1 drawn | Batch 2 drawn | Remaining after Batch 2 | New item(s) |
|---|---|---|---|---|---|---|
| 0.1.3 | Déterminer l'application et la portée | 2 / 1 | 0 | 1 | 1 | Q-7.4-026 |
| 0.1.4 | Faire la distinction entre un danger et un risque | 2 / 1 | 0 | 1 | 1 | Q-7.4-027 |
| 0.2.1 | Développer un flair pour les MD cachées (anchor of the 4-way hidden-DG pool) | 3 / 1 | 0 | 2 | 1 | Q-7.4-017, Q-7.4-018 |
| 0.2.2 | Reconnaître les MD potentiellement dangereuses | 3 / 1 | 0 | 1 | 2 | Q-7.4-028 |
| 0.3.1 | Clarifier le rôle des parties prenantes | 3 / 1 | 0 | 1 | 2 | Q-7.4-029 |
| 0.3.3 | Reconnaître l'impact des divergences États/Exploitants | 3 / 1 | 0 | 1 | 2 | Q-7.4-030 |
| 0.4.2 | Comprendre les groupes d'emballage | 3 / 1 | 0 | 1 | 2 | Q-7.4-031 |
| 0.4.3 | Envisager de multiples dangers (restricted, caveat 3) | 1 / 0–1 | 0 | 1 | 0 | Q-7.4-034 |
| 0.5.1 | Reconnaître les prescriptions de marquage | 3 / 1 | 0 | 1 | 2 | Q-7.4-032 |
| 0.6.1 | Sensibilisation aux procédures d'urgence générales | 3 / 1 | 0 | 1 | 2 | Q-7.4-033 |
| 4.2.1 | Vérifier les colis — MD cachées (pré-chargement entrepôt) | 2 / 1 | 0 | 1 | 1 | Q-7.4-019 |
| 4.2.2 | Vérifier dommages/fuites (pré-chargement entrepôt) | 3 / 1 | 0 | 1 | 2 | Q-7.4-021 |
| 6.1.2 | Vérifier les colis — MD cachées (chargement avion) | 2 / 1 | 0 | 1 | 1 | Q-7.4-020 |
| 6.1.3 | Vérifier dommages/fuites (chargement avion) | 3 / 1 | 0 | 1 | 2 | Q-7.4-022 |
| 6.1.6 | Informer le commandant de bord (restricted, caveat 2) | 1 / 0–1 | 0 | 1 | 0 | Q-7.4-035 |
| 6.3.1 | Appliquer les consignes de déchargement spécifiques | 2 / 1 | 0 | 1 | 1 | Q-7.4-025 |
| 6.3.2 | Vérifier les colis — MD cachées (déchargement) | 2 / 1 | 0 | **0 — see note below** | 2 | — |
| 6.3.3 | Vérifier dommages/fuites (déchargement) | 3 / 1 | 0 | 2 | 1 | Q-7.4-023, Q-7.4-024 |
| **Total** | | | | **19** | | |

**No per-sub-task ceiling is exceeded.** 0.4.3 and 6.1.6 are each drawn at
their full permitted figure (1, their restricted sample ceiling); every
other sub-task drawn is at or below its own ceiling, most leaving headroom
for a future batch.

### 6.3.2 — attempted, honestly left at 0 this batch (real yield lower than ceiling)

Per the blueprint's own "Recommended next steps" #2 ("if a drafter cannot
find a genuinely distinct angle for a given pool member, that pool member's
real yield may be lower than this ceiling, and the smaller real yield wins
per the standing no-padding rule"), this batch's drafting session actively
attempted a 6.3.2 item (hidden-DG verification at the post-flight unloading
checkpoint) and did not draft one. The full re-extracted p.48–52 slide range
(the entire hidden-DG evidence pool) contains **no sentence framed at the
unloading/arrival stage** — its only stage-specific operational language is
"effectuer des inspections des bagages **pendant le chargement**" (p.51),
which is unambiguously a loading-stage fact and is the basis for this
batch's 6.1.2 item (Q-7.4-020) instead. Re-using the same COMAT/AOG examples
(p.49–50) under a relabelled "at unloading" stem, with no textual basis for
that stage, would be exactly the same-fact-repeated drift binding caveat 4
warns against and would violate rule 1 (never infer beyond the supplied
source). **Decision: 0 items for 6.3.2 this batch, honestly recorded, not a
missed leaf.** Real, ceiling-permitted headroom (2) remains for a future
batch if new source material narrows this gap.

## Priority 1 — the deliberately-deferred shared-evidence-pool group (12 items)

This section covers the six caveat-4 leaves (4.2.1, 4.2.2, 6.1.2, 6.1.3,
6.3.2, 6.3.3) plus their Block 0 anchor (0.2.1), exactly as Batch 1 left them
for "a future batch that can give the distinct-lifecycle-stage-framing
discipline the careful, dedicated attention it requires." Two shared
evidence pools are involved:

- **Hidden-DG recognition** (0.2.1 + 4.2.1 + 6.1.2 + 6.3.2), all drawing on
  course p.48–52. Yield this batch: 0.2.1 = 2 items (general
  definition/awareness, Block 0's own ★ level — no operational-stage split
  needed for this leaf), 4.2.1 = 1 item (warehouse-receiving checkpoint,
  p.50), 6.1.2 = 1 item (loading-moment checkpoint, p.51), 6.3.2 = 0 items
  (no distinct unloading-stage evidence found — see note above).
- **Damage/leak verification** (4.2.2 + 6.1.3 + 6.3.3), all drawing on course
  p.101–103. This pool's evidence turned out to have a genuinely clean
  three-way split once the two paragraphs on p.101 were read closely: the
  slide's **first** paragraph addresses an individual **colis/suremballage**
  inspected before it is loaded into an avion **or** placed in a UC (the
  warehouse/pre-load checkpoint, 4.2.2); its **second**, separate paragraph
  addresses **unités de chargement** inspected immediately before being
  placed **in the avion itself** (the aircraft-loading checkpoint, 6.1.3) —
  a real, source-stated package-level-vs-ULD-level distinction, not an
  invented one. p.102 (déchargement) and p.103 (fuite ou dommage constaté)
  were read as one continuous discovery-then-response narrative and both
  assigned to 6.3.3 (post-flight unloading), since p.103's "retiré de
  l'avion" phrasing (removed *from* the aircraft) most naturally continues
  the p.102 unloading-discovery scenario rather than the pre-load one (a
  package would not yet be "in the aircraft" to be "removed from" it at the
  warehouse pre-load stage). This attribution is a judgment call, flagged
  honestly here exactly as blueprint binding caveat 6 flagged its own
  0.2.2-mapping judgment call — a future qualified-instructor pass may
  reasonably re-attribute p.103 to 6.1.3 instead. p.102's own second clause
  (checking the *original loading location* for contamination) was kept
  separate from the core inspection duty and assigned to 6.3.1 instead
  (a specific unloading *instruction*, distinct from 6.3.3's *verification*
  duty) — see Priority 2 below.

---

## Q-7.4-017 — Définition de la marchandise dangereuse cachée (DGR 2.2)

**Sub-task:** 0.2.1 Développer un flair pour les marchandises dangereuses cachées
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Reconnaissance des marchandises dangereuses
non déclarées, DGR 2.2), laquelle des définitions suivantes correspond à une
« marchandise dangereuse cachée » ?

**Options:**
- **(Correct)** Un produit ou une substance classé comme dangereux selon les
  réglementations internationales (OACI ou IATA), mais transporté par un
  passager sous forme dissimulée, non déclarée ou mal déclarée,
  volontairement ou par négligence.
- Une marchandise dangereuse dont le transport aérien est rigoureusement
  interdit en toutes circonstances.
- Un article normalement soumis à la Réglementation mais exempté des
  exigences relatives aux marchandises dangereuses parce qu'il appartient à
  l'exploitant.
- Une marchandise dangereuse correctement déclarée et acceptée conformément
  à la Réglementation.

**Correct answer rationale:** Slide 48: "La MD cachée : se réfère à des
produits ou substances classées comme dangereuses selon les réglementations
internationales (l'OACI ou de l'IATA), mais qui sont transportées par les
passagers sous forme dissimulée non déclarée ou mal déclarée volontairement
ou par négligence, Ces marchandises peuvent être cachées dans les bagages à
main ou en soute et ne sont pas déclarées comme telles."

**Distractor rationale (source-grounded — each is a different, correctly-
stated category from elsewhere in the same course, used as a wrong-category
distractor):**
- "Interdite en toutes circonstances" — slide 36 (DGR 2.1): "Marchandises
  dangereuses dont le transport aérien est rigoureusement interdit" — a real,
  distinct category (total prohibition), not concealment.
- "Exempté... parce qu'il appartient à l'exploitant" — slides 43–44 (DGR
  2.5): the operator-property exemption list (équipement de bord, glace
  carbonique, piles, extincteurs, etc.) — a real, distinct category
  (lawfully exempted, not hidden/undeclared).
- "Correctement déclarée et acceptée" — directly contradicts the correct
  definition's own "non déclarée ou mal déclarée" element; describes the
  opposite case.

**Source basis:** Tier B — KOST Function 7.4 course, slide 48 (DGR 2.2,
"MD cachée" definition), cross-checked against slides 36 and 43–44 for the
distractor categories. No direct exam/practice hit for this specific
definition-recital fact; Exam Q14/Q15 test the applied recognition of hidden
DG in named examples, a related but distinct fact from the bare definition
tested here, noted honestly as topic-level corroboration only.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-018 — Mesures de prévention contre les MD cachées

**Sub-task:** 0.2.1 Développer un flair pour les marchandises dangereuses cachées
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Recommandations de prévention), laquelle des
mesures suivantes fait partie des recommandations données pour éviter le
transport de marchandises dangereuses cachées ou non déclarées ?

**Options:**
- **(Correct)** Demander la fiche de données de sécurité (SDS).
- Interdire systématiquement l'acceptation de tout matériel compagnie
  (COMAT), sans aucune exception.
- Exiger une autorisation écrite du commandant de bord avant l'acceptation
  de chaque colis.
- Vérifier uniquement les bagages en soute ; les bagages à main ne sont
  jamais concernés.

**Correct answer rationale:** Slide 51: "Pour éviter de tels scénarios, il
est recommandé : Respecter la réglementation DGR[,] Former le personnel[,]
Appliquer les affiches et le questionnaire verbal avec les passagers[,]
Effectuer des inspections des bagages pendant le chargement[,] Demander la
fiche de données de sécurité (SDS)."

**Distractor rationale (source-grounded):**
- "Interdire systématiquement tout COMAT" — contradicts slide 49, which
  treats COMAT as legitimately acceptable provided it is "classées et
  transportées conformément aux règlements," not banned outright.
- "Autorisation écrite du commandant de bord avant l'acceptation de chaque
  colis" — a fabricated procedure; the captain's documented role in this
  course is pre-departure NOTOC notification (slides 135–139), not a
  per-package acceptance sign-off, and this fact does not appear on the
  prevention-recommendations slide.
- "Uniquement... en soute; les bagages à main ne sont jamais concernés" —
  contradicts slide 48's own definition, which names both "bagages à main
  ou en soute" as places hidden DG may be concealed, with no soute-only
  restriction on the inspection recommendation.

**Source basis:** Tier B — KOST Function 7.4 course, slide 51 (prevention
recommendations list), cross-checked against slides 48–49. No direct exam/
practice hit for this specific recommendations-list fact.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-019 — Pièces AOG pouvant dissimuler des MD à la réception en entrepôt

**Sub-task:** 4.2.1 Vérifier les colis pour indications de MD cachées et non déclarées (checkpoint entrepôt/pré-chargement)
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Exemples de MD cachées DGR 2.2.4), lors de la
réception à l'entrepôt de pièces de rechange pour aéronefs au sol (AOG),
laquelle des catégories suivantes est explicitement citée par le cours comme
pouvant dissimuler des marchandises dangereuses non déclarées ?

**Options:**
- **(Correct)** Les régulateurs de carburant et les réfrigérateurs.
- Les extincteurs et les équipements de sauvetage, systématiquement
  exemptés dès lors qu'ils appartiennent à l'exploitant.
- Les documents de transport et les déclarations de l'expéditeur.
- Les bagages à main des passagers.

**Correct answer rationale:** Slide 50 (Exemples de DG cachées DGR 2.2.4):
"Pièces de rechange pour les aéronefs au sol (AOG)[,] Automobiles, Pièces
détachées et fournitures pour automobiles[,] Appareils dentaires[,]
Echantillons de diagnostic[,] Régulateurs de carburant[,] Réfrigérateurs[,]
Kits de réparation[,] Échantillons pour les tests."

**Distractor rationale (source-grounded — each names a real item from a
different slide's own distinct list):**
- "Extincteurs et équipements de sauvetage... exemptés" — slide 44's
  operator-property exemption examples list ("Extincteurs[,] Equipements de
  sauvetage"), a different category (lawful exemption, not warehouse-
  receiving hidden-DG risk) from a different slide.
- "Documents de transport et déclarations de l'expéditeur" — not a physical
  item capable of concealing DG; a category-confusion distractor with no
  basis in slide 50's list.
- "Bagages à main des passagers" — belongs to slide 48's general hidden-DG
  definition (passenger-carried concealment), not slide 50's AOG/warehouse-
  cargo examples list — a genuine wrong-checkpoint distractor drawn from the
  0.2.1 pool this item is deliberately distinguished from.

**Source basis:** Tier B — KOST Function 7.4 course, slide 50 (DGR 2.2.4, AOG
parts examples), cross-checked against slides 44 and 48. Corroborated at a
topic level by Exam Q14 ("dangers cachés... pièces de rechange d'avion,
COMAT"), a related but not identical example set. Framed specifically as a
warehouse-receiving/pre-load checkpoint fact to distinguish it from 0.2.1's
general-definition items above.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-020 — Inspection des bagages pendant le chargement lui-même

**Sub-task:** 6.1.2 Vérifier les colis pour indications de MD cachées et non déclarées (checkpoint chargement de l'aéronef)
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Recommandations de prévention), quelle action
concrète est recommandée pour être réalisée **pendant le chargement
lui-même**, afin d'aider à détecter des marchandises dangereuses cachées ?

**Options:**
- **(Correct)** Effectuer des inspections des bagages pendant le chargement.
- Former le personnel.
- Demander la fiche de données de sécurité (SDS).
- Appliquer les affiches et le questionnaire verbal avec les passagers.

**Correct answer rationale:** Slide 51: "Effectuer des inspections des
bagages pendant le chargement" is the only one of the five listed prevention
measures explicitly tied to the loading moment itself.

**Distractor rationale (source-grounded — all four options, including the
three wrong ones, are drawn verbatim from the same slide 51 list; only one
is tied to the loading moment specifically):**
- "Former le personnel" — a real listed measure, but an organizational/
  training measure applied generally, not an action performed at the moment
  of loading.
- "Demander la fiche de données de sécurité (SDS)" — a real listed measure,
  but a documentary/pre-acceptance check, not a physical loading-moment
  inspection.
- "Appliquer les affiches et le questionnaire verbal avec les passagers" — a
  real listed measure, but a passenger-facing check-in/acceptance-stage
  measure, not a loading-moment action.

**Source basis:** Tier B — KOST Function 7.4 course, slide 51. This item is
deliberately built to test the same list as Q-7.4-018 (0.2.1) but keyed to
the one loading-stage-specific item, per binding caveat 4's distinct-framing
instruction — 0.2.1's item tests general-recommendation recognition (SDS),
this item tests the specific loading-moment action.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-021 — Inspection du colis/suremballage avant chargement (checkpoint entrepôt)

**Sub-task:** 4.2.2 Vérifier s'il y a des dommages et/ou des fuites (checkpoint entrepôt/pré-chargement)
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Procédures de stockage et de chargement —
Inspection), avant qu'un colis ou un suremballage de marchandises
dangereuses ne soit chargé dans un avion **ou** placé dans une unité de
chargement, que doivent s'assurer les exploitants ?

**Options:**
- **(Correct)** Que le colis ou le suremballage a été inspecté et qu'aucune
  trace visible de fuite ou de dommage n'y a été trouvée.
- Que le colis a été pesé et que son poids correspond exactement à celui
  indiqué sur la LTA.
- Que le colis a été ouvert pour en vérifier le contenu réel.
- Que le colis porte la signature manuscrite du commandant de bord.

**Correct answer rationale:** Slide 101: "Avant qu'un colis ou suremballage
ne soit chargé dans un avion ou placé dans une unité de chargement, les
exploitants doivent s'assurer que le colis ou le suremballage a été inspecté
et qu'on n'y a trouvé aucune trace visible de fuite ou de dommage."

**Distractor rationale:**
- "Pesé... poids correspond exactement à la LTA" — a fabricated requirement;
  no weighing/LTA-reconciliation step appears on this slide.
- "Ouvert pour en vérifier le contenu réel" — directly contradicts Practice
  Q17's own confirmed answer ("Les manutentionnaires sont autorisés à ouvrir
  les colis... — Faux"), a genuine, distinct KOST source fact (flagged by
  Stage 1 as having no dedicated course slide of its own, but a real,
  directly-read practice-book fact, cited honestly here as such rather than
  as course-slide content).
- "Signature manuscrite du commandant de bord" — fabricated; the captain's
  role in this course is pre-departure NOTOC notification (slides 135–139),
  never an individual package sign-off at the warehouse pre-load stage.

**Source basis:** Tier B — KOST Function 7.4 course, slide 101, first
paragraph (package/overpack-level inspection, stated to occur before loading
into an avion **or** placement in a UC — the warehouse/pre-load checkpoint).
One distractor additionally grounded in KOST Function 7.4 Practice Book
Q17 (F-KOST 09), read in full this session — see Stage 1's own SOURCE GAP
note 7 for the honest disclosure that this specific fact has no dedicated
course slide.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-022 — Inspection des unités de chargement avant leur placement dans l'avion

**Sub-task:** 6.1.3 Vérifier s'il y a des dommages et/ou des fuites (checkpoint chargement de l'aéronef)
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Procédures de stockage et de chargement —
Inspection), avant que les unités de chargement (UC) ne soient placées
**dans l'avion**, quelle vérification les exploitants doivent-ils effectuer ?

**Options:**
- **(Correct)** Que les UC sont inspectées et que les colis de marchandises
  dangereuses qu'elles contiennent ne présentent aucune trace de fuite ou de
  dommage.
- Que chaque colis individuel est retiré de l'UC puis réinspecté séparément
  une seconde fois avant d'être remis dans l'UC.
- Que les UC sont pesées afin de vérifier qu'elles ne dépassent pas une
  limite de masse brute autorisée.
- Que seule l'étiquette CAO est vérifiée ; aucune autre inspection n'est
  requise.

**Correct answer rationale:** Slide 101, second paragraph: "Avant d'être
placées dans un avion, les unités de chargement doivent être inspectées et
les colis de marchandises dangereuses qui s'y trouvent ne doivent présenter
aucune trace de fuite ou de dommage."

**Distractor rationale:**
- "Chaque colis... retiré... réinspecté séparément" — a fabricated
  double-unpacking procedure; the slide describes an inspection of the UC
  and its contents in place, not a repackaging step.
- "UC... pesées... limite de masse brute" — fabricated; no weight-check
  requirement appears on this slide.
- "Seule l'étiquette CAO est vérifiée" — contradicts the slide's own
  broader leak/damage-inspection requirement; CAO labelling is a separate
  ULD-identification topic (slides 112–114, sub-task 4.2.4), not a
  substitute for this inspection.

**Source basis:** Tier B — KOST Function 7.4 course, slide 101, second
paragraph — deliberately distinguished from Q-7.4-021 (same slide, first
paragraph): this item tests the **ULD-level** inspection immediately before
placement **in the aircraft**, per binding caveat 4's distinct-framing
instruction, while Q-7.4-021 tests the **individual package/overpack-level**
inspection before it is loaded into an avion or placed in a UC in the first
place.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-023 — Inspection dès le déchargement de l'avion

**Sub-task:** 6.3.3 Vérifier s'il y a des dommages et/ou des fuites (checkpoint déchargement de l'aéronef)
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Procédures de stockage et de chargement —
Déchargement), à quel moment les colis contenant des marchandises
dangereuses doivent-ils être inspectés pour rechercher des traces de
dommages ou de fuite, à l'arrivée ?

**Options:**
- **(Correct)** Dès leur déchargement de l'avion ou de l'unité de chargement.
- Uniquement si le destinataire final en fait la demande expresse.
- Uniquement au moment de la facturation, plusieurs jours après le vol.
- Seulement si l'équipage a signalé un incident pendant le vol.

**Correct answer rationale:** Slide 102: "Déchargement : Les colis
contenant des marchandises dangereuses doivent, dès leur déchargement de
l'avion ou de l'unité de chargement, être inspectés pour rechercher des
traces de dommages ou de fuite."

**Distractor rationale (source-grounded — each attaches a fabricated
condition the slide's own unconditional wording does not support):**
- "Uniquement si le destinataire... en fait la demande" — contradicts the
  unconditional "doivent, dès leur déchargement... être inspectés" wording.
- "Uniquement... facturation, plusieurs jours après" — contradicts "dès
  leur déchargement" (immediately upon unloading), a specific timing the
  slide itself states.
- "Seulement si l'équipage a signalé un incident" — contradicts the same
  unconditional duty; no incident-report precondition appears on this slide.

**Source basis:** Tier B — KOST Function 7.4 course, slide 102, first
paragraph (post-flight unloading inspection duty) — deliberately
distinguished from Q-7.4-021/022 (pre-load/loading-stage inspection duties)
per binding caveat 4.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-024 — Fuite ou dommage constaté : réponse immédiate

**Sub-task:** 6.3.3 Vérifier s'il y a des dommages et/ou des fuites (checkpoint déchargement de l'aéronef)
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Fuite ou dommage constaté),
tout colis présentant des dommages ou des traces de fuite doit être retiré
de l'avion et placé en lieu sûr, et en cas de fuite, l'exploitant doit
s'assurer que le reste de l'expédition est en bon état et qu'aucun autre
colis ou article de fret n'a été contaminé.

**Correct answer:** Vrai.

**Rationale:** Slide 103: "Tout colis qui présente des dommages ou de trace
de fuite devra être retiré de l'avion pour être placé en lieu sûr. En cas de
fuite, l'exploitant doit s'assurer que le reste de l'expédition est en bon
état et qu'aucun autre colis ou article de fret n'a été contaminé." Direct,
complete match.

**Source basis:** Tier B — KOST Function 7.4 course, slide 103, read
directly after slide 102's unloading-discovery paragraph. **Attribution
note (interpretive judgment call, flagged honestly):** this slide's
"retiré de l'avion" phrasing (removed *from* the aircraft) is read here as
continuing the p.102 post-unloading discovery scenario, rather than as a
pre-load (4.2.2) fact, since a package would not yet be "in the aircraft" to
be "removed from" it at the warehouse pre-load stage. A future
qualified-instructor pass may reasonably re-attribute this slide to 6.1.3
(loading-stage discovery) instead — the underlying course text itself does
not explicitly label which of the two in-aircraft stages this response
procedure belongs to.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Priority 2 — rounding out Block 0's remaining leaves, plus two more Block 6 leaves (7 items)

---

## Q-7.4-025 — Consigne spécifique de déchargement : contrôle de l'emplacement de chargement d'origine

**Sub-task:** 6.3.1 Appliquer les consignes de déchargement spécifiques
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Procédures de stockage et de chargement —
Déchargement), si des traces de dommage ou de fuite sont découvertes sur un
colis lors du déchargement, quelle consigne spécifique le cours demande-t-il
d'appliquer, **en plus** de l'inspection du colis lui-même ?

**Options:**
- **(Correct)** Contrôler l'emplacement où les colis ou l'unité de
  chargement ont été chargés dans l'avion, pour rechercher toute trace de
  dommage ou de contamination ; si contamination il y a, elle devra être
  éliminée.
- Informer immédiatement l'agent des opérations aériennes ou le régulateur
  de vols.
- Renvoyer automatiquement le colis à l'expéditeur d'origine, sans autre
  vérification.
- Détruire immédiatement le colis sur place, sans consulter l'exploitant.

**Correct answer rationale:** Slide 102, second paragraph: "Si on trouve des
traces, contrôler l'emplacement où les colis ou l'unité de chargement ont
été chargés dans l'avion pour rechercher toute trace de dommage ou de
contamination[.] Si contamination il y a, elle devra être éliminée."

**Distractor rationale:**
- "Informer... l'agent des opérations aériennes ou le régulateur de vols" —
  a deliberately named but unsupported channel: per blueprint binding
  caveat 2, no mention of "l'agent des opérations aériennes" or "le
  régulateur de vols" appears anywhere in this course — a confirmed SOURCE
  GAP, included here specifically as a wrong answer, not as an implied fact.
- "Renvoyer automatiquement... à l'expéditeur, sans autre vérification" —
  fabricated procedure, no such automatic-return step appears on this
  slide.
- "Détruire immédiatement le colis... sans consulter l'exploitant" —
  contradicts the exploitant's own central role stated throughout this
  section (e.g., slide 103: "l'exploitant doit s'assurer que...").

**Source basis:** Tier B — KOST Function 7.4 course, slide 102, second
paragraph — deliberately kept separate from Q-7.4-023 (6.3.3, same slide's
first paragraph): this item tests the specific **follow-up instruction**
(check the original loading location; remediate contamination), while
Q-7.4-023 tests the **initial verification duty** itself.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-026 — Champ d'application de la Réglementation (DGR 1.2.1)

**Sub-task:** 0.1.3 Déterminer l'application et la portée
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Applicabilité DGR 1.2.1), à qui la
Réglementation IATA sur les marchandises dangereuses (DGR) s'applique-t-elle ?

**Options:**
- **(Correct)** Aux exploitants membres ou membres associés de l'IATA, aux
  parties à l'accord multilatéral de trafic intercompagnies de l'IATA-fret,
  ainsi qu'aux expéditeurs et agents de fret.
- Uniquement aux exploitants membres de l'IATA ; les expéditeurs et agents
  de fret ne sont pas concernés par la Réglementation.
- Uniquement aux États ayant ratifié une convention spécifique auprès de
  l'OACI ; les exploitants n'y sont pas directement soumis.
- À tous les transporteurs aériens dans le monde, qu'ils soient ou non
  membres de l'IATA ou parties à un accord de trafic.

**Correct answer rationale:** Slide 30: "DGR de l'IATA est applicable à :
Tous les exploitants qui sont : Membres ou membres associés de l'IATA[,]
Parties à l'accord multilatéral de trafic intercompagnies de l'IATA-fret[.]
Aux expéditeurs et agents de fret."

**Distractor rationale:**
- "Uniquement... membres de l'IATA; les expéditeurs et agents... ne sont pas
  concernés" — drops the shippers/freight agents the same slide names.
- "Uniquement aux États... l'OACI; les exploitants n'y sont pas directement
  soumis" — confuses this slide's operator/shipper-level scope with the
  State/OACI layer taught on a different slide (slide 21).
- "Tous les transporteurs... qu'ils soient ou non membres" — overstates the
  scope; the slide names specific membership/party categories, not a
  membership-independent universal application.

**Source basis:** Tier B — KOST Function 7.4 course, slide 30 (DGR 1.2.1).
Corroborated at a topic level by Practice Q2 (this function's own
scope-boundary question — the handling personnel's role vs. the acceptance
functions' role), a related but distinct scope question from the same
general applicability area.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-027 — Distinction danger/risque — exemple du liquide inflammable

**Sub-task:** 0.1.4 Faire la distinction entre un danger et un risque
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Faire la distinction entre un danger et un
risque — exemple du liquide inflammable), laquelle des affirmations
suivantes illustre correctement la différence entre le danger et le risque ?

**Options:**
- **(Correct)** Le danger est l'inflammabilité elle-même (le fait que le
  liquide puisse s'enflammer facilement) ; le risque est la probabilité
  qu'il s'enflamme réellement pendant le transport aérien, par exemple si
  le contenant est mal fermé ou exposé à la chaleur.
- Le danger et le risque désignent exactement la même chose : la
  probabilité qu'un accident se produise.
- Le risque est la caractéristique physique intrinsèque du produit ; le
  danger est la probabilité qu'un accident survienne.
- Selon l'évaluation du cours, il est très probable que les marchandises
  dangereuses causent un problème même lorsqu'elles sont préparées et
  manipulées conformément à la réglementation IATA.

**Correct answer rationale:** Slides 31–33: "Risque: le degré de probabilité
... qu'un danger quelconque cause réellement un dommage" / "Danger: quelque
chose qui pourrait potentiellement causer des dommages" ; worked example,
slide 33: "Danger : son inflammabilité, le fait qu'il puisse s'enflammer
facilement[.] Risque : quelle est la probabilité qu'il s'enflamme lors de
son transport aérien ? contenant est mal fermé, exposé au soleil ou à une
source de chaleur."

**Distractor rationale:**
- "Le danger et le risque désignent exactement la même chose" — contradicts
  the course's own explicit two-definition structure.
- "Le risque est la caractéristique physique... le danger est la
  probabilité" — inverts the two definitions.
- "Il est très probable que les MD causent un problème même... conformes" —
  directly contradicts slide 33's own conclusion: "il est très **peu**
  probable que les marchandises dangereuses causent un problème lorsqu'elles
  sont préparées et manipulées conformément à la réglementation IATA."

**Source basis:** Tier B — KOST Function 7.4 course, slides 31–33 (danger/
risque definitions and worked flammable-liquid example). No direct exam/
practice hit for this specific definitional-distinction fact.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-028 — Marchandises dangereuses de la propriété de l'exploitant (DGR 2.5)

**Sub-task:** 0.2.2 Reconnaître les marchandises potentiellement dangereuses
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Limites — Marchandises dangereuses de
l'exploitant DGR 2.5), laquelle des affirmations suivantes est correcte ?

**Options:**
- **(Correct)** Certains articles normalement classés comme marchandises
  dangereuses (équipement de bord, produits de consommation, glace
  carbonique, équipement électronique alimenté par batterie, pièces pour
  avions) sont exemptés des exigences de la Réglementation lorsqu'ils
  appartiennent à l'exploitant.
- Aucune exemption n'existe pour les marchandises dangereuses appartenant à
  l'exploitant ; toutes sont soumises intégralement à la Réglementation.
- Cette exemption s'applique uniquement aux extincteurs, à l'exclusion de
  tout autre article.
- Cette exemption ne s'applique qu'aux vols cargo, jamais aux vols passagers.

**Correct answer rationale:** Slide 43: "La Réglementation ne s'applique pas
aux articles suivants : Équipement de bord[,] Produits de consommation[,]
Dioxyde de carbone solide (glace carbonique)[,] Équipement électronique
alimenté par une batterie[,] Pièces pour avions." Slide 44 adds further
named examples (piles, extincteurs, équipements de sauvetage, fournitures
d'oxygène portables, insecticides, parfums, boissons alcoolisées, glace
carbonique pour restauration).

**Distractor rationale (source-grounded):**
- "Aucune exemption n'existe... toutes soumises intégralement" — directly
  contradicts slides 43–44's own stated exemption list.
- "Uniquement aux extincteurs" — understates the list; extincteurs is only
  one of many named items on slide 44.
- "Uniquement... vols cargo, jamais... passagers" — fabricated aircraft-type
  restriction; no such distinction appears on either slide.

**Source basis:** Tier B — KOST Function 7.4 course, slides 43–44 (DGR 2.5).
Per Stage 1's own recorded interpretive-mapping decision (blueprint binding
caveat 6), this is the material this function's 0.2.2 leaf is mapped to
(the broader "potentially dangerous merchandise" scope, distinct from
0.2.1's "hidden DG" scope) — this item is drafted consistently with that
already-recorded mapping, not a new interpretive decision.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-029 — Responsabilités de l'exploitant (DGR 1.4)

**Sub-task:** 0.3.1 Clarifier le rôle individuel et collectif des parties prenantes
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Rôle et responsabilité — Responsabilités
Exploitant DGR 1.4), laquelle des listes suivantes correspond aux
responsabilités attribuées à **l'exploitant** (et non à l'expéditeur) ?

**Options:**
- **(Correct)** Acceptation, chargement, entreposage, inspection,
  renseignement en cas d'urgence, compte rendu, conservation des documents,
  formation.
- Classification, emballage, marquage et étiquetage du colis.
- Déclaration du contenu et conservation des documents, à la charge
  exclusive de l'expéditeur.
- Uniquement la formation du personnel ; les autres tâches reviennent
  exclusivement à l'expéditeur.

**Correct answer rationale:** Slide 54 (DGR 1.4): "Acceptation[,]
Chargement[,] Entreposage[,] inspection[,] Renseignement -en cas
d'urgence-[,] Compte rendu[,] Conservation documents[,] Formation."

**Distractor rationale (source-grounded — the shipper's own duty wheel is
used as a wrong-party distractor):**
- "Classification, emballage, marquage et étiquetage" — slide 53's own
  shipper (expéditeur) duty wheel: "3-Classification[,] 4-Emballage[,]
  5-Marquage[,] 6-Etiquetage" — a real, distinct list, but the shipper's,
  not the operator's.
- "Déclaration... à la charge exclusive de l'expéditeur" — slide 53 lists
  "7-Déclaration" under the shipper's own duties, while omitting the
  operator's own "Conservation documents" duty named on slide 54.
- "Uniquement la formation... exclusivement à l'expéditeur" — understates
  the operator's actual 8-item duty list on slide 54, of which training is
  only one item.

**Source basis:** Tier B — KOST Function 7.4 course, slide 54 (DGR 1.4),
cross-checked against slide 53 (DGR 1.3, shipper duties). Directly
corroborated by Exam Q6 (a responsibility matrix distinguishing "Expéditeur"
vs. "Exploitant" across acceptance/identification/loading/inspection), a
close match to the shipper-vs-operator distinction this item tests.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-030 — Divergences propres à un exploitant (DGR 2.8.3)

**Sub-task:** 0.3.3 Reconnaître l'impact des divergences des États et des exploitants
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Divergences d'État et d'Exploitant DGR
2.8.3), laquelle des affirmations suivantes est correcte concernant les
divergences propres à un exploitant ?

**Options:**
- **(Correct)** Les divergences de l'exploitant ne doivent pas être moins
  restrictives que la Réglementation, et elles s'appliquent à tous les
  transports effectués par les exploitants concernés (exemple : AH — Air
  Algérie, AH-01, AH-02).
- Les divergences de l'exploitant peuvent être moins restrictives que la
  Réglementation, à condition d'être notifiées à l'OACI.
- Seuls les États peuvent notifier des divergences ; les exploitants n'ont
  pas ce droit.
- Les divergences de l'exploitant ne s'appliquent qu'aux vols
  internationaux de cet exploitant, jamais à ses vols domestiques.

**Correct answer rationale:** Slide 59: "Divergence de l'Exploitant DGR
2.8.3[:] Ne doivent pas être moins restrictives que le Règlement[;] Les
divergences de l'exploitant sont applicables à tous les transports effectués
par les exploitants concernés[.] Exemple : AH: AIR ALGERIE[,] AH-01, AH-02."

**Distractor rationale (source-grounded):**
- "Peuvent être moins restrictives... notifiées à l'OACI" — contradicts the
  slide's own explicit "ne doivent pas être moins restrictives" requirement;
  slide 57's general notification statement ("notifiées à l'OACI et à
  l'IATA") does not override this specific restriction named on slide 59.
- "Seuls les États peuvent notifier... les exploitants n'ont pas ce droit" —
  contradicts slide 59's own heading and content, which is specifically
  titled "Divergence de l'Exploitant."
- "Ne s'appliquent qu'aux vols internationaux... jamais... domestiques" —
  fabricated scope restriction, not stated on this slide.

**Source basis:** Tier B — KOST Function 7.4 course, slide 59 (DGR 2.8.3),
cross-checked against slides 56–58 (general divergence framework, State-
divergence example ITG/Italy). No direct exam/practice hit for this specific
operator-divergence fact.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-031 — Degré de danger du Groupe d'emballage I (DGR 3.0.3)

**Sub-task:** 0.4.2 Comprendre les principes généraux des groupes d'emballage
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Emballage — Groupes d'emballage DGR 3.0.3), à
quel degré de danger correspond le Groupe d'emballage I ?

**Options:**
- **(Correct)** Matières très dangereuses.
- Matières moyennement dangereuses.
- Matières faiblement dangereuses.
- Matières non dangereuses, mais soumises à un contrôle documentaire
  renforcé.

**Correct answer rationale:** Slide 72: "GROUPE D'EMBALLAGE ... Groupe
d'emballage I — Matières très dangereuses[;] Groupe d'emballage II —
Matières moyennement dangereuses[;] Groupe d'emballage III — Matières
faiblement dangereuses."

**Distractor rationale (source-grounded — the two wrong groups' own real
labels from the same table, plus a fabricated fourth category):**
- "Matières moyennement dangereuses" — the same table's own Groupe II row,
  not Groupe I.
- "Matières faiblement dangereuses" — the same table's own Groupe III row,
  not Groupe I.
- "Matières non dangereuses... contrôle documentaire renforcé" — a
  fabricated fourth category; the table names exactly three groups (I/II/
  III), never a "non-dangereux" tier.

**Source basis:** Tier B — KOST Function 7.4 course, slide 72 (DGR 3.0.3).
Corroborated directly by Exam Q7 (matches degrees of danger — grand/moyen/
mineur — to packing groups) and Practice Q10/Q11 (packing-group count;
Group III = "matières faiblement dangereuses"), a close, direct match for
the table structure tested here.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-032 — Signification du code de groupe d'emballage dans le marquage UN

**Sub-task:** 0.5.1 Reconnaître les prescriptions de base concernant le marquage
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Marquage des emballages à spécifications),
dans le marquage « UN 4G/Y/30/S/13/CH/2176/CG », que signifie la lettre
« Y » ?

**Options:**
- **(Correct)** Le groupe d'emballage II.
- Le code du matériau d'emballage (bois).
- L'année de fabrication de l'emballage.
- L'État d'origine de l'emballage.

**Correct answer rationale:** Slide 90: "Y= Groupe d'emballage
(X=groupe I -Y=groupe II et Z =groupe III)."

**Distractor rationale (source-grounded — each names a different, correctly
decoded element of the exact same marking string, from the same slide):**
- "Code du matériau d'emballage (bois)" — slides 92–93's own material-code
  table lists "C–Bois naturel," a different coding system entirely, not
  this marking's "Y" position.
- "Année de fabrication" — the same marking's own "13" element ("13 = Année
  de fabrication de l'emballage (2013)"), a different position in the same
  string.
- "État d'origine de l'emballage" — the same marking's own "CH" element
  ("CH = Etat d'origine de l'emballage (Suisse)"), a different position in
  the same string.

**Source basis:** Tier B — KOST Function 7.4 course, slide 90 (UN-mark
worked example), cross-checked against slides 92–93 (packaging type/
material code tables). Corroborated at a topic level by Exam Q12 (a
package-marking photo, circled-letter identification), a related but not
identical marking-decoding fact.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-033 — Première action des procédures générales d'urgence

**Sub-task:** 0.6.1 Créer une sensibilisation aux procédures d'urgence générales
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Procédures générales — intervention
d'urgence), quelle est la toute première action à entreprendre en cas
d'incident impliquant des marchandises dangereuses ?

**Options:**
- **(Correct)** Aviser immédiatement son supérieur.
- Isoler le colis endommagé en retirant les marchandises avoisinantes.
- Identifier la marchandise dangereuse, si possible.
- Appeler immédiatement un médecin, avant toute autre action.

**Correct answer rationale:** Slide 145, step 1 of the 4-step "Procédures
générales" list: "1 – Aviser immédiatement votre supérieur[,] 2 – Si
possible, identifier la marchandise dangereuse[,] 3 – Si possible, isoler le
colis endommagé en retirant les marchandises avoisinantes[,] 4 - Eviter le
contact avec le contenu du colis."

**Distractor rationale (source-grounded — each is a real listed step from
the same course, but the wrong ordinal position):**
- "Isoler le colis endommagé..." — the same slide's own step 3, not step 1.
- "Identifier la marchandise dangereuse..." — the same slide's own step 2,
  not step 1.
- "Appeler immédiatement un médecin, avant toute autre action" — belongs to
  the later, separate 5-step body-contact response sequence (slide 146,
  "Si le produit entre contact avec le corps ou les habits"), not the
  4-step initial-response sequence this stem asks about, and even within
  that later sequence "appeler un médecin" is not its first listed action.

**Source basis:** Tier B — KOST Function 7.4 course, slide 145 (4-step
initial response), cross-checked against slide 146 (5-step body-contact
response — used only as the source of the fourth distractor, kept clearly
separate from the sequence actually tested here). Corroborated at a topic
level by Exam Q11 ("Prévenir son supérieur et suivre les recommandations du
Red book de l'OACI"), a direct match for the "notify your supervisor first"
principle tested here.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-034 — Séparation applicable à tout risque, primaire ou subsidiaire (restricted framing, binding caveat 3)

**Sub-task:** 0.4.3 Envisager de multiples dangers — **restricted framing per blueprint binding caveat 3: operational-stage awareness fact only, never a classification-stage "determine the primary hazard" procedure**
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (Base de la séparation des
marchandises dangereuses, DGR 9.3.2.1), les prescriptions de séparation
s'appliquent à **toutes** les étiquettes de danger apposées sur un colis,
qu'il s'agisse d'un risque primaire ou d'un risque subsidiaire.

**Correct answer:** Vrai.

**Rationale:** Slide 106: "Les prescriptions relatives à la séparation
s'appliquent à toutes les étiquettes de danger appliquées sur l'emballage,
qu'ils s'agissent de risques primaires ou subsidiaires." Reinforced verbatim
on slide 110: "Séparation pour toutes les étiquettes de danger de
l'emballage (risque primaire ou subsidiaire). Séparation maintenue tout au
long de l'acceptation, la manutention et le chargement."

**Restricted-framing compliance note (per blueprint binding caveat 3, read
in full before drafting this item):** this item deliberately tests only the
operational-stage awareness fact stated on slides 106/110 — that separation
rules under DGR 9.3.2.1 cover every hazard label a package carries, primary
or subsidiary, once it reaches the warehouse/loading stage. It does **not**
test, and must never be read as testing, a classification-stage "how do you
determine which hazard is primary vs. subsidiary" procedure (DGR
3.10-equivalent) — that determination method is not taught anywhere in this
course, per Stage 1's own confirmed finding. This is the single permitted
item for this sub-task's 0–1 sample this batch.

**Source basis:** Tier B — KOST Function 7.4 course, slides 106 and 110
(DGR 9.3.2.1), the same two passing mentions of "risques primaires ou
subsidiaires" already identified in Stage 1 and carried into the blueprint's
binding caveat 3. No exam/practice hit for this specific fact.
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.4-035 — Notification du commandant de bord avant le départ (restricted framing, binding caveat 2)

**Sub-task:** 6.1.6 Informer le commandant de bord et l'agent des opérations aériennes ou le régulateur de vols — **restricted framing per blueprint binding caveat 2: captain-notification obligation only; must never test informing "l'agent des opérations aériennes" or "le régulateur de vols" (confirmed SOURCE GAP)**
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (Notification des pilotes), qui l'exploitant
doit-il informer, avant le départ, au moyen de renseignements écrits ou
imprimés précis concernant les marchandises dangereuses transportées comme
fret ?

**Options:**
- **(Correct)** Le commandant de bord.
- Le contrôleur aérien de l'aéroport de destination.
- L'expéditeur d'origine du colis.
- Le passager assis le plus près de la soute cargo.

**Correct answer rationale:** Slide 135: "L'un de ces principes veut que le
commandant de bord soit informé de ce qu'il transporte à bord de l'avion
car, en cas d'urgence par exemple, il faut tenir compte de la nature des
marchandises dangereuses pour prendre les mesures appropriées." Slide 136:
"Avant le départ, l'exploitant d'un avion transportant des marchandises
dangereuses doit fournir **au commandant de bord** des renseignements écrits
ou imprimés précis concernant les marchandises dangereuses à transporter
comme fret."

**Distractor rationale:**
- "Le contrôleur aérien de l'aéroport de destination" — fabricated
  recipient; no mention of air traffic control appears anywhere in this
  course's NOTOC material.
- "L'expéditeur d'origine du colis" — wrong direction; the shipper is the
  source of the original declaration (slide 53's own duty wheel), not the
  recipient of the pre-departure NOTOC briefing.
- "Le passager... le plus près de la soute cargo" — fabricated, included
  only to keep the item unambiguous; no such notification target appears
  anywhere in the source.

**Restricted-framing compliance note (per blueprint binding caveat 2, read
in full before drafting this item):** this item is deliberately framed as a
role/responsibility question — *who* must be informed before departure —
exactly as the caveat instructs, not a NOTOC-content-accuracy question (that
territory belongs to Q-7.4-012/013, already drafted under 6.1.5 in Batch 1).
It does **not** test, name, or imply that "l'agent des opérations aériennes"
or "le régulateur de vols" are informed by this same mechanism — that half
of this sub-task's official wording remains a confirmed SOURCE GAP, with
zero course/exam/practice evidence found in either Stage 1's or this
session's re-check. This is the single permitted item for this sub-task's
0–1 sample this batch.

**Source basis:** Tier B — KOST Function 7.4 course, slides 135–136 (DGR
9.5.1.1.3), the same NOTOC evidence base already drawn on for Q-7.4-012/013
in Batch 1, but this item tests the distinct "who must be informed" fact
rather than "what the NOTOC must contain" or "how exactly it must match the
cargo."
**FR status:** DRAFT — Tier B only. SOURCE REQUIRED for Tier A.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Method notes on distractor sourcing (rule 6 compliance) — Batch 2

Exactly as in Batch 1, every distractor above is grounded in something
actually read this session: either (a) a different, correctly-stated fact
from elsewhere in the same KOST Function 7.4 course (or, for one item,
Q-7.4-021, from the Function 7.4 Practice Book, honestly flagged as such),
repurposed as a wrong answer to *this* question, or (b) a direct
contradiction of a specific clause in the same source passage the correct
answer comes from. No distractor asserts an invented regulatory fact, an
invented numeric threshold, or a fact sourced from a different function's
course material. Where a caveat-2 or caveat-4 item names an unsupported
notification channel as a deliberate wrong answer (Q-7.4-025, Q-7.4-035),
this is flagged explicitly in that item's own rationale so no future reader
mistakes the distractor's mention of "l'agent des opérations aériennes" or
"le régulateur de vols" for evidence that either is actually informed.

## Summary table — Batch 2

| ID | Sub-task | FR status | Type | Current source basis (Tier) | EN status | Approval |
|---|---|---|---|---|---|---|
| Q-7.4-017 | 0.2.1 Définition MD cachée | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slide 48 (DGR 2.2) | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-018 | 0.2.1 Mesures de prévention | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slide 51 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-019 | 4.2.1 AOG — checkpoint entrepôt | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slide 50 (DGR 2.2.4) | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-020 | 6.1.2 Inspection pendant le chargement | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slide 51 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-021 | 4.2.2 Inspection colis avant chargement | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slide 101 ¶1 + Practice Q17 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-022 | 6.1.3 Inspection UC avant placement avion | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slide 101 ¶2 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-023 | 6.3.3 Inspection dès déchargement | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slide 102 ¶1 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-024 | 6.3.3 Fuite/dommage constaté — réponse | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | True/False | KOST F7.4 course slide 103 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-025 | 6.3.1 Contrôle emplacement de chargement | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slide 102 ¶2 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-026 | 0.1.3 Champ d'application DGR 1.2.1 | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slide 30 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-027 | 0.1.4 Distinction danger/risque | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slides 31–33 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-028 | 0.2.2 MD de la propriété de l'exploitant | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slides 43–44 (DGR 2.5) | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-029 | 0.3.1 Responsabilités Exploitant DGR 1.4 | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slide 54 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-030 | 0.3.3 Divergence de l'Exploitant DGR 2.8.3 | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slide 59 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-031 | 0.4.2 Groupe d'emballage I | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slide 72 (DGR 3.0.3) | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-032 | 0.5.1 Code "Y" du marquage UN | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slide 90 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-033 | 0.6.1 Première action d'urgence | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slide 145 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-034 | 0.4.3 Séparation — risque primaire/subsidiaire (restricted) | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | True/False | KOST F7.4 course slides 106, 110 | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.4-035 | 6.1.6 Notification du commandant de bord (restricted) | DRAFT — Tier B only, SOURCE REQUIRED for Tier A | MCQ | KOST F7.4 course slides 135–136 (DGR 9.5.1.1.3) | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |

**Batch composition:** 17 MCQ + 2 True/False. Block spread: Block 0 = 9
items (8 distinct leaves: 0.1.3, 0.1.4, 0.2.1, 0.2.2, 0.3.1, 0.3.3, 0.4.2,
0.4.3, 0.5.1, 0.6.1 — 10 leaves, since 0.2.1 alone carries 2 items), Block 4
= 2 items (2 leaves: 4.2.1, 4.2.2), Block 6 = 8 items (5 leaves: 6.1.2,
6.1.3, 6.1.6, 6.3.1, 6.3.3 — 6.3.3 alone carries 2 items).

**Combined Batch 1 + Batch 2 total: 35 items** (16 + 19), against the
111-question provisional ceiling — a source-yield ceiling, not a quota, per
standing instruction.

## What this batch does NOT do

- Does not exceed any per-sub-task ceiling in
  `docs/DGR_STAGE2A_FUNCTION_7.4_BLUEPRINT.md` — see the ceiling-compliance
  table above; every drawn count (including the combined Batch 1 + Batch 2
  total per leaf) is at or below its ceiling.
- Does not draft any item against the three confirmed `SOURCE GAP` leaves
  (4.2.5, 6.1.1, 6.3.4) — count remains 0 for all three across both
  batches, no exception, per binding caveat 1.
- Does not draft a second item for 0.4.3 or 6.1.6 beyond the single
  restricted-framing item each already carries at their 0–1 sample ceiling —
  both are now fully drawn at their maximum permitted figure (1), correctly,
  never testing the unsupported half of either sub-task (flight-ops/
  dispatch notification for 6.1.6; classification-stage hazard
  determination for 0.4.3).
- Does not draft an item for 6.3.2 — attempted and honestly declined this
  batch after finding no textually-distinct unloading-stage fact in the
  hidden-DG evidence pool (p.48–52); real yield lower than the leaf's own
  ceiling (2), per the blueprint's own no-padding instruction. Headroom (2)
  remains for a future batch if new source material narrows this gap.
- Does not draft any item from 4.2.4 (ULD labelling, real evidence p.112–
  114) or 0.6.2 (generic-awareness-only, sample 0–1, binding caveat 7) —
  left for a future batch; 0.6.2 in particular should stay minimal even
  then.
- **Leaves with zero items drawn across both Batch 1 and Batch 2, after this
  batch:** 4.2.4, 0.6.2 (real evidence, simply not yet drafted), 6.3.2
  (attempted, no distinct evidence found this batch), and the three
  confirmed `SOURCE GAP` leaves (4.2.5, 6.1.1, 6.3.4), which by definition
  will never carry an item without new source material.
- Does not perform Tier A (current DGR 67th Ed./Addendum 1) verification for
  any of the 35 items now in this bank (16 from Batch 1, 19 from Batch 2) —
  that remains the mandatory next step before any of these can move past
  `DRAFT`, blocked this pass on the confirmed absence of an authenticated
  Bookshelf session in this environment (see "Status of this batch" above).
- Does not mark any item `APPROVED` — no qualified reviewer exists in this
  pass.
- Does not touch Moodle or any live/production question-bank copy.
