import { NextRequest, NextResponse } from 'next/server'
import { assertSafeDgrMarketingCopy, SAFE_DGR_MARKETING_RULES } from '@/lib/dgr-marketing-claims'

function normalizeFunctions(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => /^7\.(?:10|[1-9])(?:\b|\s|[-—:])/.test(item))
}

function normalizeSessions(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { prospect, headcount, commercialTerms } = body

  if (!prospect?.company_name) {
    return NextResponse.json({ error: 'Prospect/company_name is required' }, { status: 400 })
  }

  const functions = normalizeFunctions(body.functions)
  const sessions = normalizeSessions(body.sessions)
  const commercialTermsText = typeof commercialTerms === 'string' && commercialTerms.trim()
    ? commercialTerms.trim()
    : 'Aucun tarif ou terme commercial vérifié fourni — indiquer « sur devis » et ne créer aucun chiffre.'
  const headcountText = Number.isFinite(Number(headcount)) && Number(headcount) > 0
    ? String(Number(headcount))
    : 'non confirmé'
  const functionsText = functions.length
    ? functions.join(', ')
    : 'Aucune fonction validée fournie — ne pas recommander de fonction ; indiquer qu’elle sera déterminée après analyse du poste et de la table de tâches CBTA applicable.'
  const sessionsText = sessions.length
    ? sessions.join(' ; ')
    : 'Aucune session confirmée fournie — ne pas inventer de date.'

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
        content: `Génère une proposition commerciale professionnelle en HTML (corps seulement, style inline) pour :

CLIENT : ${prospect.company_name}
CONTACT : ${prospect.decision_maker_name || 'non confirmé'}, ${prospect.decision_maker_title || 'fonction non confirmée'}
SECTEUR : ${prospect.sector || 'non confirmé'}
EFFECTIF À FORMER : ${headcountText}
FONCTIONS CBTA VALIDÉES FOURNIES : ${functionsText}
SESSIONS CONFIRMÉES FOURNIES : ${sessionsText}
TERMES COMMERCIAUX VÉRIFIÉS FOURNIS : ${commercialTermsText}

PRESTATAIRE : KOST GROUP — organisme de formation DGR/CBTA
CONTACT KOST : Karim Saadi | kostgroupe@gmail.com | +213 542 30 53 83 | dgr.kostacademy.com

HTML requis :
- Entête KOST GROUP
- Section « Objet de la proposition »
- Section « Besoin à qualifier » : décrire uniquement les éléments fournis, sans inventer d'obligation, de fonction CBTA ou de sanction
- Section « Périmètre de formation » : utiliser uniquement les fonctions explicitement fournies ci-dessus ; sinon écrire que le périmètre sera déterminé après analyse validée
- Section « Offre commerciale » : reprendre uniquement les termes commerciaux explicitement fournis ; sinon « sur devis »
- Section « Sessions » : reprendre uniquement les sessions explicitement fournies ; sinon ne pas afficher de date
- CTA neutre : « Valider le périmètre et recevoir l'offre finale »
- Pied de page avec coordonnées KOST
- Style professionnel et sobre
${SAFE_DGR_MARKETING_RULES}

IMPORTANT : ne calcule, n'invente ni ne complète aucun prix, remise, taux de réussite, durée, date, catégorie/fonction, échéance réglementaire, sanction, certification, agrément ou approbation absent des données d'entrée.

Réponds UNIQUEMENT avec le HTML (pas de markdown, pas d'explication).`,
      }],
    }),
  })

  const data = await res.json()
  const html = data.content?.[0]?.text || ''

  try {
    assertSafeDgrMarketingCopy(html)
  } catch (error) {
    return NextResponse.json(
      { error: 'Proposition bloquée par le garde de conformité', detail: String(error) },
      { status: 422 }
    )
  }

  return NextResponse.json({
    html,
    summary: {
      company: prospect.company_name,
      contact: prospect.decision_maker_name || null,
      headcount: headcountText === 'non confirmé' ? null : Number(headcountText),
      functions,
      categories: functions,
      sessions,
      commercial_terms_provided: commercialTermsText !== 'Aucun tarif ou terme commercial vérifié fourni — indiquer « sur devis » et ne créer aucun chiffre.',
    },
  })
}
