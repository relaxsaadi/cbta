// Deuxième client de démonstration STAGING — §"CROSS-COMPANY / CROSS-TENANT
// ISOLATION" de la revue pré-auditeur. Nécessaire pour PROUVER (pas
// seulement affirmer) la frontière multi-client de lib/tenant-scope.ts :
// sans un second client géré par un second responsable, il n'existe rien à
// isoler l'un de l'autre.
//
// Règles strictes de ce script (mêmes contraintes que la mission) :
//   - AUCUNE nouvelle question DGR importée — réutilise exclusivement les 7
//     questions réelles Fonction 7.1 déjà importées par
//     import-function-7-1-real.ts (le contenu de la banque de questions
//     est un actif GLOBAL KOST, partagé entre tous les clients — seule
//     l'ASSIGNATION groupe/évaluation est spécifique à un client).
//   - Mots de passe générés aléatoirement, jamais committés, affichés UNE
//     fois sur stdout — même politique que seed-staging.ts.
//   - La tentative du candidat B est produite directement via lib/attempts.ts
//     (pas de navigateur ici) — un fixture serveur, pas une démonstration
//     de parcours UI (déjà prouvée côté Company A dans les specs 01/02).
import { randomBytes } from "node:crypto";
import { getDb, closeDb } from "../lib/db";
import { createUser, findUserByUsername } from "../lib/users";
import { createCompany } from "../lib/companies";
import { createGroup, addCandidateToGroup } from "../lib/groups";
import { createAssessmentDraft, publishAssessment, getSnapshots } from "../lib/assessments";
import { startAttempt, getAttemptQuestions, saveAnswer, submitAttempt } from "../lib/attempts";

function randomPassword(): string {
  return randomBytes(12).toString("base64url");
}

function ensureUser(
  username: string,
  fullName: string,
  role: "administrator" | "pedagogical_manager" | "auditor" | "candidate"
): { id: number; password: string | null } {
  const existing = findUserByUsername(username);
  if (existing) return { id: existing.id, password: null };
  const password = randomPassword();
  const id = createUser({ username, password, fullName, role });
  return { id, password };
}

function main() {
  getDb();

  const credentials: { username: string; role: string; password: string | null }[] = [];

  const managerB = ensureUser("responsable-b.staging", "Responsable Pédagogique B — Tassili", "pedagogical_manager");
  credentials.push({ username: "responsable-b.staging", role: "responsable_pedagogique_B", password: managerB.password });

  const candidateB = ensureUser("candidat-b.staging", "Karim Zerrouki (pilote B)", "candidate");
  credentials.push({ username: "candidat-b.staging", role: "candidat_B", password: candidateB.password });

  // createdBy = managerB volontairement (contrairement à seed-staging.ts où
  // c'était l'admin) — démontre l'AUTRE cas d'accès prévu par
  // hasCompanyAccess() : un client accessible parce que CRÉÉ par ce
  // responsable, pas seulement parce qu'il y gère un groupe. Les deux
  // chemins de la frontière sont ainsi couverts par les fixtures réelles.
  const companyBId = createCompany({ name: "Tassili Airlines — DEMO", scope: "demo", createdBy: managerB.id });
  const groupBId = createGroup({
    companyId: companyBId,
    name: "Tassili Airlines — DGR Démonstration",
    scope: "demo",
    sessionLabel: "Isolation multi-client — staging",
    pedagogicalManagerId: managerB.id,
    createdBy: managerB.id,
  });
  addCandidateToGroup(groupBId, candidateB.id, managerB.id);

  // Évaluation réelle pour Company B, sur les mêmes 7 questions réelles
  // déjà importées (aucune nouvelle question créée).
  const assessmentBId = createAssessmentDraft({
    type: "examen",
    name: "DGR Fonction 7.1 — Isolation multi-client (Company B)",
    functionCode: "7.1",
    groupId: groupBId,
    questionSource: "random",
    questionCount: 7,
    durationMinutes: 30,
    passThresholdPct: 80,
    attemptsAllowed: 1,
    shuffleQuestions: true,
    shuffleAnswers: true,
    scope: "demo",
    createdBy: managerB.id,
  });
  publishAssessment(assessmentBId, managerB.id);

  // Tentative réelle du candidat B — répond correctement à tout (source de
  // vérité : correct_answer_snapshot du snapshot figé, pas une hypothèse
  // sur l'ordre) pour produire un résultat gradé exploitable par les tests
  // d'isolation (attempt, result, réponses détaillées).
  // AttemptQuestionView n'expose pas snapshot_id (le choix d'ordre des
  // questions est mélangé, aq.position != snapshot.position dès que
  // shuffleQuestions est actif) — on retrouve la bonne réponse en
  // recoupant par le TEXTE exact du stem figé, seule clé fiable exposée
  // par les deux côtés.
  const snapshots = getSnapshots(assessmentBId);
  const attempt = startAttempt(assessmentBId, candidateB.id, {});
  const questions = getAttemptQuestions(attempt.id);
  for (const q of questions) {
    const snap = snapshots.find((s) => s.stem_snapshot === q.stem);
    if (!snap) throw new Error(`Snapshot introuvable pour le stem : ${q.stem.slice(0, 60)}`);
    const correct = JSON.parse(snap.correct_answer_snapshot) as string[];
    saveAnswer(attempt.id, candidateB.id, q.attempt_question_id, correct);
  }
  submitAttempt(attempt.id, candidateB.id, { auto: false });

  console.log(
    `\nStructure créée : Tassili Airlines — DEMO (id=${companyBId}) / Tassili Airlines — DGR Démonstration (id=${groupBId}), candidat affecté, examen publié (id=${assessmentBId}), 1 tentative réelle notée (id=${attempt.id}).`
  );
  console.log("\n=== IDENTIFIANTS TEMPORAIRES COMPANY B (hors Git — à transmettre de façon sécurisée) ===");
  for (const c of credentials) {
    if (c.password) console.log(`${c.role.padEnd(28)} ${c.username.padEnd(28)} ${c.password}`);
    else console.log(`${c.role.padEnd(28)} ${c.username.padEnd(28)} (compte déjà existant — mot de passe non régénéré)`);
  }
  console.log("===\n");

  closeDb();
}

main();
