import { NextRequest, NextResponse } from 'next/server'
import { assertSafeDgrMarketingCopy, SAFE_DGR_MARKETING_RULES } from '@/lib/dgr-marketing-claims'

const SECTOR_CONTEXT: Record<string, string> = {
  airline:           'compagnie aérienne transportant du fret et pouvant être concernée par des exigences DGR',
  ground_handler:    'opérateur de handling aéroportuaire manipulant du fret et des marchandises réglementées',
  freight_forwarder: 'transitaire organisant des expéditions aériennes',
  oil_gas:           'entreprise pétrolière expédiant des équipements et produits par avion',
  courier:           'coursier express traitant notamment des batteries lithium et marchandises réglementées',
  pharma:            'laboratoire pharmaceutique expédiant des produits biologiques et réglementés par avion',
  airport_authority: 'autorité aéroportuaire impliquée dans des opérations de conformité et sécurité',
  chemical:          'entreprise chimique expédiant des matières dangereuses par voie aérienne',
}

export async function POST(req: NextRequest) {
  const { type, prospect, batchProspects } = await req.json()

  const buildPrompt = (p: Record<string, unknown>) => {
    const ctx = SECTOR_CONTEXT[p.sector as string] || p.sector || 'entreprise du secteur aérien/logistique'

    const prompts: Record<string, string> = {
      email: `Tu es responsable commercial chez KOST GROUP, organisme de formation DGR/CBTA.
Rédige un email de prospection B2B ciblé pour :
- Décideur : ${p.decision_maker_name}, ${p.decision_maker_title}
- Entreprise : ${p.company_name} — ${ctx}
- Effectif estimé : ${p.estimated_staff ?? 'non confirmé'}

Objectif : proposer un échange sur les besoins de formation DGR/CBTA sans supposer la fonction applicable, le calendrier, le prix, une approbation ou une obligation réglementaire non vérifiée.

Règles :
- Objet sobre, sans fausse urgence ni menace réglementaire
- Corps : 3 paragraphes, 120 mots max
- Paragraphe 1 : contexte métier spécifique
- Paragraphe 2 : KOST peut aider à identifier le besoin de formation approprié à partir des fonctions CBTA validées
- Paragraphe 3 : CTA simple — répondre ou WhatsApp +213 542 30 53 83
- Pas de « j'espère que vous allez bien »
- Signature : Karim Saadi — KOST GROUP | dgr.kostacademy.com | +213 542 30 53 83
${SAFE_DGR_MARKETING_RULES}
Format exact :
Objet: [objet]

[corps]`,

      linkedin: `Tu es commercial chez KOST GROUP, organisme de formation DGR/CBTA.
Rédige un message LinkedIn ciblé pour :
- ${p.decision_maker_name}, ${p.decision_maker_title} chez ${p.company_name}
- Contexte métier : ${ctx}

Règles STRICTES :
- 280 caractères MAX
- Commence par leur prénom
- Mentionne leur rôle/entreprise
- Ne crée aucune urgence réglementaire, date limite, sanction ou revendication IATA/ANAC non vérifiée
- CTA court : proposer un échange sur leurs besoins DGR/CBTA
- Zéro spam, zéro générique
${SAFE_DGR_MARKETING_RULES}
Message (280 chars max) :`,

      followup: `Tu es commercial chez KOST GROUP.
Relance sobre pour ${p.decision_maker_name} chez ${p.company_name} — pas de réponse connue.

Règles :
- 200 caractères max
- Ton direct, pas insistant
- Ne prétends pas qu'une échéance ou sanction réglementaire s'applique sans preuve fournie
- Propose simplement de vérifier si un besoin DGR/CBTA existe
${SAFE_DGR_MARKETING_RULES}
Message de relance :`,

      summary: `Fiche de briefing commercial factuelle pour ${p.company_name} :
Secteur : ${ctx}
Décideur : ${p.decision_maker_name}, ${p.decision_maker_title}
Effectif estimé : ${p.estimated_staff ?? 'non confirmé'}

Rédige une fiche en 4 points :
1. CONTEXTE : ce qui peut rendre une formation DGR/CBTA pertinente pour ce secteur, sans conclure à une obligation
2. POINTS À VÉRIFIER : sources réglementaires actuelles, fonctions CBTA pertinentes, périmètre du personnel
3. ANGLE DE DISCUSSION : meilleur point d'entrée pour ce profil
4. QUESTIONS DE QUALIFICATION : 2 questions qui permettent d'éviter toute recommandation inventée

N'invente aucun article IATA, sanction, délai, prix, session, fonction CBTA, approbation ou référence client.
${SAFE_DGR_MARKETING_RULES}
Factuel et actionnable. Max 200 mots.`,
    }

    return prompts[type] || prompts.email
  }

  const generate = async (p: Record<string, unknown>) => {
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
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = await res.json()
    const text = data.content?.[0]?.text || ''
    assertSafeDgrMarketingCopy(text)
    return text
  }

  try {
    if (batchProspects && Array.isArray(batchProspects)) {
      const results = await Promise.all(
        batchProspects.map(async (p: Record<string, unknown>) => ({ id: p.id, text: await generate(p) }))
      )
      return NextResponse.json({ results })
    }

    const text = await generate(prospect)
    return NextResponse.json({ text })
  } catch (error) {
    return NextResponse.json(
      { error: 'Copie commerciale bloquée par le garde de conformité', detail: String(error) },
      { status: 422 }
    )
  }
}
