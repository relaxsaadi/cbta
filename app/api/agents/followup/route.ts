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

// Automated follow-up text must not manufacture legal deadlines, client results,
// certifications or promises. This channel remains unapproved for release.
async function generateFollowup(prospect: Record<string, unknown>, daysSinceContact: number): Promise<{ email: string; linkedin: string; whatsapp: string }> {
  const angle = 'Reprendre contact avec respect pour discuter de besoins possibles de formation DGR/CBTA, sans urgence ni obligation réglementaire présumée.'

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
        content: `Tu es Karim Saadi de KOST GROUP.
Génère 3 messages de relance (${daysSinceContact}j sans réponse) pour ${prospect.decision_maker_name}, ${prospect.decision_maker_title} chez ${prospect.company_name}.
Angle: "${angle}"

1. EMAIL (objet + corps, 80 mots max, ton direct non-insistant)
2. LINKEDIN (150 chars max, différent de l'email)
3. WHATSAPP (100 mots max, émojis ok, conversationnel)

N'invente pas de date de session, délai IATA, sanction, agrément, résultat client ni certification.
${SAFE_DGR_MARKETING_RULES}

Format exact:
EMAIL_OBJET: [objet]
EMAIL_CORPS: [corps]
LINKEDIN: [message]
WHATSAPP: [message]
      }],
    }),
  })

  if (!res.ok) throw new Error('Follow-up generation provider rejected the request')
  const data = await res.json()
  const text: string = data.content?.[0]?.text || ''

  const extract = (key: string) => {
    const match = text.match(new RegExp(`${key}:\\s*([\\s\\S]*?)(?=\\n[A-Z_]+:|$)`))
    return match ? match[1].trim() : ''
  }

  const emailObjet = extract('EMAIL_OBJET')
  const emailCorps = extract('EMAIL_CORPS')
  const linkedin = extract('LINKEDIN')
  const whatsapp = extract('WHATSAPP')
  if (!emailObjet || !emailCorps || !linkedin || !whatsapp) {
    throw new Error('Follow-up generation returned missing required content')
  }
  const email = `Objet: ${emailObjet}\n\n${emailCorps}`
  // Validate every channel before invoking any external email provider.
  assertSafeDgrMarketingCopy([email, linkedin, whatsapp].join('\n'))
  return { email, linkedin, whatsapp }
}

async function runFollowupAgent() {
  const supabase = getSupabase()
  const now = new Date()

  // Find contacted prospects with no update in 2+ days
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()

  const { data: stale } = await supabase
    .from('company_prospects')
    .select('*')
    .eq('status', 'contacted')
    .lt('updated_at', twoDaysAgo)
    .order('score', { ascending: false })
    .limit(10)

  if (!stale?.length) return { drafted: 0, acceptedByProvider: 0 }

  const results = []
  let acceptedByProvider = 0
  for (const p of stale) {
    const daysSince = Math.floor((now.getTime() - new Date(p.updated_at).getTime()) / 86400000)
    if (daysSince > 30) continue // Don't follow up after 30 days

    const messages = await generateFollowup(p, daysSince)

    // Autonomy must be explicitly enabled by the owner; safe by default.
    // Provider acceptance is not proof of recipient delivery.
    let providerAccepted = false
    if (process.env.DGR_OUTBOUND_AUTOSEND_ENABLED === 'true' &&
        process.env.RESEND_API_KEY && p.contact_email) {
      const [subjectLine, ...bodyParts] = messages.email.split('\n\n')
      const subject = subjectLine.replace('Objet: ', '')
      const providerResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Karim Saadi — KOST GROUP <karim@dgr.kostacademy.com>',
          to: [p.contact_email],
          subject,
          text: bodyParts.join('\n\n'),
          reply_to: 'kostgroupe@gmail.com',
        }),
      })
      if (!providerResponse.ok) {
        console.error('[agents/followup] provider refused request; HTTP status:', providerResponse.status)
        results.push({ id: p.id, company: p.company_name, daysSince, status: 'provider_rejected' })
        continue
      }
      providerAccepted = true
      acceptedByProvider++
    }

    if (providerAccepted) {
      // Do not write "sent" or "delivered": only provider acceptance is known.
      const { error } = await supabase.from('company_prospects').update({
        notes: `Relance J+${daysSince} — acceptée par le fournisseur email, livraison non confirmée — ${new Date().toLocaleDateString('fr-FR')}`,
        updated_at: new Date().toISOString(),
      }).eq('id', p.id)
      if (error) console.error('[agents/followup] CRM note update failed')
    }

    results.push({
      id: p.id,
      company: p.company_name,
      daysSince,
      status: providerAccepted ? 'accepted_by_provider' : 'draft_only',
      ...messages,
    })
  }

  return { drafted: results.length, acceptedByProvider, results }
}

export async function POST() {
  after(runFollowupAgent)
  return NextResponse.json({ status: 'started', message: 'Agent relance lancé en arrière-plan' })
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  after(runFollowupAgent)
  return NextResponse.json({ status: 'started' })
}
