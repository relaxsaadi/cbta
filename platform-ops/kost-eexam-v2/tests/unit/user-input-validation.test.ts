import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { normalizeCandidateIdentity } from "../../lib/user-input-validation";

describe("candidate identity validation (#95)", () => {
  test("normalise les espaces externes et l'email sans altérer le nom Unicode", () => {
    const result = normalizeCandidateIdentity({
      fullName: "  Élodie O'Connor  ",
      username: "  elodie.oc  ",
      email: "  Elodie.OC@Example.COM  ",
    });
    assert.deepEqual(result, {
      value: {
        fullName: "Élodie O'Connor",
        username: "elodie.oc",
        email: "elodie.oc@example.com",
      },
      error: null,
    });
  });

  test("refuse une adresse sans domaine valide", () => {
    const result = normalizeCandidateIdentity({
      fullName: "Amina Benali",
      username: "amina",
      email: "amina",
    });
    assert.equal(result.error, "Adresse email invalide.");
  });

  test("refuse les champs obligatoires vides", () => {
    const result = normalizeCandidateIdentity({ fullName: " ", username: "amina", email: "amina@example.com" });
    assert.match(result.error ?? "", /obligatoires/i);
  });

  test("refuse les caractères de contrôle dans les données d'identité", () => {
    const result = normalizeCandidateIdentity({
      fullName: "Amina\nBenali",
      username: "amina",
      email: "amina@example.com",
    });
    assert.match(result.error ?? "", /contrôle/i);
  });

  test("accepte les noms arabes et un email syntaxiquement valide", () => {
    const result = normalizeCandidateIdentity({
      fullName: "محمد أمين",
      username: "amine.dz",
      email: "amine.dz@example.com",
    });
    assert.ok(result.value);
    assert.equal(result.value.fullName, "محمد أمين");
    assert.equal(result.error, null);
  });
});
