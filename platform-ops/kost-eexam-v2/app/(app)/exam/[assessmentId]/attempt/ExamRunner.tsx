"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveAnswerAction, saveScenarioSubanswerAction, toggleMarkAction, submitAttemptAction, type ActionResult } from "./actions";
import { Timer } from "./Timer";
import { AutosaveIndicator } from "./AutosaveIndicator";
import { QuestionNavigator } from "./QuestionNavigator";

interface ChoiceView {
  key: string;
  text: string;
}

// Mission "MISSION FINALE CIBLÉE" (2026-08-30) §4 — sous-question de
// scénario telle qu'exposée au candidat (jamais correctAnswer, voir
// lib/attempts.ts::ScenarioCandidateSubquestion, dont ce type est le
// miroir client).
interface RunnerSubquestion {
  id: string;
  qtype: string;
  stem: string;
  choices: ChoiceView[];
  unit: string | null;
  multiSelect: boolean;
  answer: string[] | null;
}

export interface RunnerQuestion {
  attempt_question_id: number;
  position: number;
  stem: string;
  qtype: string;
  choices: ChoiceView[];
  unit: string | null;
  marked_for_review: number;
  answer: string[] | null;
  multiSelect: boolean;
  matchingLeft: ChoiceView[];
  matchingRight: ChoiceView[];
  orderingItems: ChoiceView[];
  scenario: { context: string; documentRef: string | null; subquestions: RunnerSubquestion[] } | null;
}

/** Une question (top-niveau OU sous-question de scénario) est "répondue"
 * seulement quand TOUTES ses parties le sont — un scénario dont une seule
 * sous-question sur six est répondue ne compte jamais comme complet dans
 * le résumé/la navigation (§16 — cohérence du décompte pour le 8e type). */
function isQuestionAnswered(q: Pick<RunnerQuestion, "qtype" | "answer" | "scenario">): boolean {
  if (q.qtype === "scenario") {
    const subs = q.scenario?.subquestions ?? [];
    return subs.length > 0 && subs.every((sq) => !!(sq.answer && sq.answer.length > 0 && sq.answer[0] !== ""));
  }
  return !!(q.answer && q.answer.length > 0 && q.answer[0] !== "");
}

/** Fusionne/retire UNE paire "leftKey:rightKey" dans la réponse
 * d'appariement existante — jamais un tableau reconstruit depuis zéro (une
 * autre paire déjà choisie par le candidat ne doit jamais être perdue en
 * en modifiant une autre). rightKey="" retire la paire (candidat qui
 * repasse le select sur "— Choisir —"). */
function setMatchingPair(current: string[] | null, leftKey: string, rightKey: string): string[] {
  const map = new Map((current ?? []).map((p) => p.split(":") as [string, string]));
  if (rightKey) map.set(leftKey, rightKey);
  else map.delete(leftKey);
  return Array.from(map.entries()).map(([l, r]) => `${l}:${r}`);
}

export function ExamRunner({
  attemptId,
  assessmentId,
  expiresAt,
  durationMinutes,
  questionCount,
  initialQuestions,
  assessmentName,
}: {
  attemptId: number;
  assessmentId: number;
  expiresAt: string;
  durationMinutes: number;
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

  // Chaîne de sauvegardes SÉRIALISÉE par question (jamais plus d'une
  // requête réseau simultanée pour une même attempt_question_id) — bug réel
  // trouvé en E2E (mission "MISSION FINALE CIBLÉE", 2026-08-30) : deux
  // sauvegardes fire-and-forget envoyées coup sur coup (ex. les deux
  // sélections d'un appariement, ou deux sous-questions de SCÉNARIO
  // DIFFÉRENTES qui partagent la même colonne answer_json via un merge
  // lecture-modification-écriture, voir lib/attempts.ts::
  // saveScenarioSubanswer) n'ont AUCUNE garantie d'ordre d'arrivée réseau
  // entre deux requêtes indépendantes — la plus RÉCEMMENT ENVOYÉE pouvait
  // répondre AVANT la précédente, et la précédente écrasait alors la
  // réponse la plus fraîche à son tour (perte silencieuse d'une réponse
  // déjà donnée par le candidat). La sérialisation (une seule requête en
  // vol à la fois par question, la suivante n'étant ENVOYÉE qu'une fois la
  // précédente résolue) élimine cette course : l'ordre d'envoi == l'ordre
  // d'arrivée == l'ordre d'écriture côté serveur.
  const saveChainRef = useRef<Map<number, Promise<unknown>>>(new Map());
  function queueSave(attemptQuestionId: number, run: () => Promise<ActionResult>) {
    setSaveStatus("saving");
    const prevChain = saveChainRef.current.get(attemptQuestionId) ?? Promise.resolve();
    const chained = prevChain.then(run).then((res) => {
      if (!res.ok && res.error) {
        setSaveStatus("error");
        setError(res.error);
        if (res.expired) router.push(`/mes-resultats?justSubmitted=${assessmentId}&auto=1`);
      } else {
        setSaveStatus("saved");
      }
      return res;
    });
    // Une sauvegarde qui échoue ne doit jamais bloquer les suivantes pour la
    // même question (sinon UNE erreur réseau gèlerait tout l'autosave
    // restant) : la PROCHAINE sauvegarde se chaîne sur cette version
    // "avalée", jamais sur `chained` elle-même.
    saveChainRef.current.set(
      attemptQuestionId,
      chained.catch(() => {})
    );
    pendingSaves.current.push(chained);
  }

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
    const q = questions[index]!;
    queueSave(q.attempt_question_id, () => saveAnswerAction(attemptId, q.attempt_question_id, updated));
  }

  // --- Question COURANTE (top-niveau) — mcq/true_false/numeric/short_answer/matching/ordering. ---
  function toggleChoice(key: string) {
    setQuestions((prev) => {
      const next = [...prev];
      const q = next[index]!;
      const cur = q.answer ?? [];
      let updated: string[];
      if (q.multiSelect) {
        updated = cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key];
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

  // Appariement/ordre — commit immédiat à chaque interaction (pas de
  // "perte de focus" pertinente pour un select/bouton, contrairement au
  // texte libre ci-dessus).
  // Bug réel trouvé en E2E (mission "MISSION FINALE CIBLÉE", 2026-08-30) —
  // prend une fonction de calcul (jamais une valeur déjà calculée) qui LIT
  // la réponse précédente DEPUIS L'ÉTAT LE PLUS RÉCENT (même garantie que
  // toggleChoice ci-dessus) : deux interactions rapprochées (ex. deux
  // sélections d'appariement coup sur coup) capturaient sinon la MÊME
  // fermeture `current.answer` figée au rendu précédent, la seconde
  // écrasant silencieusement la première au lieu de la compléter.
  function setTopLevelAnswer(compute: (prevAnswer: string[] | null) => string[]) {
    setQuestions((prev) => {
      const next = [...prev];
      const q = next[index]!;
      const updated = compute(q.answer);
      next[index] = { ...q, answer: updated };
      saveCurrentAnswer(updated);
      return next;
    });
  }

  // --- Sous-questions de SCÉNARIO — même schéma, mais opère sur
  // questions[index].scenario.subquestions et sauvegarde via
  // saveScenarioSubanswerAction (fusion, jamais un écrasement du scénario
  // entier — voir lib/attempts.ts::saveScenarioSubanswer). Même garde
  // contre les fermetures figées que setTopLevelAnswer ci-dessus (compute
  // lit TOUJOURS la réponse la plus récente depuis l'état, jamais une
  // valeur déjà calculée en dehors de la mise à jour). ---
  function updateScenarioSubanswer(subquestionId: string, compute: (prevAnswer: string[] | null) => string[]) {
    let updatedForSave: string[] = [];
    setQuestions((prev) => {
      const next = [...prev];
      const q = next[index]!;
      if (!q.scenario) return prev;
      const currentSub = q.scenario.subquestions.find((sq) => sq.id === subquestionId);
      const updated = compute(currentSub?.answer ?? null);
      updatedForSave = updated;
      const nextSubs = q.scenario.subquestions.map((sq) => (sq.id === subquestionId ? { ...sq, answer: updated } : sq));
      next[index] = { ...q, scenario: { ...q.scenario, subquestions: nextSubs } };
      return next;
    });
    const q = questions[index]!;
    // Sérialisé sur `q.attempt_question_id` (la ligne du SCÉNARIO, pas de
    // la sous-question) — c'est précisément cette ligne qui subit le merge
    // lecture-modification-écriture côté serveur (voir commentaire sur
    // `queueSave` ci-dessus) : deux sous-questions différentes répondues
    // coup sur coup doivent voir leurs sauvegardes strictement séquencées.
    queueSave(q.attempt_question_id, () => saveScenarioSubanswerAction(attemptId, q.attempt_question_id, subquestionId, updatedForSave));
  }
  function setScenarioSubFreeText(subquestionId: string, value: string) {
    setQuestions((prev) => {
      const next = [...prev];
      const q = next[index]!;
      if (!q.scenario) return prev;
      const nextSubs = q.scenario.subquestions.map((sq) => (sq.id === subquestionId ? { ...sq, answer: value ? [value] : [] } : sq));
      next[index] = { ...q, scenario: { ...q.scenario, subquestions: nextSubs } };
      return next;
    });
  }
  function commitScenarioSubFreeText(subquestionId: string) {
    // setScenarioSubFreeText() a déjà posé la frappe en cours dans l'état
    // — compute() reçoit ici cette valeur la plus fraîche directement,
    // jamais besoin de relire `questions` par fermeture.
    updateScenarioSubanswer(subquestionId, (prevAnswer) => prevAnswer ?? []);
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

  const answeredCount = questions.filter(isQuestionAnswered).length;
  const unansweredCount = questionCount - answeredCount;
  const markedCount = questions.filter((q) => q.marked_for_review).length;
  const low = remainingMs < 60_000;

  if (mode === "review") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <div className="rounded-lg border border-border-subtle bg-surface-raised p-5 shadow-sm">
          <h1 className="mb-1 font-display text-[16px] font-semibold text-text-primary">Résumé de l&apos;examen</h1>
          <p className="mb-4 text-[12.5px] text-text-tertiary">{assessmentName}</p>
          {/* Mission §38 — 4 cartes-résumé (Répondues/Sans réponse/À
              revoir/Temps restant), jamais seulement les 3 premières. */}
          <dl className="grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-4">
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
            <div className="rounded-md bg-surface-sunken p-3 text-center">
              <dt className="text-text-tertiary">Temps restant</dt>
              <dd className={cn("mt-1 font-mono text-[18px] font-semibold", low ? "text-status-critical-text" : "text-text-primary")}>{formatTime(remainingMs)}</dd>
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
      {/* Mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS" (2026-08-30)
          §37 — mode focus : uniquement la marque KOST (déjà posée par
          ConsoleShell au niveau du layout, jamais dupliquée ici), le nom
          de l'examen, le chronomètre, la progression et le statut
          d'enregistrement — jamais de navigation admin exposée à un
          candidat sur cette page (elle n'existe structurellement pas
          ici, ExamRunner ne rend jamais la barre latérale). */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface-raised px-4 py-3">
        <div>
          <p className="text-[13px] font-medium text-text-primary">{assessmentName}</p>
          <p className="text-[11.5px] text-text-tertiary">Question {index + 1} / {questionCount}</p>
        </div>
        <Timer remainingMs={remainingMs} totalMs={durationMinutes * 60 * 1000} />
      </div>

      <QuestionNavigator
        items={questions.map((q) => ({ id: q.attempt_question_id, answered: isQuestionAnswered(q), markedForReview: !!q.marked_for_review }))}
        currentIndex={index}
        onSelect={setIndex}
      />

      <div data-testid="exam-question-card" data-qtype={current.qtype} className="rounded-lg border border-border-subtle bg-surface-raised p-5 shadow-sm">
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

        {/* §2 — Appariement : un <select> par élément de gauche, jamais
            drag-and-drop obligatoire, entièrement clavier/lecteur d'écran. */}
        {current.qtype === "matching" && (
          <div className="flex flex-col gap-2">
            <p className="text-[11.5px] text-text-tertiary">Associez chaque élément à la bonne réponse.</p>
            {current.matchingLeft.map((l) => {
              const map = new Map((current.answer ?? []).map((p) => p.split(":") as [string, string]));
              return (
                <div key={l.key} className="flex items-center gap-2">
                  <span className="flex-1 text-[13.5px] text-text-primary">{l.text}</span>
                  <span aria-hidden="true" className="text-text-tertiary">→</span>
                  <select
                    aria-label={`Correspondance pour ${l.text}`}
                    value={map.get(l.key) ?? ""}
                    onChange={(e) => setTopLevelAnswer((prevAnswer) => setMatchingPair(prevAnswer, l.key, e.target.value))}
                    className="rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[13px]"
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

        {/* §3 — Ordre/séquence : boutons Monter/Descendre, jamais
            drag-and-drop obligatoire. */}
        {current.qtype === "ordering" && (
          <div className="flex flex-col gap-1.5">
            <p className="mb-1 text-[11.5px] text-text-tertiary">Placez les éléments dans le bon ordre.</p>
            {(() => {
              const order = current.answer && current.answer.length > 0 ? current.answer : current.orderingItems.map((i) => i.key);
              const byKey = new Map(current.orderingItems.map((i) => [i.key, i.text]));
              return order.map((key, idx) => (
                <div key={key} data-testid="ordering-row" className="flex items-center gap-2 rounded-md border border-border-default px-2.5 py-2">
                  <span className="w-5 shrink-0 text-[12px] text-text-tertiary">{idx + 1}.</span>
                  <span className="flex-1 text-[13.5px] text-text-primary">{byKey.get(key) ?? key}</span>
                  <button
                    type="button"
                    aria-label={`Monter : ${byKey.get(key) ?? key}`}
                    disabled={idx === 0}
                    onClick={() =>
                      setTopLevelAnswer((prevAnswer) => {
                        const base = prevAnswer && prevAnswer.length > 0 ? prevAnswer : order;
                        const next = [...base];
                        [next[idx - 1], next[idx]] = [next[idx]!, next[idx - 1]!];
                        return next;
                      })
                    }
                    className="rounded border border-border-default px-2 py-1 text-[11.5px] font-medium text-text-secondary disabled:opacity-30"
                  >
                    ↑ Monter
                  </button>
                  <button
                    type="button"
                    aria-label={`Descendre : ${byKey.get(key) ?? key}`}
                    disabled={idx === order.length - 1}
                    onClick={() =>
                      setTopLevelAnswer((prevAnswer) => {
                        const base = prevAnswer && prevAnswer.length > 0 ? prevAnswer : order;
                        const next = [...base];
                        [next[idx], next[idx + 1]] = [next[idx + 1]!, next[idx]!];
                        return next;
                      })
                    }
                    className="rounded border border-border-default px-2 py-1 text-[11.5px] font-medium text-text-secondary disabled:opacity-30"
                  >
                    ↓ Descendre
                  </button>
                </div>
              ));
            })()}
          </div>
        )}

        {/* §4 — Scénario : contexte affiché UNE SEULE FOIS, puis chaque
            sous-question répondue indépendamment (même rendu par type que
            ci-dessus, réutilisé sous-question par sous-question). */}
        {current.qtype === "scenario" && current.scenario && (
          <div className="flex flex-col gap-4">
            <div className="rounded-md border border-border-subtle bg-surface-sunken p-3">
              <p className="whitespace-pre-wrap text-[13px] text-text-secondary">{current.scenario.context}</p>
              {current.scenario.documentRef && <p className="mt-2 text-[11.5px] text-text-tertiary">Document/référence : {current.scenario.documentRef}</p>}
            </div>
            {current.scenario.subquestions.map((sq, sqi) => (
              <div key={sq.id} data-testid={`scenario-answer-subquestion-${sqi}`} data-sub-qtype={sq.qtype} className="rounded-md border border-border-default p-3">
                <p className="mb-2 text-[13.5px] font-medium text-text-primary">Q{sqi + 1}. {sq.stem}</p>

                {(sq.qtype === "mcq_single" || sq.qtype === "mcq_multi" || sq.qtype === "true_false") && (
                  <div className="flex flex-col gap-2">
                    {sq.multiSelect && <p className="text-[11px] text-text-tertiary">Plusieurs réponses possibles.</p>}
                    {sq.choices.map((c) => {
                      const selected = (sq.answer ?? []).includes(c.key);
                      return (
                        <label key={c.key} className={cn("flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2 text-[13px]", selected ? "border-accent-9 bg-accent-soft-bg text-accent-11" : "border-border-default text-text-secondary hover:border-border-strong")}>
                          <input
                            type={sq.multiSelect ? "checkbox" : "radio"}
                            checked={selected}
                            onChange={() =>
                              updateScenarioSubanswer(sq.id, (prevAnswer) => {
                                const cur = prevAnswer ?? [];
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
                      value={sq.answer?.[0] ?? ""}
                      onChange={(e) => setScenarioSubFreeText(sq.id, e.target.value)}
                      onBlur={() => commitScenarioSubFreeText(sq.id)}
                      className="w-40 rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]"
                      placeholder="Votre réponse"
                    />
                    {sq.unit && <span className="text-[12.5px] text-text-tertiary">{sq.unit}</span>}
                  </div>
                )}

                {sq.qtype === "short_answer" && (
                  <input
                    type="text"
                    value={sq.answer?.[0] ?? ""}
                    onChange={(e) => setScenarioSubFreeText(sq.id, e.target.value)}
                    onBlur={() => commitScenarioSubFreeText(sq.id)}
                    className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]"
                    placeholder="Votre réponse"
                  />
                )}

                {sq.qtype === "matching" && (
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[11px] text-text-tertiary">Associez chaque élément à la bonne réponse.</p>
                    {sq.choices.filter((c) => c.key.startsWith("L")).map((l) => {
                      const rightOptions = sq.choices.filter((c) => c.key.startsWith("R"));
                      const map = new Map((sq.answer ?? []).map((p) => p.split(":") as [string, string]));
                      return (
                        <div key={l.key} className="flex items-center gap-2">
                          <span className="flex-1 text-[13px] text-text-primary">{l.text}</span>
                          <span aria-hidden="true" className="text-text-tertiary">→</span>
                          <select
                            aria-label={`Correspondance pour ${l.text}`}
                            value={map.get(l.key) ?? ""}
                            onChange={(e) => updateScenarioSubanswer(sq.id, (prevAnswer) => setMatchingPair(prevAnswer, l.key, e.target.value))}
                            className="rounded-md border border-border-default bg-surface-base px-2 py-1 text-[12.5px]"
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
                      const order = sq.answer && sq.answer.length > 0 ? sq.answer : sq.choices.map((c) => c.key);
                      const byKey = new Map(sq.choices.map((c) => [c.key, c.text]));
                      return order.map((key, idx) => (
                        <div key={key} data-testid="ordering-row" className="flex items-center gap-2 rounded-md border border-border-default px-2 py-1.5">
                          <span className="w-5 shrink-0 text-[11.5px] text-text-tertiary">{idx + 1}.</span>
                          <span className="flex-1 text-[13px] text-text-primary">{byKey.get(key) ?? key}</span>
                          <button
                            type="button"
                            aria-label={`Monter : ${byKey.get(key) ?? key}`}
                            disabled={idx === 0}
                            onClick={() =>
                              updateScenarioSubanswer(sq.id, (prevAnswer) => {
                                const base = prevAnswer && prevAnswer.length > 0 ? prevAnswer : order;
                                const next = [...base];
                                [next[idx - 1], next[idx]] = [next[idx]!, next[idx - 1]!];
                                return next;
                              })
                            }
                            className="rounded border border-border-default px-1.5 py-0.5 text-[11px] font-medium text-text-secondary disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            aria-label={`Descendre : ${byKey.get(key) ?? key}`}
                            disabled={idx === order.length - 1}
                            onClick={() =>
                              updateScenarioSubanswer(sq.id, (prevAnswer) => {
                                const base = prevAnswer && prevAnswer.length > 0 ? prevAnswer : order;
                                const next = [...base];
                                [next[idx], next[idx + 1]] = [next[idx + 1]!, next[idx]!];
                                return next;
                              })
                            }
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
            ))}
          </div>
        )}

        <div className="mt-2">
          <AutosaveIndicator status={saveStatus} />
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
          <button onClick={() => setMode("review")} className="rounded-md bg-status-verified-dot px-3.5 py-2 text-[13px] font-medium text-white hover:opacity-90">
            Vérifier avant d&apos;envoyer
          </button>
        )}
      </div>
    </div>
  );
}
