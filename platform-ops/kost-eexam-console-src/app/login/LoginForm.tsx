"use client";

import { useActionState } from "react";
import { loginAction, type LoginResult } from "./actions";
import { ShieldCheck, PlaneTakeoff, Lock, FileCheck2, Radar } from "lucide-react";

const initialState: LoginResult = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-navy-950 px-12 py-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(120% 90% at 15% 0%, rgba(74,144,226,0.22) 0%, transparent 55%), radial-gradient(100% 80% at 100% 100%, rgba(74,144,226,0.10) 0%, transparent 50%)",
          }}
        />
        {/* faint flight-path lines — restrained, not decorative noise */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
          viewBox="0 0 600 800"
          fill="none"
        >
          <path d="M-20 620 C 140 560, 260 460, 400 340 S 560 120, 640 40" stroke="white" strokeWidth="1" />
          <path d="M-40 380 C 100 400, 240 340, 380 260 S 560 60, 660 -20" stroke="white" strokeWidth="1" />
          <circle cx="400" cy="340" r="2.5" fill="white" />
          <circle cx="240" cy="340" r="2.5" fill="white" />
        </svg>

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-gradient-to-br from-accent-glow to-accent-9 text-white shadow-lg">
            <PlaneTakeoff size={17} strokeWidth={2.25} />
          </div>
          <span className="font-display text-[15px] font-semibold tracking-tight text-navy-text">
            KOST E-EXAM
          </span>
        </div>

        <div className="relative max-w-[420px]">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.06em] text-navy-text-dim">
            <Radar size={11} />
            Aviation Compliance Systems
          </span>
          <h1 className="font-display text-[30px] font-semibold leading-[1.15] tracking-tight text-navy-text">
            Secure Aviation Examination &amp; Compliance Platform
          </h1>
          <p className="mt-4 text-[13.5px] leading-relaxed text-navy-text-dim">
            KOST Academy — the only accredited IATA CBTA Provider in Algeria. Developed in
            support of ANAC audit readiness for Dangerous Goods Regulations certification.
          </p>

          <div className="mt-8 flex flex-col gap-3.5 border-t border-navy-line pt-6">
            <Feature icon={Lock} text="Identity managed by Moodle — no separate credential store" />
            <Feature icon={ShieldCheck} text="Role-gated access — candidate accounts cannot sign in here" />
            <Feature icon={FileCheck2} text="Verified backups, restore-tested and off-site replicated" />
          </div>
        </div>

        <p className="relative text-[11px] text-navy-text-dim/70">
          © {new Date().getFullYear()} KOST Group — hosted on Algerian infrastructure
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-surface-base px-6 py-12">
        <div className="w-full max-w-[380px]">
          <div className="mb-8 lg:hidden flex flex-col items-center text-center">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-9 text-white">
              <PlaneTakeoff size={16} />
            </div>
            <h1 className="font-display text-[17px] font-semibold tracking-tight text-text-primary">
              KOST E-EXAM
            </h1>
          </div>

          <div className="mb-6 hidden lg:block">
            <h2 className="font-display text-[19px] font-semibold tracking-tight text-text-primary">
              Sign in
            </h2>
            <p className="mt-1 text-[13px] text-text-tertiary">
              Use your Moodle credentials to access the console.
            </p>
          </div>

          <form action={formAction} className="rounded-lg border border-border-subtle bg-surface-raised p-6 shadow-md">
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="username" className="mb-1.5 block text-[12.5px] font-medium text-text-secondary">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="w-full rounded-md border border-border-default bg-surface-base px-3 py-2 text-[13.5px] text-text-primary outline-none transition-colors focus:border-accent-9 focus:ring-2 focus:ring-accent-soft-bg"
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-[12.5px] font-medium text-text-secondary">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-md border border-border-default bg-surface-base px-3 py-2 text-[13.5px] text-text-primary outline-none transition-colors focus:border-accent-9 focus:ring-2 focus:ring-accent-soft-bg"
                />
              </div>

              {state.error && (
                <p className="rounded-md bg-status-critical-bg border border-status-critical-border px-3 py-2 text-[12.5px] text-status-critical-text">
                  {state.error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="mt-1 flex items-center justify-center rounded-md bg-accent-9 px-3 py-2.5 text-[13.5px] font-medium text-white transition-colors hover:bg-accent-10 disabled:opacity-60"
              >
                {pending ? "Signing in…" : "Sign in"}
              </button>
            </div>
          </form>

          <div className="mt-5 flex items-center justify-center gap-1.5 text-[11.5px] text-text-tertiary">
            <ShieldCheck size={13} />
            Restricted to authorized administrator, exam manager, instructor and auditor roles
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, text }: { icon: React.ComponentType<{ size?: number }>; text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/[0.05] text-accent-glow">
        <Icon size={12.5} />
      </div>
      <span className="text-[12.5px] text-navy-text-dim">{text}</span>
    </div>
  );
}
