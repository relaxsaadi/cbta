import { NextResponse } from "next/server";
import { Resend } from "resend";
import { leadSchema } from "@/lib/schemas";
import {
  leadConfirmationEmail,
  leadNotificationEmail,
} from "@/lib/email-templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Body JSON invalide" },
      { status: 400 }
    );
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Données invalides",
        details: parsed.error.issues.map((i) => ({
          field: i.path[0],
          message: i.message,
        })),
      },
      { status: 400 }
    );
  }

  const lead = parsed.data;

  // Honeypot — silently accept then drop
  if (lead.website && lead.website.length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const errors: string[] = [];

  // Email via Resend
  const resendKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.NOTIFICATION_EMAIL || "kostgroupe@gmail.com";

  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      const fromAddress = process.env.RESEND_FROM_EMAIL || "KOST Academy <onboarding@resend.dev>";

      const confirmation = leadConfirmationEmail(lead);
      const notification = leadNotificationEmail(lead);

      await Promise.allSettled([
        resend.emails.send({
          from: fromAddress,
          to: lead.email,
          subject: confirmation.subject,
          html: confirmation.html,
          text: confirmation.text,
          replyTo: notifyEmail,
        }),
        resend.emails.send({
          from: fromAddress,
          to: notifyEmail,
          subject: notification.subject,
          html: notification.html,
          replyTo: lead.email,
        }),
      ]);
    } catch (err) {
      console.error("[lead] Resend error:", err);
      errors.push("email");
    }
  } else {
    console.warn(
      "[lead] RESEND_API_KEY missing — skipping email send. Lead:",
      JSON.stringify({
        email: lead.email,
        formation: lead.formation,
        pays: lead.pays,
      })
    );
  }

  // Push to Google Sheet webhook
  const sheetWebhook = process.env.GOOGLE_SHEET_WEBHOOK;
  if (sheetWebhook) {
    try {
      const payload = {
        ...lead,
        receivedAt: new Date().toISOString(),
      };
      // Fire-and-forget but await briefly to surface errors
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 4000);
      await fetch(sheetWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      }).catch((err) => {
        console.error("[lead] Sheet webhook error:", err);
        errors.push("sheet");
      });
      clearTimeout(timeout);
    } catch (err) {
      console.error("[lead] Sheet webhook outer error:", err);
      errors.push("sheet");
    }
  } else {
    console.warn("[lead] GOOGLE_SHEET_WEBHOOK missing — skipping sheet push.");
  }

  // Always log the lead so it's never lost
  console.info(
    "[lead] received:",
    JSON.stringify({
      ts: new Date().toISOString(),
      email: lead.email,
      pays: lead.pays,
      formation: lead.formation,
      whatsapp: lead.whatsapp,
      sourcePage: lead.sourcePage,
      utm: lead.utm,
      sideErrors: errors,
    })
  );

  return NextResponse.json({ ok: true, sideErrors: errors }, { status: 200 });
}
