// Journalisation des actions de notification (mission email §50) — un
// mince adaptateur au-dessus de lib/audit.ts::audit(), jamais une seconde
// table d'audit parallèle (un seul point de vérité pour tout le journal
// d'audit de la plateforme).
// Pas de garde `import "server-only"` (même discipline que lib/audit.ts
// lui-même, lib/tenant-scope.ts, lib/incidents.ts...) : ce module de
// domaine doit rester testable via node:test (mission §72) — la
// protection réelle contre un import client vient de node:sqlite
// (structurellement inbundlable côté navigateur, voir lib/db.ts), pas de
// ce paquet. Le garde reste réservé aux modules qui touchent
// session/cookies/redirect (lib/auth.ts, lib/session.ts, lib/rbac.ts).
import { audit } from "../audit";
import type { ConsoleRole } from "../session";

export function auditEmailInvitationSent(actorUserId: number, actorRole: ConsoleRole, targetUserId: number) {
  audit({ actorUserId, actorRole, action: "email_invitation_sent", targetType: "user", targetId: targetUserId, result: "success" });
}

export function auditEmailInvitationResent(actorUserId: number, actorRole: ConsoleRole, targetUserId: number) {
  audit({ actorUserId, actorRole, action: "email_invitation_resent", targetType: "user", targetId: targetUserId, result: "success" });
}

export function auditPasswordResetRequested(actorUserId: number, actorRole: ConsoleRole | null, targetUserId: number) {
  audit({ actorUserId, actorRole, action: "password_reset_requested", targetType: "user", targetId: targetUserId, result: "success" });
}

export function auditExamNotificationSent(actorUserId: number, actorRole: ConsoleRole, assessmentId: number, targetUserId: number) {
  audit({ actorUserId, actorRole, action: "exam_notification_sent", targetType: "assessment", targetId: assessmentId, result: "success", metadata: { candidateUserId: targetUserId } });
}

export function auditExamNotificationResent(actorUserId: number, actorRole: ConsoleRole, assessmentId: number, targetUserId: number) {
  audit({ actorUserId, actorRole, action: "exam_notification_resent", targetType: "assessment", targetId: assessmentId, result: "success", metadata: { candidateUserId: targetUserId } });
}

export function auditNotificationDeliveryFailed(notificationId: number, eventType: string) {
  audit({ actorUserId: null, actorRole: null, action: "notification_delivery_failed", targetType: "notification_log", targetId: notificationId, result: "failure", metadata: { eventType } });
}

export function auditNotificationBounced(notificationId: number, eventType: string) {
  audit({ actorUserId: null, actorRole: null, action: "notification_bounced", targetType: "notification_log", targetId: notificationId, result: "failure", metadata: { eventType } });
}
