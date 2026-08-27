import { guardPage } from "@/lib/rbac";
import { getGuide } from "@/lib/guides";
import { GuideContent } from "../GuideContent";

export default async function GuideAuditeurPage() {
  await guardPage("auditor", "administrator");
  return <GuideContent guide={getGuide("auditeur")!} />;
}
