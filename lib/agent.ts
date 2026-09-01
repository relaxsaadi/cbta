import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { supabase, SECTORS, type Lead, type LeadStatus } from './supabase'
import { Resend } from 'resend'

// Preview/build environments are not required to carry an outbound-email
// credential. Avoid constructing Resend with an undefined key at module import.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'contact@dgr.kostacademy.com'
const FROM_NAME = 'KOST GROUP — DGR IATA'

// Score a prospect 1-10 with Claude
export async function scoreProspect(lead: Lead): Promise<number> {
  const company = lead.company
  if (!company) return 0

  const { text } = await generateText({
    model: anthropic('claude-haiku-4-5-20251001'),
    prompt: `Tu es un expert en prospection B2B pour KOST GROUP, premier centre IATA CBTA certifié d'Algérie.

Évalue ce prospect pour une formation DGR IATA (marchandises dangereuses) obligatoire.

Entreprise: ${company.name}
Pays: ${company.country}
Secteur: ${company.sector}
Contact: ${company.contact_name || 'inconnu'} — ${company.contact_title || 'inconnu'}
Email disponible: ${company.email ? 'oui' : 'non'}
Participants estimés: ${lead.participants_count}

Critères de scoring:
- Secteur airline/freight/handler = haute priorité (obligation IATA absolue)
- Pays Maroc/Sénégal/CIV/Cameroun = marchés prioritaires Afrique
- Contact décideur (DRH, Directeur Ops, Responsable Formation) = plus de valeur
- Email disponible = requis pour campagne
- 20+ participants = grande opportunité

Réponds UNIQUEMENT avec un nombre entier entre 1 et 10. Rien d'autre.`,
    maxOutputTokens: 5,
  })

  const score = parseInt(text.trim())
  return isNaN(score) ? 5 : Math.min(10, Math.max(1, score))
}

// Generate personalized email with Claude
export async function generateEmail(lead: Lead, type: 'intro' | 'followup1' | 'followup2'): Promise<{ subject: string; body: string }> {
  const company = lead.company
  if (!company) return { subject: '', body: '' }

  const sectorLabel = SECTORS[company.sector as keyof typeof SECTORS] || company.sector
  const contactName = company.contact_name ? `M./Mme ${company.contact_name.split(' ')[0]}` : 'Madame, Monsieur'

  const typePrompts = {
    intro: `Email de premier contact — professionnel, court (150 mots max), axé obligation réglementaire IATA`,
    followup1: `Relance J+3 — rappeler gentiment le premier email, ajouter une preuve sociale (Air Algérie, Banque d'Algérie parmi nos références), court (100 mots max)`,
    followup2: `Relance J+7 finale — créer urgence (prochaine session bientôt, places limitées), très court (80 mots max), laisser une porte ouverte WhatsApp`,
  }

  const { text } = await generateText({
    model: anthropic('claude-haiku-4-5-20251001'),
    prompt: `Tu es le directeur commercial de KOST GROUP, premier centre IATA CBTA certifié d'Algérie (Agrément État N° 537).

Rédige un email de prospection B2B en français.

Type: ${typePrompts[type]}

Destinataire:
- Prénom à utiliser: ${contactName}
- Entreprise: ${company.name}
- Pays: ${company.country}
- Secteur: ${sectorLabel}
- Participants estimés: ${lead.participants_count}

Contexte KOST GROUP:
- 1er centre IATA CBTA certifié d'Algérie
- Agrément État N° 537
- Références: Air Algérie, Banque d'Algérie, Algérie Télécom, ALSTOM, + 80 entreprises
- Formation DGR IATA Cat. 7.1 à 7.10 (obligatoire IATA Résolution 618)
- Sessions intra-entreprise sur site
- Contact: +213 542 30 53 83 | dgr.kostacademy.com

Réponds en JSON strict avec ce format:
{"subject": "...", "body": "..."}

Le body doit être en texte brut (pas de HTML), paragraphes séparés par \\n\\n.
Signe toujours: Cordialement,\\nKOST GROUP\\n+213 542 30 53 83\\ndgr.kostacademy.com`,
    maxOutputTokens: 500,
  })

  try {
    const cleaned = text.trim().replace(/```json\n?|\n?```/g, '')
    return JSON.parse(cleaned)
  } catch {
    return {
      subject: `Formation DGR IATA obligatoire — ${company.name}`,
      body: `${contactName},\n\nKOST GROUP, premier centre IATA CBTA certifié d'Algérie, propose des formations DGR IATA adaptées à votre secteur.\n\nCordialement,\nKOST GROUP\n+213 542 30 53 83\ndgr.kostacademy.com`,
    }
  }
}

// Send email via Resend
async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  if (!resend) return false
  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      text: body,
    })
    return !error
  } catch {
    return false
  }
}

// Main agent: process new leads
export async function processNewLeads(limit = 10): Promise<{ processed: number; sent: number; skipped: number }> {
  const { data: leads } = await supabase
    .from('leads')
    .select('*, company:companies(*)')
    .eq('status', 'new')
    .order('created_at', { ascending: true })
    .limit(limit)

  if (!leads?.length) return { processed: 0, sent: 0, skipped: 0 }

  let sent = 0
  let skipped = 0

  for (const lead of leads) {
    // Skip leads without email
    if (!lead.company?.email) {
      skipped++
      await supabase.from('leads').update({
        notes: (lead.notes || '') + '\n[Agent] Pas d\'email — ignoré',
        updated_at: new Date().toISOString(),
      }).eq('id', lead.id)
      continue
    }

    // Score prospect
    const score = await scoreProspect(lead)

    // Skip low-quality prospects (score < 4)
    if (score < 4) {
      skipped++
      await supabase.from('leads').update({
        notes: (lead.notes || '') + `\n[Agent] Score ${score}/10 — trop bas, ignoré`,
        status: 'lost' as LeadStatus,
        updated_at: new Date().toISOString(),
      }).eq('id', lead.id)
      continue
    }

    // Generate and send email
    const email = await generateEmail(lead, 'intro')
    const ok = await sendEmail(lead.company.email, email.subject, email.body)

    // Log in email_logs
    await supabase.from('email_logs').insert({
      lead_id: lead.id,
      subject: email.subject,
      body: email.body,
      status: ok ? 'sent' : 'bounced',
      sent_at: new Date().toISOString(),
    })

    // Update lead
    await supabase.from('leads').update({
      status: 'contacted' as LeadStatus,
      value_eur: lead.participants_count * 800,
      notes: (lead.notes || '') + `\n[Agent] Score ${score}/10 — Email envoyé ${new Date().toLocaleDateString('fr-FR')}`,
      next_action: 'Relance J+3 automatique',
      next_action_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    }).eq('id', lead.id)

    if (ok) sent++
    else skipped++
  }

  return { processed: leads.length, sent, skipped }
}

// Follow-up agent: J+3 and J+7
export async function processFollowups(): Promise<{ j3: number; j7: number }> {
  const now = new Date()
  const j3 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
  const j7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const j8 = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString()

  // Get contacted leads
  const { data: leads } = await supabase
    .from('leads')
    .select('*, company:companies(*), email_logs(*)')
    .eq('status', 'contacted')

  if (!leads?.length) return { j3: 0, j7: 0 }

  let sentJ3 = 0
  let sentJ7 = 0

  for (const lead of leads) {
    if (!lead.company?.email) continue

    const logs = lead.email_logs || []
    const hasReply = logs.some((l: { status: string }) => l.status === 'replied')
    if (hasReply) continue

    const lastSent = logs
      .filter((l: { status: string }) => l.status === 'sent')
      .sort((a: { sent_at: string }, b: { sent_at: string }) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())[0]

    if (!lastSent) continue

    const sentAt = lastSent.sent_at
    const isJ3 = sentAt <= j3 && sentAt > j7
    const isJ7 = sentAt <= j7 && sentAt > j8

    if (isJ3) {
      const email = await generateEmail(lead, 'followup1')
      const ok = await sendEmail(lead.company.email, email.subject, email.body)
      if (ok) {
        sentJ3++
        await supabase.from('email_logs').insert({
          lead_id: lead.id, subject: email.subject, body: email.body,
          status: 'sent', sent_at: new Date().toISOString(),
        })
        await supabase.from('leads').update({
          next_action: 'Relance J+7 automatique',
          next_action_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        }).eq('id', lead.id)
      }
    } else if (isJ7) {
      const email = await generateEmail(lead, 'followup2')
      const ok = await sendEmail(lead.company.email, email.subject, email.body)
      if (ok) {
        sentJ7++
        await supabase.from('email_logs').insert({
          lead_id: lead.id, subject: email.subject, body: email.body,
          status: 'sent', sent_at: new Date().toISOString(),
        })
        await supabase.from('leads').update({
          next_action: 'Séquence terminée — appel manuel recommandé',
          updated_at: new Date().toISOString(),
        }).eq('id', lead.id)
      }
    }
  }

  return { j3: sentJ3, j7: sentJ7 }
}
