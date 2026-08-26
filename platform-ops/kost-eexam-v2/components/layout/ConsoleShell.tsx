"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import type { ConsoleRole } from "@/lib/session";

export function ConsoleShell({
  user,
  role,
  roleLabel,
  children,
}: {
  user: { name: string };
  role: ConsoleRole;
  roleLabel: string;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar user={{ name: user.name, roleLabel }} role={role} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar role={role} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-surface-base p-6">{children}</main>
      </div>
    </div>
  );
}
