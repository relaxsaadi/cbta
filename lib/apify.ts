const APIFY_TOKEN = process.env.APIFY_API_TOKEN!
const BASE = 'https://api.apify.com/v2'

// Apify uses ~ as separator in URLs (not /)
function actorPath(id: string) { return id.replace('/', '~') }

// Sync run — starts actor AND returns dataset items in one call (no polling needed)
async function runSync(actorId: string, input: Record<string, unknown>, timeoutSecs = 120): Promise<unknown[]> {
  const url = `${BASE}/acts/${actorPath(actorId)}/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=${timeoutSecs}&memory=512`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout((timeoutSecs + 10) * 1000),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Apify ${actorId} failed ${res.status}: ${txt.slice(0, 200)}`)
  }
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export interface ApifyLead {
  source: string
  source_url: string
  company_name: string
  contact_name: string
  contact_title: string
  country: string
  intent_signal: string
  raw_snippet: string
  posted_at?: string
}

// Domains that are training providers / competitors — exclude from results
const COMPETITOR_DOMAINS = [
  'kostacademy', 'iata.org', 'wikipedia', 'icao.int',
  'formation-', 'formapro', 'centre-de-formation', 'training-center',
  'dgr-training', 'avtraining', 'avsec', 'airlinetraining',
  'aviation-training', 'skyservice', 'aerotrain', 'cfppa',
]

// Phrases in titles that signal it's a training PROVIDER (not buyer)
const COMPETITOR_TITLE_SIGNALS = [
  'nous proposons', 'notre programme', 'nos formations', 'inscrivez-vous',
  'stage dgr', 'organise une formation', 'centre agréé', 'catalogue formation',
  'prochaine session', 'tarif formation', 'programme cbta disponible',
  'inscriptions ouvertes', 'e-learning dgr',
]

function isCompetitor(url: string, title: string): boolean {
  const u = url.toLowerCase()
  const t = title.toLowerCase()
  if (COMPETITOR_DOMAINS.some(d => u.includes(d))) return true
  if (COMPETITOR_TITLE_SIGNALS.some(k => t.includes(k))) return true
  return false
}

// Google Search — buyer intent queries (companies SEEKING training, NOT providers)
export async function scrapeGoogleIntents(onProgress?: (msg: string) => void, targetCountries?: string[]): Promise<ApifyLead[]> {
  const geo = targetCountries?.length ? targetCountries.join(' OR ') : 'Algérie Maroc Sénégal Tunisie Afrique'
  const queries = [
    `offre emploi "DGR" OR "marchandises dangereuses" cargo transitaire ${geo}`,
    `recrutement "certification IATA" OR "agent DGR" fret aérien ${geo}`,
    '"besoin formation DGR" OR "cherche formation IATA" cargo logistique',
    '"certification DGR requise" OR "formation obligatoire" transitaire aérien',
    `transitaire cargo aérien ${geo} "IATA" certification équipe`,
    `forum "formation DGR IATA" ${geo} "où" OR "comment" OR "quel organisme"`,
  ]

  const results: ApifyLead[] = []
  onProgress?.(`🔍 Google Search: ${queries.length} requêtes buyer-intent...`)

  const items = await runSync('apify/google-search-scraper', {
    queries: queries.join('\n'),
    maxPagesPerQuery: 1,
    resultsPerPage: 10,
    languageCode: 'fr',
    countryCode: 'dz',
    saveHtml: false,
    saveMarkdown: false,
  }, 90) as Array<{ organicResults?: Array<{ title: string; url: string; displayedUrl?: string; description: string; date?: string }> }>

  for (const page of items) {
    for (const r of (page.organicResults || [])) {
      if (!r.title || !r.url) continue
      if (isCompetitor(r.url, r.title)) continue
      results.push({
        source: 'google_search',
        source_url: r.url,
        company_name: extractCompanyFromUrl(r.url),
        contact_name: '',
        contact_title: '',
        country: detectCountry(r.title + ' ' + (r.description || '')),
        intent_signal: r.title,
        raw_snippet: r.description || '',
        posted_at: r.date || undefined,
      })
    }
  }

  onProgress?.(`✅ Google: ${results.length} résultats (concurrents filtrés)`)
  return results
}

const ALL_MAPS_SEARCHES = [
  { q: 'freight forwarder transitaire cargo Alger', country: 'Algérie' },
  { q: 'ground handling cargo Alger aéroport Houari Boumediene', country: 'Algérie' },
  { q: 'transitaire fret aérien Casablanca Mohamed V', country: 'Maroc' },
  { q: 'freight forwarder cargo Dakar Léopold Sédar Senghor', country: 'Sénégal' },
  { q: 'ground handling cargo Abidjan aéroport Félix Houphouët', country: "Côte d'Ivoire" },
  { q: 'transitaire logistique Tunis fret aérien', country: 'Tunisie' },
  { q: 'freight forwarder cargo Douala aéroport', country: 'Cameroun' },
  { q: 'transitaire fret Libreville aéroport Leon Mba', country: 'Gabon' },
  { q: 'freight forwarder cargo Bamako Sénou', country: 'Mali' },
]

export const SCAN_COUNTRIES = ['Algérie', 'Maroc', 'Tunisie', 'Sénégal', "Côte d'Ivoire", 'Cameroun', 'Gabon', 'Mali']

// Google Maps — freight forwarders, cargo companies, ground handlers with contact info
export async function scrapeGoogleMapsLeads(onProgress?: (msg: string) => void, targetCountries?: string[]): Promise<ApifyLead[]> {
  const searches = targetCountries?.length
    ? ALL_MAPS_SEARCHES.filter(s => targetCountries.includes(s.country))
    : ALL_MAPS_SEARCHES

  const results: ApifyLead[] = []
  onProgress?.(`📍 Google Maps: ${searches.length} villes (${searches.map(s => s.country).join(', ')})...`)

  for (const s of searches) {
    try {
      const items = await runSync('compass/crawler-google-places', {
        searchStringsArray: [s.q],
        maxCrawledPlacesPerSearch: 10,
        language: 'fr',
        exportPlaceUrls: false,
        additionalInfo: false,
        scrapeReviewerInfo: false,
        maxImages: 0,
      }, 90) as Array<{ title?: string; website?: string; phone?: string; categoryName?: string; address?: string; description?: string }>

      for (const place of items) {
        if (!place.title) continue
        results.push({
          source: 'google_maps',
          source_url: place.website || '',
          company_name: place.title,
          contact_name: '',
          contact_title: 'Directeur / Responsable Formation',
          country: s.country,
          intent_signal: `Entreprise ${place.categoryName || 'cargo/logistique'} — secteur obligé DGR IATA`,
          raw_snippet: [place.title, place.categoryName, place.address, place.phone].filter(Boolean).join(' | ').slice(0, 400),
        })
      }
      onProgress?.(`📍 ${s.country}: ${items.length} entreprises`)
    } catch (e) {
      onProgress?.(`⚠️ Maps ${s.country}: ${String(e).slice(0, 80)}`)
    }
  }

  return results
}

// Emploitic & job boards — job postings requiring DGR/IATA = company needs training NOW
export async function scrapeJobBoards(onProgress?: (msg: string) => void): Promise<ApifyLead[]> {
  onProgress?.(`💼 Job boards: Emploitic + Indeed Afrique...`)
  const results: ApifyLead[] = []

  try {
    const items = await runSync('apify/google-search-scraper', {
      queries: [
        'site:emploitic.com "DGR" OR "IATA" OR "marchandises dangereuses" cargo',
        'site:indeed.com "DGR IATA" cargo freight Algerie Maroc Tunisie Senegal',
        'site:rekrute.com "certification IATA" OR "DGR" logistique cargo',
      ].join('\n'),
      maxPagesPerQuery: 1,
      resultsPerPage: 10,
      saveHtml: false,
    }, 90) as Array<{ organicResults?: Array<{ title: string; url: string; description: string }> }>

    for (const page of items) {
      for (const r of (page.organicResults || [])) {
        if (!r.title) continue
        const company = extractCompanyFromSnippet(r.description || r.title)
        results.push({
          source: 'job_board',
          source_url: r.url || '',
          company_name: company,
          contact_name: '',
          contact_title: 'Responsable RH / Formation',
          country: detectCountry(r.title + ' ' + (r.description || '')),
          intent_signal: `Offre emploi DGR IATA — l'entreprise cherche du personnel certifié → besoin formation`,
          raw_snippet: `${r.title} — ${r.description || ''}`.slice(0, 500),
        })
      }
    }
    onProgress?.(`💼 Job boards: ${results.length} offres`)
  } catch (e) {
    onProgress?.(`⚠️ Job boards: ${String(e).slice(0, 80)}`)
  }

  return results
}

function extractCompanyFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace('www.', '')
    const name = host.split('.')[0]
    return name.charAt(0).toUpperCase() + name.slice(1)
  } catch { return 'Inconnu' }
}

function extractCompanyFromSnippet(text: string): string {
  const match = text.match(/(?:chez|at|@)\s+([A-Z][A-Za-z\s&-]{2,30})/)?.[1]
  return match?.trim() || extractCompanyFromText(text)
}

function extractCompanyFromText(text: string): string {
  const words = text.split(/\s+/).slice(0, 5).join(' ')
  return words.length > 3 ? words : 'Entreprise inconnue'
}

export function detectCountry(text: string): string {
  const t = text.toLowerCase()
  if (t.includes('algérie') || t.includes('algeria') || t.includes('alger') || t.includes('oran')) return 'Algérie'
  if (t.includes('maroc') || t.includes('morocco') || t.includes('casablanca') || t.includes('rabat')) return 'Maroc'
  if (t.includes('tunisie') || t.includes('tunisia') || t.includes('tunis')) return 'Tunisie'
  if (t.includes('sénégal') || t.includes('senegal') || t.includes('dakar')) return 'Sénégal'
  if (t.includes('ivoire') || t.includes('abidjan')) return "Côte d'Ivoire"
  if (t.includes('cameroun') || t.includes('douala') || t.includes('yaoundé')) return 'Cameroun'
  if (t.includes('gabon') || t.includes('libreville')) return 'Gabon'
  return 'Afrique'
}
