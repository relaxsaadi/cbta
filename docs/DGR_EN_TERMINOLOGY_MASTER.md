# DGR/CBTA EN Terminology — Cross-Function Master Reference

**Status: PREPARATION MATERIAL ONLY. Not a review, not a decision, not a
source of truth.** This file is a consolidated cross-reference built by
reading, in full, the "Bilingual terminology table" section of all ten
existing EN review packages (`docs/DGR_EN_REVIEW_PACKAGE_7.1.md` through
`docs/DGR_EN_REVIEW_PACKAGE_7.10.md`) and grouping French DGR/CBTA terms
that recur across more than one function's table. It does **not** perform
Tier A regulatory verification, does **not** resolve any flagged
terminology decision, and does **not** move any item closer to
`APPROVED`. Every conclusion below is "here is what the ten packages
already say, cross-referenced" — never a new translation judgment.

Per `.claude/rules/dgr-stage2b.md` rule 5, bilingual EN review is a
separate gate from Tier A French regulatory verification. Nothing in this
file substitutes for either gate, and no named-reviewer sign-off exists
for any term or item discussed here.

Prepared 2026-08-25, cross-referencing the production-bank state as of
commit `e10ae58` ("fourth milestone — all 453 items now have EN
translation drafts").

---

## How to read this document

- **Scope:** only French terms that appear in **more than one** of the
  ten packages' terminology tables are covered here. A term used in only
  one function's table is out of this cross-function audit's scope by
  design (Task instruction) — it remains visible, with whatever flag it
  already carries, only in that function's own
  `docs/DGR_EN_REVIEW_PACKAGE_7.X.md` file, and is not duplicated here.
- **Three tiers, sorted by reviewer leverage:**
  - **Part A — CROSS-FUNCTION INCONSISTENCY.** Different functions chose
    **different** English wording for the same (or a near-identical)
    French term. Resolving one of these fixes every affected item across
    every affected function at once — the highest-value catches for a
    reviewer to clear early.
  - **Part B — Consistent, but still unverified.** Every function that
    used the term chose the **same** English wording, but every one of
    them independently flagged it as an unverified/candidate rendering
    (no Tier A English 67th Edition text was read this session). One
    reviewer decision resolves the open question **and** propagates
    everywhere at once.
  - **Part C — Consistent, established/standard.** Every function that
    used the term chose the same English wording, and it carries
    "Standard" verification status (ordinary, well-established IATA/UN DG
    English, low translation risk). These are ready to bulk-confirm; no
    substantive disagreement exists.
- **What "consistent" does NOT mean:** it does not mean Tier A-verified.
  Consistent-but-unsourced is still unsourced. See
  `docs/DGR_EN_REVIEWER_GUIDE.md` for the full explanation of what
  finishing EN review does and does not close.
- **Cosmetic variance is not flagged as inconsistency.** Differences that
  are purely capitalization ("Hazard Label" vs. "Hazard label"),
  singular/plural matching the French source, or optional
  spelled-out-once abbreviations ("IATA" vs. "IATA (International Air
  Transport Association)") are treated as the same term in Part C, with
  a note where relevant. Only genuinely different wording, word order, or
  scope is treated as a Part A inconsistency.

---

## Summary counts

| Metric | Count |
|---|---|
| Terminology-table rows read in full, across all 10 packages | 654 |
| Distinct FR term strings (exact match, before merging near-duplicates) | 416 |
| **FR terms recurring in ≥2 of the ten packages (this audit's scope)** | **87** |
| — Part A: CROSS-FUNCTION INCONSISTENCY | **16** |
| — Part B: consistent EN choice, but every instance flagged unverified | **6** |
| — Part C: consistent EN choice, standard/low-risk | **65** |
| Terms appearing in only 1 function's table (out of this audit's scope) | ~329 |

These are **preparation-stage counts**, not review outcomes. "Consistent"
(Parts B/C) means the ten packages already agree with each other on
wording — it does not mean any of that wording has been checked against
an official English IATA DGR 67th Edition text.

---

## Part A — CROSS-FUNCTION INCONSISTENCIES (resolve first)

For each term: the French source term, every function's exact English
rendering with its item references, and a plain-language note on what the
reviewer needs to decide. Ranked highest-leverage first.

### A1. Dry ice / Solid carbon dioxide — word order AND primary-name choice
*(Neige carbonique / Glace sèche / Dioxyde de carbone solide / Glace carbonique)*

The single largest catch: 9 of 10 functions have a dedicated row for this
term, and they split almost evenly on whether "Dry ice" or "Solid carbon
dioxide" leads.

- **7.1:** *"Dry ice (formal PSN: Carbon Dioxide, Solid)"* — Q-7.1-010
- **7.3:** *"Dry ice / Solid carbon dioxide"* — Q-7.3-030, Q-7.3-031
- **7.4:** *"Dry ice"* (alone, no secondary form given) — Q-7.4-028, 041
- **7.5:** *"Solid carbon dioxide / Dry ice"* — Q-7.5-014, 026, 027
- **7.6:** *"Dry ice / Solid carbon dioxide"* — Q-7.6-032
- **7.7:** *"Solid carbon dioxide (dry ice)"* — Q-037
- **7.8:** *"Dry ice / solid carbon dioxide"* — Q-003, 012
- **7.9:** *"Solid carbon dioxide (dry ice)"* — Q-009, 010, 033
- **7.10:** *"dry ice"* (lowercase, embedded in an unrelated combined-term row) — Q-028
- **7.2:** no dedicated row.

"Dry ice" leads in 7.1/7.3/7.4/7.6/7.8; "Solid carbon dioxide" leads in
7.5/7.7/7.9. 7.1's package additionally raises the formal-PSN question
("Carbon Dioxide, Solid" vs. the more common "Solid carbon dioxide"
phrasing used elsewhere) — a second, related open question the reviewer
should settle at the same time.

### A2. Commandant de bord — "Captain" vs. "Pilot-in-command (PIC)"

- **7.4:** *"Pilot-in-command (PIC)"* — Q-7.4-012, 018, 021, 025 (distractor), 035, 048, 052
- **7.6:** *"Pilot-in-command"* — Q-7.6-004, 009, 010, 027, 031
- **7.7:** *"Captain"* — Q-001, 009, 027, 033
- **7.8:** *"Captain"* — Q-001, 006, 013, 025
- **7.9:** *"Captain"* — Q-003, 029, 031

7.4 and 7.6 use "Pilot-in-command (PIC)"; 7.7, 7.8, and 7.9 use "Captain"
(the latter three anchor the choice to "NOTOC (Notification **to
Captain**)"). Both are legitimate IATA/ICAO-adjacent terms but they are
not interchangeable in a formal exam bank — 12 items across 5 functions
are affected.

### A3. SCoETDG — three different English acronym choices

- **7.2:** kept as **"SCoETDG"** — *"UN Sub-Committee of Experts on the
  Transport of Dangerous Goods (course abbreviation 'SCoETDG' kept)"* — Q-7.2-001
- **7.4:** converted to **"SCETDG"** — *"UN Sub-Committee of Experts on
  the Transport of Dangerous Goods (SCETDG)"* — Q-7.4-002
- **7.3, 7.5, 7.6, 7.7, 7.8, 7.10:** converted to **"UNCETDG"** — *"UNCETDG
  (UN Committee of Experts on the Transport of Dangerous Goods)"* —
  Q-7.3-015, Q-7.5-002, Q-7.6-016, Q-017 (7.7), Q-016 (7.8), Q-017 (7.10)

Three different English abbreviations for the same French acronym across
8 functions, none independently verified. This needs one authoritative
answer (the reviewer may know the UN body's actual current English
abbreviation directly).

### A4. IATA Cargo Multilateral Interline Traffic Agreement — four word orders

*(Accord multilatéral de trafic intercompagnies de l'IATA-fret / fret de
l'IATA)*

- **7.2:** *"IATA Cargo Multilateral Interline Traffic Agreement"* — Q-7.2-013
- **7.4:** *"IATA Cargo Interline Traffic Agreement (multilateral)"* — Q-7.4-026
- **7.6:** *"IATA Multilateral Interline Traffic Agreement – Cargo"* — Q-7.6-017
- **7.7:** *"IATA Cargo Interline Multilateral Traffic Agreement"* — Q-017
- **7.8:** *"IATA Cargo Interline Multilateral Traffic Agreement"* — Q-017
- **7.9:** *"IATA Cargo Interline Multilateral Traffic Agreement"* — Q-021

Four distinct word arrangements of "IATA / Cargo / Multilateral /
Interline / Traffic / Agreement" across 6 functions, all flagged
unverified. The reviewer likely knows the agreement's actual published
title outright.

### A5. Disposition spéciale — formal capitalized "Special Provision" vs. generic lowercase, unresolved ambiguity

- **7.3:** *"Special provision (candidate)"* — **self-flagged**: *"reviewer
  should confirm whether this is the same DGR 4.4-numbered 'Special
  Provision (SP)' mechanism ... or a distinct, non-numbered course
  usage"* — Q-7.3-041
- **7.4:** *"Special Provision"* (capitalized, treated as the formal
  numbered DGR mechanism) — *"Standard, per Function 7.1's terminology
  table"* — Q-7.4-014 (distractor)
- **7.5:** *"Special provision (lowercase, generic sense)"* —
  **deliberately** lowercased *"to avoid conflating with the fixed DGR
  'Special Provision (SP)' numbered-code term"* — Q-7.5-029
- **7.7:** *"Special provision"* (lowercase, no comment) — Q-013
- **7.9:** *"Special provision"* (lowercase, no comment) — Q-036

This is not just a casing issue: 7.3 explicitly flags the ambiguity as
unresolved, 7.5 explicitly resolves it one way (deliberately generic,
distinct from the formal SP mechanism), 7.4 implicitly resolves it the
other way (treats it as the formal SP mechanism), and 7.7/7.9 use the
lowercase form with no comment either way. Five functions, three
different treatments of the same open question. This should be resolved
together with the "Disposition particulière (DP)" → "Special Provision
(SP)" formal term in Part C (item C-32 below), which is not in dispute.

### A6. Déclaration de l'expéditeur (DGD) — full phrase vs. shortened form

- **7.2:** *"Shipper's Declaration for Dangerous Goods (DGD)"* — Q-7.2-003, 012, 014, 023
- **7.3:** *"Shipper's Declaration for Dangerous Goods (DGD)"* — Q-7.3-005, 006, 007, 023, 032
- **7.6:** *"Shipper's Declaration for Dangerous Goods (DGD)"* — Q-7.6-025
- **7.7:** *"Shipper's Declaration (for Dangerous Goods, DGD)"* — Q-004, 026, 028, 031
- **7.9:** *"Shipper's Declaration (for Dangerous Goods, DGD)"* — Q-029
- **7.8:** *"Shipper's Declaration (DGD)"* — **drops "for Dangerous Goods"
  entirely** — Q-024, 027

7.8's rendering is a genuine content omission, not just punctuation — the
full institutional name is missing. (7.10's related-but-distinct
"Documentation de l'expéditeur (DGR 8.0.1)" → "Shipper documentation" is
a broader DGR 8.0.1 concept, not the DGD form itself, and is not counted
as part of this inconsistency.)

### A7. Codes cargo IMP — word order

- **7.4:** *"IMP Cargo Codes"* — Q-7.4-041
- **7.7:** *"Cargo IMP Codes (Appendix B.2.2.4)"* — Q-037
- **7.10:** *"IMP cargo codes"* — Q-037

The same French phrase "Codes cargo IMP" is translated with "IMP" first
in 7.4/7.10 and "Cargo" first in 7.7.

### A8. Matière très/moyennement/faiblement dangereuse — "minor (low)" vs. "Low"

- **7.3:** *"High / medium / minor (low) danger substance"* — self-flagged,
  informal course scale — Q-7.3-022
- **7.6:** *"High / medium / minor (low) danger substance"* — same flag — Q-7.6-023
- **7.4:** *"High/Medium/Low danger substances"* — separately flagged,
  unverified — Q-7.4-031

7.3/7.6 agree with each other; 7.4 uses "Low" instead of "minor (low)"
for the same three-tier scale. Both readings are already individually
flagged as unverified informal course terminology — the wording should
converge once the reviewer decides on one.

### A9. COMAT — three different acronym expansions

- **7.2:** *"COMAT (Company Materiel — aircraft spare parts/materials)"* — Q-7.2-033
- **7.5:** *"COMAT"* (unexpanded) — background note: *"Company
  Materials"* (plural) — Q-7.5-003, 023
- **7.8:** *"COMAT (Company Material)"* (singular) — Q-038

"Materiel" (7.2, French-derived spelling) vs. "Material" (7.8, singular)
vs. "Materials" (7.5, plural) — three different expansions of the same
standard aviation acronym.

### A10. Formation initiale / Actualisation des connaissances — "Knowledge refresher" vs. "Refresher of knowledge"

- **7.2:** *"Initial training / Knowledge refresher / Mandatory test"* — Q-7.2-036
- **7.10:** *"Initial training / knowledge refresher / mandatory test"* — Q-022, 027
- **7.5:** *"Initial training / Refresher of knowledge / Mandatory test"* — **word order reversed** — Q-7.5-037

7.2 and 7.10 agree ("Knowledge refresher"); 7.5 reverses the phrase order
("Refresher of knowledge").

### A11. Case « Renseignements sur la manutention » — word order and confidence level both differ

- **7.2:** *""Handling Information" box (AWB)"* — *Standard* — Q-7.2-020
- **7.8:** *""Handling Information" box (AWB)"* — *Standard* — Q-047
- **7.6:** *"Handling Information (AWB box)"* — word order flipped
  ("AWB box" not "box (AWB)") — *Standard* — Q-7.6-025
- **7.7:** *""Handling Information" box"* — no "(AWB)" suffix, and **flagged
  unverified** where the other three call it Standard — Q-048

Same underlying AWB field name, four functions, two different phrasings
and an unexplained confidence-level split.

### A12. Pièces de rechange pour aéronefs au sol (AOG) — word order

- **7.4:** *"Aircraft-on-Ground (AOG) spare parts"* — Q-7.4-019
- **7.7:** *"Spare parts for aircraft on ground (AOG)"* — Q-007

### A13. Colis exceptés de matières radioactives — word order

- **7.9:** *"Excepted radioactive material packages"* — Q-011
- **7.10:** *"Excepted packages of radioactive material"* — Q-011

### A14. Matières biologiques Catégorie B (UN 3245) — word order (1 outlier of 6)

- **7.2, 7.7, 7.8, 7.9, 7.10:** *"Category B biological substances (UN
  3245)"* (5 functions agree)
- **7.6:** *"Biological substances, Category B"* — reversed order, and
  drops the "(UN 3245)" reference

### A15. Documents d'expédition / de transport — "documents" vs. "documentation"

- **7.2:** *"Shipment documents / transport documents"* — Q-7.2-006, 007, 020, 044, 047
- **7.3:** *"Shipment documentation / transport documents"* — Q-7.3-008, 032

### A16. Renseignements appropriés en cas d'urgence — "Appropriate" dropped in one function

- **7.7:** *"Appropriate emergency response information"* — Q-027
- **7.9:** *"Appropriate emergency response information"* — Q-031
- **7.10:** *"Emergency response information"* — drops "Appropriate";
  FR source itself also shortens to "Renseignement en cas d'urgence"
  (singular, no "appropriés") — Q-026, 040

Lowest-severity entry in Part A — may simply reflect a genuinely shorter
FR source phrase in Function 7.10's course material rather than a
translation choice; flagged here only so the reviewer can confirm which
it is.

---

## Part B — Consistent across functions, but every instance still unverified

Same English choice everywhere it was used — no disagreement — but every
function that used it independently flagged it as a candidate/unverified
rendering (no Tier A English text read this session). One reviewer
decision settles the open question **and** simultaneously closes the flag
on every listed item.

### B1. Dérogation → "Exemption"
8 functions: 7.1 (as part of "interdit, sauf dérogation" →
*"forbidden, except by exemption"*, Q-7.1-002), 7.3 (Q-7.3-001, 018, 024,
032), 7.4 (as "Aucune dérogation / Dérogation" → *"No exemption /
Exemption"*, Q-7.4-009), 7.5 (Q-7.5-024), 7.7 (Q-037), 7.8 (Q-024), 7.9
(Q-024), 7.10 (Q-038, kept distinct from "Exceptions DGR 1.2.7"). Every
instance flagged unverified against a supplied English 67th Edition text.
(7.2 and 7.6 have no "dérogation" row.)

### B2. Divergence d'État / Divergence d'exploitant → "State variation / Operator variation"
8 functions: 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10 — the single most
cross-referenced pair in the whole program (each later package explicitly
notes it is "kept consistent with Function 7.3's package"). **One
inconsistency inside the consistency:** 7.4 marks this "Standard IATA
term" with no flag, while the other 7 functions all explicitly flag it as
an unverified "Variation" candidate. The reviewer should note that 7.4's
higher confidence is not independently justified in that package and
should be reconciled with the other seven's flag, not silently kept as an
exception.

### B3. Document « terrain » → "'Field' document"
3 functions: 7.2 (Q-7.2-030), 7.5 (Q-7.5-032), 7.7 (Q-036). No confirmed
standard IATA English equivalent identified in any of the three sessions.

### B4. Appareils électroniques portables (AEP) → "Portable electronic devices (PEDs)"
3 functions: 7.5 (Q-7.5-011), 7.9 (Q-032, 034), 7.10 (Q-012). Consistent
candidate acronym pairing, unverified in all three.

### B5. Agent des opérations aériennes / Régulateur de vols → "Flight operations officer" / "Flight dispatcher"
4 functions: 7.4 (Q-7.4-025, paired), 7.6 (Q-7.6-010), 7.7 (Q-011, paired),
7.8 (Q-005, 006, 013, 029 / Q-006 note). Consistently paired the same way
in all four; every instance flagged as an unverified candidate (7.4's
flag is for a different reason — a confirmed course SOURCE GAP — but the
EN wording itself is the same unverified candidate as the other three).

### B6. Étiquette de danger chimique / « autres étiquettes » → "Chemical hazard label" / "'other labels'"
5 functions: 7.3 (Q-7.3-036, **self-flagged** as a course-informal,
non-DGR category), 7.5 (Q-7.5-041), 7.7 (Q-009, 010), 7.8 (Q-009, 010),
7.10 (Q-005, 006). The English wording is identical everywhere it
appears, but only 7.3 carries the explicit "Flagged" marker — 7.5/7.7/
7.8/7.10 all downgrade the same wording to "Standard" without restating
7.3's own caveat that this is an informal KOST category, not a defined
DGR term. The reviewer should treat this as still-open across all five,
not resolved by the later functions' silence.

---

## Part C — Consistent, established/standard (bulk-confirmable)

Every function that used these chose the same English wording, and it
already carries "Standard" verification status in every package (no flag
raised anywhere). Purely cosmetic variance (capitalization,
singular/plural matching the French source, an abbreviation spelled out
on first use) is noted in parentheses rather than treated as
disagreement. Grouped roughly by how many functions share the term.

**Used in most/all 10 functions:**
- **C1. Marchandise(s) dangereuse(s) → "Dangerous Goods (DG)"** — all 10 functions.
- **C2. Groupe d'emballage → "Packing Group"** — all 10 functions.
- **C3. Danger → "Hazard"** — 9 dedicated rows (7.4 pairs it as "Danger / Risque").
- **C4. Risque → "Risk"** — 9 dedicated rows (7.4 pairs it as "Danger / Risque").
- **C5. OACI → "ICAO (International Civil Aviation Organization)"** — 9 functions.
- **C6. Marchandise dangereuse cachée (+variants) → "Hidden dangerous good(s) / concealed DG"** — 5 functions (7.2, 7.4, 7.5, 7.8, 7.9); cosmetic singular/plural and "(concealed DG)" gloss variance only.

**Used in 6–8 functions:**
- **C7. AIEA → "IAEA (International Atomic Energy Agency)"** — 8 functions.
- **C8. Expéditeur → "Shipper"** — 8 functions.
- **C9. Étiquette de danger (sg./pl.) → "Hazard label(s)"** — 8 functions (capitalized "Hazard Label" in 7.1/7.2 only, cosmetic).
- **C10. Fiche de données de sécurité (SDS/FDS) → "Safety Data Sheet (SDS)"** — 7 functions ("Safety Data Sheet" capitalized in 7.2/7.4/7.5; "Safety data sheet" lowercase in 7.3/7.6/7.7/7.9 — cosmetic).
- **C11. Agence Nationale de l'Aviation Civile (ANAC) → "National Civil Aviation Agency (ANAC)"** — 7 functions (7.2 alone appends "[Algeria]" — cosmetic).
- **C12. Classe / Division → "Class / Division"** — 7 functions.
- **C13. Exploitant → "Operator"** — 7 functions.
- **C14. Instructions techniques (IT) → "Technical Instructions (TI)"** — 6 functions (7.9 drops the "(TI)" short form — cosmetic).
- **C15. Article / Substance → "Article / Substance"** (kept as direct cognates) — 6 functions.
- **C16. Étiquette de manutention (sg./pl.) → "Handling label(s)"** — 6 functions (capitalized in 7.2 only — cosmetic).
- **C17. Lettre de transport aérien (LTA) / LTA → "Air waybill (AWB)"** — 7 functions across both the spelled-out and short forms (7.2, 7.3, 7.4, 7.6, 7.10 spelled out; 7.7, 7.8 short "LTA" form) — capitalization of "Waybill" varies, cosmetic.
- **C18. Colis → "Package"** — 6 functions.
- **C19. Numéro ONU → "UN number"** — 5 functions ("UN Number" capitalized in 7.2 only — cosmetic).

**Used in 4–5 functions:**
- **C20. Matières radioactives → "Radioactive material"** — 5 functions.
- **C21. Autorités compétentes → "Competent authorities"** — 5 functions.
- **C22. Accident(s) / Incident(s) reporting → "Accident(s) / Incident(s)"** — 5 functions (slash vs. "and", singular vs. plural — cosmetic, matches FR source).
- **C23. Cargo Aircraft Only (CAO)** — kept unchanged in both languages (already English on the source slide) — 5 functions.
- **C24. Catégorie I-Blanc(he) / II-Jaune / III-Jaune → "Category I-White / II-Yellow / III-Yellow"** — 4 functions.
- **C25. Indice de transport (IT / T.I.) → "Transport Index (TI)"** — 4 functions.
- **C26. Exploitants membres ou membres associés de l'IATA → "IATA member or associate member operators"** — 4 functions.
- **C27. État de l'exploitant → "State of the Operator"** — 4 functions.
- **C28. Annexe → "Appendix"** — 3 functions Standard (7.7, 7.8), 1 function (7.10) flags the same rendering as unverified — note this verification-status split for the reviewer even though the wording itself agrees.

**Used in 2–3 functions:**
- **C29. Suremballage → "Overpack"** — 3 functions (7.1, 7.3, 7.4).
- **C30. Instruction d'emballage (PI) → "Packing Instruction (PI)"** — 3 functions (7.1, 7.2, 7.3).
- **C31. Quantité(s) limitée(s) (LQ) → "Limited Quantity/Quantities (LQ)"** — 3 functions (7.3, 7.7, 7.8).
- **C32. Disposition particulière (DP) → "Special Provision (SP)"** (formal, numbered DGR mechanism — distinct from the disputed generic "disposition spéciale" in Part A5) — 3 functions (7.1, 7.3, 7.8).
- **C33. Membre(s) d'équipage → "Crew member(s)"** — 3 functions (7.5, 7.7, 7.9).
- **C34. Siège social → "Registered office"** — 3 functions (7.10, 7.7, 7.9).
- **C35. Produit, article ou substance → "Product, article, or substance"** — 3 functions (7.10, 7.7, 7.9).
- **C36. Marchandises dangereuses non déclarées ou mal déclarées → "Undeclared or misdeclared dangerous goods"** — 3 functions (7.7, 7.9, 7.10).
- **C37. Divergence (generic/non-technical sense) → "Divergence"** (deliberately kept distinct from the technical "Variation" sense in Part B2) — 2 functions (7.3, 7.6).
- **C38. Compte rendu → "Report / Reporting"** — 2 functions (7.2, 7.4).
- **C39. État d'origine / État de l'exploitant / État de destination → "State of Origin / State of the Operator / State of destination"** — 2 functions (7.3, 7.5).
- **C40. Aéronef de passagers / aéronef cargo → "Passenger aircraft / Cargo aircraft"** — 2 functions (7.1, 7.3).
- **C41. Comburant → "Oxidizer"** — 2 functions (7.2, 7.3).
- **C42. Explosifs → "Explosives"** — 2 functions (7.3, 7.6).
- **C43. Substance infectieuse → "Infectious Substance"** — 2 functions (7.2, 7.6).
- **C44. Masses magnétisées → "Magnetized material"** — 2 functions (7.6, 7.7).
- **C45. Liste numérique des marchandises dangereuses (DGR 4.3) → "Numeric list of dangerous goods"** — 2 functions (7.7, 7.10).
- **C46. Liste des marchandises dangereuses (DGR 4.2) → "Dangerous Goods List"** — 2 functions (7.7, 7.10, via the combined "Colonne / Liste des marchandises dangereuses" row).
- **C47. Batteries au lithium-ion / au lithium métal → "Lithium-ion / lithium metal batteries"** — 2 functions (7.5, 7.10).
- **C48. Générateurs chimiques d'oxygène → "Chemical oxygen generators"** — 2 functions (7.5, 7.8).
- **C49. Fret ou bagages contaminés → "Contaminated cargo or baggage"** — 2 functions (7.8, 7.9).
- **C50. Lever le doute → "Resolve the doubt"** — 2 functions (7.8, 7.9).
- **C51. Écarter tout risque identifié → "Eliminate any identified risk"** — 2 functions (7.8, 7.9).
- **C52. Santé, sécurité, propriété, environnement → "Health, safety, property, environment"** — 2 functions (7.7, 7.9).
- **C53. Immédiatement disponibles en tout temps → "Immediately available at all times"** — 2 functions (7.7, 7.9).
- **C54. Nom(s) technique(s) → "Technical name(s)"** — 2 functions (7.7, 7.8).
- **C55. Désignation exacte d'expédition (PSN) → "Proper shipping name (PSN)"** — 2 functions (7.7, 7.8).
- **C56. Quantités exceptées (DGR 2.6) → "Excepted quantities"** — 2 functions (7.7, 7.8).
- **C57. Contrôle de la circulation aérienne (ATC) → "Air traffic control (ATC)"** — 2 functions (7.7, 7.8).
- **C58. Colonne → "Column"** — 2 functions (7.7, 7.8).
- **C59. Symbole → "Symbol"** — 2 functions (7.7, 7.8).
- **C60. Appareils dentaires → "Dental appliances"** — 2 functions (7.7, 7.8).
- **C61. Base Réglementaire → "Regulatory Basis"** — 2 functions (7.2, 7.7).
- **C62. Responsabilités de l'Exploitant (DGR 1.4) → "Operator responsibilities"** — 2 functions (7.9, 7.10).
- **C63. Superviseur → "Supervisor"** — 2 functions (7.2, 7.7).
- **C64. Destinataire → "Consignee"** — 2 functions (7.3, 7.6).
- **C65. État d'origine de l'emballage → "State of origin of the packaging"** — 2 functions (7.4, 7.6).

*(C1–C65 above cover every cross-function-consistent, standard-status
term identified this pass. The full raw data — all 654 extracted
terminology-table rows, including the ~329 single-function terms not in
this audit's scope — is available on request if the reviewer wants the
complete unfiltered set.)*

---

## Methodology notes

- Source: the "Bilingual terminology table" section of each of the ten
  `docs/DGR_EN_REVIEW_PACKAGE_7.X.md` files, read in full (not skimmed).
  In several packages (7.2, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10) a later "Batch
  3" section was appended after the terminology table; in every such case
  the table itself was directly verified to already include the Batch
  3-introduced terms (the packages' own "Batch 3 summary" sections
  confirm this: "All are recorded in the bilingual terminology table
  above"), so no separate Batch-3-only terminology pass was needed.
- Matching method: exact French-term string match first, then a
  normalized/fuzzy pass (parenthetical-stripped, punctuation-normalized,
  similarity-scored) to catch near-duplicate phrasings of the same
  concept across functions, followed by manual review of every candidate
  match to confirm it is genuinely the same term before merging. A small
  number of fuzzy-matched candidates were reviewed and rejected as false
  positives (e.g. "Marque de spécification" vs. "Marquage / spécification
  ONU" — related but not the same concept) and are not included above.
- This file does not re-derive or second-guess any individual package's
  regulatory sourcing, item drafting, or FR status — it only
  cross-references the EN terminology tables as already written.
