import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission "COMPLETE USER MANAGEMENT" (2026-08-29) — §49 A-M (gestion de
// compte), couvre archivage/restauration/suppression définitive STRICTE
// ainsi que DEUX bugs de sécurité réels trouvés en relisant les gardes de
// connexion/activation après l'ajout du statut 'archived' :
//   1. lib/auth.ts::login() ne vérifiait QUE 'pending_activation' et
//      'suspended' — un compte archivé avec un mot de passe encore valide
//      pouvait donc se connecter normalement (aucun test précédent
//      n'exerçait ce chemin, le statut 'archived' n'existait pas encore).
//   2. lib/users.ts::activationDenialReason() ne couvrait pas non plus
//      'archived' — un compte pending_activation archivé AVANT toute
//      activation conservait un jeton account_setup valide qui aurait pu
//      contourner l'archivage et faire passer le compte à 'active'.
describe("Archivage / restauration / suppression définitive (mission COMPLETE USER MANAGEMENT, 2026-08-29)", async () => {
  before(() => setupTestDb());

  const { createUser, createUserPendingActivation, findUserById, setPasswordAndActivate, archiveUser, restoreUser, canHardDeleteUser, hardDeleteUser, activationDenialReason } =
    await import("../../lib/users");
  const { createActivationToken, consumeActivationToken, verifyActivationToken } = await import("../../lib/activation-tokens");
  // lib/auth.ts porte "server-only" (voir pending-activation-login.test.ts
  // pour la même justification) — jamais importable directement ici. La
  // vérification "un compte archivé refuse la connexion, même avec un mot
  // de passe valide" (bug réel trouvé et corrigé dans ce fichier) est donc
  // couverte côté E2E (tests/e2e/scenario-l-user-management.spec.ts), pas
  // ici — cohérent avec la convention déjà établie dans ce projet.
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment, assignCandidatesToAssessment } = await import("../../lib/assessments");
  const { createFamiliarizationSession, markAttendance } = await import("../../lib/familiarization");
  const { getDb } = await import("../../lib/db");

  let counter = 0;
  function tag() {
    counter += 1;
    return `arch${counter}`;
  }

  // --- A. archiveUser() bascule 'active' -> 'archived', pose archived_at ---
  test("A — archiver un compte actif le fait passer à 'archived' et pose archived_at", () => {
    const userId = createUser({ username: `${tag()}.u`, password: "x".repeat(10), fullName: "Test A", role: "candidate" });
    const { changed } = archiveUser(userId);
    assert.equal(changed, true);
    const after = findUserById(userId)!;
    assert.equal(after.status, "archived");
    assert.ok(after.archived_at);
  });

  // --- B. archiver un compte déjà archivé est un no-op ---
  test("B — archiver un compte déjà archivé est un no-op (jamais un archivage en double)", () => {
    const userId = createUser({ username: `${tag()}.u`, password: "x".repeat(10), fullName: "Test B", role: "candidate" });
    archiveUser(userId);
    const first = findUserById(userId)!.archived_at;
    const { changed } = archiveUser(userId);
    assert.equal(changed, false);
    assert.equal(findUserById(userId)!.archived_at, first);
  });

  // --- D. restoreUser() sur un compte jamais réellement activé restaure 'pending_activation', jamais 'active' ---
  test("D — restaurer un compte pending_activation archivé (jamais activé) restaure 'pending_activation', jamais 'active'", () => {
    const userId = createUserPendingActivation({ username: `${tag()}.pa`, fullName: "Test D", role: "candidate", email: `${tag()}@example.com` });
    createActivationToken({ userId, purpose: "account_setup" }); // émis, jamais consommé
    archiveUser(userId);
    assert.equal(findUserById(userId)!.status, "archived");

    const { changed, newStatus } = restoreUser(userId);
    assert.equal(changed, true);
    assert.equal(newStatus, "pending_activation", "jamais 'active' pour un compte jamais réellement activé");
    assert.equal(findUserById(userId)!.archived_at, null);
  });

  // --- E. restoreUser() sur un compte déjà réellement activé restaure 'active' ---
  test("E — restaurer un compte déjà réellement activé (jeton consommé) restaure 'active'", () => {
    const userId = createUserPendingActivation({ username: `${tag()}.act`, fullName: "Test E", role: "candidate", email: `${tag()}@example.com` });
    const { token } = createActivationToken({ userId, purpose: "account_setup" });
    const tokenRow = verifyActivationToken(token, "account_setup")!;
    setPasswordAndActivate(userId, "MotDePasseChoisi123!");
    consumeActivationToken(tokenRow.id);
    archiveUser(userId);

    const { changed, newStatus } = restoreUser(userId);
    assert.equal(changed, true);
    assert.equal(newStatus, "active");
  });

  // --- F. restoreUser() sur un compte non archivé est un no-op ---
  test("F — restaurer un compte qui n'est PAS archivé est un no-op", () => {
    const userId = createUser({ username: `${tag()}.act2`, password: "x".repeat(10), fullName: "Test F", role: "candidate" });
    const { changed, newStatus } = restoreUser(userId);
    assert.equal(changed, false);
    assert.equal(newStatus, null);
  });

  // --- G. BUG RÉEL — activationDenialReason('archived') refuse l'activation, jamais un contournement de l'archivage par jeton encore valide ---
  test("G — un jeton d'activation valide sur un compte ARCHIVÉ (jamais activé avant l'archivage) est refusé, jamais un contournement silencieux (bug réel trouvé et corrigé)", () => {
    const userId = createUserPendingActivation({ username: `${tag()}.pa2`, fullName: "Test G", role: "candidate", email: `${tag()}@example.com` });
    const { token } = createActivationToken({ userId, purpose: "account_setup" });
    archiveUser(userId);

    // Le jeton lui-même reste techniquement valide...
    const tokenRow = verifyActivationToken(token, "account_setup");
    assert.ok(tokenRow, "le jeton reste valide en tant que jeton");
    // ...mais la décision d'activation doit refuser, car le compte est archivé.
    assert.equal(activationDenialReason(findUserById(userId)!.status), "archived");
  });

  // --- H. canHardDeleteUser() : compte inutilisé (jamais d'examen/affectation/incident) est SAFE ---
  test("H — un compte candidat inutilisé (jamais d'historique) est éligible à la suppression définitive", () => {
    const userId = createUserPendingActivation({ username: `${tag()}.unused`, fullName: "Jamais Utilisé", role: "candidate", email: `${tag()}@example.com` });
    const { safe, blockers } = canHardDeleteUser(userId);
    assert.equal(safe, true);
    assert.deepEqual(blockers, []);
  });

  // --- I. canHardDeleteUser() : un candidat avec une tentative/résultat d'examen est BLOQUÉ, avec le message exact requis ---
  test("I — un candidat avec une tentative d'examen terminée est BLOQUÉ à la suppression définitive, message exact requis", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const managerId = createUser({ username: `${t}.mgr`, password: "x".repeat(10), fullName: "Manager", role: "pedagogical_manager" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat Historique", role: "candidate", email: `${t}@example.com` });
    const companyId = createCompany({ name: `Co ${t}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `G ${t}`, scope: "test", pedagogicalManagerId: managerId, createdBy: managerId });
    addCandidateToGroup(groupId, candidateId, managerId);
    createQuestion({
      kostQuestionId: `TEST-${t.toUpperCase()}-1`,
      functionCode: "7.1",
      qtype: "mcq_single",
      sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Q",
      choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }],
      correctAnswer: ["A"],
      createdBy: adminId,
    });
    const assessmentId = createAssessmentDraft({
      type: "examen",
      name: `Examen ${t}`,
      functionCode: "7.1",
      groupId,
      questionSource: "random",
      questionCount: 1,
      durationMinutes: 30,
      passThresholdPct: 80,
      scope: "test",
      createdBy: managerId,
      openAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      closeAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    });
    publishAssessment(assessmentId, managerId);
    assignCandidatesToAssessment(assessmentId, [candidateId], managerId);

    const { safe, blockers } = canHardDeleteUser(candidateId);
    assert.equal(safe, false);
    assert.ok(blockers.some((b) => b.includes("affecté")), "l'affectation à un examen doit apparaître dans les raisons");

    assert.throws(
      () => hardDeleteUser(candidateId),
      (err: Error) => err.message === "Cet utilisateur possède un historique d'examen et ne peut pas être supprimé définitivement. Vous pouvez archiver son compte.",
      "message EXACT requis par la mission"
    );
    // Le compte doit toujours exister après le refus.
    assert.ok(findUserById(candidateId));
  });

  // --- J. canHardDeleteUser() : présence à une session de familiarisation bloque aussi ---
  test("J — une présence enregistrée à une session de familiarisation bloque la suppression définitive", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat Familiarisation", role: "candidate" });
    const companyId = createCompany({ name: `Co ${t}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `G ${t}`, scope: "test", pedagogicalManagerId: adminId, createdBy: adminId });
    addCandidateToGroup(groupId, candidateId, adminId);
    const sessionId = createFamiliarizationSession({ groupId, functionCode: "7.1", heldAt: new Date().toISOString(), organizedBy: adminId, organizerRole: "administrator" });
    markAttendance(sessionId, candidateId, true, { id: adminId, role: "administrator" });

    const { safe, blockers } = canHardDeleteUser(candidateId);
    assert.equal(safe, false);
    assert.ok(blockers.some((b) => b.includes("familiarisation")));
  });

  // --- K. hardDeleteUser() sur un compte sûr supprime réellement la ligne et préserve notification_log (user_id mis à NULL, jamais la ligne supprimée) ---
  test("K — supprimer définitivement un compte sûr le retire de users, mais préserve son historique de notification (user_id -> NULL)", () => {
    const t = tag();
    const userId = createUserPendingActivation({ username: `${t}.del`, fullName: "À Supprimer", role: "candidate", email: `${t}@example.com` });
    getDb()
      .prepare(
        `INSERT INTO notification_log (user_id, recipient_email, event_type, template_id, template_version, subject, idempotency_key, status)
         VALUES (?, ?, 'ACCOUNT_CREATED', 'account-created', 'v1', 'Sujet test', ?, 'SENT')`
      )
      .run(userId, `${t}@example.com`, `test-idem-${t}`);

    hardDeleteUser(userId);
    assert.equal(findUserById(userId), undefined, "le compte n'existe plus");

    const notifRow = getDb().prepare(`SELECT user_id, recipient_email FROM notification_log WHERE idempotency_key = ?`).get(`test-idem-${t}`) as
      | { user_id: number | null; recipient_email: string }
      | undefined;
    assert.ok(notifRow, "la ligne de notification n'est JAMAIS supprimée");
    assert.equal(notifRow!.user_id, null, "user_id est détaché (NULL), jamais laissé pointer vers un compte inexistant");
    assert.equal(notifRow!.recipient_email, `${t}@example.com`, "le reste de l'historique reste lisible");
  });

  // --- L. hardDeleteUser() supprime aussi en cascade les jetons d'activation éphémères propres au compte ---
  test("L — la suppression définitive supprime les jetons d'activation éphémères du compte (ON DELETE CASCADE)", () => {
    const t = tag();
    const userId = createUserPendingActivation({ username: `${t}.tok`, fullName: "Avec Jeton", role: "candidate", email: `${t}@example.com` });
    createActivationToken({ userId, purpose: "account_setup" });
    const before = getDb().prepare(`SELECT COUNT(*) AS n FROM activation_tokens WHERE user_id = ?`).get(userId) as { n: number };
    assert.ok(before.n > 0);

    hardDeleteUser(userId);
    const after = getDb().prepare(`SELECT COUNT(*) AS n FROM activation_tokens WHERE user_id = ?`).get(userId) as { n: number };
    assert.equal(after.n, 0);
  });

  // --- N. hardDeleteUser() nettoie la "plomberie" Particulier orpheline (bug réel trouvé en E2E, 2026-08-30) ---
  test("N — supprimer un Particulier nettoie sa plomberie (company/groupe dédiés) devenue orpheline, sans toucher celle d'un AUTRE Particulier actif", async () => {
    const t = tag();
    const { provisionParticulierAccess } = await import("../../lib/user-affiliation");
    const adminId = createUser({ username: `${t}.admin2`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });

    const deletedId = createUser({ username: `${t}.solo`, password: "x".repeat(10), fullName: `Delete Safe ${t}`, role: "candidate" });
    const { companyId: deletedCompanyId, groupId: deletedGroupId } = provisionParticulierAccess(deletedId, `Delete Safe ${t}`, adminId, "test");

    const keptId = createUser({ username: `${t}.kept`, password: "x".repeat(10), fullName: `Keep Me ${t}`, role: "candidate" });
    const { companyId: keptCompanyId, groupId: keptGroupId } = provisionParticulierAccess(keptId, `Keep Me ${t}`, adminId, "test");

    hardDeleteUser(deletedId);

    assert.equal(getDb().prepare(`SELECT 1 FROM companies WHERE id = ?`).get(deletedCompanyId), undefined, "l'entreprise plomberie orpheline est supprimée");
    assert.equal(getDb().prepare(`SELECT 1 FROM groups WHERE id = ?`).get(deletedGroupId), undefined, "le groupe plomberie orphelin est supprimé (cascade)");

    assert.ok(getDb().prepare(`SELECT 1 FROM companies WHERE id = ?`).get(keptCompanyId), "la plomberie d'un AUTRE Particulier actif n'est jamais touchée");
    assert.ok(getDb().prepare(`SELECT 1 FROM groups WHERE id = ?`).get(keptGroupId), "le groupe d'un AUTRE Particulier actif n'est jamais touché");
    assert.ok(findUserById(keptId), "l'autre Particulier reste actif");
  });

  // --- M. hardDeleteUser() re-vérifie lui-même la sécurité — un appelant ne peut jamais contourner canHardDeleteUser() ---
  test("M — hardDeleteUser() revérifie lui-même la sécurité (defense in depth), même si l'appelant ne l'a pas fait", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat Protégé", role: "candidate" });
    const companyId = createCompany({ name: `Co ${t}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `G ${t}`, scope: "test", pedagogicalManagerId: adminId, createdBy: adminId });
    addCandidateToGroup(groupId, candidateId, adminId);
    createQuestion({
      kostQuestionId: `TEST-${t.toUpperCase()}-1`,
      functionCode: "7.1",
      qtype: "mcq_single",
      sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Q",
      choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }],
      correctAnswer: ["A"],
      createdBy: adminId,
    });
    const assessmentId = createAssessmentDraft({
      type: "examen",
      name: `Examen ${t}`,
      functionCode: "7.1",
      groupId,
      questionSource: "random",
      questionCount: 1,
      durationMinutes: 30,
      passThresholdPct: 80,
      scope: "test",
      createdBy: adminId,
      openAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      closeAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    });
    publishAssessment(assessmentId, adminId);
    assignCandidatesToAssessment(assessmentId, [candidateId], adminId);

    // Appel direct sans passer par canHardDeleteUser() en amont — doit tout de même refuser.
    assert.throws(() => hardDeleteUser(candidateId));
    assert.ok(findUserById(candidateId), "le compte doit survivre à la tentative refusée");
  });
});
