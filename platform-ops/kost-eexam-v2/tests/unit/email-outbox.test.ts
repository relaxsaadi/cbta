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
});
