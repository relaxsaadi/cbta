import { NextRequest, NextResponse } from 'next/server'

// Days until IATA CBTA deadline (Sept 30, 2026)
function daysUntilDeadline() {
  return Math.max(0, Math.ceil((new Date('2026-09-30').getTime() - Date.now()) / 86400000))
}

const SECTOR_CONTEXT: Record<string, string> = {
  airline:           'compagnie aérienne — tous agents cargo, dispatchers, loadmasters sont légalement tenus d\'être certifiés DGR IATA',
  ground_handler:    'société de handling — agents piste et rampe manipulant des DGR quotidiennement : obligation réglementaire absolue',
  freight_forwarder: 'transitaire — tout le personnel traitant des expéditions aériennes de marchandises dangereuses doit être certifié',
  oil_gas:           'entreprise pétrolière — expéditions d\'équipements et produits classés DGR par avion : formation obligatoire IATA',
  courier:           'courrier express — batteries lithium, marchandises réglementées : sanctions douanières sans certification',
  pharma:            'laboratoire pharma — produits biologiques, cryogéniques, réglementés : certification IATA indispensable',
  airport_authority: 'autorité aéroportuaire — responsabilité juridique directe sur toute DGR en escale',
  chemical:          'entreprise chimique — transport aérien de matières dangereuses : obligation légale Article 3.1 IATA DGR',
}

async function callClaude(prompt: string, maxTokens = 400) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const data = await res.json()
  return data.content?.[0]?.text || ''
}

export async function POST(req: NextRequest) {
  const { prospect } = await req.json()
  const days = daysUntilDeadline()
  const ctx = SECTOR_CONTEXT[prospect.sector] || 'secteur réglementé par l\'IATA'
  const name = prospect.decision_maker_name?.split(' ')[0] || 'Monsieur/Madame'
  const company = prospect.company_name

  // Generate all 3 in parallel for speed
  const [email, linkedin, whatsapp] = await Promise.all([

    // EMAIL — urgence réglementaire + deadline CBTA
    callClaude(`Tu es directeur commercial de KOST GROUP, premier centre IATA CBTA certifié d'Algérie.
Rédige un email de prospection B2B URGENT pour :
- Destinataire : ${prospect.decision_maker_name}, ${prospect.decision_maker_title}
- Entreprise : ${company} — ${ctx}

CONTEXTE CRITIQUE : Notre certification IATA CBTA risque d'être révoquée si nous n'atteignons pas 25 formations avant le 30 septembre 2026. Il reste ${days} jours. Cette urgence est RÉELLE et doit transparaître sans être mentionnée directement côté client — l'urgence vient de leur obligation légale IATA, pas de nous.

KOST GROUP : seul centre CBTA certifié IATA en Algérie, formations DGR catégories 7.1 à 7.10, certifications reconnues IATA internationalement.
OBLIGATION LÉGALE : Tout personnel manipulant ou expédiant des DGR doit être certifié — amende + interdiction de vol + responsabilité pénale en cas d'incident.

Règles STRICTES :
- Objet : cite l'obligation légale + deadline juillet/août (créer urgence côté client)
- Corps : MAX 120 mots, 3 paragraphes
- Paragraph 1 : leur contexte métier spécifique + obligation légale précise
- Paragraph 2 : ce que KOST offre (CBTA, seul centre certifié, gain temps vs méthodes classiques)
- Paragraph 3 : CTA — session août/septembre, réponse ou WhatsApp +213 542 30 53 83
- Pas de "j'espère que vous allez bien"
- Signature : Karim Saadi — KOST GROUP | dgr.kostacademy.com | +213 542 30 53 83

Format exact :
Objet: [objet]

[corps]`, 500),

    // LINKEDIN — 280 chars max, ultra personnalisé
    callClaude(`Tu es commercial KOST GROUP. Message LinkedIn InMail pour ${prospect.decision_maker_name}, ${prospect.decision_maker_title} chez ${company} (${ctx}).

Règles ABSOLUES :
- 280 caractères MAXIMUM
- Commence par leur prénom : "${name},"
- Angle urgence : deadline réglementaire IATA avant ${days} jours
- Mentionne KOST = seul centre CBTA certifié Algérie
- CTA court : "Session août dispo — 30 min cette semaine ?"
- Zéro spam, ultra ciblé leur métier

Message (280 chars max) :`, 150),

    // WHATSAPP — conversationnel, emoji, max 200 mots
    callClaude(`Tu es Karim de KOST GROUP. Message WhatsApp professionnel pour ${prospect.decision_maker_name}, ${prospect.decision_maker_title} chez ${company}.

Contexte : ${ctx}. Il reste ${days} jours avant que les réglementations IATA soient renforcées en Algérie.
KOST = seul centre CBTA IATA certifié en Algérie.

Règles :
- Ton : professionnel mais direct, pas formel
- 3-4 émojis max, stratégiquement placés
- Max 150 mots
- Commence par "Bonjour ${name} 👋"
- Corps : leur obligation légale spécifique + ce que KOST résout + session disponible
- CTA : répondre ici ou appel direct
- Finir par signature courte : "Karim — KOST GROUP ✈️"

Message WhatsApp :`, 300),
  ])

  return NextResponse.json({ email, linkedin, whatsapp })
}
