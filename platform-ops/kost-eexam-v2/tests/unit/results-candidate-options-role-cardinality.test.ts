import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

describe("Results candidate options — current candidate role cardinality (#78/#245)", () => {
  test("includes only unambiguous candidate-only identities while preserving poisoned historical group rows", async () => {
    const { createUser } = await import("../../lib/users");
    const { createCompany } = await import("../../lib/companies");
    const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
    const { listCandidateOptions } = await import("../../lib/results");
    const { getDb } = await import("../../lib/db");

    const managerId = createUser({
      username: "results-options-manager",
      password: "x".repeat(10),
      fullName: "Results Options Manager",
      role: "pedagogical_manager",
    });
    const candidateId = createUser({
      username: "results-options-candidate",
      password: "x".repeat(10),
      fullName: "Valid Candidate",
      role: "candidate",
    });
    const staffId = createUser({
      username: "results-options-staff",
      password: "x".repeat(10),
      fullName: "Historical Staff",
      role: "auditor",
    });
    const rolelessId = createUser({
      username: "results-options-roleless",
      password: "x".repeat(10),
      fullName: "Historical Roleless",
      role: "candidate",
    });
    const ambiguousId = createUser({
      username: "results-options-ambiguous",
      password: "x".repeat(10),
      fullName: "Historical Ambiguous",
      role: "candidate",
    });

    const companyId = createCompany({ name: "Results candidate options company", scope: "test", createdBy: managerId });
    const groupId = createGroup({
      companyId,
      name: "Results candidate options group",
      scope: "test",
      pedagogicalManagerId: managerId,
      createdBy: managerId,
    });

    addCandidateToGroup(groupId, candidateId, managerId);

    const db = getDb();
    db.prepare(`DELETE FROM user_roles WHERE user_id = ?`).run(rolelessId);
    const adminRole = db.prepare(`SELECT id FROM roles WHERE code = 'administrator'`).get() as { id: number } | undefined;
    assert.ok(adminRole);
    db.prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(ambiguousId, adminRole.id);

    // Preserve historical corruption as evidence. Current operational reads
    // must fail closed instead of reinterpreting these rows as candidates.
    const historicalIds = [staffId, rolelessId, ambiguousId];
    for (const userId of historicalIds) {
      db.prepare(`INSERT INTO group_members (group_id, candidate_user_id, added_by) VALUES (?, ?, ?)`).run(groupId, userId, managerId);
    }

    assert.deepEqual(
      listCandidateOptions([groupId]).map((row) => row.id),
      [candidateId],
      "the Results candidate selector must exclude staff-only, roleless, and candidate+staff identities"
    );

    const historicalCount = db
      .prepare(`SELECT COUNT(*) AS count FROM group_members WHERE group_id = ? AND candidate_user_id IN (?, ?, ?)`) 
      .get(groupId, staffId, rolelessId, ambiguousId) as { count: number };
    assert.equal(historicalCount.count, 3, "the read guard must not delete or rewrite historical membership evidence");
  });
});
