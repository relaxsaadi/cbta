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

async function generateFollowup(prospect: Record<string, unknown>, daysSinceContact: number): Promise<{ email: string; linkedin: string; whatsapp: string }> {
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
        content: `Tu es Karim Saadi de KOST GROUP, organisme de formation DGR/CBTA.
Génère 3 brouillons de relance (${daysSinceContact}j depuis le dernier contact enregistré) pour ${prospect.decision_maker_name}, ${prospect.decision_maker_title} chez ${prospect.company_name}.

Angle : reprendre le contexte métier et proposer simplement de vérifier si un besoin DGR/CBTA existe. Ne crée aucune fausse urgence, référence client, incident, sanction, date limite, session, prix, certification, agrément ou approbation.

1. EMAIL (objet + corps, 80 mots max, ton direct non-insistant)
2. LINKEDIN (150 chars max, différent de l'email)
3. WHATSAPP (100 mots max, émojis ok, conversationnel)
${SAFE_DGR_MARKETING_RULES}
Format exact :
EMAIL_OBJET: [objet]
EMAIL_CORPS: [corps]
LINKEDIN: [message]
WHATSAPP: [message]`,
      }],
    }),
  })

  const data = await res.json()
  const text: string = data.content?.[0]?.text || ''
  assertSafeDgrMarketingCopy(text)

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
    if (daysSince > 30) continue

    try {
      const messages = await generateFollowup(p, daysSince)
      let emailSent = false

      if (process.env.RESEND_API_KEY && p.contact_email) {
        const [subjectLine, ...bodyParts] = messages.email.split('\n\n')
        const subject = subjectLine.replace('Objet: ', '')
        const response = await fetch('https://api.resend.com/emails', {
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
        emailSent = response.ok
      }

      // Draft generation is not a contact event. Only record a follow-up when
      // this route has proof that the email provider accepted the send.
      if (emailSent) {
        await supabase.from('company_prospects').update({
          notes: `Relance email J+${daysSince} envoyée — ${new Date().toLocaleDateString('fr-FR')}`,
          updated_at: new Date().toISOString(),
        }).eq('id', p.id)
      }

      results.push({ id: p.id, company: p.company_name, daysSince, emailSent, ...messages })
    } catch (error) {
      console.error('[followup] generated copy rejected or send failed', p.company_name, error)
    }
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
