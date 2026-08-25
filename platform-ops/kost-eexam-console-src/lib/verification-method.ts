import type { ComplianceItem } from "@/lib/compliance-data";
import { slugify } from "@/lib/utils";

/**
 * Dérive une méthode de vérification lisible à partir de la source de
 * preuve réelle de l'item — jamais une catégorie inventée.
 */
export function deriveVerificationMethod(item: ComplianceItem): string {
  const source = item.evidence?.source ?? "";
  if (/live (query|tls handshake)/i.test(source)) return "Automated live check";
  if (/playwright/i.test(source)) return "Automated test (Playwright)";
  if (/console-owned table|kost_console_/i.test(source)) return "Live check — console-owned data";
  if (/apache bench|load test/i.test(source)) return "Manual load test, recorded";
  if (/backup-log|phase 0/i.test(source)) return "Automated backup verification log";
  if (/security audit/i.test(source)) return "Manual security audit, recorded";
  if (/\.md|procedure|console page/i.test(source)) return "Documented procedure / published page";
  if (/gazette|agreement|joradp/i.test(source)) return "External legal/contractual document";
  if (!item.evidence) return "Not yet demonstrated";
  return "Documented";
}

export function evidenceAnchor(item: ComplianceItem): string {
  return slugify(item.requirement);
}
