import { NextRequest, NextResponse } from 'next/server'

const APOLLO_KEY = process.env.APOLLO_API_KEY!
const GHL_TOKEN = process.env.GHL_TOKEN!
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID!

// All industries requiring IATA DGR/CBTA by regulation
const DGR_TITLES: Record<string, string[]> = {
  oil_gas:           ['HSE Manager', 'QHSE Manager', 'Logistics Manager', 'Supply Chain Manager', 'Safety Manager', 'Dangerous Goods Manager'],
  freight_forwarder: ['Freight Manager', 'Logistics Director', 'Cargo Manager', 'Compliance Manager', 'Operations Manager'],
  airline:           ['Cargo Manager', 'Ground Operations Manager', 'Safety Manager', 'DGR Coordinator', 'Station Manager'],
  ground_handler:    ['Ground Operations Manager', 'Station Manager', 'Cargo Supervisor', 'Ramp Manager', 'DGR Coordinator', 'Safety Manager'],
  pharma:            ['Regulatory Affairs Manager', 'HSE Manager', 'Logistics Manager', 'Quality Manager', 'Supply Chain Director'],
  chemical:          ['HSE Director', 'Safety Manager', 'Transport Manager', 'Regulatory Manager'],
  mining:            ['HSE Manager', 'Safety Manager', 'Explosives Manager', 'Operations Manager', 'Logistics Manager'],
  medical:           ['Logistics Manager', 'HSE Manager', 'Quality Manager', 'Transport Coordinator', 'Hospital Director'],
  courier:           ['Operations Manager', 'Station Manager', 'DGR Coordinator', 'Compliance Manager', 'Hub Manager'],
  all:               ['HSE Manager', 'QHSE Manager', 'Logistics Manager', 'Cargo Manager', 'Safety Manager', 'Dangerous Goods', 'DGR Coordinator'],
}

const SECTOR_INDUSTRIES: Record<string, string[]> = {
  oil_gas:           ['oil & energy', 'oil and gas', 'mining & metals'],
  freight_forwarder: ['logistics and supply chain', 'transportation/trucking/railroad', 'warehousing'],
  airline:           ['airlines/aviation', 'transportation/trucking/railroad'],
  ground_handler:    ['airlines/aviation', 'transportation/trucking/railroad'],
  pharma:            ['pharmaceuticals', 'medical devices', 'biotechnology'],
  chemical:          ['chemicals', 'plastics'],
  mining:            ['mining & metals', 'oil and gas'],
  medical:           ['hospital & health care', 'medical devices', 'pharmaceuticals'],
  courier:           ['logistics and supply chain', 'transportation/trucking/railroad'],
  all:               ['oil & energy', 'logistics and supply chain', 'airlines/aviation', 'pharmaceuticals', 'chemicals'],
}

type ApolloPerson = {
  id: string
  first_name: string
  last_name?: string
  last_name_obfuscated?: string
  title?: string
  email?: string
  has_email?: boolean
  phone_numbers?: Array<{ raw_number: string }>
  linkedin_url?: string
  organization?: { name?: string; website_url?: string }
}

async function searchApolloContacts(sector: string, page: number, perPage: number): Promise<{ people: ApolloPerson[]; total: number }> {
  const titles = DGR_TITLES[sector] || DGR_TITLES.all
  const industries = SECTOR_INDUSTRIES[sector] || SECTOR_INDUSTRIES.all

  const body = {
    person_titles: titles,
    person_locations: ['Algeria'],
    q_organization_keyword_tags: industries,
    per_page: perPage,
    page,
  }

  const res = await fetch('https://api.apollo.io/api/v1/mixed_people/api_search', {
    method: 'POST',
    headers: { 'X-Api-Key': APOLLO_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) return { people: [], total: 0 }
  const data = await res.json()
  return {
    people: (data.people || []) as ApolloPerson[],
    total: data.pagination?.total_entries || 0,
  }
}

async function revealEmail(personId: string): Promise<string | null> {
  const res = await fetch('https://api.apollo.io/api/v1/people/bulk_match', {
    method: 'POST',
    headers: { 'X-Api-Key': APOLLO_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ reveal_personal_emails: false, details: [{ id: personId }] }),
  })
  if (!res.ok) return null
  const data = await res.json()
  return data?.matches?.[0]?.email || null
}

async function pushToGHL(person: ApolloPerson, email: string | null, sector: string): Promise<string | null> {
  if (!GHL_TOKEN || !GHL_LOCATION_ID) return null

  const firstName = person.first_name || ''
  const lastName = person.last_name || person.last_name_obfuscated?.replace(/\*/g, '') || ''
  if (!firstName && !lastName) return null

  const payload: Record<string, unknown> = {
    locationId: GHL_LOCATION_ID,
    firstName,
    lastName,
    email: email || undefined,
    phone: person.phone_numbers?.[0]?.raw_number || undefined,
    companyName: person.organization?.name || '',
    tags: ['apollo', 'dgr-prospect', `secteur-${sector}`, ...(email ? [] : ['sans-email'])],
    source: 'Apollo-API',
  }

  const res = await fetch('https://services.leadconnectorhq.com/contacts/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GHL_TOKEN}`,
      'Content-Type': 'application/json',
      Version: '2021-07-28',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    if (res.status === 422 && body.includes('contact')) return 'duplicate'
    return null
  }

  const result = await res.json()
  const contactId = result?.contact?.id
  if (!contactId) return null

  // Store title + LinkedIn as a note
  const noteLines = [
    person.title ? `Poste: ${person.title}` : null,
    person.linkedin_url ? `LinkedIn: ${person.linkedin_url}` : null,
    person.organization?.website_url ? `Site: ${person.organization.website_url}` : null,
    `Source: Apollo.io — Secteur ${sector}`,
  ].filter(Boolean)
  await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GHL_TOKEN}`,
      'Content-Type': 'application/json',
      Version: '2021-07-28',
    },
    body: JSON.stringify({ userId: contactId, body: noteLines.join('\n') }),
  }).catch(() => null)

  return contactId
}

export async function POST(req: NextRequest) {
  if (!APOLLO_KEY) {
    return NextResponse.json({ error: 'APOLLO_API_KEY not configured' }, { status: 500 })
  }

  const body = await req.json().catch(() => ({}))
  const sector = (body.sector as string) || 'all'
  const limit = Math.min(Math.max(Number(body.limit) || 25, 10), 100)
  const revealEmails = body.reveal_emails !== false

  const { people, total } = await searchApolloContacts(sector, 1, limit)
  const withEmail = people.filter(p => p.has_email)

  const results: Array<{
    name: string
    title: string
    company: string
    email: string | null
    linkedin: string | null
    ghl_id: string | null
    status: string
  }> = []

  for (const person of people) {
    let email: string | null = person.email || null

    if (!email && person.has_email && revealEmails) {
      email = await revealEmail(person.id)
    }

    const ghlId = await pushToGHL(person, email, sector)

    const firstName = person.first_name || ''
    const lastName = person.last_name || person.last_name_obfuscated?.replace(/\*/g, '') || ''

    results.push({
      name: `${firstName} ${lastName}`.trim(),
      title: person.title || '',
      company: person.organization?.name || '',
      email,
      linkedin: person.linkedin_url || null,
      ghl_id: ghlId,
      status: ghlId === 'duplicate' ? 'duplicate' : ghlId ? 'pushed' : email ? 'ghl_error' : 'no_email',
    })
  }

  const pushed = results.filter(r => r.status === 'pushed').length
  const duplicates = results.filter(r => r.status === 'duplicate').length
  const creditsUsed = results.filter(r => r.email).length

  return NextResponse.json({
    sector,
    apollo_total_available: total,
    total_found: people.length,
    with_email: withEmail.length,
    credits_used: creditsUsed,
    pushed,
    duplicates,
    contacts: results,
  })
}
