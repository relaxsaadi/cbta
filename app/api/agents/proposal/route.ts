import { NextRequest, NextResponse } from 'next/server'

const DAYS_LEFT = Math.max(0, Math.ceil((new Date('2026-09-30').getTime() - Date.now()) / 86400000))

const CATEGORIES_BY_SECTOR: Record<string, string[]> = {
  airline:           ['Cat. 7.3 — Acceptation cargo DGR', 'Cat. 7.1 — Expéditeurs', 'Cat. 7.5 — Personnel au sol', 'Cat. 1 — Pilotes & cabin crew'],
  ground_handler:    ['Cat. 7.5 — Personnel au sol', 'Cat. 7.3 — Acceptation cargo DGR', 'Cat. 7.4 — Personnel piste'],
  freight_forwarder: ['Cat. 7.1 — Expéditeurs DGR', 'Cat. 7.6 — Agents de fret', 'Cat. 7.3 — Acceptation'],
  oil_gas:           ['Cat. 7.1 — Expéditeurs', 'Cat. 7.5 — Personnel au sol', 'Cat. 7.6 — Agents de fret'],
  courier:           ['Cat. 7.1 — Expéditeurs DGR', 'Cat. 7.3 — Acceptation', 'Cat. 7.6 — Agents de fret'],
  pharma:            ['Cat. 7.1 — Expéditeurs DGR', 'Cat. 7.6 — Agents de fret', 'Cat. 7.5 — Personnel au sol'],
  airport_authority: ['Cat. 7.5 — Personnel au sol', 'Cat. 7.4 — Personnel piste', 'Cat. 7.3 — Acceptation cargo'],
}

const PRICING = {
  individual: 450,    // EUR per person
  group5: 380,        // EUR per person (5+)
  group10: 320,       // EUR per person (10+)
  urgency_discount: 50, // EUR discount for booking before Aug 15
}

export async function POST(req: NextRequest) {
  const { prospect, headcount = 5 } = await req.json()

  const categories = CATEGORIES_BY_SECTOR[prospect.sector] || ['Cat. 7.1 — Expéditeurs DGR', 'Cat. 7.3 — Acceptation cargo']
  const pricePerPerson = headcount >= 10 ? PRICING.group10 : headcount >= 5 ? PRICING.group5 : PRICING.individual
  const urgencyPrice = pricePerPerson - PRICING.urgency_discount
  const totalNormal = pricePerPerson * headcount
  const totalUrgency = urgencyPrice * headcount

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Génère une proposition commerciale professionnelle en HTML (corps seulement, style inline) pour:

CLIENT: ${prospect.company_name}
CONTACT: ${prospect.decision_maker_name}, ${prospect.decision_maker_title}
SECTEUR: ${prospect.sector}
EFFECTIF ESTIMÉ: ${prospect.estimated_staff || 'NC'} personnes
CATÉGORIES RECOMMANDÉES: ${categories.join(', ')}
NOMBRE DE PERSONNES À FORMER: ${headcount}

PRESTATAIRE: KOST GROUP — 1er centre IATA CBTA certifié d'Algérie
CONTACT KOST: Karim Saadi | kostgroupe@gmail.com | +213 542 30 53 83 | dgr.kostacademy.com

TARIFS:
- Tarif individuel: ${PRICING.individual} EUR/personne
- Groupe 5-9 personnes: ${PRICING.group5} EUR/personne
- Groupe 10+ personnes: ${PRICING.group10} EUR/personne
- OFFRE SPÉCIALE avant 15 août: -${PRICING.urgency_discount} EUR/personne → ${urgencyPrice} EUR/personne
- Total pour ${headcount} personnes: ${totalNormal} EUR (ou ${totalUrgency} EUR si inscription avant 15 août)

SESSIONS DISPONIBLES:
- Session Août 2026: 18-22 août (PLACES LIMITÉES — il reste ${DAYS_LEFT} jours)
- Session Septembre 2026: 15-19 septembre (dernière session avant deadline IATA)

OBLIGATION LÉGALE: Échéance IATA septembre 2026 — risque de suspension opérationnelle

HTML requis:
- Entête avec logo KOST GROUP (texte, fond #0f2557)
- Section "Objet de la proposition"
- Section "Vos obligations IATA" (spécifique à leur secteur)
- Section "Notre solution" (CBTA, certifications, taux réussite 95%)
- Tableau des formations recommandées avec catégories + durée + prix
- Section "Offre commerciale" avec tableau de prix + offre early bird
- Section "Prochaines sessions" avec dates
- CTA rouge : "Confirmer l'inscription — Session Août 2026"
- Pied de page avec coordonnées KOST
- Style: professionnel, sobre, couleurs #0f2557 (bleu) + #dc2626 (rouge urgent)

Réponds UNIQUEMENT avec le HTML (pas de markdown, pas d'explication).`,
      }],
    }),
  })

  const data = await res.json()
  const html = data.content?.[0]?.text || ''

  return NextResponse.json({
    html,
    summary: {
      company: prospect.company_name,
      contact: prospect.decision_maker_name,
      headcount,
      categories,
      total_normal: totalNormal,
      total_early_bird: totalUrgency,
      sessions: ['18-22 août 2026', '15-19 septembre 2026'],
    },
  })
}
