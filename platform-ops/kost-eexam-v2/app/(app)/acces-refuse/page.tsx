import Link from "next/link";
import { ShieldAlert } from "lucide-react";

// Cible de redirection de guardPage() (lib/rbac.ts) — un rôle non autorisé
// atterrit ici, un vrai renvoi serveur, jamais un simple lien masqué dans
// le menu (§19 de la mission).
export default function AccesRefusePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-status-critical-bg text-status-critical-text">
        <ShieldAlert size={20} />
      </div>
      <p className="font-display text-[16px] font-semibold text-text-primary">Accès refusé</p>
      <p className="max-w-sm text-[13px] text-text-tertiary">
        Votre rôle ne permet pas d&apos;accéder à cette page.
      </p>
      <Link href="/" className="mt-2 rounded-md bg-accent-9 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-accent-10">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
