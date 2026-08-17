import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import type { InstructorLead } from './instructor-scanner'

const DSN = process.env.UNIPILE_DSN!
const API_KEY = process.env.UNIPILE_API_KEY!
const ACCOUNT_ID = process.env.UNIPILE_ACCOUNT_ID!
const BASE = `https://${DSN}/api/v1`

async function unipileFetch(path: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'X-API-KEY': API_KEY, accept: 'application/json', 'content-type': 'application/json', ...init?.headers },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Unipile ${path} failed ${res.status}: ${txt.slice(0, 300)}`)
  }
  return res.json()
}

// Country name (FR, as used across the app) -> Sales Navigator REGION id.
// Fetched once per country and cached for the process lifetime.
const regionIdCache = new Map<string, string | null>()

async function getRegionId(countryFr: string): Promise<string | null> {
  if (regionIdCache.has(countryFr)) return regionIdCache.get(countryFr)!

  const COUNTRY_EN: Record<string, string> = {
    'Algérie': 'Algeria', 'Maroc': 'Morocco', 'Tunisie': 'Tunisia',
    'Sénégal': 'Senegal', "Côte d'Ivoire": 'Ivory Coast', 'Cameroun': 'Cameroon',
    'Gabon': 'Gabon', 'Mali': 'Mali', 'France': 'France', 'Belgique': 'Belgium',
    'UAE': 'United Arab Emirates', 'Qatar': 'Qatar',
  }
  const query = COUNTRY_EN[countryFr] || countryFr

  try {
    const data = await unipileFetch(
      `/linkedin/search/parameters?account_id=${ACCOUNT_ID}&type=REGION&keywords=${encodeURIComponent(query)}`
    ) as { items?: Array<{ id: string; title: string }> }
    const items = data.items || []
    // Prefer the country-level entry (title matches the plain country name, no city/region suffix)
    const exact = items.find(i => i.title.toLowerCase() === countryFr.toLowerCase() || i.title.toLowerCase() === query.toLowerCase())
    const id = exact?.id || items[0]?.id || null
    regionIdCache.set(countryFr, id)
    return id
  } catch {
    regionIdCache.set(countryFr, null)
    return null
  }
}

interface SalesNavPerson {
  id: string
  name: string
  headline?: string
  location?: string
  public_identifier?: string
  public_profile_url?: string
  current_positions?: Array<{ company?: string; role?: string }>
}

async function searchSalesNav(keywords: string, regionId: string | null): Promise<SalesNavPerson[]> {
  const body: Record<string, unknown> = { api: 'sales_navigator', category: 'people', keywords }
  if (regionId) body.location = { include: [regionId] }

  const data = await unipileFetch(`/linkedin/search?account_id=${ACCOUNT_ID}`, {
    method: 'POST',
    body: JSON.stringify(body),
  }) as { items?: SalesNavPerson[] }
  return data.items || []
}

const QUERIES = [
  'DGR instructor IATA',
  'IATA CBTA instructor dangerous goods',
  'qualified examiner dangerous goods IATA',
  'formateur DGR instructeur IATA',
  'Train the Trainer DGR dangerous goods',
  'dangerous goods trainer examiner CBTA',
]

// Words that signal a STUDENT (completed DGR course) not a TRAINER — same heuristic as the Apify scanner
const STUDENT_SIGNALS = ['ground handler', 'ground handling', 'ramp agent', 'ramp supervisor',
  'cargo agent', 'completed', 'passed', 'certificate holder', 'certified as', 'has completed',
  'load controller', 'loadmaster', 'baggage handler', 'station agent', 'passenger service']

function isStudent(headline: string): boolean {
  const t = headline.toLowerCase()
  return STUDENT_SIGNALS.some(s => t.includes(s)) &&
    !/(instructor|examiner|trainer|formateur|teach|enseignant)/i.test(t)
}

async function scoreInstructor(name: string, headline: string, company: string): Promise<number> {
  if (isStudent(headline)) return 1
  try {
    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      maxOutputTokens: 5,
      prompt: `Score ce profil de 1 à 10. OBJECTIF : base de données de formateurs/examinateurs DGR IATA certifiés.
Nom: ${name} | Entreprise: ${company}
Headline: ${headline.slice(0, 300)}

RÈGLES STRICTES :
- 9-10 = Instructeur IATA "qualified instructor" ou "qualified examiner" DGR actif, enseigne les Cat 7.x
- 7-8 = Formateur/Examinateur DGR IATA confirmé, Train the Trainer, CBTA instructor
- 5-6 = Professionnel avec rôle mixte (ex: Safety Officer qui forme aussi)
- 1-3 = Personnel qui a SUIVI une formation DGR — PAS un formateur. Aussi 1-3 si non lié à l'aviation.
Réponds UNIQUEMENT par un chiffre 1-10.`,
    })
    return Math.min(10, Math.max(1, parseInt(text.trim()) || 3))
  } catch { return 3 }
}

function extractCerts(headline: string): string {
  const t = headline.toLowerCase()
  const certs: string[] = []
  if (t.includes('cbta')) certs.push('CBTA')
  if (t.includes('iata')) certs.push('IATA')
  if (t.includes('dgr') || t.includes('dangerous goods') || t.includes('marchandises dangereuses')) certs.push('DGR')
  ;['7.1', '7.2', '7.3', '7.4', '7.5', '7.6', '7.7', '7.8', '7.9', '7.10'].forEach(cat => {
    if (t.includes(`cat ${cat}`) || t.includes(`category ${cat}`) || t.includes(`catégorie ${cat}`)) certs.push(`Cat ${cat}`)
  })
  if (t.includes('examiner') || t.includes('examinateur')) certs.push('Examiner')
  if (t.includes('instructor') || t.includes('instructeur') || t.includes('formateur')) certs.push('Instructor')
  if (t.includes('train the trainer') || t.includes('ttt')) certs.push('Train the Trainer')
  return [...new Set(certs)].join(', ')
}

export async function scanCbtaInstructorsUnipile(
  onProgress?: (msg: string) => void,
  targetCountries?: string[]
): Promise<InstructorLead[]> {
  if (!DSN || !API_KEY || !ACCOUNT_ID) {
    throw new Error('Unipile non configuré — UNIPILE_DSN / UNIPILE_API_KEY / UNIPILE_ACCOUNT_ID manquants dans .env.local')
  }

  const countries = targetCountries?.length ? targetCountries : ['Algérie']
  onProgress?.(`🔍 Sales Navigator — ${countries.join(', ')}`)

  const seen = new Set<string>()
  const raw: Array<{ person: SalesNavPerson; country: string }> = []

  for (const country of countries) {
    const regionId = await getRegionId(country)
    if (!regionId) {
      onProgress?.(`⚠️ Région introuvable pour ${country}, recherche sans filtre géo`)
    }

    for (const q of QUERIES) {
      try {
        const people = await searchSalesNav(q, regionId)
        for (const p of people) {
          if (!p.id || seen.has(p.id)) continue
          seen.add(p.id)
          raw.push({ person: p, country })
        }
        onProgress?.(`🔎 "${q}" (${country}) — ${people.length} résultats`)
      } catch (e) {
        onProgress?.(`⚠️ "${q}" (${country}) échoué: ${String(e).slice(0, 100)}`)
      }
    }
  }

  onProgress?.(`📋 ${raw.length} profils uniques — scoring...`)

  const results: InstructorLead[] = []
  for (let i = 0; i < raw.length; i += 5) {
    const batch = raw.slice(i, i + 5)
    const scored = await Promise.all(batch.map(async ({ person, country }) => {
      const headline = person.headline || ''
      const company = person.current_positions?.[0]?.company || ''
      const role = person.current_positions?.[0]?.role || ''
      const score = await scoreInstructor(person.name, headline, company)
      return { person, country, headline, company, role, score }
    }))

    for (const { person, country, headline, company, role, score } of scored) {
      if (score < 4) continue
      const linkedinUrl = person.public_profile_url || (person.public_identifier ? `https://www.linkedin.com/in/${person.public_identifier}` : '')
      if (!linkedinUrl) continue

      results.push({
        full_name: (person.name || '').trim(),
        title: role || 'Instructeur DGR',
        company,
        country,
        city: (person.location || '').split(',')[0]?.trim() || '',
        linkedin_url: linkedinUrl,
        source_url: linkedinUrl,
        email: '',
        phone: '',
        bio: `[Sales Navigator] ${headline}`,
        certifications: extractCerts(headline),
        score,
      })
      onProgress?.(`🎓 ${person.name} (${country}) — ${score}/10`)
    }
    onProgress?.(`⚙️ ${Math.min(i + 5, raw.length)}/${raw.length} traités...`)
  }

  onProgress?.(`✅ ${results.length} instructeurs CBTA via Sales Navigator`)
  return results
}
