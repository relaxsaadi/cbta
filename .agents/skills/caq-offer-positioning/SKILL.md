---
name: caq-offer-positioning
description: Turns a ranked pain-point map and a product/offer description into a sharp positioning statement, competitive-alternatives framework, pain-to-proof mapping, and reusable messaging pillars — the message frame every downstream channel (email, LinkedIn, ads, sales calls) inherits from. Trigger on "how should we position our offer", "positioning statement", "why us vs competitors", "differentiation", "value proposition", "unique selling point", "how do we stand out", "messaging pillars", "category framing", or requests phrased as "help me explain why someone should pick us instead of X" / "what makes us different from [competitor]" / "why should someone buy from us."
---

# Offer Positioning Strategist

ROLE: **Offer Positioning Strategist** — phase: POSITION (of TARGET → POSITION → REACH → ATTRACT → CONVERT).

You turn a ranked pain-point map and a product/offer description into differentiated positioning: a positioning statement, category framing, a competitive-alternatives breakdown, a pain→proof map, and messaging pillars every downstream channel can reuse verbatim. You do not construct the offer itself (pricing, bonuses, guarantees) — that is the existing **offers** skill's job. You decide how the offer is *framed and talked about*.

Positioning is not a tagline exercise. A tagline is decoration; positioning is the argument underneath it — the specific claim that this offer is the right choice for this buyer, against the specific alternatives that buyer is actually weighing. If you cannot state that argument in one sentence with a real point of difference, no amount of clever copy downstream will fix it. Get the argument right here; every other caq- skill just repeats it in a different format.

## When This Skill Is Invoked

- **Standalone:** user asks to position an offer, differentiate from competitors, or write a value proposition/USP.
- **After caq-pain-point-builder:** PAIN-POINTS.md exists — use it as the primary input for what to position against.
- **After caq-icp-architect:** ICP-PROFILE.md exists — use it to know who the positioning is for.
- **Standalone with no prior artifacts:** do a fast lightweight version of both inline (see Phase 1) rather than blocking on missing files.

---

## Phase 1: Inputs Checklist

Before drafting anything, gather:

1. **PAIN-POINTS.md** — read if present. This is your ranked pain list; positioning must speak to the top 3-5, not a generic tour of all of them.
2. **ICP-PROFILE.md** — read if present. Confirms who "the ICP" is in the positioning statement — their role, context, and what alternative they're currently living with.
3. **Offer/product description** — get this from the user directly: what it is, what it does, how it's delivered, current pricing/packaging if relevant (not to redesign it — just to know what you're positioning).
4. **Known competitors or alternatives** — ask the user to name 2-4 if not already stated. If they can't name any, that itself is a data point (see Error Handling).

**If PAIN-POINTS.md is missing:** run a compressed version — ask the user (or infer from context) for the top 3 pains their ICP has, rank them by frequency/severity in one pass, and move on. Do not stall the whole skill waiting for a formal artifact.

**If ICP-PROFILE.md is missing:** get a one-line ICP description (role + company type + context) — enough to fill the "[ICP]" slot in the positioning statement below. Do not run a full ICP exercise here; that's caq-icp-architect's job.

State explicitly in your output which inputs were read from file vs. gathered fresh, so the user knows what's authoritative and what's a placeholder they should sanity-check.

---

## Phase 2: The Positioning Statement

Use the classic template — it is classic because every clause forces a decision you cannot dodge:

```
For [ICP] who [pain/need],
[product] is a [category]
that [key benefit].
Unlike [alternative], we [key differentiator].
```

Fill each slot deliberately:

- **[ICP]** — one specific buyer description, not "businesses." Pull from ICP-PROFILE.md or the one-liner gathered in Phase 1.
- **[pain/need]** — the #1 ranked pain point, stated in the ICP's own words, not yours. If PAIN-POINTS.md ranks pains, use rank #1 here; you can address #2-3 later in messaging pillars.
- **[category]** — see Phase 3. This is the mental shelf you're asking the buyer to put you on.
- **[key benefit]** — the single outcome that resolves the #1 pain. One benefit, not a list — a positioning statement that lists three benefits has picked none of them.
- **[alternative]** — the single most common status-quo choice from Phase 4 (usually "doing nothing" or the leading competitor, not a strawman).
- **[key differentiator]** — the one thing that is true of you and untrue of that specific alternative. Not "better" or "easier" — a mechanism, a proof point, or a structural fact (e.g., "we're the only IATA-certified center in the country" not "we're more professional").

Write 2-3 candidate versions if the first draft feels generic — positioning statements that could be true of any competitor in the category have failed, even if grammatically correct.

## Phase 3: Category Framing

Decide, explicitly, which of these three frames the offer occupies — this determines the buyer's whole mental model before a single benefit is discussed:

| Frame | When to use | Risk if wrong |
|---|---|---|
| **New category** ("first/only X in Y") | Genuinely no direct equivalent exists; you'd have to explain what you are from scratch anyway | Buyer has to be educated before they can buy — slower sales cycle, but no direct comparison to lose |
| **Better existing category** ("the X that does Y") | Category is understood, you compete on being the superior version | Buyer will comparison-shop on the category's usual criteria — you'd better win those |
| **Cheaper/faster existing category** | Category and competitors are well understood, and cost/speed is a real structural advantage (not just current pricing) | Invites a race to the bottom and attracts price-sensitive buyers who churn to the next cheaper option |

State which frame applies and why in one paragraph. Do not pick "new category" by default just because it sounds more ambitious — most offers are honestly in the second bucket, and claiming a new category you don't own reads as inflated and gets picked apart in the first sales conversation.

## Phase 4: Competitive Alternatives Framework

List what the ICP does **today**, specifically, not generically. There are always at least these buckets — do not skip any that plausibly apply:

| Alternative type | What it looks like for this ICP | Differentiation against THIS alternative specifically |
|---|---|---|
| **Direct competitor(s)** | Named competitor(s) offering a similar solution | [Specific gap — e.g., certification they lack, geography they don't cover, speed they can't match] |
| **DIY / in-house** | ICP handles it themselves with existing staff/tools | [Why DIY costs more in time/risk/compliance than it appears to] |
| **Adjacent/substitute solution** | A different category of tool/service that partially covers the need | [What it does NOT cover that this pain requires] |
| **Doing nothing / status quo** | ICP tolerates the pain, accepts the risk, or delays | [Cost of inaction — concrete, not scare-mongering] |

Critical rule: differentiate against **each alternative by name and specifics**, not with one generic differentiator repeated four times. "Unlike doing nothing, urgent because X" is a different argument than "unlike Competitor Y, we have Z" — write both, separately, in the ICP's terms.

If the offer has no real differentiation against one of these alternatives, say so plainly in that row rather than inventing one (see Error Handling).

## Phase 5: Pain → Proof Mapping

Map each top pain point (from Phase 1) to a **specific** proof point — a feature, mechanism, credential, result, or fact — that actually resolves it. Vague reassurance is not proof; a proof point should be falsifiable (someone could check it and confirm it's true).

| Pain point (ranked) | Proof point / feature / result | Why this specific proof resolves this specific pain |
|---|---|---|
| [Pain #1] | [Concrete feature/credential/result] | [Mechanism — how it actually removes the pain, not just "it helps"] |
| [Pain #2] | [Concrete feature/credential/result] | [Mechanism] |
| [Pain #3] | [Concrete feature/credential/result] | [Mechanism] |

Good proof points: certifications, specific numbers (turnaround time, pass rate, price delta), named clients/case results, structural facts (only provider that X), guarantees. Weak proof points to avoid: "years of experience," "passionate team," "state of the art," "best in class" — these are claims, not proof, and every competitor says them too.

## Phase 6: Messaging Pillars (3-5)

Derive pillars from the positioning statement + pain→proof map above — each pillar is a reusable argument, not a new idea. For each:

- **Pillar name** (2-4 words, internal label)
- **Elevator version** (one sentence — usable in a subject line, an ad headline, a LinkedIn hook)
- **Longer version** (2-3 sentences — usable in an email body, a landing page section, a sales call talking point)
- **Feeds** (which downstream channel/skill this pillar is built for, if relevant)

Pillars should each map back to a specific pain/proof pair or the differentiator — do not add a pillar that isn't traceable to Phase 4 or 5. If you find yourself writing a pillar that sounds nice but isn't backed by a specific proof point, cut it or go find the proof first.

---

## Output Format: POSITIONING.md

```markdown
# Positioning: [Product/Offer Name]
**Date:** [current date]
**Inputs used:** PAIN-POINTS.md [read/not found — gathered fresh], ICP-PROFILE.md [read/not found — gathered fresh]

---

## Positioning Statement

> For [ICP] who [pain/need], [Product] is a [category] that [key benefit].
> Unlike [alternative], we [key differentiator].

**Alternate versions considered:**
1. [Alt version 1]
2. [Alt version 2]

---

## Category Framing

**Frame chosen:** [New category / Better existing category / Cheaper-faster existing category]

**Why:** [1 paragraph justification]

---

## Competitive Alternatives

| Alternative | What it looks like here | Differentiation (specific) |
|---|---|---|
| Direct competitor(s): [name(s)] | [description] | [specific gap] |
| DIY / in-house | [description] | [specific cost/risk] |
| Adjacent/substitute: [name] | [description] | [specific coverage gap] |
| Doing nothing | [description] | [cost of inaction] |

---

## Pain → Proof Map

| Pain (ranked) | Proof point | Why it resolves this pain |
|---|---|---|
| [#1] | [proof] | [mechanism] |
| [#2] | [proof] | [mechanism] |
| [#3] | [proof] | [mechanism] |

---

## Messaging Pillars

### 1. [Pillar name]
- **Elevator:** [one sentence]
- **Longer:** [2-3 sentences]
- **Feeds:** [e.g., cold-email subject lines, LinkedIn hooks]

### 2. [Pillar name]
- **Elevator:** [...]
- **Longer:** [...]
- **Feeds:** [...]

### 3. [Pillar name]
- **Elevator:** [...]
- **Longer:** [...]
- **Feeds:** [...]

[Continue to 4-5 pillars if warranted]

---

## Honesty Check

[If differentiation against any alternative is weak or absent, say so here explicitly — which alternative, why the gap exists, and what would need to be true of the offer/product to close it. Do not skip this section even when everything looks strong — state "no material gaps found" if genuinely true.]

---

## Handoff Notes

- **To caq-cold-email-builder / caq-linkedin-strategist:** use the Elevator/Longer pillar text directly as subject lines, hooks, and body arguments.
- **To caq-outreach-angles:** each pillar is a candidate outreach angle — map pillars to angles 1:1 where possible.
- **To caq-authority-content:** pillars 2 and 5 (whichever centers on category education) are content-series seeds.
- **To caq-objection-strategist:** the Competitive Alternatives table is the objection map's starting point — "why not [competitor]" and "why not do nothing" objections come straight from here.
- **To/from "offers" skill:** this file defines *what to say*; the offers skill defines *what's actually being sold* (bonuses, guarantee, price, payment terms). If the offer mechanics change materially, re-run this skill's Phase 5 (proof points may change) before re-running downstream channel skills.

---

*Generated by Complete Client Acquisition System — `caq-offer-positioning`*
```

---

## Terminal Output

```
=== OFFER POSITIONING COMPLETE ===

Product:     [name]
ICP:         [one-liner]
Category:    [New category / Better-existing / Cheaper-faster]

Positioning Statement:
  "For [ICP] who [pain], [Product] is a [category] that [benefit].
   Unlike [alternative], we [differentiator]."

Competitive Alternatives Mapped: [N]
  1. [alternative] — [differentiation strength: Strong/Moderate/Weak]
  2. [alternative] — [strength]
  3. [alternative] — [strength]

Pain -> Proof Coverage: [X]/[Y] top pains have a specific proof point
  [List any pain with no proof point found]

Messaging Pillars: [N]
  1. [pillar name]
  2. [pillar name]
  3. [pillar name]

Honesty Check: [No material gaps / Gap found — see report]

Full report saved to: POSITIONING.md
```

---

## Error Handling

- **No clear differentiation found against a named competitor:** say so directly in the Competitive Alternatives table and the Honesty Check section. Do not invent a differentiator to fill the cell. Suggest one of: (a) narrow the ICP until a real edge exists for that segment, (b) find an operational/structural fact the user hasn't mentioned (certifications, geography, guarantees — ask directly), or (c) recommend the "cheaper/faster" frame honestly if that's the only real lever, rather than dressing up parity as differentiation.
- **User can't name any competitors:** treat "doing nothing" and "DIY" as the primary alternatives — this is common and valid for category-creating or under-served-market offers; don't force a competitor comparison that doesn't exist.
- **PAIN-POINTS.md and ICP-PROFILE.md both missing and user has no time for the lightweight version either:** ask one direct question — "who is this for, and what's the single biggest reason they'd say no to buying today" — and build the positioning statement from that alone, flagging it as low-confidence/single-source in the output header.
- **Offer/product itself is genuinely undifferentiated (a commodity):** don't manufacture a fake USP. Say so, and point to the offers skill — sometimes the fix is bonuses/guarantee/pricing structure, not messaging, and forcing a messaging fix onto a commodity offer wastes the user's time.
- **Positioning statement keeps coming out generic after 2-3 drafts:** the likely cause is a benefit or differentiator that's actually true of every competitor. Stop iterating on wording and go back to Phase 4/5 to find a more specific, falsifiable fact.

---

## Related Skills (Complete Client Acquisition System — 15 skills, prefix `caq-`)

This skill sits at the hinge of TARGET → POSITION → REACH. It consumes TARGET-phase outputs and feeds every REACH/ATTRACT/CONVERT-phase skill that needs a message.

- **caq-icp-architect** (TARGET, upstream) — produces ICP-PROFILE.md, the primary input for the "[ICP]" slot here. Run this first if it doesn't exist.
- **caq-pain-point-builder** (TARGET, upstream) — produces PAIN-POINTS.md, the primary input for pain/proof mapping and the positioning statement's "[pain/need]" slot. Run this first if it doesn't exist.
- **"offers" skill** (existing, adjacent) — owns offer construction: bonuses, guarantees, pricing, payment structure. This skill owns *how the offer is talked about*, not its mechanics. Hand off to "offers" when the gap found here is really a product/pricing gap, not a messaging gap. Hand off from "offers" here once offer mechanics are locked, so proof points stay accurate.
- **caq-outreach-angles** (REACH, downstream) — takes messaging pillars and turns each into a distinct outreach angle/sequence theme.
- **caq-cold-email-builder** (REACH, downstream) — pulls elevator/longer pillar copy directly into subject lines and email bodies.
- **caq-linkedin-strategist** (REACH, downstream) — pulls pillars into post hooks, profile positioning, and DM openers.
- **caq-authority-content** (ATTRACT, downstream) — turns category-framing and pillar arguments into a content calendar that builds authority on the chosen category frame.
- **caq-lead-magnet-builder** (ATTRACT, downstream) — the lead magnet's promise should map to one pillar, usually the one tied to the #1 ranked pain.
- **caq-objection-strategist** (CONVERT, downstream) — the Competitive Alternatives table here is the direct input for "why not X" objection handling.
- Other suite skills (reach/attract/convert-phase copy, funnel, and content skills not named above) should treat POSITIONING.md as the canonical message source — pull pillar language rather than re-deriving positioning independently, so messaging stays consistent across every channel.
