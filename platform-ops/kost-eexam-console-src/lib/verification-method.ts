import type { ComplianceItem } from "@/lib/compliance-data";
import { slugify } from "@/lib/utils";

/**
 * Dérive une méthode de vérification lisible à partir de la source de
 * preuve réelle de l'item — jamais une catégorie inventée.
 */
export function deriveVerificationMethod(item: ComplianceItem): string {
  const source = item.evidence?.source ?? "";
  if (/live (query|tls handshake)/i.test(source)) return "Vérification automatique en direct";
  if (/playwright/i.test(source)) return "Test automatisé (Playwright)";
  if (/console-owned table|kost_console_/i.test(source)) return "Vérification en direct — données propres à la console";
  if (/apache bench|load test/i.test(source)) return "Test de charge manuel, consigné";
  if (/backup-log|phase 0/i.test(source)) return "Journal automatisé de vérification des sauvegardes";
  if (/security audit/i.test(source)) return "Audit de sécurité manuel, consigné";
  if (/\.md|procedure|console page/i.test(source)) return "Procédure documentée / page publiée";
  if (/gazette|agreement|joradp/i.test(source)) return "Document légal/contractuel externe";
  if (!item.evidence) return "Pas encore démontré";
  return "Documenté";
}

export function evidenceAnchor(item: ComplianceItem): string {
  return slugify(item.requirement);
}
