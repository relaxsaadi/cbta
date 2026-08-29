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
  qtype: string;
  choices: { key: string; text: string }[];
  unit: string | null;
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
  // Mission "COMPLETE CANDIDATE EXAM LIFECYCLE" (2026-08-29) §12-15 —
  // 'review' = écran récapitulatif obligatoire avant tout envoi manuel réel
  // (jamais un envoi direct depuis la dernière question). L'auto-soumission
  // par expiration du chronomètre (§20) contourne volontairement cet écran
  // — aucune interaction n'est possible quand le temps est écoulé.
  const [mode, setMode] = useState<"answering" | "review">("answering");
  const [remainingMs, setRemainingMs] = useState(() => new Date(expiresAt).getTime() - Date.now());
  const [submitting, startSubmit] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const autoSubmitFired = useRef(false);
  // La sauvegarde d'une réponse est déclenchée en "fire-and-forget" depuis
  // toggleChoice()/setFreeTextAnswer() (réactivité perçue — l'UI se met à
  // jour instantanément, sans attendre l'aller-retour serveur). Sans ce
  // suivi, un clic sur "Terminer et envoyer l'examen" juste après avoir
  // répondu à la dernière question pouvait atteindre le serveur AVANT que
  // cette réponse n'ait fini d'être enregistrée — la soumission comptait
  // alors cette question comme "non répondue". On garde ici la promesse de
  // chaque sauvegarde en cours pour les attendre TOUTES avant de soumettre,
  // sans jamais ralentir la navigation "Suivante"/"Précédente".
  const pendingSaves = useRef<Promise<unknown>[]>([]);

  const current = questions[index]!;

  const doSubmit = useCallback(
    (auto: boolean) => {
      if (autoSubmitFired.current) return;
      autoSubmitFired.current = true;
      startSubmit(async () => {
        await Promise.allSettled(pendingSaves.current);
        const res = await submitAttemptAction(attemptId, auto);
        if (!res.ok && res.error) setError(res.error);
        router.push(`/mes-resultats?justSubmitted=${assessmentId}&auto=${auto ? "1" : "0"}`);
      });
    },
    [attemptId, assessmentId, router]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const left = new Date(expiresAt).getTime() - Date.now();
      setRemainingMs(left);
      if (left <= 0) {
        clearInterval(interval);
        // §20 — temps écoulé : autosave déjà en vol (pendingSaves), puis
        // MÊME logique métier de soumission, jamais un second chemin de
        // notation. Aucun écran de révision/confirmation — il n'y a
        // structurellement plus de temps pour une interaction candidat.
        doSubmit(true);
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

  function saveCurrentAnswer(updated: string[]) {
    setSaveStatus("saving");
    const q = questions[index]!;
    const save = saveAnswerAction(attemptId, q.attempt_question_id, updated).then((res) => {
      if (!res.ok && res.error) {
        setSaveStatus("error");
        setError(res.error);
        if (res.expired) router.push(`/mes-resultats?justSubmitted=${assessmentId}&auto=1`);
      } else {
        setSaveStatus("saved");
      }
    });
    pendingSaves.current.push(save);
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
      saveCurrentAnswer(updated);
      return next;
    });
  }

  // Réponse libre (numeric/short_answer) — sauvegarde différée à la perte
  // de focus (§58-59), jamais à chaque frappe (éviterait un aller-retour
  // serveur par caractère). L'affichage local reste instantané (setQuestions
  // met à jour l'état avant tout appel réseau).
  function setFreeTextAnswer(value: string) {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index]!, answer: value ? [value] : [] };
      return next;
    });
  }
  function commitFreeTextAnswer() {
    const q = questions[index]!;
    saveCurrentAnswer(q.answer ?? []);
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

  const answeredCount = questions.filter((q) => q.answer && q.answer.length > 0 && q.answer[0] !== "").length;
  const unansweredCount = questionCount - answeredCount;
  const markedCount = questions.filter((q) => q.marked_for_review).length;
  const low = remainingMs < 60_000;

  if (mode === "review") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <div className="rounded-lg border border-border-subtle bg-surface-raised p-5 shadow-sm">
          <h1 className="mb-1 font-display text-[16px] font-semibold text-text-primary">Résumé de l&apos;examen</h1>
          <p className="mb-4 text-[12.5px] text-text-tertiary">{assessmentName}</p>
          <dl className="grid grid-cols-3 gap-3 text-[13px]">
            <div className="rounded-md bg-surface-sunken p-3 text-center">
              <dt className="text-text-tertiary">Questions répondues</dt>
              <dd className="mt-1 text-[18px] font-semibold text-status-verified-text">{answeredCount} / {questionCount}</dd>
            </div>
            <div className="rounded-md bg-surface-sunken p-3 text-center">
              <dt className="text-text-tertiary">Questions sans réponse</dt>
              <dd className={cn("mt-1 text-[18px] font-semibold", unansweredCount > 0 ? "text-status-critical-text" : "text-text-primary")}>{unansweredCount}</dd>
            </div>
            <div className="rounded-md bg-surface-sunken p-3 text-center">
              <dt className="text-text-tertiary">Marquées à revoir</dt>
              <dd className="mt-1 text-[18px] font-semibold text-status-warning-text">{markedCount}</dd>
            </div>
          </dl>

          {unansweredCount > 0 && (
            <p className="mt-4 rounded-md border border-status-warning-border bg-status-warning-bg px-3 py-2 text-[12.5px] text-status-warning-text">
              Certaines questions n&apos;ont pas de réponse — {answeredCount} question(s) répondue(s) sur {questionCount}, {unansweredCount} sans réponse.
            </p>
          )}

          {error && <p className="mt-3 text-[12.5px] text-status-critical-text">{error}</p>}

          <div className="mt-5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMode("answering")}
              className="rounded-md border border-border-default px-3.5 py-2 text-[13px] font-medium text-text-secondary hover:border-border-strong"
            >
              Retourner aux questions
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                if (confirm("Voulez-vous vraiment terminer et envoyer votre examen ?\n\nAprès l'envoi, vous ne pourrez plus modifier vos réponses.")) {
                  doSubmit(false);
                }
              }}
              className="rounded-md bg-status-verified-dot px-3.5 py-2 text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Envoi…" : "Terminer et envoyer l'examen"}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        {questions.map((q, i) => {
          const answered = q.answer && q.answer.length > 0 && q.answer[0] !== "";
          return (
            <button
              key={q.attempt_question_id}
              onClick={() => setIndex(i)}
              title={answered ? "Répondue" : "Sans réponse"}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md text-[12px] font-medium border",
                i === index
                  ? "border-accent-9 bg-accent-9 text-white"
                  : q.marked_for_review
                    ? "border-status-warning-border bg-status-warning-bg text-status-warning-text"
                    : answered
                      ? "border-status-verified-border bg-status-verified-bg text-status-verified-text"
                      : "border-border-default text-text-tertiary"
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border border-border-subtle bg-surface-raised p-5 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-3">
          <p className="text-[14.5px] font-medium text-text-primary">{current.stem}</p>
          <button onClick={toggleMark} className={cn("flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-[11.5px]", current.marked_for_review ? "border-status-warning-border bg-status-warning-bg text-status-warning-text" : "border-border-default text-text-tertiary")}>
            <Flag size={12} /> Marquer à revoir
          </button>
        </div>

        {(current.qtype === "mcq_single" || current.qtype === "mcq_multi" || current.qtype === "true_false") && (
          <>
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
          </>
        )}

        {current.qtype === "numeric" && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              value={current.answer?.[0] ?? ""}
              onChange={(e) => setFreeTextAnswer(e.target.value)}
              onBlur={commitFreeTextAnswer}
              className="w-40 rounded-md border border-border-default bg-surface-base px-3 py-2 text-[14px]"
              placeholder="Votre réponse"
            />
            {current.unit && <span className="text-[13px] text-text-tertiary">{current.unit}</span>}
          </div>
        )}

        {current.qtype === "short_answer" && (
          <input
            type="text"
            value={current.answer?.[0] ?? ""}
            onChange={(e) => setFreeTextAnswer(e.target.value)}
            onBlur={commitFreeTextAnswer}
            className="w-full rounded-md border border-border-default bg-surface-base px-3 py-2 text-[14px]"
            placeholder="Votre réponse"
          />
        )}

        <p className="mt-2 text-[11px] text-text-tertiary">
          {saveStatus === "saving" ? "Enregistrement…" : saveStatus === "saved" ? "Enregistré" : saveStatus === "error" ? "Erreur d'enregistrement" : ""}
        </p>
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
          <button onClick={() => setMode("review")} className="rounded-md bg-status-verified-dot px-3.5 py-2 text-[13px] font-medium text-white hover:opacity-90">
            Vérifier avant d&apos;envoyer
          </button>
        )}
      </div>
    </div>
  );
}
