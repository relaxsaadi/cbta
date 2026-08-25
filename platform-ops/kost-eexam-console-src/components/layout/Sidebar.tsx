"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, LogOut, PlaneTakeoff } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "@/lib/nav-config";

export function Sidebar({
  user,
}: {
  user: { name: string; role: string };
}) {
  const pathname = usePathname();

  return (
    <aside
      className="no-print hidden md:flex flex-col shrink-0 bg-navy-950 relative"
      style={{ width: "var(--sidebar-width)", boxShadow: "var(--shadow-navy)" }}
    >
      {/* subtle ambient gradient for depth, not decoration for its own sake */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-56 opacity-60"
        style={{
          background:
            "radial-gradient(120% 100% at 0% 0%, rgba(74,144,226,0.16) 0%, transparent 60%)",
        }}
      />

      <div className="relative flex items-center gap-2.5 h-[var(--topbar-height)] px-5 border-b border-navy-line">
        <div className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-gradient-to-br from-accent-glow to-accent-9 text-white shadow-sm">
          <PlaneTakeoff size={15} strokeWidth={2.25} />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="font-display text-[14px] font-semibold tracking-tight text-navy-text">
            KOST E-EXAM
          </p>
          <p className="text-[10.5px] font-medium tracking-wide text-navy-text-dim uppercase">
            Console de supervision
          </p>
        </div>
      </div>

      <nav className="relative flex-1 overflow-y-auto px-3 py-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-4 last:mb-0">
            <p className="px-2.5 mb-2 text-[10.5px] font-semibold tracking-[0.08em] text-navy-text-dim uppercase">
              {group.title}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive = pathname?.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <span
                        className={cn(
                          "group relative flex items-center gap-2.5 rounded-md px-2.5 py-[8px] text-[13px] font-medium transition-colors",
                          isActive
                            ? "bg-white/[0.07] text-white"
                            : "text-navy-text-dim hover:bg-white/[0.045] hover:text-navy-text"
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-full bg-accent-glow" />
                        )}
                        <Icon size={16} strokeWidth={2} className={isActive ? "text-accent-glow" : ""} />
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="relative border-t border-navy-line p-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-semibold text-navy-text">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-medium text-navy-text">{user.name}</p>
            <p className="truncate text-[11px] text-navy-text-dim">{user.role}</p>
          </div>
        </div>
        <div className="mt-1 flex flex-col gap-0.5">
          <button className="flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] text-navy-text-dim hover:bg-white/[0.045] hover:text-navy-text transition-colors">
            <Settings size={15} />
            Paramètres
          </button>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] text-navy-text-dim hover:bg-white/[0.045] hover:text-navy-text transition-colors"
            >
              <LogOut size={15} />
              Se déconnecter
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
