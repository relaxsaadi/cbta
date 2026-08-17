---
name: caq-pain-point-builder
description: Mines real customer language (reviews, forums, support tickets, sales call notes, Reddit, G2, social media) to surface and rank the actual expensive, urgent problems the ICP experiences — then structures them by frequency, emotional intensity, and cost-of-inaction into a ranked PAIN-POINTS.md. Trigger on "what problems does our market have", "pain points", "what keeps our customers up at night", "why do people buy this", "what's the expensive problem we solve", "what are our customers frustrated by", or any request to understand customer frustrations before writing marketing/sales content. Use before caq-offer-positioning, caq-outreach-angles, or any copywriting/ad work that needs real pain language instead of guessed pain points.
---

ROLE: **Pain Point Intelligence Builder** — phase: POSITION (of TARGET → POSITION → REACH → ATTRACT → CONVERT).

This is skill #5 of 15 in the Complete Client Acquisition System (prefix `caq-`). It sits at the start of POSITION: TARGET produces the ICP (`caq-icp-architect`), this skill mines and ranks the pains that ICP actually feels, and the output feeds `caq-offer-positioning` — you cannot credibly position an offer against a pain you invented.

## Relationship to `customer-research`

This environment already has a `customer-research` skill. Do not duplicate it — reference it and differentiate:

- **`customer-research`** is broad: full voice-of-customer synthesis, persona building, JTBD framing, digital-watering-hole discovery. Use it when the user needs a durable understanding of *who* the customer is and *how* they think.
- **`caq-pain-point-builder` (this skill)** is narrow and fast: it assumes the ICP is already known (or roughly known) and exists purely to extract and **rank pain points for positioning decisions** — which problem to lead with in the offer, the ad, the landing page headline. It does not build personas.

**Hand off to `customer-research` instead of this skill when:**
- The user has no real customer data or online communities identified yet and needs full VOC discovery infrastructure built first.
- The ask is "build personas" or "who is our customer" rather than "what hurts them."
- The user wants ongoing, standing research infrastructure rather than a one-time ranked list.

**Use this skill when:** the user already has (or can point to) some pain language sources and wants a fast, ranked, evidence-backed list of the top problems to build messaging around.

---

## Phase 1: Mode Selection — Where To Mine Pain Language

Ask (or infer from what the user provides) which mode applies. Both can run together.

### Mode 1 — Existing Assets (fast, high-confidence)
Use when the business already has customer contact history. Mine:
- Sales call transcripts / call notes
- Support tickets and chat logs
- Onboarding call notes, churn/cancellation surveys
- Existing customer interview transcripts
- CRM free-text fields ("reason for interest", "objections")

This is the preferred mode whenever available — it is first-party, specific, and dated, so frequency and intensity scoring is trustworthy.

### Mode 2 — Online Communities (public mining)
Use when Mode 1 assets are thin, absent, or the user is entering a new market/ICP segment. Mine:
- G2 / Capterra / TrustRadius reviews (yours and competitors' — 1-3 star reviews are pain gold)
- Reddit threads and relevant subreddits (search `site:reddit.com [problem] [industry]`)
- Industry forums, Facebook/LinkedIn groups, Discord/Slack communities
- Q&A sites (Quora, Stack Exchange equivalents for the vertical)
- Twitter/X search for complaint language ("anyone else dealing with...")
- YouTube comments on competitor/industry explainer videos

For Mode 2, use `WebSearch` and `WebFetch`. Search patterns that surface pain fast:
- `"[industry/product] " "so frustrating"` / `"hate that"` / `"why is it so hard to"`
- `[competitor name] reviews site:g2.com` filtered mentally to 1-3 star
- `[ICP role] reddit "biggest problem"` or `"struggling with"`

Run both modes when time allows — Mode 1 confirms intensity and specificity, Mode 2 confirms the pain is market-wide and not one angry customer.

---

## Phase 2: Extraction Framework

For every distinct pain candidate found, extract these six fields. Do not skip straight to ranking — under-extracted pains produce made-up scores.

| Field | What to capture | Why it matters |
|---|---|---|
| **Pain description** | One-sentence neutral description of the problem | Keeps the pain distinct from the solution — don't write "needs our product," write the problem itself |
| **Exact customer quote** | Verbatim language, in quotes, with source | Verbatim language is copy gold — it becomes headlines and ad hooks later; paraphrase loses the emotional register |
| **Frequency** | Count of independent sources mentioning this pain | One person's gripe isn't a market pain; a pain seen across 5+ unconnected sources is |
| **Intensity** | Strength of emotional language used (see rubric below) | "Annoying" and "this is destroying my business" are not the same pain even if the topic is identical |
| **Cost of inaction** | Estimated money, time, or risk lost by NOT solving it | This is what makes a pain *sellable* — vague dissatisfaction doesn't justify a purchase, a quantifiable loss does |
| **Urgency** | How time-sensitive solving it is (constant drain vs. triggered by an event) | Determines whether the pain supports "buy now" messaging or only long-cycle nurture |

Log every pain candidate in a working table before scoring — this is the raw material Phase 3 turns into scores.

---

## Phase 3: Surface Complaints vs. Root Cause Pains (5-Whys Digging)

Most raw quotes are **surface complaints** — symptoms, not the expensive underlying problem. Positioning built on a surface complaint produces weak, forgettable messaging. Dig with the 5-whys pattern before scoring:

**Example dig:**
1. Complaint: "The onboarding process takes forever." (surface)
2. Why does that matter? → New hires can't bill clients until onboarded.
3. Why does that matter? → Delayed billing pushes revenue recognition into the next month.
4. Why does that matter? → Cash flow forecasting to investors becomes unreliable.
5. Root cause pain: **"Slow onboarding directly distorts our revenue forecasting and investor reporting."**

The root cause pain (step 5) is what should be scored and ranked — it carries the real cost-of-inaction and is what a decision-maker will actually pay to fix. The surface complaint (step 1) is still valuable as **verbatim language** for headlines, but the strategic pain is the root cause.

**Rule of thumb:** stop digging when the next "why" would require speculating about facts you don't have, or when you reach a business outcome (money, time, risk, reputation) rather than another process step. Aim for 3-5 whys; going further usually turns into fiction.

Tag each extracted pain candidate as **Surface** or **Root Cause** in your working notes. Only Root Cause pains go into the final ranked table as primary entries — Surface complaints get folded in underneath their root cause as supporting quotes.

---

## Phase 4: Ranking Formula — Pain Priority Score

```
Pain Priority Score = Frequency × Intensity × Cost-of-Inaction
```

Score each dimension 1-5, multiply for a score out of 125, then normalize to /100 by dividing by 1.25 for easy comparison across pains.

### Frequency rubric (1-5)

| Score | Definition |
|---|---|
| 5 | Mentioned independently across 8+ sources / consistently the #1 complaint |
| 4 | Mentioned across 5-7 independent sources |
| 3 | Mentioned across 3-4 independent sources |
| 2 | Mentioned in 2 independent sources |
| 1 | Mentioned once — anecdotal, needs more evidence before acting on it |

### Intensity rubric (1-5)

| Score | Definition | Language markers |
|---|---|---|
| 5 | Rage/despair register | "destroying," "nightmare," "I hate," profanity, all-caps, exclamation chains |
| 4 | Strong frustration | "so frustrating," "constantly," "every single time," "I'm at my limit" |
| 3 | Clear annoyance | "annoying," "frustrating," "wish it worked better" |
| 2 | Mild dissatisfaction | "a bit of a hassle," "not ideal," "could be better" |
| 1 | Neutral/factual mention | Stated as fact with no emotional charge |

### Cost-of-inaction rubric (1-5)

| Score | Definition |
|---|---|
| 5 | Quantifiable major loss: lost revenue, compliance/legal risk, safety risk, customer churn |
| 4 | Significant but less quantified loss: measurable time drain (hours/week), missed opportunities |
| 3 | Moderate cost: inefficiency that compounds over time but no hard number available |
| 2 | Minor cost: inconvenience with small time/money impact |
| 1 | Cosmetic/preference issue: no real cost, just friction |

**Confidence flag:** alongside the score, tag each pain High / Medium / Low confidence based on strength and independence of sources — a Pain Priority Score built on one Reddit post is not the same reliability as one built on 12 sales calls plus 20 reviews.

---

## Phase 5: Output Template — PAIN-POINTS.md

Write the full output to `PAIN-POINTS.md` in the current directory:

```markdown
# Pain Point Intelligence: [Company / ICP Segment]
**Date:** [current date]
**Sources analyzed:** [count] ([Mode 1 count] internal, [Mode 2 count] public)
**Confidence level (overall):** [High/Medium/Low]

---

## Ranked Pain Points

| Rank | Pain (root cause) | Frequency | Intensity | Cost-of-Inaction | Priority Score /100 | Confidence |
|------|-------------------|-----------|-----------|-------------------|---------------------|------------|
| 1 | [pain] | [1-5] | [1-5] | [1-5] | [score] | [H/M/L] |
| 2 | [pain] | [1-5] | [1-5] | [1-5] | [score] | [H/M/L] |
| 3 | [pain] | [1-5] | [1-5] | [1-5] | [score] | [H/M/L] |
[continue for all identified pains, typically 5-10]

---

## Pain Detail: #1 — [Pain Name]

**Root cause:** [full root-cause description from the 5-whys dig]
**Surface complaints feeding this root cause:**
- "[verbatim quote]" — [source, date if available]
- "[verbatim quote]" — [source, date if available]

**Frequency:** [X]/5 — seen in [N] independent sources: [list sources]
**Intensity:** [X]/5 — [characteristic language / examples]
**Cost of inaction:** [X]/5 — [estimated $ / time / risk impact, with reasoning]
**Urgency:** [Constant drain / Event-triggered / Seasonal] — [explain]
**Priority Score:** [X]/100
**Confidence:** [High/Medium/Low] — [why]

**Positioning angle:** [1-2 sentences on how this pain could anchor an offer or headline]

[Repeat this Pain Detail block for each of the top 3-5 ranked pains]

---

## Lower-Priority Pains (noted, not primary)

| Pain | Why lower priority |
|------|--------------------|
| [pain] | [low frequency / low cost / surface-only, no root cause confirmed] |

---

## Data Gaps & Confidence Notes

[Note any pains suspected but under-evidenced, sources that were inaccessible,
and where a discovery call or survey should confirm before committing spend
to messaging built on this pain.]

---

*Generated by Complete Client Acquisition System — `caq-pain-point-builder`*
```

---

## Phase 6: Terminal Summary

Display a condensed summary in the terminal after writing the file:

```
=== PAIN POINT INTELLIGENCE COMPLETE ===

Segment: [ICP / company]
Sources analyzed: [N] ([Mode 1] internal, [Mode 2] public)

Top Ranked Pains:
  1. [pain name]          Score: [XX]/100  (Freq [X] × Int [X] × Cost [X])  Confidence: [H/M/L]
  2. [pain name]          Score: [XX]/100  (Freq [X] × Int [X] × Cost [X])  Confidence: [H/M/L]
  3. [pain name]          Score: [XX]/100  (Freq [X] × Int [X] × Cost [X])  Confidence: [H/M/L]

Overall confidence: [High/Medium/Low]
Recommended lead pain for positioning: [#1 pain, one line why]

Full report saved to: PAIN-POINTS.md
```

---

## Error Handling

- **Limited public data available:** if Mode 2 sources are thin (few reviews, no active forums for the niche), fall back to industry analyst reports, trade publication surveys, and framed-as-industry-consensus pain points. Explicitly flag these entries as **Confidence: Low — industry inference, not direct customer language** rather than presenting them at the same confidence level as sourced quotes.
- **No internal data and no accessible public communities:** produce the report anyway using the best available secondary sources (industry reports, competitor marketing that reveals what pains competitors sell against), and state plainly in the Data Gaps section that primary research (customer interviews via `customer-research`) is needed before high-stakes messaging decisions are made on this data.
- **Conflicting pain signals** (some sources say X is the #1 pain, others say Y): report both, do not average them away — note the possible segment split (e.g. by company size, role, region) and flag for the user to decide if this indicates two ICP sub-segments.
- **All pains score similarly with no clear #1:** do not force a false #1. Report the top 3-4 as a cluster and recommend testing messaging against more than one in `caq-outreach-angles` rather than betting everything on a single unproven pain.
- Always produce a ranked list with whatever data exists — a low-confidence ranked list is more useful to the next skill in the pipeline than no list at all.

---

## Related Skills (Complete Client Acquisition System, 15 skills, prefix `caq-`)

This skill is #5, phase POSITION. Handoffs:

- **`caq-icp-architect`** (TARGET, upstream) — defines *who* the ICP is. Run before this skill if the ICP is not yet defined; this skill assumes a rough ICP exists and digs into what that ICP feels.
- **`caq-offer-positioning`** (POSITION, downstream — primary handoff) — takes the ranked pains from `PAIN-POINTS.md` and builds the value proposition, offer stack, and positioning statement around the #1-2 pains. Always hand off here next.
- **`caq-outreach-angles`** (REACH, downstream) — uses the verbatim quotes and root-cause pains to write cold email/DM opening lines and ad hooks that mirror the customer's own language rather than generic benefit statements.
- **`caq-authority-content`** (ATTRACT, downstream) — uses ranked pains as the topic map for content that establishes authority ("we understand your exact problem better than anyone").
- **`caq-lead-magnet-builder`** (ATTRACT, downstream) — builds a lead magnet that solves (or credibly promises to solve) the #1 or #2 ranked pain, since that is what will pull the highest-intent leads.
- **`customer-research`** (existing, not part of caq- suite) — hand off here instead of using this skill when the user needs full VOC synthesis, persona building, or JTBD work rather than a fast ranked pain list. Also hand off here when this skill's Data Gaps section reveals that primary research infrastructure needs to be built before messaging decisions can be trusted.

*Complete Client Acquisition System: TARGET → POSITION → REACH → ATTRACT → CONVERT — 15 skills, prefix `caq-`.*
