import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { scrapeGoogleIntents, scrapeGoogleMapsLeads, scrapeJobBoards } from '@/lib/apify'
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { Resend } from 'resend'

export const maxDuration = 300

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return runIntel()
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  let targetCountries: string[] | undefined
  try { const b = await req.json(); targetCountries = b.countries } catch {}
  return runIntel(targetCountries)
}

async function runIntel(targetCountries?: string[]) {
  const results = { google: 0, maps: 0, linkedin: 0, saved: 0, duplicates: 0 }

  try {
    const [googleLeads, mapsLeads, jobLeads] = await Promise.allSettled([
      scrapeGoogleIntents(undefined, targetCountries),
      scrapeGoogleMapsLeads(undefined, targetCountries),
      scrapeJobBoards(),
    ])

    const allLeads = [
      ...(googleLeads.status === 'fulfilled' ? googleLeads.value : []),
      ...(mapsLeads.status === 'fulfilled' ? mapsLeads.value : []),
      ...(jobLeads.status === 'fulfilled' ? jobLeads.value : []),
    ]

    results.google = googleLeads.status === 'fulfilled' ? googleLeads.value.length : 0
    results.maps = mapsLeads.status === 'fulfilled' ? mapsLeads.value.length : 0
    results.linkedin = jobLeads.status === 'fulfilled' ? jobLeads.value.length : 0

    const supabase = getSupabase()
    const newLeads = []

    for (const lead of allLeads) {
      // Score with Claude
      const score = await scoreLead(lead)
      if (score < 5) continue

      // Generate message draft
      const message = await generateMessage(lead)

      // Check duplicate
      const { data: existing } = await supabase
        .from('intent_leads')
        .select('id')
        .eq('source_url', lead.source_url)
        .single()

      if (existing) { results.duplicates++; continue }

      const { error } = await supabase.from('intent_leads').insert({
        ...lead,
        score,
        message_draft: message.text,
        message_type: lead.source === 'linkedin_jobs' ? 'linkedin' : 'email',
        status: 'pending_approval',
      })

      if (!error) {
        results.saved++
        newLeads.push({ ...lead, score, message_draft: message.text })
      }
    }

    // Send approval email if new leads found
    if (newLeads.length > 0) {
      await sendApprovalEmail(newLeads)
    }

    return NextResponse.json({ ok: true, ...results })
  } catch (err) {
    console.error('[intel]', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

async function scoreLead(lead: { company_name: string; country: string; intent_signal: string; raw_snippet: string; source: string }) {
  try {
    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      maxOutputTokens: 5,
      prompt: `Tu prospectes pour KOST GROUP, 1er centre IATA CBTA certifié d'Algérie.
Score ce signal d'intention de 1 à 10.

Source: ${lead.source}
Entreprise: ${lead.company_name}
Pays: ${lead.country}
Signal: ${lead.intent_signal}
Extrait: ${lead.raw_snippet.slice(0, 300)}

Score élevé si: cherche formation DGR/IATA, offre emploi DGR, cargo/fret/handling en Afrique, décideur identifiable.
Réponds UNIQUEMENT par un chiffre 1-10.`,
    })
    return Math.min(10, Math.max(1, parseInt(text.trim()) || 5))
  } catch {
    return 5
  }
}

async function generateMessage(lead: { company_name: string; country: string; intent_signal: string; source: string }) {
  try {
    return await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      maxOutputTokens: 300,
      prompt: `Tu es le directeur commercial de KOST GROUP, 1er centre IATA CBTA certifié d'Algérie.

Rédige un message de prospection court (max 200 mots) en français pour:
- Entreprise: ${lead.company_name}
- Pays: ${lead.country}
- Contexte: ${lead.intent_signal}
- Canal: ${lead.source === 'linkedin_jobs' ? 'LinkedIn (message direct)' : 'Email professionnel'}

Le message doit:
- Mentionner leur besoin précis (formation DGR, certification IATA)
- Positionner KOST comme LA solution (1er CBTA certifié Algérie, Agrément N°537)
- CTA clair: WhatsApp +213 542 30 53 83 ou dgr.kostacademy.com
- Ton professionnel mais humain, pas de spam

Écris UNIQUEMENT le message, sans sujet ni explication.`,
    })
  } catch {
    return {
      text: `Bonjour,\n\nNous avons identifié votre besoin en formation DGR IATA. KOST GROUP, 1er centre IATA CBTA certifié d'Algérie (Agrément N°537), propose des formations sur site adaptées à votre secteur.\n\nContactez-nous : +213 542 30 53 83 | dgr.kostacademy.com\n\nCordialement,\nKOST GROUP`,
    }
  }
}

async function sendApprovalEmail(leads: Array<{ company_name: string; country: string; score: number; intent_signal: string; source: string; message_draft: string; source_url: string }>) {
  const leadsHtml = leads.map((l, i) => `
    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <strong style="font-size:15px;">${l.company_name} — ${l.country}</strong>
        <span style="background:${l.score >= 8 ? '#dcfce7' : '#fef9c3'};color:${l.score >= 8 ? '#166534' : '#854d0e'};padding:2px 8px;border-radius:20px;font-size:12px;font-weight:bold;">Score ${l.score}/10</span>
      </div>
      <div style="font-size:12px;color:#6b7280;margin-bottom:8px;">📡 ${l.intent_signal}</div>
      <div style="font-size:12px;color:#6b7280;margin-bottom:12px;">Source: ${l.source} ${l.source_url ? `| <a href="${l.source_url}">Voir</a>` : ''}</div>
      <div style="background:#f8fafc;border-left:3px solid #0f2557;padding:12px;border-radius:4px;font-size:13px;white-space:pre-wrap;font-family:sans-serif;">${l.message_draft}</div>
      <div style="margin-top:12px;">
        <a href="https://dgr.kostacademy.com/dashboard/intel?approve=${i}" style="background:#0f2557;color:white;padding:8px 16px;border-radius:6px;text-decoration:none;font-size:13px;margin-right:8px;">✅ Approuver &amp; Envoyer</a>
        <a href="https://dgr.kostacademy.com/dashboard/intel" style="background:#f3f4f6;color:#374151;padding:8px 16px;border-radius:6px;text-decoration:none;font-size:13px;">Voir tous les leads</a>
      </div>
    </div>
  `).join('')

  await resend.emails.send({
    from: 'KOST Agent <cbta@dgr.kostacademy.com>',
    to: 'kostgroupe@gmail.com',
    subject: `🎯 ${leads.length} nouveau(x) lead(s) chaud(s) — Approbation requise`,
    html: `
      <div style="font-family:sans-serif;max-width:680px;margin:0 auto;">
        <div style="background:#0f2557;color:white;padding:24px;border-radius:12px 12px 0 0;">
          <h1 style="margin:0;font-size:20px;">🎯 ${leads.length} lead(s) chaud(s) trouvés</h1>
          <p style="margin:8px 0 0;opacity:0.8;font-size:14px;">Agent KOST — Prospection CBTA IATA Afrique</p>
        </div>
        <div style="padding:24px;background:white;">
          <p style="color:#374151;margin-bottom:20px;">Les messages suivants ont été générés par l'agent Claude. <strong>Approuvez avant envoi :</strong></p>
          ${leadsHtml}
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
          <p style="font-size:12px;color:#9ca3af;text-align:center;">KOST GROUP — Agent autonome DGR IATA | dgr.kostacademy.com</p>
        </div>
      </div>
    `,
  })
}
