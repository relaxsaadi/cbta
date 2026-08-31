import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission "CLOSE AUDITOR REMARKS" (2026-08-31) §2-4/§20-21 — couverture de
// question_annual_reviews (revue annuelle, distincte de source_status et
// reviewer_status) et de familiarization_evidence (preuve rattachée).
// Aucune ligne n'est jamais créée automatiquement — chaque test vérifie
// explicitement l'état "rien" avant d'enregistrer quoi que ce soit.
describe("Revue annuelle des questions (lib/questions.ts §2-4 de la mission)", async () => {
  const { createUser } = await import("../../lib/users");
  const { createQuestion, recordAnnualReview, getAnnualReviewHistory, getLatestAnnualReview, listQuestions } = await import("../../lib/questions");

  let admin: number;
  before(() => {
    setupTestDb();
    admin = createUser({ username: "annual.admin", password: "x".repeat(10), fullName: "Annual Admin", role: "administrator" });
  });

  test("A — une question sans revue enregistrée n'a AUCUN historique et AUCUNE revue la plus récente (jamais une ligne fabriquée)", () => {
    const qId = createQuestion({
      kostQuestionId: "Q-ANNUAL-001",
      functionCode: "7.1",
      qtype: "true_false",
      sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Test",
      choices: [{ key: "true", text: "Vrai" }, { key: "false", text: "Faux" }],
      correctAnswer: ["true"],
      createdBy: admin,
    });
    assert.deepEqual(getAnnualReviewHistory(qId), []);
    assert.equal(getLatestAnnualReview(qId), undefined);
    const rows = listQuestions({ functionCode: "7.1" });
    const row = rows.find((r) => r.id === qId)!;
    assert.equal(row.latest_annual_review_decision, null);
  });

  test("B — enregistrer une revue crée une ligne réelle, jamais un écrasement — un second enregistrement ajoute, ne remplace pas", () => {
    const qId = createQuestion({
      kostQuestionId: "Q-ANNUAL-002",
      functionCode: "7.1",
      qtype: "true_false",
      sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Test 2",
      choices: [{ key: "true", text: "Vrai" }, { key: "false", text: "Faux" }],
      correctAnswer: ["true"],
      createdBy: admin,
    });
    recordAnnualReview({
      questionId: qId,
      reviewYear: 2025,
      applicableEdition: "IATA DGR 66e édition 2025",
      reviewerName: "Instructeur Test A",
      reviewerQualification: "Instructeur DGR habilité",
      reviewDate: "2025-03-10",
      decision: "REVUE_TERMINEE",
      createdBy: admin,
    });
    let history = getAnnualReviewHistory(qId);
    assert.equal(history.length, 1);
    assert.equal(history[0]!.review_year, 2025);

    recordAnnualReview({
      questionId: qId,
      reviewYear: 2026,
      applicableEdition: "IATA DGR 67e édition 2026 + Addendum 1",
      reviewerName: "Instructeur Test B",
      reviewDate: "2026-04-01",
      decision: "A_REVOIR",
      comment: "Nouvelle édition, à revérifier",
      createdBy: admin,
    });
    history = getAnnualReviewHistory(qId);
    assert.equal(history.length, 2); // jamais un écrasement — les deux lignes coexistent
    assert.equal(history[0]!.review_year, 2026); // la plus récente en premier
    assert.equal(history[1]!.review_year, 2025); // l'ancienne reste consultable

    const latest = getLatestAnnualReview(qId)!;
    assert.equal(latest.decision, "A_REVOIR");
    assert.equal(latest.reviewer_name, "Instructeur Test B");
  });

  test("C — le filtre annualReviewStatus='NONE' isole les questions jamais revues, distinct du filtre par décision explicite", () => {
    const reviewed = createQuestion({
      kostQuestionId: "Q-ANNUAL-003",
      functionCode: "7.2",
      qtype: "true_false",
      sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Test 3",
      choices: [{ key: "true", text: "Vrai" }, { key: "false", text: "Faux" }],
      correctAnswer: ["true"],
      createdBy: admin,
    });
    const neverReviewed = createQuestion({
      kostQuestionId: "Q-ANNUAL-004",
      functionCode: "7.2",
      qtype: "true_false",
      sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Test 4",
      choices: [{ key: "true", text: "Vrai" }, { key: "false", text: "Faux" }],
      correctAnswer: ["true"],
      createdBy: admin,
    });
    recordAnnualReview({
      questionId: reviewed,
      reviewYear: 2026,
      applicableEdition: "IATA DGR 67e édition 2026",
      reviewerName: "Instructeur Test C",
      reviewDate: "2026-01-15",
      decision: "REVUE_TERMINEE",
      createdBy: admin,
    });

    const none = listQuestions({ functionCode: "7.2", annualReviewStatus: "NONE" });
    assert.deepEqual(none.map((r) => r.id).sort(), [neverReviewed]);

    const done = listQuestions({ functionCode: "7.2", annualReviewStatus: "REVUE_TERMINEE" });
    assert.deepEqual(done.map((r) => r.id).sort(), [reviewed]);
  });
});

describe("Preuve de familiarisation (lib/familiarization.ts §20-21 de la mission)", async () => {
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup } = await import("../../lib/groups");
  const { createFamiliarizationSession, addFamiliarizationEvidence, listFamiliarizationEvidence, getFamiliarizationSession } = await import("../../lib/familiarization");

  // Pas de nouvel appel à setupTestDb() ici : getDb() est un singleton
  // MODULE-LEVEL (lib/db.ts) — un second appel dans le même fichier
  // réutiliserait la connexion déjà ouverte par le describe précédent et
  // tenterait de réinsérer rôles/fonctions déjà présents (UNIQUE
  // constraint failed) — même piège déjà documenté dans
  // tests/unit/email-webhook.test.ts.
  let admin: number;
  let groupId: number;
  before(() => {
    admin = createUser({ username: "fam.admin", password: "x".repeat(10), fullName: "Fam Admin", role: "administrator" });
    const companyId = createCompany({ name: "Fam Evidence Co", scope: "test", createdBy: admin });
    groupId = createGroup({ companyId, name: "Fam Evidence Grp", scope: "test", createdBy: admin });
  });

  test("D — une session créée avec audience/ended_at les conserve correctement, jamais une valeur par défaut inventée pour les sessions sans", () => {
    const withAudience = createFamiliarizationSession({
      groupId,
      functionCode: "7.1",
      heldAt: "2026-08-15T09:00:00.000Z",
      endedAt: "2026-08-15T10:30:00.000Z",
      audience: "mixte",
      organizedBy: admin,
      organizerRole: "administrator",
    });
    const fs1 = getFamiliarizationSession(withAudience)!;
    assert.equal(fs1.audience, "mixte");
    assert.equal(fs1.ended_at, "2026-08-15T10:30:00.000Z");

    const withoutAudience = createFamiliarizationSession({
      groupId,
      functionCode: "7.1",
      heldAt: "2026-08-16T09:00:00.000Z",
      organizedBy: admin,
      organizerRole: "administrator",
    });
    const fs2 = getFamiliarizationSession(withoutAudience)!;
    assert.equal(fs2.audience, null);
    assert.equal(fs2.ended_at, null);
  });

  test("E — aucune preuve n'existe tant qu'aucune n'est rattachée ; rattacher en crée une, en ajout seul, avec l'auteur tracé", () => {
    const sessionId = createFamiliarizationSession({
      groupId,
      functionCode: "7.1",
      heldAt: "2026-08-17T09:00:00.000Z",
      organizedBy: admin,
      organizerRole: "administrator",
    });
    assert.deepEqual(listFamiliarizationEvidence(sessionId), []);

    addFamiliarizationEvidence(sessionId, "Feuille de présence signée — classée dossier RH n°42", { id: admin, role: "administrator" });
    const evidence = listFamiliarizationEvidence(sessionId);
    assert.equal(evidence.length, 1);
    assert.equal(evidence[0]!.description, "Feuille de présence signée — classée dossier RH n°42");
    assert.equal(evidence[0]!.recorded_by_name, "Fam Admin");

    addFamiliarizationEvidence(sessionId, "Photo de la salle avant la session", { id: admin, role: "administrator" });
    assert.equal(listFamiliarizationEvidence(sessionId).length, 2); // ajout seul, jamais un remplacement
  });
});
