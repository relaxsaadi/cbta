import type { Page } from "@playwright/test";

export async function loginAs(page: Page, username: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Nom d'utilisateur").fill(username);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

/** Bascule de rôle au sein d'un même test/page (même pattern que
 * tests/e2e/helpers.ts en local) — un simple page.goto("/login") alors
 * qu'une session est déjà active fait boucler /login (déjà connecté ->
 * redirection immédiate), d'où cette vraie déconnexion serveur avant de
 * rappeler loginAs() pour un rôle différent. */
export async function logout(page: Page) {
  await page.request.post("/api/auth/logout");
  await page.goto("/login");
  await page.waitForURL(/\/login/);
}

export function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Variable d'environnement manquante : ${name} (voir .env.staging.local, hors Git)`);
  return v;
}
