# Convention UTM — KOST DGR Funnel

## Le problème : "Unassigned" dans GA4

Dans GA4 → **Rapports > Acquisition > Acquisition de trafic**, un canal
**"Unassigned"** (Non attribué) anormalement élevé signifie que GA4 reçoit des
sessions qu'il n'arrive pas à classer dans une source/support connu
(Organic Search, Paid Search, Referral, Direct...).

Sur ce site, la cause probable est le **trafic de prospection sortante non
tagué** : liens envoyés en message LinkedIn, en DM WhatsApp, en post LinkedIn
ou en email à froid, qui pointent vers `dgr.kostacademy.com` (ou une page
enfant) **sans paramètres `utm_*`**. GA4 ne peut alors pas savoir que ce
clic vient d'une action de prospection — il tombe dans "Unassigned" (ou parfois
"Direct", selon le referrer transmis par l'app source).

**La correction ne touche pas le code.** GA4 (via le tag GTM déjà en place,
voir `components/AnalyticsLoader.tsx` et `app/layout.tsx`) parse
automatiquement les paramètres `utm_source`, `utm_medium`, `utm_campaign`,
`utm_content` et `utm_term` présents dans l'URL d'atterrissage, sans
configuration supplémentaire. Ce document fixe uniquement la **convention de
nommage** à utiliser par les humains et les outils de prospection (LinkedIn,
WhatsApp, email) pour que chaque lien envoyé soit correctement attribué.

Stack de tracking existante (rappel, pour contexte — ne pas modifier) :
- GA4 + Google Ads conversions : chargés via `GoogleTagManager` dans
  `app/layout.tsx` (`NEXT_PUBLIC_GTM_ID`), déclenchés par les événements
  poussés dans `window.dataLayer` par `lib/tracking.ts`
  (`trackLead`, `trackPhoneClick`, `trackWhatsApp`, etc.)
- LinkedIn Insight Tag + Meta Pixel : chargés dans
  `components/AnalyticsLoader.tsx`

---

## Convention de nommage UTM

Toujours en **minuscules**, mots séparés par des **tirets** (`-`), jamais
d'espaces ni d'accents (évite les problèmes d'encodage et les doublons dans
les rapports GA4, qui sont sensibles à la casse).

### `utm_source` — d'où vient le clic

| Valeur | Usage |
|---|---|
| `linkedin` | Tout trafic issu de LinkedIn (DM, post, commentaire, profil) |
| `whatsapp` | Tout trafic issu d'un message WhatsApp envoyé manuellement |
| `email` | Emailing / prospection à froid par email |
| `google` | Réservé à Google Ads (déjà auto-tagué via `gclid`, ne pas dupliquer avec des UTM manuels) |
| `facebook` / `instagram` | Si prospection ou posts sur ces réseaux |

### `utm_medium` — le type de canal/interaction

Règle : `utm_medium` décrit **comment** le contenu a été délivré, pas la
plateforme (ça, c'est `utm_source`).

| Valeur | Quand l'utiliser |
|---|---|
| `dm` | Message privé direct (LinkedIn DM, WhatsApp direct) — prospection 1:1 |
| `post` | Lien inséré dans un post/publication publique (LinkedIn, Facebook) |
| `organic-social` | Contenu social non sponsorisé en général (si `post` est trop précis) |
| `message` | Message générique quand `dm` ne s'applique pas clairement |
| `email` | Email de prospection à froid |
| `referral` | Lien partagé par un tiers (partenaire, article, mention) |
| `cpc` | Réservé aux campagnes payantes (Google/Meta Ads) |

Règle rapide par canal :
- **LinkedIn DM outreach** → `utm_source=linkedin&utm_medium=dm`
- **LinkedIn post/contenu** → `utm_source=linkedin&utm_medium=post`
- **WhatsApp DM outreach** → `utm_source=whatsapp&utm_medium=dm`
- **Email à froid** → `utm_source=email&utm_medium=email`

### `utm_campaign` — slug de campagne

Convention : `outreach-<annee>-<mois>-<segment>`

- `<annee>` : `2026` (4 chiffres)
- `<mois>` : `01` à `12` (2 chiffres)
- `<segment>` : audience/marché ciblé, en kebab-case
  (ex. `algerie-transitaires`, `maroc-compagnies-aeriennes`,
  `cote-ivoire-fret-aerien`, `entreprises-cargo`)

Exemples :
- `outreach-2026-08-algerie-transitaires`
- `outreach-2026-08-maroc-compagnies-aeriennes`
- `outreach-2026-09-relance-leads-froids`

Pour du contenu organique (posts) plutôt que de la prospection active, on
peut préfixer différemment pour distinguer dans les rapports :
- `content-2026-08-dgr-cat7` (post LinkedIn sur la catégorie 7)

### `utm_content` (optionnel) — variante/message

À utiliser quand plusieurs variantes du même message/lien sont testées dans
la même campagne (A/B de message, plusieurs relances, plusieurs
interlocuteurs) :
- `message-v1`, `message-v2`
- `relance-1`, `relance-2`
- `signature-email`, `corps-email`

---

## Liens UTM prêts à l'emploi

Pages réelles du site (confirmées dans `app/`) : page d'accueil (`/`),
`/formation-dgr-algerie`, `/entreprises`, `/contact`,
`/formation-dgr-cote-ivoire`, `/formation-dgr-maroc`, etc.

### 1. LinkedIn — message DM (prospection directe)

Cible un transitaire algérien contacté en DM LinkedIn, on l'envoie vers la
page formation Algérie :

```
https://dgr.kostacademy.com/formation-dgr-algerie?utm_source=linkedin&utm_medium=dm&utm_campaign=outreach-2026-08-algerie-transitaires&utm_content=message-v1
```

### 2. LinkedIn — post/contenu

Lien mis en commentaire ou en bio sous un post LinkedIn sur la certification
CBTA, renvoyant vers la page d'accueil :

```
https://dgr.kostacademy.com/?utm_source=linkedin&utm_medium=post&utm_campaign=content-2026-08-dgr-cat7&utm_content=post-cbta-certification
```

### 3. WhatsApp — message direct (le CTA WhatsApp est central sur le site)

Envoyé en message WhatsApp à un prospect entreprise (import/export, fret),
vers la page entreprises :

```
https://dgr.kostacademy.com/entreprises?utm_source=whatsapp&utm_medium=dm&utm_campaign=outreach-2026-08-entreprises-cargo&utm_content=message-v1
```

> Note : ceci concerne les liens **envoyés** par WhatsApp vers le site
> (attribution d'entrée). Les clics **sortants** vers WhatsApp depuis le site
> (le CTA `+213 542 30 53 83`) sont déjà trackés côté produit par
> `trackWhatsApp()` dans `lib/tracking.ts` — aucun lien à changer là.

### 4. Email — prospection à froid

Email de prospection envoyé à des compagnies aériennes/agents de handling,
renvoyant vers la page de contact :

```
https://dgr.kostacademy.com/contact?utm_source=email&utm_medium=email&utm_campaign=outreach-2026-08-maroc-compagnies-aeriennes&utm_content=corps-email
```

### 5. Relance / suivi (variante de contenu)

Deuxième relance WhatsApp sur un lead qui n'a pas répondu, vers la page
formation Côte d'Ivoire :

```
https://dgr.kostacademy.com/formation-dgr-cote-ivoire?utm_source=whatsapp&utm_medium=dm&utm_campaign=outreach-2026-08-cote-ivoire-transitaires&utm_content=relance-2
```

---

## Comment vérifier que ça fonctionne

1. Dans GA4 : **Rapports > Acquisition > Acquisition de trafic**
   (ou le rapport en temps réel pour un test immédiat après un clic).
2. Changer la dimension principale en **"Source/support de la session"**
   (Session source/medium).
3. Après diffusion de liens taggés, on doit voir apparaître des lignes du
   type `linkedin / dm`, `whatsapp / dm`, `email / email`, etc. — au lieu
   que ce trafic tombe dans `(not set) / (not set)` ou `Unassigned`.
4. Pour vérifier une campagne précise : ajouter la dimension secondaire
   **"Campagne de session"** et filtrer sur le slug (ex.
   `outreach-2026-08-algerie-transitaires`) pour voir le volume de sessions,
   et croiser avec les événements `generate_lead` (voir `trackLead` dans
   `lib/tracking.ts`) pour mesurer les conversions par campagne.
5. Test rapide avant diffusion en masse : ouvrir le lien taggé soi-même,
   puis vérifier dans **GA4 > Temps réel > Vue d'ensemble** que la session
   apparaît avec la bonne source/support dans les 60 secondes.

## Règles à retenir

- Ne jamais UTM-tagger les liens Google Ads (déjà gérés par `gclid` +
  auto-tagging Google) — n'utiliser cette convention que pour les canaux
  manuels : LinkedIn, WhatsApp, email, réseaux sociaux organiques.
- Toujours utiliser `outreach-<annee>-<mois>-<segment>` pour garder les
  campagnes triables chronologiquement dans GA4.
- Un lien = un `utm_content` si plusieurs messages/variantes sont testés,
  sinon l'omettre est acceptable.
- Ce fichier ne modifie aucun comportement de l'app — c'est un document de
  référence pour les humains et les outils de prospection.
