"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, EyeOff, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { DEMO_MODE_COOKIE } from "@/lib/demo-mode";
import { SEGMENT_LABELS } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

function readDemoModeCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c === `${DEMO_MODE_COOKIE}=1`);
}

export function Topbar({ systemOk }: { systemOk: boolean }) {
  const pathname = usePathname();
  const segment = pathname?.split("/").filter(Boolean)[0] ?? "";
  const crumbs = ["KOST E-EXAM", SEGMENT_LABELS[segment] ?? segment];
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    setDemoMode(readDemoModeCookie());
  }, []);

  function toggleDemoMode() {
    const next = !demoMode;
    document.cookie = next
      ? `${DEMO_MODE_COOKIE}=1; path=/; max-age=${60 * 60 * 12}; SameSite=Strict`
      : `${DEMO_MODE_COOKIE}=; path=/; max-age=0; SameSite=Strict`;
    // Full reload (not router.refresh()) — a security-sensitive redaction
    // toggle must deterministically re-render every server component with
    // the new cookie value, not rely on RSC refresh timing.
    window.location.reload();
  }

  return (
    <header
      className="no-print flex items-center justify-between gap-4 border-b border-border-subtle bg-surface-raised/90 backdrop-blur-sm px-6 sticky top-0 z-10"
      style={{ height: "var(--topbar-height)" }}
    >
      <nav className="flex items-center gap-2 text-[13px] min-w-0">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2 min-w-0">
            {i > 0 && <span className="text-text-tertiary/60">/</span>}
            <span
              className={
                i === crumbs.length - 1
                  ? "font-display font-semibold text-text-primary truncate"
                  : "text-text-tertiary truncate"
              }
            >
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-2.5 shrink-0">
        <button
          className="flex items-center gap-2 rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px] text-text-tertiary hover:border-border-strong transition-colors"
          aria-label="Rechercher"
        >
          <Search size={14} />
          <span className="hidden lg:inline">Rechercher…</span>
          <kbd className="hidden lg:inline ml-2 rounded border border-border-default bg-surface-raised px-1 py-[1px] text-[10px] font-mono text-text-tertiary">
            ⌘K
          </kbd>
        </button>

        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-border-default bg-surface-base pl-2 pr-3 py-1">
          <span className="relative flex h-1.5 w-1.5">
            {systemOk && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-verified-dot opacity-60" />
            )}
            <span
              className="relative inline-flex h-1.5 w-1.5 rounded-full"
              style={{ background: systemOk ? "var(--status-verified-dot)" : "var(--status-critical-dot)" }}
            />
          </span>
          <span className="text-[12px] font-medium text-text-secondary">
            {systemOk ? "Opérationnel" : "Anomalie détectée"}
          </span>
        </div>

        <div className="hidden md:block h-4 w-px bg-border-default" />

        <button
          onClick={toggleDemoMode}
          title="Mode Présentation — masque à l'écran noms/e-mails/IP pour une démonstration ; ne modifie jamais les données réelles"
          className={cn(
            "hidden sm:flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase transition-colors",
            demoMode
              ? "border-accent-9 bg-accent-9 text-white"
              : "border-border-default bg-surface-base text-text-tertiary hover:border-border-strong"
          )}
        >
          {demoMode ? <EyeOff size={12} /> : <Eye size={12} />}
          {demoMode ? "Mode présentation actif" : "Mode présentation"}
        </button>

        <div className="hidden md:block h-4 w-px bg-border-default" />

        <span
          className="hidden md:inline-flex items-center rounded-full border border-accent-soft-border bg-accent-soft-bg px-2.5 py-1 text-[11px] font-semibold tracking-wide text-accent-11 uppercase"
          title="Environnement de production du logiciel console — n'indique pas que toutes les données affichées sont des tentatives d'examen réelles ; voir le filtre de périmètre sur Vue d'ensemble / Rapports"
        >
          Environnement de production
        </span>

        <button
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-surface-sunken transition-colors"
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>
      </div>
    </header>
  );
}
