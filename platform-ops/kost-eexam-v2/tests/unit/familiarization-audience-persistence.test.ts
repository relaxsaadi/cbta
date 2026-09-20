import { describe, test, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

describe("Familiarisation audience persistence", () => {
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
      username: "resp.fam.audience.persistence",
      password: "x".repeat(10),
      fullName: "Responsable Familiarisation Persistence",
      role: "pedagogical_manager",
    });
    const candidateId = createUser({
      username: "cand.fam.audience.persistence",
      password: "x".repeat(10),
      fullName: "Candidat Familiarisation Persistence",
      role: "candidate",
    });
    const companyId = createCompany({ name: "Company Familiarisation Persistence", scope: "test", createdBy: managerId });
    const groupId = createGroup({
      companyId,
      name: "Groupe Familiarisation Persistence",
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
      heldAt: "2026-09-20T03:00:00.000Z",
      audience: "personnel",
    });
    const candidatesId = createFamiliarizationSession({
      ...common,
      heldAt: "2026-09-20T03:05:00.000Z",
      audience: "candidats",
    });
    const mixedId = createFamiliarizationSession({
      ...common,
      heldAt: "2026-09-20T03:10:00.000Z",
      audience: "mixte",
    });
    const legacyId = createFamiliarizationSession({
      ...common,
      heldAt: "2026-09-20T03:15:00.000Z",
    });

    assert.deepEqual(listAttendance(personnelId), [], "personnel-only must create no candidate attendance rows");
    assert.equal(listAttendance(candidatesId).length, 1, "candidate audience keeps candidate attendance");
    assert.equal(listAttendance(mixedId).length, 1, "mixed audience keeps candidate attendance");
    assert.equal(listAttendance(legacyId).length, 1, "legacy NULL audience keeps historical candidate-facing behavior");

    const historyIds = getCandidateFamiliarizationHistory(candidateId).map((row) => row.session_id);
    assert.ok(!historyIds.includes(personnelId), "personnel-only session must not pollute candidate history");
    assert.ok(historyIds.includes(candidatesId), "candidate-facing session remains in candidate history");
    assert.ok(historyIds.includes(mixedId), "mixed session remains in candidate history");
    assert.ok(historyIds.includes(legacyId), "legacy NULL-audience session remains in candidate history");
  });
});
