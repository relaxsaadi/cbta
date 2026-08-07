---
name: caq-lead-magnet-builder
description: Builds a complete conversion asset around a validated pain point — not just a lead magnet idea, but the magnet concept, landing page copy, opt-in form, delivery mechanism, and follow-up sequence that turns a downloader into a sales-ready lead. Trigger on "build a lead magnet", "free resource to capture emails", "checklist/template to give away", "gated content", "opt-in offer", "content upgrade", "something free to get people on our list", "lead gen freebie", "downloadable to capture leads", or any request to design a giveaway that should convert into pipeline, not just downloads.
---

ROLE: **Lead Magnet & Conversion Asset Builder** — phase: ATTRACT (of TARGET → POSITION → REACH → ATTRACT → CONVERT).

This is skill #12 of 15 in the Complete Client Acquisition System (prefix `caq-`). It sits in ATTRACT alongside `caq-authority-content` — content pulls people toward you, this skill converts that attention into a captured, qualified lead.

## Why This Skill Exists (and how it differs from `lead-magnets`)

This environment already has a generic `lead-magnets` skill. Do not duplicate it — reference it and differentiate clearly:

- **`lead-magnets`** answers "what should we give away?" — format selection, buyer-stage matching, general gating strategy, promotion channels. It is idea-and-strategy layer, applicable to any business, and does not require upstream pain data.
- **`caq-lead-magnet-builder` (this skill)** answers "build the whole asset, tied to a specific proven pain, with the funnel wired end to end." It requires (or fetches) `PAIN-POINTS.md` and `POSITION.md`/positioning artifacts as inputs, and it does not stop at the idea — it produces landing page copy, the exact form fields, the delivery email, and the 2-3 nurture emails that hand the lead to `caq-lead-scoring`. If the user only wants brainstormed magnet ideas with no pain data and no funnel, route to `lead-magnets` instead. If they want the full asset wired to real pain evidence, this skill is correct.

---

## Phase 1: Required Inputs

Before building anything, check the working directory for:

1. **`PAIN-POINTS.md`** (from `caq-pain-point-builder`) — the ranked pain list this magnet must anchor to. This is the primary input.
2. **`POSITIONING.md`** or equivalent (from `caq-offer-positioning`) — messaging pillars and proof points to reuse in landing page copy so the magnet's voice matches the rest of the funnel.
3. **`ICP.md`** (from `caq-icp-architect`) — who is landing on this page, so copy and field choices match their sophistication and buying stage.

**If `PAIN-POINTS.md` does not exist:** do not invent pain points and proceed anyway. Stop and recommend running `caq-pain-point-builder` first (see Error Handling). A lead magnet built on a guessed pain attracts the wrong downloaders and produces leads that fail qualification downstream — the entire point of this skill is that the magnet is evidence-anchored, not brainstormed.

**If `PAIN-POINTS.md` exists but `POSITIONING.md` does not:** proceed, but note in the output that landing page copy is built directly from the pain data without the benefit of an established positioning frame, and flag that running `caq-offer-positioning` afterward may sharpen the copy.

---

## Phase 2: Magnet-Idea Framework (Tied to Ranked Pains)

Take the top 2-3 pains from `PAIN-POINTS.md` (by Priority Score). For each, generate 2-3 candidate magnet formats using the pain's own shape — a magnet must formally mirror the kind of pain it solves, or it will feel disconnected on the landing page.

### Matching pain type to format

| Pain shape | Signal in PAIN-POINTS.md | Best-fit formats | Why this format fits |
|---|---|---|---|
| **Quick-fix / checklist-shaped pain** | Pain is "I keep forgetting/missing steps," process has a known correct sequence, cost-of-inaction is small repeated friction | Checklist, cheat sheet | The pain is "I need the list in front of me" — a checklist delivers the exact win the pain describes, nothing more is needed |
| **Repeatable-task pain** | Pain is "I redo this from scratch every time," a document/process is recreated per customer or per deal | Template, swipe file | The pain is "give me the reusable artifact" — a template removes the recreation cost directly |
| **Comparison / decision pain** | Pain is "I don't know which option/vendor/approach is right for us," high stakes, one-time decision | Benchmark report, comparison framework, scorecard | The pain needs external data or a framework to reduce decision risk, not a to-do list |
| **Diagnostic / self-awareness pain** | Pain is "I don't know if we're doing this right / where we stand," root cause involves not knowing their own state | Assessment / quiz / scorecard with personalized result | The pain is lack of visibility into their own situation — only a diagnostic instrument resolves it, a checklist can't |
| **Complex / multi-step pain** | Pain is high cost-of-inaction (4-5/5), root cause spans multiple interlocking steps, "we don't even know where to start" | Mini-course (email or short video series), calculator/tool | The pain is too large for a single document — it needs sequenced teaching or a working tool, but must still obey the 5-minute-value test per module (see Phase 3) |
| **Effort-estimation / ROI pain** | Pain involves an unknown number (cost, time, risk exposure) they need quantified before acting | Calculator / ROI tool | The pain is "I don't know if this is worth it" — only a calculator gives them their own number |

For each candidate, write one line: *format → which ranked pain it anchors to → the specific promise*. Example: "Checklist → Pain #1 (missed DGR documentation steps costing shipment delays) → '12-Point Pre-Shipment DGR Compliance Checklist — catch the paperwork gap before customs does.'"

Present 2-3 candidates per top pain (not one for every pain in the list — depth on the top 2-3 beats shallow coverage of all of them), then recommend one as primary based on the 5-minute-value test below.

---

## Phase 3: The 5-Minute Value Test

**Rule:** the magnet must deliver one complete, usable win in under 5 minutes of consumption — not "5 minutes to skim," 5 minutes to walk away with something they can act on immediately, even if they never open another page of it.

### Disqualification checklist — reject or redesign the magnet idea if any apply:

| Red flag | Why it kills conversion/trust | Fix |
|---|---|---|
| **Too big** — "ultimate guide," 40+ pages, multi-hour course with no early payoff | Downloaders bounce off scope before extracting value; the promise-to-effort ratio breaks trust in the brand for the sales conversation that follows | Cut to the single highest-leverage slice; ship the rest as a nurture-email teaser for later, not the magnet itself |
| **Too vague** — "Marketing Tips for Success," no named pain in the title | Nothing to test against the 5-minute rule because there's no single win defined; also fails to filter for the right ICP | Rename around the exact root-cause pain from `PAIN-POINTS.md`, using the pain's own language/quote where possible |
| **Not immediately actionable** — theory, framework, or "food for thought" with no checklist/template/number to walk away with | A 5-minute read that ends in "now go think about this" doesn't feel like a completed win | Force it into a concrete artifact: numbered list, fill-in template, calculated output, yes/no diagnostic result |
| **Requires setup/software/account creation before value appears** | Adds friction between opt-in and the promised win, which is where trust either forms or breaks | If a tool is genuinely the right format (calculator, assessment), the first interaction must produce a result with zero account creation |
| **Solves a pain not in the top-ranked list** | Attracts downloaders whose problem doesn't match what the business actually sells against, producing low-quality leads that fail scoring downstream | Re-anchor to a pain from Phase 1's ranked list, or flag to the user that `PAIN-POINTS.md` needs a new pain added first |
| **Mixed format** (ebook + spreadsheet + video bundled together) | Consumption friction — recipient doesn't know where the 5-minute win lives, delivery gets more complex for no added trust | Pick one format only; if multiple pains deserve magnets, build separate assets, not one bundle |

If the candidate survives all six checks, proceed to Phase 4. If not, redesign or pick a different candidate from Phase 2 before continuing — do not build the funnel around a disqualified idea.

---

## Phase 4: Landing Page Structure (Wireframe-in-Words)

This is a lightweight structural + copy template, not full HTML. Populate every bracket with content specific to the chosen magnet and pain.

### Headline formula
```
[Specific outcome] without [the thing that currently makes it hard]
```
or
```
The [magnet type] for [ICP role/segment] who [are experiencing the exact pain, in their language]
```
Pull the "in their language" portion directly from the verbatim quote in `PAIN-POINTS.md` — headlines built on the customer's own words consistently outperform paraphrased benefit statements.

### Subhead
One sentence: names the format, states the time investment, and reinforces the 5-minute-value promise. Example: *"A 12-point checklist you can run through in under 5 minutes — before your next shipment leaves the warehouse."*

### 3-bullet value prop
Each bullet maps to one concrete thing they'll walk away with — not abstract benefits.
- Bullet 1: the single biggest win (usually the #1 root-cause pain resolved)
- Bullet 2: a secondary concrete inclusion (a template field, a worked example, a common mistake named)
- Bullet 3: what makes it credible/specific to their situation (their industry, their regulatory context, their company size — whatever narrows it from generic)

### Trust signals
Choose 2-3 that are true and available — do not fabricate:
- Download/user count ("Used by 400+ [ICP role]")
- Author/company credibility line (certification, years in the space, relevant authority marker)
- A single specific proof point pulled from `POSITIONING.md` if it exists
- "No spam, unsubscribe anytime" micro-copy near the form to reduce perceived risk

### Form
Minimum viable fields per Phase 5. Button copy states the outcome, not the mechanic: "Send Me the Checklist" beats "Submit."

### Optional preview element
A screenshot, table-of-contents snippet, or one sample row/question from the asset — reduces "what am I actually getting" uncertainty without giving away the full value.

---

## Phase 5: Form-Field Minimalism

**Core rule: every additional field is a conversion tax. Justify each one by what it unlocks downstream, or drop it.**

| Field | Justify by | Typical conversion cost of adding |
|---|---|---|
| Email only | Baseline — required to deliver anything | — |
| + First name | Personalizes delivery email and nurture sequence subject lines | Minimal (~1-3%) — usually worth it |
| + Company name | Enables account-based routing and lets `caq-lead-scoring` weight by firmographic fit | Moderate (~5-10%) — justify only if B2B and sales follow-up is planned |
| + Role/title | Lets follow-up messaging speak to their specific stake in the pain, and feeds Authority (buying-power) signal to `caq-lead-scoring` | Moderate (~5-10%) — justify only if the ICP spans multiple roles with different pains |
| + Phone number | Enables faster sales follow-up for high-intent/high-ticket offers | High (~15-25%) — only justify for bottom-funnel magnets (ROI calculators, benchmark reports) aimed at decision-stage buyers, never for top-funnel checklists |
| + Company size / budget / timeline | Pre-qualifies before a human touches the lead | Highest — reserve for gated content aimed explicitly at sales-qualified prospects, not general list growth |

**Decision rule:** if the magnet sits at the top of the funnel (checklist, cheat sheet — awareness stage per the pain's urgency/frequency profile), ask for email + first name only. If the magnet is bottom-funnel (calculator, benchmark report tied to a high cost-of-inaction pain), the extra friction of company + role is justified because the resulting leads are higher-intent and worth the drop in raw volume. Always state which case applies and why in the output.

---

## Phase 6: Post-Opt-In Follow-Up Sequence

The magnet is not the finish line — it's the first touch in a sequence that moves the downloader toward a sales conversation. Structure:

1. **Delivery email (immediate, automated)** — delivers the asset, restates the win in one line, sets expectation for what comes next ("Over the next few days I'll send you [related resource/insight]"). No pitch.
2. **Nurture email 1 (Day 2-3)** — expands on the #2 ranked pain (the one the magnet didn't fully cover) with a short insight or a related quick win. Soft CTA (reply, read more) — not a sales ask yet.
3. **Nurture email 2 (Day 5-7)** — social proof or case-study angle: how a similar company solved the deeper problem the magnet only touched the surface of. Introduces the idea that a full solution exists.
4. **Nurture email 3 / conversion ask (Day 9-12)** — direct but low-friction CTA: book a call, reply with their situation, or claim a related offer. This is the handoff point.

**Handoff to `caq-cold-email-builder`:** the nurture emails in this sequence follow the same subject-line and body patterns `caq-cold-email-builder` uses for multi-touch outbound sequences — reuse its angle-strength ranking and follow-up cadence logic rather than reinventing tone here. If the user wants the nurture emails expanded into a longer, more elaborate sequence (5-6+ touches), hand off to `caq-cold-email-builder` directly with the magnet's pain anchor as the seed angle.

**Handoff to `caq-lead-scoring`:** every downloader produced by this funnel should be scored, not treated as automatically sales-ready. Pass the captured fields (email, name, company/role if collected) plus which magnet/pain they converted on — the specific pain a lead self-selected into is itself a scoring signal (it indicates which problem is live for them right now).

---

## Output Template: LEAD-MAGNET-PLAN.md

Write the full output to `LEAD-MAGNET-PLAN.md` in the current directory:

```markdown
# Lead Magnet Plan: [Company / Offer]
**Date:** [current date]
**Anchor pain (from PAIN-POINTS.md):** [pain name, rank, priority score]
**Positioning source:** [POSITIONING.md referenced / not available — built from pain data directly]

---

## Magnet Concept

**Format:** [checklist / template / calculator / assessment / mini-course / swipe file / benchmark report]
**Working title:** [title, ideally using the pain's verbatim language]
**Promise (one sentence):** [the specific win delivered in under 5 minutes]

**Why this format fits this pain:** [1-2 sentences referencing the pain-shape-to-format table]

**5-Minute Value Test:** PASS / FAIL for each check
| Check | Result | Note |
|---|---|---|
| Not too big | [Pass/Fail] | |
| Not too vague | [Pass/Fail] | |
| Immediately actionable | [Pass/Fail] | |
| No setup friction | [Pass/Fail] | |
| Anchored to ranked pain | [Pass/Fail] | |
| Single format only | [Pass/Fail] | |

**Content outline:** [numbered list of what's actually inside the asset — the sections/items/questions]

---

## Landing Page Copy

**Headline:** [exact headline copy]
**Subhead:** [exact subhead copy]

**3-Bullet Value Prop:**
1. [bullet]
2. [bullet]
3. [bullet]

**Trust signals used:** [list the 2-3 chosen, with source/justification]

**CTA button copy:** [exact button text]

**Preview element:** [what's shown — screenshot description, sample row, TOC snippet]

---

## Form Fields

| Field | Included? | Justification |
|---|---|---|
| Email | Yes | Baseline |
| First name | [Yes/No] | [reason] |
| Company | [Yes/No] | [reason] |
| Role/title | [Yes/No] | [reason] |
| Phone | [Yes/No] | [reason] |

**Funnel stage classification:** [Top-funnel / Bottom-funnel] — [why, and how that drove the field decisions above]

---

## Delivery Mechanism

**Method:** [instant download / email delivery / thank-you page + email]
**Delivery email subject line:** [subject]
**Delivery email body (short):** [2-4 sentences — delivers asset, restates win, sets next-touch expectation]

---

## Follow-Up Sequence

| # | Timing | Purpose | Subject line | One-line content summary |
|---|--------|---------|---------------|---------------------------|
| 1 | Immediate | Delivery | [subject] | [summary] |
| 2 | Day 2-3 | Nurture — pain #2 insight | [subject] | [summary] |
| 3 | Day 5-7 | Nurture — proof/case study | [subject] | [summary] |
| 4 | Day 9-12 | Conversion ask | [subject] | [summary] |

**Handoff note:** [state whether this sequence should be expanded via `caq-cold-email-builder`, and what gets passed to `caq-lead-scoring`]

---

## Data Gaps & Assumptions

[Note anything assumed due to missing PAIN-POINTS.md/POSITIONING.md detail, and what should be validated before shipping]

---

*Generated by Complete Client Acquisition System — `caq-lead-magnet-builder`*
```

---

## Terminal Summary

Display a condensed summary in the terminal after writing the file:

```
=== LEAD MAGNET PLAN COMPLETE ===

Anchor pain: [pain name] (Rank #[N], Score [XX]/100)
Magnet: [format] — "[working title]"

5-Minute Value Test: [PASS / FAIL — X/6 checks passed]

Landing Page:
  Headline: [headline]
  Form fields: [list] ([Top-funnel/Bottom-funnel] — [N] fields)

Follow-Up Sequence: [N] emails over [X] days
  1. Delivery       — [subject]
  2. Nurture pain #2 — [subject]
  3. Proof/case study — [subject]
  4. Conversion ask  — [subject]

Next: hand qualified downloads to caq-lead-scoring; expand sequence via caq-cold-email-builder if needed.

Full plan saved to: LEAD-MAGNET-PLAN.md
```

---

## Error Handling

- **No `PAIN-POINTS.md` found and no pain data provided in the conversation:** do not guess at a pain to anchor the magnet to. Tell the user plainly: *"I don't have validated pain data to anchor this magnet to — running `caq-pain-point-builder` first will produce a ranked, evidence-backed pain list this skill needs as input. I can proceed with a magnet built on an assumed pain, but flag it as unvalidated in the output — which do you prefer?"* If the user says proceed anyway, mark the entire plan's anchor pain as **Confidence: Low — assumed, not evidence-backed** in the output.
- **Pain data exists but is thin/low-confidence** (per `PAIN-POINTS.md`'s own confidence flags): proceed, but carry that confidence flag into this plan's Data Gaps section rather than presenting the magnet as fully validated.
- **User wants a magnet idea only, no funnel** (landing page, form, sequence): that is the `lead-magnets` skill's scope, not this one — recommend it, or confirm the user actually wants the full asset before doing all six phases.
- **No clear ICP/positioning context available:** proceed using pain data alone; note in Data Gaps that copy tone/sophistication level is inferred rather than confirmed against `ICP.md`.
- **Multiple pains tie for #1 with no clear winner:** build the primary plan around the single most quick-fix-shaped pain of the tied set (fastest to prove the 5-minute value test), and note the runner-up as a candidate for a second, separate magnet later — never bundle two pains into one asset.

---

## Related Skills (Complete Client Acquisition System, 15 skills, prefix `caq-`)

This skill is #12, phase ATTRACT. Handoffs:

- **`caq-pain-point-builder`** (POSITION, upstream — required input) — produces the ranked `PAIN-POINTS.md` this skill anchors the magnet to. Run first if it doesn't exist; never guess pain data.
- **`caq-offer-positioning`** (POSITION, upstream — recommended input) — produces `POSITIONING.md`, the messaging pillars this skill's landing page copy should echo so the funnel feels like one voice.
- **`caq-authority-content`** (ATTRACT, sibling) — builds the content that drives traffic toward this magnet's landing page; the magnet is often the CTA embedded inside authority content.
- **`caq-cold-email-builder`** (REACH, downstream/reused patterns) — this skill's Phase 6 follow-up sequence borrows its multi-touch cadence logic; hand off here to extend the nurture sequence into a longer campaign.
- **`caq-inbound-handler`** (CONVERT, downstream) — handles the reply the moment a nurtured lead responds to the conversion-ask email or replies mid-sequence; use its warmth classification for that first response.
- **`caq-lead-scoring`** (CONVERT, downstream — primary handoff) — every lead captured through this funnel should be scored here before being treated as sales-ready; pass along which pain/magnet they converted on as a scoring signal.
- **`lead-magnets`** (existing generic skill, not part of the `caq-` suite) — use instead of this skill when the user wants magnet *ideas* only, with no pain-data anchor and no funnel build-out. Use this skill instead when the user wants the complete asset — concept, landing page, form, delivery, and follow-up — wired to validated pain evidence.

*Complete Client Acquisition System: TARGET → POSITION → REACH → ATTRACT → CONVERT — 15 skills, prefix `caq-`.*
