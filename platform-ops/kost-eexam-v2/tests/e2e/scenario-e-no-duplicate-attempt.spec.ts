import { test, expect } from "@playwright/test";
import { DatabaseSync } from "node:sqlite";
import { resolve } from "node:path";
import { loginAs } from "./helpers";

// Scénario E (§29) : deux onglets → jamais de tentative dupliquée. Deux
// contextes de navigateur distincts, connectés comme le même candidat,
// démarrent l'examen "en même temps" (Promise.all) — puis on vérifie
// directement en base qu'une seule ligne 'in_progress' existe.
test("deux onglets démarrant le même examen simultanément ne créent jamais deux tentatives", async ({ browser }) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  await loginAs(pageA, "candidat2.demo");
  await loginAs(pageB, "candidat2.demo");

  await pageA.getByRole("link", { name: /commencer/i }).first().click();
  await pageA.waitForURL(/\/exam\/\d+\/instructions/);
  await pageB.getByRole("link", { name: /commencer/i }).first().click();
  await pageB.waitForURL(/\/exam\/\d+\/instructions/);

  await Promise.all([
    pageA.getByRole("button", { name: /commencer l'examen/i }).click(),
    pageB.getByRole("button", { name: /commencer l'examen/i }).click(),
  ]);

  await pageA.waitForURL(/\/exam\/\d+\/attempt/);
  await pageB.waitForURL(/\/exam\/\d+\/attempt/);

  // Les deux onglets doivent converger vers la MÊME tentative (même URL).
  expect(pageA.url()).toBe(pageB.url());

  const dbPath = resolve(import.meta.dirname, "../../data/e2e-test.db");
  const db = new DatabaseSync(dbPath, { readOnly: true });
  const row = db
    .prepare(
      `SELECT COUNT(*) AS n FROM attempts a
       JOIN users u ON u.id = a.candidate_user_id
       WHERE u.username = 'candidat2.demo' AND a.status = 'in_progress'`
    )
    .get() as { n: number };
  db.close();
  expect(row.n).toBe(1);

  await contextA.close();
  await contextB.close();
});
