import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { totpAt, base32Encode, verifyTotpCode, generateMfaSecret, generateRecoveryCodes, consumeRecoveryCode, buildOtpAuthUri } from "../../lib/mfa";

// Vecteurs de test OFFICIELS RFC 6238 Annexe B (SHA1, secret ASCII
// "12345678901234567890" — 20 octets). Le RFC publie des codes à 8
// chiffres ; le dernier chiffre-N tronqué (§ Truncate) est identique quel
// que soit le nombre de chiffres retenu (10^6 divise 10^8), donc les 6
// derniers chiffres du code officiel à 8 chiffres = notre code à 6
// chiffres — dérivé mathématiquement du RFC, pas inventé.
describe("TOTP — conformité RFC 6238 Annexe B (vecteurs de test officiels)", () => {
  const secretBase32 = base32Encode(Buffer.from("12345678901234567890", "ascii"));
  const vectors: [number, string][] = [
    [59, "94287082"],
    [1111111109, "07081804"],
    [1111111111, "14050471"],
    [1234567890, "89005924"],
    [2000000000, "69279037"],
  ];

  for (const [unixSeconds, official8Digit] of vectors) {
    test(`t=${unixSeconds} produit les 6 derniers chiffres du vecteur officiel ${official8Digit}`, () => {
      const expected6Digit = official8Digit.slice(-6);
      const actual = totpAt(secretBase32, unixSeconds * 1000);
      assert.equal(actual, expected6Digit);
    });
  }
});

describe("TOTP — comportement applicatif", () => {
  test("un secret fraîchement généré valide son propre code courant", () => {
    const secret = generateMfaSecret();
    const code = totpAt(secret, Date.now());
    assert.equal(verifyTotpCode(secret, code), true);
  });

  test("un code à 6 chiffres au hasard est rejeté avec une probabilité écrasante (jamais un faux positif garanti)", () => {
    const secret = generateMfaSecret();
    const realCode = totpAt(secret, Date.now());
    let wrongCode = "000000";
    while (wrongCode === realCode) wrongCode = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
    assert.equal(verifyTotpCode(secret, wrongCode), false);
  });

  test("un format invalide (pas 6 chiffres) est toujours rejeté", () => {
    const secret = generateMfaSecret();
    assert.equal(verifyTotpCode(secret, "12345"), false);
    assert.equal(verifyTotpCode(secret, "abcdef"), false);
    assert.equal(verifyTotpCode(secret, ""), false);
  });

  test("tolérance de dérive d'horloge : le code du pas précédent (-30s) reste accepté", () => {
    const secret = generateMfaSecret();
    const codeMinus30s = totpAt(secret, Date.now() - 30_000);
    assert.equal(verifyTotpCode(secret, codeMinus30s), true);
  });

  test("hors tolérance (-90s, 3 pas avant) est rejeté", () => {
    const secret = generateMfaSecret();
    const codeMinus90s = totpAt(secret, Date.now() - 90_000);
    // Probabilité infime de collision fortuite avec le pas courant/±1 —
    // vérifié explicitement pour rendre le test robuste plutôt que flaky.
    const currentAndNeighbours = [totpAt(secret, Date.now()), totpAt(secret, Date.now() - 30_000), totpAt(secret, Date.now() + 30_000)];
    if (!currentAndNeighbours.includes(codeMinus90s)) {
      assert.equal(verifyTotpCode(secret, codeMinus90s), false);
    }
  });

  test("l'URI otpauth:// contient bien le secret, l'émetteur et le compte", () => {
    const secret = generateMfaSecret();
    const uri = buildOtpAuthUri(secret, "admin.staging");
    assert.match(uri, /^otpauth:\/\/totp\//);
    assert.ok(uri.includes(secret));
    assert.ok(uri.includes("KOST"));
    assert.ok(uri.includes("admin.staging"));
  });
});

describe("Codes de secours — génération, hachage, usage unique", () => {
  test("8 codes générés, en clair distincts, jamais stockés en clair", () => {
    const { plain, hashedJson } = generateRecoveryCodes();
    assert.equal(plain.length, 8);
    assert.equal(new Set(plain).size, 8);
    const hashes = JSON.parse(hashedJson);
    assert.equal(hashes.length, 8);
    for (const h of hashes) assert.ok(!plain.includes(h)); // jamais le clair dans le stocké
  });

  test("un code valide est consommé — retiré de la liste, inutilisable une 2e fois", () => {
    const { plain, hashedJson } = generateRecoveryCodes();
    const firstCode = plain[0]!;
    const remainingAfterFirstUse = consumeRecoveryCode(hashedJson, firstCode);
    assert.ok(remainingAfterFirstUse !== null);
    assert.equal(JSON.parse(remainingAfterFirstUse!).length, 7);

    // Réutiliser le même code sur la liste DÉJÀ mise à jour échoue.
    const secondAttempt = consumeRecoveryCode(remainingAfterFirstUse!, firstCode);
    assert.equal(secondAttempt, null);
  });

  test("un code inventé est toujours rejeté", () => {
    const { hashedJson } = generateRecoveryCodes();
    assert.equal(consumeRecoveryCode(hashedJson, "ZZZZZ-99999"), null);
  });
});
