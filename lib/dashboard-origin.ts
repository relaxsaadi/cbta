/**
 * Cross-site request forgery guard for browser-triggered, Basic-authenticated
 * dashboard API mutations. Browser Basic credentials are ambient auth.
 * Vercel scheduled cron GET is authenticated separately before this check.
 */
export type DashboardMutationOrigin = {
  pathname: string
  method: string
  requestOrigin: string | null
  referer: string | null
  fetchSite: string | null
  targetOrigin: string
}

export function isSafeDashboardMutation(input: DashboardMutationOrigin): boolean {
  if (!input.pathname.startsWith('/api/')) return true
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(input.method)) return true

  const source = input.requestOrigin || input.referer
  if (!source) return false
  try {
    if (new URL(source).origin !== input.targetOrigin) return false
  } catch {
    return false
  }
  return !input.fetchSite || input.fetchSite === 'same-origin'
}
