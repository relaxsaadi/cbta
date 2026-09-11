import { describe, test, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";
import {
  FAMILIARIZATION_AUDIENCES,
  familiarizationAudienceIncludesCandidates,
  parseFamiliarizationAudience,
} from "../../lib/familiarization-audience";

before(() => setupTestDb());

describe("Familiarisation audience policy", () => {
  test("accepts only the shared candidates/personnel/mixed taxonomy", () => {
    assert.deepEqual(FAMILIARIZATION_AUDIENCES.map((entry) => entry.value), ["candidats", "personnel", "mixte"]);
    assert.equal(parseFamiliarizationAudience("candidats"), "candidats");
    assert.equal(parseFamiliarizationAudience("personnel"), "personnel");
    assert.equal(parseFamiliarizationAudience("mixte"), "mixte");
  });

  test("rejects forged and empty FormData values", () => {
    assert.equal(parseFamiliarizationAudience("security"), null);
    assert.equal(parseFamiliarizationAudience("external"), null);
    assert.equal(parseFamiliarizationAudience(""), null);
    assert.equal(parseFamiliarizationAudience(null), null);
  });

  test("candidate notifications are disabled for personnel-only sessions", () => {
    assert.equal(familiarizationAudienceIncludesCandidates("personnel"), false);
    assert.equal(familiarizationAudienceIncludesCandidates("candidats"), true);
    assert.equal(familiarizationAudienceIncludesCandidates("mixte"), true);
  });

  test("personnel-only sessions persist no candidate attendance/history while candidate-facing and legacy sessions do", async () => {
    const { createUser } = await import("../../lib/users");
    const { createCompany } = await import("../../lib/companies");
    const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
    const {
      createFamiliarizationSession,
      getCandidateFamiliarizationHistory,
      listAttendance,
    } = await import("../../lib/familiarization");

    const managerId = createUser({
      username: "resp.fam.audience",
      password: "x".repeat(10),
      fullName: "Responsable Familiarisation",
      role: "pedagogical_manager",
    });
    const candidateId = createUser({
      username: "cand.fam.audience",
      password: "x".repeat(10),
      fullName: "Candidat Familiarisation",
      role: "candidate",
    });
    const companyId = createCompany({ name: "Company Familiarisation", scope: "test", createdBy: managerId });
    const groupId = createGroup({
      companyId,
      name: "Groupe Familiarisation",
      scope: "test",
      pedagogicalManagerId: managerId,
      createdBy: managerId,
    });
    addCandidateToGroup(groupId, candidateId, managerId);

    const common = {
      groupId,
      functionCode: "7.1",
      organizedBy: managerId,
      organizerRole: "pedagogical_manager" as const,
    };

    const personnelId = createFamiliarizationSession({
      ...common,
      heldAt: "2026-09-01T08:00:00.000Z",
      audience: "personnel",
    });
    const candidateIdSession = createFamiliarizationSession({
      ...common,
      heldAt: "2026-09-01T09:00:00.000Z",
      audience: "candidats",
    });
    const mixedId = createFamiliarizationSession({
      ...common,
      heldAt: "2026-09-01T10:00:00.000Z",
      audience: "mixte",
    });
    const legacyId = createFamiliarizationSession({
      ...common,
      heldAt: "2026-09-01T11:00:00.000Z",
    });

    assert.deepEqual(listAttendance(personnelId), [], "personnel-only must create no candidate attendance rows");
    assert.equal(listAttendance(candidateIdSession).length, 1, "candidates audience keeps candidate attendance");
    assert.equal(listAttendance(mixedId).length, 1, "mixed audience keeps candidate attendance");
    assert.equal(listAttendance(legacyId).length, 1, "legacy NULL audience keeps historical candidate-facing behavior");

    const historyIds = getCandidateFamiliarizationHistory(candidateId).map((row) => row.session_id);
    assert.ok(!historyIds.includes(personnelId), "personnel-only session must not pollute candidate history");
    assert.ok(historyIds.includes(candidateIdSession), "candidate-facing session remains in candidate history");
    assert.ok(historyIds.includes(mixedId), "mixed session remains in candidate history");
    assert.ok(historyIds.includes(legacyId), "legacy NULL-audience session remains in candidate history");
  });
});
