import { closeDb } from "../lib/db";
import { listRoleIntegrityAnomalies } from "../lib/role-integrity";

try {
  const anomalies = listRoleIntegrityAnomalies();
  const report = {
    check: "user_role_cardinality",
    ok: anomalies.length === 0,
    anomaly_count: anomalies.length,
    anomalies,
  };

  // Intentionally machine-readable and PII-minimal: the inventory contains
  // only stable numeric ids, anomaly category/count and role codes.
  console.log(JSON.stringify(report, null, 2));

  // A readiness invocation must fail closed when contradictory persisted role
  // evidence exists. The script does NOT mutate or select a surviving role.
  if (anomalies.length > 0) process.exitCode = 1;
} finally {
  closeDb();
}
