import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

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
    <div className="flex min-h-screen">
      <Sidebar
        user={{
          name: session.fullName ?? session.username ?? "Unknown",
          role: ROLE_LABELS[session.role ?? ""] ?? "Rôle inconnu",
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar systemOk={true} />
        <main className="flex-1 overflow-y-auto bg-surface-base p-6">{children}</main>
      </div>
    </div>
  );
}
