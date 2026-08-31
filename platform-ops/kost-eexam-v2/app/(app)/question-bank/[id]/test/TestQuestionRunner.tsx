"use client";

import { useState, useTransition } from "react";
import { FlaskConical, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PreviewQuestion } from "../../../apercu-candidat/[assessmentId]/PreviewRunner";
import { testGradeQuestionAction, type TestGradeResult } from "./actions";

// Mission "FINAL PRODUCT IMPROVEMENTS BEFORE AUDITOR PDF" (2026-08-31)
// §11-14 — "Tester la question". SÉCURITÉ CENTRALE (§12), même principe
// structurel que PreviewRunner.tsx (mode aperçu candidat, §20-26 d'une
// mission antérieure) : AUCUNE Server Action de tentative réelle
// (saveAnswerAction/submitAttemptAction/etc) n'est importée ici — toute
// interaction ne modifie que l'état React local de CE composant. La SEULE
// Server Action utilisée (testGradeQuestionAction) est une fonction de
// notation PURE (lib/grading.ts::gradeOneQuestion, zéro écriture DB — voir
// son propre commentaire) : aucune ligne attempts/attempt_answers/results
// n'est jamais créée, aucun statut de question n'est modifié, aucun email
// n'est envoyé.
//
// §13 — le rendu par type de question (mcq/numeric/short_answer/matching/
// ordering/scenario) reprend EXACTEMENT la même structure JSX que
// PreviewRunner.tsx (elle-même déjà le même modèle de données/transform
// que le candidat réel, ExamRunner.tsx — voir lib/attempts.ts::
// mapSnapshotRowToCandidateView, point d'entrée unique de transform
// partagé par les trois écrans) : jamais un rendu divergent pour les 8
// types.

interface AnswerState {
  answer: string[] | null;
  scenarioAnswers: Record<string, string[] | null>;
}

function setMatchingPair(current: string[] | null, leftKey: string, rightKey: string): string[] {
  const map = new Map((current ?? []).map((p) => p.split(":") as [string, string]));
  if (rightKey) map.set(leftKey, rightKey);
  else map.delete(leftKey);
  return Array.from(map.entries()).map(([l, r]) => `${l}:${r}`);
}

export function TestQuestionRunner({ question, questionId, kostQuestionId }: { question: PreviewQuestion; questionId: number; kostQuestionId: string }) {
  const [state, setState] = useState<AnswerState>({ answer: null, scenarioAnswers: {} });
  const [result, setResult] = useState<TestGradeResult | null>(null);
  const [pending, startTransition] = useTransition();

  function updateAnswer(answer: string[]) {
    setResult(null);
    setState((prev) => ({ ...prev, answer }));
  }
  function toggleChoice(key: string) {
    const cur = state.answer ?? [];
    const updated = question.multiSelect ? (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]) : [key];
    updateAnswer(updated);
  }
  function updateScenarioSub(subId: string, compute: (prev: string[] | null) => string[]) {
    setResult(null);
    setState((prev) => ({ ...prev, scenarioAnswers: { ...prev.scenarioAnswers, [subId]: compute(prev.scenarioAnswers[subId] ?? null) } }));
  }

  function verify() {
    const answerJson = question.qtype === "scenario" ? JSON.stringify(state.scenarioAnswers) : JSON.stringify(state.answer ?? []);
    startTransition(async () => {
      const r = await testGradeQuestionAction(questionId, answerJson);
      setResult(r);
    });
  }

  function reset() {
    setState({ answer: null, scenarioAnswers: {} });
    setResult(null);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-center gap-2 rounded-md border border-status-warning-border bg-status-warning-bg px-3.5 py-2.5 text-[12.5px] font-medium text-status-warning-text">
        <FlaskConical size={15} className="shrink-0" />
        MODE TEST — aucune réponse ne sera enregistrée dans un examen réel.
      </div>

      <div className="rounded-md border border-border-subtle bg-surface-raised px-4 py-3">
        <p className="text-[13px] font-medium text-text-primary">Test de question — {kostQuestionId}</p>
        <p className="text-[11.5px] text-text-tertiary">Rendu identique à l&apos;écran candidat réel. Aucun attempt/résultat n&apos;est créé.</p>
      </div>

      <div data-testid="test-question-card" data-qtype={question.qtype} className="rounded-lg border border-border-subtle bg-surface-raised p-5 shadow-sm">
        <p className="mb-3 text-[14.5px] font-medium text-text-primary">{question.stem}</p>

        {(question.qtype === "mcq_single" || question.qtype === "mcq_multi" || question.qtype === "true_false") && (
          <>
            {question.multiSelect && <p className="mb-2 text-[11.5px] text-text-tertiary">Plusieurs réponses possibles.</p>}
            <div className="flex flex-col gap-2">
              {question.choices.map((c) => {
                const selected = (state.answer ?? []).includes(c.key);
                return (
                  <label key={c.key} className={cn("flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2.5 text-[13.5px]", selected ? "border-accent-9 bg-accent-soft-bg text-accent-11" : "border-border-default text-text-secondary hover:border-border-strong")}>
                    <input type={question.multiSelect ? "checkbox" : "radio"} checked={selected} onChange={() => toggleChoice(c.key)} className="h-4 w-4" />
                    {c.text}
                  </label>
                );
              })}
            </div>
          </>
        )}

        {question.qtype === "numeric" && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              value={state.answer?.[0] ?? ""}
              onChange={(e) => updateAnswer(e.target.value ? [e.target.value] : [])}
              className="w-40 rounded-md border border-border-default bg-surface-base px-3 py-2 text-[14px]"
              placeholder="Votre réponse"
            />
            {question.unit && <span className="text-[13px] text-text-tertiary">{question.unit}</span>}
          </div>
        )}

        {question.qtype === "short_answer" && (
          <input
            type="text"
            value={state.answer?.[0] ?? ""}
            onChange={(e) => updateAnswer(e.target.value ? [e.target.value] : [])}
            className="w-full rounded-md border border-border-default bg-surface-base px-3 py-2 text-[14px]"
            placeholder="Votre réponse"
          />
        )}

        {question.qtype === "matching" && (
          <div className="flex flex-col gap-2">
            <p className="text-[11.5px] text-text-tertiary">Associez chaque élément à la bonne réponse.</p>
            {question.matchingLeft.map((l) => {
              const map = new Map((state.answer ?? []).map((p) => p.split(":") as [string, string]));
              return (
                <div key={l.key} className="flex flex-wrap items-center gap-2">
                  <span className="min-w-0 flex-1 text-[13.5px] text-text-primary">{l.text}</span>
                  <span aria-hidden="true" className="text-text-tertiary">→</span>
                  <select
                    aria-label={`Correspondance pour ${l.text}`}
                    value={map.get(l.key) ?? ""}
                    onChange={(e) => updateAnswer(setMatchingPair(state.answer, l.key, e.target.value))}
                    className="max-w-full min-w-0 rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[13px]"
                  >
                    <option value="">— Choisir —</option>
                    {question.matchingRight.map((r) => (<option key={r.key} value={r.key}>{r.text}</option>))}
                  </select>
                </div>
              );
            })}
          </div>
        )}

        {question.qtype === "ordering" && (
          <div className="flex flex-col gap-1.5">
            <p className="mb-1 text-[11.5px] text-text-tertiary">Placez les éléments dans le bon ordre.</p>
            {(() => {
              const order = state.answer && state.answer.length > 0 ? state.answer : question.orderingItems.map((i) => i.key);
              const byKey = new Map(question.orderingItems.map((i) => [i.key, i.text]));
              return order.map((key, idx) => (
                <div key={key} className="flex flex-wrap items-center gap-2 rounded-md border border-border-default px-2.5 py-2">
                  <span className="w-5 shrink-0 text-[12px] text-text-tertiary">{idx + 1}.</span>
                  <span className="min-w-0 flex-1 text-[13.5px] text-text-primary">{byKey.get(key) ?? key}</span>
                  <button
                    type="button"
                    aria-label={`Monter : ${byKey.get(key) ?? key}`}
                    disabled={idx === 0}
                    onClick={() => {
                      const next = [...order];
                      [next[idx - 1], next[idx]] = [next[idx]!, next[idx - 1]!];
                      updateAnswer(next);
                    }}
                    className="rounded border border-border-default px-2 py-1 text-[11.5px] font-medium text-text-secondary disabled:opacity-30"
                  >
                    ↑ Monter
                  </button>
                  <button
                    type="button"
                    aria-label={`Descendre : ${byKey.get(key) ?? key}`}
                    disabled={idx === order.length - 1}
                    onClick={() => {
                      const next = [...order];
                      [next[idx], next[idx + 1]] = [next[idx + 1]!, next[idx]!];
                      updateAnswer(next);
                    }}
                    className="rounded border border-border-default px-2 py-1 text-[11.5px] font-medium text-text-secondary disabled:opacity-30"
                  >
                    ↓ Descendre
                  </button>
                </div>
              ));
            })()}
          </div>
        )}

        {question.qtype === "scenario" && question.scenario && (
          <div className="flex flex-col gap-4">
            <div className="rounded-md border border-border-subtle bg-surface-sunken p-3">
              <p className="whitespace-pre-wrap text-[13px] text-text-secondary">{question.scenario.context}</p>
              {question.scenario.documentRef && <p className="mt-2 text-[11.5px] text-text-tertiary">Document/référence : {question.scenario.documentRef}</p>}
            </div>
            {question.scenario.subquestions.map((sq, sqi) => {
              const subAnswer = state.scenarioAnswers[sq.id] ?? null;
              return (
                <div key={sq.id} className="rounded-md border border-border-default p-3">
                  <p className="mb-2 text-[13.5px] font-medium text-text-primary">Q{sqi + 1}. {sq.stem}</p>

                  {(sq.qtype === "mcq_single" || sq.qtype === "mcq_multi" || sq.qtype === "true_false") && (
                    <div className="flex flex-col gap-2">
                      {sq.multiSelect && <p className="text-[11px] text-text-tertiary">Plusieurs réponses possibles.</p>}
                      {sq.choices.map((c) => {
                        const selected = (subAnswer ?? []).includes(c.key);
                        return (
                          <label key={c.key} className={cn("flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2 text-[13px]", selected ? "border-accent-9 bg-accent-soft-bg text-accent-11" : "border-border-default text-text-secondary hover:border-border-strong")}>
                            <input
                              type={sq.multiSelect ? "checkbox" : "radio"}
                              checked={selected}
                              onChange={() =>
                                updateScenarioSub(sq.id, (prev) => {
                                  const cur = prev ?? [];
                                  return sq.multiSelect ? (cur.includes(c.key) ? cur.filter((k) => k !== c.key) : [...cur, c.key]) : [c.key];
                                })
                              }
                              className="h-4 w-4"
                            />
                            {c.text}
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {sq.qtype === "numeric" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        inputMode="decimal"
                        value={subAnswer?.[0] ?? ""}
                        onChange={(e) => updateScenarioSub(sq.id, () => (e.target.value ? [e.target.value] : []))}
                        className="w-40 rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]"
                        placeholder="Votre réponse"
                      />
                      {sq.unit && <span className="text-[12.5px] text-text-tertiary">{sq.unit}</span>}
                    </div>
                  )}

                  {sq.qtype === "short_answer" && (
                    <input
                      type="text"
                      value={subAnswer?.[0] ?? ""}
                      onChange={(e) => updateScenarioSub(sq.id, () => (e.target.value ? [e.target.value] : []))}
                      className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]"
                      placeholder="Votre réponse"
                    />
                  )}

                  {sq.qtype === "matching" && (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[11px] text-text-tertiary">Associez chaque élément à la bonne réponse.</p>
                      {sq.choices.filter((c) => c.key.startsWith("L")).map((l) => {
                        const rightOptions = sq.choices.filter((c) => c.key.startsWith("R"));
                        const map = new Map((subAnswer ?? []).map((p) => p.split(":") as [string, string]));
                        return (
                          <div key={l.key} className="flex flex-wrap items-center gap-2">
                            <span className="min-w-0 flex-1 text-[13px] text-text-primary">{l.text}</span>
                            <span aria-hidden="true" className="text-text-tertiary">→</span>
                            <select
                              aria-label={`Correspondance pour ${l.text}`}
                              value={map.get(l.key) ?? ""}
                              onChange={(e) => updateScenarioSub(sq.id, (prev) => setMatchingPair(prev, l.key, e.target.value))}
                              className="max-w-full min-w-0 rounded-md border border-border-default bg-surface-base px-2 py-1 text-[12.5px]"
                            >
                              <option value="">— Choisir —</option>
                              {rightOptions.map((r) => (<option key={r.key} value={r.key}>{r.text}</option>))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {sq.qtype === "ordering" && (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[11px] text-text-tertiary">Placez les éléments dans le bon ordre.</p>
                      {(() => {
                        const order = subAnswer && subAnswer.length > 0 ? subAnswer : sq.choices.map((c) => c.key);
                        const byKey = new Map(sq.choices.map((c) => [c.key, c.text]));
                        return order.map((key, idx) => (
                          <div key={key} className="flex flex-wrap items-center gap-2 rounded-md border border-border-default px-2 py-1.5">
                            <span className="w-5 shrink-0 text-[11.5px] text-text-tertiary">{idx + 1}.</span>
                            <span className="min-w-0 flex-1 text-[13px] text-text-primary">{byKey.get(key) ?? key}</span>
                            <button
                              type="button"
                              aria-label={`Monter : ${byKey.get(key) ?? key}`}
                              disabled={idx === 0}
                              onClick={() => {
                                const next = [...order];
                                [next[idx - 1], next[idx]] = [next[idx]!, next[idx - 1]!];
                                updateScenarioSub(sq.id, () => next);
                              }}
                              className="rounded border border-border-default px-1.5 py-0.5 text-[11px] font-medium text-text-secondary disabled:opacity-30"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              aria-label={`Descendre : ${byKey.get(key) ?? key}`}
                              disabled={idx === order.length - 1}
                              onClick={() => {
                                const next = [...order];
                                [next[idx], next[idx + 1]] = [next[idx + 1]!, next[idx]!];
                                updateScenarioSub(sq.id, () => next);
                              }}
                              className="rounded border border-border-default px-1.5 py-0.5 text-[11px] font-medium text-text-secondary disabled:opacity-30"
                            >
                              ↓
                            </button>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={reset} className="rounded-md border border-border-default px-3.5 py-2 text-[13px] font-medium text-text-secondary hover:border-border-strong">
          Réinitialiser
        </button>
        <button type="button" onClick={verify} disabled={pending} className="rounded-md bg-accent-9 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-accent-10 disabled:opacity-60">
          {pending ? "Vérification…" : "Vérifier ma réponse"}
        </button>
      </div>

      {result && !result.error && (
        <div
          className={cn(
            "flex items-start gap-2 rounded-md border p-3.5 text-[13px]",
            result.pending
              ? "border-border-subtle bg-surface-sunken text-text-secondary"
              : result.isCorrect
                ? "border-status-verified-border bg-status-verified-bg text-status-verified-text"
                : "border-status-critical-border bg-status-critical-bg text-status-critical-text"
          )}
        >
          {result.pending ? <Clock size={16} className="mt-0.5 shrink-0" /> : result.isCorrect ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <XCircle size={16} className="mt-0.5 shrink-0" />}
          <div>
            <p className="font-medium">
              {result.pending ? "Cette question est à correction manuelle — pas de verdict automatique (résultat test)." : result.isCorrect ? "Correcte (résultat test)" : "Incorrecte (résultat test)"}
            </p>
            {result.correctAnswerDisplay && <p className="mt-1 text-text-secondary">Réponse correcte attendue : {result.correctAnswerDisplay}</p>}
          </div>
        </div>
      )}
      {result?.error && <p className="text-[12.5px] text-status-critical-text">{result.error}</p>}
    </div>
  );
}
