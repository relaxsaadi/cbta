// Static, fail-closed regression guard for the CRM cron/dashboard boundary.
// This is NOT a substitute for deployed HTTP tests, credential inspection, or an
// authenticated same-origin browser/SSE acceptance run. See issue #297.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8')
const expectedCronPaths = [
  '/api/agent/run',
  '/api/agent/followup',
  '/api/agent/intel',
  '/api/prospects/scan',
  '/api/agents/africa-scan',
  '/api/agents/send-email',
  '/api/agents/followup',
]
const browserPages = [
  'app/dashboard/agent/page.tsx',
  'app/dashboard/intel/page.tsx',
  'app/dashboard/instructors/page.tsx',
  'app/dashboard/linkedin/page.tsx',
]
const streamRoutes = [
  'app/api/agent/intel/stream/route.ts',
  'app/api/instructors/scan/stream/route.ts',
  'app/api/instructors/scan-sales-nav/stream/route.ts',
  'app/api/linkedin/scan/stream/route.ts',
]

test('Vercel schedules and middleware have the same exact seven GET entry points', () => {
  const schedules = JSON.parse(source('vercel.json')).crons.map((cron) => cron.path)
  const middleware = source('middleware.ts')
  const declaration = middleware.match(/const SCHEDULED_CRON_GET_PATHS\s*=\s*new Set\(\[([\s\S]*?)\]\)/)
  assert.ok(declaration, 'middleware must declare an explicit cron path allowlist')
  const allowlist = [...declaration[1].matchAll(/['"]([^'"]+)['"]/g)].map((match) => match[1])

  for (const [name, paths] of [['vercel.json', schedules], ['middleware', allowlist]]) {
    assert.equal(paths.length, new Set(paths).size, name + ' contains duplicate schedule paths')
    assert.deepEqual([...paths].sort(), [...expectedCronPaths].sort(), name + ' has an unexpected cron path')
  }
  assert.match(middleware, /req\.method\s*===\s*['"]GET['"]/, 'cron credentials must be restricted to GET')
  assert.match(middleware, /SCHEDULED_CRON_GET_PATHS\.has\(pathname\)/)
  assert.match(middleware, /req\.headers\.get\(['"]authorization['"]\)\s*===\s*`Bearer \$\{cronSecret\}`/)
  assert.doesNotMatch(middleware, /searchParams\.get\(\s*['"]secret['"]\s*\)/, 'no URL secret may bypass dashboard auth')
  assert.match(middleware, /['"]\/dashboard['"]/, 'dashboard must stay in the protected scope')
})

test('Every scheduled GET route rejects an absent cron secret and requires Bearer', () => {
  for (const path of expectedCronPaths) {
    const filename = 'app' + path + '/route.ts'
    const code = source(filename)
    const start = code.indexOf('export async function GET(')
    assert.ok(start !== -1, filename + ' has no GET handler')
    const handler = code.slice(start, start + 800)
    assert.match(handler, /const cronSecret\s*=\s*process\.env\.CRON_SECRET/, filename)
    assert.match(
      handler,
      /!cronSecret\s*\|\|\s*req\.headers\.get\(['"]authorization['"]\)\s*!==\s*`Bearer \$\{cronSecret\}`/,
      filename + ' must reject an unset secret and invalid Bearer'
    )
    assert.doesNotMatch(handler, /searchParams\.get\(\s*['"]secret['"]\s*\)/, filename)
  }
})

test('RELEASE HOLD: browser bundles must never contain a privileged cron credential', () => {
  const offenders = browserPages.filter((path) => /NEXT_PUBLIC_CRON_SECRET|CRON_SECRET/.test(source(path)))
  assert.deepEqual(
    offenders,
    [],
    'Remove browser-exposed cron secrets and use authenticated server actions/requests: ' + offenders.join(', ')
  )
})

test('RELEASE HOLD: browser EventSource URLs must not carry cron tokens', () => {
  const offenders = streamRoutes.filter((path) => /(?:searchParams\.get\(\s*['"]secret['"]|process\.env\.CRON_SECRET)/.test(source(path)))
  assert.deepEqual(
    offenders,
    [],
    'Protect SSE with authenticated same-origin dashboard sessions, never a URL cron token: ' + offenders.join(', ')
  )
})

const manualDashboardPostRoutes = [
  'app/api/agent/run/route.ts',
  'app/api/agent/intel/route.ts',
  'app/api/instructors/scan/route.ts',
  'app/api/instructors/scan-sales-nav/route.ts',
]

test('RELEASE HOLD: browser-triggered POST must not demand the cron-only Bearer token', () => {
  const middleware = source('middleware.ts')
  assert.match(middleware, /req\.method\s*===\s*['"]GET['"]/, 'cron middleware exception must remain GET-only')
  const offenders = []
  for (const filename of manualDashboardPostRoutes) {
    const code = source(filename)
    const start = code.indexOf('export async function POST(')
    const getStart = start >= 0 ? code.indexOf('export async function GET(', start) : -1
    const postOnly = start >= 0 ? code.slice(start, getStart >= 0 ? getStart : undefined) : ''
    if (!postOnly || /process\.env\.CRON_SECRET|\`Bearer \$\{cronSecret\}\`/.test(postOnly)) {
      offenders.push(filename)
    }
  }
  assert.deepEqual(offenders, [], 'Dashboard POST auth conflicts with GET-only cron middleware: ' + offenders.join(', '))
})

test('RELEASE HOLD: the dashboard follow-up button needs a separate human POST, not a cron GET', () => {
  const page = source('app/dashboard/agent/page.tsx')
  const handler = source('app/api/agent/followup/route.ts')
  assert.match(handler, /export async function GET\(/, 'preserve server-only Vercel cron GET')
  assert.match(handler, /export async function POST\(/, 'add a separate Basic/session-authorized manual POST')
  assert.match(
    page,
    /fetch\(['"]\/api\/agent\/followup['"],\s*\{\s*method:\s*['"]POST['"]/,
    'manual follow-up must never invoke the cron-only GET from browser'
  )
})

test('human POST and side-effecting SSE GET routes verify dashboard Basic auth and same-origin', () => {
  const targets = [
    ...manualDashboardPostRoutes,
    'app/api/agent/followup/route.ts',
    ...streamRoutes,
  ]
  for (const filename of targets) {
    assert.ok(source(filename).includes('requireDashboardRequest(req)'), filename + ' lacks independent human auth')
  }
  const guard = source('lib/dashboard-auth.ts')
  for (const marker of [
    'process.env.DASHBOARD_USER', 'process.env.DASHBOARD_PASSWORD',
    "headers.get('authorization')", "startsWith('Basic ')",
    "headers.get('origin')", "headers.get('referer')",
    "headers.get('sec-fetch-site')", "startsWith('/dashboard/')",
  ]) assert.ok(guard.includes(marker), 'missing human/CSRF guard: ' + marker)
  assert.doesNotMatch(guard, /process\.env\.(?:CRON_SECRET|NEXT_PUBLIC_CRON_SECRET)/)
})


test('Colonless Basic credentials must be rejected before slicing user and password', () => {
  const middleware = source('middleware.ts')
  const basic = middleware.slice(
    middleware.indexOf("const authHeader = req.headers.get('authorization')"),
    middleware.indexOf("return new NextResponse('Authentification requise'")
  )
  assert.ok(basic.includes("const sepIndex = decoded.indexOf(':')"), 'Basic must parse colon')
  assert.match(
    basic,
    /if \(sepIndex > 0\) \{[\s\S]*?const suppliedUser = decoded\.slice\(0, sepIndex\)[\s\S]*?const suppliedPass = decoded\.slice\(sepIndex \+ 1\)/,
    'Both credential components must be parsed only after validating the separator'
  )
})

test('RELEASE HOLD: cron and manual lead agents default to no sends or database mutations', () => {
  const agent = source('lib/agent.ts')
  for (const fn of ['processNewLeads', 'processFollowups']) {
    const start = agent.indexOf('export async function ' + fn + '(')
    assert.ok(start >= 0, fn + ' must exist')
    const remainder = agent.slice(start)
    const firstQuery = remainder.indexOf(".from('leads')")
    const guard = remainder.indexOf("if (process.env.DGR_OUTBOUND_AUTOSEND_ENABLED !== 'true')")
    assert.ok(firstQuery > 0, fn + ' must have a lead query')
    assert.ok(guard > 0 && guard < firstQuery, fn + ' must fail closed before querying or mutating leads')
    assert.match(remainder.slice(guard, firstQuery), /return\s*\{[^}]*disabled:\s*true/, fn + ' must explicitly report the disabled state')
  }
})
