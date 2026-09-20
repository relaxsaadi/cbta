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

/**
 * Ligne CSV logique avec le numéro de la ligne physique où l'enregistrement
 * commence. Le numéro reste utile pour un champ cité multiligne : l'erreur
 * d'import peut être rattachée au début de l'enregistrement, pas à un index
 * produit par split("\n").
 */
export interface ParsedCsvRow {
  cells: string[];
  line: number;
}

export class CsvParseError extends Error {
  readonly line: number;

  constructor(message: string, line: number) {
    super(message);
    this.name = "CsvParseError";
    this.line = line;
  }
}

/**
 * Parseur CSV déterministe, délimiteur virgule, UTF-8 côté appelant.
 * Supporte RFC 4180 utile à l'import : cellules citées, virgules citées,
 * guillemets doublés, CRLF/LF et retours-ligne dans une cellule citée.
 *
 * Il est volontairement strict : un guillemet dans une cellule non citée,
 * ou un caractère après le guillemet fermant avant le séparateur/fin de
 * ligne, rend l'entrée ambiguë et est refusé plutôt que deviné.
 */
export function parseCsv(text: string): ParsedCsvRow[] {
  const rows: ParsedCsvRow[] = [];
  let cells: string[] = [];
  let field = "";
  let inQuotes = false;
  let justClosedQuote = false;
  let line = 1;
  let rowStartLine = 1;
  let i = 0;

  const finishField = () => {
    cells.push(field);
    field = "";
    justClosedQuote = false;
  };

  const finishRow = () => {
    finishField();
    rows.push({ cells, line: rowStartLine });
    cells = [];
    rowStartLine = line + 1;
  };

  while (i < text.length) {
    const ch = text[i]!;

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        justClosedQuote = true;
        i += 1;
        continue;
      }

      if (ch === "\r") {
        if (text[i + 1] === "\n") i += 2;
        else i += 1;
        field += "\n";
        line += 1;
        continue;
      }
      if (ch === "\n") {
        field += "\n";
        line += 1;
        i += 1;
        continue;
      }

      field += ch;
      i += 1;
      continue;
    }

    if (justClosedQuote) {
      if (ch === ",") {
        finishField();
        i += 1;
        continue;
      }
      if (ch === "\r" || ch === "\n") {
        const isCrLf = ch === "\r" && text[i + 1] === "\n";
        finishRow();
        line += 1;
        rowStartLine = line;
        i += isCrLf ? 2 : 1;
        continue;
      }
      throw new CsvParseError("Caractère inattendu après un guillemet CSV fermant.", line);
    }

    if (ch === '"') {
      if (field.length !== 0) {
        throw new CsvParseError("Guillemet CSV inattendu dans une cellule non citée.", line);
      }
      inQuotes = true;
      i += 1;
      continue;
    }

    if (ch === ",") {
      finishField();
      i += 1;
      continue;
    }

    if (ch === "\r" || ch === "\n") {
      const isCrLf = ch === "\r" && text[i + 1] === "\n";
      finishRow();
      line += 1;
      rowStartLine = line;
      i += isCrLf ? 2 : 1;
      continue;
    }

    field += ch;
    i += 1;
  }

  if (inQuotes) {
    throw new CsvParseError("Guillemet CSV non fermé.", rowStartLine);
  }

  // Pas de ligne vide artificielle après un séparateur de ligne terminal.
  if (field.length > 0 || cells.length > 0 || justClosedQuote) {
    finishRow();
  }

  return rows;
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
