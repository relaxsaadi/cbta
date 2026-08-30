import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

// Mission "AUTHORIZED P1 FIX — LOGOUT REDIRECT" (2026-08-30) §5.G/§5.H —
// couverture de lib/canonical-url.ts::resolveCanonicalRedirectBase(),
// extraite du Route Handler de déconnexion (app/api/auth/logout/route.ts,
// non testable directement par node --test) pour prouver, sans dépendre
// du réseau : (G) qu'une entrée Host/X-Forwarded-Host falsifiée ne peut
// structurellement jamais influencer la destination canonique quand
// APP_BASE_URL est configuré, et (H) qu'un environnement local/test sans
// APP_BASE_URL garde un comportement de repli sûr plutôt qu'une
// exception.
describe("resolveCanonicalRedirectBase — origine de redirection jamais dérivée d'une entrée contrôlée par le client", async () => {
  const { resolveCanonicalRedirectBase } = await import("../../lib/canonical-url");
  const ORIGINAL = process.env.APP_BASE_URL;

  beforeEach(() => {
    delete process.env.APP_BASE_URL;
  });
  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.APP_BASE_URL;
    else process.env.APP_BASE_URL = ORIGINAL;
  });

  test("(H) APP_BASE_URL non configuré — repli sûr sur la valeur fournie (jamais une exception, comportement local/test)", () => {
    const result = resolveCanonicalRedirectBase("http://127.0.0.1:3101/api/auth/logout");
    assert.equal(result, "http://127.0.0.1:3101/api/auth/logout");
  });

  test("APP_BASE_URL configuré — utilisé tel quel (sans slash final), c'est le cas réel de staging/production", () => {
    process.env.APP_BASE_URL = "https://staging.kostacademy.com/";
    const result = resolveCanonicalRedirectBase("http://localhost:3000/api/auth/logout");
    assert.equal(result, "https://staging.kostacademy.com"); // getAppBaseUrl() retire le slash final
  });

  test("(G) une valeur `fallbackUrl` falsifiée (simulant request.url reconstruit depuis un Host/X-Forwarded-Host injecté) est TOTALEMENT ignorée dès qu'APP_BASE_URL est configuré", () => {
    process.env.APP_BASE_URL = "https://staging.kostacademy.com";
    const adversarialInputs = [
      "http://evil.attacker.example/api/auth/logout",
      "http://localhost:3000/api/auth/logout",
      "http://127.0.0.1:3000/api/auth/logout",
      "http://0.0.0.0:3000/api/auth/logout",
      "http://staging.kostacademy.com.evil.example/api/auth/logout",
    ];
    for (const input of adversarialInputs) {
      assert.equal(
        resolveCanonicalRedirectBase(input),
        "https://staging.kostacademy.com",
        `une entrée falsifiée (${input}) n'aurait jamais dû influencer le résultat`
      );
    }
  });

  test("le résultat, combiné à new URL('/login', ...), ne contient jamais localhost/127.0.0.1/0.0.0.0 quand APP_BASE_URL est configuré", () => {
    process.env.APP_BASE_URL = "https://staging.kostacademy.com";
    const loginUrl = new URL("/login", resolveCanonicalRedirectBase("http://localhost:3000/x")).toString();
    assert.equal(loginUrl, "https://staging.kostacademy.com/login");
    assert.doesNotMatch(loginUrl, /localhost|127\.0\.0\.1|0\.0\.0\.0/);
  });
});
