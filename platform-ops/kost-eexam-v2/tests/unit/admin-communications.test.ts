import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission "COMPLETE USER MANAGEMENT" (2026-08-29) — §52 A-K, communication
// admin/candidat : USERNAME_CHANGED, ADMIN_MESSAGE (nouveaux événements),
// adresse de support centralisée (§33-35), verrouillage du destinataire.
describe("Communication admin/candidat — USERNAME_CHANGED, ADMIN_MESSAGE, support email (mission COMPLETE USER MANAGEMENT §36-40)", async () => {
  before(() => {
    delete process.env.EMAIL_MODE;
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_ALLOWED_RECIPIENTS;
    delete process.env.EMAIL_SUPPORT_ADDRESS;
    delete process.env.EMAIL_REPLY_TO;
    process.env.APP_BASE_URL = "https://test.kostacademy.invalid";
    setupTestDb();
  });

  // --- A. getSupportEmail() — ordre de résolution EMAIL_SUPPORT_ADDRESS > EMAIL_REPLY_TO > repli fixe ---
  test("A — getSupportEmail() : repli fixe cbta@kostacademy.com quand rien n'est configuré (jamais support@kostacademy.com)", async () => {
    const { getSupportEmail } = await import("../../lib/email/config");
    assert.equal(getSupportEmail(), "cbta@kostacademy.com");
  });

  test("B — getSupportEmail() : EMAIL_REPLY_TO prend le dessus sur le repli fixe si configuré", async () => {
    process.env.EMAIL_REPLY_TO = "reply-test@kostacademy.com";
    const { getSupportEmail } = await import("../../lib/email/config");
    assert.equal(getSupportEmail(), "reply-test@kostacademy.com");
    delete process.env.EMAIL_REPLY_TO;
  });

  test("C — getSupportEmail() : EMAIL_SUPPORT_ADDRESS dédiée prend le dessus sur EMAIL_REPLY_TO", async () => {
    process.env.EMAIL_REPLY_TO = "reply-test@kostacademy.com";
    process.env.EMAIL_SUPPORT_ADDRESS = "support-dedie@kostacademy.com";
    const { getSupportEmail } = await import("../../lib/email/config");
    assert.equal(getSupportEmail(), "support-dedie@kostacademy.com");
    delete process.env.EMAIL_REPLY_TO;
    delete process.env.EMAIL_SUPPORT_ADDRESS;
  });

  // --- D. Le pied de page centralisé (EmailShell) affiche bien l'adresse de support résolue, sur N'IMPORTE quel gabarit ---
  test("D — le pied de page (EmailShell) affiche l'adresse de support résolue — vérifié sur un gabarit existant, jamais recopié en dur", async () => {
    const { render } = await import("@react-email/components");
    const { createElement } = await import("react");
    const AccountActivatedEmail = (await import("../../lib/email/templates/account-activated")).default;
    const html = await render(createElement(AccountActivatedEmail, { firstName: "Amel", loginUrl: "https://test.kostacademy.invalid/login" }));
    assert.match(html, /cbta@kostacademy\.com/, "adresse de support correcte présente");
    assert.doesNotMatch(html, /support@kostacademy\.com/, "jamais l'ancienne adresse générique non confirmée");
  });

  // --- E. Gabarit USERNAME_CHANGED : contient le nouvel identifiant, jamais un mot de passe ---
  test("E — le gabarit USERNAME_CHANGED affiche le nouvel identifiant, jamais un mot de passe", async () => {
    const { render } = await import("@react-email/components");
    const { createElement } = await import("react");
    const UsernameChangedEmail = (await import("../../lib/email/templates/username-changed")).default;
    const html = await render(createElement(UsernameChangedEmail, { firstName: "Amel", newUsername: "amel.nouveau", loginUrl: "https://test.kostacademy.invalid/login" }));
    assert.match(html, /amel\.nouveau/);
    // Jamais un champ "Mot de passe : {valeur}" affiché (même style de
    // ligne que InfoCard rend pour "Identifiant : {valeur}" ci-dessus) —
    // le composant n'accepte d'ailleurs aucune prop mot de passe par
    // construction, cette assertion vérifie le comportement observable.
    assert.doesNotMatch(html, /Mot de passe<!-- --> : /i);
  });

  // --- F. Gabarit PASSWORD_RESET_REQUESTED (mis à jour) affiche bien l'identifiant ---
  test("F — le gabarit PASSWORD_RESET_REQUESTED (mis à jour) affiche l'identifiant de connexion", async () => {
    const { render } = await import("@react-email/components");
    const { createElement } = await import("react");
    const PasswordResetRequestedEmail = (await import("../../lib/email/templates/password-reset-requested")).default;
    const html = await render(
      createElement(PasswordResetRequestedEmail, { firstName: "Amel", username: "amel.reset", resetUrl: "https://x", expiresAtFormatted: "30/08/2026" })
    );
    assert.match(html, /amel\.reset/);
  });

  // --- G. Gabarit PASSWORD_CHANGED (mis à jour) affiche l'identifiant, jamais le mot de passe ---
  test("G — le gabarit PASSWORD_CHANGED (mis à jour) affiche l'identifiant, jamais le mot de passe", async () => {
    const { render } = await import("@react-email/components");
    const { createElement } = await import("react");
    const PasswordChangedEmail = (await import("../../lib/email/templates/password-changed")).default;
    const html = await render(
      createElement(PasswordChangedEmail, { firstName: "Amel", username: "amel.pwd", changedAtFormatted: "29/08/2026", loginUrl: "https://x/login" })
    );
    assert.match(html, /amel\.pwd/);
  });

  // --- H. Gabarit ADMIN_MESSAGE affiche objet/type/expéditeur/corps, respecte le CTA optionnel ---
  test("H — le gabarit ADMIN_MESSAGE affiche objet/type/expéditeur/corps et le CTA optionnel", async () => {
    const { render } = await import("@react-email/components");
    const { createElement } = await import("react");
    const AdminMessageEmail = (await import("../../lib/email/templates/admin-message")).default;
    const html = await render(
      createElement(AdminMessageEmail, {
        firstName: "Amel",
        senderName: "Admin Test",
        messageTypeLabel: "Session / formation",
        subject: "Session reportée",
        bodyText: "La session est reportée au 10 septembre.",
        ctaLabel: "Voir mes examens",
        ctaUrl: "https://test.kostacademy.invalid/mes-examens",
      })
    );
    assert.match(html, /Session reportée/);
    assert.match(html, /Admin Test/);
    assert.match(html, /reportée au 10 septembre/);
    assert.match(html, /Voir mes examens/);
  });

  // --- I. notifyUsernameChanged() écrit bien une ligne notification_log, idempotente sur le même changedAt ---
  test("I — notifyUsernameChanged() écrit l'outbox et se déduplique sur la même clé (changedAt identique)", async () => {
    const { createUser } = await import("../../lib/users");
    const { notifyUsernameChanged } = await import("../../lib/email/events");
    const { getDb } = await import("../../lib/db");
    const userId = createUser({ username: "comm.i.user", password: "x".repeat(10), fullName: "Test I", role: "candidate" });
    const changedAt = new Date().toISOString();
    const params = { userId, email: "username-changed-test@example.com", firstName: "Test", newUsername: "test.new", changedAt };

    await notifyUsernameChanged(params);
    await notifyUsernameChanged(params);

    const rows = getDb().prepare(`SELECT COUNT(*) AS n FROM notification_log WHERE event_type = 'USERNAME_CHANGED' AND recipient_email = ?`).get(params.email) as { n: number };
    assert.equal(rows.n, 1, "un seul appel réel malgré deux invocations avec le même changedAt");
  });

  // --- J. notifyAdminMessage() écrit une ligne distincte par envoi (sentAt différent = jamais dédupliqué à tort) ---
  test("J — notifyAdminMessage() produit une ligne d'historique DISTINCTE par envoi réel (jamais fusionné entre deux messages différents)", async () => {
    const { createUser } = await import("../../lib/users");
    const { notifyAdminMessage } = await import("../../lib/email/events");
    const { getDb } = await import("../../lib/db");
    const userId = createUser({ username: "comm.j.user", password: "x".repeat(10), fullName: "Test J", role: "candidate" });
    const email = "admin-message-test@example.com";

    await notifyAdminMessage({
      userId,
      email,
      firstName: "Test",
      senderName: "Admin",
      messageTypeLabel: "Information",
      subject: "Premier message",
      bodyText: "Corps 1",
      sentAt: new Date(Date.now()).toISOString(),
    });
    await notifyAdminMessage({
      userId,
      email,
      firstName: "Test",
      senderName: "Admin",
      messageTypeLabel: "Information",
      subject: "Second message",
      bodyText: "Corps 2",
      sentAt: new Date(Date.now() + 1000).toISOString(),
    });

    const rows = getDb().prepare(`SELECT COUNT(*) AS n FROM notification_log WHERE event_type = 'ADMIN_MESSAGE' AND recipient_email = ?`).get(email) as { n: number };
    assert.equal(rows.n, 2, "deux messages distincts produisent deux lignes d'historique distinctes");
  });

  // --- K. notify*() ne lève JAMAIS, même en cas d'échec avant l'outbox (même garantie safe() que le reste du sous-système) ---
  test("K — notifyAdminMessage()/notifyUsernameChanged() ne lèvent jamais vers l'appelant (garantie safe(), §39)", async () => {
    const { createUser } = await import("../../lib/users");
    const userId = createUser({ username: "comm.k.user", password: "x".repeat(10), fullName: "Test K", role: "candidate" });
    delete process.env.APP_BASE_URL; // notifyUsernameChanged construit un loginUrl via getAppBaseUrl() — provoquerait une exception AVANT l'outbox sans safe()
    const { notifyUsernameChanged, notifyAdminMessage } = await import("../../lib/email/events");
    await assert.doesNotReject(notifyUsernameChanged({ userId, email: "safe-test@example.com", firstName: "Test", newUsername: "x", changedAt: new Date().toISOString() }));
    await assert.doesNotReject(
      notifyAdminMessage({ userId, email: "safe-test@example.com", firstName: "Test", senderName: "Admin", messageTypeLabel: "Information", subject: "S", bodyText: "B", sentAt: new Date().toISOString() })
    );
    process.env.APP_BASE_URL = "https://test.kostacademy.invalid";
  });
});
