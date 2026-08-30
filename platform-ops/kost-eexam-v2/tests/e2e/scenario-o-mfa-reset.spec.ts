import { test, expect } from "@playwright/test";
import { DatabaseSync } from "node:sqlite";
import { resolve } from "node:path";
import { loginAs, logout } from "./helpers";
import { hashPassword } from "../../lib/passwords";
import { totpAt } from "../../lib/mfa";

// Scénario O — mission "MISSION DE FERMETURE — CLEAR REMAINING P2 BEFORE
// AUDITOR DEMO" (2026-08-30) §2 : couverture automatisée réelle de la
// réinitialisation MFA par un administrateur, jusqu'ici implémentée,
// contrôlée par rôle, auditée — mais totalement dépourvue de test
// automatisé (GAP confirmé lors de l'audit précédent).
//
// Note d'architecture importante, vérifiée en lisant le code avant
// d'écrire ce test (jamais supposée) : MFA est une fonctionnalité
// ADMINISTRATEUR/RESPONSABLE PÉDAGOGIQUE uniquement — /mon-compte est
// gardé par guardPage("administrator", "pedagogical_manager")
// (app/(app)/mon-compte/page.tsx), un CANDIDAT n'a structurellement AUCUN
// accès à l'auto-inscription MFA. Le compte "éligible" ciblé par ce test
// est donc un responsable pédagogique de test créé directement en base
// (mot de passe réel connu, même exception documentée et déjà établie que
// scenario-l test F — aucun chemin UI ne permet de faire choisir un mot
// de passe réel à un compte fraîchement créé sans passer par le flux
// d'activation, hors sujet de CE test).
//
// TOTP calculé via lib/mfa.ts::totpAt() (déterministe, même algorithme
// que le serveur — RFC 6238/4226 natif, zéro dépendance) directement dans
// ce test Node (Playwright exécute les fichiers de spec côté Node, pas
// dans le navigateur) — jamais un code deviné/à l'aveugle.
function uniqueTag() {
  return `o${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

function openDb() {
  return new DatabaseSync(resolve(import.meta.dirname, "../../data/e2e-test.db"));
}

test.describe.configure({ mode: "serial" });

test("A/E/F/G/H/I — un administrateur réinitialise le MFA d'un responsable pédagogique éligible : confirmation requise, secret jamais exposé, matériel TOTP invalidé, ré-inscription possible ensuite", async ({ page }) => {
  const t = uniqueTag();
  const username = `${t}.mfa-manager`;
  const password = "MotDePasseValideE2E-MFA!";
  const db = openDb();
  const roleRow = db.prepare(`SELECT id FROM roles WHERE code = 'pedagogical_manager'`).get() as { id: number };
  const insert = db
    .prepare(`INSERT INTO users (username, password_hash, full_name, status) VALUES (?, ?, ?, 'active')`)
    .run(username, hashPassword(password), `Responsable MFA Test ${t}`);
  const userId = Number(insert.lastInsertRowid);
  db.prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(userId, roleRow.id);
  db.close();

  // --- Auto-inscription MFA (le responsable active MFA sur son propre compte) ---
  await page.goto("/login");
  await page.getByLabel("Nom d'utilisateur").fill(username);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await page.waitForURL(/\/overview/);

  await page.goto("/mon-compte");
  await expect(page.getByText(/MFA n'est pas encore activé/i)).toBeVisible();
  await page.getByRole("button", { name: /activer mfa/i }).click();
  const secretLocator = page.getByTestId("mfa-secret");
  await expect(secretLocator).toBeVisible();
  const originalSecret = (await secretLocator.textContent())!.trim();
  expect(originalSecret.length).toBeGreaterThan(0);

  const codeAtEnrollment = totpAt(originalSecret, Date.now());
  await page.getByLabel(/code de vérification/i).fill(codeAtEnrollment);
  await page.getByRole("button", { name: /^confirmer$/i }).click();
  await expect(page.getByText(/MFA activé\./i)).toBeVisible();
  const recoveryCodes = await page.getByTestId("mfa-recovery-code").allTextContents();
  expect(recoveryCodes.length).toBeGreaterThan(0);

  // --- Vérification DB : MFA réellement activé côté serveur ---
  {
    const dbCheck = openDb();
    const row = dbCheck.prepare(`SELECT mfa_enabled, mfa_secret, mfa_recovery_codes_json FROM users WHERE id = ?`).get(userId) as {
      mfa_enabled: number;
      mfa_secret: string | null;
      mfa_recovery_codes_json: string | null;
    };
    expect(row.mfa_enabled).toBe(1);
    expect(row.mfa_secret).toBeTruthy();
    expect(row.mfa_recovery_codes_json).toBeTruthy();
    dbCheck.close();
  }

  // --- (E) Un administrateur réinitialise — le bouton exige une confirmation ---
  await logout(page);
  await loginAs(page, "admin");
  await page.goto(`/users/${userId}`);
  await expect(page.getByRole("heading", { name: `Responsable MFA Test ${t}` })).toBeVisible();
  // Le bouton "Réinitialiser MFA" n'est rendu QUE si mfa_enabled===1 (voir
  // app/(app)/users/[id]/page.tsx) — sa seule présence prouve déjà l'état
  // MFA actif sans ambiguïté avec le badge "Actif" du STATUT DE COMPTE
  // (texte identique, présent ailleurs sur la même page).
  const resetButton = page.getByRole("button", { name: /réinitialiser mfa/i });
  await expect(resetButton).toBeVisible();

  let dialogMessageSeen = "";
  page.once("dialog", (dialog) => {
    dialogMessageSeen = dialog.message();
    void dialog.accept();
  });
  await resetButton.click();
  expect(dialogMessageSeen).toMatch(/réinitialiser le mfa de ce compte/i);
  // Preuve de succès par l'ÉTAT STABLE résultant plutôt que par le message
  // transitoire "MFA réinitialisée pour ce compte." — celui-ci vit dans
  // l'état local de useActionState() côté ActionButton, remonté par le
  // revalidatePath("/users/[id]") appelé DANS l'action elle-même ; les
  // deux (nouvel arbre RSC + state.success local) peuvent arriver dans un
  // ordre non garanti et le message peut ne jamais être observable côté
  // test avant d'être remplacé — le bouton disparaissant ET le badge
  // passant à "Non activé" est une preuve tout aussi directe, non racy.
  await expect(page.getByRole("button", { name: /réinitialiser mfa/i })).toHaveCount(0);
  await expect(page.getByText("Non activé")).toBeVisible();

  // (G) le secret original n'apparaît nulle part sur la page admin après coup.
  const adminPageHtml = await page.content();
  expect(adminPageHtml).not.toContain(originalSecret.replace(/\s/g, ""));

  // --- (F/G/H) Vérification DB directe : matériel TOTP invalidé, aucune
  // fuite de secret en base, exactement UNE entrée d'audit user_mfa_reset. ---
  {
    const dbCheck = openDb();
    const row = dbCheck.prepare(`SELECT mfa_enabled, mfa_secret, mfa_recovery_codes_json FROM users WHERE id = ?`).get(userId) as {
      mfa_enabled: number;
      mfa_secret: string | null;
      mfa_recovery_codes_json: string | null;
    };
    expect(row.mfa_enabled).toBe(0);
    expect(row.mfa_secret).toBeNull();
    expect(row.mfa_recovery_codes_json).toBeNull();

    const auditRows = dbCheck
      .prepare(`SELECT action, target_type, target_id, metadata_json, result FROM audit_logs WHERE action = 'user_mfa_reset' AND target_id = ?`)
      .all(userId) as { action: string; target_type: string; target_id: number; metadata_json: string | null; result: string }[];
    expect(auditRows.length).toBe(1);
    expect(auditRows[0]!.target_type).toBe("user");
    expect(auditRows[0]!.result).toBe("success");
    // (G) aucun secret dans les métadonnées d'audit non plus.
    const metaText = auditRows[0]!.metadata_json ?? "";
    expect(metaText).not.toContain(originalSecret.replace(/\s/g, ""));
    dbCheck.close();
  }

  // --- (F) Preuve comportementale, pas seulement en base : une reconnexion
  // avec identifiant/mot de passe seuls ne déclenche PLUS AUCUNE invite MFA
  // (le second facteur a été réellement désactivé côté serveur). ---
  await logout(page);
  await page.goto("/login");
  await page.getByLabel("Nom d'utilisateur").fill(username);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await page.waitForURL(/\/overview/);
  await expect(page).not.toHaveURL(/verifier-mfa/);

  // --- (I) Le titulaire peut reprendre le parcours normal d'inscription
  // MFA s'il le souhaite — un nouveau secret, jamais l'ancien. ---
  await page.goto("/mon-compte");
  await expect(page.getByText(/MFA n'est pas encore activé/i)).toBeVisible();
  await page.getByRole("button", { name: /activer mfa/i }).click();
  const newSecretLocator = page.getByTestId("mfa-secret");
  await expect(newSecretLocator).toBeVisible();
  const newSecret = (await newSecretLocator.textContent())!.trim();
  expect(newSecret).not.toBe(originalSecret);
  const newCode = totpAt(newSecret, Date.now());
  await page.getByLabel(/code de vérification/i).fill(newCode);
  await page.getByRole("button", { name: /^confirmer$/i }).click();
  await expect(page.getByText(/MFA activé\./i)).toBeVisible();

  await logout(page);
});

test("B/C/D — candidat, auditeur, et responsable pédagogique d'un AUTRE client ne peuvent structurellement pas atteindre l'action de réinitialisation MFA (seul point d'entrée : /users/[id], strictement réservé à l'administrateur — voir lib/rbac.ts::requireWriteRole appliqué DANS adminResetMfaAction elle-même, défense en profondeur)", async ({ page }) => {
  const t = uniqueTag();
  const db = openDb();
  const roleRow = db.prepare(`SELECT id FROM roles WHERE code = 'pedagogical_manager'`).get() as { id: number };
  const password = "MotDePasseValideE2E-MFA2!";
  const username = `${t}.mfa-target2`;
  const insert = db
    .prepare(`INSERT INTO users (username, password_hash, full_name, status) VALUES (?, ?, ?, 'active')`)
    .run(username, hashPassword(password), `Cible MFA ${t}`);
  const targetUserId = Number(insert.lastInsertRowid);
  db.prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(targetUserId, roleRow.id);
  db.close();

  // (B) candidat — /users/[id] est une page 100% hors périmètre candidat.
  await loginAs(page, "candidat1.demo");
  await page.goto(`/users/${targetUserId}`);
  await expect(page).toHaveURL(/\/acces-refuse/);
  await expect(page.getByRole("button", { name: /réinitialiser mfa/i })).toHaveCount(0);
  await logout(page);

  // (C) auditeur — lecture seule, mais /users lui reste également fermé
  // (aucun accès, pas même en lecture — voir CLAUDE_eexam policy §16 :
  // /users reste ADMIN ONLY, l'auditeur consulte /audit-logs, jamais /users).
  await loginAs(page, "auditeur.demo");
  await page.goto(`/users/${targetUserId}`);
  await expect(page).toHaveURL(/\/acces-refuse/);
  await expect(page.getByRole("button", { name: /réinitialiser mfa/i })).toHaveCount(0);
  await logout(page);

  // (D) responsable pédagogique d'un AUTRE client (tenant isolé, fixture
  // seed-email-demo.ts) — même refus, /users est global-admin-only, pas
  // seulement borné au tenant : un responsable ne l'atteint JAMAIS, y
  // compris pour un compte hors de son périmètre ET dans son périmètre.
  await loginAs(page, "responsable.e2e2");
  await page.goto(`/users/${targetUserId}`);
  await expect(page).toHaveURL(/\/acces-refuse/);
  await expect(page.getByRole("button", { name: /réinitialiser mfa/i })).toHaveCount(0);
  await logout(page);

  // Le compte cible n'a jamais eu MFA activé (jamais atteint par
  // personne) — confirmé en base, aucune trace d'une réinitialisation.
  const dbCheck = openDb();
  const auditRows = dbCheck.prepare(`SELECT COUNT(*) n FROM audit_logs WHERE action = 'user_mfa_reset' AND target_id = ?`).get(targetUserId) as { n: number };
  expect(auditRows.n).toBe(0);
  dbCheck.close();
});
