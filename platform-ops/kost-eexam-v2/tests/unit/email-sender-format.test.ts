import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";

// Régression — bug réel trouvé lors du premier envoi Resend réel en
// staging (mission de livraison contrôlée, 2026-08-29) : getSenderExam()
// prenait EMAIL_FROM_EXAM comme adresse nue puis le réenveloppait
// (`${name} <${address}>`) — mais .env.example documente (et staging a
// reçu) le format complet "Nom <email>", produisant un `from` invalide à
// deux niveaux ("KOST E-EXAM <KOST E-EXAM <exam@kostacademy.com>>"),
// rejeté par Resend (validation_error, confirmé par appel réel à
// resend.emails.send()). Ce fichier prouve que les DEUX formats
// produisent désormais une adresse correcte, quelle que soit la
// convention utilisée pour définir la variable d'environnement.
describe("Identités d'expéditeur — robuste aux deux formats d'env var", async () => {
  const ORIGINAL = { ...process.env };

  before(() => {
    delete process.env.EMAIL_FROM_EXAM;
    delete process.env.EMAIL_FROM_NOTIFICATIONS;
  });
  after(() => {
    process.env = ORIGINAL;
  });

  test("EMAIL_FROM_EXAM au format complet 'Nom <email>' (ce qui est réellement déployé) donne une adresse nue correcte, jamais réenveloppée", async () => {
    process.env.EMAIL_FROM_EXAM = "KOST E-EXAM <exam@kostacademy.com>";
    // Import dynamique après avoir posé la variable — cohérent avec le
    // style des autres tests email (lecture au moment de l'appel, pas au
    // chargement du module).
    const { getSenderExam } = await import("../../lib/email/config");
    const sender = getSenderExam();
    assert.equal(sender.address, "exam@kostacademy.com");
    assert.equal(sender.name, "KOST E-EXAM");
    // La construction finale (voir lib/email/send.ts) ne doit jamais
    // contenir un double chevron/nom imbriqué.
    const finalFrom = `${sender.name} <${sender.address}>`;
    assert.equal(finalFrom, "KOST E-EXAM <exam@kostacademy.com>");
    assert.doesNotMatch(finalFrom, /<[^<>]*<.*>[^<>]*>/, "jamais un from imbriqué (bug d'origine)");
  });

  test("EMAIL_FROM_NOTIFICATIONS au format adresse nue (documenté également) reste correct", async () => {
    process.env.EMAIL_FROM_NOTIFICATIONS = "notifications@kostacademy.com";
    const { getSenderNotifications } = await import("../../lib/email/config");
    const sender = getSenderNotifications();
    assert.equal(sender.address, "notifications@kostacademy.com");
  });
});
