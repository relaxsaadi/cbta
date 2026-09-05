# DGR Stage 1 — Function 7.5 — SECOND-PASS CROSS-VALIDATION — CONFIRMED

**Verdict: CONFIRMED.** An independent second pass re-read the same source
files cited in `docs/DGR_STAGE1_FUNCTION_7.5_DRAFT.md` (the first-pass Stage
1 draft) — including direct visual inspection of the rendered TABLEAU 7.5.A
PDF page at 400dpi (full page, plus two additional dedicated high-resolution
crops of just the star-rating column, produced specifically because a
genuine cross-session single-star/double-star misread was just found and
corrected for Functions 7.9/7.10 on a nearby page of the same source
document), MD5 checksums of every disputed/cross-referenced file, targeted
`pdftotext`/`grep`/page-mapped spot-checks of the 106-slide course, the
20-question exam, and the 25-question practice book, a full re-extraction
and re-translation of the "Cadre CBTA" matrix's raw XML, and — new in this
pass — frame-by-frame inspection of the previously-unwatched
`05_DGR_Lithium_Batteries_Airport_Passenger_Handling.mp4` video. Every
load-bearing claim in the draft is verified accurate. **No correction** to
the 25-leaf-sub-task enumeration, the block structure, the star ratings, the
four SOURCE GAPs, or the wheelchair-scenario gap is required. One
evidentiary strengthening is recorded (the video check, part (d) below) and
one precision-level addition (Block 7's total absence of exam/practice
cross-references, noted under (a)) — neither changes any count or
conclusion from the draft.

This file does not replace `docs/DGR_STAGE1_FUNCTION_7.5_DRAFT.md`; it
records the independent second pass against it, per the same two-pass
discipline Functions 7.1 and 7.3 used (draft → corrected/confirmed final).

## Method

All checks performed directly against the same folder the draft cites:
`/Users/mac/Documents/Fichiers/Algerie/CBTA final/yasmine cbta/wetransfer_supports-pedagogiques-dgr-cbta-kost-academy_2025-10-12_1842/COURS DGR-CBTA-IATA/DGR-FONCTION 7.5/`.

- `md5` on the practice book, the Training Guidance PDF, Table 2.3.A, ICAO
  Doc 10147, the label reference sheet, and the DGR-66 Addendum, compared
  against the equivalent files already recorded for Functions 7.1–7.4.
- `pdftoppm -r 400` rendering of the IATA "Orientations"/"Training Guidance"
  PDF page carrying TABLEAU 7.5.A (located independently via `pdftotext`
  form-feed page-counting, confirmed at PDF page 31 / printed page 27,
  exactly as the draft states), viewed first as a full-page image, then as
  two additional cropped, 1.3×-upscaled star-column-focused images — one for
  Block 0's 24 rows, one for Blocks 5/7's 13 rows — specifically to rule out
  a single-star/double-star or double-star/triple-star misread at high
  confidence, not merely a plausible one.
- `pdftotext -layout` full extraction of the 106-slide course, the
  20-question exam, and the 25-question practice book, with an `awk`
  form-feed page-counter so every citation in the draft could be checked
  against the exact slide/page number it claims.
- Extraction of `word/document.xml` from the "Cadre CBTA" `.docx` found
  inside `Archive.zip`'s Function 7.5 folder, stripped of markup and read in
  full (not sampled).
- `ffprobe`/`ffmpeg` inspection of the 165-second lithium-battery video: no
  embedded subtitle track exists, so 14 frames were extracted at 12-second
  intervals (covering the entire runtime) and assembled into a contact sheet
  for direct visual review.

## (a) TABLEAU 7.5.A content and star-rating column — CONFIRMED, including the specific single-star vs. double-star distinction

Located TABLEAU 7.5.A at PDF page 31 (printed page 27) of
`12_IATA_CBTA_Dangerous_Goods_Training_Guidance_Edition1_2023_FR.PDF` via
independent form-feed page-counting (matches the draft's citation exactly),
rendered it at 400dpi, and read it directly — first as a full page, then via
two further crops isolating just the star-rating column at higher
magnification.

- **Block 0** (row "0" through 0.6.2): every one of the 16 leaf rows, every
  sub-block header row (0.1–0.6), and the top-level "0" row itself carries a
  single **★**. Verified individually, row by row, in the high-resolution
  crop — no row shows two or three stars. Composition confirmed exactly as
  the draft states: 0.1.1–0.1.4 (4), 0.2.1–0.2.3 (3), 0.3.1–0.3.3 (3,
  including 0.3.2 present and active), 0.4.1 only (1, table jumps straight
  from 0.4.1 to the 0.5 header — 0.4.2/0.4.3 confirmed absent), 0.5.1–0.5.3
  (3), 0.6.1–0.6.2 (2). **Count: 4+3+3+1+3+2 = 16, confirmed.**
- **Block 5** ("Acceptation des bagages des passagers et des membres
  d'équipage"): 5.1.1, 5.1.2, 5.2.1, 5.2.2, 5.2.3 each carry a clearly
  distinct **★★★** — three separate, individually countable star glyphs on
  every row, confirmed in the same high-resolution crop. **Count: 5,
  confirmed.**
- **Block 7** ("Collecte de données pour la sécurité"): 7.1, 7.2, 7.3, 7.4
  each carry a single **★** — confirmed at the same magnification used to
  verify Block 0's single stars, sitting directly below Block 5's
  unambiguous triple stars in the same cropped image, so the single-star
  reading is not an artifact of a different crop/rendering pass. **This is
  the specific claim the task brief asked to be re-verified with extra
  care, given the genuine 7.9/7.10 single-star/double-star correction found
  on a nearby page of the same document — independently reconfirmed here at
  400dpi with a dedicated close-up crop: Block 7 is ★, not ★★.** Count: 4,
  confirmed.
- **Total: 16 + 5 + 4 = 25, confirmed independently**, matching the draft's
  own total exactly.

**Precision note not previously recorded:** all four Block 7 exam/practice
trace cells in the draft's own Block 7 table read "—" (no cross-reference).
Re-checked directly: neither the 20-question exam nor the 25-question
practice book contains any question mapped to 7.1, 7.2, 7.3, or 7.4 in the
draft, confirmed by independent full-text review of both instruments — this
function's Block 7 has **zero** direct exam/practice reinforcement for any
of its four leaves, evidenced by course-slide content alone. This is
consistent with, and reinforces, the genuinely lower ★ (vs. ★★) rating
already confirmed above, and is carried into the Stage 2A blueprint as an
additional reason to keep Block 7's pools modest. It does not change any
Stage 1 count or conclusion.

## (b) Block 0 drops both 0.4.2 and 0.4.3, yet course/exam/practice still teach/test packing groups — CONFIRMED

Directly visible in the same rendered table image: the 0.4 sub-block
contains only 0.4.1 ("Trouver de l'information générale sur les classes et
les divisions"); the table's next row after 0.4.1 is the 0.5 header
("Comprendre la communication des dangers") — 0.4.2 ("Comprendre les
principes généraux des groupes d'emballage") and 0.4.3 ("Envisager de
multiples dangers") are both genuinely absent from Function 7.5's official
task list, not a text-extraction artifact.

Independently re-confirmed in the course text:

```
p.73: "Groupes d'emballage DGR 3.0.3" — Groupe d'emballage I/II/III
       (matières très/moyennement/faiblement dangereuses)
p.74: exercise ("Quelle classe couvre les substances infectieuses?")
p.75: "Questions 12-17" practice-book pointer
```

Exam Q6 (p.3 of the exam PDF): *"Énumérez les groupes d'emballage
correspondants pour les degrés de danger suivants"* (grand danger / danger
moyen / danger mineur table). Practice Q17: **verbatim identical wording**
to Exam Q6, same three-row table. Both independently located and read in
full — the draft's "near-identical question in both instruments" claim is
confirmed precisely, down to the shared wording. This is a genuine
over-teaching-beyond-the-table finding, not a coverage gap: the course
teaches and both instruments test packing-group content with **no official
Table 7.5.A leaf sub-task to attach it to** for this function. Confirmed
exactly as the draft states.

## (c) The "Cadre CBTA" matrix for 7.5 actively describes the WRONG function (flight-deck pilots, Tableau 1.5.A) — CONFIRMED

Re-opened `PACK COMPLET FORMATION CBTA - FONCTION 7.5/📁 09_Cadre_CBTA/📁
09_Cadre_CBTA.docx` from inside
`/Users/mac/Documents/Fichiers/14_ARCHIVES_ANCIENNES/Bureau_MacBookPro/PACK COMPLET FORMATION CBTA.docx/Archive.zip`,
independently re-extracted `word/document.xml`, stripped all markup, and
read the full resulting text (not a sample).

The document is headed **"MATRICE DE COMPÉTENCES FONCTION 7.5"** but its
content is unambiguously flight-deck/technical-crew material:

- T1 "Analyser documentation" → C1 "Interprétation NOTOC"
- T2 "Prendre décisions" → C2 "Autorité commandement" → "Décider GO/NO-GO
  informé"
- T3 "Gérer urgences vol" → C3 "Gestion crise"
- T6 "Diriger déroutements" → C6 "Gestion urgence" → "Atterrir en sécurité"
- "Particularités Fonction 7.5 : Autorité suprême : Commandant de bord
  responsable final"

Its own "Spécificités réglementaires Fonction 7.5" section states, verbatim:
**`IATA DGR - Tableau 1.5.A : "Pilotes et personnel technique de vol"`** —
citing Table **1.5.A**, not 7.5.A, for **"Pilotes et personnel technique de
vol"** (flight-deck pilots), not the baggage/gate-acceptance personnel
Function 7.5 actually is. Confirmed word-for-word against the draft's
quotation. This document contributes zero usable Stage 1 evidence and must
continue to be treated as unreliable — a second confirmed instance in this
program (after Function 7.4's own wrongly-labelled matrix), independently
re-derived here rather than merely re-quoted from the draft.

## (d) The four SOURCE GAPs and the wheelchair/PRM scenario gap — CONFIRMED, with one evidentiary strengthening

**0.3.2 "Comprendre les responsabilités des passagers" — CONFIRMED full
SOURCE GAP.** `grep -i "responsab"` on every line of the course text
containing "passager" returns zero hits. The course's passenger-facing
content (p.39–49) is entirely about what passengers may/may not carry, never
about passengers' own duties (e.g. duty to declare). No exam or practice
question is phrased around passenger obligations either. Confirmed exactly.

**0.5.3 "Déterminer les documents exigés" — CONFIRMED thin/tangential.**
`grep -i "document"` across the full 106-slide course returns exactly two
hits, both generic: p.25 ("Le manuel DGR de l'IATA est considéré comme le
document «terrain»...") and p.63–64 ("8-Conservation des documents", one
item in the Expéditeur/Exploitant duty wheels already serving as evidence
for 0.3.1). No baggage-acceptance-specific documentation-check content
exists anywhere in the course. Practice Q10 ("Quel document IATA liste les
produits ou articles susceptibles de contenir des MD cachées?") independently
re-confirmed present and exactly as tangential as the draft describes — it
tests recognition of a reference document's purpose, not "determine required
documents" in the acceptance-procedure sense. Confirmed.

**0.6.2 "Comprendre les exigences d'intervention d'urgence de l'employeur" —
CONFIRMED thinner than every prior function.** `grep -i "employeur"` across
the full course text returns **zero** hits — the word itself never appears.
The only related trace, independently re-located at p.64, is the
unelaborated wheel item "Renseignement -en cas d'urgence-" among eight
Exploitant duties (shared evidence base with 0.3.1, exactly as the draft
states). No sentence anywhere states that emergency-response information
must be available to staff, unlike every one of Functions 7.1–7.4's courses.
Confirmed.

**5.2.3 "Prévenir le commandant de bord, le cas échéant" — CONFIRMED
exam-only, zero course-slide evidence.** `grep -ci "commandant"` on the
full 106-slide course returns **0**. Exam Q5's fourth sub-question —
independently re-read in full — is exactly as the draft describes: a
reduced-mobility passenger wishes to check in an electric wheelchair with an
installed lithium battery; four sub-questions follow (what must the
operator verify before accepting the chair / could the passenger carry 2
spare batteries / how and where will the chair be transported and stowed /
**"Le commandant de bord doit-il être informé de l'emplacement de la chaise
roulante ? □ Oui □ Non"**). Confirmed word-for-word.

**Reduced-mobility passenger / electric wheelchair (WCHC) scenario —
CONFIRMED as a genuine gap, now with the previously-unwatched video actually
checked.** Exam Q5 (above) and Practice Q19 (independently re-located: *"Un
vol charter Omra un passager WCHC se présente avec..."*) both test this
scenario with zero dedicated course-slide treatment, exactly as the draft
states. **New in this pass:** the draft flagged
`05_DGR_Lithium_Batteries_Airport_Passenger_Handling.mp4` as an unwatched,
"plausible" place this content could live, and explicitly recommended
checking it before treating the gap as closed or unresolvable. This pass
did so: `ffprobe` confirms a 165-second video with no subtitle track; 14
frames extracted at 12-second intervals (covering the full runtime) and
reviewed as a contact sheet show a French Ministère chargé des Transports
animated safety video about a passenger's personal lithium-battery earbuds
overheating/catching fire in the cabin during a flight — general
cabin-baggage lithium-battery fire-safety content, not a wheelchair, not a
mobility device, and not a gate-acceptance scenario anywhere across the
video's full length. **This closes the open question the draft left
standing: the video does not contain wheelchair/PRM content, so the
wheelchair-scenario gap is now more firmly confirmed as genuine (not merely
"unresolved because unwatched")** — no correction to the draft's
substantive conclusion, but a strictly stronger evidentiary basis for it.

## Additional independent spot-checks performed this pass (not exhaustive, but load-bearing)

- Course PDF confirmed 106 pages via `pdfinfo`; exam PDF confirmed 7 pages,
  20 numbered questions (1–20, individually located); practice book
  confirmed 9 pages, 25 numbered questions (1–25, individually located) —
  all matching the draft's stated counts exactly. Exam metadata "Vous avez
  60 minutes" and "Note de passage est : 80%" independently re-confirmed.
- p.25 independently re-confirmed to read "66ème édition" under "Structure
  du DGR de l'IATA," corroborating the draft's claim that the course is
  built on the 66th Edition, not the current 67th/Addendum-1 baseline.
- p.12–18 (Généralités, article/substance distinction, DGR 1.0 definition,
  historical-accident motivation slide) independently re-confirmed,
  supporting 0.1.1.
- p.41 independently re-confirmed to read: *"L'exploitant peut approuver le
  transport de plus de 15 AEP. L'exploitant peut approuver le transport de
  plus de 20 batteries"* — the course's only explicit operator-approval
  statement, supporting 5.1.2 exactly as cited.
- p.42 independently re-confirmed to read: *"Bagage avec batteries au
  lithium installées batteries non amovibles excédant 0.3g de lithium métal
  ou 2.7 Wh est interdit"* — supporting 0.2.3/5.2.2 exactly as cited.
- p.37 (DGR 2.1 prohibited-in-all-circumstances criteria) and p.48 (the
  passenger-item exercise: déodorants, oxygen generator, 5 bottles of
  alcohol, e-cigarettes, allumettes) both independently re-confirmed
  verbatim, supporting 5.1.1 and 5.2.2 respectively.
- p.51 ("DG cachées DGR2.2") and p.61 (exercise: fauteuil pour dentiste /
  équipement de plongée / trousse à outils) and p.62 ("Questions 5-11"
  practice-book pointer) all independently re-confirmed exactly as cited,
  supporting 0.2.1/0.2.2.
- p.66–70 (divergences hierarchy: OACI → IATA → Divergences États →
  Divergences exploitants diagram at p.70) independently re-confirmed,
  supporting 0.3.3/5.2.1.
- p.94 independently re-confirmed to be a title-only slide ("Information sur
  l'intervention d'urgence," no body content) and p.95's 4-step initial
  response independently re-confirmed verbatim, supporting 0.6.1.
- p.99 ("Compte rendu DG non déclarées," extending the reporting duty
  explicitly to "bagages ou... la personne de voyageurs ou de membres
  d'équipage"), p.100 ("Compte rendu accidents et incidents," shared
  wording base for 7.1/7.2), and p.102 ("Pour l'Algérie, tous les
  compte-rendu sont adressés à... ANAC") all independently re-confirmed
  verbatim, supporting 7.3, 7.1/7.2, and 7.4 respectively.
- MD5 checksums for the practice book
  (`f40262cc4478e48782a2cdd7541045a2`), Training Guidance PDF
  (`88fca4d5aa6a0dca0000dbc64b0acbdb`), Table 2.3.A
  (`5128dcff81b9a4295705cf8218d0642a`), ICAO Doc 10147
  (`00615e9649a74f132f44d384804b20e3`), label reference sheet
  (`8b63d112469b719e992e0b45da335024`), and the 66th Edition Addendum
  (`8ad20a8007e3268b6b5fb306baa67a3c`) all independently re-derived and
  match the draft's own reported hashes exactly. The practice-book MD5 was
  additionally re-compared, in this pass, directly against all four other
  practice-book MD5s already on disk for Functions 7.1–7.4
  (`20c06b5481669957131185b12afd86ad` ×2, `7dee3dcf6b644daf29954770e6971928`,
  `3e75aa010e214c98673ee88d8ab174f2`) — Function 7.5's own hash matches none
  of them, confirming the practice book is genuinely distinct and correctly
  filed, exactly as the draft concludes.

## Outcome

**CONFIRMED — no correction required to the 25-leaf-sub-task enumeration,
block/sub-block structure, star ratings (including the specific ★ vs. ★★★
vs. ★ pattern across Blocks 0/5/7), the "over-teaching beyond the table"
packing-group finding, the wrong-function "Cadre CBTA" finding, or the four
SOURCE GAP findings in `docs/DGR_STAGE1_FUNCTION_7.5_DRAFT.md`.** Two
additions are recorded above: (1) Block 7's total absence of exam/practice
cross-references, a precision note reinforcing the already-confirmed lower
★ rating; (2) the lithium-battery video has now actually been watched and
confirmed not to contain wheelchair/PRM content, strengthening (not
changing) the wheelchair-scenario SOURCE GAP finding. Neither changes any
count, mapping, or conclusion. `docs/DGR_STAGE1_FUNCTION_7.5_DRAFT.md` may
now be treated as **cross-validated** (second pass complete) rather than
first-pass-only, and is the basis for the Stage 2A blueprint in
`docs/DGR_STAGE2A_FUNCTION_7.5_BLUEPRINT.md`. It remains **not** reviewed by
a qualified instructor, **not** accepted by ANAC, and **not** Tier
A–verified against the current 67th Edition/Addendum 1 text — those gates
are unaffected by this pass and remain open.
