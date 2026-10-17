/**
 * Central Vercel Cron authentication for the scheduled GET endpoints only.
 *
 * Vercel sends CRON_SECRET in Authorization: Bearer <value>.
 * The secret must never appear in an URL, NEXT_PUBLIC_* variable or browser bundle.
 * Empty/missing configuration fails closed, including if a caller sends
 * "Bearer undefined".
 */
export const VERCEL_CRON_PATHS: ReadonlySet<string> = new Set([
  '/api/agent/run',
  '/api/agent/followup',
  '/api/agent/intel',
  '/api/prospects/scan',
  '/api/agents/africa-scan',
  '/api/agents/send-email',
  '/api/agents/followup',
])

export function isScheduledCronPath(pathname: string): boolean {
  return VERCEL_CRON_PATHS.has(pathname)
}

export function hasValidVercelCronBearer(headers: Headers): boolean {
  const secret = process.env.CRON_SECRET
  return Boolean(secret && headers.get('authorization') === `Bearer ${secret}`)
}
