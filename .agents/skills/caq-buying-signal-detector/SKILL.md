---
name: caq-buying-signal-detector
description: Scans a specific company (or list of companies) for trigger events and buying signals that indicate NOW is a good time to reach out — funding rounds, leadership changes, expansions, layoffs, new relevant hires, tech stack changes, competitor churn, regulatory shifts, review complaints, and pain-point social posts. Produces a ranked, evidence-backed BUYING-SIGNALS.md with an Urgency Score (0-100) and a plain-English "why now" narrative. Trigger this skill on phrases like "is this company ready to buy", "buying signals", "trigger event", "why now", "timing signals", "is now a good time to reach out to them", "should I reach out to X now or wait", "signal scan", "intent signals", or "what changed at this account recently".
---

# Buying Signal Detector

ROLE: **Buying Signal Detector** — phase: TARGET (of TARGET → POSITION → REACH → ATTRACT → CONVERT), skill #3 of 15 in the Complete Client Acquisition System (prefix `caq-`).

You scan a named company (or a short list of companies) for evidence that timing favors outreach right now. You do not judge ICP fit (that is `caq-icp-architect`) and you do not build a full company dossier (that is `caq-prospect-researcher`). You answer one narrow question extremely well: **is this account showing signs of change that create urgency to buy, and how fresh is that evidence?**

Why this matters: identical outreach sent to the same account at the wrong moment gets ignored; sent within days of a real trigger event, reply rates and meeting-booked rates rise sharply. Sales teams that time outreach to signals consistently outperform teams that spray-and-pray on a fixed cadence — the message doesn't need to be smarter, the timing does.

If `COMPANY-RESEARCH.md` already exists in the working directory for this account, **read it and reuse its findings** (firmographics, leadership, funding history, tech stack) instead of re-researching from scratch. Layer fresh signal scanning on top of it rather than duplicating it.

---

## Phase 1: Signal Taxonomy

Scan each category below. Not every category will produce a hit — that's normal. Use `WebSearch` for news/press/social, `WebFetch` for specific pages (careers, product pages, review sites), and any connected LinkedIn/job-board tools available in the session.

### 1. Growth Signals
Indicate expanding budget, expanding team, expanding ambition.

| Sub-signal | Where to find it |
|---|---|
| New funding round (seed through Series D+, or PE/debt raise) | TechCrunch, Crunchbase, press releases, WebSearch `"[company]" funding round` |
| New office / market / country expansion | Press releases, LinkedIn company updates, local news |
| Headcount growth (LinkedIn employee count trending up) | LinkedIn company page, WebSearch `"[company]" employees growth` |
| Surge in job postings, especially in the department your product serves | Company careers page, Indeed, LinkedIn Jobs |
| New product launch or major feature announcement | Company blog, Product Hunt, press |
| Executive hire in a relevant function (new CMO, CTO, VP Sales, Head of X) | LinkedIn, press release, "welcomes new..." searches |
| Award, "fastest growing" list placement, revenue milestone announced | News, industry press, WebSearch |

### 2. Pain Signals
Indicate an active or building problem your offer addresses.

| Sub-signal | Where to find it |
|---|---|
| Negative reviews mentioning the specific problem you solve | G2, Capterra, Trustpilot, Glassdoor |
| Public complaints on social media (X/Twitter, LinkedIn, Reddit) about a vendor, process, or outcome | WebSearch, X search, Reddit search |
| Support-ticket-style complaints in public forums or communities | Reddit, industry Slack/Discord if indexed, WebSearch |
| Job posting explicitly describing the pain ("fix our broken X process", "reduce manual Y") | Careers page, job board listings |
| Churn signal: reviews mentioning they "switched from" or "left" a competitor | G2/Capterra review text |
| Executive comments in interviews/podcasts naming a challenge | WebSearch `"[exec name]" interview challenges`, podcast transcripts |

### 3. Organizational Change Signals
Change in structure or leadership often resets vendor relationships and budget ownership.

| Sub-signal | Where to find it |
|---|---|
| New C-suite or VP hire (especially in the buying department) | LinkedIn, press release |
| Reorg / department restructuring announced | News, LinkedIn posts from employees |
| Layoffs or hiring freeze (can cut both ways — note as pain signal AND budget risk) | Layoffs.fyi, news, WebSearch `"[company]" layoffs` |
| M&A activity (acquired, acquiring, merging) | Press, SEC filings if public, Crunchbase |
| Board changes, new investor with a portfolio thesis relevant to your product | Crunchbase, press |
| Departure of the prior champion/decision-maker (their old advocate left) | LinkedIn — search "former [title] at [company]" |

### 4. Technology Signals
Indicate stack changes that create switching moments or integration needs.

| Sub-signal | Where to find it |
|---|---|
| New tool adoption visible in job postings ("experience with [tool] required") | Job postings |
| Tech stack detected via BuiltWith / Wappalyzer-style lookups | Public tech-detection tools, page source inspection |
| Migration announcement (replatforming, "we moved to X") | Engineering blog, press, LinkedIn |
| API/integration marketplace listing added or removed | Vendor marketplace pages (Salesforce AppExchange, Shopify App Store, etc.) |
| RFP or vendor evaluation signal (procurement portal, "seeking proposals for...") | Procurement portals, WebSearch `"[company]" RFP [category]` |

### 5. Competitive / Market Signals
Indicate the account's market position or vendor landscape is shifting.

| Sub-signal | Where to find it |
|---|---|
| Competitor of theirs just signed a notable deal or launched a competing feature | Industry press, WebSearch |
| A direct competitor to YOUR product lost this account (review says "switched away from [rival]") | G2/Capterra switch reviews |
| Industry-wide disruption event (new entrant, price war, category shift) | Industry press, analyst notes |
| Account is expanding into a market where you have proof/case studies | Press releases, expansion news |

### 6. Regulatory / Compliance Signals
Indicate externally imposed urgency with hard deadlines.

| Sub-signal | Where to find it |
|---|---|
| New law/regulation affecting their industry with a compliance deadline | Government gazettes, industry association bulletins, legal news |
| Certification requirement newly mandated (e.g., safety, data, quality) | Regulator websites, trade press |
| Public enforcement action against them or a competitor for non-compliance | News, regulator press releases |
| Industry standard update (ISO revision, IATA/DGR rule change, etc.) | Standards body bulletins — relevant to KOST's own DGR training vertical |

> Note for this codebase's context (KOST DGR training): regulatory signals are unusually high-value here — an IATA DGR rule change, a new DZ customs/aviation-safety directive, or an incident triggering compliance scrutiny at a prospect (airline, freight forwarder, oil & gas logistics operator) is often the single strongest "why now" for training budget.

---

## Phase 2: Signal Strength & Freshness Scoring

Every individual signal gets two ratings, then a combined per-signal score.

### 2.1 Strength (base points)

| Strength | Definition | Base points |
|---|---|---|
| **Strong** | Directly and specifically indicates buying readiness (funding round, RFP, new VP in the buying department, explicit pain quote) | 30 |
| **Moderate** | Plausible but requires inference (headcount growth, generic job posting, industry trend applies to them) | 18 |
| **Weak** | Distant or indirect (general industry news, competitor moved, no direct account-level evidence) | 8 |

### 2.2 Recency decay (multiplier)

Apply a decay multiplier based on how old the signal is. A strong signal from today outweighs one from 8 months ago — decay reflects that outreach relevance has a shelf life.

| Signal age | Multiplier |
|---|---|
| 0–7 days | 1.00 |
| 8–30 days | 0.85 |
| 31–90 days | 0.65 |
| 91–180 days | 0.40 |
| 181–365 days | 0.20 |
| 365 days+ | 0.05 |

### 2.3 Per-signal score formula

```
Signal Score = Base Points (Strength) × Recency Multiplier
```

Example: a Strong signal (funding round) from 45 days ago = 30 × 0.65 = 19.5 points.
Example: a Weak signal (industry trend) from 300 days ago = 8 × 0.20 = 1.6 points.

Record every detected signal in a table with: description, category, strength, date, age bucket, multiplier, score, source URL/citation.

---

## Phase 3: Urgency Score (0-100)

### 3.1 Aggregation

```
Raw Total = sum of all Signal Scores
Urgency Score = min(100, round(Raw Total × Category Diversity Bonus))
```

**Category Diversity Bonus**: signals clustered in one category are less convincing than corroborating signals across categories (e.g., a funding round AND a new VP hire AND a relevant job posting, all within 60 days, tell a much stronger story together than three growth-category signals alone).

| Distinct categories with a Moderate+ signal in the last 90 days | Bonus multiplier |
|---|---|
| 4+ categories | 1.25 |
| 3 categories | 1.15 |
| 2 categories | 1.05 |
| 1 category | 1.00 |
| 0 (only Weak or stale signals) | 0.85 |

Cap the final Urgency Score at 100.

### 3.2 Urgency Tiers

| Score | Tier | Meaning |
|---|---|---|
| 80-100 | **Critical — Act This Week** | Multiple corroborating fresh triggers. Outreach should reference the specific event directly. |
| 60-79 | **High — Act This Month** | Strong recent signal(s), good reason to prioritize this account now. |
| 40-59 | **Moderate — Warm, Not Hot** | Some signal present but not urgent; good candidate for a standard sequence, not a rush. |
| 20-39 | **Low — Monitor** | Thin or stale signals; do not lead with urgency-based messaging. |
| 0-19 | **None Detected — Passive Watch** | No meaningful public activity found. See Error Handling — this is NOT a zero-priority verdict, it's a data-availability verdict. |

### 3.3 "Why Now" Narrative

Write 3-5 plain-English sentences per company that a sales rep could paste directly into the opening line of a call brief or email draft. Structure:

1. **The trigger** — what specifically changed, and when.
2. **The implication** — why that change plausibly creates need, budget, or urgency.
3. **The connection** — how it maps to what we sell.
4. **The recommended timing** — act now / act this month / hold and monitor.

Example (for this codebase's KOST DGR context):
> TotalEnergies Algeria posted 3 new HSE/logistics compliance roles in the last 3 weeks and their Algiers site was named in a recent ministry directive tightening dangerous-goods handling audits. This combination (hiring + regulatory pressure) suggests they are actively building out compliance capacity right now, and IATA DGR certification is a concrete, fast way to close that gap before an audit. Recommend reaching out this week, referencing the directive directly, and offering the fastest available CBTA session date.

---

## Phase 4: Output

### 4.1 Ranked List (Multi-Company Mode)

When scanning a list rather than one company, output a ranked summary table before the per-company detail sections:

| Rank | Company | Urgency Score | Tier | Top Trigger | Recommended Action |
|---|---|---|---|---|---|
| 1 | [name] | [X] | [tier] | [1-line trigger] | [act now/this month/monitor] |

### 4.2 Full Report — BUYING-SIGNALS.md

Write the full output to `BUYING-SIGNALS.md` in the current directory (or append a new dated section per company if scanning a list over time):

```markdown
# Buying Signal Report: [Company Name]
**Date scanned:** [current date]
**Urgency Score: [X]/100**
**Tier: [Critical/High/Moderate/Low/None Detected] — [label]**

---

## Why Now

[3-5 sentence plain-English narrative per Phase 3.3]

---

## Signal Summary

| Signal | Category | Strength | Date | Age | Multiplier | Score | Source |
|--------|----------|----------|------|-----|-----------|-------|--------|
| [description] | [category] | Strong/Moderate/Weak | [date] | [bucket] | [x.xx] | [pts] | [url] |
[one row per detected signal, sorted by score descending]

**Raw Total:** [X]
**Category Diversity Bonus:** [X categories → x.xx multiplier]
**Urgency Score:** [X]/100

---

## Signals By Category

### Growth Signals
[detail on each hit, or "None detected in the scanned window."]

### Pain Signals
[detail, or "None detected."]

### Organizational Change Signals
[detail, or "None detected."]

### Technology Signals
[detail, or "None detected."]

### Competitive / Market Signals
[detail, or "None detected."]

### Regulatory / Compliance Signals
[detail, or "None detected."]

---

## Recommended Outreach Timing

**Tier:** [tier label]
**Action window:** [this week / this month / next quarter / monitor only]
**Angle to lead with:** [reference the top trigger directly, or note that a generic value-first approach is safer given low signal strength]
**Monitoring cadence if not acting now:** [e.g., "re-scan in 30 days" or "set alert on [specific source] for [specific term]"]

---

## Data Gaps

[List what could not be checked — e.g., no access to Glassdoor, no procurement portal found, private company with limited press — and what that means for confidence.]

---

*Generated by Buying Signal Detector — CAQ Skill #3 (TARGET phase)*
```

### 4.4 Terminal Summary

Always print this condensed block to the terminal after writing the file:

```
=== BUYING SIGNAL SCAN COMPLETE ===

Company:  [name]
Scanned:  [date]

Urgency Score: [X]/100
Tier: [Critical/High/Moderate/Low/None Detected]

Signals Detected: [N] total ([N] Strong, [N] Moderate, [N] Weak)
Category Coverage: [N]/6 categories hit ([list categories])

Top 3 Signals:
  1. [signal] — [score] pts ([age])
  2. [signal] — [score] pts ([age])
  3. [signal] — [score] pts ([age])

Why Now: [1-sentence compressed narrative]

Recommended Action: [act this week / this month / monitor]

Full report saved to: BUYING-SIGNALS.md
```

For multi-company scans, print the ranked table (Phase 4.1) instead, followed by a one-line "Full reports saved to: BUYING-SIGNALS.md (all companies)".

---

## Error Handling

- **No recent public activity found:** This is a low-urgency result, not a zero-priority verdict — state that explicitly in the report ("No signals detected does not mean this account has no potential; it means public data is currently insufficient to time outreach precisely"). Assign Urgency Score in the 0-19 band, tier "None Detected — Passive Watch," and always propose a monitoring cadence (e.g., re-scan in 30-60 days, or set a standing WebSearch alert on the company name + relevant trigger keywords).
- **Company is private/small with minimal press footprint:** Lean harder on job postings, LinkedIn headcount trends, and review sites — these often exist even for companies with no press coverage. Note reduced confidence in the Data Gaps section.
- **Conflicting signals** (e.g., funding round but also recent layoffs): report both, do not average them away. Note the tension explicitly in the Why Now narrative — mixed signals mean proceed but calibrate messaging (e.g., ROI/cost-efficiency framing over growth framing).
- **URL or company unreachable/misidentified:** confirm the correct legal/trading name and domain before scanning (companies with generic names are easy to conflate); if ambiguous, ask for disambiguation rather than guessing.
- **Rate-limited or blocked sources** (e.g., LinkedIn login walls, paywalled news): note which sources were inaccessible in Data Gaps, and do not silently treat "could not check" the same as "checked, nothing found" — these carry different confidence implications.
- Always produce a report even with sparse data — a documented "nothing found, recommend monitoring" is a valid and useful output, not a failure state.

---

## Related Skills

This is skill #3 of 15 in the Complete Client Acquisition System (TARGET → POSITION → REACH → ATTRACT → CONVERT). Closest handoffs first.

**Closest handoffs:**
- **`caq-prospect-researcher`** — Run this first (or alongside) if no `COMPANY-RESEARCH.md` exists yet; it builds the full company dossier (firmographics, leadership, tech stack) that this skill reuses instead of re-researching. This skill then layers timing/trigger-event scanning on top.
- **`caq-lead-scoring`** — Feed this skill's Urgency Score in as one input to the overall lead score; buying-signal timing is a component of, not a replacement for, full lead scoring (which also weighs ICP fit, engagement history, and deal size).
- **`caq-pain-point-builder`** — Hand off any Pain Signals detected here directly into pain-point messaging construction; this skill finds the evidence, that skill turns it into narrative copy.

**Other related skills in the suite:**
- `caq-icp-architect` — Defines the ideal customer profile this skill's targets should be checked against; run before prospecting if ICP is undefined.
- `caq-offer-positioning` — Uses signal findings (especially regulatory/pain signals) to sharpen how the offer is framed for this specific account.
- `caq-outreach-angles` — Consumes the "Why Now" narrative directly as a ready-made outreach angle.
- `caq-cold-email-builder` — Should reference the top 1-2 signals verbatim in email opening lines when Urgency Score is 60+.
- `caq-linkedin-strategist` — Use organizational-change signals (new hires, departures) to time LinkedIn connection requests and comments.
- `caq-multichannel-coordinator` — Uses the Urgency Score/tier to decide sequencing and channel mix (higher urgency = more channels, faster cadence).
- `caq-authority-content` — Regulatory/compliance signals detected here are strong candidates for authority content topics (e.g., a rule-change explainer).
- `caq-lead-magnet-builder` — Pain signals found here can indicate which lead magnet topic will resonate with this account's segment.
- `caq-inbound-handler` — When an inbound lead arrives, run this skill retroactively to check whether a detected trigger explains the inbound interest, informing response prioritization.
- `caq-objection-strategist` — Red-flag-adjacent signals (layoffs, budget risk) here should inform anticipated objections.
- `caq-discovery-coach` — Carry the "Why Now" narrative and top signals into the discovery call brief so the rep opens with informed, specific questions.
