import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

const APIFY_TOKEN = process.env.APIFY_API_TOKEN!
const BASE = 'https://api.apify.com/v2'

function actorPath(id: string) { return id.replace('/', '~') }

// Starts the actor, polls until terminal (or timeout), then fetches the dataset
// regardless of final status — a TIMED-OUT run often still collected partial
// results (e.g. some queries in a batch finished before others got stuck), and
// run-sync-get-dataset-items discards all of that on any non-SUCCEEDED status.
async function runSync(actorId: string, input: Record<string, unknown>, timeoutSecs = 120): Promise<unknown[]> {
  const startRes = await fetch(`${BASE}/acts/${actorPath(actorId)}/runs?token=${APIFY_TOKEN}&memory=512&timeout=${timeoutSecs}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(20000),
  })
  if (!startRes.ok) {
    const txt = await startRes.text()
    throw new Error(`Apify ${actorId} start failed ${startRes.status}: ${txt.slice(0, 200)}`)
  }
  const startData = await startRes.json()
  const runId = startData.data.id
  const datasetId = startData.data.defaultDatasetId

  const deadline = Date.now() + (timeoutSecs + 15) * 1000
  let status = startData.data.status
  while (!['SUCCEEDED', 'FAILED', 'TIMED-OUT', 'ABORTED'].includes(status) && Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 3000))
    try {
      const statusRes = await fetch(`${BASE}/actor-runs/${runId}?token=${APIFY_TOKEN}`, { signal: AbortSignal.timeout(10000) })
      if (!statusRes.ok) break
      status = (await statusRes.json()).data.status
    } catch { break }
  }

  const itemsRes = await fetch(`${BASE}/datasets/${datasetId}/items?token=${APIFY_TOKEN}&clean=true`, { signal: AbortSignal.timeout(20000) })
  if (!itemsRes.ok) return []
  const data = await itemsRes.json()
  return Array.isArray(data) ? data : []
}

export const INSTRUCTOR_COUNTRIES = [
  'Algérie', 'Maroc', 'Tunisie', 'Sénégal', "Côte d'Ivoire",
  'Cameroun', 'Gabon', 'Mali', 'France', 'Belgique', 'UAE', 'Qatar',
]

export interface InstructorLead {
  full_name: string
  title: string
  company: string
  country: string
  city: string
  linkedin_url: string
  source_url: string
  email: string
  phone: string
  bio: string
  certifications: string
  score: number
}

// Returns true when URL/title is a LinkedIn post, article, or non-profile page
function isNonProfile(url: string, title: string): boolean {
  const u = url.toLowerCase()
  // Keep only linkedin.com/in/ profiles, or non-LinkedIn professional pages
  if (u.includes('linkedin.com') && !u.includes('linkedin.com/in/')) return true
  // Titles that are clearly post/article/org names, not person names
  if (/^#/.test(title.trim())) return true                          // starts with hashtag
  if (/\d{4}/.test(title) && !title.match(/^[A-ZÀ-ÿ]/)) return true // date-first titles
  if (title.split(' ').length > 7 && !title.includes(' - ') && !title.includes(' | ')) return true // long sentence ≠ person name
  if (/(training|safety|aviation|flight|dispatch|cargo|the importance|ensuring|new |academy|iata training)/i.test(title.split('|')[0].split('-')[0].trim())) return true
  return false
}

// Try to extract city from bio/description text
function extractCity(text: string): string {
  const patterns = [
    /(?:based in|located in|à|in)\s+([A-ZÀ-ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-ÿ][a-zà-ÿ]+)?)/,
    /(Alger|Oran|Casablanca|Rabat|Tunis|Dakar|Paris|Bruxelles|Dubai|Doha|Abidjan|Douala|Libreville|Bamako|Yaoundé|Montréal|London|Lyon|Marseille)/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) return m[1].trim()
  }
  return ''
}

export async function scanCbtaInstructors(
  onProgress?: (msg: string) => void,
  targetCountries?: string[]
): Promise<InstructorLead[]> {
  const countries = targetCountries?.length ? targetCountries : INSTRUCTOR_COUNTRIES
  const isTargeted = !!targetCountries?.length // user selected specific countries

  // Country name map for English aliases used in LinkedIn
  const COUNTRY_EN: Record<string, string> = {
    'Algérie': 'Algeria', 'Maroc': 'Morocco', 'Tunisie': 'Tunisia',
    'Sénégal': 'Senegal', "Côte d'Ivoire": 'Ivory Coast', 'Cameroun': 'Cameroon',
    'Gabon': 'Gabon', 'Mali': 'Mali', 'France': 'France', 'Belgique': 'Belgium',
    'UAE': 'UAE Dubai', 'Qatar': 'Qatar Doha',
  }

  // Build geo strings — all selected countries, both FR and EN names
  const geoTerms = countries.flatMap(c => [c, COUNTRY_EN[c]].filter(Boolean))
  const geo = geoTerms.join(' OR ')

  // Each entry: { query string, implied country (null = unknown) }
  // When a query explicitly targets a country, we use it as default if detection fails
  type TaggedQuery = { q: string; implied: string | null }

  const baseQueries: TaggedQuery[] = [
    { q: `site:linkedin.com/in "qualified instructor" "dangerous goods" IATA DGR`, implied: null },
    { q: `site:linkedin.com/in "qualified examiner" "dangerous goods" IATA DGR`, implied: null },
    { q: `site:linkedin.com/in "DGR instructor" IATA "Category 7" OR "Cat 7"`, implied: null },
    { q: `site:linkedin.com/in "IATA DGR instructor" OR "IATA DGR examiner" OR "IATA DGR trainer"`, implied: null },
    { q: `site:linkedin.com/in "Train the Trainer" DGR "dangerous goods" IATA`, implied: null },
    { q: `site:linkedin.com/in "dangerous goods trainer" OR "dangerous goods examiner" IATA CBTA`, implied: null },
    { q: `site:linkedin.com/in "formateur DGR" OR "instructeur DGR" IATA certifié`, implied: null },
  ]

  // Country-specific queries — each result from these belongs to that country
  const countryQueries: TaggedQuery[] = countries.flatMap(c => {
    const en = COUNTRY_EN[c] || c
    return [
      { q: `site:linkedin.com/in "DGR" "instructor" OR "examiner" OR "trainer" "${c}" OR "${en}"`, implied: c },
      { q: `site:linkedin.com/in "dangerous goods" instructor examiner "${c}" OR "${en}"`, implied: c },
    ]
  })

  const taggedQueries: TaggedQuery[] = isTargeted
    ? [
        ...baseQueries.map(b => ({ q: `${b.q} ${geo}`, implied: countries.length === 1 ? countries[0] : null })),
        ...countryQueries,
      ]
    : [
        ...baseQueries,
        ...countries.slice(0, 4).map(c => ({ q: `site:linkedin.com/in "DGR" instructor examiner "${c}" OR "${COUNTRY_EN[c] || c}"`, implied: c })),
      ]

  onProgress?.(`🔍 Scan profils LinkedIn instructeurs CBTA — ${countries.join(', ')}`)

  // Apify returns results in same order as queries — track implied country per query index
  const queryStrings = taggedQueries.map(t => t.q)
  const impliedByIndex = taggedQueries.map(t => t.implied)

  // Batch into small groups and let the actor pick its own default proxy — forcing a
  // datacenter-only group (BUYPROXIES94952) gets blocked by Google harder than the
  // actor's own default selection. Smaller sequential batches keep each Apify call
  // within budget without losing coverage.
  const BATCH_SIZE = 3
  const items: Array<{ organicResults?: Array<{ title: string; url: string; description: string }> }> = []
  for (let bi = 0; bi < queryStrings.length; bi += BATCH_SIZE) {
    const batch = queryStrings.slice(bi, bi + BATCH_SIZE)
    onProgress?.(`🔎 Recherche batch ${Math.floor(bi / BATCH_SIZE) + 1}/${Math.ceil(queryStrings.length / BATCH_SIZE)}...`)
    try {
      const batchItems = await runSync('apify/google-search-scraper', {
        queries: batch.join('\n'),
        maxPagesPerQuery: 1,
        resultsPerPage: 10,
        languageCode: 'fr',
        saveHtml: false,
        saveMarkdown: false,
      }, 150) as Array<{ organicResults?: Array<{ title: string; url: string; description: string }> }>
      items.push(...batchItems)
    } catch (e) {
      onProgress?.(`⚠️ Batch ${Math.floor(bi / BATCH_SIZE) + 1} échoué: ${String(e).slice(0, 100)}`)
      for (let i = 0; i < batch.length; i++) items.push({ organicResults: [] })
    }
  }

  const seen = new Set<string>()
  const raw: Array<{ name: string; pos: string; company: string; country: string; city: string; linkedin_url: string; source_url: string; bio: string }> = []

  for (let qi = 0; qi < items.length; qi++) {
    const page = items[qi]
    const impliedCountry = impliedByIndex[qi] ?? null

    for (const r of (page.organicResults || [])) {
      if (!r.title || !r.url) continue
      const key = r.url.split('?')[0]
      if (seen.has(key)) continue
      seen.add(key)

      // Only keep actual LinkedIn profiles
      if (isNonProfile(r.url, r.title)) continue

      const name = extractName(r.title)
      if (name === 'Inconnu' || /^(the|an|a|new|ensuring|iata|cbta)/i.test(name)) continue

      const { pos, company } = extractPosCompany(r.title, r.description)
      const fullText = r.title + ' ' + r.description
      // Use query-implied country as fallback when text detection fails
      const detected = detectInstructorCountry(fullText, countries)
      const country = (detected !== 'International' && detected) ? detected : (impliedCountry || 'International')
      const city = extractCity(r.description)

      raw.push({
        name,
        pos,
        company,
        country,
        city,
        linkedin_url: r.url.includes('linkedin.com/in/') ? r.url.split('?')[0] : '',
        source_url: r.url.split('?')[0],
        bio: r.description || '',
      })
    }
  }

  // Strict country filter: if user targeted a single country, drop results from other countries
  const strictCountry = isTargeted && countries.length === 1 ? countries[0] : null
  const filtered_raw = strictCountry
    ? raw.filter(r => r.country === strictCountry || r.country === 'International')
    : raw

  onProgress?.(`📋 ${filtered_raw.length} profils retenus${strictCountry ? ` (filtre strict: ${strictCountry})` : ''} — scoring...`)

  const results: InstructorLead[] = []

  for (let i = 0; i < filtered_raw.length; i += 5) {
    const batch = filtered_raw.slice(i, i + 5)
    const processed = await Promise.all(batch.map(async r => {
      const [score, contacts, certs] = await Promise.all([
        scoreInstructor(r),
        extractContacts(r.bio),
        extractCertifications(r.bio),
      ])
      return { r, score, contacts, certs }
    }))

    for (const { r, score, contacts, certs } of processed) {
      if (score < 4) continue

      let { email, phone } = contacts

      // If no contact found via bio text, try scraping the LinkedIn profile directly
      if (!email && !phone && r.linkedin_url) {
        onProgress?.(`🔎 Enrichissement contacts : ${r.name}...`)
        const enriched = await scrapeLinkedInContacts(r.linkedin_url, r.bio)
        email = enriched.email
        phone = enriched.phone
      }

      // No email/phone found (LinkedIn hides these publicly) — still save if we have
      // a LinkedIn profile URL, so outreach can happen via LinkedIn message instead.
      if (!email && !phone && !r.linkedin_url) {
        onProgress?.(`⏭ ${r.name} — aucun contact ni profil LinkedIn, ignoré`)
        continue
      }

      // For strict single-country scans, enforce country
      const finalCountry = strictCountry && r.country === 'International' ? strictCountry : r.country

      results.push({
        full_name: r.name,
        title: r.pos,
        company: r.company,
        country: finalCountry,
        city: r.city,
        linkedin_url: r.linkedin_url,
        source_url: r.source_url,
        email,
        phone,
        bio: r.bio,
        certifications: certs,
        score,
      })
    }
    onProgress?.(`⚙️ ${Math.min(i + 5, filtered_raw.length)}/${filtered_raw.length} traités...`)
  }

  onProgress?.(`✅ ${results.length} instructeurs CBTA avec contacts`)
  return results
}

// Scrape a LinkedIn profile page via Apify to find hidden contact details
async function scrapeLinkedInContacts(linkedinUrl: string, existingBio: string): Promise<{ email: string; phone: string }> {
  try {
    // Try Apify LinkedIn profile scraper
    const data = await runSync('apify/linkedin-profile-scraper', {
      startUrls: [{ url: linkedinUrl }],
      proxy: { useApifyProxy: true, apifyProxyGroups: ['RESIDENTIAL'] },
    }, 60) as Array<{ email?: string; phone?: string; contactInfo?: { email?: string; phone?: string }; about?: string }>

    if (data.length > 0) {
      const p = data[0]
      const email = p.email || p.contactInfo?.email || ''
      const phone = p.phone || p.contactInfo?.phone || ''
      // Also try extracting from the full about/bio text returned
      const bio = p.about || existingBio
      const fallback = await extractContacts(bio)
      return {
        email: email || fallback.email,
        phone: phone || fallback.phone,
      }
    }
  } catch {
    // Apify actor failed — try basic URL-based email guessing from company domain
  }

  // Last resort: try Apify email finder with name + company from bio
  try {
    const domainMatch = existingBio.match(/(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/i)
    if (domainMatch) {
      const domain = domainMatch[1]
      const emailData = await runSync('apify/email-scraper', {
        startUrls: [{ url: `https://${domain}/contact` }, { url: `https://${domain}/about` }],
        maxDepth: 1,
        maxPagesPerStartUrl: 2,
      }, 45) as Array<{ emails?: string[] }>
      const emails = emailData.flatMap(d => d.emails || [])
      if (emails.length > 0) return { email: emails[0], phone: '' }
    }
  } catch { /* ignore */ }

  return { email: '', phone: '' }
}

function extractName(title: string): string {
  // Strip LinkedIn suffix and common post suffixes
  let clean = title
    .replace(/\s*[\|–]\s*LinkedIn\s*$/i, '')
    .replace(/'s Post\s*$/i, '')
    .replace(/'s Article\s*$/i, '')
    .replace(/\s*on LinkedIn\s*$/i, '')
    .replace(/\s*\|.*$/, '')
    .trim()

  // "John Doe - DGR Instructor" → "John Doe"
  const dashMatch = clean.match(/^([A-ZÀ-ÿa-z][a-zÀ-ÿ]+(?:\s+[A-ZÀ-ÿ][a-zÀ-ÿ]+){0,3})(?:\s*[-–]|$)/)
  if (dashMatch) return dashMatch[1].trim()

  // Last resort: take up to first dash/pipe
  const m = clean.match(/^([^|\-–]{3,40})/)
  return m?.[1]?.trim() || 'Inconnu'
}

function extractPosCompany(title: string, desc: string): { pos: string; company: string } {
  // Clean title first
  const cleanTitle = title
    .replace(/'s Post\s*$/i, '')
    .replace(/\s*[\|–]\s*LinkedIn\s*$/i, '')
    .replace(/\s*on LinkedIn\s*$/i, '')

  // "John Doe - DGR Instructor at Air Algérie | LinkedIn"
  const atMatch = cleanTitle.match(/[-–]\s*(.+?)\s+(?:at|chez|@)\s+(.+?)(?:\s*[|]|$)/)
  if (atMatch) return { pos: atMatch[1].trim(), company: atMatch[2].trim() }

  // "John Doe - Senior DGR Trainer"
  const dashMatch = cleanTitle.match(/[-–]\s*([^|\-–]{3,60}?)(?:\s*[|]|$)/)
  const pos = dashMatch?.[1]?.trim() || desc.split('.')[0]?.trim().slice(0, 80) || 'Instructeur DGR'

  // Try to extract company from description
  const companyMatch = desc.match(/(?:at|chez|@|travaille chez|works at|chez)\s+([A-Z][A-Za-zÀ-ÿ\s&.-]{2,40})/)?.[1]?.trim()
    || desc.match(/([A-Z][A-Z\s&]{3,30}(?:Airlines?|Air|Cargo|Aviation|Airways|Handling|Logistics))/)?.[1]?.trim()
    || ''

  return { pos, company: companyMatch }
}

function detectInstructorCountry(text: string, allowed: string[]): string {
  const t = text.toLowerCase()
  for (const c of allowed) {
    if (t.includes(c.toLowerCase())) return c
  }
  if (t.includes('algérie') || t.includes('algeria') || t.includes('alger') || t.includes('oran')) return 'Algérie'
  if (t.includes('maroc') || t.includes('morocco') || t.includes('casablanca') || t.includes('rabat')) return 'Maroc'
  if (t.includes('tunisie') || t.includes('tunisia') || t.includes('tunis')) return 'Tunisie'
  if (t.includes('sénégal') || t.includes('dakar')) return 'Sénégal'
  if (t.includes('france') || t.includes('paris') || t.includes('lyon')) return 'France'
  if (t.includes('belgique') || t.includes('bruxelles')) return 'Belgique'
  if (t.includes('uae') || t.includes('dubai') || t.includes('abu dhabi') || t.includes('émirats')) return 'UAE'
  if (t.includes('qatar') || t.includes('doha')) return 'Qatar'
  if (t.includes('ivoire') || t.includes('abidjan')) return "Côte d'Ivoire"
  if (t.includes('cameroun') || t.includes('douala')) return 'Cameroun'
  if (t.includes('gabon') || t.includes('libreville')) return 'Gabon'
  if (t.includes('mali') || t.includes('bamako')) return 'Mali'
  return 'International'
}

// Words that signal a STUDENT (completed DGR course) not a TRAINER
const STUDENT_SIGNALS = ['ground handler', 'ground handling', 'ramp agent', 'ramp supervisor',
  'cargo agent', 'completed', 'passed', 'certificate holder', 'certified as', 'has completed',
  'load controller', 'loadmaster', 'baggage handler', 'station agent', 'passenger service']

function isStudent(pos: string, bio: string): boolean {
  const text = (pos + ' ' + bio).toLowerCase()
  return STUDENT_SIGNALS.some(s => text.includes(s)) &&
    !/(instructor|examiner|trainer|formateur|teach|enseignant|qualification de formateur)/i.test(text)
}

async function scoreInstructor(r: { name: string; pos: string; company: string; bio: string }): Promise<number> {
  // Fast reject: clearly a student / non-instructor
  if (isStudent(r.pos, r.bio)) return 1

  try {
    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      maxOutputTokens: 5,
      prompt: `Score ce profil de 1 à 10. OBJECTIF : base de données de formateurs/examinateurs DGR IATA certifiés.
Nom: ${r.name} | Titre: ${r.pos} | Entreprise: ${r.company}
Bio: ${r.bio.slice(0, 300)}

RÈGLES STRICTES :
- 9-10 = Instructeur IATA "qualified instructor" ou "qualified examiner" DGR actif, enseigne les Cat 7.x
- 7-8 = Formateur/Examinateur DGR IATA confirmé, Train the Trainer, CBTA instructor
- 5-6 = Professionnel avec rôle mixte (ex: Safety Officer qui forme aussi)
- 1-3 = Personnel qui a SUIVI une formation DGR (ground handler, ramp agent, cargo agent, etc.) — PAS un formateur. Aussi 1-3 si non lié à l'aviation.
Réponds UNIQUEMENT par un chiffre 1-10.`,
    })
    return Math.min(10, Math.max(1, parseInt(text.trim()) || 3))
  } catch { return 3 }
}

async function extractContacts(bio: string): Promise<{ email: string; phone: string }> {
  if (!bio || bio.length < 5) return { email: '', phone: '' }

  // Regex first (fast)
  const emailMatch = bio.match(/[\w.+%-]+@[\w.-]+\.[a-z]{2,}/i)
  const phoneMatch = bio.match(/(?:\+?\d[\d\s.\-()]{8,17}\d)/)

  if (emailMatch || phoneMatch) {
    return {
      email: emailMatch?.[0]?.toLowerCase() || '',
      phone: phoneMatch?.[0]?.replace(/\s+/g, '') || '',
    }
  }

  // Claude fallback for obfuscated contacts ("john[at]company.com")
  try {
    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      maxOutputTokens: 80,
      prompt: `Extrait email et téléphone de ce texte LinkedIn. Réponds UNIQUEMENT en JSON valide: {"email":"","phone":""}. Si absent laisse "".
Texte: ${bio.slice(0, 350)}`,
    })
    const clean = text.trim().replace(/```json|```/g, '').trim()
    const j = JSON.parse(clean)
    return { email: j.email || '', phone: j.phone || '' }
  } catch { return { email: '', phone: '' } }
}

async function extractCertifications(bio: string): Promise<string> {
  const t = bio.toLowerCase()
  const certs: string[] = []
  if (t.includes('cbta')) certs.push('CBTA')
  if (t.includes('iata')) certs.push('IATA')
  if (t.includes('dgr') || t.includes('dangerous goods') || t.includes('marchandises dangereuses')) certs.push('DGR')
  ;['7.1','7.2','7.3','7.4','7.5','7.6','7.7','7.8','7.9','7.10'].forEach(cat => {
    if (t.includes(`cat ${cat}`) || t.includes(`category ${cat}`) || t.includes(`catégorie ${cat}`) || t.includes(` ${cat}`)) certs.push(`Cat ${cat}`)
  })
  if (t.includes('examiner') || t.includes('examinateur')) certs.push('Examiner')
  if (t.includes('instructor') || t.includes('instructeur') || t.includes('formateur')) certs.push('Instructor')
  if (t.includes('train the trainer') || t.includes('ttt')) certs.push('Train the Trainer')
  return [...new Set(certs)].join(', ')
}
