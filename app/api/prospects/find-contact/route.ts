import { NextRequest, NextResponse, after } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const APIFY_TOKEN = process.env.APIFY_API_TOKEN!
const BASE = 'https://api.apify.com/v2'
const SENIORITY_TARGETS = ['c_suite', 'vp', 'director', 'manager', 'owner', 'partner']

const SECTOR_TITLE_FILTERS: Record<string, string[]> = {
  airline: [
    'formation', 'training', 'dgr', 'dangerous goods', 'cargo', 'safety', 'sécurité',
    'qualité', 'quality', 'compliance', 'opérations', 'operations', 'ground',
    'responsable formation', 'learning', 'rh', 'human resources',
    'rdf', 'rdfe', 'responsable de formation exploitation',
  ],
  ground_handler: [
    'formation', 'training', 'dgr', 'dangerous goods', 'safety', 'sécurité', 'hse',
    'qualité', 'quality', 'compliance', 'ground', 'ramp', 'opérations',
    'responsable formation', 'responsable sécurité', 'directeur général', 'general manager',
  ],
  freight_forwarder: [
    'formation', 'training', 'dgr', 'dangerous goods', 'safety', 'sécurité', 'hse',
    'qualité', 'quality', 'compliance', 'export', 'freight', 'transport',
    'responsable formation', 'responsable qualité', 'responsable export',
  ],
  oil_gas: [
    'hse', 'safety', 'sécurité', 'formation', 'training', 'dgr', 'dangerous goods',
    'qualité', 'quality', 'compliance', 'logistique', 'supply chain', 'transport',
    'responsable hse', 'responsable formation', 'responsable sécurité',
  ],
  courier: [
    'formation', 'training', 'dgr', 'dangerous goods', 'safety', 'sécurité', 'hse',
    'qualité', 'quality', 'compliance', 'opérations', 'country director',
    'responsable formation', 'responsable sécurité',
  ],
  pharma: [
    'formation', 'training', 'dgr', 'dangerous goods', 'regulatory', 'affaires réglementaires',
    'safety', 'sécurité', 'hse', 'qualité', 'quality', 'compliance', 'supply chain', 'logistique',
    'responsable formation', 'responsable qualité', 'responsable réglementaire',
  ],
  airport_authority: [
    'formation', 'training', 'dgr', 'dangerous goods', 'safety', 'sécurité', 'hse',
    'qualité', 'quality', 'sûreté', 'opérations', 'directeur général', 'general manager',
    'responsable formation', 'responsable sécurité', 'responsable sûreté',
  ],
  chemical: [
    'hse', 'safety', 'sécurité', 'formation', 'training', 'dgr', 'dangerous goods',
    'qualité', 'quality', 'compliance', 'logistique', 'transport', 'supply chain',
    'responsable hse', 'responsable formation', 'responsable sécurité',
  ],
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function findLeads(companyName: string, limit = 10): Promise<Record<string, unknown>[]> {
  const url = `${BASE}/acts/pipelinelabs~leads-finder-with-emails-apollo-lusha-zoominfo/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=90&memory=1024`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyNameIncludes: [companyName],
      seniorityIncludes: SENIORITY_TARGETS,
      totalResults: limit,
    }),
    signal: AbortSignal.timeout(100000),
  })
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data.filter((r: Record<string, unknown>) => r.fullName) : []
}

// Keywords that identify training/safety decision-makers — these are the actual buyers for DGR formation
const TRAINING_DECISION_MAKER_KEYWORDS = [
  'formation', 'training', 'hse', 'safety', 'sécurité sécurité', 'sûreté',
  'dangerous goods', 'dgr', 'qualité', 'quality', 'compliance', 'réglementaire',
  'regulatory', 'learning', 'développement rh', 'people development',
]

function pickBestContact(leads: Record<string, unknown>[], sector: string) {
  if (!leads.length) return null
  const titlePriority = SECTOR_TITLE_FILTERS[sector] || []
  const scored = leads.map(l => {
    const title = ((l.title as string) || '').toLowerCase()
    const seniority = (l.seniority as string) || ''
    let score = 0

    // Training/HSE/formation decision-makers get highest bonus — they ARE the buyers
    const isTrainingBuyer = TRAINING_DECISION_MAKER_KEYWORDS.some(kw => title.includes(kw))
    if (isTrainingBuyer) score += 15

    // Sector-specific title match
    for (const kw of titlePriority) { if (title.includes(kw)) { score += 8; break } }

    // Seniority — manager-level training/HSE > c-suite with no formation relevance
    if (seniority === 'c_suite') score += (isTrainingBuyer ? 6 : 4)
    else if (seniority === 'vp') score += 5
    else if (seniority === 'director') score += 5
    else if (seniority === 'manager' || seniority === 'senior') score += 4

    // Contact quality
    if (l.emailStatus === 'verified') score += 4
    else if (l.emailStatus === 'pattern_match') score += 2
    if (l.phone) score += 2
    if (l.linkedinUrl) score += 1
    return { lead: l, score }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored[0].lead
}

function buildLinkedInUrl(raw: unknown): string | null {
  if (!raw) return null
  const s = raw as string
  const m = s.match(/linkedin\.com\/in\/([^/?#]+)/i)
  return m ? `https://www.linkedin.com/in/${m[1].replace(/\/$/, '')}/` : null
}

async function enrichSingle(prospect: Record<string, unknown>) {
  const supabase = getSupabase()
  const leads = await findLeads(prospect.company_name as string, 10)
  const best = pickBestContact(leads, prospect.sector as string)
  if (!best) return { found: false }

  const update = {
    decision_maker_name: best.fullName as string,
    decision_maker_title: ((best.title as string) || (best.position as string) || '').trim(),
    decision_maker_linkedin: buildLinkedInUrl(best.linkedinUrl),
    contact_email: (best.email as string) || null,
    contact_phone: (best.phone as string) || null,
    updated_at: new Date().toISOString(),
  }
  await supabase.from('company_prospects').update(update).eq('id', prospect.id as string)
  return { found: true, ...update, email_status: best.emailStatus, all_leads: leads.length }
}

async function enrichAll() {
  const supabase = getSupabase()
  const { data: prospects } = await supabase
    .from('company_prospects')
    .select('*')
    .is('contact_email', null) // enrich those without email
  if (!prospects?.length) return

  for (const p of prospects) {
    await enrichSingle(p)
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Batch enrichment — runs in background on Vercel, browser can close
  if (body.enrichAll) {
    after(enrichAll)
    return NextResponse.json({ status: 'started', message: `Enrichissement lancé en arrière-plan` })
  }

  // Single prospect — runs inline, returns result immediately
  const result = await enrichSingle(body.prospect)
  return NextResponse.json(result)
}
