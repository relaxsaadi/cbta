import { NextRequest, NextResponse, after } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const APIFY_TOKEN = process.env.APIFY_API_TOKEN!
const BASE = 'https://api.apify.com/v2'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

const AFRICA_COUNTRIES = [
  { name: 'Morocco', code: 'MA', label: 'Maroc' },
  { name: 'Tunisia', code: 'TN', label: 'Tunisie' },
  { name: 'Senegal', code: 'SN', label: 'Sénégal' },
  { name: "Cote d'Ivoire", code: 'CI', label: "Côte d'Ivoire" },
  { name: 'Cameroon', code: 'CM', label: 'Cameroun' },
  { name: 'Gabon', code: 'GA', label: 'Gabon' },
  { name: 'Mali', code: 'ML', label: 'Mali' },
]

const SECTOR_SEARCHES = [
  { sector: 'airline', deal: 150000, industries: ['Airlines and Aviation'] },
  { sector: 'freight_forwarder', deal: 37500, industries: ['Logistics and Supply Chain', 'Import and Export', 'Transportation/Trucking/Railroad'] },
  { sector: 'ground_handler', deal: 37500, industries: ['Airlines and Aviation', 'Aviation & Aerospace'] },
  { sector: 'oil_gas', deal: 100000, industries: ['Oil & Energy', 'Oil and Gas'] },
  { sector: 'courier', deal: 25000, industries: ['Package/Freight Delivery', 'Logistics and Supply Chain'] },
  { sector: 'pharma', deal: 37500, industries: ['Pharmaceuticals', 'Hospital & Health Care'] },
]

async function searchLeadsForCountry(
  industries: string[],
  country: string,
  limit = 15
): Promise<Record<string, unknown>[]> {
  const url = `${BASE}/acts/pipelinelabs~leads-finder-with-emails-apollo-lusha-zoominfo/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=120&memory=1024`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyIndustryIncludes: industries,
      personLocationCountryIncludes: [country],
      seniorityIncludes: ['c_suite', 'vp', 'director', 'manager', 'senior'],
      totalResults: limit,
    }),
    signal: AbortSignal.timeout(130000),
  })
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data.filter(r => r.fullName && r.companyName) : []
}

async function runAfricaScan() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: existing } = await supabase.from('company_prospects').select('company_name')
  const existingNames = new Set(
    (existing || []).map((r: { company_name: string }) => r.company_name.toLowerCase())
  )

  let added = 0

  for (const country of AFRICA_COUNTRIES) {
    for (const { sector, deal, industries } of SECTOR_SEARCHES) {
      const leads = await searchLeadsForCountry(industries, country.name, 15)

      const companiesMap = new Map<string, Record<string, unknown>>()
      for (const lead of leads) {
        const companyName = ((lead.companyName as string) || '').trim()
        if (!companyName || companyName.length < 2) continue
        if (existingNames.has(companyName.toLowerCase())) continue
        if (!companiesMap.has(companyName)) companiesMap.set(companyName, lead)
      }

      for (const [companyName, lead] of companiesMap) {
        const linkedinUrl = lead.linkedinUrl
          ? `https://www.linkedin.com/in/${(lead.linkedinUrl as string).replace(/^.*\/in\//, '').replace(/\/$/, '')}/`
          : null

        const { error } = await supabase.from('company_prospects').insert({
          company_name: companyName,
          sector,
          country: country.label,
          city: (lead.personCity as string) || (lead.companyCity as string) || country.label,
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
          notes: `Scan Afrique ${country.label} — ${new Date().toLocaleDateString('fr-FR')} — ${(lead.emailStatus as string) || ''}`,
        })

        if (!error) {
          added++
          existingNames.add(companyName.toLowerCase())
        }
      }
    }
  }

  return { added }
}

export async function POST() {
  after(runAfricaScan)
  return NextResponse.json({ status: 'started', message: 'Scan Afrique lancé en arrière-plan (7 pays × 6 secteurs)' })
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  after(runAfricaScan)
  return NextResponse.json({ status: 'started' })
}
