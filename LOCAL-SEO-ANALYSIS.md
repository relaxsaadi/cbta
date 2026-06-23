# LOCAL-SEO-ANALYSIS — dgr.kostacademy.com
*23 juin 2026 — Données live post-déploiement*

## Score Local SEO : 38/100

| Dimension | Score | Poids | Pondéré |
|---|---|---|---|
| GBP Signals | 3/25 | 25% | 3 |
| Reviews & Réputation | 0/20 | 20% | 0 |
| Local On-Page SEO | 12/20 | 20% | 12 |
| NAP Consistency & Citations | 8/15 | 15% | 8 |
| Local Schema | 10/10 | 10% | 10 |
| Link & Authority Signals | 5/10 | 10% | 5 |

---

## Type de business : Hybride
Brick-and-mortar (176 Cité Boushaki, Bab Ezzouar, Alger 16111)  
+ Service Area Business (9 pays Afrique francophone)

**Vertical :** EducationalOrganization / Formation professionnelle

---

## Problèmes critiques

### 1. 🔴 Google Business Profile non créé
- Aucun signal GBP détecté sur le site (pas de Maps embed, pas de place ID)
- GBP = 32% du signal local pack (Whitespark 2026 — facteur #1)
- **Action :** Créer sur business.google.com
  - Catégorie principale : "Service de formation"
  - Catégories secondaires : "Formation à la sécurité", "École professionnelle"
  - Lier vers `/contact` (pas la homepage — Sterling Sky Diversity Update)

### 2. 🔴 Zéro avis Google
- Pas d'aggregateRating dans le schéma
- Seuil critique : 10 avis minimum (Sterling Sky)
- Règle des 18 jours : sans nouveau avis pendant 3 semaines → chute de ranking
- **Action :** Obtenir 10 avis en 30 jours après création GBP

### 3. 🔴 `geo` manquant dans le schéma (corrigé v0f06ed1+)
- Latitude/longitude absents → Google ne peut pas calculer la proximité physique
- Proximité = 55.2% de la variance de ranking local
- **Fixé :** `{"@type":"GeoCoordinates","latitude":36.71942,"longitude":3.18274}`

---

## NAP Consistency

| Source | Name | Address | Phone |
|---|---|---|---|
| HTML footer | KOST GROUP | 176 Cité Boushaki, Bab Ezzouar, Alger | +213 542 30 53 83 |
| Schema JSON-LD | KOST GROUP | 176 Cité Boushaki, Bab Ezzouar · 16111 | +213542305383 |
| Facebook | **KT formation** ← INCOHÉRENT | Bab Ezzouar | N/D |
| GBP | Non créé | — | — |
| Bing Places | Non réclamé | — | — |

**Incohérence :** Nom Facebook "KT formation" vs "KOST GROUP" → corriger.

---

## Citations détectées

| Plateforme | Statut |
|---|---|
| Google Business Profile | ❌ Non créé |
| Bing Places | ❌ Non réclamé |
| Apple Business Connect | ❌ Non réclamé |
| Facebook | ✅ Présent (nom incorrect) |
| LinkedIn | ✅ Présent |
| Pagesmaghreb.com | ✅ Présent |
| Algeriejob.com | ✅ Présent |
| Yelp | ❌ Absent |
| BBB | ❌ Absent (N/A Algérie) |

---

## Conflit de sous-domaines (organique)

`cbta.kostacademy.com` rank #1 sur "formation IATA DGR Algérie"  
`dgr.kostacademy.com` = domaine principal (ce projet)

Google choisit un seul sous-domaine à servir par query — les deux se cannibalisent.  
**Recommandation :** Rediriger cbta.kostacademy.com → dgr.kostacademy.com (301)

---

## Top 10 Actions

| # | Action | Impact | Effort |
|---|---|---|---|
| 1 | Créer Google Business Profile | Local pack | 1h |
| 2 | Obtenir 10 premiers avis Google | Rankings | 1 sem |
| 3 | Ajouter `geo` au schéma | ✅ Corrigé | — |
| 4 | Créer Bing Places | ChatGPT/Copilot | 30 min |
| 5 | Ajouter Google Maps embed sur /contact | Local signal | 20 min |
| 6 | Corriger nom Facebook → "KOST GROUP" | NAP | 5 min |
| 7 | `openingHoursSpecification` | ✅ Corrigé | — |
| 8 | `aggregateRating` (après 5+ avis) | CTR +43% | 20 min |
| 9 | Apple Business Connect | Citations | 30 min |
| 10 | Résoudre conflit cbta vs dgr | Organic | Variable |

---

## Limites de cette analyse

- Pas de données geo-grid (positions réelles par zone dans Alger)
- Pas d'accès GBP Insights (vues, clics, appels réels)
- Pas d'audit complet des backlinks (Domain Authority, link velocity)
- Citations vérifiées par search — pas via API (DataForSEO, BrightLocal)
- Positions locales non vérifiées avec VPN Algérie
