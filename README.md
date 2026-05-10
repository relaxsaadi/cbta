# KOST Academy — Funnel de vente

Funnel multi-pays + multi-formations pour KOST Academy, 1<sup>er</sup> centre IATA CBTA Provider en Algérie.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4
- Framer Motion · Lucide-react
- Resend (emails) · Zod (validation)
- @next/third-parties (GTM)

## Démarrage

```bash
pnpm install
cp .env.example .env.local      # éditer les valeurs
pnpm dev                         # http://localhost:3000
```

## Build production

```bash
pnpm build && pnpm start
```

## Routes

- `/` — Landing principale
- `/dgr-7-1` … `/dgr-7-10` — Pages dédiées par fonction
- `/merci` — Confirmation post-formulaire (déclenche la conversion `generate_lead`)
- `/mentions-legales` · `/confidentialite`
- `POST /api/lead` — endpoint formulaire

## Variables d'environnement

Voir `.env.example`. Les variables vides sont sans effet (fail silently).

## Tracking

- GTM container `GTM-5DVWQ5QH` chargé dans le layout root.
- `lib/tracking.ts` expose `trackEvent`, `trackLead`, `trackPhoneClick`, `trackWhatsApp`.
- Conversion `generate_lead` déclenchée sur `/merci`.

## Déploiement

Plateforme cible : Vercel · Domaine : `formation.kostacademy.com`.
