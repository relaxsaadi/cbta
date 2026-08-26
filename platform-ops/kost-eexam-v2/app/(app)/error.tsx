"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

// Frontière d'erreur pour tout le groupe de routes authentifiées — capture
// notamment UnauthorizedError levée par requireRole() (lib/rbac.ts) pour
// afficher un message propre plutôt que la page d'erreur générique Next.js.
// Utile aussi pour le test E2E "auditeur ne peut jamais écrire" (§19).
export default function AppError({ error }: { error: Error & { digest?: string } }) {
  const isAuthError = error.message?.includes("autorisé") || error.message?.includes("Session");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-status-critical-bg text-status-critical-text">
        <ShieldAlert size={20} />
      </div>
      <p className="font-display text-[16px] font-semibold text-text-primary">
        {isAuthError ? "Accès refusé" : "Une erreur est survenue"}
      </p>
      <p className="max-w-sm text-[13px] text-text-tertiary">{error.message || "Erreur inattendue."}</p>
      <Link href="/" className="mt-2 rounded-md bg-accent-9 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-accent-10">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
