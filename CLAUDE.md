# KOST FUNNEL — kost-funnel

## Contexte business

Site vitrine + funnel de conversion pour **KOST GROUP** (Algérie).
Produit phare : formations DGR IATA (marchandises dangereuses) — premier centre IATA CBTA certifié d'Algérie.

- **Domaine principal :** https://dgr.kostacademy.com
- **Email propriétaire :** kostgroupe@gmail.com
- **WhatsApp :** +213 542 30 53 83
- **Adresse :** Alger, code postal **16111** (GBP à corriger — affiche encore 16024)
- **Téléphone correct :** +213 542 30 53 83 (GBP affiche encore 0770 70 92 81 — à corriger manuellement)

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
vercel --prod     # déployer en staging + promouvoir
vercel deploy --prod  # déployer directement en prod
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
"1er Centre CBTA en Algérie" = trop long. Max 25 chars.

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

Avis Google réels : 4.3★ / 12 avis (utilisés dans le schema aggregateRating).

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
