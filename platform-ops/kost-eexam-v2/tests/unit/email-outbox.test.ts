import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission email §34-36/§53/§66 — garanties de l'outbox : idempotence
// (jamais deux lignes pour la même clé), sécurité de staging (EMAIL_MODE
// par défaut = "log", jamais un envoi réel accidentel), et la règle §31
// (un événement obligatoire ignore toujours les préférences optionnelles).
//
// setupTestDb() une seule fois pour tout le fichier (before, pas
// beforeEach) — getDb() est un singleton par PROCESS (lib/db.ts) qui ne
// relit DB_PATH qu'à sa toute première résolution ; l'appeler plusieurs
// fois réinsère le même jeu de rôles/fonctions dans la MÊME base déjà
// initialisée et casse la contrainte UNIQUE(roles.code) — même piège que
// documenté dans tous les autres fichiers de tests existants (voir
// tests/unit/tenant-scope.test.ts pour le même schéma before-once). Les
// tests ci-dessous utilisent donc des clés d'idempotence/emails/usernames
// distincts entre eux pour rester indépendants sur la base partagée.
describe("Outbox email — idempotence, EMAIL_MODE, préférences", async () => {
  before(() => {
    delete process.env.EMAIL_MODE;
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_ALLOWED_RECIPIENTS;
    // notifyAccountCreated() (utilisée par le test de régression du renvoi
    // ci-dessous) construit toujours un lien via getAppBaseUrl() — voir
    // tests/unit/email-reminders.test.ts pour le même besoin.
    process.env.APP_BASE_URL = "https://test.kostacademy.invalid";
    setupTestDb();
  });

  test("EMAIL_MODE par défaut (non configuré) = 'log' — jamais un envoi réel", async () => {
    const { getEmailMode } = await import("../../lib/email/config");
    assert.equal(getEmailMode(), "log");
  });

  test("un même idempotencyKey, appelé deux fois, ne crée qu'une seule ligne notification_log", async () => {
    const { queueAndSendEmail } = await import("../../lib/email/send");
    const { getDb } = await import("../../lib/db");
    const params = {
      eventType: "ACCOUNT_CREATED" as const,
      idempotencyKey: "test-dedup-key-1",
      recipientEmail: "candidate@example.com",
      userId: null,
      tenant: { companyId: null, companyName: null },
      sender: { name: "KOST E-EXAM", address: "exam@kostacademy.com" },
      rendered: { subject: "Test", html: "<p>Test</p>", text: "Test", templateId: "test", templateVersion: "v1" },
    };
    const first = await queueAndSendEmail(params);
    const second = await queueAndSendEmail(params);
    assert.equal(first.deduplicated, false);
    assert.equal(second.deduplicated, true);
    assert.equal(first.notificationId, second.notificationId);

    const rows = getDb().prepare(`SELECT COUNT(*) AS n FROM notification_log WHERE idempotency_key = ?`).get("test-dedup-key-1") as { n: number };
    assert.equal(rows.n, 1, "une seule ligne, jamais un doublon");
  });

  test("en mode 'log' (défaut), le statut final est SUPPRESSED — jamais un vrai appel réseau Resend", async () => {
    const { queueAndSendEmail } = await import("../../lib/email/send");
    const result = await queueAndSendEmail({
      eventType: "PASSWORD_CHANGED",
      idempotencyKey: "test-log-mode-key",
      recipientEmail: "someone@example.com",
      userId: null,
      tenant: { companyId: null, companyName: null },
      sender: { name: "KOST Security", address: "security@kostacademy.com" },
      rendered: { subject: "Test", html: "<p>Test</p>", text: "Test", templateId: "test", templateVersion: "v1" },
    });
    assert.equal(result.status, "SUPPRESSED");
  });

  test("un événement MANDATORY ignore toujours les préférences (même si rappels optionnels désactivés)", async () => {
    const { shouldSendToUser } = await import("../../lib/email/preferences");
    const { setOptionalRemindersEnabled } = await import("../../lib/email/preferences");
    const { getDb } = await import("../../lib/db");
    getDb().prepare(`INSERT INTO users (username, password_hash, full_name, status) VALUES ('u1','h','U1','active')`).run();
    const userId = getDb().prepare(`SELECT id FROM users WHERE username='u1'`).get() as { id: number };
    setOptionalRemindersEnabled(userId.id, false);
    // ACCOUNT_CREATED est dans MANDATORY_EVENT_TYPES — doit rester true
    // même désactivé.
    assert.equal(shouldSendToUser("ACCOUNT_CREATED", userId.id), true);
    // FAMILIARIZATION_INVITATION n'est PAS dans MANDATORY_EVENT_TYPES —
    // doit respecter la préférence désactivée.
    assert.equal(shouldSendToUser("FAMILIARIZATION_INVITATION", userId.id), false);
  });

  // Régression — bug réel trouvé en testant "Renvoyer l'invitation" sur
  // staging (2026-08-29, compte Brahimi) : notifyAccountCreated() n'avait
  // pas de forceResendSuffix (contrairement à notifyExamAssigned, déjà
  // correct) — un renvoi utilisait donc la MÊME idempotency_key que
  // l'envoi d'origine et se faisait dédupliquer silencieusement,
  // n'aboutissant JAMAIS à une nouvelle tentative réelle ni à une
  // nouvelle ligne d'historique observable par l'admin.
  test("notifyAccountCreated AVEC forceResendSuffix crée bien une nouvelle ligne — jamais dédupliqué contre l'envoi d'origine (bug d'origine)", async () => {
    const { notifyAccountCreated } = await import("../../lib/email/events");
    const { createUserPendingActivation } = await import("../../lib/users");
    const { getDb } = await import("../../lib/db");

    // user_id porte une contrainte FK réelle vers users(id) — un id
    // inventé serait rejeté par safe() (comportement correct, mais pas ce
    // que ce test vérifie), d'où un vrai compte de test ici.
    const userId = createUserPendingActivation({ username: "resend-regression-user", fullName: "Resend Regression", role: "candidate", email: "resend-regression@example.com" });

    const params = {
      userId,
      email: "resend-regression@example.com",
      firstName: "Test",
      companyId: null,
      companyName: "Test SARL",
      groupName: "Groupe Test",
      usernameOrEmail: "resend-regression@example.com",
      activationToken: "fake-token-original",
      expiresAt: new Date().toISOString(),
    };
    await notifyAccountCreated(params);
    await notifyAccountCreated({ ...params, activationToken: "fake-token-resend", forceResendSuffix: String(Date.now()) });

    const rows = getDb().prepare(`SELECT idempotency_key FROM notification_log WHERE user_id = ? AND event_type = 'ACCOUNT_CREATED' ORDER BY id`).all(userId) as {
      idempotency_key: string;
    }[];
    assert.equal(rows.length, 2, "le renvoi doit créer une DEUXIÈME ligne, jamais se faire absorber par la première");
    assert.notEqual(rows[0]!.idempotency_key, rows[1]!.idempotency_key, "les deux clés d'idempotence doivent être distinctes");
  });

  test("une adresse en liste de suppression (bounce dur) n'est jamais renvoyée automatiquement", async () => {
    const { queueAndSendEmail } = await import("../../lib/email/send");
    const { getDb } = await import("../../lib/db");
    getDb().prepare(`INSERT INTO email_suppressions (email, reason) VALUES ('bounced@example.com', 'hard_bounce')`).run();
    const result = await queueAndSendEmail({
      eventType: "EXAM_ASSIGNED",
      idempotencyKey: "test-suppression-key",
      recipientEmail: "bounced@example.com",
      userId: null,
      tenant: { companyId: null, companyName: null },
      sender: { name: "KOST E-EXAM", address: "exam@kostacademy.com" },
      rendered: { subject: "Test", html: "<p>Test</p>", text: "Test", templateId: "test", templateVersion: "v1" },
    });
    assert.equal(result.status, "SUPPRESSED");
  });

  // Mission "FIX NESRINE/FETHI STAGING DELIVERY + PREVENT DUPLICATE
  // CANDIDATE CREATION" (2026-08-30) §10-H — le mode EMAIL_MODE=allowlist
  // lui-même (distinct de "log" testé plus haut, et distinct de la liste
  // de suppression bounce/plainte testée ci-dessus) n'avait pas encore de
  // couverture dédiée dans cette suite, alors même que c'est le mode
  // réellement configuré sur staging. Restaure explicitement
  // EMAIL_MODE/EMAIL_ALLOWED_RECIPIENTS après coup (jamais de fuite
  // d'état vers un test suivant dans ce même fichier/process).
  test("§10-H — EMAIL_MODE=allowlist supprime réellement un destinataire hors liste, envoie réellement un destinataire dans la liste", async () => {
    const { queueAndSendEmail } = await import("../../lib/email/send");
    process.env.EMAIL_MODE = "allowlist";
    process.env.EMAIL_ALLOWED_RECIPIENTS = "approved@example.com";
    try {
      const notApproved = await queueAndSendEmail({
        eventType: "EXAM_ASSIGNED",
        idempotencyKey: "test-allowlist-suppressed-key",
        recipientEmail: "not-approved@example.com",
        userId: null,
        tenant: { companyId: null, companyName: null },
        sender: { name: "KOST E-EXAM", address: "exam@kostacademy.com" },
        rendered: { subject: "Test", html: "<p>Test</p>", text: "Test", templateId: "test", templateVersion: "v1" },
      });
      assert.equal(notApproved.status, "SUPPRESSED", "un destinataire hors liste reste SUPPRESSED, jamais envoyé");

      // Insensible à la casse — même normalisation que
      // lib/email/config.ts::getAllowedRecipients() (.toLowerCase()).
      const approved = await queueAndSendEmail({
        eventType: "EXAM_ASSIGNED",
        idempotencyKey: "test-allowlist-approved-key",
        recipientEmail: "APPROVED@EXAMPLE.COM",
        userId: null,
        tenant: { companyId: null, companyName: null },
        sender: { name: "KOST E-EXAM", address: "exam@kostacademy.com" },
        rendered: { subject: "Test", html: "<p>Test</p>", text: "Test", templateId: "test", templateVersion: "v1" },
      });
      assert.notEqual(approved.status, "SUPPRESSED", "un destinataire dans la liste (même casse différente) n'est jamais supprimé par l'allowlist elle-même");
    } finally {
      delete process.env.EMAIL_MODE;
      delete process.env.EMAIL_ALLOWED_RECIPIENTS;
    }
  });

  // §10-E/F — "Renvoyer l'invitation" (le même mécanisme utilisé pour
  // Nesrine sur staging) opère TOUJOURS sur le compte EXISTANT passé en
  // paramètre — structurellement impossible de créer un second compte,
  // puisque resendInvitation() ne fait jamais d'INSERT INTO users, voir
  // lib/email/resend-actions.ts. Ce test vérifie l'invariant réel (compte
  // total inchangé, même id ciblé) plutôt que de re-tester la mécanique
  // interne déjà couverte par le test forceResendSuffix ci-dessus.
  test("§10-E/F — resendInvitation() opère sur le compte EXISTANT, ne crée jamais un second compte", async () => {
    const { resendInvitation } = await import("../../lib/email/resend-actions");
    const { createUserPendingActivation, findUserByUsername } = await import("../../lib/users");
    const { getDb } = await import("../../lib/db");

    const userId = createUserPendingActivation({ username: "resend-no-dup-user", fullName: "Resend NoDup", role: "candidate", email: "resend-no-dup@example.com" });
    const before = (getDb().prepare(`SELECT COUNT(*) n FROM users`).get() as { n: number }).n;

    await resendInvitation(userId, { id: userId, role: "administrator" });

    const after = (getDb().prepare(`SELECT COUNT(*) n FROM users`).get() as { n: number }).n;
    assert.equal(after, before, "aucun compte supplémentaire créé par le renvoi");

    const stillSameUser = findUserByUsername("resend-no-dup-user");
    assert.equal(stillSameUser?.id, userId, "le renvoi cible toujours le MÊME compte, jamais un doublon");

    const notifRows = getDb().prepare(`SELECT user_id FROM notification_log WHERE user_id = ? AND event_type = 'ACCOUNT_CREATED'`).all(userId) as { user_id: number }[];
    assert.ok(notifRows.length >= 1, "au moins une notification réelle a bien été journalisée pour CE compte");
    for (const row of notifRows) assert.equal(row.user_id, userId);
  });
});
