import { NextRequest, NextResponse } from 'next/server'

const SECTOR_CONTEXT: Record<string, string> = {
  airline:           'compagnie aérienne transportant des marchandises dangereuses (batteries, matières inflammables, cargo)',
  ground_handler:    'opérateur de handling aéroportuaire manipulant quotidiennement des DGR',
  freight_forwarder: 'transitaire organisant le transport de marchandises dangereuses par avion',
  oil_gas:           'entreprise pétrolière expédiant des équipements et produits chimiques par avion',
  courier:           'coursier express manipulant des envois DGR (batteries lithium, produits réglementés)',
  pharma:            'laboratoire pharmaceutique expédiant des produits biologiques et réglementés par avion',
  airport_authority: 'autorité aéroportuaire responsable de la conformité DGR sur le tarmac',
  chemical:          'entreprise chimique expédiant des matières dangereuses par voie aérienne',
}

export async function POST(req: NextRequest) {
  const { type, prospect, batchProspects } = await req.json()

  const sectorCtx = SECTOR_CONTEXT[prospect?.sector] || prospect?.sector || 'entreprise du secteur aérien'

  const buildPrompt = (p: Record<string, unknown>) => {
    const ctx = SECTOR_CONTEXT[p.sector as string] || p.sector
    const daysLeft = Math.max(0, Math.ceil((new Date('2026-09-30').getTime() - Date.now()) / 86400000))

    const prompts: Record<string, string> = {
      email: `Tu es responsable commercial chez KOST GROUP, premier centre IATA CBTA certifié d'Algérie.
Rédige un email de prospection B2B URGENT pour:
- Décideur: ${p.decision_maker_name}, ${p.decision_maker_title}
- Entreprise: ${p.company_name} — ${ctx}
- Effectif: ~${p.estimated_staff} personnes

KOST GROUP: formations DGR IATA obligatoires (catégories 7.1 à 7.10), certifications CBTA reconnues IATA, seul centre certifié Algérie.
URGENCE: Réglementation IATA renforcée — les entreprises non conformes avant août/septembre 2026 s'exposent à des sanctions lourdes. Il reste ${daysLeft} jours.
Obligation légale: tout personnel manipulant/expédiant des DGR doit être certifié — amende + interdiction de vol + responsabilité pénale.

Règles:
- Objet: cite l'obligation légale + deadline imminente (créer l'urgence côté client)
- Corps: 3 paragraphes, 120 mots max
- Paragraph 1: leur contexte métier + obligation légale précise pour leur secteur
- Paragraph 2: KOST = seul centre CBTA certifié, gain temps, certification reconnue IATA
- Paragraph 3: CTA — session août disponible, répondre ou WhatsApp +213 542 30 53 83
- Pas de "j'espère que vous allez bien"
- Signature: Karim Saadi — KOST GROUP | dgr.kostacademy.com | +213 542 30 53 83

Format exact:
Objet: [objet]

[corps]`,

      linkedin: `Tu es commercial chez KOST GROUP, premier centre IATA CBTA certifié d'Algérie.
Rédige un message LinkedIn CIBLÉ pour:
- ${p.decision_maker_name}, ${p.decision_maker_title} chez ${p.company_name}
- Contexte métier: ${ctx}
- Il reste ${daysLeft} jours avant le renforcement des contrôles IATA

Règles STRICTES:
- 280 caractères MAX
- Commence par leur prénom
- Mentionne leur rôle/entreprise — montrer que c'est personnalisé
- Angle urgence: deadline réglementaire + KOST = seul centre CBTA en Algérie
- CTA court: "Session août dispo — 30 min cette semaine?"
- PAS de spam, zéro générique

Message (280 chars max):`,

      followup: `Tu es commercial chez KOST GROUP.
Relance pour ${p.decision_maker_name} chez ${p.company_name} — pas de réponse. Il reste ${daysLeft} jours.

Règles:
- 200 caractères max
- Ton direct, pas insistant — nouvel angle urgence
- Ex: "Les places août se remplissent — êtes-vous concerné par l'obligation IATA avant septembre?"
- PAS "j'ai envoyé un message précédemment"

Message de relance:`,

      summary: `Fiche de briefing commercial URGENT pour ${p.company_name}:
Secteur: ${ctx}
Décideur: ${p.decision_maker_name}, ${p.decision_maker_title}
Effectif: ~${p.estimated_staff} personnes
Délai: ${daysLeft} jours avant deadline IATA

Rédige une fiche en 4 points:
1. OBLIGATION LÉGALE: Quelle obligation DGR IATA précise pour leur secteur (article IATA)
2. RISQUES CONCRETS: 2 risques réels (amende, incident, suspension vol) si non-conformité avant septembre
3. ANGLE DE CLOSING: Meilleur argument pour ce profil (${p.decision_maker_title}) — focus urgence deadline
4. OBJECTIONS PROBABLES: 2 objections + réponse en 1 phrase chacune

Factuel et actionnable. Max 200 mots.`,
    }

    return prompts[type] || prompts.email
  }

  // Batch mode
  if (batchProspects && Array.isArray(batchProspects)) {
    const results = await Promise.all(
      batchProspects.map(async (p: Record<string, unknown>) => {
        const prompt = buildPrompt(p)
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 500,
            messages: [{ role: 'user', content: prompt }],
          }),
        })
        const data = await res.json()
        return { id: p.id, text: data.content?.[0]?.text || '' }
      })
    )
    return NextResponse.json({ results })
  }

  // Single mode
  const prompt = buildPrompt(prospect)
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await res.json()
  const text = data.content?.[0]?.text || ''

  return NextResponse.json({ text })
}
