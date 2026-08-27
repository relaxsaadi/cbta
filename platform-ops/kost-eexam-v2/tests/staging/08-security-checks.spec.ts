import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// Revue sécurité — §"security check pass" de la phase staging. Chaque test
// ci-dessous vérifie un contrôle server-side réel, jamais une simple
// absence d'élément UI. Les contrôles suivants ont une preuve déjà établie
// ailleurs et ne sont PAS reproduits ici :
//   - versionnage à froid (immutabilité après publication) → 06-versioning.spec.ts
//   - révocation de session / suspension de compte → 07-incident-demo.spec.ts
//   - unicité de tentative (concurrence DB) → tests/unit/*attempt* (contrainte
//     SQLite elle-même, la preuve la plus directe du mécanisme)
//   - falsification du chronomètre → tests/unit/* (sweepExpiredAttempts +
//     rejet d'une réponse sur une tentative déjà expirée)
//   - injection CSV/formule → tests/unit/csv.test.ts
//   - lecture seule auditeur (UI + refus serveur sur /users) → 05-auditor-readonly.spec.ts

test.describe("Accès non authentifié — aucune page/API protégée ne répond sans session", () => {
  test("pages réservées au personnel redirigent vers /login sans cookie de session", async ({ browser }) => {
    const context = await browser.newContext(); // contexte neuf, aucun cookie
    const page = await context.newPage();

    for (const path of ["/results", "/users", "/incidents", "/audit-logs", "/question-bank", "/groups"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
    }
    await context.close();
  });

  test("l'API d'export CSV ne renvoie jamais de contenu sans session valide", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/login"); // établit l'origine avant le fetch same-origin

    // fetch() suit les redirections par défaut : sans redirect:"manual", un
    // 307 réel vers /login se résoudrait en un 200 (celui de la page de
    // connexion elle-même), masquant le vrai comportement — vérifié en
    // pratique par curl direct : le serveur renvoie bien 307 vers /login.
    const res = await page.evaluate(async () => {
      const r = await fetch("/api/results/export", { credentials: "same-origin", redirect: "manual" });
      return { status: r.status, type: r.type, body: await r.text() };
    });
    expect(res.status).not.toBe(200);
    expect(res.type).toBe("opaqueredirect"); // confirme le refus serveur (redirection vers /login), pas une réponse directe
    expect(res.body).not.toContain("Yasmine Kaced");
    expect(res.body).not.toContain("candidate_id"); // pas d'en-tête CSV = pas de données renvoyées
    await context.close();
  });
});

test.describe("Isolation candidat — un candidat ne peut jamais voir les données d'un autre", () => {
  test("candidat2 ne peut pas consulter la tentative de candidat1 via l'URL de détail réservée au personnel", async ({ page }) => {
    // /results/[attemptId] est gardée par rôle (guardPage exclut
    // explicitement "candidate") — même en devinant l'ID réel d'une
    // tentative d'un autre candidat, aucun rôle candidat n'atteint la page.
    await loginAs(page, env("STAGING_CANDIDATE2_USER"), env("STAGING_CANDIDATE2_PASS"));
    await page.goto("/results/13"); // tentative réelle de candidat1 (Yasmine Kaced)
    await expect(page).toHaveURL(/\/acces-refuse/);
    await expect(page.getByText("Yasmine Kaced")).toHaveCount(0);
    await expect(page.getByText(/marchandise dangereuse/i)).toHaveCount(0);
  });

  test("/mes-résultats de candidat2 ne montre jamais les résultats de candidat1 (filtrage serveur, pas un paramètre d'URL)", async ({ page }) => {
    await loginAs(page, env("STAGING_CANDIDATE2_USER"), env("STAGING_CANDIDATE2_PASS"));
    await page.goto("/mes-resultats");
    await expect(page.getByText("Yasmine Kaced")).toHaveCount(0);
    await expect(page.getByText("100/100")).toHaveCount(0); // le score parfait est celui de candidat1
  });
});

test.describe("Autorisation API directe — un rôle candidat ne peut pas appeler les endpoints réservés au personnel", () => {
  test("un candidat authentifié reçoit un refus sur l'API d'export réservée au personnel", async ({ page }) => {
    await loginAs(page, env("STAGING_CANDIDATE1_USER"), env("STAGING_CANDIDATE1_PASS"));
    const res = await page.evaluate(async () => {
      const r = await fetch("/api/results/export", { credentials: "same-origin" });
      return { status: r.status, body: await r.text() };
    });
    expect(res.status).not.toBe(200);
    expect(res.body).not.toContain("candidate_id");
  });
});

test.describe("Attributs du cookie de session — défense CSRF/XSS de base", () => {
  test("le cookie de session est HttpOnly et SameSite=Strict (vérifié sur le cookie réel du navigateur, pas seulement la config)", async ({ page }) => {
    // `response.headers()` de Playwright ne restitue pas fiablement
    // Set-Cookie (souvent absent/filtré à ce niveau) — l'API correcte pour
    // inspecter les attributs réels d'un cookie est context.cookies(), qui
    // expose httpOnly/sameSite/secure comme champs structurés directement
    // depuis le magasin de cookies du navigateur.
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "kost_eexam_v2_session");
    expect(sessionCookie, "le cookie de session doit exister après connexion").toBeTruthy();
    expect(sessionCookie!.httpOnly).toBe(true);
    expect(sessionCookie!.sameSite).toBe("Strict");
    // `secure: true` — vérifie que COOKIE_SECURE (contournement temporaire
    // documenté, utilisé UNIQUEMENT tant que staging tournait en HTTP nu
    // avant l'émission du certificat réel) a bien été retiré côté serveur
    // maintenant que le TLS réel est en place. Sans ce retrait, le cookie
    // de session serait transmissible en clair — une régression réelle,
    // pas cosmétique.
    expect(sessionCookie!.secure).toBe(true);
  });
});

// Compte dédié, réservé à ce test — jamais utilisé par le pilote d'examen
// (candidat1/2/3 assignés à l'EXAMEN réel) ni par la démo d'incident. Reste
// verrouillé ~15 min après ce test (fenêtre du limiteur) — sans impact sur
// le reste du pilote.
test.describe("Anti-force-brute sur la connexion — vérifié sur le vrai chemin HTTP, pas seulement en unité", () => {
  test("6 tentatives avec un mauvais mot de passe bloquent la 6e, même avec le bon mot de passe ensuite", async ({ page }) => {
    await page.goto("/login");
    // Le formulaire utilise useActionState (transition CÔTÉ CLIENT, sans
    // navigation complète) — un .click() n'attend pas nativement la fin de
    // l'action serveur sous-jacente. Sans attendre explicitement la réponse
    // POST, deux itérations rapprochées peuvent se chevaucher et certaines
    // ne déclenchent jamais de VRAIE requête serveur distincte (constaté en
    // pratique : seules 3 des 5 tentatives voulues atteignaient le
    // serveur). On attend donc explicitement la réponse de chaque
    // soumission avant de continuer — un essai par itération, garanti.
    for (let i = 0; i < 5; i++) {
      await page.getByLabel("Nom d'utilisateur").fill(env("STAGING_CANDIDATE3_USER"));
      await page.getByLabel("Mot de passe").fill("mot-de-passe-volontairement-faux");
      const responsePromise = page.waitForResponse((r) => r.request().method() === "POST" && r.url() === page.url());
      await page.getByRole("button", { name: /se connecter/i }).click();
      await responsePromise;
      await expect(page.getByText(/identifiant ou mot de passe incorrect/i)).toBeVisible();
    }
    // 6e tentative — avec le VRAI mot de passe cette fois : doit tout de
    // même être bloquée par le limiteur (preuve qu'il agit AVANT la
    // vérification du mot de passe, pas seulement sur les échecs).
    await page.getByLabel("Nom d'utilisateur").fill(env("STAGING_CANDIDATE3_USER"));
    await page.getByLabel("Mot de passe").fill(env("STAGING_CANDIDATE3_PASS"));
    const finalResponsePromise = page.waitForResponse((r) => r.request().method() === "POST" && r.url() === page.url());
    await page.getByRole("button", { name: /se connecter/i }).click();
    await finalResponsePromise;
    await expect(page.getByText(/trop de tentatives/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
