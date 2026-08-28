import { guardPage } from "@/lib/rbac";
import { findUserById } from "@/lib/users";
import { Card, CardHeader } from "@/components/ui/Card";
import { MfaSettings } from "./MfaSettings";

// Mission "PRODUCTION READINESS" §25 — page en libre-service, restreinte
// aux deux rôles cibles MFA (administrateur = obligatoire à terme,
// responsable pédagogique = fortement recommandé). Candidat/auditeur non
// concernés à ce stade (voir docs/KOST_EEXAM_V2_PRODUCTION_READINESS_REPORT.md).
export default async function MonComptePage() {
  const session = await guardPage("administrator", "pedagogical_manager");
  const user = findUserById(session.userId);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Mon compte</h1>

      <Card>
        <CardHeader title="Identité" description={`${user?.full_name ?? session.username} — ${session.username}`} />
      </Card>

      <Card>
        <CardHeader
          title="Authentification à deux facteurs (MFA)"
          description="Protège l'accès même en cas de mot de passe compromis — code TOTP à 6 chiffres, valable 30 secondes."
        />
        <MfaSettings enabled={user?.mfa_enabled === 1} />
      </Card>
    </div>
  );
}
