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

async function generateLinkedInMessage(prospect: Record<string, unknown>): Promise<string> {
  const SECTOR_CONTEXT: Record<string, string> = {
    airline:           'opérations cargo et transport aérien',
    ground_handler:    'opérations de handling, piste et rampe',
    freight_forwarder: 'organisation d’expéditions aériennes',
    oil_gas:           'expéditions aériennes d’équipements et produits réglementés',
    courier:           'batteries lithium et marchandises réglementées',
    pharma:            'produits biologiques, cryogéniques et réglementés',
    airport_authority: 'opérations aéroportuaires et sécurité du fret',
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
Contexte métier : ${SECTOR_CONTEXT[prospect.sector as string] || 'besoin potentiel de formation DGR/CBTA'}.

Règles ABSOLUES :
- 280 caractères MAX
- Commence par le prénom uniquement
- 1 phrase personnalisée au métier
- 1 phrase proposant de vérifier le besoin DGR/CBTA avec KOST
- CTA : "Disponible cette semaine ?"
- Ne prétends pas qu'une obligation, sanction, date limite, fonction CBTA ou approbation IATA/ANAC s'applique sans preuve fournie
${SAFE_DGR_MARKETING_RULES}
Message :`,
      }],
    }),
  })
  const data = await res.json()
  const text = (data.content?.[0]?.text || '').slice(0, 280)
  assertSafeDgrMarketingCopy(text)
  return text
}

async function runLinkedInBlitz(limit = 10) {
  const supabase = getSupabase()

  const { data: prospects } = await supabase
    .from('company_prospects')
    .select('*')
    .not('decision_maker_linkedin', 'is', null)
    .in('status', ['found'])
    .in('sector', ['airline', 'ground_handler', 'freight_forwarder', 'oil_gas', 'airport_authority', 'courier'])
    .order('score', { ascending: false })
    .limit(limit)

  if (!prospects?.length) {
    const { data: fallback } = await supabase
      .from('company_prospects')
      .select('*')
      .not('decision_maker_linkedin', 'is', null)
      .eq('status', 'found')
      .order('score', { ascending: false })
      .limit(limit)

    if (!fallback?.length) return { generated: 0, prospects: [] }
    return processLinkedIn(fallback)
  }

  return processLinkedIn(prospects)
}

async function processLinkedIn(prospects: Record<string, unknown>[]) {
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
  }

  // Draft generation is not contact. Do not mutate CRM status or write an
  // "envoyé" note until a real outbound send is confirmed by the sending path.
  return { generated: results.length, prospects: results }
}

// POST — generate messages for a batch (returns results, does not auto-send)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const limit = body.limit || 10

  try {
    if (body.prospect) {
      const message = await generateLinkedInMessage(body.prospect)
      return NextResponse.json({ message, linkedin: body.prospect.decision_maker_linkedin })
    }

    const result = await runLinkedInBlitz(limit)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: 'Copie commerciale bloquée par le garde de conformité', detail: String(error) },
      { status: 422 }
    )
  }
}

// GET — background draft generation only; no message is sent and no CRM
// contact status is changed by this route.
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  after(() => runLinkedInBlitz(15))
  return NextResponse.json({ status: 'started', mode: 'draft-only' })
}
