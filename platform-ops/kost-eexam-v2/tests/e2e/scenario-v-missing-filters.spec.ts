import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

// Scénario V — mission "COMPLETE MISSING FILTERS + NORMALIZE QUESTION
// COUNTS" (2026-08-30). Couvre les 6 pages qui n'avaient AUCUN filtre
// avant cette mission : /question-bank, /groups, /audit-logs, /incidents,
// /sessions, /familiarisation. Même discipline DB_PATH que scenario-q/r/
// s/t/u (voir leur commentaire d'en-tête) — chaque test vérifie un JEU DE
// LIGNES précis (présence ET absence), jamais seulement qu'un contrôle
// existe.
process.env.DB_PATH = "./data/e2e-test.db";

function uniqueTag() {
  return `v${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

async function importLib() {
  const { createUser, findUserByUsername } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
  const { declareIncident } = await import("../../lib/incidents");
  const { createFamiliarizationSession } = await import("../../lib/familiarization");
  const { audit } = await import("../../lib/audit");
  return {
    createUser, findUserByUsername, createCompany, createGroup, addCandidateToGroup,
    createQuestion, createAssessmentDraft, publishAssessment, declareIncident,
    createFamiliarizationSession, audit,
  };
}

test.describe.configure({ mode: "serial" });

test("QUESTION BANK (/question-bank) — Compteurs, Classification Réglementaire/DEMO, Fonction, combiné, réinitialisation", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;

  const qReg = lib.createQuestion({
    kostQuestionId: `Q-${t.toUpperCase()}-REG`, functionCode: "7.7", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
    stem: `Question filtre réglementaire ${t}`, choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: admin.id,
  });
  void qReg;
  lib.createQuestion({
    kostQuestionId: `DEMO-${t.toUpperCase()}-01`, functionCode: "7.7", qtype: "numeric", sourceStatus: "DRAFT",
    stem: `Question filtre demo ${t}`, choices: [], correctAnswer: { mode: "numeric", value: 1, tolerance: 0 }, createdBy: admin.id,
  });

  await loginAs(page, "admin");

  // Les compteurs globaux distinguent réglementaire/DEMO/total (jamais un
  // total brut présenté comme "réglementaire").
  await page.goto("/question-bank");
  await expect(page.getByText("Questions réglementaires confirmées")).toBeVisible();
  await expect(page.getByText("Questions DEMO / brouillon")).toBeVisible();

  await page.goto(`/question-bank?filterFunctionCode=7.7&filterClassification=regulatory`);
  await expect(page.getByText(`Question filtre réglementaire ${t}`)).toBeVisible();
  await expect(page.getByText(`Question filtre demo ${t}`)).toHaveCount(0);

  await page.goto(`/question-bank?filterFunctionCode=7.7&filterClassification=demo`);
  await expect(page.getByText(`Question filtre demo ${t}`)).toBeVisible();
  await expect(page.getByText(`Question filtre réglementaire ${t}`)).toHaveCount(0);

  // Combiné avec une fonction qui n'a rien à voir → 0 résultat, preuve
  // d'un vrai ET.
  await page.goto(`/question-bank?filterFunctionCode=7.8&filterClassification=demo`);
  await expect(page.getByText(`Question filtre demo ${t}`)).toHaveCount(0);

  // Recherche.
  await page.goto(`/question-bank?q=${encodeURIComponent(`filtre réglementaire ${t}`)}`);
  await expect(page.getByText(`Question filtre réglementaire ${t}`)).toBeVisible();
  await expect(page.getByText(`Question filtre demo ${t}`)).toHaveCount(0);

  // Réinitialisation.
  await page.goto(`/question-bank?filterFunctionCode=7.7&filterClassification=demo`);
  await page.getByRole("link", { name: /réinitialiser les filtres/i }).click();
  await expect(page).toHaveURL(/\/question-bank$/);
  await expect(page.getByText(`Question filtre réglementaire ${t}`)).toBeVisible();
  await expect(page.getByText(`Question filtre demo ${t}`)).toBeVisible();
});

test("GROUPS (/groups) — Client, Type client, recherche, combiné, réinitialisation ; ?companyId= reste réservé au pré-remplissage du formulaire", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;

  const companyEnt = lib.createCompany({ name: `Filtre Grp Ent ${t}`, scope: "test", createdBy: admin.id, clientType: "entreprise" });
  const companyPart = lib.createCompany({ name: `Filtre Grp Part ${t}`, scope: "test", createdBy: admin.id, clientType: "particulier" });
  lib.createGroup({ companyId: companyEnt, name: `Groupe Ent ${t}`, scope: "test", pedagogicalManagerId: admin.id, createdBy: admin.id });
  lib.createGroup({ companyId: companyPart, name: `Groupe Part ${t}`, scope: "test", pedagogicalManagerId: admin.id, createdBy: admin.id });

  await loginAs(page, "admin");

  await page.goto(`/groups?filterCompanyId=${companyEnt}`);
  await expect(page.getByText(`Groupe Ent ${t}`)).toBeVisible();
  await expect(page.getByText(`Groupe Part ${t}`)).toHaveCount(0);

  await page.goto(`/groups?filterClientType=particulier&q=${encodeURIComponent(t)}`);
  await expect(page.getByText(`Groupe Part ${t}`)).toBeVisible();
  await expect(page.getByText(`Groupe Ent ${t}`)).toHaveCount(0);

  // ?companyId= (sans préfixe filter) reste le paramètre de PRÉ-REMPLISSAGE
  // du formulaire de création, jamais un filtre de liste — les deux
  // groupes doivent rester visibles.
  await page.goto(`/groups?companyId=${companyEnt}`);
  await expect(page.getByText(`Groupe Ent ${t}`)).toBeVisible();
  await expect(page.getByText(`Groupe Part ${t}`)).toBeVisible();

  await page.goto(`/groups?filterClientType=entreprise`);
  await page.getByRole("link", { name: /réinitialiser les filtres/i }).click();
  await expect(page).toHaveURL(/\/groups$/);
});

test("AUDIT LOG (/audit-logs) — Action, Rôle, recherche, combiné, réinitialisation, jamais un événement inventé", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;
  const uniqueAction = `mission_v_test_action_${t}`;

  lib.audit({ actorUserId: admin.id, actorRole: "administrator", action: uniqueAction, targetType: "user", targetId: admin.id });

  await loginAs(page, "admin");

  // Le select Action ne liste que des valeurs réellement observées.
  await page.goto("/audit-logs");
  const actionOptions = await page.locator("#action option").allTextContents();
  expect(actionOptions).toContain(uniqueAction);

  await page.goto(`/audit-logs?action=${encodeURIComponent(uniqueAction)}`);
  await expect(page.getByRole("cell", { name: uniqueAction, exact: true })).toBeVisible();

  await page.goto(`/audit-logs?action=${encodeURIComponent(uniqueAction)}&actorRole=candidate`);
  await expect(page.getByRole("cell", { name: uniqueAction, exact: true })).toHaveCount(0);

  await page.goto(`/audit-logs?q=${encodeURIComponent(uniqueAction)}`);
  await expect(page.getByRole("cell", { name: uniqueAction, exact: true })).toBeVisible();

  await page.goto(`/audit-logs?action=${encodeURIComponent(uniqueAction)}`);
  await page.getByRole("link", { name: /réinitialiser les filtres/i }).click();
  await expect(page).toHaveURL(/\/audit-logs$/);
});

test("INCIDENTS (/incidents) — Sévérité, Statut, Client, recherche, combiné, réinitialisation", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;
  const company = lib.createCompany({ name: `Incident Filtre Co ${t}`, scope: "test", createdBy: admin.id });
  const group = lib.createGroup({ companyId: company, name: `Incident Filtre Grp ${t}`, scope: "test", pedagogicalManagerId: admin.id, createdBy: admin.id });

  lib.declareIncident({
    type: `Type critique ${t}`, severity: "critical", description: `Description incident filtre ${t}`,
    groupId: group, createdBy: admin.id, createdByRole: "administrator",
  });

  await loginAs(page, "admin");

  await page.goto(`/incidents?filterSeverity=critical&q=${encodeURIComponent(t)}`);
  await expect(page.getByText(`Type critique ${t}`)).toBeVisible();

  await page.goto(`/incidents?filterSeverity=low&q=${encodeURIComponent(t)}`);
  await expect(page.getByText(`Type critique ${t}`)).toHaveCount(0);

  await page.goto(`/incidents?filterCompanyId=${company}`);
  await expect(page.getByText(`Type critique ${t}`)).toBeVisible();

  await page.goto(`/incidents?filterSeverity=critical`);
  await page.getByRole("link", { name: /réinitialiser les filtres/i }).click();
  await expect(page).toHaveURL(/\/incidents$/);
});

test("SESSIONS (/sessions) — Rôle, recherche, réinitialisation", async ({ page }) => {
  await loginAs(page, "admin");

  await page.goto("/sessions?role=administrator");
  await expect(page.getByRole("heading", { name: /session\(s\) active\(s\)/ })).toBeVisible();

  // Un rôle sans aucune session active correspondante → 0 ligne, pas un
  // filtre décoratif qui montre toujours tout.
  await page.goto("/sessions?role=candidate&q=Administrateur");
  await expect(page.getByText("Aucune session active", { exact: true })).toBeVisible();

  await page.goto("/sessions?role=administrator");
  await page.getByRole("link", { name: /réinitialiser les filtres/i }).click();
  await expect(page).toHaveURL(/\/sessions$/);
});

test("FAMILIARISATION (/familiarisation) — Client, Fonction DGR, combiné, réinitialisation", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;
  const company = lib.createCompany({ name: `Familiar Filtre Co ${t}`, scope: "test", createdBy: admin.id });
  const group = lib.createGroup({ companyId: company, name: `Familiar Filtre Grp ${t}`, scope: "test", pedagogicalManagerId: admin.id, createdBy: admin.id });

  lib.createFamiliarizationSession({
    groupId: group, functionCode: "7.9", heldAt: "2026-05-15T10:00:00.000Z",
    organizedBy: admin.id, organizerRole: "administrator",
  });

  await loginAs(page, "admin");

  // Le select "Groupe" du formulaire de création liste aussi ce groupe
  // (texte "Client — Groupe", sans le suffixe "— Fonction X") — un
  // getByText brut sur le seul nom de groupe matche donc AUSSI cette
  // <option> en plus de la ligne de session (violation du mode strict).
  // getByRole('link', ...) cible uniquement le <a> de la ligne (role
  // "option" ≠ role "link", aucune ambiguïté possible) — pas besoin
  // d'exact:true, dont le nom accessible complet inclut aussi la date
  // (second <p> du même lien), non reproduite ici.
  const rowLink = page.getByRole("link", { name: `Familiar Filtre Co ${t} — Familiar Filtre Grp ${t} — Fonction 7.9` });

  await page.goto(`/familiarisation?filterCompanyId=${company}&filterFunctionCode=7.9`);
  await expect(rowLink).toBeVisible();

  await page.goto(`/familiarisation?filterCompanyId=${company}&filterFunctionCode=7.1`);
  await expect(rowLink).toHaveCount(0);

  await page.goto(`/familiarisation?filterCompanyId=${company}`);
  await page.getByRole("link", { name: /réinitialiser les filtres/i }).click();
  await expect(page).toHaveURL(/\/familiarisation$/);
});
