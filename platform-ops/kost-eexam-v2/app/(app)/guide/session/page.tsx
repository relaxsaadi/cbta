import { guardPage } from "@/lib/rbac";
import { getGuide } from "@/lib/guides";
import { GuideContent } from "../GuideContent";

export default async function GuideSessionPage() {
  await guardPage("pedagogical_manager", "administrator", "auditor");
  return <GuideContent guide={getGuide("session")!} />;
}
