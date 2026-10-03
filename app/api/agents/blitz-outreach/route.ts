import { NextRequest, NextResponse } from 'next/server'
import { assertSafeDgrMarketingCopy, SAFE_DGR_MARKETING_RULES } from '@/lib/dgr-marketing-claims'

const SECTOR_CONTEXT: Record<string, string> = {
  airline:           'compagnie aérienne — opérations cargo, dispatch et transport aérien',
  ground_handler:    'société de handling — opérations piste, rampe et cargo',
  freight_forwarder: 'transitaire — expéditions aériennes et marchandises dangereuses',
  oil_gas:           'entreprise pétrolière — expéditions aériennes d’équipements et produits réglementés',
  courier:           'courrier express — batteries lithium et marchandises réglementées',
  pharma:            'laboratoire pharma — produits biologiques, cryogéniques et réglementés',
  airport_authority: 'autorité aéroportuaire — opérations et sécurité liées au fret',
  chemical:          'entreprise chimique — transport aérien de matières dangereuses',
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
  const text = data.content?.[0]?.text || ''
  assertSafeDgrMarketingCopy(text)
  return text
}

export async function POST(req: NextRequest) {
  const { prospect } = await req.json()
  const ctx = SECTOR_CONTEXT[prospect.sector] || 'activité pouvant être concernée par des exigences DGR'
  const name = prospect.decision_maker_name?.split(' ')[0] || 'Monsieur/Madame'
  const company = prospect.company_name

  try {
    const [email, linkedin, whatsapp] = await Promise.all([
      callClaude(`Tu es directeur commercial de KOST GROUP, organisme de formation DGR/CBTA.
Rédige un email de prospection B2B pour :
- Destinataire : ${prospect.decision_maker_name}, ${prospect.decision_maker_title}
- Entreprise : ${company} — ${ctx}

Règles STRICTES :
- Objet sobre, sans fausse urgence
- Corps : MAX 120 mots, 3 paragraphes
- Présente le besoin comme à vérifier, pas comme une obligation déjà établie
- Ne recommande aucune fonction CBTA sans analyse validée fournie
- CTA : proposer un échange court ou une réponse WhatsApp +213 542 30 53 83
- Signature : Karim Saadi — KOST GROUP | dgr.kostacademy.com | +213 542 30 53 83
${SAFE_DGR_MARKETING_RULES}
Format exact :
Objet: [objet]

[corps]`, 500),

      callClaude(`Tu es commercial KOST GROUP. Message LinkedIn InMail pour ${prospect.decision_maker_name}, ${prospect.decision_maker_title} chez ${company} (${ctx}).

Règles ABSOLUES :
- 280 caractères MAXIMUM
- Commence par leur prénom : "${name},"
- Reste factuel sur leur métier
- Ne crée aucune date limite, sanction, obligation, approbation IATA/ANAC ou statut de centre non vérifié
- CTA court : proposer de vérifier leur besoin DGR/CBTA
${SAFE_DGR_MARKETING_RULES}
Message (280 chars max) :`, 150),

      callClaude(`Tu es Karim de KOST GROUP. Message WhatsApp professionnel pour ${prospect.decision_maker_name}, ${prospect.decision_maker_title} chez ${company}.

Contexte : ${ctx}.

Règles :
- Ton professionnel mais direct
- 3-4 émojis max
- Max 150 mots
- Commence par "Bonjour ${name} 👋"
- Présente KOST comme organisme de formation DGR/CBTA et propose de vérifier ensemble le besoin
- Ne crée aucune urgence réglementaire, date, sanction, session, approbation ou exclusivité
- CTA : répondre ici ou appel direct
- Finir par signature courte : "Karim — KOST GROUP ✈️"
${SAFE_DGR_MARKETING_RULES}
Message WhatsApp :`, 300),
    ])

    return NextResponse.json({ email, linkedin, whatsapp })
  } catch (error) {
    return NextResponse.json(
      { error: 'Copie commerciale bloquée par le garde de conformité', detail: String(error) },
      { status: 422 }
    )
  }
}
