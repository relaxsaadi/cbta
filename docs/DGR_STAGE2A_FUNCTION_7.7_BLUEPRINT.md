# DGR Stage 2A — Function 7.7 — Exam Blueprint (PROVISIONAL / CEILING)

**Function 7.7**: *Équipage de conduite* (flight crew / pilots).

**Status: PROVISIONAL — SUBJECT TO SOURCE-ITEM DRAFTING, TIER A REGULATORY
GATING, QUALIFIED-INSTRUCTOR VALIDATION, AND ANAC ACCEPTANCE.** Every count
below is a **source-yield ceiling**, not a target to pad toward — per the
standing rule in `.claude/rules/dgr-stage2b.md` and
`docs/FULL_PROGRAM_READINESS_SCOPE.md`: *"Source-supported production-bank
scope/ceiling established; no arbitrary quota filling."* No question is
drafted in this pass. This blueprint is built on the cross-validated Stage 1
enumeration in `docs/DGR_STAGE1_FUNCTION_7.7_DRAFT.md` (status:
CROSS-VALIDATED, confirmed by
`docs/DGR_STAGE1_FUNCTION_7.7_CROSSVALIDATION.md` — 27 leaf sub-tasks, no
correction found on second pass).

**Do not assume any other function's counts, block structure, or
qualification levels apply here.** Function 7.7 has its own block set (0/6.2/7,
not 0/1/2, 0/3/7, or 0/4/6/7), an 18-item Block 0 whose count/structure
matches Function 7.6's exactly but whose exact wording does not (0.2.2
differs), and it is the **first function in this program to activate
sub-block 6.2** ("Gérer les marchandises dangereuses avant et pendant le
vol") rather than 6.1 or the single leaf 6.1.6. Every count below is derived
independently from Function 7.7's own source material's actual depth.

## Method

For each of the 27 leaf sub-tasks, the count is derived from the "KOST
course trace" / "Exam/practice trace" / "Coverage assessment" columns
already recorded in `docs/DGR_STAGE1_FUNCTION_7.7_DRAFT.md`'s sub-task
enumeration tables (independently re-verified in the cross-validation pass),
converted to a provisional ceiling using this banding — anchored to *this
function's own* slide-span and exam/practice cross-reference counts, the
same banding convention used in `docs/DGR_STAGE2A_FUNCTION_7.4_BLUEPRINT.md`
and `docs/DGR_STAGE2A_FUNCTION_7.5_BLUEPRINT.md`, not a copy of either
function's actual numbers:

| Stage 1 coverage assessment | Typical evidence pattern in this course | Ceiling band |
|---|---|---|
| Very strong ("most extensively developed/tested [sub-task/topic] in the [course/function]") | 6+ slides, worked examples/multi-step procedures, 6+ exam/practice cross-refs | 6–8 |
| Strong | Dedicated slide(s), clear exam/practice trace | 3–4 |
| Strong, shared evidence base (lifecycle/topic reuse) | Dedicated slide(s), but content pool shared with another leaf | 3, with a binding distinct-framing restriction |
| Adequate / adequate-but-shallow | Pointer-level, single-fact, or single-slide coverage | 1–2 |
| Adequate, generic-awareness only | States an obligation/procedure exists, no operational detail | 1, sample 0–1 |
| Thin/adjacent, not a clean match | Passing/adjacent mentions only, wrong framing or wrong pedagogical stage | 1, sample 0–1, restricted framing |
| Partial coverage (one of several named parts evidenced) | One part of a multi-part official sub-task strongly evidenced, the rest absent | 1, sample 0–1, restricted to the evidenced part only |
| Thin/merged (shared, undifferentiated slide across 2 leaves) | One slide, no independently reinforced wording for either leaf | Combined single pool, per binding caveat below |
| SOURCE GAP | No slide, exam, or practice-book content found anywhere | 0 |

**Sample** = the recommended maximum number of items drawn from that
sub-task's pool for a single exam sitting — a per-sub-task draw ceiling, not
a claim every sub-task must appear every sitting.

## Binding caveats carried into this blueprint

1. **0.3.2 "Comprendre les responsabilités des passagers" — confirmed
   SOURCE GAP. Count = 0, no exception.** Independently reconfirmed in the
   cross-validation pass: `grep -i "responsab"` across the full 131-slide
   course returns 8 hits, every one tied to shipper/operator duty wheels,
   zero co-occurrence with "passager." No exam or practice question is
   framed around passenger obligations. **Do not draft any item against
   this leaf without new evidence.**
2. **6.2.1 "S'occuper des marchandises dangereuses non permises dans les
   bagages" — thin/adjacent decision: count = 1, sample 0–1, restricted
   framing.** The closest content — passenger-carriage-limits material
   (shared with 0.2.3's own pool) and the "fret ou bagages contaminés"
   ground-side procedure (p.123–124) — is an operator/ground-acceptance
   decision, not the flight crew's own in-flight response to non-permitted
   DG found in baggage. A minimal, non-zero ceiling is kept because the
   adjacent content is real, but **any item drawn from this pool must be
   framed around the flight crew's own awareness/response, not restate the
   ground-acceptance contaminated-baggage procedure verbatim.**
3. **6.2.4 "Informer l'agent des opérations aériennes/le régulateur de
   vols/le contrôle de la circulation aérienne en cas d'urgence" — partial
   coverage: count = 1, sample 0–1, restricted to the ATC third only.**
   Independently reconfirmed by keyword search: "régulateur de vols" does
   not appear anywhere in the course; "agent des opérations aériennes" is
   named once, but only in the routine pre-arrival NOTOC-accessibility
   context, not the emergency-notification context this leaf specifies; the
   ATC clause ("informer l'ATC des marchandises dangereuses transportées")
   is the only cleanly-evidenced, correctly-contextualized part. **Any item
   drawn from this pool must test only the ATC-notification obligation — it
   must never assert that the course teaches a flight-ops-agent or
   flight-dispatcher emergency-notification duty, which remain open SOURCE
   GAPs.**
4. **0.4.3 "Envisager de multiples dangers" — thin/adjacent decision: count
   = 1, sample 0–1, restricted framing.** The same recurring finding as
   Functions 7.4 and 7.6: "risques subsidiaires" appears exactly once, in
   the NOTOC content-field list (p.104, an operational-stage mention), never
   at the classification stage this sub-task's own wording targets. Practice
   Q13's clean "Subsidiary Risk" definitional question anchors a minimal,
   non-zero ceiling. **No item may test a classification-stage
   "determine/assign primary vs. subsidiary hazard" procedure — that method
   is not taught anywhere in this course; an item may only test the
   operational-awareness fact that a package's NOTOC entry may list more
   than one hazard.**
5. **0.6.1 and 6.2.3 share their evidence base** (the same p.117–125
   emergency-procedure slide pool: 4-step initial response, 5-step
   spill/contact response, the OACI in-flight and post-landing guides).
   Both are kept as separate pools because Table 7.7.A lists them as
   genuinely distinct leaf items at different qualification levels (0.6.1
   is ★, generic-awareness; 6.2.3 is ★★★, applied). **Binding drafting
   instruction:** 0.6.1 items must test the general *awareness* that
   emergency procedures exist and their basic sequence; 6.2.3 items must
   test *applying* a specific procedure step to an operational scenario
   (mirroring the practice book's own Q30 capstone) — the same underlying
   procedural knowledge tested at two genuinely different depths, not
   duplicated verbatim.
6. **7.1 + 7.2 (accident vs. incident reporting) — treated as ONE combined,
   dual-tagged pool**, following the identical-evidence-pattern precedent
   already set in `docs/DGR_STAGE2A_FUNCTION_7.2_BLUEPRINT.md` and
   `docs/DGR_STAGE2A_FUNCTION_7.4_BLUEPRINT.md`. Stage 1 confirms both share
   one undifferentiated slide (p.127) with no independently-worded
   treatment of "accidents" vs. "incidents" — now the **seventh** function
   in this program with this exact confirmed pattern for this exact leaf
   pair. **A produced item counts toward satisfying both 7.1 and 7.2's
   coverage simultaneously, not as two separate items.**
7. **Two standalone assessment-instrument items are explicitly OUT of scope
   for this bank at 0 — a deliberate scoping exclusion, not an oversight.**
   - **Exam Q16 and Practice Q25** both test a *general* DG-incompatibility/
     separation principle ("les marchandises dangereuses incompatibles...
     doivent être séparées"). Independently reconfirmed: `grep -i
     "incompatib"` returns zero matches anywhere in the 131-slide course,
     and the course's only "séparat"/"separat" content is radioactive-
     material-specific (TI/Table 10.9C–10.9D territory, itself already
     captured under 6.2.2's evidence base). Function 7.7's own official
     table has **no Block 4** (the separation-planning block other
     functions' tables carry) to attach this content to. **No leaf sub-task
     exists in this blueprint to allocate a ceiling to; if this content is
     ever tested for Function 7.7, it requires an explicit, separate scoping
     decision — not silent inclusion under 6.2.3 or any other leaf.**
   - **Practice Q6** (lithium-battery physical loading precautions — taping
     terminals, separating batteries to avoid sparking) tests physical
     package-handling content that, per other functions' tables, belongs to
     a Block 4.2-style sub-block that **Function 7.7's own table does not
     include at all**. The course's own lithium-battery *classification*
     content (part of 0.4.1's pool) is unaffected and remains counted there.
     Same treatment: **no ceiling allocated, flagged as an open scoping
     question, not silently discarded or silently folded into 0.4.1/6.2.2.**
8. **0.2.1 and 0.2.2 do NOT share an evidence base for this function —
   unlike Function 7.5's identical-numbered leaves.** Independently
   confirmed in Stage 1 and the cross-validation pass: 0.2.1 draws on
   p.35–41 (prohibition/derogation/exception slides) and 0.2.2 draws on a
   separate p.52–56 range (hidden-DG/COMAT slides) — two genuinely distinct
   slide pools, each independently reinforced by its own practice-book
   cross-reference (Q5 and Q3 respectively). **No shared-evidence
   distinct-framing caveat is needed for this pair in this function,** in
   contrast to Function 7.5's blueprint (binding caveat 4 there) and
   Function 7.4's blueprint's own interpretive-mapping caveat for the same
   leaf pair.
9. **Exam Q9 (pepper spray) and Practice Q3 (matériels de tournage/filming
   equipment) name items the course's own worked examples do not.** These
   remain valid, gradeable questions within 0.2.3's and 0.2.2's evidenced
   pools respectively (the underlying rule/concept they test — prohibited
   items on the person; hidden-DG recognition — is taught), but any newly
   drafted item must stay within content the course actually names as a
   worked example, not assume the exam/practice book's own
   beyond-course examples are course-taught facts.
10. **Course baseline is the DGR 66th Edition, not the current 67th
    Edition/Addendum 1**, independently reconfirmed this pass (p.25: "66ème
    édition"; standalone 66th-Edition-Addendum document in the source
    folder). Every regulatory paragraph, table, and figure cited as evidence
    below (e.g., the NOTOC required-field list, DGR Tables 10.9C/10.9D
    radioactive-separation figures) is Tier B — as displayed by the KOST
    slides — not yet Tier A–verified. This blueprint fixes *how many
    questions per sub-task the source can support* and *why*, not final
    question wording or regulatory correctness — a separate, later Tier A
    gate, with particular priority for this function on the NOTOC
    content-field requirements and the radioactive TI/separation material
    (6.2.2's evidence base), the heaviest-weighted (★★★) and
    best-evidenced content in the whole function.
11. **No practice-book gap exists for this function** (unlike Function 7.3's
    genuine misfiling) — Function 7.7's own practice book is confirmed
    genuine and correctly filed by MD5 in both the Stage 1 draft and the
    cross-validation pass, and at 30 questions is the longest practice book
    found in this program so far. No block-wide extra-scrutiny caveat is
    needed here.

## Block 0 — Compréhension des principes de base (★, 18 leaf sub-tasks, 1 SOURCE GAP)

| ID | Sub-task | Stage 1 coverage | Count (ceiling) | Sample | Evidence basis |
|---|---|---|---|---|---|
| 0.1.1 | Comprendre la définition | Strong — direct, near-verbatim match, reinforced by the opening Saudia case-study video | 4 | 1 | ~8 slides (p.8, 11–18): DG definition (DGR 1.0), article/substance distinction, "pourquoi le savoir," 5-accident historical framing (Pan Am/Saudia/ValuJet/Bhopal/UPS); exam Q1 |
| 0.1.2 | Reconnaître le cadre juridique (mondial, national) | Strong — global framework explicit | 4 | 1 | 11 slides (p.19–29): SCoETDG→AIEA→OACI→IATA hierarchy individually explained, DGR structure/sections/annexes/symbols; practice Q1 |
| 0.1.3 | Déterminer l'application et la portée | Adequate — direct match, no distinct exam/practice reinforcement | 1 | 1 | 1 slide only (p.30: DGR 1.2.1 scope) — genuinely thin, single-fact sub-task, kept minimal per the no-padding rule |
| 0.1.4 | Faire la distinction entre un danger et un risque | Strong — verbatim title match | 3 | 1 | 4 slides (p.31–34, incl. worked flammable-liquid example and exercise); practice Q2 |
| **0.1 subtotal** | | | **12** | **4** | |
| 0.2.1 | Développer un flair pour les marchandises dangereuses interdites | Strong | 4 | 1 | 7 slides (p.35–41): DG-types diagram, prohibited-in-all-circumstances DGR 2.1/4.2, derogation/approval/exception DGR 1.2.5–1.2.7; practice Q5 — **evidence base independent of 0.2.2, see binding caveat 8** |
| 0.2.2 | Reconnaître les marchandises dangereuses potentiellement cachées | Strong — the most extensively developed sub-task in the course by slide count | 5 | 2 | 5 slides (p.52–56, incl. exercise): DGR 2.2/2.2.4 definition, COMAT/AOG-parts hidden-DG examples, prevention recommendations; practice Q3 (exam-beyond-course note: "matériels de tournage" not a course-named example, see binding caveat 9) |
| 0.2.3 | Être au courant des dispositions s'appliquant aux passagers | Strong | 4 | 1 | 7 slides (p.42–46, 50–51): DGR 2.3.A table walkthrough, DGR 2.3 general prohibition/exceptions, exercise; exam Q8, Q9 (2) — (exam-beyond-course note: pepper spray, see binding caveat 9) |
| **0.2 subtotal (no shared-evidence caveat needed — see binding caveat 8)** | | | **13** | **4** | |
| 0.3.1 | Clarifier le rôle individuel et collectif des parties prenantes | Strong | 3 | 1 | 3 slides (p.58–60): shipper 9-item wheel DGR 1.3, operator 8-item wheel DGR 1.4, training DGR 1.5; exam Q2, Q6 (2); practice Q7 (1) |
| 0.3.2 | Comprendre les responsabilités des passagers | **0** | **0** | **0** | **SOURCE GAP — binding caveat 1. No course slide, exam question, or practice question addresses passengers' own obligations as distinct from what they may carry (0.2.3's territory). Do not draft without new evidence** |
| 0.3.3 | Reconnaître l'impact des divergences des États et des exploitants | Strong — concrete named examples | 3 | 1 | 5 slides (p.61–65): named Italy (ITG)/Air Algérie (AH) divergence examples, restriction-hierarchy diagram; exam Q7 |
| **0.3 subtotal** | | | **6** | **2** | |
| 0.4.1 | Trouver de l'information générale sur les classes et les divisions | Very strong — the most extensively developed and tested sub-task in the whole function by question count | 8 | 2 | ~16 slides (p.66–81): all 9 classes/divisions with pictogram strip, EQ codes DGR 2.6, DG List DGR 4.2 (~3,000 entries), numeric list DGR 4.3, exercises; exam Q3, Q4, Q10, Q11, Q12, Q13 (6); practice Q9, Q10, Q11, Q12, Q15, Q16, Q17 (7) — 13 total cross-refs, the richest leaf in the function |
| 0.4.2 | Comprendre les principes généraux des groupes d'emballage | Strong | 3 | 1 | 2 slides (p.68–69, incl. exercise): PG I/II/III degree-of-danger table; practice Q14 |
| 0.4.3 | Envisager de multiples dangers | Thin/adjacent, not a clean classification-stage match — **binding caveat 4 applies** | 1 | 0–1 | Only 1 operational-context mention (p.104, NOTOC content-field list: "La classe ou la division ou les risques subsidiaires"); practice Q13 (clean "Subsidiary Risk" definitional anchor) |
| **0.4 subtotal** | | | **12** | **3–4** | |
| 0.5.1 | Reconnaître les prescriptions de base concernant le marquage | Strong | 3 | 1 | 5 slides (p.89–93): marking criteria, UN-mark worked example, packaging type/material codes DGR 6.0.3.1/6.0.3.2; exam Q14 |
| 0.5.2 | Reconnaître les prescriptions de base concernant l'étiquetage | Very strong — heavily weighted in both the exam and practice book | 5 | 2 | 5 slides (p.84–88) + dedicated label reference sheet (source item 8); exam Q5 (1); practice Q18, Q19, Q20, Q21, Q22 (5) — 6 total cross-refs |
| 0.5.3 | Déterminer les documents exigés | Strong — one of the better-evidenced instances of this leaf across the program | 3 | 1 | 3 slides (p.99–101): DGD/DGR 8.0.1, Air Waybill DGR 8.2 handling-info box, SDS, reinforced by the excepted/limited-quantities documentation requirements (p.71–74); exercise (p.116) |
| **0.5 subtotal** | | | **11** | **4** | |
| 0.6.1 | Créer une sensibilisation aux procédures d'urgence générales | Very strong — this function's single most extensively developed and tested topic — **shares evidence base with 6.2.3, binding caveat 5 applies** | 5 | 2 | 5–6 slides (p.117, 119–122): 4-step initial response, 5-step spill/contact response, OACI in-flight guide, OACI post-landing guide; exam Q19 (1); practice Q30 capstone (1). Item must test general procedural *awareness/sequence*, not applied scenario execution (6.2.3's territory) |
| 0.6.2 | Comprendre les exigences d'intervention d'urgence de l'employeur | Adequate, generic-awareness only | 1 | 0–1 | Same slide as 0.6.1 (p.117): states operator must ensure information is immediately available to the commandant de bord, no further procedural detail — the same constraint applied to this identical leaf in every prior function's blueprint |
| **0.6 subtotal** | | | **6** | **2–3** | |
| **Block 0 total** | | | **60** | **19–21** | |

## Block 6.2 — Gérer les marchandises dangereuses avant et pendant le vol (★★★, 5 leaf sub-tasks; only sub-block active in this function's table)

The function's dominant operational focus by both slide density and direct
exam/practice weight, anchored by the dedicated NOTOC section (p.102–109,
111–115) and the shared emergency-procedure section (p.117–125). The
practice book's own capstone item (Q30) directly combines NOTOC-reading and
emergency-response content, mirroring 6.2.2's and 6.2.3's own evidence
bases.

| ID | Sub-task | Stage 1 coverage | Count (ceiling) | Sample | Evidence basis |
|---|---|---|---|---|---|
| 6.2.1 | S'occuper des marchandises dangereuses non permises dans les bagages | Thin/adjacent, not a clean match — **binding caveat 2 applies** | 1 | 0–1 | Closest content: passenger-carriage-limits material (shared with 0.2.3, p.42–51) and "fret ou bagages contaminés" ground-side procedure (p.123–124) — neither is the flight crew's own in-flight response to non-permitted DG in baggage |
| 6.2.2 | Interpréter la NOTOC | Very strong — the exam's own two-question NOTOC-reading pair is this function's clearest capstone evidence | 8 | 2 | ~13 slides (p.102–109, 111–115): full NOTOC purpose/content-field enumeration, filled example, exemptions list, radioactive TI/separation content (Tables 10.9C/10.9D); exam Q15, Q17, Q18 (3); practice Q4, Q8, Q23, Q26, Q27, Q28 (6) — 9 total cross-refs, the richest ★★★ leaf and second-richest leaf overall in the function |
| 6.2.3 | Appliquer les procédures en cas d'urgence | Very strong, shares evidence base with 0.6.1 — **binding caveat 5 applies** | 3 | 1 | Same p.117–125 slide pool as 0.6.1; exam Q19 (1); practice Q30 capstone (1). Item must test *applied* execution of a specific procedure step in a scenario, not restate 0.6.1's generic-awareness content |
| 6.2.4 | Informer l'agent des opérations aériennes/le régulateur de vols/le contrôle de la circulation aérienne en cas d'urgence | Partial — only the ATC third is correctly evidenced — **binding caveat 3 applies** | 1 | 0–1 | ATC clause only (p.121, "Guide OACI — en vol": "informer l'ATC des marchandises dangereuses transportées"). "Agent des opérations aériennes" named once but in a routine, non-emergency context (p.108); "régulateur de vols" absent from the course entirely |
| 6.2.5 | Informer les services d'urgence des marchandises dangereuses figurant sur la NOTOC en cas d'urgence | Strong — direct, near-verbatim match | 3 | 1 | 1 slide (p.122, "Guide OACI — après l'atterrissage": "Informer le personnel au sol/les services d'urgence de la nature et de l'emplacement des marchandises dangereuses"); exam Q19 (one of the multi-select correct answers) |
| **Block 6.2 total** | | | **16** | **4–6** | |

## Block 7 — Collecte de données pour la sécurité (★★, 4 leaf sub-tasks; 1 combined pool)

| ID | Sub-task | Stage 1 coverage | Count (ceiling) | Sample | Evidence basis |
|---|---|---|---|---|---|
| 7.1 + 7.2 (combined pool) | Signaler les accidents / signaler les incidents de marchandises dangereuses | Thin, fully merged — **binding caveat 6 applies** | 3 | 1 | Single shared, undifferentiated slide (p.127): l'exploitant doit signaler accidents et incidents aux autorités compétentes de l'État de l'exploitant et de l'État d'occurrence, y compris pour des MD exemptées; exam Q20 |
| 7.3 | Signaler les marchandises dangereuses non déclarées ou mal déclarées | Strong — clean, distinct match | 3 | 1 | Own dedicated slide (p.126): distinguishes fret/courrier from bagages/personne de voyageurs ou membres d'équipage; practice Q29 |
| 7.4 | Signaler les situations mettant en cause des marchandises dangereuses | Strong — verbatim structural match + Algeria-specific enrichment | 3 | 1 | Same base slide as 7.1/7.2 (p.127) + own dedicated Algeria/ANAC enrichment (p.129: "Pour l'Algérie, tous les compte-rendu sont adressés à... ANAC, Rouiba, Alger") — two distinct facts (general obligation + national-context enrichment) |
| **Block 7 total** | | | **9** | **3** | |

## Total bank size — PROVISIONAL / CEILING

| Block | Leaf sub-tasks | Count subtotal | Sample subtotal |
|---|---|---|---|
| 0 — Compréhension des principes de base (★) | 18 (17 non-zero) | 60 | 19–21 |
| 6.2 — Gérer les MD avant et pendant le vol (★★★) | 5 (all non-zero) | 16 | 4–6 |
| 7 — Collecte de données pour la sécurité (★★) | 4 (3 pools) | 9 | 3 |
| **TOTAL** | **27** | **85** | **26–30** |

**This total (85) is a PROVISIONAL CEILING for Function 7.7 only** — it must
not be read as a target to defend, and it must not be assumed to predict any
other function's total. It sits between Function 7.5's ceiling (67, 25
leaves) and Function 7.4's (111, 37 leaves), which is unsurprising given
Function 7.7 has 27 leaf sub-tasks with one confirmed at 0 — but the number
is not derived by interpolation, it is the direct sum of the per-sub-task
evidence assessments above. **One sub-task (0.3.2) contributes 0 to this
total; three more (6.2.1, 6.2.4, 0.4.3) are deliberately capped at 1 with
restricted framing per their binding caveats; two standalone
assessment-instrument findings (Exam Q16/Practice Q25's general
DG-incompatibility content; Practice Q6's lithium-loading-precautions
content) contribute 0 because Function 7.7's own official table has no leaf
to attach them to (no Block 4 exists) — none of these should be
redistributed onto other sub-tasks to preserve a round number.**

Of the 27 official leaf sub-tasks, **26 carry a non-zero ceiling and 1
(0.3.2) is hard-gated to zero** — a materially lower zero-rate (4%) than
Function 7.5's (16%, 4 of 25 gated), reflecting Function 7.7's own genuinely
better sourcing overall (in particular, 0.5.3 "documents exigés," a
confirmed near-total SOURCE GAP for Function 7.5, is well-covered here) even
though three further leaves (6.2.1, 6.2.4, 0.4.3) remain thin/partial and
capped at the minimum non-zero band.

**Block 6.2's average pool size (16 ÷ 5 = 3.2) sits well below Block 0's
(60 ÷ 18 = 3.3) despite Block 6.2's higher ★★★ rating**, because two of its
five leaves (6.2.1, 6.2.4) are thin/partial-gated — the block's total is
carried almost entirely by 6.2.2's single 8-item pool, this function's
richest and best-evidenced ★★★ leaf and its clearest capstone (the exam's
own dedicated NOTOC-reading question pair). **Block 7's average (9 ÷ 4 =
2.25, or 9 ÷ 3 pools = 3.0) is comparable to Block 0's**, despite its lower
★★ rating, because none of its leaves are SOURCE GAPs — merely thin/merged
for the 7.1+7.2 pair.

## What this blueprint does NOT do

- Does not draft, word, or verify any exam question — structure and
  ceilings only.
- Does not perform Tier A (current 67th Edition/Addendum-1) verification of
  any regulatory citation used as evidence above — every DGR paragraph,
  table, and figure cited is Tier B, as displayed by the KOST course,
  pending a future Tier A pass. This applies with particular weight to
  6.2.2's NOTOC-content and radioactive-separation evidence, this
  function's heaviest-weighted content.
- Does not mark any item, sub-task, or block `APPROVED` — that requires a
  named qualified reviewer and review date, per the standing rule, and has
  not happened for any Function 7.7 content.
- Does not resolve the 0.3.2 SOURCE GAP, the 6.2.1/6.2.4/0.4.3 thin/partial
  findings, or the standalone Exam Q16/Practice Q25 and Practice Q6
  out-of-scope findings — all are carried forward unresolved, with binding
  drafting restrictions rather than fabricated resolutions.
- Does not assume this blueprint's structure, ceilings, or block-weighting
  logic transfers to Functions 7.8–7.10 or any other function — Function 7.8
  is already known (per Stage 1's own forward-looking note) to share 7.7's
  exact Block 0 count and Block 6.2 leaf list but at least one further
  Block 0 wording variant at 0.2.2, and its own official table has **no
  Block 7 at all** — its Stage 2A blueprint must be independently derived,
  not copied from this one.

## Recommended next steps

1. Draft Block 0 items first (lowest qualification, largest sub-task count,
   already-confirmed stable evidence footing), skipping 0.3.2 entirely; then
   Block 7 (small, thin/merged 7.1+7.2 pool but structurally clean
   otherwise); then Block 6.2 last, with 6.2.2 drafted under deliberate
   care given it is this function's single richest and highest-qualification
   pool and its own clearest capstone evidence, and with 6.2.1/6.2.4 kept to
   their restricted single-item ceilings.
2. Before drafting 6.2.4, re-read binding caveat 3 in full — the single
   permitted item in that pool may test only the ATC-notification
   obligation, never a flight-ops-agent or flight-dispatcher emergency duty.
3. Route every regulatory-fact item through the current IATA DGR 67th
   Edition (French, Addendum 1) Tier A gate before any FR verification
   sign-off — the course's own 66th Edition baseline must not be assumed
   unchanged, particularly for the NOTOC content-field requirements and the
   Table 10.9C/10.9D radioactive-separation figures underlying 6.2.2.
4. Keep FR source-verification and EN bilingual technical review as
   separate gates, exactly as required for every other function.
5. Revisit binding caveat 7 (the Exam Q16/Practice Q25 general-
   incompatibility content, and Practice Q6's lithium-loading-precautions
   content) explicitly before or during drafting — do not let either default
   silently to inclusion (fabricating an unofficial leaf) or exclusion by
   omission.
6. Update `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md` again once production-bank
   drafting begins for Function 7.7, and proceed to Function 7.8's own Stage
   1 cross-validation next, per the standing numeric-order recommendation —
   Function 7.8's own draft is already PROVISIONAL DRAFT COMMITTED per the
   program status table and awaits its own second pass.
