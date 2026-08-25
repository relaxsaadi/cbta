import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ConsoleShell } from "@/components/layout/ConsoleShell";

const ROLE_LABELS: Record<string, string> = {
  administrator: "Administrateur",
  exam_manager: "Responsable d'examen",
  instructor: "Instructeur",
  auditor: "Auditeur",
};

export default async function ConsoleLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect("/login");
  }

  return (
    <ConsoleShell
      user={{
        name: session.fullName ?? session.username ?? "Unknown",
        role: ROLE_LABELS[session.role ?? ""] ?? "Rôle inconnu",
      }}
      systemOk={true}
    >
      {children}
    </ConsoleShell>
  );
}
