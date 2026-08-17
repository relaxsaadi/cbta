const APIFY_TOKEN = process.env.APIFY_API_TOKEN!
const BASE = 'https://api.apify.com/v2'
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY!

function actorPath(id: string) { return id.replace('/', '~') }

async function runSync(actorId: string, input: Record<string, unknown>, timeoutSecs = 120): Promise<unknown[]> {
  const url = `${BASE}/acts/${actorPath(actorId)}/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=${timeoutSecs}&memory=512`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout((timeoutSecs + 10) * 1000),
  })
  if (!res.ok) throw new Error(`Apify ${actorId} ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export const LINKEDIN_SECTORS = [
  { value: 'airline',   label: '✈️ Compagnie aérienne',  keywords: 'directeur cargo opérations compagnie aérienne IATA' },
  { value: 'freight',   label: '📦 Freight forwarder',   keywords: 'freight forwarder transitaire fret aérien DGR marchandises dangereuses' },
  { value: 'handler',   label: '🔧 Ground handler',      keywords: 'ground handling cargo aéroport manutention DGR' },
  { value: 'oil_gas',   label: '⛽ Pétrole & Gaz',       keywords: 'responsable logistique pétrole gaz transport aérien dangereux' },
  { value: 'courier',   label: '🚚 Courrier express',    keywords: 'DHL FedEx UPS dangerous goods manager DGR' },
  { value: 'pompier',   label: '🚒 Pompiers aéroport',   keywords: 'chef pompiers aéroport sécurité incendie aéronautique DGR' },
]

export const LINKEDIN_COUNTRIES = [
  'Algérie', 'Maroc', 'Tunisie', 'Sénégal', "Côte d'Ivoire", 'Cameroun', 'Gabon', 'Mali',
]

const COUNTRY_EN: Record<string, string> = {
  'Algérie': 'Algeria', 'Maroc': 'Morocco', 'Tunisie': 'Tunisia',
  'Sénégal': 'Senegal', "Côte d'Ivoire": 'Ivory Coast',
  'Cameroun': 'Cameroon', 'Gabon': 'Gabon', 'Mali': 'Mali',
}

export interface LinkedInProspect {
  linkedin_username: string
  full_name: string
  title: string
  company: string
  country: string
  sector: string
  score: number
  profile_url: string
  connection_status: 'found'
  notes?: string
}

function extractUsername(url: string): string {
  const m = url.match(/linkedin\.com\/in\/([^/?#]+)/i)
  return m ? m[1].replace(/\/$/, '') : ''
}

function isNonProfile(url: string): boolean {
  if (!url.includes('linkedin.com/in/')) return true
  if (url.includes('/posts/') || url.includes('/activity-') || url.includes('/pulse/')) return true
  return false
}

function extractName(title: string): string {
  return title
    .replace(/ - LinkedIn$/, '')
    .replace(/ \| LinkedIn$/, '')
    .replace(/'s Post$/, '')
    .replace(/ on LinkedIn.*$/, '')
    .replace(/^LinkedIn.*?:\s*/, '')
    .trim()
}

function detectCountry(text: string): string {
  const t = text.toLowerCase()
  const map: Record<string, string> = {
    'algérie': 'Algérie', 'algeria': 'Algérie', 'alger': 'Algérie',
    'maroc': 'Maroc', 'morocco': 'Maroc', 'casablanca': 'Maroc', 'rabat': 'Maroc',
    'tunisie': 'Tunisie', 'tunisia': 'Tunisie', 'tunis': 'Tunisie',
    'sénégal': 'Sénégal', 'senegal': 'Sénégal', 'dakar': 'Sénégal',
    "côte d'ivoire": "Côte d'Ivoire", 'ivory coast': "Côte d'Ivoire", 'abidjan': "Côte d'Ivoire",
    'cameroun': 'Cameroun', 'cameroon': 'Cameroun', 'douala': 'Cameroun',
    'gabon': 'Gabon', 'libreville': 'Gabon',
    'mali': 'Mali', 'bamako': 'Mali',
  }
  for (const [k, v] of Object.entries(map)) {
    if (t.includes(k)) return v
  }
  return 'International'
}

async function scoreProspect(name: string, title: string, company: string, snippet: string): Promise<{ score: number; notes: string }> {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 80,
        messages: [{
          role: 'user',
          content: `Score this LinkedIn prospect for KOST GROUP (sells IATA DGR dangerous goods training in Africa/Maghreb).
Score 1-10: 9-10=decision maker at airline/freight/handler with DGR compliance need, 7-8=relevant role, 5-6=partial fit, 1-4=student/irrelevant.
Name: ${name} | Title: ${title} | Company: ${company} | Snippet: ${snippet.slice(0, 150)}
Reply JSON only: {"score":8,"notes":"one sentence why"}`,
        }],
      }),
    })
    const j = await res.json()
    const text = j.content?.[0]?.text || ''
    const m = text.match(/\{[^}]+\}/)
    if (m) {
      const parsed = JSON.parse(m[0])
      return { score: parsed.score || 5, notes: parsed.notes || '' }
    }
  } catch { /* ignore */ }
  return { score: 5, notes: '' }
}

export async function scanLinkedInProspects(
  onProgress?: (msg: string) => void,
  targetSectors?: string[],
  targetCountry?: string,
): Promise<LinkedInProspect[]> {
  const sectors = targetSectors?.length
    ? LINKEDIN_SECTORS.filter(s => targetSectors.includes(s.value))
    : LINKEDIN_SECTORS

  const countries = targetCountry && targetCountry !== 'all'
    ? [targetCountry]
    : LINKEDIN_COUNTRIES

  const queries: string[] = []
  for (const sector of sectors) {
    for (const country of countries) {
      const en = COUNTRY_EN[country] || country
      queries.push(`site:linkedin.com/in "${sector.keywords.split(' ')[0]}" ${sector.keywords.split(' ').slice(1).join(' ')} "${country}" OR "${en}"`)
    }
  }

  onProgress?.(`🔍 ${queries.length} recherches LinkedIn (${sectors.length} secteurs × ${countries.length} pays)...`)

  const raw: LinkedInProspect[] = []
  const seen = new Set<string>()

  const items = await runSync('apify/google-search-scraper', {
    queries: queries.join('\n'),
    maxPagesPerQuery: 1,
    resultsPerPage: 10,
    languageCode: 'fr',
    countryCode: 'dz',
    saveHtml: false,
    saveMarkdown: false,
  }, 180) as Array<{ organicResults?: Array<{ title: string; url: string; description?: string }> }>

  for (const page of items) {
    for (const r of (page.organicResults || [])) {
      if (!r.url || isNonProfile(r.url)) continue
      const username = extractUsername(r.url)
      if (!username || seen.has(username)) continue
      seen.add(username)

      const name = extractName(r.title || '')
      if (!name || name.length < 3) continue

      const snippet = r.description || ''
      const country = detectCountry(snippet + ' ' + r.title)

      // Strict filter when single country selected
      if (targetCountry && targetCountry !== 'all' && country !== targetCountry && country !== 'International') continue

      const titleMatch = snippet.match(/^([^|•\n]{5,60})/)
      const title = titleMatch ? titleMatch[1].trim() : ''
      const companyMatch = snippet.match(/(?:chez|at|@)\s+([^|•\n,]{3,40})/i)
      const company = companyMatch ? companyMatch[1].trim() : ''

      // Infer sector from snippet
      const sn = snippet.toLowerCase()
      let sector = sectors[0].value
      if (sn.includes('airline') || sn.includes('air algérie') || sn.includes('tassili') || sn.includes('compagnie')) sector = 'airline'
      else if (sn.includes('freight') || sn.includes('transitaire') || sn.includes('forwarder')) sector = 'freight'
      else if (sn.includes('ground handling') || sn.includes('swissport') || sn.includes('handler')) sector = 'handler'
      else if (sn.includes('pétrole') || sn.includes('sonatrach') || sn.includes('oil') || sn.includes('gaz')) sector = 'oil_gas'
      else if (sn.includes('dhl') || sn.includes('fedex') || sn.includes('ups') || sn.includes('courrier')) sector = 'courier'

      raw.push({
        linkedin_username: username,
        full_name: name,
        title,
        company,
        country: country === 'International' && targetCountry && targetCountry !== 'all' ? targetCountry : country,
        sector,
        score: 0,
        profile_url: `https://www.linkedin.com/in/${username}/`,
        connection_status: 'found',
      })
    }
  }

  onProgress?.(`📊 ${raw.length} profils trouvés — scoring IA...`)

  const scored: LinkedInProspect[] = []
  for (const p of raw) {
    const { score, notes } = await scoreProspect(p.full_name, p.title, p.company, p.profile_url)
    if (score < 5) {
      onProgress?.(`⏭ ${p.full_name} — score trop bas (${score}/10)`)
      continue
    }
    onProgress?.(`✅ ${p.full_name} — ${score}/10 — ${p.company || 'N/A'} (${p.country})`)
    scored.push({ ...p, score, notes })
  }

  return scored.sort((a, b) => b.score - a.score)
}
