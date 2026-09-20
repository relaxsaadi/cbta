import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { CsvParseError, parseCsv, toCsv } from "../../lib/csv";

// Sécurité — voir le commentaire dans lib/csv.ts : un champ CSV commençant
// par =, +, -, @, une tabulation ou un retour chariot peut être interprété
// comme une formule par Excel/LibreOffice/Sheets à l'ouverture (OWASP "CSV
// Injection"). Plusieurs colonnes exportées (nom, société, groupe, réponse
// saisie) contiennent du texte non contrôlé par l'administrateur qui
// exporte — ce n'est pas un risque théorique.
describe("Export CSV — neutralisation de l'injection de formule", () => {
  const TRIGGERS = ["=cmd|'/c calc'!A1", "+1+1", "-2+3", "@SUM(A1:A9)", "\t=1+1"];

  for (const payload of TRIGGERS) {
    test(`un champ commençant par "${payload[0]}" est préfixé d'un guillemet simple`, () => {
      const csv = toCsv([{ name: payload }], ["name"]);
      const dataLine = csv.split("\r\n")[1]!;
      assert.ok(dataLine.startsWith("'") || dataLine.startsWith(`"'`), `attendu un préfixe neutralisant, reçu : ${dataLine}`);
      // La valeur utile reste présente après le préfixe — pas de perte de
      // données, juste une neutralisation de l'interprétation en formule.
      assert.ok(dataLine.includes(payload.replace(/^\t/, "")), "la valeur d'origine doit rester présente après neutralisation");
    });
  }

  test("un champ normal (candidat, société) n'est pas préfixé", () => {
    const csv = toCsv([{ name: "Yasmine Kaced" }], ["name"]);
    const dataLine = csv.split("\r\n")[1]!;
    assert.equal(dataLine, "Yasmine Kaced");
  });

  test("l'échappement RFC 4180 (guillemets/virgules) fonctionne toujours après neutralisation", () => {
    const csv = toCsv([{ name: '=HYPERLINK("http://evil","x")' }], ["name"]);
    const dataLine = csv.split("\r\n")[1]!;
    // Contient une virgule et des guillemets → doit être entouré de
    // guillemets avec les guillemets internes doublés, ET préfixé.
    assert.equal(dataLine, `"'=HYPERLINK(""http://evil"",""x"")"`);
  });

  test("null/undefined restent des cellules vides, pas 'null'/'undefined'", () => {
    const csv = toCsv([{ name: null, other: undefined }], ["name", "other"]);
    const dataLine = csv.split("\r\n")[1]!;
    assert.equal(dataLine, ",");
  });
});

describe("Import CSV — parsing quote-aware déterministe (#95)", () => {
  test("préserve une virgule citée dans le nom", () => {
    const rows = parseCsv('full_name,username,email\n"Benali, Amina",amina,amina@example.com\n');
    assert.deepEqual(rows[1], {
      line: 2,
      cells: ["Benali, Amina", "amina", "amina@example.com"],
    });
  });

  test("décode les guillemets doublés dans une cellule citée", () => {
    const rows = parseCsv('full_name,username,email\r\n"Nadia ""Nadi"" K.",nadia,nadia@example.com\r\n');
    assert.equal(rows[1]!.cells[0], 'Nadia "Nadi" K.');
    assert.equal(rows[1]!.line, 2);
  });

  test("accepte CRLF et LF sans créer de ligne terminale artificielle", () => {
    const lf = parseCsv("a,b\n1,2\n");
    const crlf = parseCsv("a,b\r\n1,2\r\n");
    assert.deepEqual(lf.map((row) => row.cells), [["a", "b"], ["1", "2"]]);
    assert.deepEqual(crlf.map((row) => row.cells), [["a", "b"], ["1", "2"]]);
  });

  test("préserve un retour à la ligne dans une cellule citée et suit la ligne physique suivante", () => {
    const rows = parseCsv('full_name,username,email\n"Nadia\nKaced",nadia,nadia@example.com\nAmine,amine,amine@example.com');
    assert.equal(rows[1]!.cells[0], "Nadia\nKaced");
    assert.equal(rows[1]!.line, 2);
    assert.equal(rows[2]!.line, 4);
  });

  test("refuse un guillemet non fermé avec la ligne de début de l'enregistrement", () => {
    assert.throws(
      () => parseCsv('full_name,username,email\n"Nadia,nadia,nadia@example.com'),
      (error: unknown) => error instanceof CsvParseError && error.line === 2 && /non fermé/.test(error.message)
    );
  });

  test("refuse un guillemet nu au milieu d'une cellule non citée", () => {
    assert.throws(() => parseCsv('full_name,username,email\nNa"dia,nadia,nadia@example.com'), CsvParseError);
  });

  test("refuse les caractères après la fermeture d'une cellule citée", () => {
    assert.throws(() => parseCsv('full_name,username,email\n"Nadia"x,nadia,nadia@example.com'), CsvParseError);
  });

  test("préserve les noms FR/EN et Unicode", () => {
    const rows = parseCsv("full_name,username,email\nÉlodie O'Connor,elodie,elodie@example.com\nمحمد أمين,amine,amine@example.com");
    assert.equal(rows[1]!.cells[0], "Élodie O'Connor");
    assert.equal(rows[2]!.cells[0], "محمد أمين");
  });
});
