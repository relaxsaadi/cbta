// Correction ciblée — verification_date uniquement (jamais le stem/choix/
// réponse/explication d'une question déjà publiée). Le premier passage de
// import-dgr-from-moodle.ts utilisait une regex de date trop stricte
// (n'acceptait que "... confirmed YYYY-MM-DD)", format absent pour
// certaines fonctions — ex. Fonction 7.8 : "(Tier A), 2026-08-25." — le
// champ retombait alors sur nowIso() (date d'exécution du script, pas la
// vraie date de vérification Tier A). Corrigé dans le parseur ; ce script
// réapplique la date correcte à TOUT ce qui est déjà en base, sans
// toucher au reste.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getDb, closeDb } from "../lib/db";

function field(block: string, label: string): string | undefined {
  const re = new RegExp(`\\*\\*${label}[^:*]*:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\*\\*[A-Z][^:*]*:\\*\\*|\\n---|$)`, "i");
  const m = block.match(re);
  if (!m) return undefined;
  return m[1]!.replace(/\s+/g, " ").trim() || undefined;
}

function main() {
  const db = getDb();
  let fixed = 0;
  let unchanged = 0;
  for (const fn of ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10"]) {
    const mdPath = join(process.cwd(), ".moodle-extracts", "markdown", `DGR_PRODUCTION_BANK_${fn}.md`);
    if (!existsSync(mdPath)) continue;
    const text = readFileSync(mdPath, "utf-8");
    const headingRe = /^#{2,4}\s+(Q-7\.\d+-\d+)\b.*$/gm;
    const matches = [...text.matchAll(headingRe)];
    for (let i = 0; i < matches.length; i++) {
      const id = matches[i]![1]!;
      const start = matches[i]!.index! + matches[i]![0].length;
      const end = i + 1 < matches.length ? matches[i + 1]!.index! : text.length;
      const block = text.slice(start, end);
      const frStatusText = field(block, "FR status") ?? "";
      const verificationDate = frStatusText.match(/(\d{4}-\d{2}-\d{2})/)?.[1];
      if (!verificationDate) continue;
      const row = db.prepare(`SELECT verification_date FROM questions WHERE kost_question_id = ?`).get(id) as { verification_date: string | null } | undefined;
      if (!row) continue;
      if (row.verification_date !== verificationDate) {
        db.prepare(`UPDATE questions SET verification_date = ? WHERE kost_question_id = ?`).run(verificationDate, id);
        console.log(`${id}: ${row.verification_date} -> ${verificationDate}`);
        fixed++;
      } else {
        unchanged++;
      }
    }
  }
  console.log(`\n${fixed} date(s) corrigée(s), ${unchanged} déjà correcte(s).`);
  closeDb();
}

main();
