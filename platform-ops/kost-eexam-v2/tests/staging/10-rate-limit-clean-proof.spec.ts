import { test, expect, type Page } from "@playwright/test";
import { env } from "./helpers";

// Revue pré-auditeur — §"RATE-LIMIT TEST — CLEAN PROOF". Le rapport
// précédent montrait 6/7 (pas 7/7) parce que le compte de test dédié
// (candidat3.staging) était encore verrouillé d'une exécution précédente
// — pas un échec du limiteur, mais une preuve non déterministe. Ce fichier
// utilise DEUX comptes fraîchement créés pour ce seul usage
// (scripts/seed-ratelimit-test-accounts.ts), jamais utilisés ailleurs dans
// le pilote, garantissant un état initial connu (zéro échec enregistré) à
// chaque exécution.
//
// Limite d'architecture assumée et documentée (voir lib/rate-limit.ts) :
// le limiteur est EN MÉMOIRE, par processus Node — adapté au déploiement
// actuel (une seule instance par service). Il ne s'agit PAS d'une
// protection distribuée/multi-instance ; une évolution vers plusieurs
// instances (scaling horizontal) nécessiterait un magasin partagé (Redis
// ou équivalent), non implémenté ici. Ce test ne prétend pas prouver une
// protection multi-instance — seulement le comportement réel tel
// qu'implémenté.
const WRONG_PASSWORD = "mot-de-passe-volontairement-faux-pour-ce-test";

async function submitLogin(page: Page, username: string, password: string): Promise<void> {
  await page.getByLabel("Nom d'utilisateur").fill(username);
  await page.getByLabel("Mot de passe").fill(password);
  // Le formulaire utilise useActionState (transition CÔTÉ CLIENT, sans
  // navigation complète) — attendre explicitement la réponse POST avant de
  // continuer est nécessaire pour garantir qu'une soumission ne chevauche
  // pas la suivante (voir 08-security-checks.spec.ts pour le
  // diagnostic complet de ce piège).
  const responsePromise = page.waitForResponse((r) => r.request().method() === "POST" && r.url() === page.url());
  await page.getByRole("button", { name: /se connecter/i }).click();
  await responsePromise;
}

test("preuve propre et déterministe du limiteur anti-force-brute", async ({ page }) => {
  const subjectUser = env("STAGING_RATELIMIT_SUBJECT_USER");
  const subjectPass = env("STAGING_RATELIMIT_SUBJECT_PASS");
  const unrelatedUser = env("STAGING_RATELIMIT_UNRELATED_USER");
  const unrelatedPass = env("STAGING_RATELIMIT_UNRELATED_PASS");

  await page.goto("/login");

  // --- Phase 1 : 3 échecs (sous le seuil de 5) — comportement normal,
  // jamais bloqué avant le seuil ("failures 1–5 behave according to
  // policy"). ---
  for (let i = 0; i < 3; i++) {
    await submitLogin(page, subjectUser, WRONG_PASSWORD);
    await expect(page.getByText(/identifiant ou mot de passe incorrect/i)).toBeVisible();
  }

  // --- Phase 2 : une connexion RÉUSSIE réinitialise le compteur — preuve
  // du chemin "successful login ... works according to design" ET du
  // reset, sans attendre les 15 minutes d'expiration de la fenêtre. ---
  await submitLogin(page, subjectUser, subjectPass);
  await expect(page).not.toHaveURL(/\/login/);
  // Efface le cookie de session avant de revenir sur /login : sinon
  // login/page.tsx redirige immédiatement un utilisateur déjà connecté,
  // sans jamais réafficher le formulaire — la phase 3 a besoin du
  // formulaire, pas d'un compte encore authentifié.
  await page.context().clearCookies();
  await page.goto("/login");

  // --- Phase 3 : 5 NOUVEAUX échecs juste après une connexion réussie —
  // si le reset de la phase 2 n'avait pas fonctionné, un compteur non
  // réinitialisé aurait bloqué bien avant la 5e tentative ici. Le fait
  // que les 5 passent confirme le reset. ---
  for (let i = 0; i < 5; i++) {
    await submitLogin(page, subjectUser, WRONG_PASSWORD);
    await expect(page.getByText(/identifiant ou mot de passe incorrect/i)).toBeVisible();
  }

  // --- Phase 4 : la 6e tentative (même avec le VRAI mot de passe) doit
  // être bloquée — preuve du seuil ("threshold is enforced") ET que le
  // blocage agit AVANT la vérification du mot de passe, pas seulement
  // sur des échecs répétés ("subsequent login is blocked during
  // lockout"). ---
  await submitLogin(page, subjectUser, subjectPass);
  await expect(page.getByText(/trop de tentatives/i)).toBeVisible();
  await expect(page).toHaveURL(/\/login/);

  // Une tentative supplémentaire, toujours pendant la fenêtre de blocage,
  // confirme que le verrou persiste (pas un blocage à usage unique).
  await submitLogin(page, subjectUser, subjectPass);
  await expect(page.getByText(/trop de tentatives/i)).toBeVisible();

  // --- Phase 5 : un utilisateur SANS RAPPORT, sur le même navigateur
  // (donc la même IP apparente), n'est PAS affecté par le verrouillage du
  // sujet — preuve de l'isolation par clé IP+utilisateur, pas par IP
  // seule ("unrelated user is unaffected"). Une seule tentative erronée
  // suffit à le démontrer : si le verrouillage était par IP seule, ce
  // compte afficherait déjà "trop de tentatives" dès ce premier essai. ---
  await submitLogin(page, unrelatedUser, WRONG_PASSWORD);
  await expect(page.getByText(/identifiant ou mot de passe incorrect/i)).toBeVisible();
  await expect(page.getByText(/trop de tentatives/i)).toHaveCount(0);
});
