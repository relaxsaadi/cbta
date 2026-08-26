import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

// Scénario G (§29) : export CSV → vérifier les valeurs (colonnes minimum
// du §14 de la mission).
test("l'export CSV des résultats contient les colonnes minimum requises et des données réelles", async ({ page }) => {
  await loginAs(page, "admin");

  const response = await page.request.get("/api/results/export");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/csv");

  const body = await response.text();
  const [header, ...rows] = body.trim().split("\r\n");
  const columns = header!.split(",");
  for (const col of [
    "candidate_id", "candidate_name", "company", "group", "function", "exam",
    "started_at", "submitted_at", "duration", "question_count", "correct_count",
    "incorrect_count", "score_100", "percentage", "pass_threshold", "result", "status",
  ]) {
    expect(columns).toContain(col);
  }
  expect(rows.length).toBeGreaterThan(0);
  expect(body).toContain("Karim Belaid");
});
