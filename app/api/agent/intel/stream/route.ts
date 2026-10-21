import { NextRequest } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { scrapeGoogleIntents, scrapeGoogleMapsLeads, scrapeJobBoards, type ApifyLead } from '@/lib/apify'
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { Resend } from 'resend'

export const maxDuration = 300

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: NextRequest) {
  const auth = req.nextUrl.searchParams.get('secret')
  if (auth !== process.env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const countriesParam = req.nextUrl.searchParams.get('countries')
  const targetCountries = countriesParam ? countriesParam.split(',').map(c => c.trim()).filter(Boolean) : undefined

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const geoLabel = targetCountries?.length ? targetCountries.join(', ') : 'tous les pays'
        send('status', { msg: `🚀 Scan démarré — ${geoLabel}` })

        const supabase = getSupabase()
        let totalSaved = 0
        const newLeads: (ApifyLead & { score: number; message_draft: string })[] = []

        const sources = [
          { fn: () => scrapeGoogleIntents(msg => send('status', { msg }), targetCountries), name: 'Google Search' },
          { fn: () => scrapeGoogleMapsLeads(msg => send('status', { msg }), targetCountries), name: 'Google Maps' },
          { fn: () => scrapeJobBoards(msg => send('status', { msg })), name: 'Job Boards' },
        ]

        for (const source of sources) {
          try {
            const leads = await source.fn()
            send('status', { msg: `⚙️ Scoring ${leads.length} résultats ${source.name}...` })

            for (const lead of leads) {
              const score = await scoreLead(lead)
              if (score < 5) continue

              // Deduplicate
              const { data: existing } = await supabase
                .from('intent_leads')
                .select('id')
                .eq('source_url', lead.source_url)
                .maybeSingle()
              if (existing) continue

              const message = await generateMessage(lead)

              const { error } = await supabase.from('intent_leads').insert({
                ...lead,
                score,
                message_draft: message,
                message_type: 'email',
                status: 'pending_approval',
              })

              if (!error) {
                totalSaved++
                newLeads.push({ ...lead, score, message_draft: message })
                // Stream each new lead in real-time as found
                send('lead', {
                  company_name: lead.company_name,
                  country: lead.country,
                  source: lead.source,
                  score,
                  intent_signal: lead.intent_signal,
                  message_preview: message.slice(0, 120) + '...',
                })
              }
            }
          } catch (e) {
            send('status', { msg: `⚠️ ${source.name}: ${String(e).slice(0, 100)}` })
          }
        }

        // Send approval email
        if (newLeads.length > 0) {
          await sendApprovalEmail(newLeads)
          send('status', { msg: `📧 Email résumé envoyé à kostgroupe@gmail.com` })
        }

        send('done', {
          saved: totalSaved,
          msg: totalSaved > 0
            ? `✅ ${totalSaved} nouveau(x) lead(s) trouvés ! Email envoyé pour approbation.`
            : '🔍 Aucun nouveau lead (tous déjà en base ou score < 5)',
        })
      } catch (e) {
        send('error', { msg: String(e) })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

async function scoreLead(lead: ApifyLead): Promise<number> {
  try {
    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      maxOutputTokens: 5,
      prompt: `Tu prospectes pour KOST GROUP, 1er centre IATA CBTA certifié d'Algérie.
Score ce signal d'ACHAT potentiel de 1 à 10.

Entreprise: ${lead.company_name} | Pays: ${lead.country}
Source: ${lead.source} | URL: ${lead.source_url}
Signal: ${lead.intent_signal}
Extrait: ${lead.raw_snippet.slice(0, 200)}

SCORE ÉLEVÉ (7-10) si: offre emploi requérant certification DGR/IATA, entreprise cargo/transitaire/handling cherchant à former son équipe, forum où quelqu'un cherche un prestataire de formation.
SCORE MOYEN (4-6) si: entreprise cargo/fret sans signal clair de besoin formation.
SCORE 1 si: c'est un centre de formation concurrent, un prestataire qui OFFRE des formations DGR/CBTA, ou un contenu non pertinent.

Réponds UNIQUEMENT par un chiffre 1-10.`,
    })
    return Math.min(10, Math.max(1, parseInt(text.trim()) || 5))
  } catch { return 5 }
}

async function generateMessage(lead: ApifyLead): Promise<string> {
  try {
    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      maxOutputTokens: 250,
      prompt: `Tu es directeur commercial KOST GROUP, 1er centre IATA CBTA certifié d'Algérie.
Rédige un message de prospection (150 mots max) en français pour:
- Entreprise: ${lead.company_name} (${lead.country})
- Contexte: ${lead.intent_signal}
Inclure: besoin DGR identifié, KOST = solution (Agrément N°537), CTA WhatsApp +213 542 30 53 83.
Écris UNIQUEMENT le message.`,
    })
    return text.trim()
  } catch {
    return `Bonjour,\n\nNous avons identifié votre besoin en formation DGR IATA. KOST GROUP, 1er centre IATA CBTA certifié d'Algérie (Agrément N°537), propose des formations sur site adaptées à votre secteur.\n\nContact : +213 542 30 53 83 | dgr.kostacademy.com\n\nCordialement,\nKOST GROUP`
  }
}

async function sendApprovalEmail(leads: (ApifyLead & { score: number; message_draft: string })[]) {
  const html = leads.map(l => `
    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <strong>${l.company_name} — ${l.country}</strong>
        <span style="background:${l.score >= 8 ? '#dcfce7' : '#fef9c3'};color:${l.score >= 8 ? '#166534' : '#854d0e'};padding:2px 10px;border-radius:20px;font-size:12px;font-weight:bold;">${l.score}/10</span>
      </div>
      <div style="font-size:12px;color:#6b7280;margin-bottom:10px;">📡 ${l.intent_signal}</div>
      <div style="background:#f8fafc;border-left:3px solid #0f2557;padding:10px;font-size:13px;white-space:pre-wrap;">${l.message_draft}</div>
      <div style="margin-top:10px;">
        <a href="https://dgr.kostacademy.com/dashboard/intel" style="background:#0f2557;color:white;padding:7px 14px;border-radius:6px;text-decoration:none;font-size:13px;">✅ Voir &amp; Approuver</a>
      </div>
    </div>
  `).join('')

  await resend.emails.send({
    from: 'KOST Agent <cbta@dgr.kostacademy.com>',
    to: 'kostgroupe@gmail.com',
    subject: `🔥 ${leads.length} lead(s) chaud(s) — Approuver avant envoi`,
    html: `<div style="font-family:sans-serif;max-width:660px;margin:0 auto;">
      <div style="background:#0f2557;color:white;padding:20px;border-radius:10px 10px 0 0;">
        <h2 style="margin:0;">🔥 ${leads.length} nouveau(x) lead(s) chaud(s)</h2>
        <p style="margin:6px 0 0;opacity:.8;font-size:13px;">Agent KOST — Prospection CBTA IATA Afrique</p>
      </div>
      <div style="padding:20px;background:#fff;">${html}
        <p style="font-size:11px;color:#9ca3af;text-align:center;margin-top:16px;">KOST GROUP — dgr.kostacademy.com</p>
      </div>
    </div>`,
  })
}
