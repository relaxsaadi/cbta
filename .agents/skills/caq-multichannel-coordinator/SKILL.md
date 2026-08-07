---
name: caq-multichannel-coordinator
description: Orchestrates email, LinkedIn, phone, voicemail, video, and direct mail into ONE coordinated cadence per prospect instead of disconnected parallel campaigns that collide, duplicate, or annoy the prospect. Use when the user says "coordinate my outreach across channels", "sequence email and LinkedIn together", "multi-channel campaign", "when should I call vs email vs LinkedIn", "orchestrate outreach", "build a cadence", "my touches are colliding", "I'm juggling email, LinkedIn, and phone and it's a mess", "what channel next", "should I add phone to this sequence", or whenever email/LinkedIn/phone/content outreach for the same prospect list is being run without a shared timeline. Produces MULTICHANNEL-CADENCE.md.
---

ROLE: **Multi-Channel Outreach Coordinator** — phase: REACH (of TARGET → POSITION → REACH → ATTRACT → CONVERT).

This skill is the orchestration layer sitting above `caq-cold-email-builder` and `caq-linkedin-strategist` (plus phone, voicemail, video, and direct mail touches). Its job is to sequence those channels into ONE coherent, prospect-level timeline — not to write the touches themselves. Running email and LinkedIn as separate, un-synced campaigns is the single most common cause of prospects feeling spammed: two "just checking in" messages arrive the same morning, a phone call lands the day after a connection request was ignored, and nobody owns the decision of what happens next. This skill fixes that by making sequencing a first-class deliverable.

---

## Phase 1: Determine the Channel Mix

Not every prospect deserves every channel. Channel investment should scale with deal size and reachability — pouring 7 touches across 4 channels into a $500 SMB deal wastes rep hours that a $50K ABM target needs.

### 1.1 Channel-Mix Decision Table

| ICP Tier / Segment | Deal Size | Seniority | Channel Mix | Rationale |
|---|---|---|---|---|
| **Tier 1 — Strategic ABM** | $25K+ ACV | VP/C-suite, economic buyer | Email + LinkedIn + Phone + Video message + Direct mail (optional) | High deal size justifies rep time per touch; senior buyers respond to personalized, multi-sensory outreach; direct mail cuts through inbox fatigue at this level |
| **Tier 2 — Core mid-market** | $5K–25K ACV | Director/Manager | Email + LinkedIn + Phone | Phone still economical per-deal; LinkedIn builds social proof; skip video/mail — diminishing ROI on time invested |
| **Tier 3 — Long-tail SMB** | <$5K ACV | Manager/individual contributor | Email + LinkedIn only | Volume-driven; phone time doesn't pencil out per account; automate where possible |
| **Tier 4 — Inbound-adjacent / warm** | Any | Any | Email + 1 LinkedIn touch | They already know you exist; over-sequencing reads as desperate |
| **Re-engagement / dormant** | Any | Any | LinkedIn (low-pressure) + 1 email | Rebuilding contact, not opening a new full-court press |

**How to apply it:** Pull the tier from `caq-lead-scoring` output if it exists (Grade A/B/C/D maps roughly to Tier 1/2/3/4). If no scoring exists, ask the user for deal size and seniority, or infer from company size and title.

### 1.2 Channel Selection Principles

- **Email is the backbone** for every tier — it's async, scales, and creates a paper trail the prospect can forward internally.
- **LinkedIn adds a human face** and works especially well as touch 1 (profile view) or touch 2 (connection request) before email lands, warming the name.
- **Phone earns its place** only above a deal-size threshold, or when signals (see Phase 3) indicate high intent — cold-calling a $2K deal at scale is a time sink.
- **Video messages** (Loom-style) are a Tier 1 escalation tool, not a default — reserve for after at least one prior touch has landed, so the prospect has context for who's on screen.
- **Direct mail** is optional and slow (5-10 day lead time) — plan it only for Tier 1 and only if the cadence has runway (3+ weeks).

---

## Phase 2: Build the Unified Cadence

### 2.1 The One-Touch-Per-24-48h Rule

**Rule:** No prospect receives more than one meaningful touch in any 24-48 hour window, across ALL channels combined.

**Why this matters:**
- A same-day email + LinkedIn connection request reads as a coordinated ambush, not organic interest — it kills the "I just came across your profile" credibility of the LinkedIn touch.
- Pacing mimics how a real, busy professional would naturally reach out — not a bot blasting every channel at once.
- It gives each touch room to be *seen and considered* before the next one arrives; touches stacked same-day get skimmed together and discounted as a single "spam event" rather than read as two separate signals of genuine interest.
- It protects deliverability — many email tools and LinkedIn's own systems throttle or flag accounts that show bursty, multi-channel-same-target patterns as automated.

**Application:** When merging an email sequence (from `caq-cold-email-builder`) and a LinkedIn sequence (from `caq-linkedin-strategist`), do NOT simply concatenate their day-numbers. Interleave them so gaps of at least 1 full day (24-48h) separate every touch, and no two touches land on the same calendar day.

### 2.2 Unified Cadence Template (Tier 1 — full mix, 21 days)

| Day | Channel | Touch Purpose | Asset/Reference |
|---|---|---|---|
| 0 | LinkedIn | Profile view + follow (no message) | Passive warm-up signal |
| 2 | Email | Touch 1 — opener, pain hypothesis | `caq-cold-email-builder` Email 1 |
| 4 | LinkedIn | Connection request with 1-line personalized note | `caq-linkedin-strategist` Connect note |
| 7 | Phone | Call 1 — voicemail if no answer, reference the email | Voicemail script (Phase 2.4) |
| 9 | Email | Touch 2 — value-add (case study/resource), reply to thread 1 | `caq-cold-email-builder` Email 2 |
| 12 | LinkedIn | Comment on a recent post OR send a value-add DM if connected | `caq-linkedin-strategist` engagement touch |
| 15 | Phone | Call 2 — different angle, ask for 15 min | Voicemail script variant B |
| 17 | Email | Touch 3 — break-up email or new angle | `caq-cold-email-builder` Email 3 |
| 20 | Video | Personalized 60-90s Loom recapping value prop | Video message script (Phase 2.5) |
| 21 | Decision point | Escalate, de-escalate, or stop per Phase 3/4 | — |

### 2.3 Unified Cadence Template (Tier 2 — email/LinkedIn/phone, 14 days)

| Day | Channel | Touch Purpose | Asset/Reference |
|---|---|---|---|
| 0 | Email | Touch 1 — opener | Email 1 |
| 3 | LinkedIn | Connection request, personalized note | Connect note |
| 6 | Phone | Call 1 — voicemail if no answer | Voicemail script |
| 8 | Email | Touch 2 — value-add | Email 2 |
| 11 | LinkedIn | Reply/comment engagement | Engagement touch |
| 13 | Email | Touch 3 — break-up email | Email 3 |
| 14 | Decision point | Escalate, de-escalate, or stop | — |

### 2.4 Unified Cadence Template (Tier 3 — email + LinkedIn only, 10 days)

| Day | Channel | Touch Purpose | Asset/Reference |
|---|---|---|---|
| 0 | Email | Touch 1 — opener | Email 1 |
| 2 | LinkedIn | Connection request | Connect note |
| 5 | Email | Touch 2 — value-add | Email 2 |
| 8 | LinkedIn | Light engagement (like/comment) | Engagement touch |
| 10 | Email | Touch 3 — break-up | Email 3 |
| 10 | Decision point | Stop or nurture | — |

### 2.5 Voicemail Script Skeleton (used at phone touches)

> "Hi [Name], this is [Rep] from [Company]. I sent you a note last week about [specific pain/topic] — no pressure to call back, but if [outcome] is on your radar for [their team], I'd love 15 minutes. My number is [phone], or just reply to the email thread. Thanks, [Name]."

Keep under 20 seconds. Never re-pitch the full offer in a voicemail — reference the email so the two touches reinforce each other rather than repeating.

### 2.6 Video Message Skeleton (Tier 1 escalation)

Structure: (1) Name + reference to prior touches by name ("I know I've sent a couple notes...") (2) One specific, researched detail about their company (3) The single clearest value point (4) Soft CTA ("Worth 15 minutes?"). Keep to 60-90 seconds — longer reads as a low-value mass-send despite being personalized.

---

## Phase 3: Signal-Based Branching

Static cadences are a starting point, not a script to run blind. Branch based on engagement signals collected after each touch.

### 3.1 Escalation Triggers (add a channel / increase intensity)

| Signal | Action | Rationale |
|---|---|---|
| Email opened 3+ times, no reply | Add a phone touch within 48h | High interest, missing a nudge to convert to a reply |
| LinkedIn profile viewed back, no connection accepted | Send a soft, no-ask DM if 1st-degree, or a fresh connect note | They're curious but not yet committed — lower the ask |
| Link/attachment clicked in email | Move next touch up by 1-2 days and personalize to the clicked content | Buying-signal timing window is short — strike while warm |
| Reply with a question (not a full "no") | Escalate to phone/video immediately, pause remaining scripted touches | A question is an invitation to a real conversation — don't let a templated email answer it |
| Referred internally (email forwarded, CC'd colleague) | Add the new contact to the cadence at Day 0, keep original contact's cadence running | New buying-committee member detected — treat as a fresh parallel track |

### 3.2 De-escalation Triggers (pause / slow down)

| Signal | Action | Rationale |
|---|---|---|
| No opens across 2 consecutive email touches | Pause email, shift weight to LinkedIn only for one cycle | Deliverability or targeting issue — sending more of the same channel won't fix it |
| "Not the right time" reply | Pause all channels, schedule single re-engagement touch at stated future date | Respects their stated timeline; over-touching after this reply burns the contact |
| Wrong-person signal (bounced role, OOO auto-reply naming a successor) | Stop cadence for this contact, redirect to successor at Day 0 | Continuing wastes touches on a dead contact |
| 3 touches with zero engagement (no opens, no views, no replies) | Drop to lowest-effort channel (LinkedIn like/follow only) for 1 more cycle, then stop | Diminishing returns; further phone/video effort here is misallocated |

---

## Phase 4: Stop and Handoff Rules

### 4.1 When to Stop the Sequence

- **Explicit "no"** — any clear decline ("not interested", "please remove me"). Stop immediately, all channels, no exceptions.
- **3x no-response** across a full cadence cycle with zero engagement signals (no opens, no views, no clicks). Stop active outreach; move to nurture.
- **Out-of-office / wrong-person confirmed** with no successor identified. Stop; flag account for re-research in 90 days.
- **Deal disqualified** by other means (e.g., `caq-lead-scoring` re-grades them D, budget confirmed absent). Stop; do not restart without new trigger event.

### 4.2 Where to Route on Stop

| Outcome | Route To | Why |
|---|---|---|
| Positive reply / wants to talk | `caq-discovery-coach` | Hand off to discovery-call prep immediately — don't let the lead sit while more cadence touches queue up |
| Reply with pushback/objection | `caq-objection-strategist` | Objection needs a tailored response, not the next scripted touch in line |
| 3x no-response, no signals | Long-term nurture list (content/newsletter cadence) | Not dead, just not now — revisit on trigger events |
| Explicit no | Suppression list | Legal/reputational hygiene — never re-add without explicit re-opt-in |
| Wrong person / OOO | Re-research queue, 90-day recheck | Org may have changed; re-verify contact before any resend |
| Inbound reply of any kind (even a question) | `caq-inbound-handler` first, then branch per its recommendation | Inbound reply changes the rep's posture from prospecting to responding — different rules apply |

---

## Output Format: MULTICHANNEL-CADENCE.md

```markdown
# Multi-Channel Cadence: [Prospect/Segment Name]
**Date:** [current date]
**Tier:** [1/2/3/4] — [label]
**Deal Size Estimate:** [$X ACV]
**Channels in Mix:** [list]
**Cadence Length:** [X days]

---

## Channel Mix Rationale
[1-2 sentences on why this tier/mix was selected, referencing deal size, seniority, and reachability]

## Cadence Timeline

| Day | Channel | Touch Purpose | Asset/Reference | Trigger to Branch |
|---|---|---|---|---|
| [0] | [Email/LinkedIn/Phone/Video/Mail] | [purpose] | [link/doc name] | [what signal would escalate/de-escalate/stop here] |
[... one row per touch ...]

## Branching Rules for This Cadence
- **Escalate if:** [specific signals from Phase 3.1 relevant to this prospect]
- **De-escalate if:** [specific signals from Phase 3.2 relevant to this prospect]
- **Stop if:** [specific signals from Phase 4.1]

## Channel Gaps / Degradations
[Note any channel unavailable for this prospect — e.g., "no phone number found, degraded to email+LinkedIn only" — and what was substituted]

## Handoff Map
| If outcome is... | Route to | Owner action |
|---|---|---|
| Positive reply | caq-discovery-coach | [specific next step] |
| Objection/pushback | caq-objection-strategist | [specific next step] |
| No response x3 | Nurture list | [specific next step] |
| Explicit no | Suppression list | [specific next step] |

---
*Generated by AI Sales Team — `caq-multichannel-coordinator`*
```

---

## Terminal Output

```
=== MULTICHANNEL CADENCE BUILT ===

Prospect/Segment: [name]
Tier: [1/2/3/4] — [label]
Deal Size Estimate: [$X]

Channel Mix: [Email + LinkedIn + Phone + Video] (or subset)
Cadence Length: [X] days | [N] total touches

Touch Schedule:
  Day 0  — [Channel] — [purpose]
  Day 2  — [Channel] — [purpose]
  Day 4  — [Channel] — [purpose]
  ... [remaining touches]

Pacing check: minimum gap between touches = [X]h — [PASS / VIOLATION]

Escalation watch: [top 1-2 signals to monitor]
De-escalation watch: [top 1-2 signals to monitor]
Stop conditions: [explicit no / 3x no-response / wrong-person]

Channel Gaps: [none / e.g. "no phone number — degraded to 2-channel"]

Full cadence saved to: MULTICHANNEL-CADENCE.md
```

---

## Error Handling

- **Missing channel access (e.g., no phone number found):** Do not block the cadence — gracefully degrade to the available channels only (typically email + LinkedIn), remove phone/video rows from the timeline, and explicitly flag the gap in the "Channel Gaps / Degradations" section and terminal output so the rep knows to try to source the missing contact point rather than assuming it was a deliberate exclusion.
- **No LinkedIn profile found:** Degrade to email + phone (if available); note LinkedIn as unavailable rather than silently dropping it.
- **Conflicting existing sequences already running (e.g., a marketing drip is already emailing this contact):** Flag the conflict explicitly and recommend pausing the other sequence before starting this cadence — do not let two systems double-touch the same contact.
- **Uncertain tier/deal size:** Default to Tier 2 (email + LinkedIn + phone) as a moderate, reversible default, and ask the user to confirm deal size for a final mix.
- **No `caq-lead-scoring` output available to pull tier from:** Ask the user directly for deal size and seniority, or state the assumption used and flag it as an assumption in the output.

## Related Skills

- **`caq-cold-email-builder`** — Supplies the actual email copy for each email touch in this cadence. This skill sequences and paces those emails against other channels; it does not write them. Pull the email sequence first, then slot its touches into the unified timeline.
- **`caq-linkedin-strategist`** — Supplies LinkedIn touch copy (connection notes, DMs, engagement approach). Same relationship as email: this skill interleaves LinkedIn's sequence with everything else, respecting the 24-48h pacing rule.
- **`caq-outreach-angles`** — Use upstream of this skill to determine the messaging angle/hook that should stay consistent across all channels in the cadence — a prospect should recognize the same core message whether it arrives by email, LinkedIn, or phone.
- **`caq-lead-scoring`** — Provides the tier/grade (A/B/C/D) that drives the channel-mix decision in Phase 1. Run this first when available.
- **`caq-objection-strategist`** — Handoff destination when a prospect replies with pushback rather than a flat no or a positive signal.
- **`caq-discovery-coach`** — Handoff destination when a prospect replies positively and is ready to move to a call; this skill's job ends and discovery prep begins.
- **`caq-inbound-handler`** — First stop for ANY inbound reply during an active cadence, since inbound replies change posture from prospecting to responding; it then routes back into this skill's branching logic or onward to discovery/objection handling.
- **`caq-prospect-researcher`** — Upstream source of company/contact intelligence used to personalize each touch's Asset/Reference column.
