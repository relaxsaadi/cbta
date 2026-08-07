import { NextRequest, NextResponse, after } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

const DAYS_LEFT = Math.max(0, Math.ceil((new Date('2026-09-30').getTime() - Date.now()) / 86400000))

async function generateFollowup(prospect: Record<string, unknown>, daysSinceContact: number): Promise<{ email: string; linkedin: string; whatsapp: string }> {
  const angles = [
    `Il reste ${DAYS_LEFT} jours avant la deadline IATA — les places de la session août se remplissent.`,
    `Air Algérie vient de certifier 12 agents avec KOST. Votre équipe est-elle à jour ?`,
    `Un incident DGR non déclaré = suspension immédiate par l'IATA. La certification protège votre licence.`,
    `Dernière chance session août — après le 15 août, uniquement session septembre, plus proche du deadline.`,
  ]
  const angle = angles[Math.min(Math.floor(daysSinceContact / 3), angles.length - 1)]

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

Format exact:
EMAIL_OBJET: [objet]
EMAIL_CORPS: [corps]
LINKEDIN: [message]
WHATSAPP: [message]`,
      }],
    }),
  })

  const data = await res.json()
  const text: string = data.content?.[0]?.text || ''

  const extract = (key: string) => {
    const match = text.match(new RegExp(`${key}:\\s*([\\s\\S]*?)(?=\\n[A-Z_]+:|$)`))
    return match ? match[1].trim() : ''
  }

  const emailObjet = extract('EMAIL_OBJET')
  const emailCorps = extract('EMAIL_CORPS')
  return {
    email: emailObjet ? `Objet: ${emailObjet}\n\n${emailCorps}` : emailCorps,
    linkedin: extract('LINKEDIN'),
    whatsapp: extract('WHATSAPP'),
  }
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

  if (!stale?.length) return { followups: 0 }

  const results = []
  for (const p of stale) {
    const daysSince = Math.floor((now.getTime() - new Date(p.updated_at).getTime()) / 86400000)
    if (daysSince > 30) continue // Don't follow up after 30 days

    const messages = await generateFollowup(p, daysSince)

    // Send email if Resend available
    if (process.env.RESEND_API_KEY && p.contact_email) {
      const [subjectLine, ...bodyParts] = messages.email.split('\n\n')
      const subject = subjectLine.replace('Objet: ', '')
      await fetch('https://api.resend.com/emails', {
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
    }

    // Update notes with follow-up attempt
    await supabase.from('company_prospects').update({
      notes: `Relance J+${daysSince} — ${new Date().toLocaleDateString('fr-FR')}`,
      updated_at: new Date().toISOString(),
    }).eq('id', p.id)

    results.push({ id: p.id, company: p.company_name, daysSince, ...messages })
  }

  return { followups: results.length, results }
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
