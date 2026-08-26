import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { admissibleCountFor } from "@/lib/assessments";

// Route utilisée par l'étape 4 de l'assistant de création (§5 de la
// mission : « Afficher : Questions admissibles disponibles : XX ») — revalidée
// côté serveur à la publication (jamais seulement affichée puis oubliée).
export async function GET(request: Request) {
  await requireRole("pedagogical_manager", "administrator");
  const { searchParams } = new URL(request.url);
  const functionCode = searchParams.get("function");
  if (!functionCode) return NextResponse.json({ error: "Paramètre 'function' requis." }, { status: 400 });
  return NextResponse.json({ count: admissibleCountFor(functionCode) });
}
