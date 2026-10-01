import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { isOperationalHealthHealthy } from "../../lib/health-status";

const healthyEvidence = {
  dbOk: true,
  backupStale: false,
  restoreTestStale: false,
  backupStatus: "success",
  restoreTestStatus: "success",
} as const;

describe("Operational health fail-closed gate", () => {
  test("healthy only when DB, freshness, backup and restore evidence all pass", () => {
    assert.equal(isOperationalHealthHealthy(healthyEvidence), true);
  });

  test("a recent restore drill with failure status degrades health", () => {
    assert.equal(
      isOperationalHealthHealthy({
        ...healthyEvidence,
        restoreTestStatus: "failure",
      }),
      false,
    );
  });

  test("missing restore status fails closed", () => {
    assert.equal(
      isOperationalHealthHealthy({
        ...healthyEvidence,
        restoreTestStatus: undefined,
      }),
      false,
    );
  });

  test("backup failure, stale evidence or DB failure each degrade health", () => {
    assert.equal(
      isOperationalHealthHealthy({ ...healthyEvidence, backupStatus: "failure" }),
      false,
    );
    assert.equal(
      isOperationalHealthHealthy({ ...healthyEvidence, backupStale: true }),
      false,
    );
    assert.equal(
      isOperationalHealthHealthy({ ...healthyEvidence, restoreTestStale: true }),
      false,
    );
    assert.equal(
      isOperationalHealthHealthy({ ...healthyEvidence, dbOk: false }),
      false,
    );
  });
});
