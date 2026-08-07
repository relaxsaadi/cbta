---
name: caq-lead-scoring
description: Fast, weighted-criteria lead scoring engine for BATCHES of leads (10-500 rows) from a CSV, CRM export, or scraped list — assigns Fit + Engagement + Urgency scores, a Total 0-100, and an A/B/C/D grade with next action per lead, then ranks the whole list. Trigger phrases include "score these leads", "rank this list", "which leads should I prioritize", "grade my lead list", "sort by lead quality", "who should I call first", "score this CSV of companies", "triage this lead list", "rank my prospects by quality" — including when the user just pastes or attaches a list of companies/contacts and wants to know who to work first. NOT for deep single-account research — for one company's full BANT/MEDDIC diligence, use sales-qualify instead.
---

# CAQ Lead Scoring — Fast Batch Lead Grading Engine

ROLE: **Lead Qualification & Scoring Expert** — phase: **TARGET** (of TARGET → POSITION → REACH → ATTRACT → CONVERT) in the Complete Client Acquisition System. Skill #4 of 15 (prefix `caq-`).

## Purpose and Positioning

This skill scores a **list** of leads quickly using a lightweight weighted-criteria model. It trades depth for speed and coverage: instead of researching one company exhaustively, it processes 10-500 leads in one pass so the user knows who to call first, today.

**This is NOT `sales-qualify`.** Read `/Users/mac/.claude/skills/sales-qualify/SKILL.md` if you have not already — it is the adjacent, deeper skill. Key difference:

| | `caq-lead-scoring` (this skill) | `sales-qualify` |
|---|---|---|
| Input | A LIST of leads (CSV, CRM export, scraped table, pasted rows) | ONE company URL |
| Depth | Shallow-fast: a handful of signals per lead | Deep: BANT (4 dims x 25pts) + MEDDIC (6 elements) with sourced evidence per dimension |
| Speed | Seconds to minutes for hundreds of rows | Minutes per single account (multi-source web research) |
| Output | Ranked table, one row per lead, grade + next action | Full narrative report per company with citations |
| When to use | Triage a fresh list, decide call order, batch CRM cleanup | Deep-dive a shortlisted account before a big proposal or exec outreach |

**Rule of thumb:** use `caq-lead-scoring` FIRST to triage a list down to the A/B leads, then hand the top few to `sales-qualify` for deep BANT/MEDDIC research before a high-stakes pitch. Never run `sales-qualify` on 100 leads — it will not finish in reasonable time and isn't built for batch throughput. Never run `caq-lead-scoring` as your only diligence before a six-figure proposal — it isn't deep enough.

## When to Invoke

Trigger on any of: "score these leads", "rank this list", "which leads should I prioritize", "grade my lead list", "sort by lead quality", "who should I call first", "triage this CSV", "rank my prospects", or the user simply pasting/attaching a list of companies or contacts and asking who to work.

Do NOT trigger for a single company deep-dive request ("qualify this prospect", "is Acme Corp a good fit") — hand that to `sales-qualify`.

---

## Step 1 — Gather Fit Criteria and Weights

Before scoring, determine what "fit" means for this business. In priority order:

1. **Check for an existing ICP artifact** in the working directory or repo: `ICP-PROFILE.md`, `IDEAL-CUSTOMER-PROFILE.md`, `product-marketing.md`, or similar. If found, extract the firmographic/behavioral fit criteria (industry, size, geography, budget signal, tech stack, role titles) and their implied importance. This repo has `/Users/mac/Documents/kost-funnel/IDEAL-CUSTOMER-PROFILE.md` — check it first for KOST-specific scoring.
2. **If none exists, ask the user** (briefly, one message, not a long form): "What matters most in a good lead here — industry/sector, company size, geography, budget signal, urgency/trigger event? Any criteria I should weight higher or exclude?" Accept a quick free-text answer; don't block on a full ICP interview — that belongs to `caq-icp-architect`.
3. **If the user has no time to answer**, proceed with the default model below and clearly flag in the output that default weights were used, inviting correction later.

Keep this step fast — under one exchange. This skill exists precisely so a full ICP interview isn't required to get moving.

---

## Step 2 — Default Weighted Scoring Model

Score every lead on three axes, each 0-100, then combine into a Total.

### Fit Score (0-100) — default weight 50%
How well the lead matches the ICP: industry/vertical match, company size band, geography, decision-maker title present, budget-plausibility (funding, pricing tier, visible spend).

| Signal present | Points |
|---|---|
| Exact industry/vertical match | 25 |
| Adjacent/related industry | 12 |
| Company size within target band | 20 |
| Geography within target market | 15 |
| Decision-maker contact identified (title, name) | 20 |
| Budget/spend plausibility signal (funding, tier, visible tech spend) | 20 |
| **Cap at 100** | |

### Engagement / Intent Score (0-100) — default weight 30%
Behavioral signals showing the lead is actively interested or reachable — website visits, email opens/clicks, form fills, content downloads, event attendance, LinkedIn engagement, inbound inquiry.

| Signal present | Points |
|---|---|
| Inbound inquiry / form submission / demo request | 35 |
| Email opened or clicked in last 30 days | 15 |
| Website/pricing page visit tracked | 15 |
| Content download / webinar attendance | 15 |
| Social engagement (liked/commented/followed) | 10 |
| Referral or warm introduction | 10 |
| **Cap at 100** | |

### Urgency Score (0-100) — default weight 20%
Trigger events and timing signals: renewal window, funding round, leadership change, active RFP, stated deadline, seasonal/regulatory driver.

| Signal present | Points |
|---|---|
| Active RFP / evaluation in progress | 40 |
| Explicit deadline or stated timeline | 25 |
| Recent trigger event (funding, leadership change, expansion, compliance deadline) | 20 |
| Contract/renewal window approaching | 15 |
| **Cap at 100** | |

### Total and Weighting

```
Total = (Fit × 0.50) + (Engagement × 0.30) + (Urgency × 0.20)
Range: 0-100
```

**Weights are configurable.** If the user's business is engagement-driven (e.g., high-volume inbound funnel like KOST's Google Ads leads), consider raising Engagement weight (e.g., 40/40/20) and say so explicitly in the output. If it's a cold-outbound, account-based motion, raise Fit weight (e.g., 60/20/20). Always state which weighting was used at the top of the output.

---

## Step 3 — Grade Bands and Recommended Action

Leaner than `sales-qualify`'s bands — built for fast batch triage, not deep narrative.

| Grade | Total Range | Label | Recommended Action |
|---|---|---|---|
| **A** | 80-100 | Hot — call today | Call/WhatsApp within 24h. Route to best closer. Skip generic sequence — personalize opener from top signal. |
| **B** | 60-79 | Warm — this week | Add to priority outreach sequence this week. Standard personalized email/call cadence. |
| **C** | 35-59 | Cool — nurture | Add to nurture/drip sequence. Re-score in 2-4 weeks or on new signal. Low-touch only. |
| **D** | 0-34 | Cold — deprioritize | Do not actively work. Park in awareness list (newsletter/retargeting). Re-score only if a major trigger appears. |

If the user's volume is high (e.g. 200+ inbound leads/month for KOST DGR), grade A/B should map directly to same-day WhatsApp/phone follow-up per `lib/tracking.ts` conversion priorities — call this out in the output when this repo's context is present.

---

## Step 4 — Handling Incomplete Data Across a Batch

Batches are messy by nature — never let one bad row block the whole list.

1. **Score what's available, flag what's missing.** If a lead is missing Engagement data entirely (e.g., a cold-scraped list with no CRM history), score Engagement as 0 and set a **Confidence flag** rather than skipping the lead or halting the batch.
2. **Confidence flag per lead** (not per batch): `Full` (all 3 axes had real data), `Partial` (1-2 axes inferred/defaulted), `Low` (mostly inferred — company name and maybe industry only).
3. **Never block the batch on one bad row.** Missing columns, blank cells, or malformed data for a single lead should degrade only that lead's confidence — continue processing the rest.
4. **Mixed source quality is normal.** A batch may combine CRM exports (rich engagement data) with a scraped list (fit data only, no engagement history) — score each lead on the data it actually has; do not average in phantom zeros as if they were confirmed absence unless truly no signal exists in that source type.
5. **State assumptions once, not per row.** At the top of the output, note what was inferred by default (e.g., "Engagement scored 0 for all rows without CRM match — no activity data available, not confirmed disengagement").

---

## Step 5 — Error Handling

| Situation | Handling |
|---|---|
| Missing required column (e.g., no company name) | Flag row as `Low` confidence, use whatever identifier exists (domain, contact name, email), continue |
| Duplicate entries (same company/domain twice) | Merge duplicates: keep the row with more complete data, note the merge in output, do not double-count in grade distribution |
| Mixed data quality across sources | Score per-lead on available fields; annotate confidence; do not fabricate signals to fill gaps |
| Entire batch has near-zero data (names only) | Score Fit only if inferable (e.g., from company name/domain via quick judgment), set Engagement/Urgency to 0 with `Low` confidence, recommend the user enrich before acting on grades |
| List exceeds ~500 rows | Process in chunks, note chunking in output, still produce one combined ranked table and one combined summary |
| Ambiguous/free-text list (not a clean CSV) | Parse best-effort into rows; flag any row you couldn't confidently split out |

Always deliver a ranked list — a batch triage tool that refuses to output on imperfect data defeats its own purpose.

---

## Output Format: LEAD-SCORING.md

Write to `LEAD-SCORING.md` in the current directory.

```markdown
# Lead Scoring Report
**Date:** [current date]
**Leads processed:** [N]
**Weighting used:** Fit [X]% / Engagement [Y]% / Urgency [Z]%
**ICP source:** [ICP-PROFILE.md found / inferred from conversation / default — not yet defined]

---

## Ranked Lead Table

| Rank | Company | Contact | Fit | Engagement | Urgency | Total | Grade | Confidence | Next Action |
|------|---------|---------|-----|------------|---------|-------|-------|------------|-------------|
| 1 | [name] | [name/title] | [0-100] | [0-100] | [0-100] | [0-100] | A/B/C/D | Full/Partial/Low | [one-line action] |
| 2 | ... | ... | ... | ... | ... | ... | ... | ... | ... |

*(Continue for all leads, sorted by Total descending.)*

---

## Grade Distribution Summary

| Grade | Count | % of Batch | Action |
|---|---|---|---|
| A — Hot | [n] | [%] | Call today |
| B — Warm | [n] | [%] | This week's sequence |
| C — Cool | [n] | [%] | Nurture |
| D — Cold | [n] | [%] | Deprioritize |

## Data Quality Notes

- [Assumptions applied across the batch, e.g. default Engagement=0 for unmatched rows]
- [Duplicates merged: N]
- [Rows with Low confidence: N — recommend enrichment before acting]

## Top 5 to Call First

1. [Company] — [Total score] — [one-line why]
2. ...
3. ...
4. ...
5. ...

---

*Generated by CAQ Lead Scoring — skill #4 of the Complete Client Acquisition System*
```

## Terminal Summary Block

Always show this condensed view in the terminal in addition to writing the file:

```
=== LEAD SCORING COMPLETE ===

Leads scored: [N]   |   Weighting: Fit [X]% / Engagement [Y]% / Urgency [Z]%

Grade Distribution:
  A (Hot)  : [n] ████████░░  [%]
  B (Warm) : [n] ██████░░░░  [%]
  C (Cool) : [n] ████░░░░░░  [%]
  D (Cold) : [n] ██░░░░░░░░  [%]

Top 5 to call first:
  1. [Company] — [Total]/100 (Grade A)
  2. [Company] — [Total]/100 (Grade A)
  3. [Company] — [Total]/100 (Grade B)
  4. [Company] — [Total]/100 (Grade B)
  5. [Company] — [Total]/100 (Grade B)

Data quality: [n] Full / [n] Partial / [n] Low confidence
Full report saved to: LEAD-SCORING.md
```

---

## Related Skills — Complete Client Acquisition System (caq-*)

This is skill #4 (TARGET phase). Handoffs:

- **caq-icp-architect** — Build the full ICP profile. Run this FIRST if no ICP criteria exist at all; this skill leans on its output for Fit-score weights, but doesn't require a full ICP interview to run.
- **caq-prospect-researcher** — Find and build the raw lead list in the first place. Feeds this skill's input. Use before caq-lead-scoring when there's no list yet.
- **caq-buying-signal-detector** — Deeper, ongoing signal/intent monitoring for specific accounts. Feed its output into this skill's Engagement/Urgency scores for higher-confidence batches; use it standalone for continuous monitoring of already-scored A/B leads.
- **caq-pain-point-builder** — Once a lead is graded A/B, use this to articulate the specific pain points to lead with in outreach.
- **caq-offer-positioning** — Shapes the offer/pitch angle for graded leads, especially A leads getting a custom approach.
- **caq-outreach-angles** — Generates the messaging angle per lead segment/grade before writing actual copy.
- **caq-cold-email-builder** — Writes the actual outbound email sequence for B/C grade leads entering a sequence.
- **caq-linkedin-strategist** — LinkedIn-specific outreach plan, typically for A/B graded leads with identified decision-makers.
- **caq-multichannel-coordinator** — Orchestrates the cross-channel cadence (email + LinkedIn + phone + WhatsApp) once leads are graded and routed.
- **caq-authority-content** — Content strategy for nurturing C-grade leads over time rather than direct outreach.
- **caq-lead-magnet-builder** — Builds magnets/offers to convert D-grade or unscored traffic into a scoreable lead in the first place.
- **caq-inbound-handler** — Real-time triage script for handling a NEW inbound lead the moment it arrives (single-lead, immediate) — complements this skill's batch/retrospective scoring.
- **caq-objection-strategist** — Prep for handling objections once an A/B lead is engaged in conversation.
- **caq-discovery-coach** — Coaches the actual discovery call once a graded lead accepts a meeting.

**vs. `sales-qualify` (pre-existing, not part of this suite):** `sales-qualify` performs deep, single-company BANT + MEDDIC research from public web sources and produces a full narrative qualification report — designed for one account, several minutes of multi-source research, high depth. `caq-lead-scoring` performs fast, weighted-criteria scoring across an entire batch (10-500 leads) from data you already have (CSV/CRM/scraped list) — designed for triage speed, not narrative depth. Use `caq-lead-scoring` to decide who to work first; use `sales-qualify` to deep-dive the specific accounts this skill surfaces as Grade A before a high-stakes proposal or executive outreach.
