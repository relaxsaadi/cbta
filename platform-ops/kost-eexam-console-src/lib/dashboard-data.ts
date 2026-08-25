import "server-only";
import { getExams } from "@/lib/exams-data";
import { getResults, computeResultsSummary } from "@/lib/results-data";
import { getCandidates } from "@/lib/candidates-data";
import { getQuestions } from "@/lib/question-bank-data";
import { DEFAULT_SCOPE_FILTER, type DataScope } from "@/lib/data-scope";

export interface DashboardKpis {
  activeExams: number | null;
  candidates: number | null;
  completedExams: number | null;
  passRate: number | null; // pourcentage, null si aucune tentative terminée dans le périmètre
  questionBankSize: number | null;
  scope: DataScope[];
}

// Chaque KPI est indépendant : l'échec d'un appel ne doit jamais faire
// tomber le reste du dashboard, et `null` signifie explicitement
// "donnée non disponible" (jamais une valeur inventée).
async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

/**
 * IMPORTANT — définition unique du KPI : cette fonction ne fait plus AUCUNE
 * requête SQL indépendante. Elle réutilise exactement les mêmes fonctions
 * (getExams / getResults / getCandidates / getQuestions) que les pages
 * Examens, Résultats, Rapports et Banque de questions — donc les mêmes
 * nombres partout, par construction, plutôt que par coïncidence.
 *
 * Avant ce correctif, "Active Exams" utilisait une requête WS Moodle limitée
 * à un seul cours choisi arbitrairement (`courses[0].id`, sans tri garanti)
 * — ce qui affichait 0 alors qu'un examen réel était bien ouvert dans un
 * AUTRE cours. Et "Pass Rate" agrégeait mdl_grade_grades (une note par
 * utilisateur, y compris sur des quiz d'entraînement/démo sans seuil de
 * réussite réel, donc "réussis" par défaut), alors que Rapports/Résultats
 * comptent par tentative avec la même règle de réussite partout. Les deux
 * bugs sont corrigés en supprimant la duplication de logique.
 *
 * `scope` filtre les KPI orientés pilotage (Examens actifs, Taux de
 * réussite) aux données de production par défaut — voir lib/data-scope.ts.
 * Candidats et Banque de questions restent des comptages globaux (une
 * personne ou une question n'a pas de "périmètre" au même sens qu'une
 * tentative d'examen).
 */
export async function getDashboardKpis(scope: DataScope[] = DEFAULT_SCOPE_FILTER): Promise<DashboardKpis> {
  const [exams, results, candidates, questions] = await Promise.all([
    safe(getExams),
    safe(getResults),
    safe(getCandidates),
    safe(getQuestions),
  ]);

  const scopedExams = exams?.filter((e) => scope.includes(e.scope)) ?? null;
  const scopedResults = results?.filter((r) => scope.includes(r.scope)) ?? null;
  const summary = scopedResults ? computeResultsSummary(scopedResults) : null;

  return {
    activeExams: scopedExams ? scopedExams.filter((e) => e.status === "open").length : null,
    candidates: candidates ? candidates.length : null,
    completedExams: summary ? summary.completedAttempts : null,
    passRate: summary ? (summary.passRate !== null ? Math.round(summary.passRate) : null) : null,
    questionBankSize: questions ? questions.length : null,
    scope,
  };
}
