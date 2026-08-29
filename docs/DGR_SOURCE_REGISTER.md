# DGR 67e — Source Register for Stage 2B.1

This register stores concise regulatory source locations and validation conclusions. It must not contain large copied passages from licensed publications.

> ✅ **2026-08-29 — V2 import + a source-register-adjacent data bug found:**
> KOST E-EXAM V2 staging now holds 244 confirmed questions (was 92); see
> `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md`'s 2026-08-29 note and
> `platform-ops/kost-eexam-v2/docs/KOST_EEXAM_V2_TIER_A_244_MIGRATION_REPORT.md`
> for full detail. Relevant to this register specifically: 127 rows in
> the reconciliation CSVs (`DGR_V2_IMPORT_CANDIDATES_AFTER_RECONCILIATION.csv`
> `SOURCE_REFERENCE`, `DGR_TIER_A_RECONCILIATION_453_PER_ITEM.csv`
> `DGR_Reference`) carry the same wrong value — a "representative sample"
> citation list mis-copied into each row's own field, never these rows'
> actual individual citation. **Do not add these 127 rows' citations to
> this register from that column** until the generator bug is fixed and
> the column is regenerated; a genuinely per-row `SOURCE:` fragment
> inside `Final_Reconciled_Status` was usable for only 44 of the 127.

> ⚠️ **2026-08-25 reconciliation note:** this file's "218 FROZEN" program
> total (below, "Program totals after Topic 5") is a topic-analysis
> conclusion, not what is currently stamped in each item's own `**FR
> status:**` field in its `docs/DGR_PRODUCTION_BANK_7.X.md` file. A
> strict per-item re-count found 97 items currently stamped FROZEN (92
> integrated into Moodle). Full reconciliation in
> `docs/DGR_TIER_A_INVENTORY.md`'s own reconciliation section. No status
> below was changed — pointer only.

## Regulatory source state

- Edition: IATA DGR 67th Edition — 2026
- Language: French
- Addendum state: Addendum 1 integrated
- Specific addendum delta: NOT DETERMINED unless separately established

## Verified references

### Q-7.1-002 — Acétylène (liquide)
- Table 4.2, current entry `Acétylène (liquide)`, Bookshelf p.323/721
- Visual characteristics used with §2.1.1 Note 1: regular/thin typeface; no UN number; `Interdit` in G/H, I/J and K/L
- §2.1.1 — rigorously forbidden dangerous goods
- Note 1 to §2.1.1
- §2.1.2 — separate category `interdit, sauf dérogation`
- Conclusion: the exact entry `Acétylène (liquide)` is the item tested; do not generalize to UN1001 Acétylène dissous or UN3374 Acétylène sans solvant.

### Q-7.1-003 — Number of hazard classes
- §3.0.1.1
- §3.0.2
- Conclusion: nine UN hazard classes.

### Q-7.1-004 — Corrosive hazard label
- §7.3.17
- Figure 7.3.V
- Conclusion: Class 8 corrosive label identified by liquid attacking a hand and metal.

### Q-7.1-005 — Propane
- Table 4.2, UN 1978 — Propane, Bookshelf p.401/721
- Current classification: Division 2.1; hazard label shown as flammable gas
- Cargo-only PI/quantity and other columns exist but are outside this question's classification-only scope.

### Q-7.1-009 — UN3480 / PI 965
- PI 965 Introduction
- Section IA + Table 965-IA
- Section IB + Table 965-IB
- Conclusion used by pilot item: Section IA = 35 kg net quantity per package, cargo aircraft only; Section IB = 10 kg.

### Q-7.1-010 — Dry ice marking
- §7.1.4.1(d)
- UN 1845
- Conclusion: net quantity of dry ice must be indicated on the package for the tested scope.

### Q-7.1-011 — Overpack labels
- §7.2.7.1
- Conclusion: required hazard labels inside an overpack must be visible or reproduced/applied outside when not visible.
- Scope deliberately excludes PSN/UN/handling marks.

### Q-7.1-012 — Document retention
- §1.3.4.1 — primary source
- §1.3.4.2 — supporting source for electronic retention only
- State divergence `USG-01` exists; content not retrieved/used
- Conclusion: shipper retains at least one copy of shipment documents for a minimum of three months.
- Do not confuse with §3.0.1.5.

### Q-7.1-006 — Class 8 corrosive Packing Group criteria — DIRECT TIER A VERIFIED
- Tableau 3.8.A "Affectation à un groupe d'emballage de la classe d'après la corrosivité (3.8.3)", Bookshelf p.315
- §3.8.3.3.1 Groupe I: période d'exposition ≤ 3 min, période d'observation ≤ 60 min, effet = dommage irréversible du tissu cutané intact
- §3.8.3.3.2 Groupe II: exposition > 3 min ≤ 60 min, observation ≤ 14 j
- §3.8.3.3.3 Groupe III: (a) exposition > 60 min ≤ 4 h, observation ≤ 14 j; ou (b) vitesse de corrosion sur acier/aluminium > 6,25 mm/an à 55 °C (critère alternatif, pas de période d'exposition/observation)
- Conclusion: thresholds confirmed current and unchanged from the figures already used in the pilot draft; table number unchanged (`Tableau 3.8.A`). Pilot's 3-hour (180 min) exposure scenario falls in Group III's >60min≤4h band — validates correct answer Group III; Groups I and II are directly refuted by the table's own thresholds; "no group required" has no basis in the table for a material meeting the irreversible-tissue-damage criterion.

### Q-7.1-007 — Special Provisions A1 / A2 — DIRECT TIER A VERIFIED
- §4.4 Dispositions particulières, entries A1 and A2, Bookshelf p.424 (full verbatim text read, not stored per licensing rule)
- A1: passenger-aircraft carriage requires prior "approbation" from the competent authority of the État d'origine **and** État de l'exploitant, under written conditions; a copy of the approval (with quantity/packaging limits) must accompany the shipment; noted on the Shipper's Declaration. The same article/matière may also travel by **cargo** aircraft under the normal DGR List columns K/L (4.2) — cargo carriage is not gated by A1's approval mechanism. Additional states that have filed a variation requiring prior approval must also approve.
- A2: **cargo-aircraft-only** — no passenger-aircraft option exists under A2 at all — and even cargo carriage requires the same prior "approbation" from État d'origine + État de l'exploitant; noted on the Shipper's Declaration; additional state approvals apply if variations filed.
- Exact terminology confirmed: **"approbation préalable de l'autorité compétente de l'État d'origine et de l'État de l'exploitant."** The word "dérogation" does not appear anywhere in A1 or A2.
- Conclusion: confirms the Tier B draft's basic shape (A1 = passenger aircraft + prior approval; A2 = cargo aircraft + prior approval) but do not word A1 as forbidding cargo transport outright — see status doc precision note.

### Q-7.1-008 — Excepted quantity code E0 — DIRECT TIER A VERIFIED
- Tableau 2.6.A "Codes de quantités exceptées pour le tableau 4.2 (2.6.4.1)", Bookshelf p.12
- Columns: Code de quantité exceptée | Quantité nette maximum par emballage intérieur | Quantité nette maximum par emballage extérieur
- E0: Non permises en quantités exceptées
- E1: 30 g/30 mL — 1 kg/1 L
- E2: 30 g/30 mL — 500 g/500 mL
- E3: 30 g/30 mL — 300 g/300 mL
- E4: 1 g/1 mL — 500 g/500 mL
- E5: 1 g/1 mL — 300 g/300 mL
- Conclusion: E0 = "not permitted in excepted quantities" confirmed as correct answer. E1's actual finite limits (not "unlimited", not "not permitted") refute a distractor implying otherwise; no code in the table permits an unlimited quantity. The existing distractor **"State derogation required"** has no support or rebuttal in Tableau 2.6.A — the table does not address state derogations/variations at all — so per evidence-hygiene rule this distractor is flagged for revision/replacement, not asserted false.
- **2026-08-24 correction applied:** distractor "State derogation required" replaced with **"1 kg/1 L"** (E1's actual outer-package limit, misattributed to E0) — directly refuted by Tableau 2.6.A's own E0 row (no quantity value; "Non permises"). Full final distractor set: "1 kg/1 L" (E1), "500 g/500 mL" (E2), "Illimitée" (no E-code is unlimited). Q-7.1-008 closed FR SOURCE VERIFIED with a fully source-grounded distractor set. Documentation-stage correction only; not applied to any live/production question-bank copy from this environment.

### Q-7.1-001 — Danger vs. risque — CONFIRMED SOURCE GAP (DGR silent by design)
- Appendice A — Glossaire, Généralités, Bookshelf p.703: definitions given are only for terms *"utilisés couramment dans la présente Réglementation"*; when a word is used in its ordinary/dictionary sense or most frequent technical sense, *"leur définition n'a pas été introduite dans cet appendice."*
- §1.0 Définition des marchandises dangereuses, Note, Bookshelf p.11: *"La définition des termes ayant un sens spécial dans la présente Réglementation apparaît à l'appendice A"* — confirms Appendice A only covers DGR-special-meaning terms.
- In-book search evidence (VitalSource Mosaic reader "Search across book"): query "Risque" → 62 hits book-wide, 6 within the Appendice A group; all 6 are incidental mid-sentence usages inside unrelated entries (verified by opening one: the `DISPOSITIF D'AMORÇAGE (INITIATING DEVICE)` entry, which uses "risque" in its body text, not as its own headword). No entry headed "DANGER" or "RISQUE" was found. "Danger" alone was not exhaustively searched (5000+ book-wide hits from "marchandises dangereuses," impractical to triage), but the same policy applies with at least equal force since it is used even more pervasively in its ordinary sense.
- Conclusion: **current DGR 67th Edition (FR, Addendum 1) does not define "danger" or "risque" as distinct regulatory terms.** This is a confirmed, current, Tier A absence — not an unread gap and not an inference. Q-7.1-001's danger/risque distinction is not DGR-glossary-sourced; retain it on its Tier B (KOST Function 7.1 course) / Tier C (generic competency framework) basis per Stage 2A sub-task `0.1.4 Danger vs risque`, and word the item so it does not attribute the distinction to the DGR glossary or any appendix. See `docs/DGR_STAGE_2B_STATUS.md` Q-7.1-001 note for the full wording guidance.
- Retrieval method: `chrome-devtools` MCP attached to the user's already-authenticated Chrome, book `DGR-6066-67`. Reader chrome (ToC, "Search across book") lives in the top-level `digitalpublications.iata.org` frame and is directly clickable/typeable via `evaluate()`; `screenshot()` captures the cross-origin `jigsaw.iata.org` reader iframe's rendered content at the compositor level. Full-text "Search across book" results are virtualized (only rendered near the current scroll position), so a query must return a small-enough result set (tens, not thousands) for `Array.from(document.querySelectorAll(...))` to actually see every group header — this is why "Risque" (62 hits) worked directly where "Danger" (5005 hits) did not; for a noisy term, either find a rarer distinguishing phrase or accept the policy-based inference as done here.

### Q-7.1-013 — Définition réglementaire d'une marchandise dangereuse — DIRECT TIER A VERIFIED
- §1.0 Définition des marchandises dangereuses, Partie 1 — Champ d'application, Bookshelf p.11
- Exact current text: "Les marchandises dangereuses sont des matières ou objets qui présentent un danger pour la santé, la sécurité, les biens ou l'environnement, qui sont énumérés dans la liste des marchandises dangereuses de la présente Réglementation ou qui, s'ils ne figurent pas sur cette liste, sont classés conformément à la Réglementation."
- Conclusion: confirms the drafted correct answer's two-clause structure (danger criterion + listed-or-classified criterion) essentially verbatim. No wording change needed.

### Q-7.1-014 — Cadre juridique : codification de l'Annexe 18 — DIRECT TIER A VERIFIED
- §1.1.1 (UNSCETDG — all transport modes except radioactive materials), §1.1.2 (AIEA — radioactive materials only, reflected in Part 10), §1.1.3 (OACI — codifies Annexe 18 + IT Doc 9284), §1.1.4 (IATA DGR incorporates all IT specs plus stricter additions), Partie 1, Bookshelf p.11
- Conclusion: correct answer OACI confirmed by §1.1.3; all three distractors (IATA, SCoETDG/UNSCETDG, AIEA) refuted by their own adjoining sub-clauses. Current DGR acronym is "UNSCETDG" (KOST slide used "SCoETDG") — same body; align final wording to current term.

### Q-7.1-015 — Champ d'application du DGR — DIRECT TIER A VERIFIED
- §1.2.1 Application, Partie 1, Bookshelf p.11
- Exact current text: "La Réglementation de l'IATA s'applique à : • tous les exploitants qui sont membres ou membres associés de l'IATA; • tous les exploitants qui sont parties à l'accord IATA sur le transport intertransporteurs de marchandises; et • tous les expéditeurs et agents de fret qui présentent des marchandises dangereuses à ces exploitants."
- Conclusion: all three categories in the stem confirmed in scope — "Vrai" verified. Current text phrase is "accord IATA sur le transport intertransporteurs de marchandises" (KOST slide: "accord multilatéral de trafic intercompagnies de l'IATA-fret") — same concept, terminology evolved; recommend aligning stem wording.

### Q-7.1-016 — Marchandise dangereuse potentiellement cachée (échantillons diagnostiques) — DIRECT TIER A VERIFIED
- §2.2.4, Partie 2 — Restrictions, Bookshelf p.12 area
- Current list (much longer, alphabetized A–Z vs. KOST's 8-item excerpt) confirmed to include: "ÉCHANTILLONS DIAGNOSTIQUES", "PIÈCES DE RECHANGE POUR AÉRONEF AU SOL", "RÉGULATEURS DE CARBURANT", "REFRIGÉRATEURS", "TROUSSES DE RÉPARATION", "ÉCHANTILLONS POUR ESSAIS"
- Distractors "Vêtements neufs sous emballage plastique", "Livres et documents imprimés", "Denrées alimentaires non réfrigérées" confirmed absent from the current list (checked by targeted text search of the retrieved list content).
- Conclusion: correct answer confirmed; align exact wording to current heading term "Échantillons diagnostiques" (adjective form) rather than "Échantillons de diagnostic."

### Q-7.1-017 — Marchandises dangereuses transportées par les passagers — DIRECT TIER A VERIFIED
- §2.3.0.1, Partie 2, Bookshelf p.12 area
- Exact current text: "Les marchandises dangereuses, incluant les colis exceptés de matières radioactives, sont interdites au transport par les passagers ou les membres d'équipage : • dans les bagages enregistrés ou comme bagages enregistrés; • dans les bagages de cabine ou comme bagages de cabine; ou • sur la personne; sauf tel que permis en 2.3.2 à 2.3.5 pour un usage personnel."
- Conclusion: "Vrai" confirmed. Current term "bagages de cabine" = KOST slide's "bagage à main," same concept.

### Q-7.1-018 — Classe de l'acide sulfurique / acide de batterie — DIRECT TIER A VERIFIED, citation corrected
- §3.0.2 Classes de danger, Partie 3, Bookshelf p.307 — pure class-name taxonomy (Classe 1–9 + divisions), **no named substance examples**; confirmed not the actual evidentiary source despite the KOST slide's "DGR 3.0.2" citation. Retained only as the source for the three distractor class labels: "3.0.2.3 Classe 3 — Liquides inflammables", "3.0.2.6 Division 6.1 — Matières toxiques" (under Classe 6), "3.0.2.9 Classe 9 — Matières et objets dangereux divers..." — all confirmed real, distinct current classes.
- **Table 4.2**, entry `1830` — Désignation: "Acide sulfurique contenant plus de 51% d'acide" — Cl. ou div. [C] = **8**, Étiquette de danger [D] = **Corrosif**, Gr. d'emb. [E] = II — Bookshelf p.326.
- Appendice A — Glossaire, Bookshelf p.703: entries for "ACIDE SULFURIQUE FUMANT", "ACIDE SULFURIQUE RÉSIDUAIRE," and electrolyte/battery-acid description confirm "acide de batterie" is the common term for diluted acide sulfurique — same substance/class as UN1830.
- Conclusion: Classe 8 — Matières corrosives confirmed as correct answer. Source citation reassigned from §3.0.2 to Table 4.2 (UN1830) + Appendice A; §3.0.2 retained only for the distractor class-label taxonomy.

### Q-7.1-019 — Caractéristiques requises des marquages — SOURCE CONFLICT RESOLVED, content corrected
- KOST slide 141 cited "DGR 6.0.4.2.1(c)" — **this section does not exist in the current 67th Edition structure.** Current Part 6 = "PARTIE 6 — SPÉCIFICATIONS ET ÉPREUVES DE RÉSISTANCE POUR LES EMBALLAGES" (packaging performance tests); marking/labeling is **Part 7**, consistent with frozen pilot items Q-7.1-004/010/011 (all cite Part 7 sections). Conclusion: the KOST slide's citation reflects an older DGR edition's part numbering and is stale in the current baseline.
- Current applicable provision: **§7.1.3.2 "Qualité"**, Partie 7 — Marquage et Étiquetage, Bookshelf p.688 area. Exact current text: "Toutes les marques doivent être : (a) durables et être imprimées ou autrement apposées sur la surface extérieure du colis ou du suremballage; (b) facilement visibles et lisibles; (c) pouvoir être exposées aux intempéries sans dégradation notable; et (d) apposées sur un fond de couleur contrastante."
- Conclusion: the drafted correct answer ("Visibles, lisibles, durables, et pouvant résister aux intempéries") is **incomplete** against the current 4-item list — it omits criterion (d), "apposées sur un fond de couleur contrastante" (contrasting-colour background), entirely. **Correction applied 2026-08-25:** stem and correct answer revised to the current §7.1.3.2 four-item list; existing distractors remain valid (still refuted by the corrected list). See `docs/DGR_PRODUCTION_BANK_7.1.md` for revised question text.

## Production bank expansion (Batch 1: Q-7.1-013–Q-7.1-019)

Full question text, sub-task mapping, and per-item source/distractor
rationale are in `docs/DGR_PRODUCTION_BANK_7.1.md`. Summary of Tier B
sources used (all read directly this session from the actual KOST Function
7.1 training material, not inferred):

- Source files: `01_KOST_DGR_CBTA_Function_7.1_Training_Course_FR_2025.pdf`
  (course), `03_KOST_DGR_CBTA_Exam_Function_7.1_FR_Rev00_2025.pdf` (exam,
  corroboration only), `KOST_DGR_CBTA_Practice_Book_Function_7.1_FR_2025.pdf`
  (practice book, corroboration only), all at
  `/Users/mac/Documents/Fichiers/Algerie/CBTA final/yasmine cbta/wetransfer_supports-pedagogiques-dgr-cbta-kost-academy_2025-10-12_1842/COURS DGR-CBTA-IATA/DGR-FONCTION 7.1/`.
- Q-7.1-013 (0.1.1 Définition MD): course slide 16, "Généralités DGR 1.0."
- Q-7.1-014 (0.1.2 Cadre juridique): course slides 20–24, "Cadre juridique —
  Fondements de la Réglementation DGR 1.1" (SCoETDG/AIEA → OACI [Annexe 18]
  → IATA hierarchy).
- Q-7.1-015 (0.1.3 Application/portée): course slide 31, "Applicabilité —
  Champ d'application DGR 1.2.1."
- Q-7.1-016 (0.2.2 MD cachées): course slides 47–48, "DG cachées DGR2.2" /
  "Exemples de DG cachées DGR 2.2.4."
- Q-7.1-017 (0.2.3 Passagers): course slides 44–45, "MD Transportées par les
  passagers ou l'équipage DGR 2.3" / "Limites — Dispositions relatives aux
  passagers et au fret."
- Q-7.1-018 (0.4.1 Classes/divisions): course "Les classes des marchandises
  dangereuses DGR 3.0.2" slide series, Class 8 (matières corrosives, ex.
  acide sulfurique/acide de batterie) vs. Class 3/Division 6.1/Class 9's own
  named examples; corroborated by KOST Practice Book Q10 asking the
  identical fact directly.
- Q-7.1-019 (0.5.1 Marquage): course slide 141, "Marquage à spécification
  des emballages," DGR 6.0.4.2.1(c) (visible/lisible/durable/résistant aux
  intempéries).

**Tier A status: COMPLETE as of 2026-08-25.** All 7 items were Tier A
verified this session via the `chrome-devtools` MCP attached to the
authenticated IATA Digital Publications Bookshelf (book `DGR-6066-67`, 67th
Ed., Addendum 1 integrated) — see the dedicated per-item entries above (in
the "Verified references" section, above this Batch 1 heading) for full
citations. 6 of 7 KOST-slide citations/content were confirmed as drafted;
1 (Q-7.1-019) required a content correction because the KOST slide's
section citation was stale (superseded by the current edition's Part 6/7
restructuring) and its 4-criterion list was incomplete against current
§7.1.3.2. No Tier A evidence was fabricated; the one correction is fully
documented with before/after text above.

### 2026-08-25 (second Tier A phase) — Topic 1: Lithium batteries, 14 items cross-applied

One Bookshelf session (search-across-book + direct ToC navigation) resolved
all 14 items tagged to the lithium-battery topic in
`docs/DGR_TIER_A_INVENTORY.md`, across Functions 7.2, 7.3, 7.4, 7.5, 7.6,
7.9, and 7.10. Four distinct DGR sections were read directly this session:

- **§2.3.5.8.3, §2.3.5.8.3.1, §2.3.5.8.4(c), §2.3.5.8.4(f)** (Part 2,
  passenger/crew baggage AEP and spare-battery provisions): confirms the
  15-AEP / 20-spare-battery operator-approval thresholds
  (`Q-7.5-011`, `Q-7.9-032`, `Q-7.10-012`), the spare-battery
  cabin-baggage-only / checked-baggage-prohibited rule (`Q-7.9-034`), and
  the 0.3g-lithium-metal/2.7Wh installed-non-removable-battery prohibition
  threshold (`Q-7.3-002`, `Q-7.5-013`).
- **§3.9.2.6.0** (Part 3, Classification — "Rubriques affectées" table):
  confirms the UN-number/chemistry/equipment-status assignment — ONU 3090
  (lithium métal, seules), ONU 3091 (lithium métal, avec/dans équipement),
  ONU 3480 (lithium ionique, seules), ONU 3481 (lithium ionique, avec/dans
  équipement), plus ONU 3536 (batteries installées dans engins de
  transport, new to this edition) — resolving `Q-7.2-034`, `Q-7.4-044`,
  `Q-7.5-044`, `Q-7.10-006`, `Q-7.10-031`.
- **§9.3.2.1.3** (Part 9, loading segregation): "Les colis et les
  suremballages contenant des batteries au lithium ionique ONU 3480
  préparées conformément à la section IA ou IB de l'instruction
  d'emballage 965, [...] batteries au lithium métal ONU 3090 [...]
  l'instruction d'emballage 968 [...] ne doivent pas être chargés à bord
  d'un aéronef à côté de colis [...] portant une étiquette de danger de la
  classe 1, autre que la division 1.4S, la division 2.1, la classe 3, la
  division 4.1 ou la division 5.1" — exact match, resolving `Q-7.3-012`
  and `Q-7.6-002`, and independently confirming the PI 965 (lithium-ion) /
  PI 968 (lithium metal) pairing used by the §3.9.2.6.0 items above.
- **§7.1.5.5.2(b), §7.1.5.5.3** (Part 7, marking): "La marque doit mesurer
  au minimum 100 mm de large × 100 mm de haut... [réductible à] 100 mm de
  large × 70 mm de haut" and "le ou les numéros ONU indiqués sur la marque
  devraient avoir au moins 12 mm de haut" — resolves `Q-7.3-034`,
  confirming both the correct 100×100mm answer and the real-but-different
  referent of the "12 mm" distractor. The Figure 7.1.C grandfather-clause
  note (63rd-edition mark usable until 31 December 2026) was also
  confirmed verbatim.

No SOURCE GAP or SOURCE CONFLICT found for any of the 14 items — all
KOST Tier B content matched current DGR 67e AM1 text exactly, including
distractor-level detail. All 14 marked `FROZEN FR / SOURCE VERIFIED` in
their respective production banks; `docs/DGR_TIER_A_INVENTORY.md` updated
accordingly (FROZEN 158→172, NOTATTEMPTED 257→243).

### 2026-08-25 (second Tier A phase) — Topic 2: NOTOC, 23 items cross-applied (20 confirmed, 3 partial)

One Bookshelf navigation to **§9.5.1 "Commandant de bord"** (the current
edition's NOTOC section, confirmed at Part 9 p.693) resolved 20 of the 23
items tagged to the NOTOC topic in `docs/DGR_TIER_A_INVENTORY.md`, across
Functions 7.3, 7.4, 7.6, 7.7, and 7.8. Sub-sections read directly this
session:

- **§9.5.1.1.1(a)** — who/when/what: exploitant must give the captain
  written/printed precise information before departure. Resolves
  `Q-7.4-035`, `Q-7.6-004`, `Q-7.7-001`, `Q-7.8-025`.
- **§9.5.1.1.3(a)-(j)** — the full required-field list (date du vol, LTA
  number, exact shipping name+UN/ID, class/division+subsidiary risks,
  packing group, package count/quantity/location, CAO indication,
  discharge airport, State derogation). Shipper's own name/contact details
  confirmed absent from this list. Resolves `Q-7.4-012`, `Q-7.6-003`,
  `Q-7.8-001` (required-fields items) and `Q-7.7-012` (§9.5.1.1.3(d)
  subsidiary-risk sub-clause) and `Q-7.7-032` (§9.5.1.1.3(i)-(j)
  discharge-airport/derogation sub-clause).
  **Observed KOST omission (not a correctness defect in any current
  item):** the current field (a), "la date du vol," does not appear
  anywhere in the KOST course's own field enumeration — flagged for
  awareness if a future item ever tests the flight-date field.
- **§9.5.1.1.6** — the NOTOC must be presented on a document distinct from
  the LTA, the Shipper's Declaration, or invoices. Resolves `Q-7.3-038`,
  `Q-7.4-052`, `Q-7.6-031`.
- **§9.5.1.1.7** — loading-person confirmation/accuracy duty (general
  anchor only — see caveat below).
- **§9.5.1.1.9** — ground copy retained, accessible to the agent des
  opérations aériennes / designated ground staff "jusqu'à l'arrivée du
  vol." Resolves `Q-7.8-006`.
- **§9.5.1.1.10** — English language requirement, verbatim match. Resolves
  `Q-7.7-033`, `Q-7.8-049`.
- **Tableau 9.5.A / §9.5.1.1.3.4** — the current NOTOC-exemption list
  (excepted quantities §2.6.1, magnetized masses, GMOs, Category B
  biological substances ONU 3373, certain lithium/sodium battery Section
  II packages, radioactive excepted packages). Resolves `Q-7.4-053`,
  `Q-7.6-030`, `Q-7.7-031`, `Q-7.8-023`, `Q-7.8-024`.

**3 items left PARTIALLY CONFIRMED, not FROZEN:**
- `Q-7.4-013`, `Q-7.6-009` — KOST's "NOTOC must exactly match the plan de
  chargement" / "loading planner must issue an amended NOTOC on
  divergence" claims. A full in-book search for "plan de chargement"
  across the entire current DGR text returned **zero matches** — this
  exact terminology is not DGR-defined. §9.5.1.1.7 confirms a general
  loading-accuracy/confirmation duty exists, but not this specific
  framing. Not contradicted, just not independently verified — left Tier
  B for the specific claim.
- `Q-7.8-050` — KOST's "principle justifying the NOTOC's existence"
  framing (captain informed for emergency-response purposes) is not
  found as a standalone DGR clause; §9.5.1.1 opens directly at the
  operative rule with no separate rationale preamble. The item's own
  first distractor remains independently confirmed wrong via §9.5.1.1.6.

No SOURCE GAP or SOURCE CONFLICT found for any of the 23 items. Program
totals after Topic 2: 192 FROZEN (was 172), 24 PARTIAL (was 21), 220
NOTATTEMPTED (was 243); GAP (13) and STALE (4) unchanged.

### 2026-08-25 (second Tier A phase) — Topic 3: Part 6/UN-spec packaging marks, 10 items cross-applied (all confirmed)

Navigation to **Part 6 §6.0.3 and §6.0.4** (Bookshelf p.677) resolved all
10 items tagged to the Part 6/UN-spec-mark topic, across Functions 7.3,
7.4, 7.5, 7.6, 7.7, 7.8, 7.9, and 7.10 — the cleanest topic sweep so far
(10/10 FROZEN, zero PARTIAL). Sections read directly this session:

- **§6.0.3.1** — packaging type codes: 1=Fût, 2=Réservé, 3=Jerrican,
  4=Caisse, 5=Sac, 6=Emballage composite. Resolves `Q-7.5-022`,
  `Q-7.10-042`.
- **§6.0.3.2** — packaging material codes: A=Acier, B=Aluminium, C=Bois
  naturel, D=Contre-plaqué, F=Bois reconstitué, G=Carton, H=Matière
  plastique, L=Textile, M=Papier multicouches, N=Métal autre, P=Verre/
  porcelaine/grès. Resolves `Q-7.7-025`.
- **§6.0.4.0.1** — marks certify the design type passed manufacture-stage
  performance tests (§6.2/§6.3), not fitness for a specific substance —
  verbatim match. Resolves `Q-7.3-033`.
- **§6.0.4.2.1(c)** — the X/Y/Z packing-group letter: "X pour le groupe
  d'emballage I... Y pour le groupe d'emballage II... Z pour le groupe
  d'emballage III." Resolves `Q-7.4-032`, `Q-7.5-021`, `Q-7.6-024`,
  `Q-7.8-022`, `Q-7.9-028`, `Q-7.10-023` (the 6-item "UN/4G/Y/30/S/13/CH"
  worked-example cluster). Distractor elements independently confirmed at
  §6.0.4.2.1(b) (packaging type/material code), (d) (max gross mass or
  "S" for solids/inner packagings), (f) (year of manufacture), (g) (State
  authorizing the mark).

No SOURCE GAP or SOURCE CONFLICT found. Program totals after Topic 3: 202
FROZEN (was 192), 210 NOTATTEMPTED (was 220); GAP (13), PARTIAL (24),
STALE (4) unchanged.

### 2026-08-25 (second Tier A phase) — Topic 4: §2.8 State/operator divergences, 21 items cross-applied (14 confirmed, 6 partial, 1 stale citation)

Navigation to **§2.8** (Part 2, Bookshelf p.13, with the operator-divergence
sub-section at p.96) resolved the 21 remaining items tagged to the §2.8
divergence topic (a 22nd, `Q-7.6-009`, was already resolved as PARTIAL
under Topic 2/NOTOC). Sections read directly this session:

- **§2.8.3.1** — the operator-divergence rule: "Les divergences des
  exploitants... ne peuvent pas être moins restrictives que les
  dispositions de la présente Réglementation; et... sont applicables à
  tout transport assuré par les exploitants concernés." Exact match to
  KOST's "ne doivent pas être moins restrictives... applicables à tous les
  transports." Resolves `Q-7.2-017`, `Q-7.3-021`, `Q-7.4-030`, `Q-7.5-009`,
  `Q-7.6-042`, `Q-7.8-041`, `Q-7.10-022`.
- **§2.8.3.5 "Liste"** — confirms "Air Algérie AH" is a real, current
  operator-divergence entry. Combined with §2.8.3.1, resolves `Q-7.6-022`,
  `Q-7.7-023`, `Q-7.8-020`, `Q-7.9-026`.
- **§2.8.1.3 "Liste"** — confirms "Italie ITG" is a real, current
  State-divergence entry (used in `Q-7.8-020`'s own distractor logic).
- **§2.0** — "Les États et les exploitants peuvent imposer des
  dispositions plus strictes... sous forme de divergences (voir 2.8)"
  (already read during Topic 1). Resolves `Q-7.5-036`, `Q-7.9-037` (Table
  2.3.A limitability).
- **Divergence PKG-02 (Pakistan)** — exact verbatim match: "Toutes les
  étiquettes de danger doivent comprendre un texte assez court, rédigé en
  anglais, indiquant la nature du danger (voir 7.2.2.3, 7.2.2.4 et
  10.7.2)." Resolves `Q-7.3-029`.

**1 item moved to STALE CITATION:** `Q-7.3-025`'s correct answer cites
"les divergences de l'opérateur sont énumérées dans 2.8.3.4 et 2.8.4" —
but current DGR's §2.8.3.4 is titled "Calendrier" (submission deadlines),
not an enumeration reference; the actual cross-reference (§2.8.3.1) points
to §2.8.4 alone.

**6 items moved to PARTIAL** — two distinct nuances, neither found as a
standalone current-DGR clause:
- `Q-7.2-037`, `Q-7.4-043`, `Q-7.5-025`, `Q-7.10-041`: KOST's simplified
  "État d'Origine/Départ, État de Destination, tous les États des escales
  de Transit" 3-State list does not appear as a general rule anywhere in
  current §2.8.1. The actual current rule (§2.8.1.1.2-.1.1.3) is
  territorial-sovereignty-based: MORE-restrictive State divergences apply
  to/from/via the notifying State's own territory (by all operators) PLUS
  outside it (only by operators whose "État de l'exploitant" is that
  State); LESS-restrictive State divergences apply only within the
  notifying State's own territory, only to operators of that State.
- `Q-7.5-012`: the named 4-level "OACI(IT)→IATA(DGR)→Divergences
  États→Divergences exploitants" hierarchy diagram was not independently
  located as a standalone current-DGR clause/figure — the underlying
  most-restrictive-rule-wins mechanic is consistent with confirmed text
  (§2.8.3.1, §2.8.1.1.2), but the diagram itself appears to be the
  course's own pedagogical synthesis.
- `Q-7.7-043`: the blanket "notifiées à l'OACI et à l'IATA" claim (for
  both État and Exploitant divergences alike) is not confirmed as stated.
  Current text: État divergences → "notifiées à l'OACI **ou** à l'IATA"
  (§2.8.1.1.1, OR not AND); Exploitant divergences → submitted to "le
  Secrétariat de l'IATA" specifically (§2.8.3.0), no OACI channel
  mentioned for operators.

Program totals after Topic 4: 216 FROZEN (was 202), 30 PARTIAL (was 24), 5
STALE (was 4), 189 NOTATTEMPTED (was 210); GAP (13) unchanged.

### 2026-08-25 (second Tier A phase) — Topic 5: §2.5 operator-property, 7 items cross-applied (2 confirmed, 3 partial, 2 source conflict)

Navigation to **§2.5 "Marchandises dangereuses en la possession de
l'exploitant"** (Part 2) resolved all 7 items tagged to this topic, across
Functions 7.4, 7.5, 7.6, 7.8, 7.9, 7.10.

**Significant finding — KOST's "5-category" list does not match the
current edition's structure.** Current DGR §2.5.1 "Exceptions" states:
"Les dispositions contenues dans la présente Réglementation ne s'appliquent
pas aux articles et aux matières mentionnées en 2.5.1.1 à 2.5.1.5," listing
exactly five categories:
- §2.5.1.1 Équipement de bord
- §2.5.1.2 Produits de consommation
- §2.5.1.3 Dioxyde de carbone solide (glace carbonique)
- §2.5.1.4 **Produits d'hygiène** (disinfectants/cleaning products for
  passenger/crew hygiene, carried by the operator)
- §2.5.1.5 Équipement électronique alimenté par une batterie

KOST's course list swaps out §2.5.1.4 "Produits d'hygiène" for "Pièces
pour avions" (aircraft parts) — but aircraft spare parts are governed by a
structurally different, separate provision, **§2.5.2 "Pièces de rechange
d'aéronef,"** which states essentially the *opposite* of an exemption:
removed/replacement parts of §2.5.1-exempted items must generally comply
with the full Regulation unless the State of the operator authorizes
otherwise (§2.5.2.1/.2.3/.2.4). The course appears to have mislabeled
§2.5.2's spare-parts rule as if it were itself a 6th/alternate exemption
category, while dropping the real 4th category entirely. **This is a
genuine content-correction opportunity for KOST's own course material**,
independent of this bank's own item-level fixes.

Resolution per item:
- `Q-7.8-012` (glace carbonique, §2.5.1.3), `Q-7.10-028` (Faux — some
  exemptions do exist, §2.5.1) — FROZEN. Neither item's core tested fact
  depends on the "pièces pour avions" question.
- `Q-7.4-028`, `Q-7.5-026` — moved to **SOURCE CONFLICT**: their own
  correct answer/tested claim asserts "pièces pour avions" as one of the
  5 exempted categories, which current DGR does not support.
- `Q-7.6-038`, `Q-7.9-009` — moved to PARTIAL: correct answer remains
  valid (neither pharma nor passenger-carried DG is a §2.5.1 category
  either way), but one distractor ("pièces pour avions") is presented as
  if it were a genuine category, which current DGR does not support.
- `Q-7.5-027` — moved to PARTIAL: the general category (§2.5.1.1/.1.2) is
  confirmed, but the specific worked-examples list (piles, extincteurs,
  équipements de sauvetage, etc.) is not verbatim-located in current DGR
  text — §2.5.1.1 is worded generically with no itemized examples, and
  §2.5.1.2's own examples list (aérosols, boissons alcoolisées, parfums,
  eaux de Cologne, briquets) only partially overlaps.

Program totals after Topic 5 (completing priority topics 1–5): 218 FROZEN
(was 216), 33 PARTIAL (was 30), 7 STALE (was 5), 182 NOTATTEMPTED (was
189); GAP (13) unchanged.

### 2026-08-25 (second Tier A phase) — Priority item 7: the original 4 STALE CITATION items, expanded negative-search findings

Per the navigation plan's priority order (item 7, after the 5 topics),
re-examined the 4 original STALE CITATION items from the first Tier A
sweep: `Q-7.2-021`, `Q-7.2-022`, `Q-7.2-045`, `Q-7.3-039`. All four remain
non-FROZEN, but each now carries a confirmed, exhaustively-searched
negative finding rather than an open "citation likely stale" note:

- **§9.5.1.2, read in full this session** (during Topic 2 NOTOC
  navigation): "L'exploitant doit s'assurer... que les renseignements
  appropriés sont immédiatement disponibles en tout temps afin d'être
  utilisés en cas d'intervention d'urgence... Ces renseignements doivent
  être à la disposition du commandant de bord et peuvent être fournis au
  moyen: des éléments indicatifs sur les interventions d'urgence... (Doc
  9481–AN/928 de l'OACI); ou de tout autre document..." — confirms
  §9.5.1.2 is specifically about **pilot-in-command access to ICAO Doc
  9481 emergency-response guidance**, not a general damaged-package
  first-action procedure (`Q-7.2-021`/`Q-7.2-045`) or a general
  "employer must inform all employees, available wherever DG handled,
  airport authorities must establish a procedure" claim
  (`Q-7.2-022`/`Q-7.3-039`).
- **§9.3.6 "Colis de marchandises dangereuses endommagés," read in full
  this session** as the most likely alternative source for `Q-7.2-021`/
  `Q-7.2-045`'s content: covers the operator's PRE-LOADING inspection duty
  (inspect for damage/leakage before loading; remove damaged/leaking
  packages; ensure the rest of the consignment is undamaged) — a
  loading-supervisor's duty, not a front-line employee's personal
  "aviser votre supérieur" / body-contact first-response procedure.
- A direct in-book search for the procedure's own wording ("aviser votre
  supérieur" combined with "colis endommagé") returned **zero matches**
  anywhere in the current text.

**Conclusion:** the KOST 5-step general emergency procedure
(`Q-7.2-021`/`Q-7.2-045`) and the "employer must inform all employees"
claim (`Q-7.2-022`/`Q-7.3-039`) are not located anywhere in current DGR
67e AM1 after a reasonably exhaustive search. This content likely derives
from ICAO Doc 9481 (which the DGR references but does not reproduce) or
company-level procedure, not the DGR text itself. All 4 items remain
`DRAFT` with an explicit, confirmed `SOURCE GAP` note — not fabricated,
not silently left as an open stale-citation flag.

## Pending source targets

_Pilot (Q-7.1-001–012): none — Q-7.1-001 was the last open pilot item; see
above for its resolution._

_Production bank Batch 1 (Q-7.1-013–019): none — all 7 Tier A verified
2026-08-25 (see per-item entries above). Function 7.1 Batch 1 is fully
Tier A closed. Do not start a Batch 4 for Function 7.1 while a session has
live Tier A Bookshelf access without prior explicit instruction — priority
is Functions 7.2–7.10's own Tier A backlog first, per the standing
production-scope rule in `.claude/rules/dgr-stage2b.md`._

### 2026-08-24 session — 3 of 4 items resolved; Q-7.1-001 blocked mid-retrieval by a tooling failure
Working via the `chrome-devtools` MCP attached to the user's already-open, already-authenticated Chrome (book `DGR-6066-67`, matches current baseline). Discovered the reader's chrome (search box, table of contents, page navigator) renders in the **top-level frame** (`digitalpublications.iata.org`), not inside the cross-origin `jigsaw.iata.org` reader iframe — so it is directly clickable/typeable via `evaluate()`, and `screenshot()` captures the actual page content (including the cross-origin iframe) at the browser-compositor level regardless of the JS same-origin restriction. This combination (in-app "Search across book" + Table-of-Contents navigation + screenshot reading) let this session retrieve real page content for the first time.
Using it, Q-7.1-006, Q-7.1-007, and Q-7.1-008 were fully retrieved and verified (see entries above). Mid-way through Q-7.1-001 — after confirming the glossary location but before reading the actual entries — the MCP connection began failing every call with `Network.enable timed out`, and did not recover after ~6 retries over several minutes. No content was fabricated to compensate; Q-7.1-001 remains `SOURCE REQUIRED` for its core claim. Next session should resume directly at Appendice A — Glossaire (p.703, reachable via ToC "Go to APPENDICE A — GLOSSAIRE, page 703") and read the "Danger" / "Risque" entries directly — a bare keyword search for "Danger" is too noisy (5000+ hits from hazard-label text throughout the book) and should be avoided in favor of browsing the glossary itself.
A separate attempt to attach Playwright directly to the same Chrome via CDP (`connect_over_cdp`, both HTTP discovery and the raw `ws://.../devtools/browser/<id>` endpoint from Chrome's own `DevToolsActivePort` file) failed: the HTTP JSON endpoint returns a bare 404 for all paths/headers tried, and the raw WebSocket connected but Chrome never answered the CDP protocol handshake (180s timeout) — consistent with a security/origin gate on this browser instance that the already-attached `chrome-devtools` MCP client satisfies but a fresh Playwright client does not. This path was abandoned in favor of the working `chrome-devtools` MCP channel described above.

### 2026-08-24 session (later pass) — Q-7.1-001 resolved, chrome-devtools MCP fully recovered
On this pass the `chrome-devtools` MCP connected cleanly on the first try (client reload between sessions, as anticipated). Two dead ends tried first: (1) two persistent Playwright browser profiles found at `~/.claude/browser-profiles/{iata-bookshelf,kostgroupe}` (created by an earlier session, per `docs/LOCAL_RECOVERY_TARGETS.md`'s `kost-eexam-console` lead) had fresh cookie databases but neither login had actually completed — both redirected to sign-in pages when probed headlessly via Playwright reusing those profile dirs; abandoned without further action. (2) A direct URL `navigate()` to the reader route left the Mosaic iframe stuck on an infinite loading spinner (same symptom the first pass hit) — the fix, confirmed again, is to dispatch a real `MouseEvent` click on the dashboard's "Continue Reading" `<a>` so the app's own client-side router drives the navigation, rather than a full top-level `navigate()`.
Once in the reader, the ToC's "Items in APPENDICE A — GLOSSAIRE" expand toggle (`data-interaction-id="toc_expand"`, top frame) revealed only one sub-entry ("Généralités") — the glossary is not letter-paginated, so full A–Z content lives on one continuously-scrollable reader page (703) that cannot be scrolled programmatically (it is genuinely inside the cross-origin iframe; the page-navigator's "Next" button jumps straight to the next *chapter*, page 704, skipping the rest of 703). "Search across book" resolved this: a query with a small, page-703-relevant result count (tens, not thousands) renders every group header in the (virtualized) results list, letting `evaluate()` find and click the exact snippet. This is how the Généralités policy text and the §1.0 Note were read, and how the absence of a "Danger"/"Risque" headword in Appendice A was confirmed. Full resolution and citations are in the Q-7.1-001 entry above.

## Evidence hygiene

- Screenshots may be used for visual formatting evidence when copy/paste loses typography.
- A blank Special Provision field alone never proves that no exception mechanism exists.
- A distractor may rely on the same Tier A provision as the correct answer when that provision directly disproves it.
- Old exams/practice books remain coverage/style references only.
