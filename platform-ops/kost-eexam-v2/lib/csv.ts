// Génération CSV — n'existait nulle part en V1 (§1.5). RFC 4180 minimal :
// échappement des guillemets/virgules/retours-ligne, jamais une simple
// concaténation par virgule (fuite de données/CSV injection sinon).
//
// Un champ commençant par =, +, -, @, une tabulation ou un retour chariot
// peut être interprété comme une FORMULE par Excel/LibreOffice/Google
// Sheets à l'ouverture du fichier exporté (OWASP "CSV Injection") — un
// risque réel ici puisque plusieurs colonnes (nom de candidat, société,
// groupe, réponse saisie) contiennent du texte non contrôlé par
// l'administrateur qui exporte. Un guillemet simple en préfixe force
// l'interprétation en texte brut dans tous les tableurs courants sans
// changer la valeur utile affichée.
const FORMULA_TRIGGER = /^[=+\-@\t\r]/;

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let s = String(value);
  if (FORMULA_TRIGGER.test(s)) s = `'${s}`;
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const header = columns.map(escapeCsvCell).join(",");
  const lines = rows.map((row) => columns.map((col) => escapeCsvCell(row[col])).join(","));
  return [header, ...lines].join("\r\n") + "\r\n";
}

export const RESULTS_CSV_COLUMNS = [
  "candidate_id",
  "candidate_name",
  "company",
  "group",
  "function",
  "exam",
  "started_at",
  "submitted_at",
  "duration",
  "question_count",
  "correct_count",
  "incorrect_count",
  "score_100",
  "percentage",
  "pass_threshold",
  "result",
  "status",
];

export const ANSWERS_CSV_COLUMNS = [
  "candidate_id",
  "candidate_name",
  "exam",
  "question_position",
  "question_stem",
  "candidate_answer",
  "correct_answer",
  "result",
  "points_awarded",
];
