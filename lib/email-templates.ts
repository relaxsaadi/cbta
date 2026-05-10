import type { LeadPayload } from "./schemas";

const PRIMARY = "#003D7A";
const ACCENT = "#F39C12";

export function leadConfirmationEmail(lead: LeadPayload): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "Votre demande KOST Academy a bien été reçue";
  const html = `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f1c2e;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;padding:32px 0;">
<tr><td align="center">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
  <tr><td style="background:${PRIMARY};padding:32px;text-align:center;color:#ffffff;">
    <div style="font-size:24px;font-weight:800;letter-spacing:0.5px;">KOST ACADEMY</div>
    <div style="font-size:13px;opacity:0.85;margin-top:6px;">1er Centre CBTA Provider Certifié IATA en Algérie</div>
  </td></tr>
  <tr><td style="padding:36px 36px 16px 36px;">
    <h1 style="margin:0 0 16px;font-size:22px;color:${PRIMARY};">Bonjour ${escape(lead.prenom)},</h1>
    <p style="line-height:1.6;font-size:15px;margin:0 0 16px;">
      Merci pour votre intérêt pour nos formations IATA DGR-CBTA.
      Nous avons bien reçu votre demande concernant <strong>${escape(lead.formation)}</strong>.
    </p>
    <p style="line-height:1.6;font-size:15px;margin:0 0 24px;">
      Un conseiller pédagogique vous contacte sous <strong>24 heures ouvrables</strong> pour vous transmettre :
    </p>
    <ul style="line-height:1.8;font-size:15px;padding-left:20px;margin:0 0 24px;">
      <li>Le programme détaillé de la formation</li>
      <li>Les prochaines dates de session</li>
      <li>Un devis personnalisé en EUR ou USD</li>
      <li>Les modalités d'inscription et de paiement</li>
    </ul>
    <div style="background:#f5f7fb;border-left:4px solid ${ACCENT};padding:16px 20px;border-radius:6px;margin:0 0 24px;">
      <div style="font-size:13px;color:#5b6b80;margin-bottom:6px;">Besoin urgent ?</div>
      <div style="font-size:15px;font-weight:600;">
        WhatsApp : <a href="https://wa.me/213770772619" style="color:${PRIMARY};text-decoration:none;">+213 770 77 26 19</a>
      </div>
    </div>
    <p style="line-height:1.6;font-size:14px;color:#5b6b80;margin:24px 0 0;">
      Bien cordialement,<br>
      L'équipe pédagogique KOST Academy
    </p>
  </td></tr>
  <tr><td style="background:#0f1c2e;padding:24px 36px;color:#a8b3c4;font-size:12px;line-height:1.6;text-align:center;">
    KOST Academy · 176 Cité Boushaki, Bab Ezzouar, Alger<br>
    Certifié IATA — Vérifiable sur iata.org/cbta-center-registry<br>
    Paiement EUR/USD via STRATEGIX (entité française)
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  const text = `Bonjour ${lead.prenom},

Merci pour votre intérêt pour nos formations IATA DGR-CBTA.
Nous avons bien reçu votre demande concernant ${lead.formation}.

Un conseiller pédagogique vous contacte sous 24 heures ouvrables.

WhatsApp : +213 770 77 26 19

L'équipe KOST Academy`;

  return { subject, html, text };
}

export function leadNotificationEmail(lead: LeadPayload): {
  subject: string;
  html: string;
} {
  const subject = `Nouveau lead — ${lead.formation} — ${lead.pays}`;
  const html = `<!doctype html>
<html><body style="font-family:-apple-system,sans-serif;color:#0f1c2e;padding:24px;">
<h2 style="color:${PRIMARY};margin:0 0 16px;">Nouveau lead KOST Academy</h2>
<table cellspacing="0" cellpadding="8" style="border-collapse:collapse;width:100%;font-size:14px;">
<tr><td style="background:#f5f7fb;font-weight:600;width:180px;">Nom</td><td>${escape(lead.prenom)} ${escape(lead.nom)}</td></tr>
<tr><td style="background:#f5f7fb;font-weight:600;">Email</td><td><a href="mailto:${escape(lead.email)}">${escape(lead.email)}</a></td></tr>
<tr><td style="background:#f5f7fb;font-weight:600;">WhatsApp</td><td><a href="https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, "")}">${escape(lead.whatsapp)}</a></td></tr>
<tr><td style="background:#f5f7fb;font-weight:600;">Pays</td><td>${escape(lead.pays)}</td></tr>
<tr><td style="background:#f5f7fb;font-weight:600;">Entreprise</td><td>${escape(lead.entreprise || "-")}</td></tr>
<tr><td style="background:#f5f7fb;font-weight:600;">Formation</td><td><strong>${escape(lead.formation)}</strong></td></tr>
<tr><td style="background:#f5f7fb;font-weight:600;">Message</td><td>${escape(lead.message || "-")}</td></tr>
<tr><td style="background:#f5f7fb;font-weight:600;">Source page</td><td>${escape(lead.sourcePage || "-")}</td></tr>
<tr><td style="background:#f5f7fb;font-weight:600;">UTM</td><td>${escape(lead.utm || "-")}</td></tr>
<tr><td style="background:#f5f7fb;font-weight:600;">Reçu le</td><td>${new Date().toLocaleString("fr-FR", { timeZone: "Africa/Algiers" })}</td></tr>
</table>
</body></html>`;
  return { subject, html };
}

function escape(s: string | undefined): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
