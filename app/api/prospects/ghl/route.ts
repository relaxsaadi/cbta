import { NextResponse } from 'next/server'

const GHL_TOKEN = process.env.GHL_TOKEN!
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID!

const SECTOR_LABELS: Record<string, string> = {
  oil_gas:           '⛽ Pétrole & Gaz',
  freight_forwarder: '📦 Transitaire',
  airline:           '✈️ Aérien',
  ground_handler:    '🔧 Ground handler',
  pharma:            '💊 Pharma',
  chemical:          '🧪 Chimie',
  mining:            '⛏️ Mines & Explosifs',
  medical:           '🏥 Médical',
  courier:           '🚚 Courrier express',
  all:               '🌍 Général',
}

type GHLRawContact = {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  companyName?: string
  tags?: string[]
  source?: string
  jobTitle?: string
  dateAdded?: string
}

function extractCountry(tags: string[]): string {
  const lower = tags.map(t => (typeof t === 'string' ? t : '').toLowerCase())
  const paysTag = lower.find(t => t.startsWith('pays-'))
  if (paysTag) return paysTag.replace('pays-', '')
  // Legacy: apollo contacts have no pays tag → Algeria (default market)
  if (lower.includes('apollo')) return 'algerie'
  return ''
}

function extractSector(tags: string[]): string {
  const lower = tags.map(t => (typeof t === 'string' ? t : '').toLowerCase())

  // New format: secteur-oil_gas
  const secteurTag = lower.find(t => t.startsWith('secteur-'))
  if (secteurTag) {
    const s = secteurTag.replace('secteur-', '')
    if (s.includes('pétrole') || s.includes('gaz') || s === 'oil_gas') return 'oil_gas'
    if (s.includes('cargo') || s.includes('aérien') || s === 'airline') return 'airline'
    if (s.includes('transit') || s === 'freight_forwarder') return 'freight_forwarder'
    if (s === 'pharma') return 'pharma'
    if (s.includes('chimi') || s === 'chemical') return 'chemical'
    if (s.includes('mine') || s === 'mining') return 'mining'
    if (s.includes('médic') || s === 'medical') return 'medical'
    if (s.includes('courier') || s.includes('express')) return 'courier'
    if (s === 'ground_handler' || s.includes('ground')) return 'ground_handler'
    return 'all'
  }

  // Legacy format: direct tag without prefix
  if (lower.includes('pharma')) return 'pharma'
  if (lower.includes('pétrole-gaz') || lower.includes('petrole-gaz')) return 'oil_gas'
  if (lower.includes('ground handler') || lower.includes('ground_handler')) return 'ground_handler'
  if (lower.includes('airline') || lower.includes('aérien')) return 'airline'
  if (lower.includes('freight_forwarder') || lower.includes('transitaire')) return 'freight_forwarder'
  if (lower.includes('chemical') || lower.includes('chimie')) return 'chemical'
  return 'all'
}

export async function GET() {
  if (!GHL_TOKEN || !GHL_LOCATION_ID) {
    return NextResponse.json({ error: 'GHL not configured' }, { status: 500 })
  }

  const contacts: GHLRawContact[] = []
  const seenIds = new Set<string>()
  let startAfterId: string | null = null
  let page = 0
  const MAX_PAGES = 20

  while (page < MAX_PAGES) {
    const url = new URL('https://services.leadconnectorhq.com/contacts/')
    url.searchParams.set('locationId', GHL_LOCATION_ID)
    url.searchParams.set('limit', '100')
    if (startAfterId) url.searchParams.set('startAfterId', startAfterId)

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${GHL_TOKEN}`,
        Version: '2021-07-28',
        Accept: 'application/json',
      },
    })

    if (!res.ok) break
    const data = await res.json()
    const batch: GHLRawContact[] = data?.contacts || []
    if (!batch.length) break

    // Stop if pagination is stuck (same IDs as before)
    const newInBatch = batch.filter(c => !seenIds.has(c.id))
    if (newInBatch.length === 0) break
    newInBatch.forEach(c => seenIds.add(c.id))

    // Case-insensitive tag filter for dgr-prospect
    const dgr = newInBatch.filter((c: GHLRawContact) =>
      c.tags?.some((t: string) => t.toLowerCase() === 'dgr-prospect')
    )
    contacts.push(...dgr)

    if (batch.length < 100) break
    startAfterId = batch[batch.length - 1]?.id || null
    if (!startAfterId) break
    page++
  }

  const COUNTRY_LABELS: Record<string, string> = {
    algerie:   '🇩🇿 Algérie',
    maroc:     '🇲🇦 Maroc',
    senegal:   '🇸🇳 Sénégal',
    cameroun:  '🇨🇲 Cameroun',
    'cote-ivoire': '🇨🇮 Côte d\'Ivoire',
    tunisie:   '🇹🇳 Tunisie',
  }

  const mapped = contacts.map((c: GHLRawContact) => {
    const tags = (c.tags || []).map((t: string) => t || '')
    const sector = extractSector(tags)
    const country = extractCountry(tags)
    return {
      id: c.id,
      name: [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Inconnu',
      firstName: c.firstName || '',
      lastName: c.lastName || '',
      company: c.companyName || '',
      email: c.email || null,
      phone: c.phone || null,
      title: c.jobTitle || null,
      sector,
      sectorLabel: SECTOR_LABELS[sector] || '🌍 Général',
      country,
      countryLabel: COUNTRY_LABELS[country] || (country ? `🌍 ${country}` : ''),
      source: c.source || 'Apollo',
      tags,
      createdAt: c.dateAdded || '',
    }
  })

  mapped.sort((a, b) => {
    if (a.email && !b.email) return -1
    if (!a.email && b.email) return 1
    return a.company.localeCompare(b.company)
  })

  return NextResponse.json({
    total: mapped.length,
    with_email: mapped.filter(c => c.email).length,
    contacts: mapped,
  })
}
