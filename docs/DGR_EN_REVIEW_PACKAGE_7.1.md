# DGR EN Review Package — Function 7.1 Pilot (Q-7.1-001 – Q-7.1-012)

Prepared as bilingual (FR→EN) draft translation material for the 12 frozen,
FR-terminal Function 7.1 pilot items. This is **preparatory drafting work
for a human reviewer to check — it is not a substitute for that review.**

## Status discipline — read before using anything below

- **No item in this package may be marked `BILINGUAL TECHNICAL REVIEW
  COMPLETE` or `APPROVED`.** No qualified bilingual DGR instructor has
  reviewed any translation in this pass.
- Every item below carries the status **`BILINGUAL TECHNICAL REVIEW
  REQUIRED`** (translation drafted, not yet reviewed).
- Every approval field reads **`PENDING REVIEWER + DATE`**.
- This closes no gate in `docs/DGR_STAGE_2B_STATUS.md`; it only prepares
  material for the separate EN/human-reviewer gate defined by
  `.claude/rules/dgr-stage2b.md` rules 4–5 and
  `docs/RECOVERED_STAGE2A_CONTEXT.md`'s binding restriction #8/#9 ("Every
  FR/EN pair must be meaning-equivalent before approval"; "No question
  reaches `APPROVED` without a named qualified human reviewer and review
  date").

## Out of scope — explicit exclusion

**Q-7.1-013 through Q-7.1-019 (Production Bank Batch 1,
`docs/DGR_PRODUCTION_BANK_7.1.md`) are NOT part of this package.** Those 7
items are still `DRAFT — Tier B only`, not FR-terminal (not FROZEN, not
SOURCE VERIFIED), so an EN review package for them is premature per the
task scope. This exclusion is deliberate, not an oversight — do not infer
that these items were forgotten.

## CRITICAL PROVENANCE NOTE — read this before reviewing any item

This repository, by design (`.claude/rules/dgr-stage2b.md` rule 6: no
large licensed IATA extracts committed), stores for the 12 frozen pilot
items only their **regulatory source basis and validation conclusions**
(`docs/DGR_SOURCE_REGISTER.md`, `docs/DGR_STAGE_2B_STATUS.md`) — not the
verbatim final French item text. Prior sessions repeatedly documented that
**the live, administered copy of the pilot question text lives outside
this environment** (see `docs/AI_HANDOFF.md` line 63, `docs/DGR_STAGE_2B_
STATUS.md`'s Q-7.1-008 note, `docs/PLATFORM_READINESS_REPORT.md` line 55 —
all describe corrections as "documentation-stage only... not applied to
whatever system actually administers the live pilot copy"). This session
searched the repo, `platform-ops/kost-eexam-console` (a Playwright test
harness only, not question-bank source), and the referenced local KOST
course-material folder, and confirms this is a real, already-known gap —
not a search failure this pass.

**Consequence for this package:** the "FR" text shown for each item below
is a **working gloss reconstructed from the documented source basis and
frozen-wording notes** in `docs/DGR_STAGE_2B_STATUS.md` /
`docs/DGR_SOURCE_REGISTER.md` — composed to be regulatorily accurate to
those documented conclusions, but it is **not a verbatim transcription of
the live-administered item**. The EN column is a translation of that
working gloss.

**The human reviewer must therefore do two things, not one:** (1) the
normal bilingual technical review of meaning-equivalence and terminology
described in the checklist below, **and** (2) cross-check both the FR
gloss and the EN draft against the actual live-administered FR item text
(wherever that system is) before treating either as final. Where this
package's FR gloss diverges from the live item's exact wording, the EN
draft must be re-derived from the live wording, not patched from this
gloss.

---

## The 12 items

Each item cross-references its authoritative status row in
`docs/DGR_STAGE_2B_STATUS.md` and source evidence in
`docs/DGR_SOURCE_REGISTER.md`. Do not treat the FR gloss here as
overriding either of those files.

### Q-7.1-001 — Danger vs. risque

- **FR status:** `FR SOURCE GAP CONFIRMED — DGR silent by design; Tier B/C basis retained` (`docs/DGR_STAGE_2B_STATUS.md` row Q-7.1-001)
- **Type:** Pilot item — exact interaction format not recorded in source docs; drafted below as a definition-comparison item for translation purposes only. Confirm actual format against the live copy.
- **Source basis:** Appendice A Généralités (p.703) + §1.0 Note (p.11) — confirms the DGR glossary has **no** "Danger"/"Risque" headword by explicit editorial policy (ordinary/dictionary-sense terms excluded). Underlying content basis is Tier B (KOST Function 7.1 course) / Tier C (generic DG competency framework), per Stage 2A sub-task `0.1.4 Danger vs risque` — see `docs/DGR_NEXT_SOURCE_REQUEST.md` for the original Tier B phrasing this gloss is built from.
- **FR working gloss (reconstructed — NOT DGR-glossary-sourced):**
  - Stem: *"Dans le contexte du transport des marchandises dangereuses, quelle est la distinction entre le « danger » et le « risque » ?"*
  - Correct answer: *"Le danger désigne une source potentielle de dommage à la santé, à la sécurité, aux biens ou à l'environnement ; le risque désigne le degré de probabilité que ce danger cause réellement un dommage."*
- **EN draft translation:**
  - Stem: *"In the context of dangerous goods transport, what is the distinction between 'danger' (hazard) and 'risque' (risk)?"*
  - Correct answer: *"'Danger' (hazard) refers to a potential source of harm to health, safety, property, or the environment; 'risque' (risk) refers to the degree of probability that this hazard will actually cause harm."*
- **Precision note carried into EN:** This is **not** an IATA DGR glossary definition — the current 67th Edition/Addendum 1 does not define either term (confirmed Tier A absence). The EN item's source-basis field must read Tier B (KOST course) / Tier C (generic framework), exactly as the FR side does. Do not let the EN draft or exam metadata cite "IATA DGR Glossary/Appendix A" as its authority.
- **Terminology decision:** primary EN gloss for "danger" here is **"hazard"** (the standard English safety-science pairing is "hazard vs. risk," matching the Tier B definitions used), with "danger" kept parenthetically since it is also a valid literal cognate. Reviewer should confirm which of the two English words KOST's own English-language materials (if any exist) actually use.
- **EN status:** `BILINGUAL TECHNICAL REVIEW REQUIRED`
- **Approval:** `PENDING REVIEWER + DATE`

### Q-7.1-002 — Acétylène (liquide)

- **FR status:** `FROZEN FR / SOURCE VERIFIED`
- **Type:** True/False
- **Source basis:** Table 4.2 entry `Acétylène (liquide)` + §2.1.1 (rigorously/absolutely forbidden) + Note 1 + §2.1.2 (separate category "interdit, sauf dérogation")
- **FR working gloss:**
  - Statement: *"Vrai ou Faux : L'« Acétylène (liquide) » est une marchandise dangereuse rigoureusement interdite au transport aérien (§2.1.1), sans possibilité de dérogation d'État, contrairement aux marchandises visées par le §2.1.2 (« interdit, sauf dérogation »)."*
  - Correct answer: **VRAI**
- **EN draft translation:**
  - Statement: *"True or False: 'Acetylene (liquid)' is a dangerous good absolutely/rigorously forbidden from air transport under DGR §2.1.1, with no possibility of a State exemption — unlike goods covered under §2.1.2 ('forbidden, except by exemption')."*
  - Correct answer: **TRUE**
- **Precision note carried into EN:** Use the exact current substance name `Acétylène (liquide)` / `Acetylene (liquid)` — do **not** generalize to UN 1001 Acetylene, dissolved or UN 3374 Acetylene, solvent-free, which are different, UN-numbered, conditionally permitted entries (`docs/RECOVERED_STAGE2A_CONTEXT.md` binding restriction #2).
- **Terminology decision — FLAGGED FOR REVIEWER:** the EN equivalent of "interdit, sauf dérogation" is rendered here as **"forbidden, except by exemption"** as a working candidate. This was **not verified against a supplied official English 67th Edition text this session** — the reviewer must confirm whether the DGR's own English term is "exemption," "State variation," or another fixed phrase before this wording is finalized.
- **EN status:** `BILINGUAL TECHNICAL REVIEW REQUIRED`
- **Approval:** `PENDING REVIEWER + DATE`

### Q-7.1-003 — Number of hazard classes

- **FR status:** `FROZEN FR / SOURCE VERIFIED`
- **Type:** MCQ
- **Source basis:** §3.0.1.1 + §3.0.2 — nine UN hazard classes
- **FR working gloss:**
  - Stem: *"Combien de classes de danger sont définies par la réglementation IATA DGR pour les marchandises dangereuses ?"*
  - Options: 7 / 8 / **9 (correct)** / 10
- **EN draft translation:**
  - Stem: *"How many hazard classes does the IATA Dangerous Goods Regulations (DGR) define for dangerous goods?"*
  - Options: 7 / 8 / **9 (correct)** / 10
  - Correct answer: *"Nine (9) hazard classes."*
- **Terminology decision:** "classe de danger" → "Hazard Class" (standard IATA DGR English term, classes 1–9).
- **EN status:** `BILINGUAL TECHNICAL REVIEW REQUIRED`
- **Approval:** `PENDING REVIEWER + DATE`

### Q-7.1-004 — Corrosive hazard label

- **FR status:** `FROZEN FR / SOURCE VERIFIED`
- **Type:** MCQ
- **Source basis:** §7.3.17 + Figure 7.3.V — Class 8 corrosive label, pictogram of liquid attacking a hand and a metal bar
- **FR working gloss:**
  - Stem: *"Quelle étiquette de danger représente une substance corrosive (Classe 8), illustrée par un liquide attaquant une main et un métal ?"*
  - Options: Classe 3 (liquide inflammable) / Division 6.1 (matière toxique) / **Classe 8 (corrosif) — correct** / Classe 9 (divers)
- **EN draft translation:**
  - Stem: *"Which hazard label represents a corrosive substance (Class 8), depicted by a liquid attacking a hand and a metal bar?"*
  - Options: Class 3 (Flammable Liquid) / Division 6.1 (Toxic Substance) / **Class 8 (Corrosive) — correct** / Class 9 (Miscellaneous Dangerous Goods)
- **Terminology decision:** class/label names used ("Flammable Liquid," "Toxic," "Corrosive," "Miscellaneous Dangerous Goods") are standard, well-established IATA English nomenclature; not independently re-verified against a supplied English 67th Edition text this session (low risk, but flagged per the no-fabricated-citation rule).
- **EN status:** `BILINGUAL TECHNICAL REVIEW REQUIRED`
- **Approval:** `PENDING REVIEWER + DATE`

### Q-7.1-005 — Propane classification

- **FR status:** `FROZEN FR / SOURCE VERIFIED`
- **Type:** MCQ
- **Source basis:** Table 4.2, UN 1978 Propane — Division 2.1, flammable-gas label. Frozen wording note: function-aligned wording uses shipment-preparation context, not operator-acceptance context.
- **FR working gloss:**
  - Stem: *"Dans le cadre de la préparation d'une expédition, à quelle division de la Classe 2 appartient le Propane (UN 1978), et quelle étiquette de danger doit être apposée ?"*
  - Options: Division 2.2, étiquette gaz non-inflammable / **Division 2.1, étiquette gaz inflammable — correct** / Division 2.3, étiquette gaz toxique / Classe 3, étiquette liquide inflammable
- **EN draft translation:**
  - Stem: *"When preparing a shipment, which Class 2 division does Propane (UN 1978) belong to, and which hazard label must be applied?"*
  - Options: Division 2.2, Non-flammable Gas label / **Division 2.1, Flammable Gas label — correct** / Division 2.3, Toxic Gas label / Class 3, Flammable Liquid label
- **EN status:** `BILINGUAL TECHNICAL REVIEW REQUIRED`
- **Approval:** `PENDING REVIEWER + DATE`

### Q-7.1-006 — Class 8 Packing Group criteria

- **FR status:** `FROZEN FR / SOURCE VERIFIED`
- **Type:** Pilot item (drafted below as MCQ)
- **Source basis:** §3.8.3.3.1–3 + Tableau 3.8.A. Group I ≤3 min exposure/≤60 min observation; Group II >3–60 min/≤14 days; Group III >60 min–4h/≤14 days (or alternate corrosion-rate criterion >6.25 mm/an at 55 °C, no exposure/observation period). Pilot scenario: 3-hour (180 min) exposure → Group III.
- **FR working gloss:**
  - Stem: *"Une substance corrosive provoque un dommage irréversible du tissu cutané intact après une période d'exposition de 3 heures (effet observé dans les 14 jours suivant l'exposition). Selon le Tableau 3.8.A, à quel groupe d'emballage doit-elle être affectée ?"*
  - Options: **Groupe d'emballage III — correct** / Groupe d'emballage I / Groupe d'emballage II / Aucun groupe d'emballage n'est requis
- **EN draft translation:**
  - Stem: *"A corrosive substance causes irreversible damage to intact skin tissue after a 3-hour exposure period (effect observed within 14 days of exposure). Per Table 3.8.A, which Packing Group should it be assigned?"*
  - Options: **Packing Group III — correct** / Packing Group I / Packing Group II / No Packing Group is required
  - Correct answer: *"Packing Group III (exposure period >60 min ≤4h, observation period ≤14 days)."*
- **Note:** the table caption itself, "Tableau 3.8.A Affectation à un groupe d'emballage de la classe d'après la corrosivité (3.8.3)," should translate to "Table 3.8.A Assignment of Packing Group Based on Corrosivity (3.8.3)" — standard construction, not independently EN-source-verified.
- **EN status:** `BILINGUAL TECHNICAL REVIEW REQUIRED`
- **Approval:** `PENDING REVIEWER + DATE`

### Q-7.1-007 — Special Provisions A1 / A2

- **FR status:** `FROZEN FR / SOURCE VERIFIED — final wording locked`
- **Type:** Pilot item (drafted below as MCQ)
- **Source basis:** §4.4 Dispositions particulières, A1 + A2 (p.424). Exact confirmed terminology: **"approbation préalable de l'autorité compétente de l'État d'origine et de l'État de l'exploitant"** — the word "dérogation" does not appear in either provision.
- **FR working gloss:**
  - Stem: *"Parmi les affirmations suivantes concernant les dispositions particulières A1 et A2 du DGR, laquelle est exacte ?"*
  - Options:
    - **(Correct)** *"A1 exige une approbation préalable de l'autorité compétente de l'État d'origine et de l'État de l'exploitant pour le transport à bord d'un aéronef de passagers ; le même article peut néanmoins être transporté par aéronef cargo selon les colonnes normales du Tableau 4.2 (K/L), sans être soumis au mécanisme d'approbation de A1."*
    - *"A1 interdit tout transport de l'article par aéronef cargo."* (faux — directement réfuté par le texte même de A1)
    - *"A2 autorise le transport de l'article par aéronef de passagers."* (faux — A2 est exclusivement cargo)
    - *"A2 ne requiert aucune approbation pour le transport par aéronef cargo."* (faux — A2 exige la même approbation préalable, même pour le cargo)
- **EN draft translation:**
  - Stem: *"Which of the following statements about IATA DGR Special Provisions A1 and A2 is correct?"*
  - Options:
    - **(Correct)** *"A1 requires prior approval from the competent authority of both the State of Origin and the State of the Operator for carriage on passenger aircraft; the same article may still be carried on cargo aircraft under the normal DGR List columns (K/L, Table 4.2), without being subject to A1's approval mechanism."*
    - *"A1 forbids the article from being carried on cargo aircraft altogether."* (false — directly refuted by A1's own text)
    - *"A2 permits the article to be carried on passenger aircraft."* (false — A2 is cargo-aircraft-only)
    - *"A2 requires no approval for cargo aircraft carriage."* (false — A2 requires the same prior approval, even for cargo)
- **Terminology decision — locked, high confidence:** "approbation préalable" → **"prior approval"** — must NOT be rendered as "derogation," "exemption," or "waiver" in EN, mirroring the FR-side ban on "dérogation." "État d'origine" → "State of Origin"; "État de l'exploitant" → "State of the Operator" (standard IATA institutional terms).
- **EN status:** `BILINGUAL TECHNICAL REVIEW REQUIRED`
- **Approval:** `PENDING REVIEWER + DATE`

### Q-7.1-008 — Excepted quantity code E0

- **FR status:** `FROZEN FR / SOURCE VERIFIED — distractor corrected & revalidated`
- **Type:** Pilot item (drafted below as MCQ)
- **Source basis:** Tableau 2.6.A "Codes de quantités exceptées pour le tableau 4.2 (2.6.4.1)" (p.12). E0 = "Non permises en quantités exceptées"; E1 = 30g/30mL inner, 1kg/1L outer; E2 = 30g/30mL inner, 500g/500mL outer. Final locked distractor set: "1 kg/1 L" (E1's outer limit, misattributed), "500 g/500 mL" (E2's outer limit, misattributed), "Illimitée" (no code is unlimited).
- **FR working gloss:**
  - Stem: *"Selon le Tableau 2.6.A (Codes de quantités exceptées), quelle est la quantité nette maximale autorisée par emballage extérieur pour le code de quantité exceptée E0 ?"*
  - Options: **(Correct)** *"Non permises en quantités exceptées (E0 = aucune quantité exceptée n'est autorisée)."* / *"1 kg / 1 L"* / *"500 g / 500 mL"* / *"Illimitée"*
- **EN draft translation:**
  - Stem: *"Per Table 2.6.A (Excepted Quantity Codes), what is the maximum net quantity permitted per outer packaging for Excepted Quantity Code E0?"*
  - Options: **(Correct)** *"Not permitted in excepted quantities (E0 = no excepted quantity is authorized)."* / *"1 kg / 1 L"* (this is E1's actual outer limit, misattributed) / *"500 g / 500 mL"* (this is E2's actual outer limit, misattributed) / *"Unlimited"*
- **Terminology decision:** "quantité exceptée" → "Excepted Quantity" (standard IATA term, incl. the "E-code" naming convention). "Non permises en quantités exceptées" is rendered as **"Not permitted in excepted quantities"** — a strong working candidate matching typical IATA DGR List E0-row phrasing, but **not independently verified against a supplied English 67th Edition text this session; reviewer should confirm the exact printed EN wording.**
- **EN status:** `BILINGUAL TECHNICAL REVIEW REQUIRED`
- **Approval:** `PENDING REVIEWER + DATE`

### Q-7.1-009 — Lithium ion batteries / PI 965

- **FR status:** `FROZEN FR / SOURCE VERIFIED`
- **Type:** MCQ
- **Source basis:** PI 965, Section IA/IB, Tables 965-IA/965-IB. Section IA = 35 kg net quantity per package, cargo aircraft only; Section IB = 10 kg. Frozen wording note: use the exact current table expression "quantité nette par colis."
- **FR working gloss:**
  - Stem: *"Selon l'Instruction d'emballage 965 (PI 965), quelle est la quantité nette maximale par colis autorisée pour un envoi de piles au lithium ion (UN 3480) expédié en Section IA, par aéronef cargo uniquement ?"*
  - Options: 10 kg (= Section IB) / **35 kg — correct (Section IA)** / 5 kg / Illimitée
- **EN draft translation:**
  - Stem: *"Per Packing Instruction 965 (PI 965), what is the maximum net quantity per package permitted for a shipment of lithium ion batteries (UN 3480) shipped under Section IA, cargo aircraft only?"*
  - Options: 10 kg (Section IB limit) / **35 kg — correct (Section IA)** / 5 kg / Unlimited
- **Terminology decision:** "quantité nette par colis" → **"net quantity per package"** (standard IATA table-header term, used exactly per the frozen wording note).
- **EN status:** `BILINGUAL TECHNICAL REVIEW REQUIRED`
- **Approval:** `PENDING REVIEWER + DATE`

### Q-7.1-010 — Dry ice marking

- **FR status:** `FROZEN FR / SOURCE VERIFIED`
- **Type:** MCQ
- **Source basis:** §7.1.4.1(d), UN 1845 — net quantity of dry ice must be indicated on the package.
- **FR working gloss:**
  - Stem: *"Quelle information relative à la neige carbonique (glace sèche, UN 1845) doit obligatoirement figurer sur le colis, conformément au §7.1.4.1(d) ?"*
  - Options: La date d'expédition / **La quantité nette de neige carbonique contenue dans le colis — correct** / Le nom du transporteur / La température de stockage recommandée
- **EN draft translation:**
  - Stem: *"What information about dry ice (UN 1845) must be marked on the package, per §7.1.4.1(d)?"*
  - Options: The shipment date / **The net quantity of dry ice contained in the package — correct** / The name of the carrier / The recommended storage temperature
- **Terminology decision — FLAGGED:** "neige carbonique" is rendered as **"dry ice"** (the common IATA/UN usage); the formal UN Proper Shipping Name is "Carbon Dioxide, Solid." Reviewer should confirm which form the exam item should use in EN (common name vs. PSN) for consistency with the rest of the bank.
- **EN status:** `BILINGUAL TECHNICAL REVIEW REQUIRED`
- **Approval:** `PENDING REVIEWER + DATE`

### Q-7.1-011 — Overpack labels

- **FR status:** `FROZEN FR / SOURCE VERIFIED`
- **Type:** True/False
- **Source basis:** §7.2.7.1 — hazard labels inside an overpack, if not visible, must be reproduced/applied outside. Scope deliberately excludes PSN/UN/handling marks.
- **FR working gloss:**
  - Statement: *"Vrai ou Faux : Lorsque les étiquettes de danger apposées sur les colis à l'intérieur d'un suremballage ne sont pas visibles de l'extérieur, les mêmes étiquettes de danger doivent être reproduites/apposées sur le suremballage lui-même."*
  - Correct answer: **VRAI**
- **EN draft translation:**
  - Statement: *"True or False: When the hazard labels applied to the packages inside an overpack are not visible from the outside, the same hazard labels must be reproduced/applied on the overpack itself."*
  - Correct answer: **TRUE**
- **Precision note carried into EN:** scope is hazard-label visibility/reproduction only. Proper Shipping Name, UN number, and handling marks are governed by separate provisions and are explicitly outside this item's tested scope — the EN item must not be broadened to imply those marks are also covered.
- **Terminology decision:** "suremballage" → "overpack" (standard IATA term).
- **EN status:** `BILINGUAL TECHNICAL REVIEW REQUIRED`
- **Approval:** `PENDING REVIEWER + DATE`

### Q-7.1-012 — Document retention

- **FR status:** `FROZEN FR / SOURCE VERIFIED`
- **Type:** True/False
- **Source basis:** §1.3.4.1 (primary); §1.3.4.2 (supporting, electronic retention only). Conclusion: shipper retains at least one copy of shipment documents for a minimum of three months. Do not confuse with §3.0.1.5.
- **FR working gloss:**
  - Statement: *"Vrai ou Faux : L'expéditeur doit conserver au moins une copie des documents d'expédition de marchandises dangereuses pendant une durée minimale de trois mois."*
  - Correct answer: **VRAI**
- **EN draft translation:**
  - Statement: *"True or False: The shipper must retain at least one copy of the dangerous goods shipment documentation for a minimum period of three months."*
  - Correct answer: **TRUE**
- **Terminology decision:** "expéditeur" → "shipper"; "documents d'expédition" → "shipment documentation" (standard IATA terms).
- **EN status:** `BILINGUAL TECHNICAL REVIEW REQUIRED`
- **Approval:** `PENDING REVIEWER + DATE`

---

## Bilingual terminology table

| FR term | EN term | Verification status | Appears in / source |
|---|---|---|---|
| Marchandise(s) dangereuse(s) | Dangerous Goods (DG) | Standard, well-established | All items; general DGR terminology |
| Danger | Hazard (also: "danger") | Tier B/C only — **not** DGR-glossary-sourced (confirmed current-edition absence) | Q-7.1-001; Appendice A Généralités p.703, §1.0 Note p.11 |
| Risque | Risk | Tier B/C only — same caveat as above | Q-7.1-001; same |
| Classe de danger | Hazard Class | Standard | Q-7.1-003; §3.0.1.1, §3.0.2 |
| Groupe d'emballage | Packing Group | Standard | Q-7.1-006; Tableau 3.8.A |
| Étiquette de danger | Hazard Label | Standard | Q-7.1-004, Q-7.1-011; §7.3.17, §7.2.7.1 |
| Disposition particulière | Special Provision | Standard | Q-7.1-007; §4.4 |
| Approbation préalable | Prior approval (NOT "derogation"/"exemption") | Locked — exact term confirmed absent from A1/A2's own EN text is unverified, but the FR-side ban on "dérogation" is Tier A confirmed and must carry through to EN | Q-7.1-007; §4.4 A1/A2 |
| État d'origine | State of Origin | Standard IATA institutional term | Q-7.1-007; §4.4 A1/A2 |
| État de l'exploitant | State of the Operator | Standard IATA institutional term | Q-7.1-007; §4.4 A1/A2 |
| Quantité exceptée / code E0 | Excepted Quantity / Code E0 | Standard term; exact E0-row EN phrasing unverified | Q-7.1-008; Tableau 2.6.A |
| Non permises en quantités exceptées | Not permitted in excepted quantities | Working candidate — **unverified against supplied EN 67th Ed. text** | Q-7.1-008; Tableau 2.6.A, row E0 |
| Interdit / rigoureusement interdit | Forbidden / Absolutely (Rigorously) Forbidden | Standard | Q-7.1-002; §2.1.1 |
| Interdit, sauf dérogation | Forbidden, except by exemption (candidate — **unverified**) | **Flagged — reviewer must confirm exact EN term** (exemption / State variation / other) | Q-7.1-002; §2.1.2 |
| Instruction d'emballage (PI) | Packing Instruction (PI) | Standard | Q-7.1-009; PI 965 |
| Quantité nette par colis | Net quantity per package | Standard, locked per frozen wording note | Q-7.1-009; PI 965, Tables 965-IA/IB |
| Suremballage | Overpack | Standard | Q-7.1-011; §7.2.7.1 |
| Neige carbonique / glace sèche | Dry ice (formal PSN: Carbon Dioxide, Solid) | Standard common usage; PSN-vs-common-name choice flagged for reviewer | Q-7.1-010; §7.1.4.1(d), UN 1845 |
| Expéditeur | Shipper | Standard | Q-7.1-012; §1.3.4.1 |
| Document(s) d'expédition | Shipment documentation | Standard | Q-7.1-012; §1.3.4.1 |
| Colis | Package | Standard | Multiple items |
| Aéronef de passagers / aéronef cargo | Passenger aircraft / Cargo aircraft | Standard | Q-7.1-002, Q-7.1-005, Q-7.1-007, Q-7.1-009 |

**Reading this table:** "Standard" means the term is well-established IATA/UN dangerous-goods English usage with low translation risk, but — consistent with `.claude/rules/dgr-stage2b.md` rule 2 — none of these EN renderings were checked this session against a supplied official English 67th Edition text; they were not fabricated as citations, only used as ordinary professional-English DG terminology. "Flagged"/"unverified" rows are genuine open questions for the reviewer, not settled translations.

---

## Reviewer instructions and checklist

**Who may complete this:** a qualified bilingual DGR instructor (French and English), current on IATA DGR 67th Edition 2026 (Addendum 1 integrated). No other role may close this gate (`.claude/rules/dgr-stage2b.md` rule 4).

**What to check, per item:**

1. **Provenance check first:** compare this package's FR working gloss (and therefore the EN draft derived from it) against the actual live-administered FR pilot item text, wherever that system is hosted. This package's FR text was reconstructed from documented source-basis conclusions, not transcribed from the live copy — see the Critical Provenance Note above.
2. **Regulatory accuracy — FR:** confirm the FR gloss (or, if different, the live item's actual FR text) is still accurate against the current IATA DGR 67th Edition 2026 (Addendum 1) — this should already be settled by the FR-terminal status in `docs/DGR_STAGE_2B_STATUS.md`, but re-confirm if the live text differs from this package's gloss.
3. **Regulatory accuracy — EN:** confirm the EN draft's terminology and facts against the current English-language IATA DGR 67th Edition text, resolving every item flagged "unverified" in the terminology table (Q-7.1-002's "sauf dérogation" EN equivalent; Q-7.1-008's exact E0-row EN wording; Q-7.1-004/006's class/table-caption naming; Q-7.1-010's dry-ice vs. Carbon-Dioxide-Solid naming choice).
4. **Meaning-equivalence FR↔EN:** confirm the EN stem, correct answer, and every distractor carry the same regulatory meaning as the FR side — not a loose paraphrase. Pay special attention to Q-7.1-007 (approval vs. derogation/exemption changes the legal meaning) and Q-7.1-001 (must not imply DGR-glossary sourcing in either language).
5. **Terminology consistency:** confirm EN terms match the terminology table and are used consistently across all 12 items (e.g., "Packing Group" not "packaging group"; "Special Provision" not "special clause").
6. **Distractor plausibility in English:** confirm each EN distractor remains plausible-but-wrong to an English-speaking candidate — a distractor that only "sounds wrong" in French, or that becomes obviously wrong for an EN-specific reason (e.g., an idiom that doesn't translate), should be flagged for revision.
7. **Frozen wording notes compliance:** re-check each item against its specific frozen wording note in `docs/DGR_STAGE_2B_STATUS.md` (Q-7.1-001's Tier B/C sourcing constraint; Q-7.1-002's exact substance name; Q-7.1-005's shipment-preparation framing; Q-7.1-006's numeric thresholds; Q-7.1-007's "approbation" vs. "dérogation" lock; Q-7.1-008's final distractor set; Q-7.1-009's "quantité nette par colis" wording; Q-7.1-011's labels-only scope; Q-7.1-012's §1.3.4.1 vs. §3.0.1.5 distinction).

**Sign-off format (required, per item):**

```
Item: Q-7.1-0XX
Reviewer name (qualified bilingual DGR instructor): ____________________
Review date (YYYY-MM-DD): ____________________
Verified against live-administered FR item text (not just this draft): YES / NO
Regulatory accuracy — FR: PASS / FAIL / CONDITIONAL — notes: ____________
Regulatory accuracy — EN: PASS / FAIL / CONDITIONAL — notes: ____________
Meaning-equivalence FR↔EN: PASS / FAIL / CONDITIONAL — notes: ____________
Terminology consistency: PASS / FAIL / CONDITIONAL — notes: ____________
Distractor plausibility (EN): PASS / FAIL / CONDITIONAL — notes: ____________
Final status: BILINGUAL TECHNICAL REVIEW COMPLETE / REVISION REQUIRED (specify)
Approval: [Named reviewer] + [Date]
```

No anonymous or undated sign-off is accepted. Until every field above is
completed with a named reviewer and a date, the item's EN status stays
`BILINGUAL TECHNICAL REVIEW REQUIRED` and its Approval field stays
`PENDING REVIEWER + DATE` — this applies even if the reviewer's technical
conclusion is "no changes needed." Per `.claude/rules/dgr-stage2b.md` rule
4, no item may be marked `APPROVED` without this completed sign-off.

## Summary

- 12/12 pilot items translated to EN draft status. 0/12 reviewed.
- 11 items carry a Tier-A-verified FR regulatory basis; Q-7.1-001 carries a
  confirmed Tier-A-silent / Tier B/C basis — both are terminal FR states,
  and the EN draft for each preserves the same source-basis distinction.
- 3 terminology points are explicitly flagged unverified for the reviewer
  (Q-7.1-002's "sauf dérogation," Q-7.1-008's exact E0 EN row wording,
  Q-7.1-010's dry-ice naming choice); several more standard-but-unverified
  class/table-name terms are listed in the terminology table.
- Q-7.1-013–019 (Batch 1) are explicitly out of scope for this package.
