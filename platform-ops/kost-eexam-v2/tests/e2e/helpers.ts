import type { Page } from "@playwright/test";

export async function loginAs(page: Page, username: string, password = "ChangeMoi123!") {
  await page.goto("/login");
  await page.getByLabel("Nom d'utilisateur").fill(username);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

/** Bascule d'utilisateur au sein d'un même test (mission email — scénario
 * J, §62/§68 : un flux doit vérifier l'effet d'une action par un rôle via
 * la connexion d'un AUTRE rôle). Un simple `page.goto("/login")` alors
 * qu'une session est déjà active fait boucler /login (déjà connecté →
 * redirection immédiate vers le tableau de bord), d'où ce vrai
 * déconnexion serveur (POST /api/auth/logout, voir lib/auth.ts::logout())
 * avant de rappeler loginAs(). */
export async function logout(page: Page) {
  await page.request.post("/api/auth/logout");
  await page.goto("/login");
  await page.waitForURL(/\/login/);
}
