import "server-only";
import { queryReadWrite, execReadWrite } from "@/lib/db-readwrite";

export interface IdentityVerification {
  id: number;
  candidateUsername: string;
  candidateFullName: string;
  examName: string;
  sessionReference: string | null;
  verifiedByUsername: string;
  verifiedByFullName: string;
  method: string;
  status: string;
  verificationTimestamp: string;
}

/**
 * Enregistrement réel et minimal de la vérification d'identité — jamais de
 * copie du document d'identité stockée (principe de minimisation des
 * données). Table append-only : aucun GRANT UPDATE/DELETE côté MySQL
 * (vérifié via SHOW GRANTS), un enregistrement de vérification ne peut donc
 * pas être modifié après coup, même par erreur applicative.
 */
export async function recordIdentityVerification(input: {
  candidateUsername: string;
  candidateFullName: string;
  examName: string;
  sessionReference?: string | null;
  verifiedByUsername: string;
  verifiedByFullName: string;
  method?: string;
}): Promise<number> {
  const { insertId } = await execReadWrite(
    `INSERT INTO kost_console_identity_verifications
       (candidate_username, candidate_fullname, exam_name, session_reference, verified_by_username, verified_by_fullname, method, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'verified')`,
    [
      input.candidateUsername,
      input.candidateFullName,
      input.examName,
      input.sessionReference ?? null,
      input.verifiedByUsername,
      input.verifiedByFullName,
      input.method ?? "official_id_supervised",
    ]
  );
  return insertId;
}

interface Row {
  id: number;
  candidate_username: string;
  candidate_fullname: string;
  exam_name: string;
  session_reference: string | null;
  verified_by_username: string;
  verified_by_fullname: string;
  method: string;
  status: string;
  verification_timestamp: string;
}

export async function getIdentityVerifications(): Promise<IdentityVerification[]> {
  const rows = await queryReadWrite<Row>(
    `SELECT * FROM kost_console_identity_verifications ORDER BY verification_timestamp DESC`
  );
  return rows.map((r) => ({
    id: r.id,
    candidateUsername: r.candidate_username,
    candidateFullName: r.candidate_fullname,
    examName: r.exam_name,
    sessionReference: r.session_reference,
    verifiedByUsername: r.verified_by_username,
    verifiedByFullName: r.verified_by_fullname,
    method: r.method,
    status: r.status,
    verificationTimestamp: new Date(r.verification_timestamp).toISOString(),
  }));
}

export async function getIdentityVerificationCount(): Promise<number> {
  const rows = await queryReadWrite<{ n: number }>(
    `SELECT COUNT(*) as n FROM kost_console_identity_verifications`
  );
  return rows[0]?.n ?? 0;
}
