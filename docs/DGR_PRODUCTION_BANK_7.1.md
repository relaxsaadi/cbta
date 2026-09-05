# DGR Stage 2B — Function 7.1 Production Bank Expansion (Batch 1)

Continuation of the Function 7.1 question bank beyond the 12-item pilot
(`Q-7.1-001`–`Q-7.1-012`, frozen — see `docs/DGR_STAGE_2B_STATUS.md` and
`docs/DGR_SOURCE_REGISTER.md`). This file does **not** touch or renumber any
pilot item.

## Status of this batch — read before using any item below

**2026-08-25: all 7 items in this batch are now `FROZEN FR / SOURCE
VERIFIED`** against the live authenticated IATA Digital Publications
Bookshelf (`DGR-6066-67`, 67th Edition, Addendum 1 integrated), via the
`chrome-devtools` MCP. Full citations and before/after text are in
`docs/DGR_SOURCE_REGISTER.md`; summary status is in
`docs/DGR_STAGE_2B_STATUS.md`. Originally (prior pass) every item below was
sourced only from the KOST Function 7.1 training material (Tier B):
  - `01_KOST_DGR_CBTA_Function_7.1_Training_Course_FR_2025.pdf` (course, 3,700
    lines extracted with `pdftotext -layout`, formatrice Boufas Yasmina,
    dated 02/09/2025) — primary source, cited below by its own slide number.
  - `03_KOST_DGR_CBTA_Exam_Function_7.1_FR_Rev00_2025.pdf` (F-KOST 05, 20Q) —
    corroborating cross-reference only.
  - `KOST_DGR_CBTA_Practice_Book_Function_7.1_FR_2025.pdf` (F-KOST 09, 30Q) —
    corroborating cross-reference only.

**Tier A outcome per item:** Q-7.1-013–017 confirmed as drafted (Tier A
text matches the Tier B draft's substance, with minor terminology-drift
notes recorded in the source register). Q-7.1-018's correct answer was
confirmed but its **citation was corrected** — the actual evidentiary
source is Table 4.2 (UN1830) + Appendice A, not §3.0.2 (which is pure
class-taxonomy with no substance examples). Q-7.1-019's **content was
corrected** — the KOST slide's cited section ("DGR 6.0.4.2.1(c)") does not
exist in the current edition's structure (marking is now Part 7, not Part
6), and the current §7.1.3.2 four-criterion list differs from the drafted
answer (it includes "apposées sur un fond de couleur contrastante," which
the draft omitted). See that item's entry below for the revised question
text.

Per `.claude/rules/dgr-stage2b.md` rule 4, **no item in this batch is
`APPROVED`** — that requires a named qualified reviewer + review date,
a separate, not-yet-completed gate.

## Sub-task selection

Selected from the Block 0 rows of `docs/RECOVERED_STAGE2A_CONTEXT.md` that
are **not** already covered by the frozen 12-item pilot (pilot coverage:
`0.1.4` danger/risque → Q-7.1-001; forbidden-goods/`Acétylène` → Q-7.1-002;
9-classes count → Q-7.1-003; Class 8 label → Q-7.1-004; Propane
classification → Q-7.1-005; Class 8 Packing Group criteria, Special
Provisions A1/A2, excepted-quantity E0 → Q-7.1-006/007/008; lithium battery
PI 965 → Q-7.1-009; dry ice marking → Q-7.1-010; overpack labels →
Q-7.1-011; document retention → Q-7.1-012). This batch deliberately targets
7 **new** sub-tasks, all with real, directly-read Tier B evidence — no
sub-task was drafted without a located course/exam/practice-book trace.

| Sub-task | Title (per `docs/RECOVERED_STAGE2A_CONTEXT.md` / IATA Table 7.1.A wording) | New item |
|---|---|---|
| 0.1.1 | Comprendre la définition (Définition MD) | Q-7.1-013 |
| 0.1.2 | Reconnaître le cadre juridique (Cadre juridique) | Q-7.1-014 |
| 0.1.3 | Déterminer l'application et la portée | Q-7.1-015 |
| 0.2.2 | Reconnaître les marchandises dangereuses potentiellement cachées (MD cachées) | Q-7.1-016 |
| 0.2.3 | Être au courant des dispositions s'appliquant aux passagers | Q-7.1-017 |
| 0.4.1 | Trouver de l'information générale sur les classes et les divisions (Classes/divisions) | Q-7.1-018 |
| 0.5.1 | Reconnaître les prescriptions de base concernant le marquage | Q-7.1-019 |

**Note on 0.5.1's exact wording/blueprint counts:** `0.5.1` is not among the
Block 0 rows explicitly reproduced with a provisional question count/sample
figure in `docs/RECOVERED_STAGE2A_CONTEXT.md`'s current excerpt (that
excerpt names 10 of Block 0's 17 rows). Its official sub-task title used
here comes from `docs/DGR_STAGE1_FUNCTION_7.2_DRAFT.md`'s independently
confirmed finding that Function 7.2's Table 7.2.A Block 0 is "numerically
identical in count and wording" to Function 7.1's own Block 0 — i.e. this is
a real IATA table cross-reference, not an invented sub-task. No blueprint
question-count/sample figure is claimed for 0.5.1 here; none was fabricated.

**Note on 0.4.1's angle:** Q-7.1-003 (frozen pilot) already tests "how many
hazard classes exist" (§3.0.1.1/§3.0.2, nine classes). Q-7.1-018 below
deliberately tests a **different** angle under the same sub-task — assigning
a specific, named substance to its correct class — to avoid content overlap
with the frozen item while still belonging to `0.4.1`.

---

## Q-7.1-013 — Définition réglementaire d'une marchandise dangereuse

**Sub-task:** 0.1.1 Comprendre la définition
**Type:** MCQ, single-answer

**Stem (FR):** Au-delà du critère de danger pour la santé, la sécurité, la
propriété ou l'environnement, quel second critère permet de qualifier un
produit, article ou substance de « marchandise dangereuse » au sens du DGR ?

**Options:**
- **(Correct)** Il figure dans la liste des marchandises dangereuses du
  règlement, ou il est classé conformément à ce règlement.
- Il est transporté par voie aérienne commerciale.
- Il nécessite un emballage de spécification ONU.
- Il est accompagné d'une fiche de données de sécurité (SDS).

**Correct answer rationale:** Direct paraphrase of the course's own
two-clause definition: "Les marchandises dangereuses sont des produits,
articles ou des substances susceptibles de présenter un danger pour :
Santé, Sécurité, Propriété, Ou l'environnement, et qui figurent dans la
liste des marchandises dangereuses du présent règlement ou qui sont
classées conformément au présent règlement" (course slide 16, "Généralités
DGR 1.0").

**Distractor rationale (source-grounded, not inferred):**
- "Transporté par voie aérienne" — the mode of transport is not part of the
  definitional criterion on this slide; the same course material discusses
  air transport as context throughout, but the DGR 1.0 definition itself
  contains no transport-mode clause.
- "Emballage de spécification ONU" — packaging requirements are a
  *consequence* of DG classification (covered separately, e.g. course
  §DGR 6.0.4), not part of the definition itself.
- "Fiche de données de sécurité (SDS)" — the course elsewhere recommends
  requesting an SDS as a hidden-DG detection measure ("Demander la fiche de
  données de sécurité (SDS)", slide 49), a different topic (0.2.2), not part
  of the DGR 1.0 definition.

**Source basis:** Tier A — DGR 67th Ed. 2026, §1.0 Définition des
marchandises dangereuses (Partie 1, Bookshelf p.11): confirms the
two-clause definition essentially verbatim. Originally Tier B — KOST
Function 7.1 course, slide 16 ("Généralités DGR 1.0"); cross-referenced
(topic only) by KOST exam Q2 and practice book Q1.
**FR status:** FROZEN FR / SOURCE VERIFIED (Tier A confirmed 2026-08-25).
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.1-014 — Cadre juridique : qui codifie l'Annexe 18 ?

**Sub-task:** 0.1.2 Reconnaître le cadre juridique (mondial, national)
**Type:** MCQ, single-answer

**Stem (FR):** Selon la hiérarchie réglementaire présentée dans le cours,
quel organisme élabore la réglementation pour le transport aérien
sécuritaire des marchandises dangereuses, codifiée dans l'Annexe 18 et les
Instructions techniques (IT) de l'OACI ?

**Options:**
- **(Correct)** OACI — Organisation de l'Aviation Civile Internationale
- IATA — Association Internationale du Transport Aérien
- SCoETDG — Sous-comité d'experts du Conseil économique et social des
  Nations Unies
- AIEA — Agence internationale de l'énergie atomique

**Correct answer rationale:** Course slide 22 ("Cadre juridique —
Fondements de la Réglementation DGR 1.1"): "L'OACI s'est fondée sur ces
recommandations pour élaborer la Réglementation pour le transport
sécuritaire des marchandises dangereuses par voie aérienne. Cette
Réglementation est codifiée dans l'annexe 18 et dans les Instructions
techniques (IT)…"

**Distractor rationale (source-grounded):**
- IATA — per slide 23, IATA's DGR "comporte toutes les spécifications des
  IT" and adds more restrictive operational specifications, but the course
  explicitly attributes Annexe 18/IT *codification* to OACI, one slide
  earlier — IATA builds on it, does not create it.
- SCoETDG — per slide 20, this UN body "élabore des procédures recommandées
  pour le transport de toutes les marchandises dangereuses, à l'exception
  des matières radioactives", applicable to *all* transport modes, not
  specifically the air-transport Annexe 18 codification.
- AIEA — per slide 21, this body's role is limited to recommendations for
  the safe transport of *radioactive materials specifically*, reflected in
  Part 10 of the IATA manual, not the general Annexe 18 codification.

**Source basis:** Tier A — DGR 67th Ed. 2026, §1.1.1 (UNSCETDG, all modes
except radioactive), §1.1.2 (AIEA, radioactive materials only, Part 10),
§1.1.3 (OACI codifies Annexe 18 + IT Doc 9284), §1.1.4 (IATA DGR
incorporates all IT specs plus stricter additions) — Partie 1, Bookshelf
p.11. Originally Tier B — KOST Function 7.1 course, slides 20–24; the
current DGR acronym is "UNSCETDG" (course used "SCoETDG") — same body,
final wording should use the current-source acronym.
**FR status:** FROZEN FR / SOURCE VERIFIED (Tier A confirmed 2026-08-25).
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.1-015 — Champ d'application du DGR (DGR 1.2.1)

**Sub-task:** 0.1.3 Déterminer l'application et la portée
**Type:** True/False

**Stem (FR):** Vrai ou Faux : le champ d'application du DGR de l'IATA
(DGR 1.2.1) inclut les expéditeurs et agents qui proposent des envois de
marchandises dangereuses à un exploitant d'aéronef, en plus des exploitants
membres ou membres associés de l'IATA et des parties à l'accord multilatéral
de trafic intercompagnies de l'IATA-fret.

**Correct answer:** Vrai.

**Rationale:** Course slide 31 ("Applicabilité — Champ d'application
DGR 1.2.1"): "DGR de l'IATA est applicable à : Tous les exploitants qui
sont : Membres ou membres associés de l'IATA [ou] Parties à l'accord
multilatéral de trafic intercompagnies de l'IATA-fret [;] Aux expéditeurs et
agents qui proposent des envois de marchandises dangereuses à l'organisme
engagé dans une exploitation d'aéronef." All three categories in the stem
are explicitly listed.

**Distractor-equivalent (False-direction) rationale:** A "Faux" reading
would imply the scope is narrower (e.g. operators only, or shippers only) —
directly contradicted by the same slide explicitly naming both operator
categories *and* shippers/agents as jointly in scope. Not asserted from
silence: the slide's own bullet list is the positive evidence for the
conjunction.

**Source basis:** Tier A — DGR 67th Ed. 2026, §1.2.1 Application (Partie 1,
Bookshelf p.11): confirms all three categories (member/associate-member
operators; interline-agreement operators; shippers/agents presenting DG to
those operators) explicitly in scope. Originally Tier B — KOST Function 7.1
course, slide 31; current-source phrase is "accord IATA sur le transport
intertransporteurs de marchandises" (course: "accord multilatéral de trafic
intercompagnies de l'IATA-fret") — same concept, terminology drift.
**FR status:** FROZEN FR / SOURCE VERIFIED (Tier A confirmed 2026-08-25).
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.1-016 — Exemple de marchandise dangereuse potentiellement cachée (DGR 2.2.4)

**Sub-task:** 0.2.2 Reconnaître les marchandises dangereuses potentiellement cachées
**Type:** MCQ, single-answer

**Stem (FR):** D'après la liste d'exemples de marchandises dangereuses
potentiellement cachées présentée dans le cours (DGR 2.2.4), lequel des
éléments suivants y figure explicitement ?

**Options:**
- **(Correct)** Échantillons de diagnostic
- Vêtements neufs sous emballage plastique
- Livres et documents imprimés
- Denrées alimentaires non réfrigérées

**Correct answer rationale:** Course slide 48 ("Exemples de DG cachées
DGR 2.2.4") lists exactly: pièces de rechange pour aéronefs au sol (AOG),
automobiles/pièces détachées/fournitures automobiles, appareils dentaires,
**échantillons de diagnostic**, régulateurs de carburant, réfrigérateurs,
kits de réparation, échantillons pour les tests.

**Distractor rationale (source-grounded):** None of the three distractors
appears anywhere in the course's own DGR 2.2.4 example list read this
session — they are ordinary, non-hazardous household/office items chosen to
be clearly absent from the actual 8-item list, not near-misses requiring
inference. (Deliberately avoided "aliments surgelés" as a distractor, since
that item appears in the KOST exam's own Q11 exercise grouped with hidden-DG
detection — using it here would risk a source conflict rather than a clean
false distractor.)

**Source basis:** Tier A — DGR 67th Ed. 2026, §2.2.4 (Partie 2, Bookshelf
p.12 area): current list explicitly includes "ÉCHANTILLONS DIAGNOSTIQUES"
plus all other KOST-cited items ("PIÈCES DE RECHANGE POUR AÉRONEF AU SOL,"
"RÉGULATEURS DE CARBURANT," "REFRIGÉRATEURS," "TROUSSES DE RÉPARATION,"
"ÉCHANTILLONS POUR ESSAIS"); the three distractors confirmed absent from
the current list. Originally Tier B — KOST Function 7.1 course, slides
47–48; current heading term is "Échantillons diagnostiques" (adjective
form) — align final wording to this exact current term.
**FR status:** FROZEN FR / SOURCE VERIFIED (Tier A confirmed 2026-08-25).
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.1-017 — Marchandises dangereuses transportées par les passagers (DGR 2.3)

**Sub-task:** 0.2.3 Être au courant des dispositions s'appliquant aux passagers
**Type:** True/False

**Stem (FR):** Vrai ou Faux : selon le cours (DGR 2.3), les marchandises
dangereuses, y compris les colis exceptés de matières radioactives, sont
interdites au transport par les passagers ou l'équipage — que ce soit comme
ou dans les bagages enregistrés, en bagage à main, ou sur leur personne —
sauf dans les cas expressément autorisés par le règlement pour un usage
personnel.

**Correct answer:** Vrai.

**Rationale:** Course slide 44 ("MD Transportées par les passagers ou
l'équipage DGR 2.3"): "Les marchandises dangereuses, y compris les colis
exceptés de matières radioactives, sont interdites au transport par les
passagers ou l'équipage : comme ou dans les bagages enregistrés ; en tant
que bagage à main ou ; sur leur personne ; sauf dans les cas autorisés aux
points 2.3.2 à 2.3.5 pour un usage personnel." This item deliberately stops
at the general prohibition-plus-exception-pointer level ("dispositions
s'appliquant aux passagers" = "être au courant", per the sub-task's own
verb), matching the KOST course's own framing on the adjoining slide 45
("Limites — Dispositions relatives aux passagers et au fret": "Seuls les
articles spécifiés aux points 2.3.2 à 2.3.5 sont autorisés, et uniquement
pour un usage personnel"). It does **not** test the content of 2.3.2–2.3.5
themselves — that would need separate, dedicated source evidence not
retrieved this session.

**Source basis:** Tier A — DGR 67th Ed. 2026, §2.3.0.1 (Partie 2, Bookshelf
p.12 area): confirms the prohibition across registered baggage, cabin
baggage, and on the person, with exceptions at §2.3.2–2.3.5 for personal
use. Originally Tier B — KOST Function 7.1 course, slide 44 ("MD
Transportées par les passagers ou l'équipage DGR 2.3") and slide 45
("Limites — Dispositions relatives aux passagers et au fret"); "bagage à
main" (course) = "bagages de cabine" (current text), same concept.
**FR status:** FROZEN FR / SOURCE VERIFIED (Tier A confirmed 2026-08-25).
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.1-018 — Classe de l'acide sulfurique (DGR 3.0.2)

**Sub-task:** 0.4.1 Trouver de l'information générale sur les classes et les divisions
**Type:** MCQ, single-answer

**Stem (FR):** Selon le cours (DGR 3.0.2), à quelle classe de marchandises
dangereuses appartiennent l'acide sulfurique et l'acide de batterie ?

**Options:**
- **(Correct)** Classe 8 — Matières corrosives
- Classe 3 — Liquides inflammables
- Division 6.1 — Substances toxiques
- Classe 9 — Matières et objets dangereux divers

**Correct answer rationale:** Course's "Les classes des marchandises
dangereuses DGR 3.0.2" slide series, Class 8 slide: "Matières corrosives
(RCM) — Ex : acide sulfurique, mercure, acide pour batterie." Independently
corroborated by KOST Practice Book Q10, which asks the identical question
directly ("Quelle est la classe/division de l'acide Sulfurique ?") — this
is a real, examined fact in the actual Function 7.1 material, not an
invented pairing.

**Distractor rationale (source-grounded — each wrong option is refuted by
the same slide series' own named examples for that class, not by
inference):**
- Class 3 (liquides inflammables) — the course's own Class 3 example is
  "Essence, alcool, huile", not sulfuric/battery acid.
- Division 6.1 (substances toxiques) — the course's own Division 6.1
  examples are "arsenic, Nicotine, pesticides."
- Class 9 (divers) — the course defines Class 9 as matières/objets whose
  risk characteristics differ from all other classes' — corrosivity is
  precisely what Class 8 exists to cover, so this option is refuted by the
  same slide's own class-boundary description.

**Source basis:** Tier A — DGR 67th Ed. 2026, Table 4.2, entry `UN1830
Acide sulfurique (contenant plus de 51% d'acide)` = Classe 8, étiquette
"Corrosif" (Bookshelf p.326), corroborated by the Appendice A Glossaire's
electrolyte/battery-acid description (p.703). **Citation correction:**
§3.0.2 (Bookshelf p.307), the section actually cited by the KOST slide, is
pure class-name taxonomy with no substance examples at all in the current
edition — it cannot be the evidentiary source for this fact and is retained
only as the source for the three distractor class labels (Classe 3, Division
6.1, Classe 9), all confirmed real and distinct. Originally Tier B — KOST
Function 7.1 course, "Les classes des marchandises dangereuses DGR 3.0.2"
slide series; cross-verified by KOST Practice Book Q10.
**FR status:** FROZEN FR / SOURCE VERIFIED (Tier A confirmed 2026-08-25;
citation reassigned from §3.0.2 to Table 4.2 UN1830 + Appendice A — see
`docs/DGR_SOURCE_REGISTER.md`). Distinct angle from the frozen Q-7.1-003,
which tests the count of hazard classes, not a specific substance's class
assignment — see "Sub-task selection" note above.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.

---

## Q-7.1-019 — Caractéristiques requises des marquages (DGR 67e §7.1.3.2)

**2026-08-25 CORRECTION NOTICE:** the KOST slide's citation
"DGR 6.0.4.2.1(c)" does not exist in the current 67th Edition/Addendum 1
structure — marking is now under **Part 7** (Partie 7 — Marquage et
Étiquetage), not Part 6 (which is now packaging performance-test
specifications), consistent with frozen pilot items Q-7.1-004/010/011. The
applicable current provision, **§7.1.3.2 "Qualité"**, lists **four**
criteria that differ from the KOST slide's list — the KOST slide omits
"apposées sur un fond de couleur contrastante" entirely. Stem and correct
answer below are the **corrected, Tier A-sourced version**; the original
Tier B stem/answer are preserved struck through immediately after for the
audit trail. Distractors are unchanged (still refuted by the corrected
list) and are not repeated twice.

**Sub-task:** 0.5.1 Reconnaître les prescriptions de base concernant le marquage
**Type:** MCQ, single-answer

**Stem (FR, corrected):** D'après le DGR 67e édition (§7.1.3.2 Qualité),
quelles sont les quatre caractéristiques que doivent respecter les marques
apposées sur un colis de marchandises dangereuses ?

**Options:**
- **(Correct)** Durables, facilement visibles et lisibles, pouvant être
  exposées aux intempéries sans dégradation notable, et apposées sur un
  fond de couleur contrastante.
- Colorées, numérotées, plastifiées et amovibles.
- Imprimées uniquement en anglais, certifiées ISO, et scellées.
- Visibles et lisibles, mais sans exigence de durabilité ni de résistance
  aux intempéries.

**Correct answer rationale:** DGR 67th Ed. 2026, §7.1.3.2 Qualité (Partie 7
— Marquage et Étiquetage, Bookshelf p.688 area): "Toutes les marques
doivent être : (a) durables et être imprimées ou autrement apposées sur la
surface extérieure du colis ou du suremballage; (b) facilement visibles et
lisibles; (c) pouvoir être exposées aux intempéries sans dégradation
notable; et (d) apposées sur un fond de couleur contrastante." Read
directly from the live authenticated IATA Bookshelf, `chrome-devtools` MCP,
2026-08-25.

**Original Tier B stem/answer (superseded, kept for audit trail only —
do not use):** ~~"D'après le cours (DGR 6.0.4.2.1(c)), quelles sont les
quatre caractéristiques que doivent respecter les marquages apposés sur un
colis de marchandises dangereuses ? (Correct) Visibles, lisibles, durables,
et pouvant résister aux intempéries."~~ — based on course slide 141
("Marquage à spécification des emballages"): "Tout colis de marchandises
dangereuses doit être marqué. Les marquages doivent être : Visibles,
Lisibles, Durable, Pouvoir être exposées aux intempérie[s]." This list
omits the current edition's 4th criterion ("fond de couleur contrastante")
and does not match any current section number — superseded by the
Tier A-verified version above.

**Distractor rationale (source-grounded, still valid against the corrected
list):**
- "Colorées, numérotées, plastifiées et amovibles" — none of these four
  terms appear in the current §7.1.3.2(a)-(d) list.
- "Imprimées uniquement en anglais, certifiées ISO, et scellées" — same
  reasoning; not part of the current criteria (language requirements are
  addressed separately at §7.1.3.3, not as a marking-quality criterion).
- "Visibles et lisibles, mais sans exigence de durabilité ni de résistance
  aux intempéries" — a partial-truth distractor: criterion (b) is kept, but
  (a) "durables" and (c) "pouvoir être exposées aux intempéries" are
  explicitly and directly denied by the same current list, not by
  inference.

**Source basis:** Tier A — DGR 67th Ed. 2026, §7.1.3.2 Qualité (Partie 7 —
Marquage et Étiquetage, Bookshelf p.688 area). Originally Tier B — KOST
Function 7.1 course, slide 141 ("Marquage à spécification des emballages",
citing the now-superseded "DGR 6.0.4.2.1(c)"); slides 138–140 read for
surrounding context. Loosely corroborated (topic only) by KOST exam Q12 /
practice book Q19 (why packages must be marked/labelled — a related but
distinct question, not reused verbatim).
**FR status:** FROZEN FR / SOURCE VERIFIED — content corrected 2026-08-25
(see correction notice above and `docs/DGR_SOURCE_REGISTER.md`). Sub-task
`0.5.1`'s exact blueprint provisional-count/sample figures were not present
in the currently recovered `docs/RECOVERED_STAGE2A_CONTEXT.md` excerpt — see
"Sub-task selection" note above; not fabricated here.
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED (re-required: correct
answer text changed from the original draft — any prior EN work on the old
wording is void).
**Approval:** PENDING REVIEWER + DATE.

---

## Summary table

| ID | Sub-task | FR status | Type | Current source basis (Tier) | EN status | Approval |
|---|---|---|---|---|---|---|
| Q-7.1-013 | 0.1.1 Définition MD | FROZEN FR / SOURCE VERIFIED | MCQ | DGR 67e §1.0 (p.11) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.1-014 | 0.1.2 Cadre juridique | FROZEN FR / SOURCE VERIFIED | MCQ | DGR 67e §1.1.1–1.1.4 (p.11) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.1-015 | 0.1.3 Application/portée | FROZEN FR / SOURCE VERIFIED | True/False | DGR 67e §1.2.1 (p.11) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.1-016 | 0.2.2 MD cachées | FROZEN FR / SOURCE VERIFIED | MCQ | DGR 67e §2.2.4 (p.12 area) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.1-017 | 0.2.3 Passagers | FROZEN FR / SOURCE VERIFIED | True/False | DGR 67e §2.3.0.1 (p.12 area) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.1-018 | 0.4.1 Classes/divisions | FROZEN FR / SOURCE VERIFIED (citation corrected) | MCQ | DGR 67e Table 4.2 UN1830 (p.326) + Appendice A (p.703) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |
| Q-7.1-019 | 0.5.1 Marquage | FROZEN FR / SOURCE VERIFIED (content corrected) | MCQ | DGR 67e §7.1.3.2 (p.688 area) — Tier A | BILINGUAL TECHNICAL REVIEW REQUIRED (re-required, wording changed) | PENDING REVIEWER + DATE |

**Batch composition:** 5 MCQ + 2 True/False, consistent with the pilot's own
type-mix guardrails (at least 2 True/False, remaining MCQ/scenario).

## What this batch does NOT do

- Does not touch, reword, or renumber Q-7.1-001–Q-7.1-012 (frozen).
- Does not mark any item `APPROVED` — no qualified reviewer exists in this
  pass; Tier A source verification (2026-08-25) and reviewer sign-off remain
  separate gates.
- Does not touch Moodle or any live/production question-bank copy.
- Does not exhaust Block 0 or Block 1 — this is a deliberately small,
  thin-but-verified batch per the task's own instruction ("target 5-8
  questions, not more").

**2026-08-25 update:** Tier A verification for all 7 items is now complete
— see the per-item "Source basis"/"FR status" fields above and
`docs/DGR_SOURCE_REGISTER.md` for full citations. Q-7.1-019's content was
corrected (not just re-cited); its EN review requirement is reset
accordingly.
