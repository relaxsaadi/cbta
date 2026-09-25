# DGR/CBTA controlled reviewer registry

**Status:** governance scaffold only. No reviewer is admitted by this file merely because the file exists. The canonical table is intentionally empty until the owner has verified a real person's identity and the non-secret evidence needed for the role being recorded.

This registry closes a structural weakness in free-text reviewer sign-off. A phrase such as `Flight Operations` or `Dangerous Goods` must never be accepted as a named human reviewer merely because it contains two alphabetic words. Terminal FR technical review, terminal EN bilingual review, and final `APPROVED` sign-off must therefore reference an admitted reviewer record with `reviewer-id=DGR-RVW-####` in addition to the reviewer's exact recorded full name and the real review date.

The deterministic CI check validates only the **recorded governance structure**. It does not prove that a credential is genuine, does not replace qualified human regulatory judgment, and does not imply ANAC or IATA approval. Owner admission and real-world credential verification remain human responsibilities.

## Canonical registry

| Reviewer ID | Full name | Record type | DGR/CBTA qualification evidence | Bilingual FR/EN evidence | Admission state | Admission date | Evidence reference | Active |
|---|---|---|---|---|---|---|---|---|

## Admission rules

- `Reviewer ID` must be a stable non-secret identifier such as `DGR-RVW-0001`. Do not use email addresses, phone numbers, account IDs, passwords, access tokens, certificate secrets, or other sensitive identifiers.
- `Full name` must be the real human name that will appear in the durable review/sign-off evidence.
- `Record type` must be `HUMAN`.
- `DGR/CBTA qualification evidence` must record a concise non-secret affirmative qualification/role conclusion. For an active `OWNER VERIFIED` reviewer, wording that is explicitly unresolved or negative — for example `PENDING`, `MISSING`, `UNVERIFIED`, `NOT QUALIFIED`, `NO ... QUALIFICATION`, `EXPIRED`, or `REVOKED` — is not qualification evidence even if the text contains a DGR/CBTA keyword. Do not paste licensed IATA content or personal credential scans into this repository.
- Every active `OWNER VERIFIED` reviewer must also have exactly one traceable non-secret `qualification-ref=<reference>` segment inside `Evidence reference`. A bare affirmative qualification sentence is not enough. The reference must point to the owner-reviewed qualification evidence and cannot be blank, duplicated, `PENDING`, `MISSING`, `UNVERIFIED`, `NO EVIDENCE`, `EXPIRED`, `REVOKED`, `NOT QUALIFIED`, or another unresolved/negative placeholder. Do not commit credential scans, identity documents, secrets, or licensed material; store only a safe internal reference.
- `Bilingual FR/EN evidence` is `YES`, `NO`, or `PENDING`. EN terminal review requires `YES`.
- A `YES` bilingual claim must also have exactly one traceable non-secret `bilingual-ref=<reference>` segment inside `Evidence reference`. A bare `YES` is not evidence. The reference must point to owner-reviewed bilingual FR/EN evidence and cannot be blank, `PENDING`, `MISSING`, `UNVERIFIED`, `NO EVIDENCE`, or another unresolved placeholder. Do not commit language-test certificates, identity documents, credential scans, secrets, or licensed material; store only a safe internal reference.
- `Admission state` is `PENDING` until the owner has actually checked the reviewer identity/role evidence. Only the owner may move it to `OWNER VERIFIED`.
- `Admission date` for `OWNER VERIFIED` must be the real, valid, non-future ISO date of that admission decision.
- `Evidence reference` must be a non-secret traceable reference to the owner-reviewed evidence. For an active owner-verified reviewer it must contain `qualification-ref=<internal reference>` and, when `Bilingual FR/EN evidence = YES`, `bilingual-ref=<internal reference>`. It must not contain passwords, tokens, DRM-protected content, or a copied credential document.
- `Active=YES` is permitted only for an `OWNER VERIFIED` record. A withdrawn or no-longer-authorized reviewer remains in history with `Active=NO`; do not delete the audit record.

## Required terminal evidence syntax

The reviewer ID belongs in a separate metadata segment so the human-name segment remains unambiguous to the legacy defense-in-depth parser.

FR matrix / FR technical review:

```text
<exact registry full name>, reviewer-id=DGR-RVW-0001, <DGR/CBTA role or credential>, <YYYY-MM-DD>
```

EN bilingual review:

```text
<exact registry full name>, reviewer-id=DGR-RVW-0001, <bilingual DGR/CBTA role or credential FR/EN>, <YYYY-MM-DD>
```

Final approval:

```text
APPROVED — <exact registry full name>, reviewer-id=DGR-RVW-0001, <YYYY-MM-DD>
```

A terminal state fails closed when the reviewer ID is absent, duplicated, unknown, inactive, not owner-verified, name-mismatched, missing affirmative DGR/CBTA qualification evidence, missing its traceable `qualification-ref=` evidence reference, carrying explicitly unresolved/negative qualification wording or reference semantics while active, or (for EN) missing `Bilingual FR/EN evidence = YES` **or its traceable `bilingual-ref=` evidence reference**.

## Pending / gap states

`DRAFT`, `PENDING`, `SOURCE GAP`, `SOURCE CONFLICT`, `NOT YET VERIFIED`, `BILINGUAL TECHNICAL REVIEW REQUIRED`, and equivalent unresolved states do not require a reviewer record. Do not create a reviewer row merely to make a pending item pass CI.
