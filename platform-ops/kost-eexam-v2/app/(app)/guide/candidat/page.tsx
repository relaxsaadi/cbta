import { guardPage } from "@/lib/rbac";
import { getGuide } from "@/lib/guides";
import { GuideContent } from "../GuideContent";

export default async function GuideCandidatPage() {
  await guardPage("candidate", "pedagogical_manager", "administrator", "auditor");
  return <GuideContent guide={getGuide("candidat")!} />;
}
