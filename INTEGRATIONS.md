# INTEGRATIONS — Funnel KOST DGR

Ce document explique comment configurer et tester chaque intégration du funnel (GHL, Resend, GA4, Google Ads, LinkedIn, Meta).

Philosophie : toutes les intégrations sont **optionnelles**. Si une variable d'environnement est vide, l'intégration correspondante est désactivée silencieusement. Le formulaire continue de fonctionner et l'utilisateur est toujours redirigé vers `/merci`.

---

## Architecture du flux lead

```
[User submit]
     │
     ▼
[/api/lead] ─── Zod validation ─── Honeypot ───┐
     │                                          │
     ├──► GHL Webhook (CRM principal)           │  toutes en parallèle
     ├──► Resend (notif interne)                │  timeout 10s
     │                                          │
     ▼                                          │
[Vercel Logs] ◄────── always logged ◄───────────┘
     │
     ▼
[Response 200 OK]
     │
     ▼
[Redirect /merci?f=…&p=…&v=…&tx=…]
     │
     ▼
[MerciTracker mount]
     ├──► dataLayer.push('generate_lead', {value, country, formation, transaction_id})
     ├──► gtag('event', 'conversion', {send_to, transaction_id})  ← Google Ads
     ├──► lintrk('track', {conversion_id})                        ← LinkedIn
     └──► fbq('track', 'Lead')                                    ← Meta
```

---

## 1. GHL — GoHighLevel (CRM principal)

GHL reçoit tous les leads et déclenche les workflows (email de bienvenue au prospect, attribution commercial, SMS, etc.).

### Récupérer l'URL webhook

1. GHL → **Sub-Account** → **Settings → Workflows** (ou Automation).
2. Créer un nouveau workflow → Trigger : **Webhook**.
3. Copier l'URL fournie (`https://services.leadconnectorhq.com/hooks/...`).
4. Dans le workflow, ajouter au minimum :
   - **Create Contact** → mapper les champs (firstName, lastName, email, phone, country, company)
   - **Add Tags** → utiliser le champ `tags` du payload
   - **Send Email** template "Bienvenue + programme demandé" (utiliser `{{contact.custom_field.formation}}`)
   - **Notify user** (assign to sales)

### Payload envoyé

```json
{
  "firstName": "Aïcha",
  "lastName": "Benali",
  "fullName": "Aïcha Benali",
  "email": "aicha@example.com",
  "phone": "+212600000000",
  "country": "Maroc",
  "company": "Royal Air Cargo",
  "formation": "DGR 7.3 Initial",
  "message": "On a 4 personnes à former",
  "source": "dgr.kostacademy.com",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "dgr-maroc-jan26",
  "utm_term": "",
  "utm_content": "",
  "gclid": "Cj0KCQ...",
  "fbclid": "",
  "tags": ["KOST-DGR", "Maroc", "DGR 7.3 Initial"],
  "submittedAt": "2026-05-10T14:32:18.412Z"
}
```

### Tester

1. Configurer `GHL_WEBHOOK_URL=https://services.leadconnectorhq.com/hooks/...` dans Vercel.
2. Soumettre une vraie demande depuis le site.
3. Vérifier le contact dans GHL → Contacts (filter Tag = `KOST-DGR`).
4. Vérifier les logs Vercel : tu dois voir `[lead][ghl] pushed OK (200)`.

### Variable d'env

| Clé | Valeur |
|---|---|
| `GHL_WEBHOOK_URL` | `https://services.leadconnectorhq.com/hooks/<account>/<workflow>` |

---

## 2. Resend — Notification interne

Resend envoie **uniquement** un email de notification à `kostgroupe@gmail.com` à chaque lead. L'email de bienvenue au prospect est géré par GHL.

### Récupérer la clé API

1. Créer un compte sur [resend.com](https://resend.com) (gratuit jusqu'à 3 000 emails/mois).
2. **API Keys** → Create API Key → scope "Sending access" → copier `re_xxx`.
3. **Domains** → Add Domain → `kostacademy.com` → suivre les instructions DNS Bluehost (SPF + DKIM).
4. Une fois le domaine vérifié, configurer `RESEND_FROM_EMAIL="KOST GROUP <noreply@kostacademy.com>"`.

### Variables d'env

| Clé | Valeur |
|---|---|
| `RESEND_API_KEY` | `re_xxx` |
| `RESEND_FROM_EMAIL` | `KOST GROUP <noreply@kostacademy.com>` (sinon fallback `onboarding@resend.dev`) |
| `NOTIFICATION_EMAIL` | `kostgroupe@gmail.com` |

### Tester

Soumettre un lead → kostgroupe@gmail.com reçoit un email avec tableau récapitulatif (nom, email, WhatsApp, formation, UTM, gclid…). Logs Vercel : `[lead][resend] notification sent OK`.

---

## 3. Google Analytics 4 (via GTM)

GTM container `GTM-5DVWQ5QH` est déjà branché dans le layout root. Tous les events partent dans `dataLayer`.

### Connecter GA4 via GTM

1. GA4 → Admin → Streams → copier l'ID de mesure `G-XXXXXXX`.
2. GTM → Tags → New → **Google Tag** → Measurement ID `G-XXXXXXX` → Trigger "All Pages" → Save & Publish.
3. (Optionnel) configurer une variable d'env `NEXT_PUBLIC_GA_ID=G-XXXXXXX` si tu veux aussi charger `gtag.js` directement (utile si Google Ads activé en parallèle).

### Events dataLayer disponibles

| Event | Où | Paramètres |
|---|---|---|
| `view_landing` | mount landing / DGR | `path` |
| `page_view_custom` | mount page DGR | `formation` (ex: `DGR 7.3 Initial`) |
| `scroll_50` | scroll 50% | — |
| `scroll_90` | scroll 90% | — |
| `click_pricing_cta` | clic tableau formation | `formation` |
| `click_whatsapp` | clic bouton WhatsApp | `location` (hero, sticky, dgr-…) |
| `click_phone` | clic téléphone | — |
| `form_start` | premier focus form | — |
| `form_submit_attempt` | submit | — |
| `form_submit_error` | erreur (validation, http, network) | `error` |
| **`generate_lead`** | **mount /merci** — **CONVERSION** | `value`, `currency: 'EUR'`, `country`, `formation`, `transaction_id` |

### Marquer `generate_lead` comme conversion GA4

GA4 → Admin → Events → trouve `generate_lead` (apparaît après le premier déclenchement) → toggle "Mark as conversion".

---

## 4. Google Ads — Conversion Tracking

### Étapes

1. Google Ads → Outils → Conversions → Nouvelle action → **Site Web**.
2. Type : Soumission de formulaire (lead) · Valeur : 1000 EUR · Nombre : Un par clic.
3. Récupérer **Conversion ID** (`AW-1234567890`) et **Conversion Label** (string court).
4. Variables Vercel :

| Clé | Valeur |
|---|---|
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | `AW-1234567890` |
| `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` | `aBcD1234EfG` |

Une fois ces deux variables remplies, `gtag.js` est chargé et l'event `conversion` part automatiquement depuis `/merci`. Le `transaction_id` (hash SHA-256 court de `email+timestamp` calculé côté client) permet à Google de dédupliquer si l'utilisateur recharge `/merci`.

### Tester

1. **Google Tag Assistant** (extension Chrome) → ouvrir le site → soumettre form → onglet "Tags Fired" doit montrer `Google Ads Conversion`.
2. Google Ads → Conversions → la première conversion apparaît dans les 24h.

---

## 5. LinkedIn Insight Tag

### Étapes

1. LinkedIn Campaign Manager → **Account Assets → Insight Tag** → copier le **Partner ID** (numérique, ex: `1234567`).
2. **Conversion Tracking** → Create conversion → "Lead" → choisir "Site-wide Insight Tag" → copier le **Conversion ID** (numérique).
3. Variables Vercel :

| Clé | Valeur |
|---|---|
| `NEXT_PUBLIC_LINKEDIN_PARTNER_ID` | `1234567` |
| `NEXT_PUBLIC_LINKEDIN_CONVERSION_ID` | `12345678` |

Le Insight Tag est chargé dans le **layout root** (toutes les pages, pas seulement `/merci`). L'event de conversion `lintrk('track', {conversion_id})` part depuis `/merci`.

### Tester

LinkedIn **Insight Tag Helper** (extension Chrome) → ouvrir le site → l'extension doit afficher "Insight Tag detected" et compter les page views. Soumettre form → onglet conversion doit incrémenter.

---

## 6. Meta Pixel (Facebook / Instagram)

Optionnel. Si activé, `fbq('track','Lead', {value:1000, currency:'EUR'})` part depuis `/merci`.

| Clé | Valeur |
|---|---|
| `NEXT_PUBLIC_META_PIXEL_ID` | `1234567890123456` |

Tester avec l'extension Chrome **Meta Pixel Helper**.

---

## 7. UTM & Click IDs

Le hook `lib/useUTMParams.ts` lit automatiquement depuis l'URL et persiste 30 jours en `sessionStorage` :

- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- `gclid` (Google Ads click ID — auto-tagging)
- `fbclid` (Meta click ID)

Si l'utilisateur arrive avec `?utm_source=google&gclid=Cj0KC...`, ces valeurs voyagent jusque dans le webhook GHL **même si l'utilisateur navigue entre les pages avant de soumettre**.

---

## 8. Configurer Vercel

Project → **Settings → Environment Variables** → cocher `Production`, `Preview`, `Development` pour chaque clé.

Après ajout/modif → **Deployments → ⋯ → Redeploy** pour qu'elles soient actives.

---

## 9. Checklist de mise en prod

- [ ] `NEXT_PUBLIC_GTM_ID` rempli ✅ (déjà `GTM-5DVWQ5QH`)
- [ ] `NEXT_PUBLIC_SITE_URL=https://dgr.kostacademy.com` rempli
- [ ] `GHL_WEBHOOK_URL` rempli + workflow GHL actif + tags configurés
- [ ] `RESEND_API_KEY` + `RESEND_FROM_EMAIL` (domaine vérifié)
- [ ] `NEXT_PUBLIC_GA_ID` (GA4 ID)
- [ ] Tag GA4 publié dans GTM
- [ ] `NEXT_PUBLIC_GOOGLE_ADS_ID` + `..._CONVERSION_LABEL`
- [ ] Conversion `generate_lead` marquée dans GA4 Admin
- [ ] `NEXT_PUBLIC_LINKEDIN_PARTNER_ID` + `..._CONVERSION_ID`
- [ ] `NEXT_PUBLIC_META_PIXEL_ID` (optionnel)
- [ ] DNS Bluehost : CNAME `dgr` → `cname.vercel-dns.com`
- [ ] Test bout-en-bout : submit form réel → vérifier GHL contact + email kostgroupe@gmail.com + dataLayer event + Tag Assistant
