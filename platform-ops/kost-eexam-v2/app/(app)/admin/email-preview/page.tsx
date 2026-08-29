import { render } from "@react-email/components";
import { guardPage } from "@/lib/rbac";
import { buildPreviewScenarios } from "@/lib/email/preview-registry";
import { Card, CardHeader } from "@/components/ui/Card";

// /admin/email-preview (mission email §43-44) — RÉSERVÉ administrator.
// Données 100% synthétiques (lib/email/preview-registry.ts) : cette page
// NE FAIT JAMAIS appel à queueAndSendEmail ni au SDK Resend — il n'existe
// structurellement aucun chemin de code ici capable d'envoyer un email
// réel, indépendamment de ce que l'utilisateur sélectionne.
const VIEWS = [
  { key: "desktop", label: "Bureau", width: 640 },
  { key: "mobile", label: "Mobile", width: 375 },
] as const;

export default async function EmailPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string; view?: string; images?: string }>;
}) {
  await guardPage("administrator");
  const { scenario: scenarioKey, view: viewKey, images } = await searchParams;

  const scenarios = buildPreviewScenarios();
  const fallbackScenario = scenarios[0];
  if (!fallbackScenario) throw new Error("Aucun scénario d'aperçu disponible.");
  const scenario = scenarios.find((s) => s.key === scenarioKey) ?? fallbackScenario;
  const view = VIEWS.find((v) => v.key === viewKey) ?? VIEWS[0];
  const blockImages = images !== "on"; // §71 — doit rester compréhensible images bloquées ; c'est le mode par défaut ici.

  const [html, text] = await Promise.all([render(scenario.node), render(scenario.node, { plainText: true })]);
  const htmlForPreview = blockImages ? html.replace(/<img /g, '<img loading="lazy" referrerpolicy="no-referrer" ') : html;

  const byCategory = new Map<string, typeof scenarios>();
  for (const s of scenarios) {
    if (!byCategory.has(s.category)) byCategory.set(s.category, []);
    byCategory.get(s.category)!.push(s);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[20px] font-semibold text-text-primary">Aperçu des emails</h1>
        <p className="mt-1 text-[12.5px] text-text-tertiary">
          Données synthétiques uniquement — cette page n&apos;envoie jamais d&apos;email réel, quel que soit le scénario sélectionné.
        </p>
      </div>

      <Card>
        <form method="get" className="grid gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label htmlFor="scenario" className="mb-1 block text-[12px] font-medium text-text-secondary">Gabarit / scénario</label>
            <select id="scenario" name="scenario" defaultValue={scenario.key} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              {[...byCategory.entries()].map(([cat, items]) => (
                <optgroup key={cat} label={cat}>
                  {items.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="view" className="mb-1 block text-[12px] font-medium text-text-secondary">Affichage</label>
            <select id="view" name="view" defaultValue={view.key} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              {VIEWS.map((v) => (
                <option key={v.key} value={v.key}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="images" className="mb-1 block text-[12px] font-medium text-text-secondary">Images</label>
            <select id="images" name="images" defaultValue={blockImages ? "off" : "on"} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="off">Bloquées (par défaut client mail)</option>
              <option value="on">Autorisées</option>
            </select>
          </div>
          <div className="sm:col-span-4">
            <button type="submit" className="rounded-md bg-brand-accent px-3 py-1.5 text-[13px] font-medium text-white hover:opacity-90">
              Charger
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader title={scenario.label} description={`Sujet : « ${scenario.subject} » — gabarit ${scenario.key}`} />
        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto rounded-md border border-border-subtle bg-surface-subtle p-4">
            <iframe
              title="Aperçu HTML"
              srcDoc={htmlForPreview}
              sandbox=""
              style={{ width: view.width, maxWidth: "100%", height: 720, border: "1px solid var(--border-subtle)", background: "#fff" }}
            />
          </div>
          <details className="rounded-md border border-border-subtle p-3">
            <summary className="cursor-pointer text-[12.5px] font-medium text-text-secondary">Version texte brut (fallback)</summary>
            <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap text-[12px] text-text-secondary">{text}</pre>
          </details>
        </div>
      </Card>
    </div>
  );
}
