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
