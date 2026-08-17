---
name: caq-cold-email-builder
description: Cold Email Campaign Builder — builds a complete multi-touch cold email SEQUENCE (typically 3-6 emails over 2-3 weeks), not a single email. Use when the user says "build a cold email sequence", "email campaign", "follow-up sequence", "drip campaign", "write a 5-email sequence", "cadence", "nurture sequence", "outbound email campaign", "multi-touch sequence", "sequence of follow-ups", "chain of emails", or asks for "a series of emails" / "a set of follow-ups" rather than one email. Also trigger on "break-up email plus the emails before it", "what should I send if they don't reply", or "map out my outreach cadence". Consumes OUTREACH-ANGLES.md, POSITIONING.md, and PAIN-POINTS.md when present. Skill #8 of 15 in the Complete Client Acquisition System (caq- suite) — phase REACH. For a single one-off cold email, use the generic `cold-email` skill instead — this skill is exclusively for building the full sequence with branching reply logic.
---

# Cold Email Campaign Builder (caq-cold-email-builder)

ROLE: **Cold Email Campaign Builder** — phase **REACH** of TARGET → POSITION → REACH → ATTRACT → CONVERT.

Purpose: build a complete multi-touch cold email SEQUENCE (typically 3-6 emails spaced over 2-3 weeks) using upstream artifacts — `OUTREACH-ANGLES.md`, `POSITIONING.md`, `PAIN-POINTS.md` — with subject line variants per touch, an escalating/varying angle across touches, a break-up email, and branch logic for what to send depending on how the prospect behaves (opens, ignores, objects, replies interested).

**This is not the `cold-email` skill.** The generic `cold-email` skill (installed separately, not part of this suite) writes one email — or occasionally a short follow-up pair — well, for a single prospect, single situation. This skill exists because a *sequence* is a different artifact: it has architecture (which touch does what job), inter-email dependency (touch 3 must not repeat touch 1's angle), and branching (the sequence forks based on prospect behavior). If the user just wants "write me a cold email," send them to `cold-email`. If they want "a sequence," "a campaign," "a cadence," or "follow-ups plotted out," that's this skill. When in doubt: one message = `cold-email`; more than one message with logic connecting them = this skill.

---

## Before Building: Gather Upstream Inputs

Check for these files in the working directory before writing anything. Read whichever exist — do not ask the user to re-supply information already captured upstream.

| File | What it feeds into this skill |
|------|-------------------------------|
| `OUTREACH-ANGLES.md` | The distinct angles/hooks to spread across touches so touch 2 doesn't repeat touch 1 |
| `POSITIONING.md` | The value proposition and differentiation language for the value-add and direct-ask touches |
| `PAIN-POINTS.md` | Specific pain language for personalization and the "if reply = objection" branch |
| `COMPANY-RESEARCH-[COMPANY].md` | Named contacts, trigger events, dated signals for personalization tokens |
| `LEAD-QUALIFICATION.md` or lead score | Whether this prospect earns a 6-touch full sequence or a lighter 3-touch version (see Sequence Length below) |

If none of these exist, do not stall — proceed with **Error Handling → No Personalization Data** below, and say so explicitly in the output.

---

## 1. Sequence Architecture

A sequence is not "email 1, email 2, email 3" — each touch has a **job**. Build the sequence around these strategic slots, not arbitrary content:

| Touch | Day (typical) | Strategic Purpose | What changes vs. the touch before |
|-------|---------------|--------------------|-----------------------------------|
| **1 — Hook** | Day 1 | Earn the first open and reply. Lead with the single sharpest personalized signal (trigger event, pain point, or specific observation). One ask: a reply or a 15-min call. | N/A — this sets the angle baseline |
| **2 — Value-add** | Day 3 | No ask (or a very soft one). Deliver something useful on its own — an insight, a benchmark, a relevant resource — so the prospect gets value even if they never reply. Rebuilds attention without feeling like a nag. | Different angle from touch 1; proves you're not a one-note pitch |
| **3 — Social proof** | Day 7 | Reduce risk. Reference a specific, similar customer/result (same industry/size/problem ideally). Reintroduce the ask, framed around the proof. | Shifts from "here's a problem" to "here's proof it's solvable" |
| **4 — Direct ask** | Day 12 | Cut the subtlety. Short, plain, one direct question ("Worth 15 minutes on Tuesday or Thursday?"). Works because it contrasts with the softer touches before it. | Tone shift: shortest, most direct email in the sequence |
| **5 — Pattern interrupt** | Day 16 | Break the pattern deliberately — a different format (a short video link, a one-line question with no pitch, a relevant news mention with no ask) to cut through inbox fatigue from 4 similar-looking emails. | Format changes, not just angle |
| **6 — Break-up** | Day 18-21 | Give permission to say no. "Should I close the loop on this?" framing. Counterintuitively often the highest-reply-rate email in the sequence — removes pressure, triggers loss aversion or guilt-driven replies. | Explicitly ends the sequence; sets up the re-engagement path |

**Why this spacing:** short gaps early (day 1 → 3) capture momentum while the first touch is still fresh; gaps widen later (7 → 12 → 16 → 18) because a prospect who hasn't engaged by day 7 needs new information or a new angle, not just a reminder — cramming reminders closer together reads as spam and burns the domain's sending reputation for nothing.

### Sequence length by lead grade

Don't force 6 touches on every prospect — match sequence length to qualification signal if `LEAD-QUALIFICATION.md` or a lead grade is available:

| Lead Grade | Recommended Sequence | Reasoning |
|-----------|----------------------|-----------|
| A (SQL) | 3-4 touches, compressed to 10-12 days | High-fit prospect — a long drip risks a competitor closing first; front-load value and ask |
| B (MQL) | Full 5-6 touch sequence over 18-21 days | Standard nurture-to-reply cadence, gives time to warm |
| C (IQL) | 3 touches then fold into long-term nurture (not this skill — hand to lifecycle/nurture) | Don't over-invest sequence design on cold, unqualified accounts |
| No grade available | Default to the full 6-touch, 21-day sequence | Safe default when no qualification signal exists |

---

## 2. Subject Line Guidance

Write **3-5 subject line variants per email**, each pulling a different psychological lever. Never ship a single subject line per email — mobile inboxes are won or lost in under two seconds, and testing between variants (or picking the best fit for the persona) meaningfully changes open rates.

| Variant type | Pattern | Rationale | Example |
|---|---|---|---|
| **Curiosity** | Incomplete thought, no verb-object payoff given away | Makes the subject line unresolvable without opening | "quick question about [Company]'s [process]" |
| **Direct/plain** | States exactly what's inside, no hook | Works well for senior/busy titles who filter by relevance, not intrigue; also reads as less salesy | "[Company] + [Their pain] — 15 min?" |
| **Personalized** | Names a specific fact only true of them | Signals this isn't a blast; highest open rate when the fact is real and current | "saw the [trigger event] news — congrats" |
| **Low-key/lower-case** | All lowercase, looks like an internal note or a reply | Exploits pattern-matching against real human email; use sparingly, can read as gimmicky if overused across many prospects at once | "re: [topic]" |
| **Number/specific** | Contains a concrete number or timeframe | Concreteness reads as credible over vague claims | "3 things we noticed about [Company]'s [process]" |

Per email in the sequence, pick 3-5 of these variant types (not all five need appear in every touch) and note *why* that mix fits this touch's purpose — e.g., touch 1 leans personalized + curiosity to earn the first open; touch 6 (break-up) leans direct + a slight curiosity ("closing the loop?") because bluntness matches the "break-up" register.

---

## 3. Email Body Writing Principles

- **Short.** Cold email opens on a phone first. Cap most touches at 60-120 words; even the social-proof touch (naturally longer) should stay under 150. If it needs scrolling, cut it.
- **One clear CTA per email.** Never stack "reply, or book a call, or check out this link" in one email — a menu of asks lowers response rate versus a single clear one. The CTA should match the touch's purpose (touch 1: a reply/quick call; touch 2: often no ask at all; touch 4: an explicit two-option time pick).
- **No attachments on email 1 (or ever, ideally).** Attachments hurt deliverability (many filters flag or strip them) and cold prospects won't open an attachment from an unknown sender regardless. Link to a hosted resource instead if something concrete must be shared.
- **Mobile-first formatting.** Short paragraphs (1-3 sentences), no walls of text, no more than one link per email after touch 1, plain sign-off. Avoid heavy formatting (bullets are fine sparingly; avoid tables, bold-everywhere, multiple fonts/colors).
- **Personalization tokens — pull from `OUTREACH-ANGLES.md` specifically, not generic mail-merge fields.** A real personalization token references something only true of this prospect: a named trigger event, a specific job posting, a quote from their content, a named competitor they use. `{{first_name}}` alone is not personalization — it's the bare minimum and reads as such.
- **Sound like a peer, not a pitch deck.** Contractions, plain verbs, no marketing adjectives ("cutting-edge," "revolutionary," "seamless"). Read every draft aloud — if it sounds like copy, rewrite it.

---

## 4. Branch Logic — What to Send Based on Prospect Behavior

A sequence isn't linear once a prospect does anything. Build these forks explicitly rather than letting every prospect ride the same 6 emails to the end regardless of signal.

| Prospect behavior | What it means | Next action |
|---|---|---|
| **Opens, no reply** (repeatedly, tracked via open rate if available) | Interested enough to look, not yet convinced to act | Continue the sequence as scheduled, but consider pulling touch 5 (pattern interrupt) forward — repeated opens without reply suggest the angle is close but the ask or proof isn't landing yet |
| **No open at all** by touch 3 | Subject line isn't earning attention, or wrong inbox/deliverability issue | Rotate to a different subject-line variant type for the remaining touches (e.g. switch from curiosity to direct); verify the email didn't land in spam (see Deliverability below) before assuming it's a messaging problem |
| **Replies with an objection** ("not interested," "no budget," "already have a vendor," "not the right time") | Live engagement — the sequence's job is done, this becomes a live conversation | **Stop the automated sequence immediately.** Hand off to **caq-objection-strategist** to craft the specific objection response. Do not let a scheduled touch 4 go out on top of a live reply thread — this is the single most common automation embarrassment in cold outreach |
| **Replies interested** ("tell me more," "yes let's talk," asks a question) | Sequence has converted its job — move to live selling | **Stop the sequence.** Hand off to **caq-discovery-coach** to run the actual qualifying conversation. Do not keep sending scheduled touches into a thread that's already live |
| **Bounces / auto-reply (OOO, wrong person)** | Deliverability or targeting issue, not a message-quality issue | If OOO with a return date, pause and resume after that date rather than continuing blind. If hard bounce, remove from sequence and flag the contact record as stale — do not retry the same address |
| **Unsubscribes / asks to stop** | Explicit opt-out | Stop immediately, suppress the contact from all future touches in this and any other active caq- sequence — this is a compliance requirement, not just good practice |

---

## 5. Deliverability Basics

Brief — cover these, don't turn this into a full deliverability audit:

- **Avoid spam trigger words and patterns** in subject and body: excessive exclamation points, ALL CAPS, "free," "guarantee," "act now," "$$$", too many links. One link per email after the first touch is a safe ceiling.
- **Plain text (or near-plain) over heavy HTML.** Image-heavy or heavily-styled HTML emails trigger more spam filtering and look more like marketing blasts than a real one-to-one message. A signature with a logo is fine; a full HTML template is not.
- **Warm up sending volume and domain reputation before scaling.** New domains/inboxes sending high volume immediately get flagged. Ramp gradually and keep an eye on bounce/complaint rates — if either spikes, pause and investigate before continuing to send.
- **Don't send from a brand-new domain the same week it's registered** — DNS/SPF/DKIM/DMARC records need time to establish trust; sending high volume immediately reads as spammy to mail providers regardless of content quality.
- This is not the skill to go deep on inbox infrastructure setup — flag it as a caveat and move on unless the user specifically asks for a deliverability audit.

---

## 6. Output Template: COLD-EMAIL-SEQUENCE.md

```markdown
# Cold Email Sequence: [Company/Segment Name]
**Date built:** [date]
**Target:** [persona/title, company, or segment this sequence targets]
**Lead grade / sequence length:** [A/B/C/D — X-touch sequence over Y days]
**Personalization tier:** [Custom — built from OUTREACH-ANGLES.md + COMPANY-RESEARCH | Template-tier — ICP-level pain-based, no prospect-specific data available]

---

## Sequence Overview

| Touch | Day | Purpose | Subject Line Theme |
|-------|-----|---------|---------------------|
| 1 | Day 1 | Hook | [theme] |
| 2 | Day 3 | Value-add | [theme] |
| 3 | Day 7 | Social proof | [theme] |
| 4 | Day 12 | Direct ask | [theme] |
| 5 | Day 16 | Pattern interrupt | [theme] |
| 6 | Day 18-21 | Break-up | [theme] |

---

## Email 1 — Hook (Day 1)

**Purpose:** [one line — what this email must accomplish]

**Subject line variants:**
1. [Curiosity] — "[subject]"
2. [Personalized] — "[subject]"
3. [Direct] — "[subject]"

**Body:**
```
[full email body — 60-120 words, one CTA]
```

**Personalization tokens used:** [list — e.g. {{trigger_event}}, {{named_contact}}, {{specific_pain}}]

---

## Email 2 — Value-Add (Day 3)

**Purpose:** [one line]

**Subject line variants:**
1. [type] — "[subject]"
2. [type] — "[subject]"
3. [type] — "[subject]"

**Body:**
```
[full email body]
```

---

## Email 3 — Social Proof (Day 7)

**Purpose:** [one line]

**Subject line variants:**
1. [type] — "[subject]"
2. [type] — "[subject]"
3. [type] — "[subject]"

**Body:**
```
[full email body — includes specific similar-customer reference]
```

---

## Email 4 — Direct Ask (Day 12)

**Purpose:** [one line]

**Subject line variants:**
1. [type] — "[subject]"
2. [type] — "[subject]"

**Body:**
```
[full email body — shortest in sequence, one direct question with 2 time options]
```

---

## Email 5 — Pattern Interrupt (Day 16)

**Purpose:** [one line]

**Subject line variants:**
1. [type] — "[subject]"
2. [type] — "[subject]"

**Body:**
```
[full email body — different format from prior touches]
```

---

## Email 6 — Break-Up (Day 18-21)

**Purpose:** [one line — give permission to say no, close the loop]

**Subject line variants:**
1. [type] — "[subject]"
2. [type] — "[subject]"

**Body:**
```
[full email body — short, closes the loop, sets re-engagement expectation]
```

---

## Branch Logic Reference

| Behavior | Action |
|----------|--------|
| Opens, no reply | Continue sequence; consider pulling touch 5 forward |
| No open by touch 3 | Rotate subject line variant type; check deliverability |
| Replies — objection | STOP sequence → hand off to `caq-objection-strategist` |
| Replies — interested | STOP sequence → hand off to `caq-discovery-coach` |
| Bounce / OOO | Pause or remove per bounce type |
| Unsubscribe | Stop immediately, suppress from all sequences |

## Deliverability Notes
[Any specific flags for this sequence — spam-trigger words caught and fixed, link count check, sending domain warm-up status if known]

## Personalization Tier & Data Gaps
[State plainly whether this is Custom-tier (built from real upstream research) or Template-tier
(ICP-level, no prospect-specific data was available) — see Error Handling. List what
data would upgrade a Template-tier sequence to Custom-tier.]

---
*Generated by caq-cold-email-builder — phase REACH*
```

---

## 7. Terminal Summary

```
=== COLD EMAIL SEQUENCE BUILT ===

Target:          [persona/company/segment]
Lead grade:      [A/B/C/D or "not scored"]
Sequence length: [X touches over Y days]
Personalization: [Custom-tier | Template-tier]

Touch map:
  1. Hook             (Day 1)   — [subject theme]
  2. Value-add        (Day 3)   — [subject theme]
  3. Social proof     (Day 7)   — [subject theme]
  4. Direct ask        (Day 12)  — [subject theme]
  5. Pattern interrupt (Day 16)  — [subject theme]
  6. Break-up          (Day 18-21) — [subject theme]

Subject line variants written: [X] total across [Y] emails
Personalization tokens used: [list, or "none — template tier"]

Branch logic configured for: opens-no-reply, no-open, objection-reply, interested-reply,
bounce/OOO, unsubscribe

Deliverability check: [Pass / Flags noted — see report]

Full sequence saved to: COLD-EMAIL-SEQUENCE.md

Recommended next step: [e.g. "hand to caq-multichannel-coordinator to interleave with
LinkedIn touches" | "sequence is ready to load into sending tool"]
```

---

## 8. Error Handling

- **No personalization data available (no `OUTREACH-ANGLES.md`, no `COMPANY-RESEARCH-*.md`, no lead-specific research at all):** Do not stall waiting for it. Fall back to strong **ICP-level, pain-based copy** — use whatever ICP definition exists (`ICP.md`/`IDEAL-CUSTOMER-PROFILE.md` if present, otherwise ask one clarifying question about the target segment) and write the sequence around the segment's most common, validated pain points rather than fake-personalizing with placeholder tokens. **Explicitly label the output "Template-tier" in both the file header and terminal summary** — never let a template-tier sequence pass as custom-tier. This distinction matters downstream: a template-tier sequence should get lighter volume commitments and closer monitoring, since it hasn't been validated against this specific prospect's real signals.
- **Upstream files exist but are thin or stale:** Use what's there, note explicitly in Data Gaps which sections had to be filled with segment-level defaults instead of prospect-specific data.
- **User wants a sequence for a single named prospect but no company research exists yet:** Recommend running `caq-prospect-researcher` first if there's time; if not, proceed at Template-tier and say so.
- **User only wants one email, not a sequence:** Redirect them to the `cold-email` skill — this skill's output template and branch logic add unnecessary overhead for a single email ask.
- **Sequence length requested conflicts with lead grade guidance (e.g. user demands 6 touches for a clearly low-fit prospect):** Build what's asked, but flag the mismatch in the terminal summary — don't silently override the user's request, but don't hide the concern either.
- **No sending tool / deliverability context available:** Note in the Deliverability section that warm-up status is unknown and recommend the user confirm domain health before sending at volume.

---

## Related Skills — Complete Client Acquisition System (caq- suite)

This is skill 8 of 15, phase REACH. Closest handoffs:

- **caq-outreach-angles** — primary upstream input. Supplies the distinct angles that get distributed across the 6 touches so each one feels different rather than repeating the same hook. Always check for `OUTREACH-ANGLES.md` first.
- **caq-offer-positioning** — upstream. Supplies `POSITIONING.md` — the value proposition and differentiation language used in the value-add (touch 2) and direct-ask (touch 4) emails.
- **caq-pain-point-builder** — upstream. Supplies `PAIN-POINTS.md` — validated pain language, essential for both Custom-tier personalization and Template-tier fallback copy.
- **caq-prospect-researcher** — upstream. Supplies named contacts and dated trigger events used as personalization tokens; run this first if a specific target company has no dossier yet.
- **caq-linkedin-strategist** — sibling REACH-phase skill. Builds the parallel LinkedIn touch sequence; hand off to **caq-multichannel-coordinator** to interleave email and LinkedIn timing rather than running both blind to each other.
- **caq-multichannel-coordinator** — downstream orchestrator. Takes this sequence plus the LinkedIn sequence and any other channel plans and sets the combined send calendar so touches don't collide or contradict each other.
- **caq-objection-strategist** — downstream branch target. Every "replies — objection" fork in this sequence hands off here; do not attempt to write objection-handling copy inside this skill's templates — that's a live-conversation skill, not a scheduled-sequence skill.
- **caq-discovery-coach** — downstream branch target. Every "replies — interested" fork hands off here to run the actual qualifying conversation once the sequence has done its job.
- **`cold-email` (generic, non-suite skill)** — the one-off counterpart. Use `cold-email` for a single email or an ad-hoc two-email follow-up written for one specific situation; use this skill when the ask is a structured, multi-touch, branching campaign built from the caq- research pipeline. If unsure which was meant, ask "is this one email, or a full sequence?" — the answer routes directly to one skill or the other.
- **caq-icp-architect** — indirect upstream. If no prospect-specific research exists at all, this skill falls back to the ICP definition this skill produces (see Error Handling).
- **caq-lead-scoring** — indirect upstream. Its grade output determines recommended sequence length (see Sequence Length by Lead Grade).
- **caq-buying-signal-detector** — indirect upstream. Trigger events it surfaces are prime material for touch 1's hook and touch 5's pattern interrupt.
- **caq-authority-content** — occasional input source. If a relevant piece of content/thought-leadership exists, touch 2 (value-add) can link to it instead of writing net-new value content.
- **caq-lead-magnet-builder** — occasional input source. An existing lead magnet can serve as touch 2's value-add offer instead of writing a fresh insight from scratch.

---

*caq-cold-email-builder — Complete Client Acquisition System, skill 8/15, phase REACH*
