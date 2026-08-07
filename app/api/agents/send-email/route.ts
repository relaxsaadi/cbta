import { NextRequest, NextResponse, after } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function generateEmail(prospect: Record<string, unknown>): Promise<string> {
  const daysLeft = Math.max(0, Math.ceil((new Date('2026-09-30').getTime() - Date.now()) / 86400000))
  const SECTOR_CONTEXT: Record<string, string> = {
    airline: 'compagnie aérienne — agents cargo, dispatchers, loadmasters obligés IATA',
    ground_handler: 'société de handling — agents piste manipulant des DGR quotidiennement',
    freight_forwarder: 'transitaire — tout personnel traitant des expéditions aériennes DGR',
    oil_gas: 'entreprise pétrolière — expéditions d\'équipements DGR par avion',
    courier: 'courrier express — batteries lithium, marchandises réglementées',
    pharma: 'laboratoire — produits biologiques, cryogéniques, réglementés IATA',
    airport_authority: 'autorité aéroportuaire — responsabilité juridique sur les DGR',
    chemical: 'entreprise chimique — transport aérien matières dangereuses',
  }
  const ctx = SECTOR_CONTEXT[prospect.sector as string] || 'secteur réglementé IATA'

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `Tu es Karim Saadi, directeur commercial de KOST GROUP, premier centre IATA CBTA certifié d'Algérie.
Rédige un email HTML professionnel pour :
- ${prospect.decision_maker_name}, ${prospect.decision_maker_title} chez ${prospect.company_name}
- Secteur : ${ctx}
- Il reste ${daysLeft} jours avant le renforcement des contrôles IATA (deadline septembre 2026)

Corps de l'email HTML (sans les balises html/body) :
- Objet intégré dans le corps comme titre H2
- 3 paragraphes courts (120 mots max au total)
- Urgence réglementaire IATA spécifique à leur secteur
- KOST = seul centre CBTA certifié Algérie, session août disponible
- CTA bouton vert : "Réserver ma place — Session Août 2026" → https://dgr.kostacademy.com
- Signature : Karim Saadi | KOST GROUP | +213 542 30 53 83 | dgr.kostacademy.com
- Style inline CSS, fond blanc, police sans-serif

Réponds uniquement avec le HTML du corps (pas de markdown).`,
      }],
    }),
  })
  const data = await res.json()
  return data.content?.[0]?.text || ''
}

async function sendViaResend(to: string, subject: string, html: string): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return false

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Karim Saadi — KOST GROUP <karim@dgr.kostacademy.com>',
      to: [to],
      subject,
      html,
      reply_to: 'kostgroupe@gmail.com',
    }),
  })
  return res.ok
}

async function runDailyBlitz() {
  const supabase = getSupabase()

  // Pick top 10 uncontacted prospects with verified email, ordered by score
  const { data: prospects } = await supabase
    .from('company_prospects')
    .select('*')
    .not('contact_email', 'is', null)
    .eq('status', 'found')
    .order('score', { ascending: false })
    .limit(10)

  if (!prospects?.length) return { sent: 0 }

  let sent = 0
  for (const p of prospects) {
    try {
      const emailHtml = await generateEmail(p)
      const subject = `Formation DGR IATA — Obligation réglementaire avant septembre 2026`
      const ok = await sendViaResend(p.contact_email, subject, emailHtml)

      if (ok) {
        await supabase.from('company_prospects')
          .update({ status: 'contacted', updated_at: new Date().toISOString() })
          .eq('id', p.id)
        sent++
      }
    } catch {
      // continue with next prospect
    }
  }
  return { sent }
}

// POST — manual trigger from dashboard
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))

  // Single email to one prospect
  if (body.prospect && body.prospect.contact_email) {
    const emailHtml = await generateEmail(body.prospect)
    const subject = 'Formation DGR IATA — Obligation réglementaire avant septembre 2026'
    const ok = await sendViaResend(body.prospect.contact_email, subject, emailHtml)

    if (ok) {
      const supabase = getSupabase()
      await supabase.from('company_prospects')
        .update({ status: 'contacted', updated_at: new Date().toISOString() })
        .eq('id', body.prospect.id)
    }

    return NextResponse.json({
      sent: ok,
      preview: emailHtml.slice(0, 300),
      note: ok ? 'Email envoyé' : 'RESEND_API_KEY manquante — ajoutez-la dans Vercel env vars',
    })
  }

  // Batch daily blitz — fire and forget
  after(runDailyBlitz)
  return NextResponse.json({ status: 'started', message: 'Blitz email lancé en arrière-plan' })
}

// GET — cron quotidien 8h du matin
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  after(runDailyBlitz)
  return NextResponse.json({ status: 'started' })
}
