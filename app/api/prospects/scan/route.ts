import { NextRequest, NextResponse, after } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const APIFY_TOKEN = process.env.APIFY_API_TOKEN!
const BASE = 'https://api.apify.com/v2'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

const SECTOR_SEARCHES = [
  {
    sector: 'airline',
    deal: 200000,
    industries: ['Airlines and Aviation'],
  },
  {
    sector: 'ground_handler',
    deal: 37500,
    industries: ['Airlines and Aviation', 'Aviation & Aerospace'],
    titleKeywords: ['ground', 'handling', 'handler', 'ramp'],
  },
  {
    sector: 'freight_forwarder',
    deal: 37500,
    industries: ['Logistics and Supply Chain', 'Transportation/Trucking/Railroad', 'Import and Export'],
  },
  {
    sector: 'oil_gas',
    deal: 125000,
    industries: ['Oil & Energy', 'Oil and Gas'],
  },
  {
    sector: 'courier',
    deal: 30000,
    industries: ['Package/Freight Delivery', 'Logistics and Supply Chain'],
    titleKeywords: ['express', 'courier', 'delivery'],
  },
  {
    sector: 'pharma',
    deal: 37500,
    industries: ['Pharmaceuticals', 'Hospital & Health Care', 'Biotechnology'],
  },
  {
    sector: 'airport_authority',
    deal: 75000,
    industries: ['Airlines and Aviation', 'Government Administration'],
    titleKeywords: ['airport', 'aéroport', 'aeroport', 'ONDA', 'EGSA'],
  },
]

async function searchLeads(industries: string[], limit = 20): Promise<Record<string, unknown>[]> {
  const url = `${BASE}/acts/pipelinelabs~leads-finder-with-emails-apollo-lusha-zoominfo/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=120&memory=1024`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyIndustryIncludes: industries,
      personLocationCountryIncludes: ['Algeria'],
      seniorityIncludes: ['c_suite', 'vp', 'director', 'manager', 'senior'],
      totalResults: limit,
    }),
    signal: AbortSignal.timeout(130000),
  })

  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data.filter(r => r.fullName && r.companyName) : []
}

async function runScan() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: existing } = await supabase.from('company_prospects').select('company_name')
  const existingNames = new Set((existing || []).map((r: { company_name: string }) => r.company_name.toLowerCase()))

  let added = 0
  const results: string[] = []

  for (const { sector, deal, industries, titleKeywords } of SECTOR_SEARCHES) {
    const leads = await searchLeads(industries, 30)

    // Group by company
    const companiesMap = new Map<string, Record<string, unknown>>()

    for (const lead of leads) {
      const companyName = (lead.companyName as string || '').trim()
      if (!companyName || companyName.length < 2) continue

      // Filter by title keywords if specified
      if (titleKeywords) {
        const title = ((lead.title as string) || '').toLowerCase()
        const company = companyName.toLowerCase()
        const matches = titleKeywords.some(kw => title.includes(kw) || company.includes(kw))
        if (!matches) continue
      }

      // Skip already known companies
      if (existingNames.has(companyName.toLowerCase())) continue

      // Keep best contact per company (prefer director+)
      if (!companiesMap.has(companyName)) {
        companiesMap.set(companyName, lead)
      }
    }

    for (const [companyName, lead] of companiesMap) {
      const linkedinUrl = lead.linkedinUrl
        ? `https://www.linkedin.com/in/${(lead.linkedinUrl as string).replace(/^.*\/in\//, '').replace(/\/$/, '')}/`
        : null

      const { error } = await supabase.from('company_prospects').insert({
        company_name: companyName,
        sector,
        country: 'Algérie',
        city: (lead.personCity as string) || (lead.companyCity as string) || 'Alger',
        website: lead.companyDomain ? `https://${lead.companyDomain}` : null,
        estimated_staff: (lead.companySize as number) || null,
        deal_value_eur: deal,
        decision_maker_name: lead.fullName as string,
        decision_maker_title: (lead.title as string) || (lead.position as string) || '',
        decision_maker_linkedin: linkedinUrl,
        contact_email: (lead.email as string) || null,
        contact_phone: (lead.phone as string) || null,
        score: 7,
        status: 'found',
        notes: `Scan automatique ${new Date().toLocaleDateString('fr-FR')} — ${(lead.emailStatus as string) || ''}`,
      })

      if (!error) {
        added++
        existingNames.add(companyName.toLowerCase())
        results.push(`+ ${companyName} (${sector}) — ${lead.fullName} <${lead.email || 'pas d\'email'}>`)
      }
    }
  }

  return { added, results }
}

// GET — cron Vercel (nécessite secret)
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Répond immédiatement — le scan continue en background même si le navigateur ferme
  after(runScan)
  return NextResponse.json({ status: 'started', message: 'Scan lancé en arrière-plan' })
}

// POST — appelé depuis le dashboard
export async function POST() {
  // Répond immédiatement — le scan tourne sur les serveurs Vercel indépendamment du navigateur
  after(runScan)
  return NextResponse.json({ status: 'started', message: 'Scan lancé en arrière-plan' })
}
