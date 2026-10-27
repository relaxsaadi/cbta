# KOST FUNNEL — kost-funnel

## Contexte business

Site vitrine + funnel de conversion pour **KOST GROUP** (Algérie).
Produit phare : formations DGR IATA (marchandises dangereuses). Le propriétaire déclare des agréments IATA CBTA et ANAC couvrant les fonctions 7.1 à 7.10 ; la portée, les dates et toute allégation publique doivent être vérifiées sur pièces avant publication. Une déclaration du propriétaire ne vaut pas vérification documentaire indépendante.

- **Domaine principal :** https://dgr.kostacademy.com
- **Email propriétaire :** kostgroupe@gmail.com
- **WhatsApp :** +213 542 30 53 83
- **Adresse :** Alger ; le code postal **16024** est indiqué comme confirmé plus bas dans ce fichier (ne pas réintroduire l'ancienne note contradictoire « 16111 »).
- **Téléphone correct :** +213 542 30 53 83 (GBP affiche encore 0770 70 92 81 — à corriger manuellement)

## Gouvernance DGR/CBTA — impératif pour Claude Code, SEO et E-EXAM (27/10/2026)

**Cette section prime sur toute consigne marketing/SEO plus ancienne présente ici.** L’objectif est de ne plus reproduire la régression de [PR #342](https://github.com/relaxsaadi/cbta/pull/342). Vérifier la cohérence avec [PR #3](https://github.com/relaxsaadi/cbta/pull/3) et [PR #337](https://github.com/relaxsaadi/cbta/pull/337) avant toute modification de contenu public.

- **Évidence des claims** : ne jamais publier ou réintroduire « seul/premier centre en Algérie », « reconnu par 300+ compagnies », reconnaissance universelle, « certificat/examen officiel IATA », conformité ANAC automatique, ou exclusivité sans preuve documentaire actuelle, spécifique, datée et correctement portée (registre, certificat ou décision selon le claim). Une formation CBTA Provider et un agrément national ne démontrent pas par eux-mêmes tous ces autres énoncés. Conserver les claims en état **SOURCE GAP / NON VÉRIFIÉ** plutôt que les affirmer sans preuve.
- **Fonctions 7.1–7.10** : choisir la formation d’après les tâches et compétences CBTA de la fonction visée, non d’après « transitaire », « expéditeur » ou toute autre étiquette métier. Ne pas transférer mécaniquement les questions ni la structure à 44 sous-tâches de 7.1 vers les autres fonctions.
- **Durées / tarification / reconnaissance** : ne promettre ni certificat délivré automatiquement ni durée universelle de 3 jours, ni date/session, prix ou reconnaissance sans vérification de l’offre applicable. Traiter les différences entre sources comme conflits explicites et bloquants pour le claim concerné.
- **Surfaces publiques** : maintenir strictement cohérents contenu visible, titres/méta descriptions, OpenGraph, JSON-LD (FAQ, Course, Organization), landing pages, annonces et FAQ ; aucune nouvelle promesse indirecte par données structurées.
- **Banque d'examen** : toute affirmation réglementaire doit être appuyée directement sur le texte IATA DGR **67e édition 2026**, preuve **Tier A** licitement consultée ; état SOURCE GAP/CONFLICT si manque/discordance. Vérifier indépendamment les références **FR** et réaliser la revue technique **EN** séparément ; ne jamais marquer APPROVED sans reviewer humain qualifié identifié et date. Ne pas contourner le DRM ni présenter la présence d'une matrice/blueprint comme une approbation.
- **Confidentialité** : le dépôt GitHub est **public** et [issue #340](https://github.com/relaxsaadi/cbta/issues/340) constate des clés de réponses de brouillons publiées. Ne plus committer d'items, bonnes réponses, justifications ou paquets de revue confidentiels dans ce dépôt/branches/CI/logs. Les éléments déjà publics ne sont pas automatiquement éligibles à des examens certificatifs sécurisés ; stockage restreint, inventaire d'exposition et remplacement contrôlé sont requis.
- **Livraison** : code/métadonnées, DGR réglementaire, plateforme Moodle/console, sécurité/RBAC, audit, sauvegarde/restauration et déploiement constituent des gates distincts. Aucune commande `--prod`, aucune fusion ni statut « PLATFORM READY TO USE » sans vérifications de release complètes. Les déploiements Vercel de `kost-funnel` ne valident pas l'environnement E-EXAM.

## Stack technique

- **Next.js 15** App Router + TypeScript + Tailwind CSS v4
- **Vercel** — production sur `dgr.kostacademy.com`
- **Vercel Analytics** — déjà intégré
- Package manager : **pnpm**

### Commandes dev

```bash
pnpm dev          # dev server
pnpm build        # build prod
pnpm lint         # lint
npx tsc --noEmit  # typecheck
vercel deploy     # déploiement Preview (sans --prod)
# vercel deploy --prod  # PRODUCTION : seulement après validation explicite du release gate
```

## Google Ads

### Comptes

| Rôle | ID | Nom |
|---|---|---|
| MCC (manager) | 621-731-0903 | Strategixs |
| Compte KOST DGR | **984-210-4215** | KOST CBTA IATA DGR |

> Note : l'ancien ID 158-188-2217 (1581882217) est un compte différent — le compte actif est **9842104215**.

### Campagne active

- **Nom :** `KOST_DGR_IATA_DZ`
- **ID :** `customers/9842104215/campaigns/23966837689`
- **Statut :** ENABLED
- **Budget :** 15 EUR/jour
- **Ciblage :** Algérie + Maroc + Tunisie + Sénégal + Côte d'Ivoire + Cameroun + Gabon + Mali
- **7 Ad Groups**, 35 keywords (exact + phrase), 7 RSA
- **Assets :** 4 sitelinks + 5 callouts + 1 liste de négatifs (21 mots-clés)

### Conversions Google Ads

| Conversion | ID | Label | Valeur |
|---|---|---|---|
| Formulaire DGR soumis | 7663143348 | `ls35CLSTicYcEMHsv4NE` | 150 EUR |
| Clic WhatsApp DGR | 7662775343 | `C6pMCK_Y8sUcEMHsv4NE` | 50 EUR |
| Clic téléphone DGR | 7663158439 | `ZzkeCKeJisYcEMHsv4NE` | 50 EUR |

**Tag Google Ads :** `AW-9842104215`

### Credentials Google Ads API (dans `/Users/mac/Documents/Google Ads/.env`)

```
GOOGLE_ADS_DEVELOPER_TOKEN=...
GOOGLE_ADS_CLIENT_ID=1037692095065-jm4t0c7pie68v38b7vmgo73r7hno5jcq.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=...
GOOGLE_ADS_REFRESH_TOKEN=...
GOOGLE_ADS_LOGIN_CUSTOMER_ID=6217310903   # MCC
GOOGLE_ADS_CUSTOMER_ID=4958512498         # TripSun (default) — utiliser 9842104215 pour KOST
```

### Commandes Google Ads API

```bash
# Travailler depuis le répertoire Google Ads factory
cd "/Users/mac/Documents/Google Ads"

# Charger le .env manuellement (python-dotenv ne marche pas en heredoc)
env = {}
with open('.env') as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip()

# Config client
client = GoogleAdsClient.load_from_dict({
    "developer_token": env["GOOGLE_ADS_DEVELOPER_TOKEN"],
    "client_id": env["GOOGLE_ADS_CLIENT_ID"],
    "client_secret": env["GOOGLE_ADS_CLIENT_SECRET"],
    "refresh_token": env["GOOGLE_ADS_REFRESH_TOKEN"],
    "login_customer_id": env["GOOGLE_ADS_LOGIN_CUSTOMER_ID"],
    "use_proto_plus": True,
})
```

## Variables d'environnement Vercel (Production)

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | `AW-9842104215` |
| `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` | `ls35CLSTicYcEMHsv4NE` (formulaire) |
| `NEXT_PUBLIC_GOOGLE_ADS_WHATSAPP_LABEL` | `C6pMCK_Y8sUcEMHsv4NE` |
| `NEXT_PUBLIC_GOOGLE_ADS_PHONE_LABEL` | `ZzkeCKeJisYcEMHsv4NE` |

Pour ajouter une variable :
```bash
vercel env add NOM_VAR production <<< "valeur"
```

## CRM (GoHighLevel)

- **Sous-compte GHL du projet :** `CBTA`
- `GHL_LOCATION_ID` = `sZiMpgnNwbxf1QYUyTaN` → correspond au sous-compte `CBTA` (Private Integration Token, pas le token agence)
- `GHL_TOKEN` = Private Integration Token du sous-compte `CBTA` (stocké dans `.env.local` + Vercel Production, jamais commité)
- `GHL_WEBHOOK_URL` — variable historique (webhook GHL), toujours présente en Production ; à vérifier si encore utilisée vs l'API directe avec `GHL_TOKEN`
- Un token **agence** GHL distinct existe (relationship number `0-271-520`) mais n'est pas stocké pour l'instant — redemander si besoin d'actions au niveau agence (multi-sous-comptes).

## Tracking (`lib/tracking.ts`)

- `trackLead(data)` — fire conversion **Formulaire DGR soumis** (valeur 150 EUR) + GA4 + LinkedIn + Meta
- `trackPhoneClick()` — fire conversion **Clic téléphone DGR** (valeur 50 EUR)
- `trackWhatsApp(location)` — fire conversion **Clic WhatsApp DGR** (valeur 50 EUR)
- `trackEvent(name, params)` — GA4 dataLayer générique

Le tag Google Ads est chargé dans `components/AnalyticsLoader.tsx` via `NEXT_PUBLIC_GOOGLE_ADS_ID`.
La conversion formulaire est tirée dans `app/merci/MerciTracker.tsx`.

## Fixes techniques Google Ads API v24 (proto_plus)

### `final_urls` sur un sitelink
Le champ `final_urls` est sur l'**Asset**, pas sur `SitelinkAsset` :
```python
asset = op.create
asset.final_urls.extend(["https://..."])  # ← ici, pas dans sitelink_asset
asset.sitelink_asset.link_text = "..."
```

### FieldMask pour update campaign
`client.get_type("FieldMask")` n'existe pas en v24 — utiliser protobuf directement :
```python
from google.protobuf import field_mask_pb2
op.update_mask.CopyFrom(field_mask_pb2.FieldMask(paths=["status"]))
```

### Callout text — limite 25 caractères
La limite est de 25 caractères. Ne pas utiliser une allégation de primauté (« 1er centre »), même si elle respecte la longueur, sans preuve externe actuelle et vérifiable.

### `load_dotenv()` en heredoc stdin
`find_dotenv()` plante en stdin. Lire `.env` manuellement avec `open('.env')`.

### proto3 optional bool (EU political ads)
```python
campaign._pb.contains_eu_political_advertising = 3  # 3 = DOES_NOT_CONTAIN
```

## Règles importantes

- **NEVER** committer `.env`, `.env.*`, `credentials.json`
- Les fichiers `.mcp.json`, `.notfair.json` sont dans `.gitignore` (non commités)
- Les campagnes Google Ads créées en PAUSED — activer manuellement ou via API après review
- Developer token = **Explorer access** → ne peut pas créer de sous-comptes via API, et ne peut PAS non plus appeler `KeywordPlanIdeaService.GenerateKeywordIdeas` (erreur "This method is not allowed for use with explorer access. Please apply for basic or standard access.", vérifié 2026-08-18). Toute recherche de volume de mots-clés doit passer par un autre outil (ex. extension Keyword Surfer, ou upgrade du token en Basic/Standard access auprès de Google).
- Toujours utiliser `warnings.filterwarnings('ignore')` avec la lib google-ads (Python 3.9)

## Google Business Profile

Fiche "Kost Academy" sur Google Maps : https://maps.app.goo.gl/oqJqBNFpBHTSL83d7
Téléphone et site web (dgr.kostacademy.com) déjà corrects sur la fiche depuis le 07/08/2026.

**Code postal correct : 16024** (confirmé par le compte CCP Algérie Poste officiel au nom
d'EURL KOST GROUPE — adresse : CITE BOUSHAKI F.N 176 BEZ ALGER - 16024). L'ancienne note
de ce fichier indiquant 16111 était fausse ; corrigé le 07/08/2026 dans layout.tsx,
Footer.tsx, contact/page.tsx, formation-dgr-afrique/page.tsx, a-propos/page.tsx,
entreprises/page.tsx.
Le code postal 16024 sur GBP est donc déjà correct — rien à changer côté GBP.

Ancienne note (août 2026) : 4,3★ / 12 avis. Ne pas reprendre ces chiffres comme preuve actuelle, ni dans `aggregateRating`, sans source Google récente et vérifiable ; voir la correction de claims en PR #337.

## Structure du projet

```
app/                  ← Next.js App Router pages
  merci/              ← page de confirmation (déclenche trackLead)
  contact/            ← page contact
  a-propos/           ← page à propos
components/
  AnalyticsLoader.tsx ← charge gtag + Google Ads tag
lib/
  tracking.ts         ← toutes les fonctions de tracking
public/
```

## Scripts disponibles Google Ads Factory

```
/Users/mac/Documents/Google Ads/scripts/
  create_campaign.py   ← crée campagne depuis config YAML
  delete_campaign.py   ← supprime campagne
  test_connection.py   ← teste connexion API
  create_subaccount.py ← crée sous-compte dans MCC
  cleanup_draft_accounts.py
/Users/mac/Documents/Google Ads/config/
  kostacademy.yaml     ← config KOST DGR (customer_id: 9842104215)
  tripsun.yaml         ← config TripSun
/Users/mac/Documents/Google Ads/runlogs/
  20260621_231218_kostacademy_KOST_DGR_IATA_DZ_live.json  ← log création campagne
```
