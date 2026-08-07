import { NextRequest, NextResponse, after } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Green API — free tier: https://green-api.com
// Set GREENAPI_INSTANCE_ID + GREENAPI_API_TOKEN in Vercel env vars
const GREENAPI_BASE = 'https://api.green-api.com'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function greenApiUrl(method: string) {
  const id = process.env.GREENAPI_INSTANCE_ID
  const token = process.env.GREENAPI_API_TOKEN
  if (!id || !token) throw new Error('GREENAPI_INSTANCE_ID or GREENAPI_API_TOKEN missing')
  return `${GREENAPI_BASE}/waInstance${id}/${method}/${token}`
}

// Format phone for Green API — must be 213XXXXXXXXX@c.us (no +, with country code)
function formatPhone(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '')
  // If starts with 00213 or 213, keep. If 0XXXXXXXXX, prepend 213
  if (digits.startsWith('00213')) return digits.slice(2) + '@c.us'
  if (digits.startsWith('213')) return digits + '@c.us'
  if (digits.startsWith('0')) return '213' + digits.slice(1) + '@c.us'
  return digits + '@c.us'
}

async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  const chatId = formatPhone(phone)
  const res = await fetch(greenApiUrl('sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  })
  if (!res.ok) {
    const err = await res.text().catch(() => '')
    console.error('[whatsapp] send failed:', res.status, err.slice(0, 200))
    return false
  }
  return true
}

async function generateMessage(prospect: Record<string, unknown>): Promise<string> {
  const daysLeft = Math.max(0, Math.ceil((new Date('2026-09-30').getTime() - Date.now()) / 86400000))

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Tu es Karim Saadi, fondateur de KOST GROUP, 1er centre IATA CBTA certifié d'Algérie.
Écris un message WhatsApp de prospection pour ${prospect.decision_maker_name || 'le responsable'} chez ${prospect.company_name} (secteur: ${prospect.sector}).

Contraintes :
- 80 mots MAXIMUM
- Conversationnel et direct, pas commercial
- Mentionne : deadline IATA ${daysLeft}j, session août 18-22, places limitées
- 1-2 émojis max
- Pas de formule "Bonjour" classique, attaque direct sur la valeur
- Finir par une question ouverte simple
- Ne pas mettre de lien URL
- Signe : Karim, KOST GROUP (+213 542 30 53 83)

Message :`,
      }],
    }),
  })
  const data = await res.json()
  return data.content?.[0]?.text?.trim() || ''
}

async function runWhatsAppBlast(prospectIds?: string[]) {
  const supabase = getSupabase()

  // Find prospects with phone numbers not yet contacted via WhatsApp
  let query = supabase
    .from('company_prospects')
    .select('id,company_name,sector,decision_maker_name,decision_maker_phone,contact_phone,status,country')
    .not('decision_maker_phone', 'is', null)
    .order('score', { ascending: false })
    .limit(20)

  if (prospectIds?.length) {
    query = query.in('id', prospectIds)
  } else {
    query = query.in('status', ['found', 'qualified'])
  }

  const { data: prospects } = await query
  if (!prospects?.length) return { sent: 0, message: 'No prospects with phone numbers' }

  const results = []
  for (const p of prospects) {
    const phone = p.decision_maker_phone || p.contact_phone
    if (!phone) continue

    try {
      const message = await generateMessage(p)
      if (!message) continue

      const sent = await sendWhatsApp(phone, message)
      if (sent) {
        await supabase.from('company_prospects').update({
          status: 'contacted',
          notes: `WhatsApp envoyé ${new Date().toLocaleDateString('fr-FR')}`,
          updated_at: new Date().toISOString(),
        }).eq('id', p.id)
        results.push({ id: p.id, company: p.company_name, phone, sent: true })
      }
    } catch (err) {
      console.error('[whatsapp] error for', p.company_name, err)
    }

    // Delay between messages to avoid spam detection (2-3s)
    await new Promise(r => setTimeout(r, 2500))
  }

  return { sent: results.length, results }
}

// POST /api/agents/whatsapp — manual trigger with optional prospect IDs
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { prospectIds, phone, message } = body

  // Direct send mode: send a specific message to a specific number
  if (phone && message) {
    if (!process.env.GREENAPI_INSTANCE_ID) {
      return NextResponse.json({ error: 'GREENAPI not configured. Add GREENAPI_INSTANCE_ID + GREENAPI_API_TOKEN to Vercel env vars.' }, { status: 503 })
    }
    const sent = await sendWhatsApp(phone, message)
    return NextResponse.json({ sent, chatId: formatPhone(phone) })
  }

  if (!process.env.GREENAPI_INSTANCE_ID) {
    return NextResponse.json({
      error: 'Green API not configured',
      setup: 'Add GREENAPI_INSTANCE_ID and GREENAPI_API_TOKEN to Vercel env vars. Free account at green-api.com',
    }, { status: 503 })
  }

  after(() => runWhatsAppBlast(prospectIds))
  return NextResponse.json({ status: 'started', message: `Agent WhatsApp lancé pour ${prospectIds?.length || 'tous les prospects'} contacts` })
}

// GET — check Green API instance status
export async function GET() {
  if (!process.env.GREENAPI_INSTANCE_ID) {
    return NextResponse.json({
      configured: false,
      instructions: [
        '1. Créer un compte sur https://green-api.com (gratuit, 1500 messages/mois)',
        '2. Créer une instance WhatsApp et noter Instance ID + API Token',
        '3. Scanner le QR code avec votre WhatsApp',
        '4. Ajouter dans Vercel: GREENAPI_INSTANCE_ID et GREENAPI_API_TOKEN',
        '5. Revenir ici pour tester',
      ],
    })
  }

  try {
    const res = await fetch(greenApiUrl('getStateInstance'))
    const data = await res.json()
    return NextResponse.json({ configured: true, state: data })
  } catch {
    return NextResponse.json({ configured: true, state: 'error checking instance' })
  }
}
