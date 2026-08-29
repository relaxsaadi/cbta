import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission "FIX ACCOUNT LIFECYCLE GUARDS" (2026-08-29) — régression pour
// l'incident staging réel (compte candidat "brahimi mohssen", jamais
// activé, basculé 'active' par un simple clic "Réactiver", puis suspendu).
// Deux bugs distincts corrigés :
//   1. quickReactivateAction/reactivateAccountAction basculaient
//      inconditionnellement vers 'active', même pour un compte jamais
//      activé — corrigé par reactivateUserSafely() (lib/users.ts), qui
//      s'appuie sur hasCompletedActivation() (lib/activation-tokens.ts,
//      signal réel = un jeton account_setup CONSOMMÉ existe) plutôt que
//      sur le statut affiché seul.
//   2. activateAccountAction n'importait aucun contrôle de statut — un
//      jeton valide/non consommé l'emportait sur une suspension
//      administrative explicite — corrigé par activationDenialReason()
//      (lib/users.ts), appelée par app/activer/actions.ts.
//
// E/F (jeton expiré/consommé toujours refusés) sont déjà couverts par
// tests/unit/activation-tokens.test.ts — non dupliqués ici.
// G/H (auditeur et responsable pédagogique ne peuvent jamais suspendre/
// réactiver — /users est administrator-only) sont couverts côté E2E
// (tests/e2e/scenario-h-auditor-readonly.spec.ts + l'ajout de cette
// mission pour le responsable pédagogique) — lib/rbac.ts porte "server-
// only", jamais testable directement ici (même contrainte structurelle
// documentée dans pending-activation-login.test.ts).
describe("Cycle de vie de compte — garde-fous de réactivation/activation (mission 2026-08-29)", async () => {
  before(() => setupTestDb());

  const { createUser, createUserPendingActivation, setPasswordAndActivate, findUserByUsername, setUserStatus, reactivateUserSafely, activationDenialReason } = await import(
    "../../lib/users"
  );
  const { createActivationToken, consumeActivationToken, verifyActivationToken, hasCompletedActivation } = await import("../../lib/activation-tokens");
  const { getDb } = await import("../../lib/db");

  // --- A. pending_activation → reactivateUserSafely ne fait RIEN (jamais 'active' sans passage réel par le mot de passe) ---
  test("A — reactivateUserSafely() sur un compte pending_activation (jamais suspendu) est un no-op, jamais 'active'", () => {
    const userId = createUserPendingActivation({ username: "lifecycle.a", fullName: "Test A", role: "candidate", email: "lifecycle.a@example.com" });
    const before = findUserByUsername("lifecycle.a")!;
    assert.equal(before.status, "pending_activation");

    const result = reactivateUserSafely(userId);
    assert.equal(result.changed, false, "aucune réactivation n'a de sens depuis pending_activation — no-op attendu");
    assert.equal(result.newStatus, null);

    const after = findUserByUsername("lifecycle.a")!;
    assert.equal(after.status, "pending_activation", "le statut ne doit jamais bouger");
  });

  // --- B. suspended + jeton valide → activation refusée ---
  test("B — activationDenialReason('suspended') refuse toujours l'activation, même avec un jeton par ailleurs valide", () => {
    const userId = createUserPendingActivation({ username: "lifecycle.b", fullName: "Test B", role: "candidate", email: "lifecycle.b@example.com" });
    const { token } = createActivationToken({ userId, purpose: "account_setup" });

    // Suspension administrative intervenant APRÈS l'envoi de l'invitation
    // (exactement le scénario réel de l'incident Brahimi).
    setUserStatus(userId, "suspended");

    // Le jeton lui-même reste techniquement valide (non expiré, non consommé)...
    const tokenRow = verifyActivationToken(token, "account_setup");
    assert.ok(tokenRow, "le jeton reste valide en tant que jeton");

    // ...mais la décision d'activation doit refuser, car le compte est suspendu.
    const user = findUserByUsername("lifecycle.b")!;
    assert.equal(activationDenialReason(user.status), "suspended");
  });

  // --- C. suspended (compte déjà réellement activé un jour) → réactivation autorisée retourne 'active' ---
  test("C — reactivateUserSafely() sur un compte SUSPENDU qui a déjà réellement complété l'activation retourne bien 'active'", () => {
    const userId = createUserPendingActivation({ username: "lifecycle.c", fullName: "Test C", role: "candidate", email: "lifecycle.c@example.com" });
    const { token } = createActivationToken({ userId, purpose: "account_setup" });
    // Simule le VRAI flux d'activation (le candidat choisit son mot de
    // passe, le jeton est consommé) — jamais un mot de passe inventé ici.
    const tokenRow = verifyActivationToken(token, "account_setup")!;
    setPasswordAndActivate(userId, "CeCandidatAChoisiCeMotDePasse123!");
    consumeActivationToken(tokenRow.id);
    assert.equal(hasCompletedActivation(userId), true);

    setUserStatus(userId, "suspended"); // suspension ultérieure, légitime

    const result = reactivateUserSafely(userId);
    assert.equal(result.changed, true);
    assert.equal(result.newStatus, "active", "un compte déjà réellement activé revient à 'active', pas 'pending_activation'");
  });

  // --- C-bis. suspended (JAMAIS réellement activé, ex. Brahimi RÉEL : un jeton a été émis mais jamais consommé) → réactivation restaure 'pending_activation', jamais 'active' ---
  test("C-bis — reactivateUserSafely() sur un compte SUSPENDU dont le jeton d'invitation n'a jamais été consommé (cas Brahimi réel) restaure 'pending_activation', jamais 'active'", () => {
    const userId = createUserPendingActivation({ username: "lifecycle.cbis", fullName: "Brahimi Simulé", role: "candidate", email: "lifecycle.cbis@example.com" });
    // Un jeton EST émis (comme le fait toujours inviteNewCandidate/
    // createUserAction juste après la création) mais jamais consommé —
    // exactement l'état réel du compte Brahimi. Bug réel trouvé en E2E
    // (2026-08-29) : traiter "zéro jeton émis" (comptes de démo créés
    // hors du flux d'invitation) comme équivalent à "jamais activé"
    // cassait la réactivation de comptes de démo légitimes — corrigé,
    // voir lib/activation-tokens.ts::hasCompletedActivation().
    createActivationToken({ userId, purpose: "account_setup" });
    setUserStatus(userId, "suspended");
    assert.equal(hasCompletedActivation(userId), false, "un jeton émis mais jamais consommé = jamais réellement activé");

    const passwordHashBefore = getDb().prepare(`SELECT password_hash FROM users WHERE id = ?`).get(userId) as { password_hash: string };

    const result = reactivateUserSafely(userId);
    assert.equal(result.changed, true);
    assert.equal(result.newStatus, "pending_activation", "jamais 'active' pour un compte jamais réellement activé");

    const passwordHashAfter = getDb().prepare(`SELECT password_hash FROM users WHERE id = ?`).get(userId) as { password_hash: string };
    assert.equal(passwordHashAfter.password_hash, passwordHashBefore.password_hash, "aucun mot de passe n'est jamais inventé/modifié par cette restauration");
  });

  // --- C-ter. suspended (JAMAIS passé par le flux d'invitation par jeton — ex. compte de démo legacy créé directement) → réactivation autorisée retourne 'active' ---
  test("C-ter — un compte qui n'est jamais passé par le flux d'invitation par jeton (aucun jeton account_setup émis, ex. comptes de démo) reste réactivable normalement vers 'active'", () => {
    // Reproduit exactement scripts/seed-demo.ts::ensureUser() — createUser()
    // direct, aucun jeton account_setup n'existe jamais pour ce compte.
    const userId = createUser({ username: "lifecycle.cter", password: "ChangeMoi123!", fullName: "Compte Démo Legacy", role: "candidate", email: "lifecycle.cter@example.com" });
    assert.equal(hasCompletedActivation(userId), true, "aucun jeton émis du tout = hors périmètre de cette contrainte, toujours considéré utilisable");

    setUserStatus(userId, "suspended");
    const result = reactivateUserSafely(userId);
    assert.equal(result.changed, true);
    assert.equal(result.newStatus, "active", "un compte de démo/legacy jamais passé par le flux d'invitation reste réactivable directement, comme avant cette mission");
  });

  // --- D. pending_activation + jeton valide → activation légitime réussit ---
  test("D — un jeton valide sur un compte pending_activation active légitimement (activationDenialReason retourne null)", () => {
    const userId = createUserPendingActivation({ username: "lifecycle.d", fullName: "Test D", role: "candidate", email: "lifecycle.d@example.com" });
    const user = findUserByUsername("lifecycle.d")!;
    assert.equal(activationDenialReason(user.status), null, "pending_activation doit toujours rester activable");

    const { token } = createActivationToken({ userId, purpose: "account_setup" });
    const tokenRow = verifyActivationToken(token, "account_setup");
    assert.ok(tokenRow);
    setPasswordAndActivate(userId, "MotDePasseChoisiParLeCandidat123!");
    consumeActivationToken(tokenRow!.id);

    const after = findUserByUsername("lifecycle.d")!;
    assert.equal(after.status, "active");
    // Un jeton une fois consommé ne revalide plus jamais (usage unique).
    assert.equal(verifyActivationToken(token, "account_setup"), null);
  });

  // --- I. aucun effet de notification en double/non désiré selon la restauration ---
  test("I — restaurer vers 'pending_activation' ne doit jamais déclencher la même notification qu'une restauration vers 'active' (logique de décision)", () => {
    // Réplique exactement la condition utilisée par quickReactivateAction/
    // reactivateAccountAction : notifier ACCOUNT_REACTIVATED UNIQUEMENT si
    // newStatus === 'active'.
    const shouldNotifyReactivated = (newStatus: "active" | "pending_activation" | null) => newStatus === "active";

    const neverActivatedUserId = createUserPendingActivation({ username: "lifecycle.i1", fullName: "Test I1", role: "candidate", email: "lifecycle.i1@example.com" });
    createActivationToken({ userId: neverActivatedUserId, purpose: "account_setup" }); // émis (comme en réalité), jamais consommé
    setUserStatus(neverActivatedUserId, "suspended");
    const r1 = reactivateUserSafely(neverActivatedUserId);
    assert.equal(shouldNotifyReactivated(r1.newStatus), false, "jamais de notification ACCOUNT_REACTIVATED pour un retour à pending_activation");

    const everActivatedUserId = createUserPendingActivation({ username: "lifecycle.i2", fullName: "Test I2", role: "candidate", email: "lifecycle.i2@example.com" });
    const { token } = createActivationToken({ userId: everActivatedUserId, purpose: "account_setup" });
    const tokenRow = verifyActivationToken(token, "account_setup")!;
    setPasswordAndActivate(everActivatedUserId, "UnAutreMotDePasseChoisi123!");
    consumeActivationToken(tokenRow.id);
    setUserStatus(everActivatedUserId, "suspended");
    const r2 = reactivateUserSafely(everActivatedUserId);
    assert.equal(shouldNotifyReactivated(r2.newStatus), true, "une vraie réactivation vers 'active' déclenche bien la notification");

    // Rejouer reactivateUserSafely() une deuxième fois (déjà 'active', plus
    // 'suspended') doit être un no-op — jamais une deuxième notification.
    const r3 = reactivateUserSafely(everActivatedUserId);
    assert.equal(r3.changed, false, "un second appel sur un compte déjà 'active' ne doit rien refaire");
  });
});
