"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

// Coordonne l'ouverture/fermeture du menu mobile entre Topbar (bouton
// hamburger) et Sidebar (tiroir superposé en dessous de 768px) — les deux
// sont rendus côte à côte par ConsoleLayout, un état partagé est donc
// nécessaire. Correctif d'un vrai gap produit identifié lors des tests de
// cette finalisation (2026-08-25) : en dessous de 768px, la sidebar était
// entièrement masquée (`hidden md:flex`) sans aucun bouton ou tiroir de
// remplacement — aucun chemin de clic vers la navigation ni la
// déconnexion sur mobile. Documenté précédemment dans
// docs/PLATFORM_READINESS_REPORT.md (Gate H) comme un gap produit réel,
// jamais corrigé faute d'accès au code source de la console avant cette
// session.
export function ConsoleShell({
  user,
  systemOk,
  children,
}: {
  user: { name: string; role: string };
  systemOk: boolean;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar systemOk={systemOk} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-surface-base p-6">{children}</main>
      </div>
    </div>
  );
}
