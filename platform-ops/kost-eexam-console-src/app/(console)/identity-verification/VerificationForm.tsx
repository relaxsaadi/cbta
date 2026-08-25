"use client";

import { useActionState } from "react";
import { recordVerificationAction, type VerificationFormResult } from "./actions";
import { CheckCircle2 } from "lucide-react";

const initialState: VerificationFormResult = {};

export function VerificationForm() {
  const [state, formAction, isPending] = useActionState(recordVerificationAction, initialState);

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-status-verified-border bg-status-verified-bg px-6 py-10 text-center">
        <CheckCircle2 size={28} className="text-status-verified-text" />
        <p className="font-display text-[14.5px] font-semibold text-status-verified-text">Verification recorded</p>
        <p className="text-[12.5px] text-text-secondary max-w-[380px]">
          Logged with your identity, a timestamp, and the method used. This record cannot be edited afterward.
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

      <Field label="Candidate Moodle username" required>
        <input name="candidateUsername" required maxLength={100} className={inputClass} placeholder="e.g. test_candidate" />
      </Field>
      <Field label="Candidate full name" required>
        <input name="candidateFullName" required maxLength={150} className={inputClass} placeholder="As shown on official ID" />
      </Field>
      <Field label="Exam" required>
        <input name="examName" required maxLength={200} className={inputClass} placeholder="e.g. DGR Function 7.3 — Sample Exam" />
      </Field>
      <Field label="Session reference (optional)">
        <input name="sessionReference" maxLength={200} className={inputClass} placeholder="e.g. date / room / group" />
      </Field>

      <div className="rounded-md border border-border-subtle bg-surface-sunken/50 px-3.5 py-2.5 text-[12px] text-text-tertiary">
        Method: <strong className="text-text-secondary">Official ID + supervised verification</strong> — the
        supervisor confirms the candidate's identity against an official document and their Moodle account
        before granting exam access. No copy of the ID document is stored (data minimization).
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-md bg-accent-9 px-4 py-2 text-[13px] font-medium text-white hover:bg-accent-10 transition-colors disabled:opacity-60"
      >
        {isPending ? "Recording…" : "Record verification"}
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
