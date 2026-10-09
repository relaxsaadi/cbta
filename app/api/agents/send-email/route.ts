import { NextRequest, NextResponse, after } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { assertSafeDgrMarketingCopy, SAFE_DGR_MARKETING_RULES } from '@/lib/dgr-marketing-claims'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function generateEmail(prospect: Record<string, unknown>): Promise<string> {
  const SECTOR_CONTEXT: Record<string, string> = {
    airline: 'compagnie aérienne — opérations cargo et transport aérien',
    ground_handler: 'société de handling — opérations piste, rampe et cargo',
    freight_forwarder: 'transitaire — organisation d’expéditions aériennes',
    oil_gas: 'entreprise pétrolière — expéditions aériennes d’équipements et produits réglementés',
    courier: 'courrier express — batteries lithium et marchandises réglementées',
    pharma: 'laboratoire — produits biologiques, cryogéniques et réglementés',
    airport_authority: 'autorité aéroportuaire — opérations et conformité liées aux marchandises dangereuses',
    chemical: 'entreprise chimique — transport aérien de matières dangereuses',
  }
  const ctx = SECTOR_CONTEXT[prospect.sector as string] || 'activité pouvant être concernée par des exigences DGR'

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
        content: `Tu es Karim Saadi, directeur commercial de KOST GROUP, organisme de formation DGR/CBTA.
Rédige un email HTML professionnel pour :
- ${prospect.decision_maker_name}, ${prospect.decision_maker_title} chez ${prospect.company_name}
- Secteur : ${ctx}

Corps de l'email HTML (sans les balises html/body) :
- Objet intégré dans le corps comme titre H2
- 3 paragraphes courts (120 mots max au total)
- Parle uniquement de leurs besoins potentiels de formation DGR/CBTA et de la possibilité de vérifier ensemble la fonction pertinente
- Ne cite une session, un prix, une date, une obligation ou une conséquence réglementaire que si cette donnée figure explicitement dans les informations du prospect
- CTA neutre : proposer un échange court ou une réponse par email/WhatsApp
- Signature : Karim Saadi | KOST GROUP | +213 542 30 53 83 | dgr.kostacademy.com
- Style inline CSS, fond blanc, police sans-serif
${SAFE_DGR_MARKETING_RULES}
Réponds uniquement avec le HTML du corps (pas de markdown).`,
      }],
    }),
  })
  const data = await res.json()
  const html = data.content?.[0]?.text || ''
  assertSafeDgrMarketingCopy(html)
  return html
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
      const subject = 'Formation DGR/CBTA — échange sur vos besoins'
      const ok = await sendViaResend(p.contact_email, subject, emailHtml)

      if (ok) {
        await supabase.from('company_prospects')
          .update({ status: 'contacted', updated_at: new Date().toISOString() })
          .eq('id', p.id)
        sent++
      }
    } catch (error) {
      console.error('[send-email] generated copy rejected or send failed', error)
    }
  }
  return { sent }
}

// POST — manual trigger from dashboard
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))

  if (body.prospect && body.prospect.contact_email) {
    try {
      const emailHtml = await generateEmail(body.prospect)
      const subject = 'Formation DGR/CBTA — échange sur vos besoins'
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
    } catch (error) {
      return NextResponse.json(
        { error: 'Copie commerciale bloquée par le garde de conformité', detail: String(error) },
        { status: 422 }
      )
    }
  }

  after(runDailyBlitz)
  return NextResponse.json({ status: 'started', message: 'Blitz email lancé en arrière-plan' })
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  after(runDailyBlitz)
  return NextResponse.json({ status: 'started' })
}
