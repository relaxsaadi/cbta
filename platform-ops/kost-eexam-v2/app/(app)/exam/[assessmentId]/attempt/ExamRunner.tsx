"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveAnswerAction, toggleMarkAction, submitAttemptAction } from "./actions";

export interface RunnerQuestion {
  attempt_question_id: number;
  position: number;
  stem: string;
  choices: { key: string; text: string }[];
  marked_for_review: number;
  answer: string[] | null;
  multiSelect: boolean;
}

// Le chronomètre affiché est dérivé de `expiresAt`, calculé et stocké
// CÔTÉ SERVEUR au démarrage de la tentative (§8 de la mission) — ce
// composant ne fait qu'afficher un compte à rebours dérivé de cette valeur
// serveur ; un rafraîchissement recharge exactement la même `expiresAt`
// (revenue par le Server Component parent depuis la table `attempts`), donc
// le temps ne redémarre jamais. La garantie réelle contre un timer
// falsifié/gelé côté client est que CHAQUE sauvegarde de réponse et CHAQUE
// soumission revérifient l'expiration côté serveur (lib/attempts.ts,
// assertNotExpiredOrAutoSubmit) — l'auto-soumission ci-dessous est un
// confort UX, pas la source de vérité.
export function ExamRunner({
  attemptId,
  assessmentId,
  expiresAt,
  questionCount,
  initialQuestions,
  assessmentName,
}: {
  attemptId: number;
  assessmentId: number;
  expiresAt: string;
  questionCount: number;
  initialQuestions: RunnerQuestion[];
  assessmentName: string;
}) {
  const router = useRouter();
  const [questions, setQuestions] = useState(initialQuestions);
  const [index, setIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState(() => new Date(expiresAt).getTime() - Date.now());
  const [submitting, startSubmit] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const autoSubmitFired = useRef(false);

  const current = questions[index]!;

  const doSubmit = useCallback(() => {
    if (autoSubmitFired.current) return;
    autoSubmitFired.current = true;
    startSubmit(async () => {
      const res = await submitAttemptAction(attemptId);
      if (!res.ok && res.error) setError(res.error);
      router.push(`/mes-resultats?justSubmitted=${assessmentId}`);
    });
  }, [attemptId, assessmentId, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      const left = new Date(expiresAt).getTime() - Date.now();
      setRemainingMs(left);
      if (left <= 0) {
        clearInterval(interval);
        doSubmit();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, doSubmit]);

  function formatTime(ms: number): string {
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(total / 60)
      .toString()
      .padStart(2, "0");
    const s = (total % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function toggleChoice(key: string) {
    setQuestions((prev) => {
      const next = [...prev];
      const q = next[index]!;
      const current = q.answer ?? [];
      let updated: string[];
      if (q.multiSelect) {
        updated = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
      } else {
        updated = [key];
      }
      next[index] = { ...q, answer: updated };
      saveAnswerAction(attemptId, q.attempt_question_id, updated).then((res) => {
        if (!res.ok && res.error) {
          setError(res.error);
          if (res.expired) router.push(`/mes-resultats?justSubmitted=${assessmentId}`);
        }
      });
      return next;
    });
  }

  function toggleMark() {
    setQuestions((prev) => {
      const next = [...prev];
      const q = next[index]!;
      const marked = q.marked_for_review ? 0 : 1;
      next[index] = { ...q, marked_for_review: marked };
      toggleMarkAction(attemptId, q.attempt_question_id, marked === 1);
      return next;
    });
  }

  const answeredCount = questions.filter((q) => q.answer && q.answer.length > 0).length;
  const low = remainingMs < 60_000;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between rounded-md border border-border-subtle bg-surface-raised px-4 py-3">
        <div>
          <p className="text-[13px] font-medium text-text-primary">{assessmentName}</p>
          <p className="text-[11.5px] text-text-tertiary">Question {index + 1} / {questionCount}</p>
        </div>
        <div className={cn("rounded-md px-3 py-1.5 font-mono text-[16px] font-semibold", low ? "bg-status-critical-bg text-status-critical-text" : "bg-accent-soft-bg text-accent-11")}>
          {formatTime(remainingMs)}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {questions.map((q, i) => (
          <button
            key={q.attempt_question_id}
            onClick={() => setIndex(i)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md text-[12px] font-medium border",
              i === index
                ? "border-accent-9 bg-accent-9 text-white"
                : q.marked_for_review
                ? "border-status-warning-border bg-status-warning-bg text-status-warning-text"
                : q.answer && q.answer.length > 0
                ? "border-status-verified-border bg-status-verified-bg text-status-verified-text"
                : "border-border-default text-text-tertiary"
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-border-subtle bg-surface-raised p-5 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-3">
          <p className="text-[14.5px] font-medium text-text-primary">{current.stem}</p>
          <button onClick={toggleMark} className={cn("flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-[11.5px]", current.marked_for_review ? "border-status-warning-border bg-status-warning-bg text-status-warning-text" : "border-border-default text-text-tertiary")}>
            <Flag size={12} /> Marquer
          </button>
        </div>
        {current.multiSelect && <p className="mb-2 text-[11.5px] text-text-tertiary">Plusieurs réponses possibles.</p>}
        <div className="flex flex-col gap-2">
          {current.choices.map((c) => {
            const selected = (current.answer ?? []).includes(c.key);
            return (
              <label key={c.key} className={cn("flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2.5 text-[13.5px]", selected ? "border-accent-9 bg-accent-soft-bg text-accent-11" : "border-border-default text-text-secondary hover:border-border-strong")}>
                <input type={current.multiSelect ? "checkbox" : "radio"} checked={selected} onChange={() => toggleChoice(c.key)} className="h-4 w-4" />
                {c.text}
              </label>
            );
          })}
        </div>
      </div>

      {error && <p className="text-[12.5px] text-status-critical-text">{error}</p>}

      <div className="flex items-center justify-between">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="rounded-md border border-border-default px-3.5 py-2 text-[13px] font-medium text-text-secondary disabled:opacity-40"
        >
          Précédente
        </button>
        <p className="text-[12px] text-text-tertiary">{answeredCount} / {questionCount} répondue(s)</p>
        {index < questions.length - 1 ? (
          <button onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))} className="rounded-md bg-accent-9 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-accent-10">
            Suivante
          </button>
        ) : (
          <button onClick={doSubmit} disabled={submitting} className="rounded-md bg-status-verified-dot px-3.5 py-2 text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-60">
            {submitting ? "Envoi…" : "Terminer"}
          </button>
        )}
      </div>
    </div>
  );
}
