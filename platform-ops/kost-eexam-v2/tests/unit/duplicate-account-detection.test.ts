import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission "FIX NESRINE/FETHI STAGING DELIVERY + PREVENT DUPLICATE
// CANDIDATE CREATION" (2026-08-30) §8-10 — couverture de lib/duplicate-
// check.ts, la source UNIQUE réutilisée par createUserAction/
// editUserAction/addCandidateAction/bulkImportCandidatesAction (jamais
// une logique dupliquée dans chaque appelant). Incident réel ayant motivé
// cette mission : deux comptes "Nesrine" en staging, identifiant ET email
// LÉGÈREMENT différents chacun (jamais une collision exacte, même
// insensible à la casse) — cette suite prouve précisément ce que la
// fonction détecte (normalisation casse/espaces) et ce qu'elle ne
// prétend PAS détecter (fautes de frappe, hors-scope).
describe("Détection de doublon candidat (lib/duplicate-check.ts §8-10)", async () => {
  before(() => setupTestDb());

  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup } = await import("../../lib/groups");
  const { findDuplicateAccount, CROSS_TENANT_DUPLICATE_MESSAGE } = await import("../../lib/duplicate-check");

  let counter = 0;
  function tag() {
    counter += 1;
    return `dup${counter}`;
  }

  // --- A. même identifiant normalisé (casse/espaces différents) → doublon détecté ---
  test("A — un identifiant identique après normalisation (casse/espaces) est détecté comme doublon, jamais une accidentelle collision silencieuse", () => {
    const t = tag();
    const admin = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    createUser({ username: `${t}.original`, password: "x".repeat(10), fullName: "Original", role: "candidate" });

    const exact = findDuplicateAccount({ userId: admin, role: "administrator" }, `${t}.original`, undefined);
    assert.ok(exact, "correspondance exacte détectée");

    const differentCase = findDuplicateAccount({ userId: admin, role: "administrator" }, `  ${t.toUpperCase()}.ORIGINAL  `, undefined);
    assert.ok(differentCase, "même identifiant avec casse/espaces de bord différents détecté comme doublon");
    assert.equal(differentCase!.userId, exact!.userId);
  });

  // --- B. même email normalisé → doublon détecté, même si l'identifiant diffère ---
  test("B — un email identique après normalisation, avec un identifiant totalement différent, est détecté comme doublon", () => {
    const t = tag();
    const admin = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    createUser({ username: `${t}.userA`, password: "x".repeat(10), fullName: "User A", role: "candidate", email: `${t}.shared@example.test` });

    const found = findDuplicateAccount({ userId: admin, role: "administrator" }, `${t}.completelyDifferentUsername`, `  ${t.toUpperCase()}.SHARED@EXAMPLE.TEST  `);
    assert.ok(found, "email identique (casse/espaces différents) détecté malgré un identifiant totalement différent");
  });

  // --- Jamais un faux positif sur un email/identifiant réellement distinct (même proche) ---
  test("aucun faux positif — un identifiant/email réellement différent (même proche, ex. faute de frappe) n'est jamais signalé comme doublon", () => {
    const t = tag();
    const admin = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    createUser({ username: `${t}.nerine`, password: "x".repeat(10), fullName: "Nerine", role: "candidate", email: `${t}.nesrine1@example.test` });

    // Même incident réel que celui ayant motivé cette mission : un second
    // identifiant ET un second email chacun légèrement différents (faute
    // de frappe) — cette fonction NE prétend PAS les rapprocher (hors
    // scope, risquerait des faux positifs bloquants), et ne doit donc
    // jamais les traiter comme un doublon.
    const found = findDuplicateAccount({ userId: admin, role: "administrator" }, `${t}.nesrine`, `${t}.nesrine2@example.test`);
    assert.equal(found, null);
  });

  // --- excludeUserId — édition du même compte sans changer son propre email ne s'auto-bloque jamais ---
  test("excludeUserId — modifier le profil d'un compte SANS changer son propre email ne le signale jamais comme son propre doublon", () => {
    const t = tag();
    const admin = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const userId = createUser({ username: `${t}.self`, password: "x".repeat(10), fullName: "Self", role: "candidate", email: `${t}.self@example.test` });

    const found = findDuplicateAccount({ userId: admin, role: "administrator" }, undefined, `${t}.self@example.test`, userId);
    assert.equal(found, null, "le compte ne peut jamais être détecté comme doublon de lui-même");
  });

  const { addCandidateToGroup } = await import("../../lib/groups");

  // --- D. conflit cross-tenant : visible=false pour un responsable hors périmètre, jamais aucun détail exploitable ---
  test("D — un responsable pédagogique HORS périmètre du compte en conflit reçoit visible=false, jamais de détail exploitable", () => {
    const t = tag();
    const admin = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const managerA = createUser({ username: `${t}.mgrA`, password: "x".repeat(10), fullName: "Manager A", role: "pedagogical_manager" });
    const managerB = createUser({ username: `${t}.mgrB`, password: "x".repeat(10), fullName: "Manager B", role: "pedagogical_manager" });

    const companyA = createCompany({ name: `Co A ${t}`, scope: "test", createdBy: admin });
    const groupA = createGroup({ companyId: companyA, name: `Grp A ${t}`, scope: "test", pedagogicalManagerId: managerA, createdBy: admin });
    const candidateA = createUser({ username: `${t}.candA`, password: "x".repeat(10), fullName: "Candidat A", role: "candidate", email: `${t}.canda@example.test` });
    addCandidateToGroup(groupA, candidateA, admin);

    // Manager B (aucun groupe géré en commun avec Manager A) ne doit
    // jamais voir ce compte comme "visible".
    const foundByB = findDuplicateAccount({ userId: managerB, role: "pedagogical_manager" }, `${t}.candA`, undefined);
    assert.ok(foundByB, "le doublon est détecté (existe réellement)");
    assert.equal(foundByB!.visible, false, "jamais visible pour un responsable hors périmètre — §9");

    // Manager A (gère groupA, donc ce candidat) le voit correctement.
    const foundByA = findDuplicateAccount({ userId: managerA, role: "pedagogical_manager" }, `${t}.candA`, undefined);
    assert.ok(foundByA);
    assert.equal(foundByA!.visible, true, "visible pour le responsable qui gère réellement ce candidat");

    // Administrateur : toujours visible, aucune restriction (même
    // convention que hasUserAccess() partout ailleurs).
    const foundByAdmin = findDuplicateAccount({ userId: admin, role: "administrator" }, `${t}.candA`, undefined);
    assert.ok(foundByAdmin);
    assert.equal(foundByAdmin!.visible, true);

    assert.ok(CROSS_TENANT_DUPLICATE_MESSAGE.length > 0);
  });

  // --- Aucun champ requis : ni identifiant ni email fournis → jamais de recherche, jamais de faux positif ---
  test("aucun identifiant ni email fourni → retourne null, jamais une recherche vide dangereuse", () => {
    const t = tag();
    const admin = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const found = findDuplicateAccount({ userId: admin, role: "administrator" }, undefined, undefined);
    assert.equal(found, null);
  });
});
