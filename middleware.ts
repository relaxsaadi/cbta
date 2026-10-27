import { NextRequest, NextResponse } from 'next/server'

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

// Narrow compatibility exception for legacy GET-only cron endpoints that
// independently validate CRON_SECRET in their own route handlers.
// Never allow a cron query token to authenticate dashboard pages, streams,
// arbitrary API endpoints, or mutating POST requests.
const LEGACY_CRON_GET_PATHS = new Set([
  '/api/agents/africa-scan',
  '/api/agents/followup',
  '/api/agents/linkedin-outreach',
  '/api/agents/send-email',
  '/api/prospects/scan',
])

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl

  if (!isProtected(pathname)) {
    return NextResponse.next()
  }

  // Compatibility only: a valid cron query is not a dashboard login.
  // The exact GET endpoint still enforces its own server-side secret check.
  // TODO: migrate legacy cron integrations to server-only Bearer auth and
  // remove query tokens entirely. NEXT_PUBLIC_CRON_SECRET must never equal
  // the server CRON_SECRET (see security release gate).
  const cronSecret = process.env.CRON_SECRET
  if (
    req.method === 'GET' &&
    LEGACY_CRON_GET_PATHS.has(pathname) &&
    cronSecret &&
    searchParams.get('secret') === cronSecret
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
      if (sepIndex <= 0) throw new Error('Malformed Basic authentication credentials')
      const suppliedUser = decoded.slice(0, sepIndex)
      const suppliedPass = decoded.slice(sepIndex + 1)
      if (suppliedUser === expectedUser && suppliedPass === expectedPass) {
        return NextResponse.next()
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
