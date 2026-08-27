import { guardPage } from "@/lib/rbac";
import { getGuide } from "@/lib/guides";
import { GuideContent } from "../GuideContent";

export default async function GuideAdminPage() {
  await guardPage("administrator", "auditor");
  return <GuideContent guide={getGuide("administrateur")!} />;
}
