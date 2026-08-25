"use server";

import { getSession } from "@/lib/session";
import { createFeedback, updateFeedbackStatus, type FeedbackCategory, type FeedbackStatus } from "@/lib/feedback-data";
import { revalidatePath } from "next/cache";

export interface FeedbackFormResult {
  error?: string;
  success?: boolean;
}

export async function submitFeedbackAction(
  _prev: FeedbackFormResult,
  formData: FormData
): Promise<FeedbackFormResult> {
  const session = await getSession();
  if (!session.isLoggedIn || !session.username) {
    return { error: "Session expirée. Veuillez vous reconnecter." };
  }

  const rating = Number(formData.get("rating") ?? 0);
  const category = String(formData.get("category") ?? "") as FeedbackCategory;
  const comment = String(formData.get("comment") ?? "").trim() || null;
  const relatedExam = String(formData.get("relatedExam") ?? "").trim() || null;

  if (!rating || rating < 1 || rating > 5 || !category) {
    return { error: "Une note (1 à 5) et une catégorie sont obligatoires." };
  }

  await createFeedback({
    rating,
    category,
    comment,
    relatedExam,
    reporterUsername: session.username,
    reporterFullName: session.fullName ?? session.username,
  });

  revalidatePath("/feedback");
  return { success: true };
}

export async function changeFeedbackStatusAction(feedbackId: number, status: FeedbackStatus) {
  const session = await getSession();
  if (!session.isLoggedIn) throw new Error("Session expirée.");
  await updateFeedbackStatus(feedbackId, status);
  revalidatePath("/feedback");
}
