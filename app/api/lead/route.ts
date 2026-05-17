import { NextResponse } from "next/server";
import { Resend } from "resend";
import { leadSchema, type LeadPayload } from "@/lib/schemas";
import { leadNotificationEmail } from "@/lib/email-templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GHL_TIMEOUT_MS = 10_000;

type SideStatus = "ok" | "skip" | "fail";

// Map readable country names (FR) → ISO 3166-1 alpha-2 codes for GHL standard
// country field. Falls back to the input value if no match (e.g. "Autre").
const COUNTRY_NAME_TO_ISO: Record<string, string> = {
  algérie: "DZ",
  algerie: "DZ",
  maroc: "MA",
  tunisie: "TN",
  sénégal: "SN",
  senegal: "SN",
  "côte d'ivoire": "CI",
  "cote d'ivoire": "CI",
  cameroun: "CM",
  mali: "ML",
  "burkina faso": "BF",
  gabon: "GA",
  france: "FR",
};

function countryNameToIso(name: string): string {
  if (!name) return "";
  const key = name.trim().toLowerCase();
  return COUNTRY_NAME_TO_ISO[key] || name;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
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
    console.warn("[lead] honeypot triggered — dropped");
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Fire integrations in parallel
  const [ghlStatus, resendStatus] = await Promise.all([
    pushToGHL(lead),
    sendNotificationEmail(lead),
  ]);

  // Always log so the lead is never lost (Vercel Logs)
  console.info(
    "[lead] processed:",
    JSON.stringify({
      ts: new Date().toISOString(),
      email: lead.email,
      pays: lead.pays,
      formation: lead.formation,
      whatsapp: lead.whatsapp,
      sourcePage: lead.sourcePage,
      utm_source: lead.utm_source,
      utm_campaign: lead.utm_campaign,
      gclid: lead.gclid,
      ghl: ghlStatus,
      resend: resendStatus,
    })
  );

  return NextResponse.json(
    { ok: true, integrations: { ghl: ghlStatus, resend: resendStatus } },
    { status: 200 }
  );
}

// ─────────────────────────────────────────────────────────────
// GHL (primary CRM)
// ─────────────────────────────────────────────────────────────
async function pushToGHL(lead: LeadPayload): Promise<SideStatus> {
  const url = process.env.GHL_WEBHOOK_URL;
  if (!url) {
    console.warn("[lead][ghl] GHL_WEBHOOK_URL missing — skipping CRM push");
    return "skip";
  }

  // Split: support both split prenom/nom and single-word case
  const firstName = lead.prenom.trim();
  const lastName = (lead.nom || "").trim();
  const fullName = `${firstName} ${lastName}`.trim();

  const tags = ["KOST-DGR", lead.pays, lead.formation].filter(Boolean);

  // GHL standard country field expects ISO 3166 alpha-2 codes
  const countryCode = countryNameToIso(lead.pays);

  const payload = {
    firstName,
    lastName,
    fullName,
    email: lead.email,
    phone: lead.whatsapp,
    country: countryCode,
    countryName: lead.pays,
    company: lead.entreprise || "",
    formation: lead.formation,
    message: lead.message || "",
    source: "dgr.kostacademy.com",
    utm_source: lead.utm_source || "",
    utm_medium: lead.utm_medium || "",
    utm_campaign: lead.utm_campaign || "",
    utm_term: lead.utm_term || "",
    utm_content: lead.utm_content || "",
    gclid: lead.gclid || "",
    fbclid: lead.fbclid || "",
    tags,
    submittedAt: new Date().toISOString(),
  };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), GHL_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      const bodyText = await res.text().catch(() => "<no body>");
      console.error(
        `[lead][ghl] webhook returned ${res.status} ${res.statusText} — ${bodyText.slice(0, 300)}`
      );
      return "fail";
    }
    console.info(`[lead][ghl] pushed OK (${res.status})`);
    return "ok";
  } catch (err) {
    clearTimeout(timer);
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[lead][ghl] fetch error: ${msg}`);
    return "fail";
  }
}

// ─────────────────────────────────────────────────────────────
// Resend (internal notification only — GHL handles the welcome)
// ─────────────────────────────────────────────────────────────
async function sendNotificationEmail(lead: LeadPayload): Promise<SideStatus> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[lead][resend] RESEND_API_KEY missing — skipping notification email");
    return "skip";
  }

  const notifyEmail = process.env.NOTIFICATION_EMAIL || "kostgroupe@gmail.com";
  const fromAddress =
    process.env.RESEND_FROM_EMAIL || "KOST GROUP <onboarding@resend.dev>";

  try {
    const resend = new Resend(apiKey);
    const notification = leadNotificationEmail(lead);
    const result = await resend.emails.send({
      from: fromAddress,
      to: notifyEmail,
      subject: notification.subject,
      html: notification.html,
      replyTo: lead.email,
    });
    if (result.error) {
      console.error("[lead][resend] send error:", result.error);
      return "fail";
    }
    console.info("[lead][resend] notification sent OK");
    return "ok";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[lead][resend] exception: ${msg}`);
    return "fail";
  }
}
