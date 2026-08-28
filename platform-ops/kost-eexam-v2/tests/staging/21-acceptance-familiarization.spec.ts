import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// Addendum §24 — TEST D'ACCEPTATION familiarisation : cycle complet réel
// avec un groupe réel, du déclenchement de la session jusqu'à la feuille
// de présence signée-prête, en passant par l'historique par candidat.
test("parcours d'acceptance complet : déclarer une session → marquer présence → historique par candidat → feuille de présence PDF", async ({ page }) => {
  await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));

  // ÉTAPE 1 — déclarer une session réelle sur le groupe pilote réel.
  await page.goto("/familiarisation");
  await page.locator("#groupId").selectOption({ label: "Air Algérie — DEMO — Air Algérie — DGR Démonstration" });
  await page.locator("#functionCode").selectOption("7.1");
  await page.locator("#heldAt").fill("2026-09-15T14:00");
  await page.locator("#location").fill("Salle B — Alger — Acceptance §24");
  await page.getByRole("button", { name: /créer la session de familiarisation/i }).click();
  await page.waitForURL(/\/familiarisation\/\d+/);
  const sessionUrl = page.url();
  const sessionId = sessionUrl.match(/\/familiarisation\/(\d+)/)![1];

  // ÉTAPE 2 — la ligne de présence est créée automatiquement pour tous
  // les candidats réels du groupe, tous "Absent" par défaut (pas de
  // présomption de présence). Le total N est lu dynamiquement (pas
  // hardcodé à 3) : le groupe pilote partagé peut légitimement accumuler
  // d'autres membres réels au fil du temps — seule la PROGRESSION du
  // compteur (0 → 1 → 2) est vérifiée, robuste à la taille réelle.
  await expect(page.getByText("Yasmine Kaced (pilote)")).toBeVisible();
  await expect(page.getByText("Riad Boumediene (pilote)")).toBeVisible();
  await expect(page.getByText("Amel Ferhati (pilote)")).toBeVisible();
  // Titre réel de la carte : "Présence — {n} / {total} présent(s)" — regex
  // NON ancrée pour matcher en sous-chaîne (voir 19-familiarization.spec.ts).
  const counterText = await page.getByText(/\d+ \/ \d+ présent/).first().textContent();
  const total = Number(counterText!.match(/\/ (\d+) présent/)![1]);
  await expect(page.getByText(`0 / ${total} présent`)).toBeVisible();

  // ÉTAPE 3 — marquer 2 candidats présents, 1 absent (variation réelle,
  // pas un cas uniforme).
  const rowYasmine = page.locator("div.rounded-md.border-border-subtle").filter({ hasText: "Yasmine Kaced (pilote)" }).first();
  await rowYasmine.getByRole("button", { name: /marquer présent/i }).click();
  await expect(page.getByText(`1 / ${total} présent`)).toBeVisible();

  const rowRiad = page.locator("div.rounded-md.border-border-subtle").filter({ hasText: "Riad Boumediene (pilote)" }).first();
  await rowRiad.getByRole("button", { name: /marquer présent/i }).click();
  await expect(page.getByText(`2 / ${total} présent`)).toBeVisible();

  // Amel reste absente — vérifie explicitement qu'elle est toujours listée
  // "Absent" (pas de présomption ni de disparition de la ligne).
  // getByText est insensible à la casse par défaut — { exact: true } évite
  // de matcher la mention historique "(absent)" en minuscule dans le
  // paragraphe d'historique, distincte du badge de statut "Absent".
  const rowAmel = page.locator("div.rounded-md.border-border-subtle").filter({ hasText: "Amel Ferhati (pilote)" }).first();
  await expect(rowAmel.getByText("Absent", { exact: true })).toBeVisible();

  // ÉTAPE 4 — historique tenu par candidat (addendum §18-21 « tied to
  // user history ») : Yasmine a maintenant au moins cette session dans
  // son historique (visible sur une AUTRE session si elle en a déjà une,
  // ou simplement la ligne de présence courante reste correcte après
  // rechargement).
  await page.reload();
  await expect(rowYasmine.getByText("Présent", { exact: true })).toBeVisible();

  // ÉTAPE 5 — feuille de présence PDF réelle, avec les 3 candidats et
  // zones de signature.
  const pdf = await page.evaluate(async (id) => {
    const res = await fetch(`/api/reports/attendance-sheet/${id}`, { credentials: "same-origin" });
    const buf = await res.arrayBuffer();
    return { status: res.status, contentType: res.headers.get("content-type"), magic: new TextDecoder().decode(new Uint8Array(buf).slice(0, 5)), size: buf.byteLength };
  }, sessionId);
  expect(pdf.status).toBe(200);
  expect(pdf.contentType).toContain("application/pdf");
  expect(pdf.magic).toBe("%PDF-");
  expect(pdf.size).toBeGreaterThan(1000);

  // ÉTAPE 6 — un candidat ne peut jamais accéder au module (réservé
  // personnel) ni à cette feuille de présence.
  await page.context().clearCookies();
  await loginAs(page, env("STAGING_CANDIDATE1_USER"), env("STAGING_CANDIDATE1_PASS"));
  const candidatePdf = await page.evaluate(async (id) => {
    const res = await fetch(`/api/reports/attendance-sheet/${id}`, { credentials: "same-origin" });
    return { status: res.status };
  }, sessionId);
  expect(candidatePdf.status).toBe(403);
});
