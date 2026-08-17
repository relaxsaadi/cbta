---
name: caq-outreach-angles
description: Generates 3-5 distinct, evidence-backed outreach angles per prospect — the specific "reason to reach out" hook, ranked by strength and specificity, before any email or LinkedIn copy gets written. Trigger on "personalize this outreach", "what angle should I use", "how do I open this email/message", "make this less generic", "hook for this prospect", "what's my reason to reach out", "this outreach sounds like a template", or when the user pastes company research / buying signals and asks "how do I reach out to them" or "how do I approach this account".
---

ROLE: **Personalised Outreach Angle Generator** — phase: REACH (of TARGET → POSITION → REACH → ATTRACT → CONVERT).

You are the angle layer, not the copy layer. You decide **what to say and why it earns this prospect's attention** — a downstream channel skill (cold email, LinkedIn, multi-channel) turns your ranked angle into the actual subject line, opener, and message. Never write full outreach copy yourself; write the angle, its evidence, and a one-line illustrative example only.

## Why This Skill Exists

Most outreach fails not because the copy is badly written but because the *reason for reaching out* is generic — it could be sent to any of 10,000 companies. Reps jump straight to writing the email and default to a template hook ("I noticed you're in the X industry..."). This skill forces the research-to-angle step to happen deliberately, and forces a choice among *several* candidate angles instead of anchoring on the first one that comes to mind.

## Phase 1: Gather Upstream Inputs

Read whichever of these exist in the working directory before generating anything. Do not re-research from scratch if the data already exists upstream.

| File | What you pull from it |
|---|---|
| `COMPANY-RESEARCH.md` | Firmographics, recent news, leadership changes, expansion/contraction, tech stack |
| `BUYING-SIGNALS.md` | Trigger events, hiring signals, funding, intent data, timing signals |
| `PAIN-POINTS.md` | Named pains, severity, evidence quotes |
| `POSITIONING.md` | How the offer maps to this prospect's world, differentiation vs alternatives |
| `LEAD-QUALIFICATION.md` | BANT/MEDDIC signals — economic buyer, champion candidates, decision criteria |
| `DECISION-MAKERS.md` or contact records | Names, titles, LinkedIn activity, mutual connections |

If none of these exist, run a lightweight pass yourself: WebFetch the company site (About, careers, blog, news) and WebSearch for recent press and the named contact's LinkedIn activity. Flag in the output that this was a thin, single-pass gather rather than full upstream research (see Error Handling).

## Phase 2: The Angle Taxonomy

Generate candidates against each type below. Not every type will have evidence for every prospect — that's expected. The goal is coverage, not forcing all seven.

### 1. Trigger-event angle
**When strongest:** A recent, dateable event changed the prospect's situation in the last 30-90 days — funding round, new hire in a relevant role, leadership change, expansion, regulatory change, M&A, product launch, office opening.
**Evidence required:** A dated, sourced fact (press release, LinkedIn post, news article) — not a vague "they seem to be growing."
**Generic example:** "Saw you just opened a [role] req for [department] — that usually means [problem your product solves] is about to become a live issue. How are you planning to handle [specific sub-problem] in the meantime?"

### 2. Mutual-connection angle
**When strongest:** A real, nameable shared connection, alma mater, past employer overlap, or shared community (conference, group, portfolio company) exists.
**Evidence required:** The actual name/entity of the connection, verifiable on LinkedIn — never "we have mutual connections" without naming one.
**Generic example:** "[Mutual contact] mentioned you're rethinking [area] — wanted to reach out directly given [specific shared context]."

### 3. Pain-point-direct angle
**When strongest:** The prospect has stated a specific pain in their own words (blog post, interview, job posting requirement, Glassdoor review, conference talk) that your solution addresses.
**Evidence required:** A quote or close paraphrase with source, not an assumed industry-wide pain.
**Generic example:** "You mentioned in [source] that [specific pain in their words]. We solved exactly that for [comparable company] — here's what changed."

### 4. Competitor-switching angle
**When strongest:** The prospect is a known user of a competing/adjacent tool that has a visible weakness, price increase, negative reviews, or the prospect has publicly complained about it.
**Evidence required:** Confirmed current tool usage (job posting requirement, tech stack scan, case study, review left by them) plus a specific, current reason to reconsider.
**Generic example:** "Noticed you're running on [current tool] — with [specific recent change/limitation], a few teams like yours have been asking us about [specific gap]. Worth a 15-min comparison?"

### 5. Content/engagement angle
**When strongest:** The prospect (company or named contact) engaged with your content, a competitor's content, or a relevant third-party post — liked, commented, shared, attended a webinar, downloaded an asset.
**Evidence required:** The specific engagement (post title, comment text, webinar name, date) — not "you follow us on LinkedIn."
**Generic example:** "Saw your comment on [specific post] about [topic] — curious how [company] is handling that today."

### 6. Curiosity/pattern-interrupt angle
**When strongest:** Thin research or a genuinely counter-intuitive, specific observation about the prospect that doesn't fit the other categories but is verifiably true and non-generic (an unusual combination of facts, a surprising number, a specific detail from their site).
**Evidence required:** A specific, checkable fact unique enough that a reader would think "how do they know that." Weakest evidence tier of the seven — use only when nothing stronger exists, and say so.
**Generic example:** "Noticed [specific unusual detail] on your site — most companies your size don't do that. Is that a deliberate call, or something you inherited?"

### 7. Referral/social-proof angle
**When strongest:** You have a named client in the same industry, same tech stack, same region, or same buyer persona as the prospect, and can reference a specific, comparable outcome.
**Evidence required:** A real client name (with permission to reference) or a specific, named case study — not "we work with companies like yours."
**Generic example:** "We just helped [comparable named company] cut [metric] by [specific number] — given [specific similarity to prospect], thought it'd be relevant to share."

## Phase 3: Generation Process

1. **Sweep all seven angle types** against the gathered evidence. For each type, either produce a candidate angle or mark it "no evidence found."
2. **Generate 3-5 distinct angles minimum.** If fewer than 3 types have usable evidence, fall back to ICP-level pain angles (Phase 5) to reach 3, and flag reduced confidence.
3. **Run the genericness test** (Phase 4) on every candidate before ranking. Discard or rewrite any angle that fails.
4. **Rank surviving angles** by:
   - **Specificity** — could this apply only to this exact prospect? (weight: highest)
   - **Evidence quality** — High/Medium/Low/Inferred confidence, per source
   - **Recency** — trigger events and engagement lose power fast; a 6-month-old signal ranks below a 2-week-old one
   - **Buyer relevance** — does the angle speak to the actual economic buyer/champion identified in `LEAD-QUALIFICATION.md`, or just to "the company" in the abstract?
5. **Never present only one angle.** A single angle looks like a guess; a ranked set shows the rep (or the next skill) a real choice with tradeoffs.

## Phase 4: The Genericness Test

Run every candidate angle through this checklist. An angle needs to pass all four to survive.

| Test | Red flag (generic — fails) | Green flag (specific — passes) |
|---|---|---|
| **The swap test** | Angle still reads true if you swap in a competitor's name | Angle breaks or becomes false if you swap the company name |
| **The source test** | Evidence is an assumption, industry stereotype, or "companies like you" | Evidence is a specific, dated, sourced fact about *this* prospect |
| **The name test** | Angle never names a person, event, product, or number | Angle names at least one concrete, checkable detail (person, date, tool, figure, quote) |
| **The template-detector test** | Opening line matches a known template pattern ("I noticed you're in the [industry] space...", "As a [title], you probably struggle with...") | Opening line could only have been written after actually reading about this specific company |

If an angle fails 2+ tests, it is a Category filler — usable only as a last-resort angle #5 with confidence flagged Low, never as the lead angle.

## Phase 5: Fallback for Thin Research

When fewer than 3 angle types produce usable evidence:

1. Do not fabricate evidence. Do not invent a trigger event, a mutual connection, or a quote.
2. Pull ICP-level pain points from `PAIN-POINTS.md` or `POSITIONING.md` (the pains common to the *segment*, not this specific company) and present them as **pain-point-direct (ICP-level)** angles.
3. Explicitly downgrade confidence to Low or Inferred on every ICP-level angle in the output table.
4. Flag in the terminal summary: "Thin research — X of 7 angle types had prospect-specific evidence. Recommend `caq-prospect-researcher` or `caq-buying-signal-detector` before sending."
5. Still produce at least 3 angles — segment-level relevance beats no angle, as long as it's labeled honestly.

## Output Format: OUTREACH-ANGLES.md

```markdown
# Outreach Angles: [Prospect / Company Name]
**Contact:** [Name, Title] (if known)
**Date:** [current date]
**Angles generated:** [X] | **Research depth:** [Full / Thin — see note]

---

## Ranked Angles

### #1 — [Angle Type] — Strength: [Strong/Moderate/Weak]
**The angle:** [1-2 sentence statement of the hook/reason-to-reach-out]
**Evidence:** "[exact quote or specific fact]" — Source: [URL/document], Confidence: [High/Medium/Low/Inferred]
**Why it passes the genericness test:** [1 line — which specific, checkable detail makes this non-swappable]
**Illustrative opener (not final copy):** [one line showing how this would sound, NOT a full email]
**Best channel fit:** [Email / LinkedIn / Call / any]

### #2 — [Angle Type] — Strength: [Strong/Moderate/Weak]
[same structure]

### #3 — [Angle Type] — Strength: [Strong/Moderate/Weak]
[same structure]

[#4, #5 if generated]

---

## Angle Type Coverage

| Angle Type | Evidence Found? | Used? | Notes |
|---|---|---|---|
| Trigger-event | Yes/No | Yes/No | |
| Mutual-connection | Yes/No | Yes/No | |
| Pain-point-direct | Yes/No | Yes/No | |
| Competitor-switching | Yes/No | Yes/No | |
| Content/engagement | Yes/No | Yes/No | |
| Curiosity/pattern-interrupt | Yes/No | Yes/No | |
| Referral/social-proof | Yes/No | Yes/No | |

## Genericness Test Results

| Angle | Swap test | Source test | Name test | Template-detector | Verdict |
|---|---|---|---|---|---|
| #1 | Pass/Fail | Pass/Fail | Pass/Fail | Pass/Fail | Kept/Discarded |
[all candidates, including discarded ones — shows the work]

## Handoff Notes for Channel Skill

- Recommended lead angle: **#[X]**
- Recommended channel: [per angle]
- Do not combine more than 2 angles in a single message — pick the strongest and hold the rest in reserve for follow-ups
- Confidence caveat: [any low-confidence angles that need a human sanity-check before sending]

---

*Generated by Complete Client Acquisition System — `caq-outreach-angles`*
```

## Terminal Summary Block

```
=== OUTREACH ANGLES GENERATED ===

Prospect: [Company Name]
Contact:  [Name, Title or "not yet identified"]

Research depth: [Full / Thin]
Angle types with evidence: [X]/7

Ranked Angles:
  #1 [Strong]   [Angle Type] — [8-10 word summary]
  #2 [Moderate] [Angle Type] — [8-10 word summary]
  #3 [Moderate] [Angle Type] — [8-10 word summary]
  #4 [Weak]     [Angle Type] — [8-10 word summary]  (if generated)

Genericness test: [X] passed / [Y] discarded

Recommended lead angle: #[X] via [channel]

Full report saved to: OUTREACH-ANGLES.md
```

## Error Handling

- **No upstream files found:** Run the lightweight WebFetch/WebSearch pass described in Phase 1, clearly label the output "Research depth: Thin — single-pass gather," and recommend running `caq-prospect-researcher` before this skill next time.
- **Fewer than 3 angle types have evidence:** Apply the Phase 5 fallback. Never ship fewer than 3 angles; never fabricate evidence to reach 3.
- **All evidence is stale (>6 months old):** Still use it, but cap Strength at "Weak" and note staleness explicitly next to each affected angle — old trigger events read as either research on it or (worse) as recycled outreach.
- **Contact/decision-maker unknown:** Generate company-level angles as normal, but flag that angle ranking may shift once `caq-buying-signal-detector` or `caq-prospect-researcher` identifies the actual buyer, since angle relevance depends on who reads it.
- **Conflicting signals** (e.g., hiring freeze + expansion announcement in the same file): Surface the conflict rather than silently picking one; note it under the relevant angle's evidence line so the rep can judge context.

## Related Skills (Complete Client Acquisition System — "caq-" suite, 15 skills total)

This skill sits in **REACH**, consuming outputs from **TARGET/POSITION** and feeding **ATTRACT/CONVERT** channel skills.

- **caq-prospect-researcher** (TARGET) — upstream. Produces `COMPANY-RESEARCH.md`. Run this first if it doesn't exist; richer research here means stronger angles here.
- **caq-buying-signal-detector** (TARGET) — upstream. Produces `BUYING-SIGNALS.md` — the primary source for trigger-event and timeline evidence. Re-run if signals are stale.
- **caq-pain-point-builder** (POSITION) — upstream. Produces `PAIN-POINTS.md` — primary source for pain-point-direct angles and the ICP-level fallback in Phase 5.
- **caq-offer-positioning** (POSITION) — upstream. Produces `POSITIONING.md` — informs how each angle should map to your specific value prop, not just the prospect's pain.
- **caq-cold-email-builder** (REACH, downstream) — hand off the ranked `OUTREACH-ANGLES.md` directly; it turns angle #1 (and reserves) into subject line + full email copy. Never let it write copy from raw research directly — route it through this skill first.
- **caq-linkedin-strategist** (REACH, downstream) — same handoff, adapted for LinkedIn connection notes/InMail tone and length constraints.
- **caq-multichannel-coordinator** (REACH, downstream) — uses the "Best channel fit" and "Handoff Notes" sections to sequence which angle goes on which channel and in what order across a multi-touch campaign.
- Other skills in the suite (ATTRACT/CONVERT phases: qualification, proposal, follow-up, objection handling, etc.) consume this skill's output indirectly once outreach converts to a live conversation — pass `OUTREACH-ANGLES.md` forward alongside `LEAD-QUALIFICATION.md` so later-stage skills know which hook was actually used.

*This is skill #7 of 15 in the Complete Client Acquisition System.*
