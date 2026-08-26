import type { Page } from "@playwright/test";

export async function loginAs(page: Page, username: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Nom d'utilisateur").fill(username);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

export function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Variable d'environnement manquante : ${name} (voir .env.staging.local, hors Git)`);
  return v;
}
