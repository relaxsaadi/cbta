import Link from "next/link";
import { notFound } from "next/navigation";
import { guardPage } from "@/lib/rbac";
import { findUserById, getRoleForUser, canHardDeleteUser } from "@/lib/users";
import { listUserFunctions } from "@/lib/user-functions";
import { listCandidateGroups } from "@/lib/user-affiliation";
import { getExamSummary } from "@/lib/user-directory";
import { listNotificationHistory } from "@/lib/email/history";
import { hasCompletedActivation } from "@/lib/activation-tokens";
import { listCompanies } from "@/lib/companies";
import { listGroups } from "@/lib/groups";
import { listFunctions } from "@/lib/functions";
import { getDb } from "@/lib/db";
import { Eye } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge, type BadgeStatus } from "@/components/ui/Badge";
import { ROLE_LABELS, type ConsoleRole } from "@/lib/session";
import type { UserStatus } from "@/lib/users";
import { CopyIdentifierButton } from "./CopyIdentifierButton";
import { EditUserForm } from "./EditUserForm";
import { ChangeUsernameForm } from "./ChangeUsernameForm";
import { AffiliationSection } from "./AffiliationForms";
import { FunctionsManager } from "./FunctionsManager";
import { SendMessageForm } from "./SendMessageForm";
import { HardDeleteForm } from "./HardDeleteForm";
import { ActionButton } from "../ActionButton";
import {
  quickSuspendAction,
  quickReactivateAction,
  archiveUserAction,
  restoreUserAction,
  adminResetMfaAction,
  resendInvitationAction,
  sendPasswordResetLinkAction,
} from "../actions";

const STATUS_BADGE: Record<UserStatus, BadgeStatus> = {
  active: "verified",
  pending_activation: "warning",
  suspended: "critical",
  archived: "neutral",
};
const STATUS_LABELS: Record<UserStatus, string> = {
  active: "Actif",
  pending_activation: "En attente d'activation",
  suspended: "Suspendu",
  archived: "Archivé",
};

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await guardPage("administrator");
  const { id } = await params;
  const userId = Number(id);
  const user = findUserById(userId);
  if (!user) notFound();

  const role = getRoleForUser(userId);
  const functions = listUserFunctions(userId);
  const candidateGroups = listCandidateGroups(userId);
  const examSummary = getExamSummary(userId);
  // Mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS" (2026-08-30) §25 —
  // "Prévisualiser l'espace candidat" depuis la fiche candidat : liste ses
  // examens réellement affectés et PUBLIÉS (jamais un brouillon, qui n'a
  // pas encore de snapshot figé à prévisualiser — voir apercu-candidat/
  // [assessmentId]/page.tsx).
  const assignedAssessments =
    role === "candidate"
      ? (getDb()
          .prepare(
            `SELECT a.id, a.name FROM assessment_assignments aa JOIN assessments a ON a.id = aa.assessment_id WHERE aa.candidate_user_id = ? AND a.status != 'draft' ORDER BY aa.assigned_at DESC`
          )
          .all(userId) as { id: number; name: string }[])
      : [];
  const commHistory = listNotificationHistory({ userIdsOrNull: null, userId, limit: 50 });
  const hardDeleteCheck = canHardDeleteUser(userId);
  const everInvited = hasCompletedActivation(userId) === false || user.status !== "pending_activation" || commHistory.some((h) => h.event_type === "ACCOUNT_CREATED");
  const companies = listCompanies();
  const groups = listGroups();
  const allFunctions = listFunctions();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/users" className="text-[12.5px] text-text-tertiary hover:text-text-secondary">← Utilisateurs</Link>
          <h1 className="font-display text-[20px] font-semibold text-text-primary">{user.full_name}</h1>
        </div>
        <StatusBadge status={STATUS_BADGE[user.status]}>{STATUS_LABELS[user.status]}</StatusBadge>
      </div>

      {/* IDENTITÉ */}
      <Card>
        <CardHeader title="Identité" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 text-[13px]">
            <p><span className="text-text-tertiary">Nom complet :</span> <span className="text-text-primary">{user.full_name}</span></p>
            <p className="flex items-center gap-2">
              <span className="text-text-tertiary">Identifiant de connexion :</span> <span className="font-mono text-text-primary">{user.username}</span>
              <CopyIdentifierButton value={user.username} />
            </p>
            <p><span className="text-text-tertiary">Email :</span> <span className="text-text-primary">{user.email ?? "—"}</span></p>
            <p><span className="text-text-tertiary">Téléphone :</span> <span className="text-text-primary">{user.phone ?? "—"}</span></p>
            <p><span className="text-text-tertiary">Type candidat :</span> <span className="text-text-primary">{user.candidate_type === "particulier" ? "Particulier" : user.candidate_type === "entreprise" ? "Entreprise" : "—"}</span></p>
            <p><span className="text-text-tertiary">Rôle :</span> <span className="text-text-primary">{role ? ROLE_LABELS[role as ConsoleRole] : "Aucun"}</span></p>
          </div>
          <div className="flex flex-col gap-3">
            <EditUserForm userId={userId} fullName={user.full_name} email={user.email} phone={user.phone} candidateType={user.candidate_type} />
            <ChangeUsernameForm userId={userId} currentUsername={user.username} />
          </div>
        </div>
      </Card>

      {/* AFFECTATION */}
      <Card>
        <CardHeader title="Affectation" description="Client / groupe(s) / fonction(s) DGR — dérivés de l'appartenance réelle aux groupes." />
        <AffiliationSection userId={userId} candidateGroups={candidateGroups} companies={companies} groups={groups} />
        <div className="mt-4 border-t border-border-subtle pt-4">
          <FunctionsManager userId={userId} current={functions} allFunctions={allFunctions} />
        </div>
      </Card>

      {/* ACCÈS */}
      <Card>
        <CardHeader title="Accès" />
        <div className="flex flex-col gap-2 text-[13px]">
          <p><span className="text-text-tertiary">Statut :</span> <StatusBadge status={STATUS_BADGE[user.status]}>{STATUS_LABELS[user.status]}</StatusBadge></p>
          <p><span className="text-text-tertiary">Activation :</span> <span className="text-text-primary">{hasCompletedActivation(userId) ? "Complétée" : "Jamais complétée"}</span></p>
          <p>
            <span className="text-text-tertiary">MFA :</span>{" "}
            {user.mfa_enabled === 1 ? <StatusBadge status="verified">Actif</StatusBadge> : <span className="text-text-primary">Non activé</span>}
            {user.mfa_enabled === 1 && (
              <span className="ml-2 inline-block">
                <ActionButton
                  action={adminResetMfaAction.bind(null, userId)}
                  label="Réinitialiser MFA"
                  pendingLabel="…"
                  confirmMessage="Réinitialiser le MFA de ce compte ? Le titulaire devra le reconfigurer."
                />
              </span>
            )}
          </p>
          <p><span className="text-text-tertiary">Dernière connexion :</span> <span className="text-text-primary">{user.last_login_at ? new Date(user.last_login_at).toLocaleString("fr-FR") : "Jamais"}</span></p>
        </div>
      </Card>

      {/* EXAMENS */}
      <Card>
        <CardHeader title="Examens" />
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-display text-[22px] font-semibold text-text-primary">{examSummary.assessments_assigned}</p>
            <p className="text-[11.5px] text-text-tertiary">Examens affectés</p>
          </div>
          <div>
            <p className="font-display text-[22px] font-semibold text-text-primary">{examSummary.attempts_completed}</p>
            <p className="text-[11.5px] text-text-tertiary">Tentatives terminées</p>
          </div>
          <div>
            <p className="font-display text-[22px] font-semibold text-text-primary">{examSummary.attempts_passed}</p>
            <p className="text-[11.5px] text-text-tertiary">Réussies</p>
          </div>
        </div>
        {assignedAssessments.length > 0 && (
          <div className="mt-4 border-t border-border-subtle pt-4">
            <p className="mb-2 text-[12px] font-medium text-text-secondary">Prévisualiser l&apos;espace candidat</p>
            <div className="flex flex-col gap-1.5">
              {assignedAssessments.map((a) => (
                <Link
                  key={a.id}
                  href={`/apercu-candidat/${a.id}?candidateId=${userId}`}
                  className="flex items-center gap-1.5 text-[12.5px] font-medium text-accent-9 hover:underline"
                >
                  <Eye size={13} /> {a.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* COMMUNICATIONS */}
      <Card>
        <CardHeader title="Communications" description="Historique complet — jamais le contenu de l'email, uniquement le statut de livraison." />
        {commHistory.length === 0 ? (
          <p className="text-[12.5px] text-text-tertiary">Aucune communication enregistrée.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-border-subtle text-left text-text-tertiary">
                  <th className="pb-2 pr-3 font-medium">Date</th>
                  <th className="pb-2 pr-3 font-medium">Type</th>
                  <th className="pb-2 pr-3 font-medium">Objet</th>
                  <th className="pb-2 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {commHistory.map((c) => (
                  <tr key={c.id} className="border-b border-border-subtle last:border-0">
                    <td className="py-1.5 pr-3 font-mono text-[11.5px] text-text-tertiary">{new Date(c.created_at).toLocaleString("fr-FR")}</td>
                    <td className="py-1.5 pr-3 text-text-secondary">{c.event_type}</td>
                    <td className="py-1.5 pr-3 text-text-secondary">{c.subject}</td>
                    <td className="py-1.5">
                      <StatusBadge status={c.status === "SENT" || c.status === "DELIVERED" ? "verified" : c.status === "FAILED" || c.status === "BOUNCED" || c.status === "COMPLAINED" ? "critical" : "warning"}>
                        {c.status}
                      </StatusBadge>
                      {c.failure_reason_safe && <span className="ml-1.5 text-[11px] text-text-tertiary">({c.failure_reason_safe})</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 border-t border-border-subtle pt-4">
          <SendMessageForm userId={userId} disabled={!user.email} />
        </div>
      </Card>

      {/* ACTIONS — context-sensitive : seules les actions valides pour l'état ACTUEL sont proposées. */}
      <Card>
        <CardHeader title="Actions" />
        <div className="flex flex-wrap gap-2">
          {user.status === "pending_activation" && (
            <ActionButton action={resendInvitationAction.bind(null, userId)} label={everInvited ? "Renvoyer l'invitation" : "Envoyer le lien d'activation"} pendingLabel="Envoi…" />
          )}
          {user.status === "active" && (
            <ActionButton action={sendPasswordResetLinkAction.bind(null, userId)} label="Envoyer lien de réinitialisation" pendingLabel="Envoi…" />
          )}
          {user.status === "active" && (
            <form action={quickSuspendAction.bind(null, userId)}>
              <button type="submit" className="rounded-md border border-status-critical-border bg-status-critical-bg px-2.5 py-1 text-[11.5px] font-medium text-status-critical-text">Suspendre</button>
            </form>
          )}
          {user.status === "pending_activation" && (
            <form action={quickSuspendAction.bind(null, userId)}>
              <button type="submit" className="rounded-md border border-status-critical-border bg-status-critical-bg px-2.5 py-1 text-[11.5px] font-medium text-status-critical-text">Suspendre</button>
            </form>
          )}
          {user.status === "suspended" && (
            <form action={quickReactivateAction.bind(null, userId)}>
              <button type="submit" className="rounded-md bg-accent-9 px-2.5 py-1 text-[11.5px] font-medium text-white">Réactiver</button>
            </form>
          )}
          {user.status !== "archived" && (
            <form action={archiveUserAction.bind(null, userId)}>
              <button type="submit" className="rounded-md border border-border-default px-2.5 py-1 text-[11.5px] font-medium text-text-secondary hover:border-border-strong">Archiver</button>
            </form>
          )}
          {user.status === "archived" && (
            <form action={restoreUserAction.bind(null, userId)}>
              <button type="submit" className="rounded-md bg-accent-9 px-2.5 py-1 text-[11.5px] font-medium text-white">Restaurer</button>
            </form>
          )}
        </div>
        <div className="mt-4 border-t border-border-subtle pt-4">
          <HardDeleteForm userId={userId} blockers={hardDeleteCheck.blockers} />
        </div>
      </Card>
    </div>
  );
}
