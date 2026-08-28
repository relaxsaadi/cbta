import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// Addendum §18-21 — module de familiarisation (CRITIQUE AUDIT) : sessions,
// présence, feuille de présence PDF avec signature par candidat,
// historique tenu par candidat. Isolation tenant dans les deux sens.

async function fetchPdf(page: import("@playwright/test").Page, path: string) {
  return page.evaluate(async (p) => {
    const res = await fetch(p, { credentials: "same-origin" });
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf).slice(0, 5);
    return { status: res.status, contentType: res.headers.get("content-type"), magic: new TextDecoder().decode(bytes), size: buf.byteLength };
  }, path);
}

test.describe("Familiarisation — cycle complet", () => {
  test("déclarer une session crée une ligne de présence par candidat du groupe, marquer présent se répercute, feuille de présence PDF réelle", async ({ page }) => {
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
    await page.goto("/familiarisation");

    await page.locator("#groupId").selectOption({ label: "Air Algérie — DEMO — Air Algérie — DGR Démonstration" });
    await page.locator("#functionCode").selectOption("7.1");
    await page.locator("#heldAt").fill("2026-09-01T09:00");
    await page.locator("#location").fill("Salle A — Alger");
    await page.getByRole("button", { name: /créer la session de familiarisation/i }).click();
    await page.waitForURL(/\/familiarisation\/\d+/);
    const sessionUrl = page.url();

    // Les 3 candidats pilotes du groupe apparaissent, chacun avec une
    // ligne de présence "Absent" par défaut. Le total N n'est PAS
    // hardcodé à 3 : le groupe pilote partagé peut légitimement accumuler
    // d'autres membres au fil du temps (candidats réels ajoutés hors de
    // cette suite) — on lit le total réel affiché, puis on vérifie
    // seulement sa PROGRESSION (0 → 1 après une présence), robuste à la
    // taille réelle du groupe au moment de l'exécution.
    await expect(page.getByText("Yasmine Kaced (pilote)")).toBeVisible();
    await expect(page.getByText("Riad Boumediene (pilote)")).toBeVisible();
    await expect(page.getByText("Amel Ferhati (pilote)")).toBeVisible();
    // Titre réel de la carte : "Présence — {n} / {total} présent(s)" — pas
    // de format isolé "{n} / {total} présent" tout seul (voir
    // app/(app)/familiarisation/[id]/page.tsx CardHeader). Regex NON
    // ancrée pour matcher en sous-chaîne, comme les assertions
    // getByText(string) plus bas (substring par défaut chez Playwright).
    const counterText = await page.getByText(/\d+ \/ \d+ présent/).first().textContent();
    const total = Number(counterText!.match(/\/ (\d+) présent/)![1]);
    await expect(page.getByText(`0 / ${total} présent`)).toBeVisible();

    // Marquer Yasmine présente — cible la ligne de présence précise (pas
    // un div ancêtre plus large, qui contiendrait aussi les 2 autres
    // boutons "Marquer présent").
    const row = page.locator("div.rounded-md.border-border-subtle").filter({ hasText: "Yasmine Kaced (pilote)" }).first();
    await row.getByRole("button", { name: /marquer présent/i }).click();
    await expect(page.getByText(`1 / ${total} présent`)).toBeVisible();

    // Feuille de présence PDF réelle.
    const pdf = await fetchPdf(page, sessionUrl.replace("/familiarisation/", "/api/reports/attendance-sheet/"));
    expect(pdf.status).toBe(200);
    expect(pdf.contentType).toContain("application/pdf");
    expect(pdf.magic).toBe("%PDF-");
    expect(pdf.size).toBeGreaterThan(1000);
  });
});

test.describe("Familiarisation — isolation tenant", () => {
  test("le responsable A ne voit jamais les sessions de Company B, ni en liste ni par URL directe", async ({ page }) => {
    await loginAs(page, env("STAGING_MANAGER_B_USER"), env("STAGING_MANAGER_B_PASS"));
    await page.goto("/familiarisation");
    await page.locator("#groupId").selectOption({ index: 1 });
    await page.locator("#functionCode").selectOption("7.1");
    await page.locator("#heldAt").fill("2026-09-02T09:00");
    await page.getByRole("button", { name: /créer la session de familiarisation/i }).click();
    await page.waitForURL(/\/familiarisation\/\d+/);
    const companyBSessionUrl = page.url();
    const companyBSessionId = companyBSessionUrl.match(/\/familiarisation\/(\d+)/)![1];

    await page.context().clearCookies();
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
    await page.goto("/familiarisation");
    await expect(page.getByText("Karim Zerrouki")).toHaveCount(0);

    const response = await page.goto(`/familiarisation/${companyBSessionId}`);
    expect(response?.status()).toBe(404);

    const pdf = await fetchPdf(page, `/api/reports/attendance-sheet/${companyBSessionId}`);
    expect(pdf.status).not.toBe(200);
  });

  test("un candidat ne peut pas accéder au module de familiarisation (réservé personnel)", async ({ page }) => {
    await loginAs(page, env("STAGING_CANDIDATE1_USER"), env("STAGING_CANDIDATE1_PASS"));
    await page.goto("/familiarisation");
    // guardPage() redirige vers /acces-refuse (pas un statut HTTP brut) —
    // même comportement que le reste des pages réservées au personnel.
    await expect(page).toHaveURL(/\/acces-refuse/);
  });
});
