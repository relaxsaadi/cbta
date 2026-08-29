import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Régression — mission email §35/§39 : "un problème d'email n'annule
// jamais une action métier". Bug réel trouvé en préparant les tests E2E
// de cette mission : chaque notify*() construisait son URL via
// getAppBaseUrl() (lib/email/config.ts), qui LÈVE si APP_BASE_URL n'est
// pas configuré — et cette exception, survenant AVANT queueAndSendEmail()
// (donc avant toute protection outbox), remontait telle quelle à l'action
// métier appelante (création de compte, publication d'examen...). Aucun
// test existant ne l'exerçait : les comptes de démo n'ont pas d'email, donc
// `if (!candidate?.email) continue` court-circuitait l'appel avant qu'il
// puisse lever. Corrigé en enveloppant chaque notify*() dans safe()
// (lib/email/events.ts) — ce fichier prouve que la garantie tient
// vraiment, pas seulement pour les pannes réseau Resend (déjà couvertes
// par email-outbox.test.ts) mais aussi pour une config manquante.
describe("notify*() ne lève JAMAIS, même sans configuration email (mission email §35/§39)", async () => {
  before(() => {
    delete process.env.EMAIL_MODE;
    delete process.env.APP_BASE_URL; // le cas exact du bug — jamais configuré ici
    setupTestDb();
  });

  test("notifyAccountCreated ne lève jamais, même avec APP_BASE_URL manquant (aurait cassé la création de compte)", async () => {
    const { notifyAccountCreated } = await import("../../lib/email/events");
    await assert.doesNotReject(
      notifyAccountCreated({
        userId: 999,
        email: "candidate-safe-test@example.com",
        firstName: "Test",
        companyId: null,
        companyName: "Test SARL",
        groupName: "Groupe Test",
        usernameOrEmail: "candidate-safe-test@example.com",
        activationToken: "fake-token-for-test",
        expiresAt: new Date().toISOString(),
      })
    );
  });

  test("notifyExamAssigned ne lève jamais, même avec APP_BASE_URL manquant (aurait cassé la publication d'examen)", async () => {
    const { notifyExamAssigned } = await import("../../lib/email/events");
    await assert.doesNotReject(
      notifyExamAssigned({
        userId: 999,
        email: "candidate-safe-test-2@example.com",
        firstName: "Test",
        assessmentId: 1,
        examName: "Examen Test",
        functionLabel: "Fonction 7.1",
        companyId: 1,
        companyName: "Test SARL",
        groupName: "Groupe Test",
        openAt: null,
        closeAt: null,
        durationMinutes: 60,
        attemptsAllowed: 1,
      })
    );
  });

  test("un échec avant l'outbox ne crée AUCUNE ligne notification_log (rien à moitié écrit)", async () => {
    const { notifyAccountActivated } = await import("../../lib/email/events");
    const { getDb } = await import("../../lib/db");
    const before = (getDb().prepare(`SELECT COUNT(*) AS n FROM notification_log WHERE event_type = 'ACCOUNT_ACTIVATED'`).get() as { n: number }).n;
    await notifyAccountActivated({ userId: 999, email: "no-crash@example.com", firstName: "Test" });
    const after = (getDb().prepare(`SELECT COUNT(*) AS n FROM notification_log WHERE event_type = 'ACCOUNT_ACTIVATED'`).get() as { n: number }).n;
    assert.equal(after, before, "aucune ligne créée — l'échec est survenu avant queueAndSendEmail, jamais une écriture partielle");
  });
});
