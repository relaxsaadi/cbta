"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import type { ConsoleRole } from "@/lib/session";
import { segmentLabels } from "@/lib/nav-config";

export function Topbar({ role, onMenuClick }: { role: ConsoleRole; onMenuClick: () => void }) {
  const pathname = usePathname();
  const segment = pathname?.split("/").filter(Boolean)[0] ?? "";
  const labels = segmentLabels(role);
  const crumbs = ["KOST E-EXAM V2", labels[segment] ?? segment];

  return (
    <header
      className="no-print flex items-center justify-between gap-4 border-b border-border-subtle bg-surface-raised/90 backdrop-blur-sm px-6 sticky top-0 z-10"
      style={{ height: "var(--topbar-height)" }}
    >
      <div className="flex items-center gap-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-secondary hover:bg-surface-sunken transition-colors -ml-1.5"
          aria-label="Ouvrir le menu"
        >
          <Menu size={18} />
        </button>
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-[13px] min-w-0">
          {crumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2 min-w-0">
              {i > 0 && <span className="text-text-tertiary/60">/</span>}
              <span className={i === crumbs.length - 1 ? "font-display font-semibold text-text-primary truncate" : "text-text-tertiary truncate"}>
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <span
          className="hidden md:inline-flex items-center rounded-full border border-accent-soft-border bg-accent-soft-bg px-2.5 py-1 text-[11px] font-semibold tracking-wide text-accent-11 uppercase"
          title="Moteur natif KOST E-EXAM V2 — sans dépendance Moodle au runtime"
        >
          V2 natif
        </span>
      </div>
    </header>
  );
}
