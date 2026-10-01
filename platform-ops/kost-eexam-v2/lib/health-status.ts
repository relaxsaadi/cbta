export interface OperationalHealthEvidence {
  dbOk: boolean;
  backupStale: boolean;
  restoreTestStale: boolean;
  backupStatus: string | null | undefined;
  restoreTestStatus: string | null | undefined;
}

/**
 * Fail-closed operational health decision used by the public health endpoint.
 *
 * Freshness is not proof of success: a recent backup or restore drill whose
 * recorded status is not exactly "success" must degrade the service health
 * signal so external monitoring cannot miss a failed recovery control.
 */
export function isOperationalHealthHealthy(evidence: OperationalHealthEvidence): boolean {
  return (
    evidence.dbOk &&
    !evidence.backupStale &&
    !evidence.restoreTestStale &&
    (evidence.backupStatus ?? "failure") === "success" &&
    (evidence.restoreTestStatus ?? "failure") === "success"
  );
}
