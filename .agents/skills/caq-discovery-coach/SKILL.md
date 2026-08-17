---
name: caq-discovery-coach
description: Prepares the user for a specific upcoming discovery/demo call with a named prospect — pulls whatever prospect research already exists (company research, buying signals, pain points, outreach angles), identifies the specific BANT/MEDDIC gaps still unknown, and produces a tailored call agenda, question bank, and post-call next-step plan. Trigger on "prep me for this discovery call", "what should I ask on this sales call", "help me run this demo call", "discovery call questions", "how do I move this deal forward after the call", "I have a call with [prospect] tomorrow", "get ready for my sales call", or any mention of an upcoming call with a specific prospect where the user wants to prepare or debrief.
---

# Discovery Call Conversion Coach

ROLE: **Discovery Call Conversion Coach** — phase: CONVERT (final phase of TARGET → POSITION → REACH → ATTRACT → CONVERT). This is skill #15 of 15 in the Complete Client Acquisition System. Every upstream skill in the suite exists to produce a booked call; this skill exists to make sure the call converts into a real, advancing opportunity instead of a pleasant conversation that goes nowhere.

Two things go wrong on most discovery calls, and both are preventable:

1. **The rep asks generic questions** ("tell me about your challenges") instead of questions targeted at the specific gap in their knowledge — because they didn't check what they already know before the call.
2. **The call ends with "I'll follow up"** instead of a calendared next step — because nobody deliberately steered the close.

This skill attacks both failure modes: prep before, structure during, discipline after.

---

## Phase 1: Pre-Call Prep — Find the Gaps, Not the Generic Questions

The call's only job is to fill in what is still unknown. Before writing a single question, inventory what is already known.

### 1.1 Pull every upstream artifact for this prospect

Look in the working directory (and ask the user for the prospect name/company if not obvious) for any of these, using whatever naming convention is present (may be prefixed with the company name, e.g. `PROSPECT-ANALYSIS-ACME.md`):

| Artifact | Produced by | What it feeds |
|---|---|---|
| `COMPANY-RESEARCH-*.md` | caq-prospect-researcher | Firmographics, tech stack, trigger events → Metrics, Economic Buyer |
| `PROSPECT-ANALYSIS-*.md` / `LEAD-QUALIFICATION-*.md` | caq-lead-scoring / sales-qualify | Existing BANT/MEDDIC scores → tells you exactly which dimension is weakest |
| `BUYING-SIGNALS-*.md` | caq-buying-signal-detector | Timeline urgency, trigger events → Timeline gap |
| `PAIN-POINTS-*.md` | caq-pain-point-builder | Hypothesized pain → Need gap, validate don't re-discover |
| `OUTREACH-ANGLES-*.md` / `OUTREACH-SEQUENCE-*.md` | caq-outreach-angles / caq-multichannel-coordinator | What angle got them to say yes to this call — reuse it as the rapport opener |
| `DECISION-MAKERS-*.md` | caq-lead-scoring / research | Authority — who is on this call vs. who isn't |
| `IDEAL-CUSTOMER-PROFILE.md` | caq-icp-architect | Fit baseline to sanity-check what you hear |
| `OBJECTION-PLAYBOOK*.md` | caq-objection-strategist | Pre-loaded responses if an objection surfaces mid-call |

Read every one that exists. Do not re-research what is already documented — that wastes the prospect's time and signals you didn't do your homework.

### 1.2 Build the gap map

For each of BANT and the two MEDDIC elements not covered by BANT (Metrics, Decision Criteria, Decision Process, Champion), mark status from the artifacts:

| Dimension | Status | Evidence so far | Call priority |
|---|---|---|---|
| Budget | Known / Partial / Unknown | [from artifacts] | High if Unknown |
| Authority | Known / Partial / Unknown | [from artifacts] | High if Unknown |
| Need | Known / Partial / Unknown | [from artifacts] | High if Unknown |
| Timeline | Known / Partial / Unknown | [from artifacts] | High if Unknown |
| Metrics | Known / Partial / Unknown | [from artifacts] | Medium |
| Decision Criteria | Known / Partial / Unknown | [from artifacts] | Medium |
| Decision Process | Known / Partial / Unknown | [from artifacts] | Medium |
| Champion | Known / Partial / Unknown | [from artifacts] | High if Unknown |

**Rule:** any dimension marked Unknown gets question-bank time on the call. Any dimension marked Known gets referenced, not re-asked ("I saw you recently expanded into three new markets — is that driving the timeline here?") — confirming beats re-discovering, and it demonstrates preparation to the prospect.

Cap the call's question priorities at 3 gaps maximum. A 30-minute call cannot productively fill six unknowns — pick the three that most determine whether this becomes a real opportunity (Budget and Authority are usually non-negotiable to include; Champion is a close third if this is a multi-stakeholder org).

---

## Phase 2: Call Structure & Agenda (30-Minute Template)

Time-box explicitly — discovery calls drift into rapport or into a premature pitch without a visible clock.

| Segment | Time | Purpose | Failure mode it prevents |
|---|---|---|---|
| **1. Rapport** | 2 min | Warm, specific opener referencing something real (their trigger event, a mutual connection, something from the outreach angle that got them to say yes) | Generic small talk that wastes time and signals no prep |
| **2. Context-setting / agenda-setting** | 2 min | State why you're both here, confirm time available, preview the agenda out loud: "I'd like to spend most of our time understanding X and Y, then show how [solution] fits, then figure out a good next step — does that work?" | Prospect doesn't know what's coming, gets defensive or rambles |
| **3. Discovery questions** | 15 min | Targeted questions from the gap map (Phase 3below) — the bulk of the call | Asking questions you could've answered from research; running out of time before uncovering the real gaps |
| **4. Tailored mini-pitch** | 6 min | Reflect back 2-3 things just uncovered in their own words, then show ONLY the capability that maps to those — not a full deck | Generic feature-dump pitch disconnected from what was just said |
| **5. Next steps / close** | 5 min | Lock a specific, calendared next step (Phase 5 below) | "I'll follow up" — the single biggest cause of stalled deals |

**Buffer discipline:** if discovery (segment 3) runs long, cut the pitch shorter, never cut the close. A call that ends without a locked next step is a wasted call regardless of how good the conversation was.

---

## Phase 3: Discovery Question Bank — Organized by Gap

Do not ask all of these. Pull only the questions for gaps marked Unknown/Partial in Phase 1, ranked by priority. These are starting points — adapt the wording to the prospect's industry and what they've already said.

### Budget-gap questions
- "When you've brought in similar tools/services before, roughly what range did that fall in — enterprise-level investment or more of a lightweight tool spend?"
- "Is there budget already allocated for solving this, or would this need a new business case?"
- "Who else needs to sign off once we agree this is the right direction — does that include finance or procurement?"

### Authority-gap questions
- "Walk me through what happens after today on your side — who else needs to be looped in before a decision gets made?"
- "If we get to a point where this is clearly the right fit, whose approval makes it official?"
- "Have you run a purchase like this before? What did that process look like?"

### Need-gap questions
- "What's the actual cost of this problem today — hours lost, revenue at risk, compliance exposure? Something we can put a number on?"
- "What have you already tried to fix this, and why didn't it stick?"
- "If nothing changes in the next six months, what happens?"

### Timeline-gap questions
- "What's driving the timing of looking at this now, as opposed to six months ago or six months from now?"
- "Is there a date this needs to be solved by — an audit, a contract renewal, a launch, a compliance deadline?"
- "What does your calendar look like for the next month — is this a this-quarter priority or a someday priority?"

### Champion-identification questions
- "Who on your team feels this pain most directly day-to-day?"
- "Besides you, who would be excited if this got solved?"
- "Who's usually the person internally who pushes new tools/vendors through, once they're convinced?"

---

## Phase 4: Active Listening — The Follow-Up Is Where the Insight Lives

The first answer to a discovery question is almost always the polished, safe version. The real insight is one probing follow-up away. Never let a shallow answer stand unprobed on a priority gap.

**Concrete example:**

> **Q:** "What's driving the timing of looking at this now?"
> **Shallow answer:** "We just think it's time to modernize our process."
> **Shallow follow-up (don't do this):** "Got it, makes sense. So when would you want to start?"
> **Probing follow-up (do this instead):** "What happened recently that made 'modernize' turn from a someday idea into something you're actively looking at this month?"
> **What that surfaces:** "Honestly, we failed an audit last quarter because our paperwork wasn't compliant, and the director wants it fixed before the next one." — This is a real Timeline gap-filler AND a Need gap-filler AND names an Economic Buyer, in one follow-up.

**Technique:** after any answer that sounds rehearsed, generic, or purely descriptive, ask one of:
- "What made that become a priority now, specifically?"
- "Can you give me an example of when that happened recently?"
- "What's the actual impact of that — on the team, on the numbers, on you personally?"
- Silence. Let a 2-3 second pause sit after their answer before you speak — prospects often add the real detail to fill the gap themselves.

---

## Phase 5: Ending the Call — Always Leave With a Calendared Next Step

"I'll follow up" is not a next step — it has no date, no owner, and no mutual commitment, so it dies in both calendars simultaneously.

**Strong call-close checklist:**
- [ ] A specific next action is named (demo, proposal review, technical call, contract review — not "touch base")
- [ ] A specific date/time is set before hanging up — ideally booked on the calendar live, on the call
- [ ] The next step involves the Economic Buyer or Champion if they weren't on this call (multi-thread, don't single-thread)
- [ ] You've stated what you'll send before the next step (recap, case study, proposal draft) and by when
- [ ] You've asked directly: "Is there anything that would stop this from moving forward at this point?" — surfaces hidden objections before they fester silently
- [ ] The prospect said the next step out loud, not just you — verbal commitment increases show-up rate

If the prospect resists locking a date ("let me check my calendar and get back to you"), that itself is a signal — treat it as a Timeline or Authority red flag and note it in CALL-RECAP.md rather than ignoring it.

---

## Phase 6: Post-Call — Recap and Routing

### 6.1 Same-day recap email template

Send within a few hours, while the conversation is fresh for the prospect too.

```
Subject: Recap + next steps — [Company] x [Your Company]

Hi [Name],

Great talking today. Quick recap so we're aligned:

What you shared:
- [Pain point / need, in their words]
- [Relevant metric or impact they mentioned]
- [Timeline driver they named]

What we covered:
- [The specific capability/solution angle discussed, tied to what they said]

Next step:
- [Specific action] on [specific date/time] — [who's involved]
- I'll send [artifact] by [date] beforehand so we make the most of it.

Let me know if I got anything wrong above, or if anything changes before then.

[Your name]
```

### 6.2 Route the outcome

| Call outcome | Route to |
|---|---|
| Genuinely interested, gaps filled, next step locked | Re-run **caq-discovery-coach** to prep the next call, or hand off to proposal/deal-desk work if the org has one |
| Interested but a specific objection surfaced (price, timing, competitor, "need to check with team") | **caq-objection-strategist** — hand it the exact objection language used, verbatim |
| Went quiet / non-committal / no real gaps filled / vague on next step | **caq-multichannel-coordinator** — add to a nurture cadence rather than a hard follow-up loop |
| New buying signal surfaced mid-call (funding, reorg, deadline) not previously known | **caq-buying-signal-detector** — update the prospect's signal file before the next touch |
| Discovered the pitch angle used didn't land | **caq-offer-positioning** — revisit the value prop/positioning for this segment before the next call |

---

## Output Template: CALL-PREP.md

```markdown
# Call Prep: [Prospect / Company Name]
**Call date/time:** [date/time]
**Attendees:** [names + titles, ours and theirs]
**Prior artifacts reviewed:** [list what existed, or "None found — generic framework used"]

---

## Gap Map

| Dimension | Status | Evidence so far | Call priority |
|---|---|---|---|
| Budget | Known/Partial/Unknown | [evidence or "none"] | High/Med/Low |
| Authority | Known/Partial/Unknown | [evidence] | High/Med/Low |
| Need | Known/Partial/Unknown | [evidence] | High/Med/Low |
| Timeline | Known/Partial/Unknown | [evidence] | High/Med/Low |
| Metrics | Known/Partial/Unknown | [evidence] | High/Med/Low |
| Decision Criteria | Known/Partial/Unknown | [evidence] | High/Med/Low |
| Decision Process | Known/Partial/Unknown | [evidence] | High/Med/Low |
| Champion | Known/Partial/Unknown | [evidence] | High/Med/Low |

**Top 3 priorities for this call:** [dimension 1], [dimension 2], [dimension 3]

---

## Agenda (30 min)

1. Rapport (2 min) — opener: [specific reference to use]
2. Context-setting (2 min) — agenda to preview: [one line]
3. Discovery (15 min) — see question bank below
4. Tailored mini-pitch (6 min) — capability to lead with: [TBD after discovery, note the hypothesis]
5. Close (5 min) — target next step to propose: [specific action + rough date]

---

## Question Bank (this call, prioritized)

### [Priority gap 1]
- [question]
- [question]

### [Priority gap 2]
- [question]
- [question]

### [Priority gap 3]
- [question]
- [question]

### Champion check (if not already known)
- [question]

---

## Close Checklist
- [ ] Specific next action named
- [ ] Date/time locked live on the call
- [ ] Economic buyer / champion included if absent today
- [ ] Deliverable + deadline stated (what you'll send, by when)
- [ ] Asked "anything that would stop this from moving forward?"
- [ ] Prospect verbally confirmed the next step

---

*Generated by caq-discovery-coach — Complete Client Acquisition System*
```

## Output Template: CALL-RECAP.md

```markdown
# Call Recap: [Prospect / Company Name]
**Call date:** [date]

## Gaps Filled
| Dimension | New info | Confidence |
|---|---|---|
| [dimension] | [what was learned] | High/Medium/Low |

## Key Quotes (their words)
- "[quote]" — re: [what it reveals]

## Objections Surfaced
- [objection, verbatim if possible] → routed to caq-objection-strategist / handled live: [how]

## Next Step
- **Action:** [specific]
- **Date/time:** [locked date]
- **Owner:** [who does what]
- **Deliverable promised:** [what, by when]

## Outcome Routing
- [ ] Interested, advancing → next call prep queued
- [ ] Objection → caq-objection-strategist
- [ ] Went cold → caq-multichannel-coordinator nurture
- [ ] New signal detected → caq-buying-signal-detector update

## Recap Email
Sent: [Y/N] — [date/time]

---

*Generated by caq-discovery-coach — Complete Client Acquisition System*
```

---

## Terminal Summary Block

```
=== DISCOVERY CALL PREP COMPLETE ===

Prospect: [Company Name]
Call: [date/time] with [attendees]

Upstream artifacts found: [N] — [list, or "None — generic framework used"]

Gap Map:
  Budget:            [Known/Partial/Unknown]
  Authority:         [Known/Partial/Unknown]
  Need:              [Known/Partial/Unknown]
  Timeline:          [Known/Partial/Unknown]
  Metrics:           [Known/Partial/Unknown]
  Decision Criteria: [Known/Partial/Unknown]
  Decision Process:  [Known/Partial/Unknown]
  Champion:          [Known/Partial/Unknown]

Top 3 call priorities: [gap], [gap], [gap]

Agenda: Rapport(2) → Context(2) → Discovery(15) → Mini-pitch(6) → Close(5)

Close checklist reminder: leave with a CALENDARED next step, not "I'll follow up."

Full prep saved to: CALL-PREP.md
Post-call, run this skill again (or ask for a recap) to produce: CALL-RECAP.md
```

---

## Error Handling

- **No upstream artifacts exist for this prospect at all:** do not block or refuse. Ask the user for whatever they know in 60 seconds (company name, industry, why the call got booked), then run the full Phase 1-5 framework generically: mark every BANT/MEDDIC dimension Unknown, prioritize Budget, Authority, Need as the top 3 by default, and use the question bank as-is. Note explicitly in CALL-PREP.md: "No prior research found — generic discovery framework applied. Consider running caq-prospect-researcher before the next call with this prospect."
- **Call is less than 30 minutes:** compress proportionally — keep rapport at 1-2 min and close at minimum 4-5 min regardless of total length; the close is the least compressible segment.
- **Multiple stakeholders on the call with different roles:** split the question bank mentally by who can answer what (economic buyer gets Budget/Authority questions, end-user gets Need questions) rather than asking the whole room the same list.
- **User asks for prep with no specific prospect named:** ask which prospect/company before proceeding — this skill's entire value is tailoring to a specific deal, not generic call-skills coaching.

---

## Related Skills (Complete Client Acquisition System)

Phases: TARGET → POSITION → REACH → ATTRACT → CONVERT. This skill is the last stop in CONVERT.

| Skill | Phase | Handoff relationship to caq-discovery-coach |
|---|---|---|
| **caq-icp-architect** | TARGET | Defines the ICP used to sanity-check fit signals heard on the call |
| **caq-prospect-researcher** | TARGET | Source of `COMPANY-RESEARCH.md` — run this first if no research exists for the prospect |
| **caq-lead-scoring** | TARGET | Source of BANT/MEDDIC scores — pre-populates the gap map directly; also the score to re-run after the call with new info |
| **caq-pain-point-builder** | POSITION | Source of `PAIN-POINTS.md` — hypotheses to validate (not re-discover) in the Need questions |
| **caq-offer-positioning** | POSITION | Feed back to this skill if the tailored mini-pitch angle didn't land on the call |
| **caq-outreach-angles** | REACH | Source of the angle that got this call booked — reuse as the rapport opener |
| **caq-multichannel-coordinator** | REACH | Receives "went cold" outcomes for nurture sequencing |
| **caq-buying-signal-detector** | ATTRACT | Source of `BUYING-SIGNALS.md` for the Timeline gap; also receives new signals surfaced mid-call |
| **caq-objection-strategist** | CONVERT | Receives any objection surfaced on the call, verbatim, for a tailored response strategy |
| **caq-discovery-coach** (this skill) | CONVERT | Re-invoke for the next call in a multi-call sales cycle — CALL-RECAP.md becomes the new prior artifact |

Remaining suite skills (caq-prefixed, not directly in this handoff chain) may still hold relevant context — check the working directory for any `caq-*` output artifact naming this prospect before starting Phase 1.
