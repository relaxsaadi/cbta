import { NextRequest, NextResponse, after } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const DAYS_LEFT = Math.max(0, Math.ceil((new Date('2026-09-30').getTime() - Date.now()) / 86400000))

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function generateLinkedInMessage(prospect: Record<string, unknown>): Promise<string> {
  const SECTOR_PAIN: Record<string, string> = {
    airline:           'tout agent cargo ou dispatcher non certifié DGR IATA expose votre compagnie à une suspension de vol',
    ground_handler:    'chaque agent piste manipulant des DGR sans certification IATA engage votre responsabilité pénale',
    freight_forwarder: 'tout transitaire expédiant des marchandises dangereuses par avion sans certification IATA risque une amende et suspension',
    oil_gas:           'les équipements et produits pétroliers classés DGR nécessitent une certification IATA obligatoire pour le transport aérien',
    courier:           'batteries lithium, marchandises réglementées : sans certification DGR IATA, votre licence express est en danger',
    pharma:            'produits biologiques et cryogéniques : l\'expédition aérienne sans certification DGR IATA engage votre conformité réglementaire',
    airport_authority: 'l\'autorité aéroportuaire est légalement responsable de toute DGR non conforme en escale',
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `Message LinkedIn InMail pour ${prospect.decision_maker_name}, ${prospect.decision_maker_title} chez ${prospect.company_name}.
Contexte: ${SECTOR_PAIN[prospect.sector as string] || 'obligation IATA DGR'}.
Il reste ${DAYS_LEFT} jours. KOST = seul centre CBTA IATA certifié Algérie.

Règles ABSOLUES:
- 280 caractères MAX (compte exactement)
- Commence par le prénom uniquement
- 1 phrase obligation légale spécifique à leur secteur
- 1 phrase KOST = solution + session août
- CTA: "Disponible cette semaine?"
- Zéro générique, zéro spam

Message:`,
      }],
    }),
  })
  const data = await res.json()
  return (data.content?.[0]?.text || '').slice(0, 280)
}

async function runLinkedInBlitz(limit = 10) {
  const supabase = getSupabase()

  // Priority: airlines first, then ground handlers, freight, oil — sectors with real DGR obligations
  const { data: prospects } = await supabase
    .from('company_prospects')
    .select('*')
    .not('decision_maker_linkedin', 'is', null)
    .in('status', ['found'])
    .in('sector', ['airline', 'ground_handler', 'freight_forwarder', 'oil_gas', 'airport_authority', 'courier'])
    .order('score', { ascending: false })
    .limit(limit)

  if (!prospects?.length) {
    // Fallback: any sector with LinkedIn
    const { data: fallback } = await supabase
      .from('company_prospects')
      .select('*')
      .not('decision_maker_linkedin', 'is', null)
      .eq('status', 'found')
      .order('score', { ascending: false })
      .limit(limit)

    if (!fallback?.length) return { messaged: 0, prospects: [] }

    return processLinkedIn(fallback, supabase)
  }

  return processLinkedIn(prospects, supabase)
}

async function processLinkedIn(prospects: Record<string, unknown>[], supabase: ReturnType<typeof getSupabase>) {
  const results = []

  for (const p of prospects) {
    const message = await generateLinkedInMessage(p)
    results.push({
      id: p.id,
      company: p.company_name,
      contact: p.decision_maker_name,
      linkedin: p.decision_maker_linkedin,
      message,
    })
    // Mark as contacted
    await supabase.from('company_prospects')
      .update({ status: 'contacted', notes: `LinkedIn message envoyé ${new Date().toLocaleDateString('fr-FR')}`, updated_at: new Date().toISOString() })
      .eq('id', p.id as string)
  }

  return { messaged: results.length, prospects: results }
}

// POST — generate messages for a batch (returns results, doesn't auto-send — user copies+sends)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const limit = body.limit || 10

  // Single prospect
  if (body.prospect) {
    const message = await generateLinkedInMessage(body.prospect)
    return NextResponse.json({ message, linkedin: body.prospect.decision_maker_linkedin })
  }

  // Batch — generate messages, return them for manual sending
  const result = await runLinkedInBlitz(limit)
  return NextResponse.json(result)
}

// GET — background daily run
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  after(() => runLinkedInBlitz(15))
  return NextResponse.json({ status: 'started' })
}
