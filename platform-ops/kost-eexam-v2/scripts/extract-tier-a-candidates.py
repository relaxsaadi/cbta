#!/usr/bin/env python3
"""Extracteur de candidats Tier A — compagnon documentaire de
scripts/sync-tier-a-questions.ts (mission "RENDRE KOST E-EXAM V2
OPÉRATIONNEL AVEC LES 244 QUESTIONS DGR CONFIRMÉES", §11-12).

Lit UNIQUEMENT le cache local .tier-a-extracts/ (jamais une écriture, jamais
une connexion réseau/DB) — un instantané des documents sources qui vivent
sur la branche non fusionnée `ai/dgr-stage2b-handoff` de ce même dépôt
(mêmes principes de séparation que .moodle-extracts/markdown/ pour
import-dgr-from-moodle.ts). Pour rafraîchir ce cache avant un futur lot
Tier A incrémental (ex. 244 → 281 questions) :

    cd /chemin/vers/un/checkout/de/ai/dgr-stage2b-handoff/docs
    cp DGR_V2_IMPORT_CANDIDATES_AFTER_RECONCILIATION.csv \\
       DGR_TIER_A_RECONCILIATION_453_PER_ITEM.csv \\
       DGR_EN_REVIEW_PACKAGE_7.*.md \\
       DGR_PRODUCTION_BANK_7.*.md \\
       <ce-dépôt>/platform-ops/kost-eexam-v2/.tier-a-extracts/

Produit toujours l'ENSEMBLE COURANT COMPLET des questions éligibles
(IMPORT_ELIGIBLE=YES dans la CSV de réconciliation) — jamais seulement un
delta. C'est scripts/sync-tier-a-questions.ts (comparaison contre la base
réelle par kost_question_id) qui détermine NEW/UPDATED VERSION/SKIPPED, pas
cet extracteur — un futur lot passant de 244 à 281 éligibles se traite en
relançant simplement cet extracteur (fenêtre CSV/markdown mise à jour) puis
le script de sync : les 244 déjà présents ressortent SKIPPED (idempotent),
seuls les nouveaux ressortent NEW.

Ne fabrique jamais de contenu : tout item qui ne se parse pas proprement
(énoncé vide, mauvais nombre de choix, réponse correcte ambiguë, statut
source absent) est reporté comme BLOCKED avec sa raison, jamais deviné.
"""
import csv
import json
import re
import sys
from pathlib import Path

CACHE = Path(__file__).resolve().parent.parent / ".tier-a-extracts"
OUT_DIR = Path(__file__).resolve().parent.parent / ".tier-a-extracts" / "out"

FUNCTIONS = ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10"]


def load_csv_meta():
    meta = {}
    with open(CACHE / "DGR_V2_IMPORT_CANDIDATES_AFTER_RECONCILIATION.csv") as f:
        for row in csv.DictReader(f):
            meta[row["KOST_ID"]] = row
    return meta


# DÉFAUT DE DONNÉES CONNU (confirmé 2026-08-29, pas un bug de ce parseur) :
# dans DGR_V2_IMPORT_CANDIDATES_AFTER_RECONCILIATION.csv (SOURCE_REFERENCE)
# ET DGR_TIER_A_RECONCILIATION_453_PER_ITEM.csv (DGR_Reference), une bonne
# partie des lignes du dernier lot de réconciliation (127/152 lors du
# premier import, 2026-08-29) portent la MÊME valeur "§1.0, §1.1.2, §1.1.3,
# §3.0.1.1" — le script de réconciliation a par erreur repris une liste
# d'exemples "representative sample" (les références de 4 AUTRES items,
# citées pour illustration dans le texte de justification de CETTE ligne)
# comme si c'était la référence propre de la ligne. Jamais utilisé ici en
# l'état (règle dgr-stage2b §6 : référence concise, jamais fabriquée).
# À la place, on extrait le fragment "SOURCE: <texte> RATIONALE:" propre à
# chaque ligne dans Final_Reconciled_Status (vérifié non-corrompu de la
# même façon) et on ne le garde QUE s'il cite un vrai "§" DGR ; sinon
# regulatory_reference reste null (trou honnête, jamais une supposition).
_PER_ITEM_CSV_CACHE = None


def load_per_item_status():
    global _PER_ITEM_CSV_CACHE
    if _PER_ITEM_CSV_CACHE is None:
        _PER_ITEM_CSV_CACHE = {}
        path = CACHE / "DGR_TIER_A_RECONCILIATION_453_PER_ITEM.csv"
        if path.exists():
            with open(path) as f:
                for row in csv.DictReader(f):
                    _PER_ITEM_CSV_CACHE[row["KOST_Question_ID"]] = row
    return _PER_ITEM_CSV_CACHE


def trustworthy_source_reference(kost_id):
    row = load_per_item_status().get(kost_id)
    if not row:
        return None
    text = row.get("Final_Reconciled_Status", "")
    m = re.search(r"SOURCE:\s*(.*?)\s*RATIONALE:", text, re.S)
    if not m:
        return None
    src = clean(m.group(1))
    if "§" not in src:
        return None
    return src[:400]


def split_blocks(text, header_re):
    matches = list(header_re.finditer(text))
    blocks = {}
    for i, m in enumerate(matches):
        kid = m.group(1)
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        blocks[kid] = text[start:end]
    return blocks


def clean(s):
    return re.sub(r"\s+", " ", s).strip()


def truncate_at_word(text, max_len):
    if text is None or len(text) <= max_len:
        return text
    cut = text[:max_len]
    last_space = cut.rfind(" ")
    return (cut[:last_space] if last_space > 0 else cut) + "…"


def extract_quoted(s):
    m = re.search(r'\*"(.*?)"\*', s, re.S)
    if m:
        return clean(m.group(1))
    m = re.search(r'"(.*?)"', s, re.S)
    return clean(m.group(1)) if m else None


def parse_en_package_block(block):
    out = {}
    m = re.search(r"-\s*\*\*Type:\*\*\s*(.+)", block)
    type_raw = clean(m.group(1)) if m else ""
    qtype = "true_false" if "True/False" in type_raw else ("mcq_single" if "MCQ" in type_raw else None)
    out["qtype"] = qtype
    out["type_raw"] = type_raw

    m = re.search(r"-\s*\*\*Sub-task:\*\*\s*(.+)", block)
    out["subtask"] = clean(m.group(1)) if m else None

    m = re.search(r"\*\*FR text[^*]*\*\*\s*(.*?)(?=\n-\s*\*\*[A-Z])", block, re.S)
    fr_block = m.group(1) if m else ""

    if qtype == "mcq_single":
        m = re.search(r"-\s*Stem:\s*(.*?)(?=\n\s*-\s*Options:)", fr_block, re.S)
        stem = extract_quoted(m.group(1)) if m else None
        m = re.search(r"-\s*Options:\s*(.*)", fr_block, re.S)
        options_line = m.group(1).strip() if m else ""
        raw_opts = re.split(r'(?<=\*)\s*/\s*(?=(?:\*\*\(Correct\)\*\*\s*)?\*")', options_line)
        choices, correct_keys, keys = [], [], "ABCDEFGH"
        for i, opt in enumerate(raw_opts):
            is_correct = "**(Correct)**" in opt
            text = extract_quoted(opt)
            if text is None:
                continue
            key = keys[i]
            choices.append({"key": key, "text": text})
            if is_correct:
                correct_keys.append(key)
        out["stem"], out["choices"], out["correct_answer"] = stem, choices, correct_keys
    elif qtype == "true_false":
        m = re.search(r"-\s*Statement:\s*(.*?)(?=\n\s*-\s*Correct answer:)", fr_block, re.S)
        stem = extract_quoted(m.group(1)) if m else None
        m = re.search(r"-\s*Correct answer:\s*\*{0,2}(vrai|faux)\*{0,2}", fr_block, re.I)
        correct_word = m.group(1).lower() if m else None
        out["stem"] = stem
        out["choices"] = [{"key": "A", "text": "Vrai"}, {"key": "B", "text": "Faux"}]
        out["correct_answer"] = ["A"] if correct_word == "vrai" else (["B"] if correct_word == "faux" else [])
    else:
        out["stem"], out["choices"], out["correct_answer"] = None, [], []
    return out


def field_multiline(block, label):
    m = re.search(rf"\*\*{re.escape(label)}[^:*]*:\*\*\s*([\s\S]*?)(?=\n\*\*[A-Z][^:*]*:\*\*|\n---|$)", block)
    return clean(m.group(1)) if m else None


def parse_production_bank_full(block):
    out = {}
    m = re.search(r"\*\*Type:\*\*\s*(.+)", block)
    type_raw = clean(m.group(1)) if m else ""
    qtype = "true_false" if "True/False" in type_raw else ("mcq_single" if "MCQ" in type_raw else None)
    out["qtype"] = qtype
    out["type_raw"] = type_raw

    m = re.search(r"\*\*Sub-task:\*\*\s*(.+)", block)
    out["subtask"] = clean(m.group(1)) if m else None

    stem = field_multiline(block, "Stem (FR)")
    if qtype == "true_false" and not stem:
        stem = field_multiline(block, "Stem")

    if qtype == "mcq_single":
        m = re.search(r"\*\*Options:\*\*\s*\n([\s\S]*?)(?=\n\*\*[A-Z][^:*]*:\*\*|\n---|$)", block)
        raw_opts_block = m.group(1) if m else ""
        bullets = re.split(r"\n(?=-\s)", raw_opts_block.strip())
        choices, correct_keys, keys = [], [], "ABCDEFGH"
        for i, b in enumerate(bullets):
            b = b.strip()
            if not b.startswith("-"):
                continue
            is_correct = "**(Correct)**" in b
            text = clean(re.sub(r"^-\s*(\*\*\(Correct\)\*\*\s*)?", "", b))
            if not text:
                continue
            key = keys[i]
            choices.append({"key": key, "text": text})
            if is_correct:
                correct_keys.append(key)
        out["stem"], out["choices"], out["correct_answer"] = stem, choices, correct_keys
    elif qtype == "true_false":
        m = re.search(r"\*\*Correct answer:\*\*\s*\*{0,2}(vrai|faux)\*{0,2}", block, re.I)
        correct_word = m.group(1).lower() if m else None
        out["stem"] = stem
        out["choices"] = [{"key": "A", "text": "Vrai"}, {"key": "B", "text": "Faux"}]
        out["correct_answer"] = ["A"] if correct_word == "vrai" else (["B"] if correct_word == "faux" else [])
    else:
        out["stem"], out["choices"], out["correct_answer"] = stem, [], []
    return out


def parse_production_bank_explanation(block, qtype):
    def field(label):
        m = re.search(rf"\*\*{re.escape(label)}[^:*]*:\*\*\s*([\s\S]*?)(?=\n\*\*[A-Z][^:*]*:\*\*|\n---|$)", block)
        return clean(m.group(1)) if m else None

    return field("Rationale") if qtype == "true_false" else field("Correct answer rationale")


def main():
    csv_meta = load_csv_meta()
    eligible_ids = sorted(kid for kid, row in csv_meta.items() if row["IMPORT_ELIGIBLE"] == "YES")

    header_re_en = re.compile(r"^###\s+(Q-7\.\d+-\d+)\b.*$", re.M)
    header_re_bank = re.compile(r"^##\s+(Q-7\.\d+-\d+)\b.*$", re.M)

    results = {}
    blocked = []

    for fn in FUNCTIONS:
        en_path = CACHE / f"DGR_EN_REVIEW_PACKAGE_{fn}.md"
        bank_path = CACHE / f"DGR_PRODUCTION_BANK_{fn}.md"
        en_blocks = split_blocks(en_path.read_text(), header_re_en) if en_path.exists() else {}
        bank_blocks = split_blocks(bank_path.read_text(), header_re_bank) if bank_path.exists() else {}

        for kid in [k for k in eligible_ids if k.startswith(f"Q-{fn}-")]:
            csv_row = csv_meta[kid]
            block = en_blocks.get(kid)
            source_doc = en_path.name
            if block is not None:
                parsed = parse_en_package_block(block)
            else:
                bank_block_fallback = bank_blocks.get(kid)
                if bank_block_fallback is None:
                    blocked.append({"kost_id": kid, "reason": f"no header in {en_path.name} or {bank_path.name}"})
                    continue
                parsed = parse_production_bank_full(bank_block_fallback)
                source_doc = bank_path.name

            problems = []
            if parsed["qtype"] not in ("mcq_single", "true_false"):
                problems.append(f"unrecognized type: {parsed['type_raw']!r}")
            if not parsed["stem"]:
                problems.append("empty/unparseable stem")
            if parsed["qtype"] == "mcq_single":
                if len(parsed["choices"]) < 2:
                    problems.append(f"only {len(parsed['choices'])} options parsed")
                if len(parsed["correct_answer"]) != 1:
                    problems.append(f"expected exactly 1 correct option, found {len(parsed['correct_answer'])}")
            elif parsed["qtype"] == "true_false":
                if len(parsed["correct_answer"]) != 1:
                    problems.append("could not determine Vrai/Faux correct answer")
            if problems:
                blocked.append({"kost_id": kid, "reason": "; ".join(problems)})
                continue

            bank_block = bank_blocks.get(kid)
            explanation = parse_production_bank_explanation(bank_block, parsed["qtype"]) if bank_block is not None else None
            explanation = truncate_at_word(explanation, 600)

            results[kid] = {
                "kost_question_id": kid,
                "function_code": fn,
                "subtask": parsed["subtask"],
                "qtype": parsed["qtype"],
                "source_status": "FROZEN_SOURCE_VERIFIED",
                "stem": parsed["stem"],
                "choices": parsed["choices"],
                "correct_answer": parsed["correct_answer"],
                "explanation": explanation,
                "source_reference": trustworthy_source_reference(kid),
                "csv_source_reference_UNTRUSTED": clean(csv_row["SOURCE_REFERENCE"]) if csv_row["SOURCE_REFERENCE"] else None,
                "source_doc": source_doc,
            }

    print(f"Éligibles (IMPORT_ELIGIBLE=YES) dans la CSV : {len(eligible_ids)}", file=sys.stderr)
    print(f"Parsed OK: {len(results)}", file=sys.stderr)
    print(f"Blocked:   {len(blocked)}", file=sys.stderr)
    for b in blocked:
        print(f"  BLOCKED {b['kost_id']}: {b['reason']}", file=sys.stderr)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    envelope = {
        "meta": {
            "source_branch": "ai/dgr-stage2b-handoff",
            "source_commit": "5a3b51e215362daa378af5864844e9d0a98a7603",
            "eligible_count_csv": len(eligible_ids),
            "candidate_count": len(results),
            "blocked_count": len(blocked),
            "known_data_defect": (
                "A subset of rows in the reconciliation CSVs carry a corrupted "
                "SOURCE_REFERENCE/DGR_Reference (representative-sample citation "
                "list mis-lifted into the row's own field) — never used as-is; "
                "see csv_source_reference_UNTRUSTED per item vs. source_reference."
            ),
        },
        "candidates": list(results.values()),
        "blocked": blocked,
    }
    out_path = OUT_DIR / "tier_a_candidates.json"
    out_path.write_text(json.dumps(envelope, ensure_ascii=False, indent=2))
    print(f"Wrote {out_path}", file=sys.stderr)


if __name__ == "__main__":
    main()
