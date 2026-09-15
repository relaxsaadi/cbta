import { closeDb } from "../lib/db";
import {
  listCandidateRelationIntegrityAnomalies,
  listRoleIntegrityAnomalies,
} from "../lib/role-integrity";

try {
  const anomalies = listRoleIntegrityAnomalies();
  const candidateRelationAnomalies = listCandidateRelationIntegrityAnomalies();
  const report = {
    // Preserve the existing top-level role-cardinality contract for operators,
    // while adding the #78 candidate-relation inventory to the same readiness run.
    check: "user_role_cardinality",
    ok: anomalies.length === 0 && candidateRelationAnomalies.length === 0,
    anomaly_count: anomalies.length,
    anomalies,
    candidate_relation_check: "candidate_relation_role_integrity",
    candidate_relation_anomaly_count: candidateRelationAnomalies.length,
    candidate_relation_anomalies: candidateRelationAnomalies,
  };

  // Intentionally machine-readable and PII-minimal: both inventories contain
  // only stable numeric ids / relation keys, anomaly categories and role codes.
  console.log(JSON.stringify(report, null, 2));

  // A readiness invocation must fail closed when contradictory persisted role
  // evidence or poisoned candidate-only relation evidence exists. The script
  // remains read-only: it does NOT mutate rows or select a surviving role.
  if (!report.ok) process.exitCode = 1;
} finally {
  closeDb();
}
