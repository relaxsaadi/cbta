"use client";

import { useActionState } from "react";
import { reportIncidentAction, type IncidentFormResult } from "./actions";
import { INCIDENT_CATEGORIES } from "@/lib/incident-constants";
import { CheckCircle2 } from "lucide-react";

const initialState: IncidentFormResult = {};

export function IncidentForm() {
  const [state, formAction, isPending] = useActionState(reportIncidentAction, initialState);

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-status-verified-border bg-status-verified-bg px-6 py-10 text-center">
        <CheckCircle2 size={28} className="text-status-verified-text" />
        <p className="font-display text-[14.5px] font-semibold text-status-verified-text">
          Incident reported
        </p>
        <p className="text-[12.5px] text-text-secondary max-w-[380px]">
          It has been logged in the console's incident tracker and is now visible on the Technical
          Incidents page with status "Open".
        </p>
        <a href="/incidents" className="mt-1 text-[12.5px] font-medium text-accent-9 underline underline-offset-2">
          View Technical Incidents →
        </a>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Category" required>
          <select name="category" required className={selectClass}>
            {INCIDENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Priority" required>
          <select name="priority" required defaultValue="medium" className={selectClass}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </Field>
      </div>

      <Field label="Subject" required>
        <input name="subject" required maxLength={200} className={inputClass} placeholder="Short summary of the issue" />
      </Field>

      <Field label="Description" required>
        <textarea
          name="description"
          required
          rows={5}
          className={inputClass}
          placeholder="What happened, when, and on which page or exam?"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Related exam (optional)">
          <input name="relatedExam" maxLength={200} className={inputClass} placeholder="e.g. DGR Function 7.3 — Sample Exam" />
        </Field>
        <Field label="Related session (optional)">
          <input name="relatedSession" maxLength={200} className={inputClass} placeholder="e.g. session date / group" />
        </Field>
      </div>

      <Field label="Attachment note (optional)">
        <input
          name="attachmentNote"
          maxLength={300}
          className={inputClass}
          placeholder="Describe a screenshot or file you can send by email if needed"
        />
      </Field>
      <p className="-mt-2 text-[11.5px] text-text-tertiary">
        File attachments are not yet uploaded directly — reference them here and send by email to{" "}
        <a href="mailto:cbta@kostacademy.com" className="text-accent-9 underline underline-offset-2">
          cbta@kostacademy.com
        </a>{" "}
        if needed.
      </p>

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-md bg-accent-9 px-4 py-2 text-[13px] font-medium text-white hover:bg-accent-10 transition-colors disabled:opacity-60"
      >
        {isPending ? "Submitting…" : "Submit incident report"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-border-default bg-surface-base px-3 py-2 text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-9/30 focus:border-accent-9";
const selectClass = inputClass;

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
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
