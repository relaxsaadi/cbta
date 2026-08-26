# ==========================================================================
# KOST E-EXAM V2 — image Docker de production
#
# Repris du Dockerfile V1 (platform-ops/kost-eexam-console-src/Dockerfile) —
# même structure multi-étapes, même choix de copier node_modules complet
# plutôt que le mode "standalone" (bug connu de tracing des symlinks pnpm
# avec Next.js 16). Node 24 (pas 22 comme V1) : `node:sqlite` est natif
# ici, sans dépendance de compilation — voir docs/KOST_EEXAM_V2_ARCHITECTURE.md
# §4. Aucune image `-slim`/native-build requise (contrairement à un
# éventuel choix better-sqlite3, écarté justement pour cette raison).
#
# Ce Dockerfile n'a PAS encore été utilisé pour un déploiement réel — voir
# §26 de la mission : aucune action de production sans confirmation
# explicite. Prêt pour revue avant mise en service.
# ==========================================================================

FROM node:24-alpine AS base
RUN corepack enable

# ---- deps ----
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* .npmrc* ./
RUN pnpm install --frozen-lockfile

# ---- build ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ---- runtime ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /app/data/backups && chown -R nextjs:nodejs /app/data

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
# Le dossier lib/ complet (pas seulement schema.sql) : les scripts CLI
# (migrate/seed-demo/backup/restore-test) importent lib/*.ts directement à
# l'exécution via tsx — l'app Next.js elle-même n'en a pas besoin (déjà
# bundlé dans .next/), mais les scripts, si.
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Volume monté en production pour le fichier SQLite + les sauvegardes —
# jamais dans l'image elle-même (données candidats hors du conteneur
# immuable, survit à un redéploiement).
VOLUME ["/app/data"]

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DB_PATH=/app/data/kost-eexam-v2.db
ENV BACKUP_DIR=/app/data/backups

CMD ["node_modules/.bin/next", "start"]
