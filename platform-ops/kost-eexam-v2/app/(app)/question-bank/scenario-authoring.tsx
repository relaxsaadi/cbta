"use client";

// Mission "MISSION FINALE CIBLÉE" (2026-08-30) §4/§6 — logique d'auteurage
// des sous-questions de scénario, PARTAGÉE entre CreateQuestionForm.tsx et
// EditQuestionForm.tsx (jamais deux implémentations divergentes du même
// convertisseur brouillon → {choices, correctAnswer}, même discipline que
// lib/questions.ts::parseAuthoringFormData côté serveur, dont ce fichier
// est le miroir client — voir son commentaire pour la justification
// complète du choix "un seul champ JSON cache" plutôt qu'un encodage
// FormData plat pour une liste dynamique de sous-questions typées).

export type ScenarioSubQType = "mcq_single" | "mcq_multi" | "true_false" | "numeric" | "short_answer" | "matching" | "ordering";

export interface Choice {
  key: string;
  text: string;
}

export const SUBQUESTION_TYPE_OPTIONS: { value: ScenarioSubQType; label: string }[] = [
  { value: "true_false", label: "Vrai / Faux" },
  { value: "mcq_single", label: "QCM — une seule réponse" },
  { value: "mcq_multi", label: "QCM — plusieurs réponses" },
  { value: "matching", label: "Appariement" },
  { value: "ordering", label: "Ordre / séquence" },
  { value: "numeric", label: "Réponse numérique" },
  { value: "short_answer", label: "Réponse courte" },
];

export interface SubquestionDraft {
  qtype: ScenarioSubQType;
  stem: string;
  points: string;
  choiceTexts: string[];
  correctIndexes: number[];
  trueFalseCorrect: "true" | "false" | "";
  numericValue: string;
  numericTolerance: string;
  numericUnit: string;
  shortAnswerMode: "exact" | "manual";
  acceptedAnswers: string;
  matchingLeftTexts: string[];
  matchingRightTexts: string[];
  orderingItemTexts: string[];
}

export function emptyDraft(qtype: ScenarioSubQType = "mcq_single"): SubquestionDraft {
  return {
    qtype,
    stem: "",
    points: "1",
    choiceTexts: ["", "", "", ""],
    correctIndexes: [],
    trueFalseCorrect: "",
    numericValue: "",
    numericTolerance: "0",
    numericUnit: "",
    shortAnswerMode: "exact",
    acceptedAnswers: "",
    matchingLeftTexts: ["", "", "", ""],
    matchingRightTexts: ["", "", "", ""],
    orderingItemTexts: ["", "", "", ""],
  };
}

/** Reconstruit un brouillon d'édition depuis une sous-question déjà
 * enregistrée (EditQuestionForm) — l'inverse de draftToPayload ci-dessous.
 * Les paires d'appariement sont réordonnées gauche→droite dans l'ordre de
 * `correctAnswer.pairs` (jamais l'ordre brut de `choices`, qui entrelace
 * L/R) pour retomber sur des lignes "Élément → Correspondance" cohérentes
 * à l'affichage. */
export function subquestionToDraft(sq: { qtype: ScenarioSubQType; stem: string; points: number; choices: Choice[]; correctAnswer: unknown }): SubquestionDraft {
  const d = emptyDraft(sq.qtype);
  d.stem = sq.stem;
  d.points = String(sq.points);
  const byKey = new Map(sq.choices.map((c) => [c.key, c.text]));
  if (sq.qtype === "mcq_single" || sq.qtype === "mcq_multi") {
    const correct = (sq.correctAnswer as string[]) ?? [];
    d.choiceTexts = sq.choices.map((c) => c.text).concat(["", "", "", ""]).slice(0, Math.max(4, sq.choices.length));
    d.correctIndexes = sq.choices.map((c, i) => (correct.includes(c.key) ? i : -1)).filter((i) => i >= 0);
  } else if (sq.qtype === "true_false") {
    const correct = (sq.correctAnswer as string[]) ?? [];
    d.trueFalseCorrect = correct.includes("true") ? "true" : correct.includes("false") ? "false" : "";
  } else if (sq.qtype === "numeric") {
    const spec = sq.correctAnswer as { value: number; tolerance: number; unit?: string };
    d.numericValue = String(spec.value ?? "");
    d.numericTolerance = String(spec.tolerance ?? 0);
    d.numericUnit = spec.unit ?? "";
  } else if (sq.qtype === "short_answer") {
    const spec = sq.correctAnswer as { mode: "exact" | "manual"; acceptedAnswers?: string[] };
    d.shortAnswerMode = spec.mode;
    d.acceptedAnswers = spec.mode === "exact" ? (spec.acceptedAnswers ?? []).join("\n") : "";
  } else if (sq.qtype === "matching") {
    const spec = sq.correctAnswer as { pairs: { left: string; right: string }[] };
    d.matchingLeftTexts = spec.pairs.map((p) => byKey.get(p.left) ?? "").concat(["", "", "", ""]).slice(0, Math.max(4, spec.pairs.length));
    d.matchingRightTexts = spec.pairs.map((p) => byKey.get(p.right) ?? "").concat(["", "", "", ""]).slice(0, Math.max(4, spec.pairs.length));
  } else if (sq.qtype === "ordering") {
    const spec = sq.correctAnswer as { sequence: string[] };
    d.orderingItemTexts = spec.sequence.map((k) => byKey.get(k) ?? "").concat(["", "", "", ""]).slice(0, Math.max(4, spec.sequence.length));
  }
  return d;
}

/** Miroir CLIENT de lib/questions.ts::parseAuthoringFormData (mêmes
 * conventions de clé) — nécessaire pour sérialiser une sous-question de
 * scénario en {choices, correctAnswer} avant envoi. Jamais la seule ligne
 * de défense : le serveur revalide intégralement via
 * validateQuestionAuthoring, appelé RÉCURSIVEMENT par sous-question. */
export function draftToPayload(d: SubquestionDraft): { qtype: ScenarioSubQType; stem: string; points: number; choices: Choice[]; correctAnswer: unknown } {
  const points = Number(d.points) || 0;
  if (d.qtype === "mcq_single" || d.qtype === "mcq_multi") {
    const choices = d.choiceTexts.filter((t) => t.trim()).map((text, i) => ({ key: String.fromCharCode(65 + i), text: text.trim() }));
    const correctAnswer = d.correctIndexes.map((i) => String.fromCharCode(65 + i));
    return { qtype: d.qtype, stem: d.stem, points, choices, correctAnswer };
  }
  if (d.qtype === "true_false") {
    return {
      qtype: d.qtype,
      stem: d.stem,
      points,
      choices: [{ key: "true", text: "Vrai" }, { key: "false", text: "Faux" }],
      correctAnswer: d.trueFalseCorrect ? [d.trueFalseCorrect] : [],
    };
  }
  if (d.qtype === "numeric") {
    const unit = d.numericUnit.trim();
    return {
      qtype: d.qtype,
      stem: d.stem,
      points,
      choices: unit ? [{ key: "unit", text: unit }] : [],
      correctAnswer: { mode: "numeric", value: Number(d.numericValue), tolerance: Number(d.numericTolerance) || 0, unit: unit || undefined },
    };
  }
  if (d.qtype === "short_answer") {
    if (d.shortAnswerMode === "manual") return { qtype: d.qtype, stem: d.stem, points, choices: [], correctAnswer: { mode: "manual" } };
    const acceptedAnswers = d.acceptedAnswers.split(/\r?\n|,/).map((s) => s.trim()).filter(Boolean);
    return { qtype: d.qtype, stem: d.stem, points, choices: [], correctAnswer: { mode: "exact", acceptedAnswers } };
  }
  if (d.qtype === "matching") {
    const choices: Choice[] = [];
    const pairs: { left: string; right: string }[] = [];
    let idx = 0;
    for (let i = 0; i < Math.max(d.matchingLeftTexts.length, d.matchingRightTexts.length); i++) {
      const l = (d.matchingLeftTexts[i] ?? "").trim();
      const r = (d.matchingRightTexts[i] ?? "").trim();
      if (!l || !r) continue;
      idx += 1;
      choices.push({ key: `L${idx}`, text: l }, { key: `R${idx}`, text: r });
      pairs.push({ left: `L${idx}`, right: `R${idx}` });
    }
    return { qtype: d.qtype, stem: d.stem, points, choices, correctAnswer: { mode: "matching", pairs } };
  }
  // ordering
  const choices: Choice[] = d.orderingItemTexts.filter((t) => t.trim()).map((text, i) => ({ key: `S${i + 1}`, text: text.trim() }));
  return { qtype: d.qtype, stem: d.stem, points, choices, correctAnswer: { mode: "ordering", sequence: choices.map((c) => c.key) } };
}

/** Champs propres au type d'UNE sous-question de scénario — mêmes blocs que
 * le formulaire top-niveau, mais pilotés par état local (jamais des
 * `name=` directs : tout part dans scenarioSubquestionsJson) puisqu'un
 * scénario peut contenir plusieurs sous-questions du MÊME type (des
 * `name=` directs entreraient en collision entre sous-questions). */
export function SubquestionFields({ draft, onChange }: { draft: SubquestionDraft; onChange: (patch: Partial<SubquestionDraft>) => void }) {
  if (draft.qtype === "mcq_single" || draft.qtype === "mcq_multi") {
    return (
      <div className="flex flex-col gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="checkbox"
              aria-label={`Bonne réponse — choix ${String.fromCharCode(65 + i)}`}
              checked={draft.correctIndexes.includes(i)}
              onChange={(e) => {
                const next = e.target.checked ? [...draft.correctIndexes, i] : draft.correctIndexes.filter((x) => x !== i);
                onChange({ correctIndexes: draft.qtype === "mcq_single" ? (e.target.checked ? [i] : []) : next });
              }}
              className="h-4 w-4"
            />
            <input
              aria-label={`Choix ${String.fromCharCode(65 + i)}`}
              placeholder={`Choix ${String.fromCharCode(65 + i)}`}
              value={draft.choiceTexts[i] ?? ""}
              onChange={(e) => onChange({ choiceTexts: draft.choiceTexts.map((v, j) => (j === i ? e.target.value : v)) })}
              className="flex-1 rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px]"
            />
          </div>
        ))}
      </div>
    );
  }
  if (draft.qtype === "true_false") {
    return (
      <div className="flex gap-4 text-[12.5px]">
        <label className="flex items-center gap-1.5">
          <input type="radio" checked={draft.trueFalseCorrect === "true"} onChange={() => onChange({ trueFalseCorrect: "true" })} /> Vrai
        </label>
        <label className="flex items-center gap-1.5">
          <input type="radio" checked={draft.trueFalseCorrect === "false"} onChange={() => onChange({ trueFalseCorrect: "false" })} /> Faux
        </label>
      </div>
    );
  }
  if (draft.qtype === "numeric") {
    return (
      <div className="grid gap-2 sm:grid-cols-3">
        <input type="number" step="any" placeholder="Valeur correcte" value={draft.numericValue} onChange={(e) => onChange({ numericValue: e.target.value })} className="rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px]" />
        <input type="number" step="any" min="0" placeholder="Tolérance (0 = exact)" value={draft.numericTolerance} onChange={(e) => onChange({ numericTolerance: e.target.value })} className="rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px]" />
        <input placeholder="Unité (optionnel)" value={draft.numericUnit} onChange={(e) => onChange({ numericUnit: e.target.value })} className="rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px]" />
      </div>
    );
  }
  if (draft.qtype === "short_answer") {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex gap-4 text-[12.5px]">
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={draft.shortAnswerMode === "exact"} onChange={() => onChange({ shortAnswerMode: "exact" })} /> Correspondance exacte
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={draft.shortAnswerMode === "manual"} onChange={() => onChange({ shortAnswerMode: "manual" })} /> Correction manuelle
          </label>
        </div>
        {draft.shortAnswerMode === "exact" && (
          <textarea rows={2} placeholder={"UN\nUnited Nations"} value={draft.acceptedAnswers} onChange={(e) => onChange({ acceptedAnswers: e.target.value })} className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px]" />
        )}
      </div>
    );
  }
  if (draft.qtype === "matching") {
    return (
      <div className="flex flex-col gap-1.5">
        {draft.matchingLeftTexts.map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              aria-label={`Élément ${i + 1}`}
              placeholder={`Élément ${i + 1}`}
              value={draft.matchingLeftTexts[i] ?? ""}
              onChange={(e) => onChange({ matchingLeftTexts: draft.matchingLeftTexts.map((v, j) => (j === i ? e.target.value : v)) })}
              className="flex-1 rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px]"
            />
            <span aria-hidden="true" className="text-text-tertiary">→</span>
            <input
              aria-label={`Correspondance ${i + 1}`}
              placeholder={`Correspondance ${i + 1}`}
              value={draft.matchingRightTexts[i] ?? ""}
              onChange={(e) => onChange({ matchingRightTexts: draft.matchingRightTexts.map((v, j) => (j === i ? e.target.value : v)) })}
              className="flex-1 rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px]"
            />
          </div>
        ))}
      </div>
    );
  }
  // ordering
  return (
    <div className="flex flex-col gap-1.5">
      {draft.orderingItemTexts.map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-5 shrink-0 text-[11.5px] text-text-tertiary">{i + 1}.</span>
          <input
            aria-label={`Étape ${i + 1}`}
            placeholder={`Étape ${i + 1}`}
            value={draft.orderingItemTexts[i] ?? ""}
            onChange={(e) => onChange({ orderingItemTexts: draft.orderingItemTexts.map((v, j) => (j === i ? e.target.value : v)) })}
            className="flex-1 rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px]"
          />
        </div>
      ))}
    </div>
  );
}
