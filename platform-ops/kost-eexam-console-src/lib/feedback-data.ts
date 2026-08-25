import "server-only";
import { queryReadWrite, execReadWrite } from "@/lib/db-readwrite";
import type { FeedbackCategory, FeedbackStatus } from "@/lib/feedback-constants";

export type { FeedbackCategory, FeedbackStatus };

export interface FeedbackEntry {
  id: number;
  rating: number;
  category: FeedbackCategory;
  comment: string | null;
  relatedExam: string | null;
  reporterUsername: string;
  reporterFullName: string;
  status: FeedbackStatus;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FeedbackRow {
  id: number;
  rating: number;
  category: string;
  comment: string | null;
  related_exam: string | null;
  reporter_username: string;
  reporter_fullname: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(r: FeedbackRow): FeedbackEntry {
  return {
    id: r.id,
    rating: r.rating,
    category: r.category as FeedbackCategory,
    comment: r.comment,
    relatedExam: r.related_exam,
    reporterUsername: r.reporter_username,
    reporterFullName: r.reporter_fullname,
    status: r.status as FeedbackStatus,
    adminNote: r.admin_note,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

export async function createFeedback(input: {
  rating: number;
  category: FeedbackCategory;
  comment?: string | null;
  relatedExam?: string | null;
  reporterUsername: string;
  reporterFullName: string;
}): Promise<number> {
  const { insertId } = await execReadWrite(
    `INSERT INTO kost_console_feedback
       (rating, category, comment, related_exam, reporter_username, reporter_fullname, status)
     VALUES (?, ?, ?, ?, ?, ?, 'new')`,
    [
      input.rating,
      input.category,
      input.comment ?? null,
      input.relatedExam ?? null,
      input.reporterUsername,
      input.reporterFullName,
    ]
  );
  return insertId;
}

export async function getFeedback(): Promise<FeedbackEntry[]> {
  const rows = await queryReadWrite<FeedbackRow>(
    `SELECT * FROM kost_console_feedback ORDER BY created_at DESC`
  );
  return rows.map(mapRow);
}

export async function updateFeedbackStatus(
  feedbackId: number,
  status: FeedbackStatus,
  adminNote?: string
): Promise<void> {
  if (adminNote !== undefined) {
    await execReadWrite(
      `UPDATE kost_console_feedback SET status = ?, admin_note = ? WHERE id = ?`,
      [status, adminNote, feedbackId]
    );
  } else {
    await execReadWrite(`UPDATE kost_console_feedback SET status = ? WHERE id = ?`, [
      status,
      feedbackId,
    ]);
  }
}

export async function getFeedbackSummary() {
  const all = await getFeedback();
  return {
    total: all.length,
    new: all.filter((f) => f.status === "new").length,
    reviewed: all.filter((f) => f.status === "reviewed").length,
    actionRequired: all.filter((f) => f.status === "action_required").length,
    actioned: all.filter((f) => f.status === "actioned").length,
    closed: all.filter((f) => f.status === "closed").length,
    avgRating: all.length > 0 ? all.reduce((s, f) => s + f.rating, 0) / all.length : null,
  };
}
