import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = readFileSync(
  fileURLToPath(new URL("../../scripts/check-role-integrity.ts", import.meta.url)),
  "utf8"
);

describe("Role integrity readiness command wiring (#78/#245)", () => {
  test("the operator readiness command includes preserved candidate-relation anomalies", () => {
    assert.match(source, /listCandidateRelationIntegrityAnomalies/);
    assert.match(source, /candidate_relation_anomaly_count/);
    assert.match(source, /candidate_relation_anomalies/);
  });

  test("the readiness command fails closed when either inventory is non-empty", () => {
    assert.match(
      source,
      /ok:\s*anomalies\.length === 0 && candidateRelationAnomalies\.length === 0/
    );
    assert.match(source, /if \(!report\.ok\) process\.exitCode = 1/);
  });

  test("the command remains read-only", () => {
    assert.doesNotMatch(source, /DELETE\s+FROM|UPDATE\s+user_roles|UPDATE\s+group_members|UPDATE\s+assessment_assignments|UPDATE\s+familiarization_attendance/i);
  });
});
