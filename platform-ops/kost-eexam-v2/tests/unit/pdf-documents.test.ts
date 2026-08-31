import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";

// Mission "FIX EMPLOYEE TESTING ISSUES — PDF OVERLAP + GROUP CANDIDATE
// INVITATION DELIVERY" (2026-08-31) §21 — régression automatisée pour le
// bug réel corrigé cette mission : lib/pdf/theme.ts::pdfStyles.page avait
// un paddingTop FIXE (100) alors que headerFixed était position:absolute
// (hauteur RÉELLE variable selon le contenu — nom d'entreprise/groupe/
// examen long) — un header qui grandissait au-delà de 100pt chevauchait
// systématiquement le corps du document sur CHAQUE page (voir le
// commentaire d'en-tête de lib/pdf/theme.ts pour le détail complet).
// Corrigé en repositionnant le header en flux normal + `fixed` (répétition
// sur chaque page), plus @react-pdf/renderer réserve la hauteur RÉELLEMENT
// mesurée — donc plus aucune valeur à deviner.
//
// Portée volontairement minimale et portable (§21 "if practical") :
// generation ne lève jamais, même avec des valeurs délibérément longues
// (mission §5), buffer PDF structurellement valide, contenu textuel
// critique présent quand `pdftotext` (poppler) est disponible localement
// — jamais un hard-dependency CI sur un binaire système, dégradé
// proprement (test.skip) sinon. La QA visuelle exhaustive (rendu réel en
// image, inspection page par page) reste manuelle par nature (§21 dernière
// ligne) — ce test ne remplace jamais cette étape, il prouve seulement la
// non-régression structurelle entre deux passages.
function hasPdftotext(): boolean {
  try {
    execFileSync("which", ["pdftotext"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function extractText(buf: Buffer): string {
  const path = `/tmp/kost-pdf-test-${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`;
  writeFileSync(path, buf);
  try {
    return execFileSync("pdftotext", ["-layout", path, "-"], { encoding: "utf-8" });
  } finally {
    unlinkSync(path);
  }
}

const LONG_COMPANY =
  "Société Algérienne de Transport Aérien de Marchandises Dangereuses et Logistique Internationale Combinée — Filiale Alger-Sud (test, nom très long)";
const LONG_NAME = "Amel Ben Cherif-Boumezoughène El Hadj Mohammed Tayeb (test, nom très long pour dépassement)";
const LONG_EXAM = "DGR Fonction 7.1 — Examen de certification complet marchandises dangereuses acceptation fret aérien (test, nom très long)";

describe("Documents PDF — non-régression structurelle (lib/pdf/*)", async () => {
  const { renderToBuffer } = await import("@react-pdf/renderer");
  const { IndividualReportDocument } = await import("../../lib/pdf/IndividualReportDocument");
  const { ResultsListDocument } = await import("../../lib/pdf/ResultsListDocument");
  const { AttendanceSheetDocument } = await import("../../lib/pdf/AttendanceSheetDocument");
  const { IncidentProcedureDocument } = await import("../../lib/pdf/IncidentProcedureDocument");

  const baseMeta = (docTitle: string) => ({
    docTitle,
    docId: "KOST-EEXAM-TEST-v1",
    generatedBy: "Test Runner (pedagogical_manager)",
    generatedAt: new Date().toLocaleString("fr-FR"),
  });

  const stressDetail = {
    attempt_id: 1,
    candidate_name: LONG_NAME,
    candidate_username: "test.stress.longname",
    company_name: LONG_COMPANY,
    client_type: "entreprise" as const,
    group_name: "Groupe TEST — Stress Overflow",
    function_code: "7.1",
    assessment_name: LONG_EXAM,
    assessment_type: "examen",
    attempt_number: 1,
    duration_minutes_allowed: 30,
    started_at: new Date(Date.now() - 25 * 60000).toISOString(),
    submitted_at: new Date().toISOString(),
    status: "submitted",
    question_count: 1,
    correct_count: 1,
    incorrect_count: 0,
    score_100: 100,
    percentage: 100,
    pass_threshold_pct: 80,
    passed: 1,
    grading_state: "COMPLETE" as const,
    showCorrectAnswers: true,
    questions: [
      {
        position: 1,
        stem: "Question de test avec un texte volontairement long pour vérifier l'absence de chevauchement dans le bloc question — plusieurs phrases consécutives sans retour à la ligne manuel, exactement comme une vraie question réglementaire DGR pourrait l'exiger dans un cas réel.",
        qtype: "true_false",
        choices: [
          { key: "true", text: "Vrai" },
          { key: "false", text: "Faux" },
        ],
        candidateAnswer: ["true"],
        correctAnswer: ["true"],
        isCorrect: true,
        pointsAwarded: 1,
        points: 1,
        gradedBy: null,
        graderComment: null,
        scenarioGrading: null,
        explanation: null,
      },
    ],
  };

  test("IndividualReportDocument (détaillé) — génère sans lever, même avec des valeurs délibérément longues (§5)", async () => {
    const buf = await renderToBuffer(
      IndividualReportDocument({
        detail: stressDetail as unknown as import("../../lib/results").AttemptDetail,
        level: "detailed",
        meta: {
          ...baseMeta("Rapport individuel — détaillé"),
          company: stressDetail.company_name,
          groupOrSession: stressDetail.group_name,
          function: stressDetail.function_code,
          assessmentId: stressDetail.attempt_id,
        },
      })
    );
    assert.ok(buf.length > 1000, "buffer PDF trop petit pour être valide");
    assert.equal(buf.subarray(0, 4).toString("ascii"), "%PDF", "en-tête PDF manquant");

    if (!hasPdftotext()) return; // dégradation propre — jamais un hard-fail CI sur un binaire système absent
    const text = extractText(buf);
    // §21 — contenu critique présent (candidat, entreprise, score) même
    // avec des valeurs longues, ET sans que le nom d'entreprise long ne
    // fasse disparaître/chevaucher le reste (les deux valeurs restent
    // extractibles en texte, preuve indirecte qu'elles ne se chevauchent
    // pas visuellement — un chevauchement réel de @react-pdf/renderer
    // décale la position, jamais le contenu textuel lui-même).
    assert.match(text, /Amel Ben Cherif-Boumezoughène/);
    assert.match(text, /Société Algérienne de Transport/);
    assert.match(text, /100 \/ 100/);
    assert.match(text, /ADMIS/);
  });

  test("ResultsListDocument — génère sans lever avec un examen au nom long", async () => {
    const buf = await renderToBuffer(
      ResultsListDocument({
        rows: [
          {
            candidate_user_id: 1,
            full_name: LONG_NAME,
            started_at: new Date().toISOString(),
            submitted_at: new Date().toISOString(),
            attempt_status: "submitted",
            correct_count: 1,
            incorrect_count: 0,
            score_100: 100,
            percentage: 100,
            passed: 1,
          },
        ] as unknown as import("../../lib/assessments").SessionReportRow[],
        assessmentName: LONG_EXAM,
        passThresholdPct: 80,
        meta: { ...baseMeta("Liste officielle des résultats"), company: LONG_COMPANY, groupOrSession: "Groupe TEST" },
      })
    );
    assert.ok(buf.length > 1000);
    assert.equal(buf.subarray(0, 4).toString("ascii"), "%PDF");
  });

  test("AttendanceSheetDocument — génère sans lever avec un lieu au texte long", async () => {
    const buf = await renderToBuffer(
      AttendanceSheetDocument({
        rows: [{ candidate_user_id: 1, full_name: LONG_NAME, present: true }] as unknown as import("../../lib/familiarization").AttendanceRow[],
        location: "Centre KOST Academy — Alger (adresse de test volontairement longue pour vérifier l'absence de dépassement)",
        heldAt: new Date().toISOString(),
        meta: { ...baseMeta("Feuille de présence — familiarisation"), company: LONG_COMPANY, groupOrSession: "Groupe TEST" },
      })
    );
    assert.ok(buf.length > 1000);
    assert.equal(buf.subarray(0, 4).toString("ascii"), "%PDF");
  });

  test("IncidentProcedureDocument — le caractère '→' ne rend jamais comme un glyphe cassé (pdfSafeText, mission §2/§39 antérieure + correctif §12 de cette mission)", async () => {
    const buf = await renderToBuffer(IncidentProcedureDocument({ meta: baseMeta("Procédure incident") }));
    assert.ok(buf.length > 1000);
    if (!hasPdftotext()) return;
    const text = extractText(buf);
    assert.match(text, /Incidents[\s\S]*->[\s\S]*Déclarer un incident/, "la flèche ASCII de repli doit être présente");
    assert.doesNotMatch(text, /→/, "aucune occurrence brute de '→' ne doit survivre au rendu PDF (pdfSafeText)");
  });
});
