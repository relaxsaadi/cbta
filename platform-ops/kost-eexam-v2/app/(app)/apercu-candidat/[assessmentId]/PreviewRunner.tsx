"use client";

import { useMemo, useState } from "react";
import { Flag, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Timer } from "@/components/ui/Timer";
import { QuestionNavigator } from "@/components/ui/QuestionNavigator";

// Mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS" (2026-08-30) §20-26 —
// mode APERÇU CANDIDAT. Volontairement un composant SÉPARÉ de
// ExamRunner.tsx (app/(app)/exam/[assessmentId]/attempt/ExamRunner.tsx),
// jamais le même — la garantie de sécurité centrale ici n'est pas "les
// mêmes actions serveur mais désactivées", c'est qu'AUCUNE action serveur
// n'existe du tout dans ce fichier : aucun import de saveAnswerAction/
// submitAttemptAction/etc, donc structurellement impossible d'écrire dans
// attempts/attempt_answers/results depuis cet écran, quel que soit un bug
// futur de garde applicative. Toute interaction (répondre, marquer à
// revoir, naviguer, "terminer") ne modifie jamais que l'état React local
// de CE composant — jamais persistée, jamais envoyée au serveur, disparaît
// intégralement à la navigation/au rafraîchissement (§22/§23).

interface ChoiceView {
  key: string;
  text: string;
}
interface PreviewSubquestion {
  id: string;
  qtype: string;
  stem: string;
  choices: ChoiceView[];
  unit: string | null;
  multiSelect: boolean;
}
export interface PreviewQuestion {
  attempt_question_id: number;
  position: number;
  stem: string;
  qtype: string;
  choices: ChoiceView[];
  unit: string | null;
  multiSelect: boolean;
  matchingLeft: ChoiceView[];
  matchingRight: ChoiceView[];
  orderingItems: ChoiceView[];
  scenario: { context: string; documentRef: string | null; subquestions: PreviewSubquestion[] } | null;
}

interface LocalAnswerState {
  answer: string[] | null;
  markedForReview: boolean;
  scenarioAnswers: Record<string, string[] | null>;
}

// Réservé à la carte-résumé "Temps restant" de l'écran de vérification
// (parité avec ExamRunner.tsx §38) — Timer.tsx (composant partagé) a son
// propre formatage interne, non exporté ; ce format MM:SS local n'a besoin
// que d'exister ici.
function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function isAnswered(q: PreviewQuestion, state: LocalAnswerState): boolean {
  if (q.qtype === "scenario") {
    const subs = q.scenario?.subquestions ?? [];
    return subs.length > 0 && subs.every((sq) => {
      const a = state.scenarioAnswers[sq.id];
      return !!(a && a.length > 0 && a[0] !== "");
    });
  }
  return !!(state.answer && state.answer.length > 0 && state.answer[0] !== "");
}

function setMatchingPair(current: string[] | null, leftKey: string, rightKey: string): string[] {
  const map = new Map((current ?? []).map((p) => p.split(":") as [string, string]));
  if (rightKey) map.set(leftKey, rightKey);
  else map.delete(leftKey);
  return Array.from(map.entries()).map(([l, r]) => `${l}:${r}`);
}

export function PreviewRunner({
  assessmentName,
  functionLabel,
  durationMinutes,
  questions,
  candidateLabel,
}: {
  assessmentName: string;
  functionLabel: string;
  durationMinutes: number;
  questions: PreviewQuestion[];
  candidateLabel: string | null;
}) {
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"answering" | "review" | "finished">("answering");
  // Chronomètre PUREMENT COSMÉTIQUE (§21 "timer appearance") — jamais
  // authoritative, jamais liée à un vrai expiresAt serveur (il n'existe
  // aucune vraie tentative). Fixe, non décompté automatiquement : un
  // aperçu n'a pas besoin d'un vrai décompte pour montrer l'APPARENCE du
  // chronomètre à un responsable/administrateur.
  const totalMs = durationMinutes * 60 * 1000;
  const [states, setStates] = useState<Record<number, LocalAnswerState>>(() =>
    Object.fromEntries(questions.map((q) => [q.attempt_question_id, { answer: null, markedForReview: false, scenarioAnswers: {} }]))
  );

  const current = questions[index];
  const currentState = current ? states[current.attempt_question_id]! : undefined;
  const answeredCount = useMemo(() => questions.filter((q) => isAnswered(q, states[q.attempt_question_id]!)).length, [questions, states]);
  const unansweredCount = questions.length - answeredCount;
  const markedCount = useMemo(() => questions.filter((q) => states[q.attempt_question_id]?.markedForReview).length, [questions, states]);

  function updateCurrent(patch: Partial<LocalAnswerState>) {
    if (!current) return;
    setStates((prev) => ({ ...prev, [current.attempt_question_id]: { ...prev[current.attempt_question_id]!, ...patch } }));
  }
  function toggleChoice(key: string) {
    if (!current || !currentState) return;
    const cur = currentState.answer ?? [];
    const updated = current.multiSelect ? (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]) : [key];
    updateCurrent({ answer: updated });
  }
  function toggleMark() {
    if (!currentState) return;
    updateCurrent({ markedForReview: !currentState.markedForReview });
  }
  function updateScenarioSub(subId: string, compute: (prev: string[] | null) => string[]) {
    if (!current || !currentState) return;
    const updated = compute(currentState.scenarioAnswers[subId] ?? null);
    updateCurrent({ scenarioAnswers: { ...currentState.scenarioAnswers, [subId]: updated } });
  }

  const PreviewBanner = (
    <div className="flex items-center gap-2 rounded-md border border-status-warning-border bg-status-warning-bg px-3.5 py-2.5 text-[12.5px] font-medium text-status-warning-text">
      <Eye size={15} className="shrink-0" />
      MODE APERÇU — aucune action ne sera enregistrée dans l&apos;historique du candidat.
    </div>
  );

  if (mode === "finished") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        {PreviewBanner}
        <div className="rounded-lg border border-border-subtle bg-surface-raised p-6 text-center shadow-sm">
          <h1 className="mb-2 font-display text-[17px] font-semibold text-text-primary">Aperçu — écran de confirmation</h1>
          <p className="mb-4 text-[13px] text-text-secondary">
            C&apos;est ici que le candidat verrait la confirmation d&apos;envoi de son examen. Aucun envoi réel n&apos;a eu lieu.
          </p>
          {/* §21 "result layout where safe" — mise en page du résultat,
              données explicitement fictives, jamais un vrai score. */}
          <div className="mx-auto max-w-sm rounded-md border border-dashed border-border-strong bg-surface-sunken p-4 text-left">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">Exemple non réel</p>
            <p className="text-[13px] text-text-primary">Score : —/100 (exemple)</p>
            <p className="text-[13px] text-text-primary">Statut : En attente de correction (exemple)</p>
          </div>
          <button type="button" onClick={() => { setMode("answering"); setIndex(0); }} className="mt-5 rounded-md border border-border-default px-3.5 py-2 text-[13px] font-medium text-text-secondary hover:border-border-strong">
            Revenir au début de l&apos;aperçu
          </button>
        </div>
      </div>
    );
  }

  if (mode === "review") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        {PreviewBanner}
        <div className="rounded-lg border border-border-subtle bg-surface-raised p-5 shadow-sm">
          <h1 className="mb-1 font-display text-[16px] font-semibold text-text-primary">Résumé de l&apos;examen (aperçu)</h1>
          <p className="mb-4 text-[12.5px] text-text-tertiary">{assessmentName}</p>
          <dl className="grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-4">
            <div className="rounded-md bg-surface-sunken p-3 text-center">
              <dt className="text-text-tertiary">Questions répondues</dt>
              <dd className="mt-1 text-[18px] font-semibold text-status-verified-text">{answeredCount} / {questions.length}</dd>
            </div>
            <div className="rounded-md bg-surface-sunken p-3 text-center">
              <dt className="text-text-tertiary">Questions sans réponse</dt>
              <dd className={cn("mt-1 text-[18px] font-semibold", unansweredCount > 0 ? "text-status-critical-text" : "text-text-primary")}>{unansweredCount}</dd>
            </div>
            <div className="rounded-md bg-surface-sunken p-3 text-center">
              <dt className="text-text-tertiary">Marquées à revoir</dt>
              <dd className="mt-1 text-[18px] font-semibold text-status-warning-text">{markedCount}</dd>
            </div>
            <div className="rounded-md bg-surface-sunken p-3 text-center">
              <dt className="text-text-tertiary">Temps restant</dt>
              <dd className="mt-1 text-[18px] font-semibold text-text-primary">{formatDuration(totalMs)}</dd>
            </div>
          </dl>
          <div className="mt-5 flex items-center justify-between">
            <button type="button" onClick={() => setMode("answering")} className="rounded-md border border-border-default px-3.5 py-2 text-[13px] font-medium text-text-secondary hover:border-border-strong">
              Retourner aux questions
            </button>
            <button type="button" onClick={() => setMode("finished")} className="rounded-md bg-status-verified-dot px-3.5 py-2 text-[13px] font-medium text-white hover:opacity-90">
              Terminer et envoyer l&apos;examen (aperçu)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!current || !currentState) {
    return <div className="mx-auto max-w-2xl">{PreviewBanner}<p className="mt-4 text-[13px] text-text-tertiary">Aucune question à prévisualiser pour cet examen.</p></div>;
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      {PreviewBanner}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface-raised px-4 py-3">
        <div>
          <p className="text-[13px] font-medium text-text-primary">{assessmentName} — {functionLabel}</p>
          <p className="text-[11.5px] text-text-tertiary">
            Question {index + 1} / {questions.length}{candidateLabel ? ` — vu comme ${candidateLabel}` : ""}
          </p>
        </div>
        {/* Chronomètre illustratif — jamais décompté (§21 "timer
            appearance" seulement, aucune vraie tentative n'existe en mode
            aperçu) : remainingMs = totalMs en permanence, montre l'état
            "Normal" du même composant Timer que l'examen réel. */}
        <Timer remainingMs={totalMs} totalMs={totalMs} />
      </div>

      <QuestionNavigator
        items={questions.map((q) => ({ id: q.attempt_question_id, answered: isAnswered(q, states[q.attempt_question_id]!), markedForReview: !!states[q.attempt_question_id]?.markedForReview }))}
        currentIndex={index}
        onSelect={setIndex}
      />

      <div data-testid="preview-question-card" data-qtype={current.qtype} className="rounded-lg border border-border-subtle bg-surface-raised p-5 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-3">
          <p className="text-[14.5px] font-medium text-text-primary">{current.stem}</p>
          <button onClick={toggleMark} className={cn("flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-[11.5px]", currentState.markedForReview ? "border-status-warning-border bg-status-warning-bg text-status-warning-text" : "border-border-default text-text-tertiary")}>
            <Flag size={12} /> Marquer à revoir
          </button>
        </div>

        {(current.qtype === "mcq_single" || current.qtype === "mcq_multi" || current.qtype === "true_false") && (
          <>
            {current.multiSelect && <p className="mb-2 text-[11.5px] text-text-tertiary">Plusieurs réponses possibles.</p>}
            <div className="flex flex-col gap-2">
              {current.choices.map((c) => {
                const selected = (currentState.answer ?? []).includes(c.key);
                return (
                  <label key={c.key} className={cn("flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2.5 text-[13.5px]", selected ? "border-accent-9 bg-accent-soft-bg text-accent-11" : "border-border-default text-text-secondary hover:border-border-strong")}>
                    <input type={current.multiSelect ? "checkbox" : "radio"} checked={selected} onChange={() => toggleChoice(c.key)} className="h-4 w-4" />
                    {c.text}
                  </label>
                );
              })}
            </div>
          </>
        )}

        {current.qtype === "numeric" && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              value={currentState.answer?.[0] ?? ""}
              onChange={(e) => updateCurrent({ answer: e.target.value ? [e.target.value] : [] })}
              className="w-40 rounded-md border border-border-default bg-surface-base px-3 py-2 text-[14px]"
              placeholder="Votre réponse"
            />
            {current.unit && <span className="text-[13px] text-text-tertiary">{current.unit}</span>}
          </div>
        )}

        {current.qtype === "short_answer" && (
          <input
            type="text"
            value={currentState.answer?.[0] ?? ""}
            onChange={(e) => updateCurrent({ answer: e.target.value ? [e.target.value] : [] })}
            className="w-full rounded-md border border-border-default bg-surface-base px-3 py-2 text-[14px]"
            placeholder="Votre réponse"
          />
        )}

        {current.qtype === "matching" && (
          <div className="flex flex-col gap-2">
            <p className="text-[11.5px] text-text-tertiary">Associez chaque élément à la bonne réponse.</p>
            {current.matchingLeft.map((l) => {
              const map = new Map((currentState.answer ?? []).map((p) => p.split(":") as [string, string]));
              return (
                <div key={l.key} className="flex flex-wrap items-center gap-2">
                  <span className="min-w-0 flex-1 text-[13.5px] text-text-primary">{l.text}</span>
                  <span aria-hidden="true" className="text-text-tertiary">→</span>
                  <select
                    aria-label={`Correspondance pour ${l.text}`}
                    value={map.get(l.key) ?? ""}
                    onChange={(e) => updateCurrent({ answer: setMatchingPair(currentState.answer, l.key, e.target.value) })}
                    className="max-w-full min-w-0 rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[13px]"
                  >
                    <option value="">— Choisir —</option>
                    {current.matchingRight.map((r) => (
                      <option key={r.key} value={r.key}>{r.text}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        )}

        {current.qtype === "ordering" && (
          <div className="flex flex-col gap-1.5">
            <p className="mb-1 text-[11.5px] text-text-tertiary">Placez les éléments dans le bon ordre.</p>
            {(() => {
              const order = currentState.answer && currentState.answer.length > 0 ? currentState.answer : current.orderingItems.map((i) => i.key);
              const byKey = new Map(current.orderingItems.map((i) => [i.key, i.text]));
              return order.map((key, idx) => (
                <div key={key} className="flex flex-wrap items-center gap-2 rounded-md border border-border-default px-2.5 py-2">
                  <span className="w-5 shrink-0 text-[12px] text-text-tertiary">{idx + 1}.</span>
                  <span className="min-w-0 flex-1 text-[13.5px] text-text-primary">{byKey.get(key) ?? key}</span>
                  <button
                    type="button"
                    aria-label={`Monter : ${byKey.get(key) ?? key}`}
                    disabled={idx === 0}
                    onClick={() => {
                      const base = currentState.answer && currentState.answer.length > 0 ? currentState.answer : order;
                      const next = [...base];
                      [next[idx - 1], next[idx]] = [next[idx]!, next[idx - 1]!];
                      updateCurrent({ answer: next });
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
                      const base = currentState.answer && currentState.answer.length > 0 ? currentState.answer : order;
                      const next = [...base];
                      [next[idx], next[idx + 1]] = [next[idx + 1]!, next[idx]!];
                      updateCurrent({ answer: next });
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

        {current.qtype === "scenario" && current.scenario && (
          <div className="flex flex-col gap-4">
            <div className="rounded-md border border-border-subtle bg-surface-sunken p-3">
              <p className="whitespace-pre-wrap text-[13px] text-text-secondary">{current.scenario.context}</p>
              {current.scenario.documentRef && <p className="mt-2 text-[11.5px] text-text-tertiary">Document/référence : {current.scenario.documentRef}</p>}
            </div>
            {current.scenario.subquestions.map((sq, sqi) => {
              const subAnswer = currentState.scenarioAnswers[sq.id] ?? null;
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
                              {rightOptions.map((r) => (
                                <option key={r.key} value={r.key}>{r.text}</option>
                              ))}
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
                                const base = subAnswer && subAnswer.length > 0 ? subAnswer : order;
                                const next = [...base];
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
                                const base = subAnswer && subAnswer.length > 0 ? subAnswer : order;
                                const next = [...base];
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
        <button
          type="button"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className="rounded-md border border-border-default px-3.5 py-2 text-[13px] font-medium text-text-secondary disabled:opacity-40"
        >
          Précédente
        </button>
        {index === questions.length - 1 ? (
          <button type="button" onClick={() => setMode("review")} className="rounded-md bg-accent-9 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-accent-10">
            Vérifier avant d&apos;envoyer
          </button>
        ) : (
          <button type="button" onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))} className="rounded-md bg-accent-9 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-accent-10">
            Suivante
          </button>
        )}
      </div>
    </div>
  );
}
