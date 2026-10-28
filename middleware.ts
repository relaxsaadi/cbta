import { NextRequest, NextResponse } from 'next/server'

// Only the exact Vercel schedule targets may use the server-only cron bearer.
// A cron credential must never unlock dashboards, streams or arbitrary POSTs.
const SCHEDULED_CRON_GET_PATHS = new Set([
  '/api/agent/run',
  '/api/agent/followup',
  '/api/agent/intel',
  '/api/prospects/scan',
  '/api/agents/africa-scan',
  '/api/agents/send-email',
  '/api/agents/followup',
])

// Routes exposant le CRM interne / capables de déclencher de vrais envois
// (email, WhatsApp, scraping LinkedIn...) — jamais destinées au public.
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/api/agents',
  '/api/agent',
  '/api/prospects',
  '/api/instructors',
  '/api/linkedin',
]

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!isProtected(pathname)) {
    return NextResponse.next()
  }

  // Vercel Cron sends Authorization: Bearer CRON_SECRET to scheduled GET paths.
  // Never accept cron secrets from URLs or as authentication on other routes.
  const cronSecret = process.env.CRON_SECRET
  if (
    cronSecret &&
    req.method === 'GET' &&
    SCHEDULED_CRON_GET_PATHS.has(pathname) &&
    req.headers.get('authorization') === `Bearer ${cronSecret}`
  ) {
    return NextResponse.next()
  }

  const expectedUser = process.env.DASHBOARD_USER
  const expectedPass = process.env.DASHBOARD_PASSWORD

  // Fail-closed : si les identifiants ne sont pas configurés, on bloque
  // plutôt que d'exposer le dashboard par défaut.
  if (!expectedUser || !expectedPass) {
    return new NextResponse(
      'Dashboard authentication is not configured (DASHBOARD_USER / DASHBOARD_PASSWORD manquants).',
      { status: 503 }
    )
  }

  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Basic ')) {
    const encoded = authHeader.slice(6)
    try {
      const decoded = atob(encoded)
      const sepIndex = decoded.indexOf(':')
      // A Basic credential must contain a nonempty username followed by ':'.
      // Without this guard, slice(0, -1) can accidentally accept malformed
      // credentials for some user/password configurations.
      if (sepIndex > 0) {
        const suppliedUser = decoded.slice(0, sepIndex)
        const suppliedPass = decoded.slice(sepIndex + 1)
        if (suppliedUser === expectedUser && suppliedPass === expectedPass) {
          return NextResponse.next()
        }
      }
    } catch {
      // decoding failed — fall through to 401
    }
  }

  return new NextResponse('Authentification requise', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="KOST Dashboard"' },
  })
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/agents/:path*',
    '/api/agent/:path*',
    '/api/prospects/:path*',
    '/api/instructors/:path*',
    '/api/linkedin/:path*',
  ],
}
