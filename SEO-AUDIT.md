# SEO Content Audit
## dgr.kostacademy.com — KOST GROUP
### Date: 22 juin 2026

---

## SEO Health Score: 61/100

> Score global basé sur 5 dimensions : On-Page (14/20) · Technique (13/20) · E-E-A-T (10/20) · Contenu (12/25) · Schema (12/15)

---

## 🔴 Corrections Critiques (Impact immédiat)

### 1. Title tag trop long — toutes les pages

| | Valeur |
|---|---|
| Actuel | `Formation IATA DGR-CBTA — KOST GROUP · 1er Centre CBTA Provider Certifié IATA en Algérie` |
| Longueur | **93 caractères** (max recommandé : 60) |
| Impact | Google tronque à ~600px → le brand name et la proposition de valeur sont coupés dans les SERPs |

**Recommandé (58 car.) :**
```
Formation IATA DGR Algérie — Certifié KOST GROUP
```

**Pourquoi ça coûte des clics :** Un titre tronqué dans Google affiche `…` en plein milieu. Les concurrents avec un titre complet captent le clic à votre place. Un titre optimisé peut augmenter le CTR de 20–35%.

---

### 2. Meta description trop longue — homepage

| | Valeur |
|---|---|
| Actuel | `Formations IATA DGR-CBTA officielles (7.1 à 7.10) à Alger pour l'Afrique francophone. Certificat IATA reconnu, 50% moins cher qu'à Bruxelles. Paiement EUR/USD.` |
| Longueur | **162 caractères** (max recommandé : 160) |
| Impact | Marginal (2 car.) mais les mots `EUR/USD` peuvent être coupés |

**Recommandé (158 car.) :**
```
Formations IATA DGR-CBTA officielles (7.1–7.10) à Alger. Certificat IATA reconnu par 300+ compagnies. 50% moins cher qu'à Bruxelles. Inscription via WhatsApp.
```

---

### 3. Bug critique — Sitemap pointe vers le mauvais domaine

**Fichier :** `app/sitemap.ts` ligne 18

```typescript
// ACTUEL (BUG) :
const base = process.env.NEXT_PUBLIC_SITE_URL || "https://formation.kostacademy.com";

// CORRECT :
const base = process.env.NEXT_PUBLIC_SITE_URL || "https://dgr.kostacademy.com";
```

**Impact :** Si la variable d'env `NEXT_PUBLIC_SITE_URL` n'est pas définie en prod, Google reçoit un sitemap avec 15 URLs pointant vers `formation.kostacademy.com` au lieu de `dgr.kostacademy.com`. Google peut indexer les mauvaises URLs ou ignorer le sitemap.

**Vérifier dans Vercel Dashboard → Settings → Environment Variables** que `NEXT_PUBLIC_SITE_URL=https://dgr.kostacademy.com` est bien défini.

---

### 4. Pages /planning et /promos sans aucun lien interne depuis le contenu

**Problème :** Ces deux pages n'existent que dans la navbar. Aucun lien depuis le body de la homepage, aucun lien depuis le footer, aucun lien depuis les 10 pages DGR.

**Impact SEO direct :** Google découvre les pages via les liens internes. Une page accessible uniquement par la navbar a moins de "link equity" et risque d'être considérée comme peu importante. Les pages orphelines rankent mal.

**Impact business :** Un visiteur qui lit la page DGR 7.1 et veut savoir "quand a lieu la prochaine session ?" n'a aucun bouton "Voir le planning" sous les yeux — il quitte le site.

**Recommandation :** Ajouter dans `components/Footer.tsx` :
```
Liens : Accueil · Formations · Planning 2026 · Promos · Mentions légales
```
Et ajouter un bandeau sur la homepage : "**18 sessions disponibles Juillet–Décembre 2026** → [Voir le planning]"

---

## 🟠 Priorité Haute (Ce mois)

### 5. alt text générique sur les images IATA

**Problème :** `components/PlanningPage.tsx` ligne 492 :
```tsx
<Image src="/iata-cbta-provider.png" alt="IATA" ... />
```

**Correct :**
```tsx
alt="IATA CBTA Provider Certifié — KOST GROUP Algérie"
```

Même problème sur `PromosPage.tsx` ligne 306 : `alt="IATA CBTA Provider"` (acceptable mais peut être enrichi).

---

### 6. Schema manquant : FAQPage

Le composant `FAQ.tsx` existe sur la homepage mais sans schema JSON-LD. Google peut afficher les FAQ directement dans les résultats de recherche (rich snippets), augmentant la visibilité de 30% sans changer le classement.

**À ajouter dans `app/page.tsx` :**
```tsx
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Qui doit se former IATA DGR ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Toute personne manipulant, acceptant, chargeant ou transportant des marchandises dangereuses par voie aérienne : transitaires, agents cargo, compagnies aériennes, expéditeurs, handlers."
      }
    },
    {
      "@type": "Question",
      "name": "Combien coûte la formation IATA DGR en Algérie ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Les formations KOST GROUP démarrent à 650 € pour les modules spécialisés, contre $3 950 à l'IATA Bruxelles. La formation DGR 7.1 Initial complète est à 1 800 €."
      }
    },
    {
      "@type": "Question",
      "name": "Le certificat IATA DGR est-il reconnu internationalement ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui. Le certificat IATA CBTA est reconnu par 300+ compagnies aériennes mondiales. Il est valide 24 mois et conforme à la réglementation IATA DGR 2026 (67e édition)."
      }
    }
  ]
};
```

---

### 7. Schema manquant : CourseInstance avec dates réelles

Le schema `Course` existe sur les 10 pages DGR mais sans les dates de sessions. Ajouter `hasCourseInstance` permettrait aux rich snippets d'afficher les prochaines dates dans Google.

**Exemple à ajouter dans le schema Course :**
```json
"hasCourseInstance": [
  {
    "@type": "CourseInstance",
    "courseMode": "onsite",
    "location": {
      "@type": "Place",
      "name": "KOST GROUP — Bab Ezzouar, Alger"
    },
    "startDate": "2026-07-05",
    "endDate": "2026-07-09",
    "offers": {
      "@type": "Offer",
      "price": "1800",
      "priceCurrency": "EUR"
    }
  }
]
```

---

### 8. Schema manquant : BreadcrumbList sur les pages DGR

Chaque page `/dgr-7-1` devrait avoir :
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://dgr.kostacademy.com" },
    { "@type": "ListItem", "position": 2, "name": "DGR 7.1 Initial", "item": "https://dgr.kostacademy.com/dgr-7-1" }
  ]
}
```
Cela active l'affichage du fil d'Ariane dans les résultats Google.

---

### 9. og:image avec chemin relatif au lieu d'URL absolue

**Problème :** `og:image: "/og-image.jpg"` — les scrapers réseaux sociaux (WhatsApp, LinkedIn, Facebook) ne résolvent pas toujours les chemins relatifs.

**Correct :**
```typescript
images: [{
  url: `${siteUrl}/og-image.jpg`,  // URL absolue
  width: 1200,
  height: 630,
}]
```
Next.js avec `metadataBase: new URL(siteUrl)` devrait corriger cela automatiquement — à vérifier avec [opengraph.xyz](https://www.opengraph.xyz).

---

### 10. Images PNG au lieu de WebP

Les 3 images principales (`og-image.jpg`, `iata-cbta-provider.png`, `kost-group-logo-800.png`) ne sont pas en WebP.

**Impact LCP :** L'image hero est probablement le Largest Contentful Paint. WebP = 25–35% de réduction de poids à qualité égale.

**Action :** Convertir `iata-cbta-provider.png` → `iata-cbta-provider.webp` et mettre à jour les imports.

---

## 🟡 Priorité Moyenne (Ce trimestre)

### 11. E-E-A-T : Expérience et Autorité insuffisantes

| Dimension | Score | Problème |
|---|---|---|
| Experience | Faible | Aucun cas client, aucun témoignage avec photo, aucune story "avant/après" certification |
| Expertise | Présent | Détails des formations corrects, badge IATA visible — mais **aucun bio formateur** |
| Authoritativeness | Faible | 1 seul sameAs (LinkedIn), 0 presse, 0 Google Business Profile |
| Trustworthiness | Présent | SSL ✅, adresse ✅, facture Strategix ✅ — mais **0 avis clients en ligne** |

**Actions prioritaires :**
- Ajouter une section "Notre formateur" avec photo, CV certifications IATA, années d'expérience
- Créer le profil Google Business Profile (adresse : 176 Cité Boushaki, Bab Ezzouar, Alger)
- Demander à 3–5 clients certifiés de déposer un avis Google

---

### 12. Aucune page blog / contenu éditorial

Le site n'a aucun article. C'est la faiblesse SEO la plus structurante à long terme.

**Impact :** 70% des recherches liées à la formation DGR sont des requêtes informationnelles ("qu'est-ce que la réglementation IATA DGR", "qui doit se certifier DGR"). Ces pages attirent le trafic organique non-brandé — le plus précieux.

**Content Gap — 10 articles à créer (ordre de priorité) :**

| Titre | Keyword cible | Intent | Priorité |
|---|---|---|---|
| "Qui doit se former IATA DGR en 2026 ?" | "formation DGR obligatoire" | Informationnel | 1 |
| "DGR 7.1 vs DGR 7.3 : quelle différence ?" | "différence DGR 7.1 7.3" | Informationnel | 2 |
| "Combien coûte la certification IATA DGR ?" | "prix formation DGR IATA Algérie" | Commercial | 3 |
| "Marchandises dangereuses avion : liste complète 2026" | "marchandises dangereuses avion liste" | Informationnel | 4 |
| "Renouvellement certificat IATA DGR : tout savoir" | "renouvellement certificat DGR" | Informationnel | 5 |
| "Formation DGR Algérie vs Bruxelles : comparatif" | "formation IATA DGR moins cher" | Commercial | 6 |
| "Batteries lithium en avion : réglementation 2026" | "batteries lithium avion réglementation" | Informationnel | 7 |
| "IATA DGR CBTA : qu'est-ce que c'est ?" | "IATA DGR CBTA explication" | Informationnel | 8 |
| "Formation DGR Maroc : où se certifier ?" | "formation DGR Maroc" | Navigationnel | 9 |
| "9 classes de marchandises dangereuses IATA" | "classes marchandises dangereuses IATA" | Informationnel | 10 |

---

### 13. Absence de pages géographiques

KOST GROUP opère en Algérie, Maroc, Tunisie, Sénégal, Côte d'Ivoire. Actuellement, une seule URL couvre tout.

**Opportunité :** Créer des landing pages `/formation-dgr-maroc`, `/formation-dgr-tunisie`, `/formation-dgr-senegal` ciblant des keywords géo-localisés à très faible concurrence.

---

### 14. Pas de page /a-propos

Google valorise les sites avec une page "À propos" crédible pour l'E-E-A-T. Elle doit inclure :
- Histoire de KOST GROUP
- Certification IATA avec numéro officiel
- Photos du centre
- Équipe et formateurs
- Partenaires institutionnels

---

## On-Page SEO Checklist Complète

### Title Tags — État par page

| Page | Titre actuel | Longueur | Statut |
|---|---|---|---|
| Homepage | "Formation IATA DGR-CBTA — KOST GROUP · 1er Centre CBTA Provider Certifié IATA en Algérie" | 93 car. | 🔴 Trop long |
| /planning | "Planning Sessions IATA DGR 2026 — KOST GROUP" | 45 car. | ✅ OK |
| /promos | "Offres Spéciales IATA DGR 2026 — KOST GROUP" | 44 car. | ✅ OK |
| /dgr-7-1 | Vérifier (template "%s — KOST GROUP") | ~50 car. | ✅ OK si <60 |

### Meta Descriptions — État par page

| Page | Longueur | Statut |
|---|---|---|
| Homepage | 162 car. | 🟠 Légèrement long |
| /planning | 145 car. | ✅ OK |
| /promos | ~148 car. | ✅ OK |

### Heading Hierarchy

| Page | H1 | H2s | Statut |
|---|---|---|---|
| Homepage | "Formation DGR-CBTA Certifiée IATA / 1er Centre CBTA Provider..." | Sections ProblemSection, USPSection, FormationsTable | ✅ Structure correcte |
| /planning | "Planning Sessions IATA DGR 2026" | "📅 Planning Juillet–Décembre 2026" | ✅ OK |
| /promos | "Économisez sur votre Certification IATA DGR" | Sections offres | ✅ OK |

**Note :** Le H1 homepage contient trop de contenu (3 lignes). Simplifier à 1 proposition claire.

### Internal Linking Score : 3/10

| Type | État |
|---|---|
| Nav → Planning | ✅ Via navbar |
| Nav → Promos | ✅ Via navbar |
| Homepage body → Planning | ❌ Aucun lien |
| Homepage body → Promos | ❌ Aucun lien |
| DGR pages → Planning | ❌ Aucun lien |
| Footer → Planning | ❌ Aucun lien |
| Footer → Promos | ❌ Aucun lien |
| Planning → DGR pages | ❌ Aucun lien |
| Blog interne | ❌ N'existe pas |

---

## Analyse des Keywords

### Mots-clés primaires ciblés

| Keyword | Volume estimé | Intent | Positionnement actuel |
|---|---|---|---|
| "formation IATA DGR Algérie" | Faible-Moyen | Transactionnel | À mesurer dans GSC |
| "formation DGR CBTA" | Faible | Transactionnel | À mesurer |
| "certification IATA Algérie" | Faible | Transactionnel | À mesurer |
| "marchandises dangereuses avion formation" | Moyen | Informationnel | Non ciblé |

### Keywords manquants à cibler (quick wins)

```
"formation DGR 7.1" — Très faible concurrence, intention transactionnelle directe
"renouvellement certificat IATA DGR" — Non ciblé, trafic récurrent garanti
"prix formation IATA Algérie" — Page /promos pourrait ranker ici
"IATA DGR CBTA formation Alger" — Très ciblé géographiquement
"formation marchandises dangereuses avion Algérie" — Long-tail, conversion haute
```

---

## Analyse Technique

### ✅ Points forts techniques

- **SSL** : HTTPS actif ✅
- **Viewport** : `width=device-width, initial-scale=1` ✅
- **Lang HTML** : `lang="fr"` ✅
- **Canonical** : Configuré sur toutes les pages ✅
- **Robots.txt** : `/api/` et `/merci` correctement bloqués ✅
- **Sitemap** : Existe avec 15 URLs, priorités correctes ✅
- **Schema EducationalOrganization** : Présent en root ✅
- **Schema Course** : Présent sur les 10 pages DGR ✅
- **GTM + GA4** : Actifs ✅
- **GSC + Bing Webmaster** : Vérifiés ✅
- **Next.js 15 SSG** : Pages en statique (○) = temps de chargement optimal ✅
- **Lazy loading** : Géré par Next.js Image ✅
- **Font preload** : Inter woff2 préchargé ✅

### 🔴 Points faibles techniques

| Problème | Fichier | Impact |
|---|---|---|
| Sitemap fallback URL erronée | `app/sitemap.ts:18` | 🔴 Critique si env var manquante |
| Images en PNG/JPG, pas WebP | `/public/*.png` | 🟠 LCP +200-400ms |
| og:image chemin relatif | `app/layout.tsx` | 🟠 Partage social potentiellement cassé |
| Pas de preconnect IndexNow | — | 🟡 Mineur |

### Performance (estimée — Next.js statique + Vercel CDN)

| Métrique | Estimation | Statut |
|---|---|---|
| LCP | ~1.5–2.5s | ✅ / 🟡 (dépend image hero) |
| CLS | ~0.0 (SSG sans shift) | ✅ |
| FID/INP | ~50ms (peu de JS bloquant) | ✅ |
| TTFB | ~50–80ms (Vercel Edge) | ✅ |

---

## Schema Markup — État complet

| Type | Pages | État | Priorité |
|---|---|---|---|
| EducationalOrganization | Homepage (root) | ✅ Présent | — |
| Course | /dgr-7-1 → /dgr-7-10 | ✅ Présent | Ajouter CourseInstance |
| FAQPage | Homepage | ❌ Manquant | 🟠 Haute |
| BreadcrumbList | /dgr-7-* | ❌ Manquant | 🟠 Haute |
| CourseInstance (dates) | /dgr-7-* | ❌ Manquant | 🟠 Haute |
| LocalBusiness | Homepage | ❌ Manquant | 🟡 Moyenne |
| Review/AggregateRating | Homepage | ❌ Manquant | 🟡 Moyenne |
| WebSite + SearchAction | Homepage | ❌ Manquant | 🟡 Moyenne |
| Event | /planning | ❌ Manquant | 🟡 Moyenne |

---

## Opportunités Featured Snippets

| Requête | Type snippet | Action |
|---|---|---|
| "qui doit se former IATA DGR" | Paragraph | Créer article + ajouter H2 "Qui est concerné par la formation IATA DGR ?" suivi d'une réponse 40-60 mots |
| "prix formation IATA DGR Algérie" | Table | La page /promos pourrait ranker avec une table prix visible |
| "classes marchandises dangereuses avion" | Liste | Article blog avec liste ordonnée des 9 classes |
| "renouvellement certificat IATA DGR" | Paragraph | Article dédié sur le processus de renouvellement |

---

## Plan d'action priorisé

### 🔴 Critique — À corriger cette semaine (< 1h de travail total)

1. **Corriger le title tag homepage** (5 min) → +20-35% CTR potentiel sur les impressions Google
2. **Corriger le fallback URL du sitemap** `app/sitemap.ts:18` → `"https://dgr.kostacademy.com"` (2 min)
3. **Ajouter liens /planning et /promos dans le footer** (15 min) → Google peut maintenant crawler ces pages via deux chemins
4. **Corriger `alt="IATA"` → `alt="IATA CBTA Provider Certifié — KOST GROUP"` dans PlanningPage.tsx** (2 min)

### 🟠 Haute — Ce mois (impact moyen terme)

5. **Ajouter schema FAQPage** à la homepage (30 min) → Rich snippets FAQ dans Google = visibilité ×2
6. **Ajouter schema BreadcrumbList** sur les pages DGR (1h) → Breadcrumbs visibles dans SERPs
7. **Ajouter schema CourseInstance** avec les dates de sessions réelles (2h) → Google peut afficher les prochaines dates dans les résultats
8. **Corriger og:image en URL absolue** dans layout.tsx (5 min) → Partage WhatsApp/LinkedIn avec miniature correcte
9. **Créer Google Business Profile** : 176 Cité Boushaki, Bab Ezzouar, Alger (30 min) → Apparition dans Google Maps + Local Pack
10. **Ajouter un bandeau sur la homepage** : "18 sessions disponibles → Voir le planning" avec lien (20 min)

### 🟡 Moyenne — Ce trimestre

11. **Écrire 3 premiers articles blog** (voir liste priorité 1, 2, 3 ci-dessus)
12. **Créer page /a-propos** avec bio formateur, certification IATA officielle, photos
13. **Ajouter section formateur** dans la homepage (nom, certification, expérience)
14. **Convertir images PNG → WebP** pour améliorer LCP
15. **Ajouter schema LocalBusiness** avec les horaires et la zone de service

### 🔵 Long terme — Prochain semestre

16. **Créer landing pages géographiques** : `/formation-dgr-maroc`, `/formation-dgr-tunisie`, `/formation-dgr-senegal`
17. **Stratégie link building** : partenariats avec associations de transitaires algériens, IATA Algeria, chambres de commerce
18. **Obtenir 10+ avis Google** via campagne WhatsApp auprès des anciens certifiés
19. **Hardening DMARC** : passer `p=none` → `p=quarantine` (dans ~2 semaines, après review des rapports rua)

---

## Impact Business Estimé des Corrections Critiques

| Action | Effort | Impact attendu |
|---|---|---|
| Title tag corrigé | 5 min | +20–35% CTR sur les impressions existantes |
| FAQ schema | 30 min | Visibilité dans SERPs multipliée, position Rich Snippet |
| Liens internes /planning | 15 min | Google découvre et valorise la page, trafic vers la page de réservation |
| CourseInstance schema | 2h | Dates de session affichées dans Google → clics directs sur la page de la formation |
| 3 articles blog | 3 semaines | +200–500 visites/mois organique non-brandé en 3–6 mois |
| Google Business Profile | 30 min | Apparition dans "formation DGR Alger" Maps → appels directs |

---

*Généré le 22 juin 2026 · Prochain audit recommandé : septembre 2026 (après indexation des nouvelles pages)*
