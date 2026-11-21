import type { NextRequest } from 'next/server'

// CRON_SECRET authenticates only Vercel's scheduled GETs. These manual
// dashboard operations must independently verify human Basic credentials.
// Middleware protects the same prefixes; this is a second fail-closed gate.
export function requireDashboardRequest(req: NextRequest): Response | null {
  const expectedUser = process.env.DASHBOARD_USER
  const expectedPass = process.env.DASHBOARD_PASSWORD
  if (!expectedUser || !expectedPass) {
    return new Response('Dashboard authentication is not configured', { status: 503 })
  }

  const header = req.headers.get('authorization')
  if (!header?.startsWith('Basic ')) {
    return new Response('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="KOST Dashboard"' },
    })
  }
  let valid = false
  try {
    const decoded = atob(header.slice(6))
    const separator = decoded.indexOf(':')
    valid = separator > 0 &&
      decoded.slice(0, separator) === expectedUser &&
      decoded.slice(separator + 1) === expectedPass
  } catch {
    // Malformed Basic header.
  }
  if (!valid) return new Response('Unauthorized', { status: 401 })

  // Basic authentication is ambient browser state. A same-origin user
  // initiation check is mandatory for side-effecting POST and SSE GET.
  const source = req.headers.get('origin') || req.headers.get('referer')
  if (!source) return new Response('Same-origin request required', { status: 403 })
  try {
    if (new URL(source).origin !== req.nextUrl.origin) {
      return new Response('Forbidden', { status: 403 })
    }
    const fetchSite = req.headers.get('sec-fetch-site')
    if (fetchSite && fetchSite !== 'same-origin') {
      return new Response('Forbidden', { status: 403 })
    }
    // These GET streams perform writes and must originate from dashboard.
    // Reject link previews, direct navigation, cross-origin embeddings.
    if (req.method === 'GET') {
      const referer = req.headers.get('referer')
      if (!referer) return new Response('Dashboard referrer required', { status: 403 })
      const url = new URL(referer)
      if (url.origin !== req.nextUrl.origin || !url.pathname.startsWith('/dashboard/')) {
        return new Response('Dashboard referrer required', { status: 403 })
      }
    }
  } catch {
    return new Response('Invalid request origin', { status: 403 })
  }
  return null
}
