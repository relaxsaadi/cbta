import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { toCsv } from "../../lib/csv";

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
