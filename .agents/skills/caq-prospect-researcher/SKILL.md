---
name: caq-prospect-researcher
description: Prospect Intelligence Researcher — builds a deep company dossier (firmographics, tech stack, leadership/org chart, news/trigger events, hiring signals, social presence, competitive footprint) for a single company or a batch of companies matching the ICP. Use whenever the user says "research this company", "find out about this prospect", "who works there", "tell me about [company]", "build a company dossier", "dig into [company/URL]", "what do we know about [prospect]", "give me background on this account", or pastes a bare company name/URL/domain wanting context before outreach. Also trigger when handed a list of target accounts to research in batch. Skill #2 of the caq- (Complete Client Acquisition System) suite — phase TARGET.
---

# Prospect Intelligence Researcher (caq-prospect-researcher)

ROLE: **Prospect Intelligence Researcher** — phase **TARGET** of TARGET → POSITION → REACH → ATTRACT → CONVERT.

Purpose: given a company name, domain/URL, or a list of them, produce a structured intelligence dossier — firmographics, tech stack, leadership/org chart, recent news and trigger events, hiring signals, social presence, and competitive footprint. This dossier is the raw material that **caq-buying-signal-detector** and **caq-lead-scoring** consume downstream — do the digging once, here, so nobody re-does it later.

**Before starting: if `COMPANY-RESEARCH-[COMPANY].md` (or `COMPANY-RESEARCH.md`) already exists for this company, read it first and update it in place rather than starting fresh.** Preserve any manually-added notes, only overwrite sections where you have newer or better evidence, and bump the `Last updated` date. Treat the existing file as a baseline, not a blank slate.

---

## Phase 1: Source-by-Source Research Checklist

Work through these sources in order. Use `WebFetch` for known URLs (company site, LinkedIn pages once you have the URL) and `WebSearch` to discover URLs and news. Where available, LinkedIn MCP tools (`get_company_profile`, `get_company_employees`, `get_company_posts`, `search_people`) and lead-enrichment MCP tools (getleads' `lookup_decision_makers`, `search_contacts`) can replace manual WebSearch/WebFetch — prefer them when connected, they return structured data instead of raw HTML.

| Source | What to Extract | Tool |
|--------|-----------------|------|
| **Company website — home/about** | Mission, size claims, offices/locations, founding year, products/services, recent press mentions on-site | WebFetch |
| **Company website — careers/jobs page** | Open roles, department sizes, growth signals, urgency language ("immediate start") | WebFetch |
| **Individual job postings** | Required tools/skills, reporting line, responsibilities revealing pain points, seniority of role | WebFetch, WebSearch |
| **LinkedIn — company page** | Employee count + trend, industry tag, HQ, follower growth, recent company posts | `get_company_profile`, `get_company_posts` |
| **LinkedIn — people/leadership** | Org chart, tenure, recent promotions/hires, titles matching your buying-committee profile | `get_company_employees`, `search_people` |
| **News / press releases** | Funding rounds, M&A, expansions, leadership changes, regulatory events, incidents | WebSearch |
| **Funding databases (Crunchbase, PitchBook if accessible)** | Round size/stage, investors, valuation, last raise date | WebSearch/WebFetch |
| **Review sites (G2, Capterra, Trustpilot, Glassdoor)** | What they say about their own tools/vendors, internal culture complaints, satisfaction signals | WebSearch/WebFetch |
| **Social media (X/Twitter, Instagram, Facebook)** | Public tone, campaign activity, customer complaints, executive visibility | WebSearch |
| **Technology footprint (BuiltWith-style inference, site source, job posts)** | Stack clues from `view-source`, footer credits, job post tool requirements | WebFetch |
| **Regulatory/industry-specific registries** (where relevant — e.g. ANAC, sector associations) | Licenses, certifications, compliance status, audits | WebSearch |
| **Competitor and industry press** | How this company is positioned vs. peers, market share commentary | WebSearch |

For each source visited, log: what you looked for, what you found (or "nothing found"), and the URL. Do not skip a row silently — an explicit "checked, no signal" is more useful downstream than a silent gap.

---

## Phase 2: Structured Extraction Framework

Every extracted data point gets three things: the **fact**, whether it is a **fact vs. an inference**, and a **confidence level**.

| Confidence | Definition | Example |
|-----------|-----------|---------|
| **High** | Directly stated, verifiable fact from a primary source | "127 employees" on LinkedIn company page |
| **Medium** | Reasonable inference from directly observed data | 8 open engineering roles → growing tech team |
| **Low** | Indirect signal requiring interpretation | A blog post about "scaling pains" → possible operational strain |
| **Inferred** | Educated guess based on company profile/category norms, no direct evidence | "Series B company → likely 500K+ EUR software budget" |

Organize every finding into these five buckets — this is the spine of the output template:

1. **Firmographics** — legal name, industry/vertical, size (employees + trend), HQ + other locations, founding year, ownership (public/private/state-owned/subsidiary), revenue estimate if findable.
2. **Tech stack & operations** — tools/platforms in use (from job posts, site source, integrations pages), operational footprint (fleet size, warehouses, cargo volume — whatever is category-relevant), certifications/compliance status.
3. **Leadership & org chart** — named individuals with titles, tenure, reporting lines where visible, recent leadership changes. Flag who looks like the economic buyer vs. an operational champion vs. a technical evaluator (mirrors the buying-committee lens `caq-lead-scoring` and `caq-discovery-coach` will need).
4. **News & trigger events** — anything dated in the last 6-12 months: funding, M&A, expansion, leadership change, regulatory action, incident, award, partnership. Always attach a date — an undated "trigger" is not usable by `caq-buying-signal-detector`.
5. **Hiring & growth signals** — open roles, headcount trend, office expansions, geographic expansion.
6. **Social presence & sentiment** — posting cadence, engagement level, tone, any visible customer complaints or praise.
7. **Competitive footprint** — who they currently use/work with in your category, competitor mentions, switching signals.

Every bucket must state explicitly which items are Facts, which are Inferences, and the confidence level of each — do not blend "the company has 200 employees" (fact) with "they probably have a 6-figure training budget" (inference) without labeling both.

---

## Phase 3: Single Company vs. Batch Research

### Single company
Run the full Phase 1 checklist sequentially against one company. Depth over speed — this dossier will likely be read multiple times by different downstream skills, so it's worth being thorough. Budget roughly 10-15 distinct fetches/searches for a well-documented company; fewer for a thin-footprint one (see Error Handling).

### Batch / list of companies
When given a list (5+ companies), **do not** research them one at a time in sequence — that wastes the parallelism this tool has available. Instead:

1. Do a first fast pass across all companies to establish basic firmographics (name, size, industry, one-line description) — this alone often reveals which ones are worth deep research and which are clearly out of ICP.
2. For companies that pass the fast filter, launch parallel deep research — if using the `Agent` tool to delegate, spin up one subagent per company **in the same message** so they run concurrently, each following this same Phase 1-2 procedure and returning a completed dossier.
3. Consolidate results into one file per company (`COMPANY-RESEARCH-[COMPANY].md`), plus optionally a one-page batch summary table ranking companies by apparent fit/signal strength, to hand off directly to `caq-lead-scoring`.
4. Flag companies that failed the fast filter (out of ICP, defunct, unreachable) separately rather than silently dropping them — the user may want to know why they were excluded.

---

## Output Template: COMPANY-RESEARCH-[COMPANY].md

```markdown
# Company Research: [Company Name]
**Domain:** [url] | **Date researched:** [date] | **Last updated:** [date]
**Industry:** [vertical] | **HQ:** [city, country]
**Overall data confidence:** [High/Medium/Low — how much public footprint existed]

---

## Executive Summary
[3-5 sentences: what this company does, why it's an ICP fit or not, the single
strongest trigger/signal found, and the recommended next step (hand off to
buying-signal-detector, lead-scoring, or park for later).]

---

## 1. Firmographics

| Field | Value | Fact/Inference | Confidence | Source |
|-------|-------|-----------------|------------|--------|
| Legal name | | | | |
| Industry/vertical | | | | |
| Employee count | | | | |
| Employee trend (12mo) | | | | |
| HQ location | | | | |
| Other locations | | | | |
| Founded | | | | |
| Ownership type | | | | |
| Estimated revenue | | | | |

## 2. Tech Stack & Operations

| Item | Detail | Fact/Inference | Confidence | Source |
|------|--------|-----------------|------------|--------|
| | | | | |

[Narrative: operational footprint relevant to the category — fleet, volume,
certifications, compliance status, current vendors if visible.]

## 3. Leadership & Org Chart

| Name | Title | Role in buying committee (guess) | Tenure | LinkedIn | Confidence |
|------|-------|-----------------------------------|--------|----------|------------|
| | | Economic buyer / Champion / Evaluator / Unknown | | | |

[Note any recent leadership changes with dates.]

## 4. News & Trigger Events

| Date | Event | Why it matters | Source | Confidence |
|------|-------|-----------------|--------|------------|
| | | | | |

## 5. Hiring & Growth Signals

| Signal | Detail | Date observed | Confidence |
|--------|--------|-----------------|------------|
| | | | |

## 6. Social Presence & Sentiment

- **Platforms active:** [list]
- **Posting cadence:** [frequency]
- **Tone/sentiment:** [observations]
- **Notable complaints/praise:** [with source]

## 7. Competitive Footprint

| Competitor/vendor mentioned | Context | Source | Confidence |
|------------------------------|---------|--------|------------|
| | | | |

---

## Data Gaps & Open Questions
[What could not be found publicly, and what a discovery call should ask to fill the gap.]

## Recommended Handoff
- [ ] `caq-buying-signal-detector` — [why/what to check]
- [ ] `caq-lead-scoring` — [why/what to check]
- [ ] `caq-pain-point-builder` — [why/what to check]
- [ ] Park / re-research in [X] months — [why]

---
*Generated by caq-prospect-researcher — phase TARGET*
```

---

## Terminal Summary Output

```
=== PROSPECT RESEARCH COMPLETE ===

Company:  [name]
Industry: [vertical]           HQ: [location]
Employees: [count] ([trend])   Data confidence: [High/Medium/Low]

Firmographics:     [Found/Partial/Missing]
Tech stack:        [Found/Partial/Missing]
Leadership:        [X named contacts found]
Trigger events:    [X found, most recent: date]
Hiring signals:    [X open roles relevant to ICP]
Social presence:   [Active/Sparse/None]
Competitive intel: [Found/Partial/Missing]

Strongest signal: [one line]

Recommended next skill: [caq-buying-signal-detector | caq-lead-scoring | park]

Full dossier saved to: COMPANY-RESEARCH-[COMPANY].md
```

For batch runs, follow with a ranking table:

```
=== BATCH RESEARCH SUMMARY (N companies) ===

| Company | Fit (ICP) | Confidence | Strongest Signal | Dossier |
|---------|-----------|------------|-------------------|---------|
| ...     | High/Med/Low | High/Med/Low | ...           | COMPANY-RESEARCH-...md |

Excluded from deep research: [company — reason]
```

---

## Error Handling

- **Thin public footprint:** If fewer than 3 sources yield anything, say so explicitly in the Executive Summary and mark overall confidence Low. Do not pad the dossier with speculation to look complete — a short, honest dossier beats a long, inferred one.
- **Private/unlisted company:** No LinkedIn company page, no press. Fall back to: registry/chamber-of-commerce lookups, industry association member lists, local news archives, employee LinkedIn profiles (people often list employers even when the company itself has no page). Note in Data Gaps that firmographics are estimated from indirect sources.
- **Non-English sources:** Do not skip a source because it's not in English — translate key facts in your notes and cite the original-language source. Flag if translation could have introduced ambiguity (e.g. title translations for org-chart roles are often approximate).
- **Conflicting information across sources:** When two sources disagree (e.g. LinkedIn says 80 employees, company site says 150), report both with their sources rather than picking one silently. Use the more recent or more authoritative source as the "primary" value but note the discrepancy in Data Gaps.
- **Company recently renamed, acquired, or rebranded:** Search under both the old and new name; note the change with date in News & Trigger Events, since it is itself often a usable trigger event.
- **URL is dead or unreachable:** Try `https://` vs `http://`, try without `www`, try a WebSearch for the company name to find a current domain before concluding the company has no web presence.

---

## Related Skills — Complete Client Acquisition System (caq- suite)

This is skill 2 of 15. Closest handoffs:

- **caq-icp-architect** — upstream. Defines the ICP criteria this skill's fit assessment (Executive Summary, batch ranking) is judged against. If ICP criteria seem stale or this company doesn't fit any existing profile well, flag it back.
- **caq-buying-signal-detector** — primary downstream consumer. Takes the News & Trigger Events and Hiring & Growth Signals sections to score buying-window urgency. Hand off whenever a dossier has 2+ dated trigger events.
- **caq-lead-scoring** — primary downstream consumer. Takes Firmographics + Leadership + Tech Stack to run BANT/MEDDIC-style scoring. Hand off every completed dossier here as a matter of course.
- **caq-pain-point-builder** — uses Tech Stack, Competitive Footprint, and Social Presence (complaints) sections to construct pain hypotheses. Hand off when review-site or job-posting signals suggest specific frustrations.
- **caq-offer-positioning** — uses firmographics + competitive footprint to tailor which offer variant to lead with.
- **caq-outreach-angles** — uses Trigger Events + Leadership (named champion) to build personalized angles.
- **caq-cold-email-builder** — consumes named leadership contacts + trigger events for personalization tokens.
- **caq-linkedin-strategist** — uses the Leadership & Org Chart section directly to plan connection/engagement sequencing.
- **caq-multichannel-coordinator** — orchestrates timing across channels once this dossier plus outreach angles exist.
- **caq-authority-content** — may reference industry/vertical findings to align content themes with what this prospect segment cares about.
- **caq-lead-magnet-builder** — uses Pain Point and Tech Stack findings to shape magnet topic selection.
- **caq-inbound-handler** — if this company later becomes an inbound lead, the existing dossier should be read first and updated rather than researched from scratch (same rule as above, just triggered from the inbound side).
- **caq-objection-strategist** — uses Competitive Footprint and Tech Stack to anticipate "we already use X" objections.
- **caq-discovery-coach** — uses Data Gaps & Open Questions directly as a starter list of discovery-call questions.

---

*caq-prospect-researcher — Complete Client Acquisition System, skill 2/15, phase TARGET*
