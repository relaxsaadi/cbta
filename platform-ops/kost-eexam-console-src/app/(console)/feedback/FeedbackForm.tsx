"use client";

import { useActionState, useState } from "react";
import { submitFeedbackAction, type FeedbackFormResult } from "./actions";
import { FEEDBACK_CATEGORIES } from "@/lib/feedback-constants";
import { CheckCircle2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const initialState: FeedbackFormResult = {};

export function FeedbackForm() {
  const [state, formAction, isPending] = useActionState(submitFeedbackAction, initialState);
  const [rating, setRating] = useState(0);

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-status-verified-border bg-status-verified-bg px-6 py-10 text-center">
        <CheckCircle2 size={28} className="text-status-verified-text" />
        <p className="font-display text-[14.5px] font-semibold text-status-verified-text">Retour enregistré</p>
        <p className="text-[12.5px] text-text-secondary max-w-[380px]">
          Il est maintenant visible par les administrateurs dans l&apos;onglet Revue des retours avec le statut « Nouveau ».
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <div className="rounded-md border border-status-critical-border bg-status-critical-bg px-3.5 py-2.5 text-[12.5px] text-status-critical-text">
          {state.error}
        </div>
      )}

      <div>
        <span className="text-[12px] font-medium text-text-secondary">Note *</span>
        <div className="mt-1.5 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className="p-0.5"
              aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
            >
              <Star
                size={22}
                className={cn(n <= rating ? "fill-accent-9 text-accent-9" : "text-border-strong")}
              />
            </button>
          ))}
          <input type="hidden" name="rating" value={rating} />
        </div>
      </div>

      <Field label="Catégorie" required>
        <select name="category" required className={inputClass}>
          {FEEDBACK_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Examen / session (optionnel)">
        <input name="relatedExam" maxLength={200} className={inputClass} placeholder="ex. DGR Function 7.3 — Sample Exam" />
      </Field>

      <Field label="Commentaire (optionnel)">
        <textarea name="comment" rows={4} className={inputClass} placeholder="Qu'est-ce qui a bien fonctionné, ou que pourrait-on améliorer ?" />
      </Field>

      <button
        type="submit"
        disabled={isPending || rating === 0}
        className="self-start rounded-md bg-accent-9 px-4 py-2 text-[13px] font-medium text-white hover:bg-accent-10 transition-colors disabled:opacity-60"
      >
        {isPending ? "Envoi…" : "Envoyer le retour"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-border-default bg-surface-base px-3 py-2 text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-9/30 focus:border-accent-9";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-text-secondary">
        {label}
        {required && <span className="text-status-critical-text"> *</span>}
      </span>
      {children}
    </label>
  );
}
