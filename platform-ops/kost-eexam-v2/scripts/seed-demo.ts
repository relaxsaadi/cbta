// Jeu de données DEMO clairement séparé (§30 de la mission) — chaque objet
// porte scope='demo', jamais mélangé aux KPI de production. Ne contient
// aucun contenu réglementaire réel : les questions de démo sont marquées
// NOT_ATTEMPTED par défaut sauf une poignée explicitement FROZEN_SOURCE_VERIFIED
// pour pouvoir démontrer la chaîne complète (§37) — texte clairement fictif,
// jamais présenté comme un contenu DGR vérifié.
import { getDb, closeDb } from "../lib/db";
import { createUser, findUserByUsername } from "../lib/users";
import { createCompany } from "../lib/companies";
import { createGroup, addCandidateToGroup } from "../lib/groups";
import { createQuestion, listQuestionsByFunction } from "../lib/questions";
import { createAssessmentDraft, publishAssessment } from "../lib/assessments";

function ensureUser(username: string, fullName: string, role: "administrator" | "pedagogical_manager" | "auditor" | "candidate", password: string): number {
  const existing = findUserByUsername(username);
  if (existing) return existing.id;
  return createUser({ username, password, fullName, role });
}

function main() {
  getDb(); // s'assure que le schéma existe (migrate doit avoir tourné avant)

  const adminId = ensureUser("admin", "Admin KOST (démo)", "administrator", "ChangeMoi123!");
  const managerId = ensureUser("responsable.demo", "Nadia Responsable (démo)", "pedagogical_manager", "ChangeMoi123!");
  ensureUser("auditeur.demo", "Auditeur ANAC (démo)", "auditor", "ChangeMoi123!");

  const candidateIds = [
    ensureUser("candidat1.demo", "Karim Belaid (démo)", "candidate", "ChangeMoi123!"),
    ensureUser("candidat2.demo", "Sonia Amrani (démo)", "candidate", "ChangeMoi123!"),
    ensureUser("candidat3.demo", "Yacine Haddad (démo)", "candidate", "ChangeMoi123!"),
  ];

  const companyId = createCompany({ name: "Air Algérie — DEMO", scope: "demo", createdBy: adminId });
  const groupId = createGroup({
    companyId,
    name: "Air Algérie — DGR Septembre 2026 (DEMO)",
    scope: "demo",
    sessionLabel: "Session démo",
    pedagogicalManagerId: managerId,
    createdBy: managerId,
  });
  for (const cid of candidateIds) addCandidateToGroup(groupId, cid, managerId);

  // Banque de démo — Fonction 7.1 uniquement, contenu explicitement fictif.
  const existing = listQuestionsByFunction("7.1");
  if (existing.length === 0) {
    const demoQuestions = [
      {
        stem: "[DÉMO] Quelle est la première étape avant d'accepter un colis de marchandises dangereuses ?",
        choices: [
          { key: "A", text: "Vérifier la documentation et la classification" },
          { key: "B", text: "Peser le colis" },
          { key: "C", text: "Le charger directement" },
          { key: "D", text: "Contacter le client" },
        ],
        correct: ["A"],
      },
      {
        stem: "[DÉMO] Un colis endommagé contenant des marchandises dangereuses doit être :",
        choices: [
          { key: "A", text: "Accepté sans vérification" },
          { key: "B", text: "Isolé et signalé immédiatement" },
          { key: "C", text: "Réemballé par n'importe qui" },
          { key: "D", text: "Ignoré s'il semble mineur" },
        ],
        correct: ["B"],
      },
      {
        stem: "[DÉMO] Le rôle principal de la Fonction 7.1 concerne :",
        choices: [
          { key: "A", text: "La maintenance des aéronefs" },
          { key: "B", text: "L'acceptation des marchandises dangereuses" },
          { key: "C", text: "La restauration à bord" },
          { key: "D", text: "La billetterie" },
        ],
        correct: ["B"],
      },
    ];
    demoQuestions.forEach((q, i) => {
      createQuestion({
        kostQuestionId: `DEMO-7.1-${String(i + 1).padStart(3, "0")}`,
        functionCode: "7.1",
        qtype: "mcq_single",
        sourceStatus: "FROZEN_SOURCE_VERIFIED",
        stem: q.stem,
        choices: q.choices,
        correctAnswer: q.correct,
        regulatoryReference: "[DÉMO — contenu fictif, non réglementaire]",
        createdBy: adminId,
      });
    });
    console.log("3 questions de démo créées pour la Fonction 7.1.");
  }

  // Une évaluation TEST publiée, prête à être passée par les 3 candidats démo.
  const admissible = listQuestionsByFunction("7.1").length;
  const assessmentId = createAssessmentDraft({
    type: "test",
    name: "DGR Fonction 7.1 — Test démo",
    functionCode: "7.1",
    groupId,
    questionSource: "random",
    questionCount: Math.min(3, admissible),
    durationMinutes: 15,
    passThresholdPct: 80,
    scope: "demo",
    createdBy: managerId,
  });
  publishAssessment(assessmentId, managerId);
  console.log(`Évaluation démo publiée (id=${assessmentId}) avec ${candidateIds.length} candidat(s) affecté(s).`);

  console.log("\nComptes démo (mot de passe : ChangeMoi123!) :");
  console.log("  admin (administrateur)");
  console.log("  responsable.demo (responsable pédagogique)");
  console.log("  auditeur.demo (auditeur)");
  console.log("  candidat1.demo / candidat2.demo / candidat3.demo (candidats)");

  closeDb();
}

main();
