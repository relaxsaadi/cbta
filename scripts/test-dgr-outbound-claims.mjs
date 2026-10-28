import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { assertSafeDgrMarketingCopy } from '../lib/dgr-marketing-claims.ts'

const followup = readFileSync(new URL('../app/api/agents/followup/route.ts', import.meta.url), 'utf8')
const outbound = readFileSync(new URL('../app/api/agents/send-email/route.ts', import.meta.url), 'utf8')

test('synthetic misleading regulatory, approval and expired-session claims fail closed', () => {
  for (const text of [
    'deadline IATA demain pour tous',
    'session août 2026 : réservez',
    'premier centre IATA du territoire',
    'centre certifié IATA',
    'agrément ANAC garanti',
    'suspension de vol immédiate',
  ]) {
    assert.throws(() => assertSafeDgrMarketingCopy(text), /blocked generated copy:/, text)
  }
  assert.doesNotThrow(() => assertSafeDgrMarketingCopy(
    'Souhaitez-vous échanger sur les besoins de formation DGR/CBTA de votre équipe ?'
  ))
})

test('HTML tags and entities cannot conceal unsupported generated DGR claims', () => {
  for (const html of [
    '<p>premier <strong>centre</strong> IATA</p>',
    '<p>centre certifi<strong>é</strong> IATA</p>',
    '<p>1er&nbsp;centre IATA</p>',
    '<p>agr&eacute;ment ANAC</p>',
    '<p>certifi&#233; IATA</p>',
    '<h2>&eacute;ch&eacute;ance IATA</h2>',
    '<p>ao&#251;t 2026</p>',
    '<p>session ao&ucirc;t 2026 : places limitées</p>',
    '<p>Session AO&UCIRC;T 2026 !</p>',
  ]) {
    assert.throws(() => assertSafeDgrMarketingCopy(html), /blocked generated copy:/, html)
  }
  assert.doesNotThrow(() => assertSafeDgrMarketingCopy(
    '<p>Nous pouvons échanger sur vos besoins possibles de formation <strong>DGR/CBTA</strong>.</p>'
  ))
})

test('outbound generators validate generated text before any provider send', () => {
  for (const source of [followup, outbound]) {
    const check = source.indexOf('assertSafeDgrMarketingCopy(')
    const send = source.indexOf("fetch('https://api.resend.com/emails'")
    assert.ok(check > -1, 'generated copy must be checked')
    assert.ok(send > check, 'provider transport must occur only after checking')
    assert.ok(source.includes('SAFE_DGR_MARKETING_RULES'), 'safe prompt required')
  }
})

test('follow-up automation has no stale hardcoded IATA deadline or client-success claim', () => {
  for (const phrase of ['DAYS_LEFT', "Air Algérie vient de certifier", 'Dernière chance session août', 'suspension immédiate']) {
    assert.ok(!followup.includes(phrase), 'outdated claim remains: ' + phrase)
  }
  assert.match(followup, /process\.env\.DGR_OUTBOUND_AUTOSEND_ENABLED === 'true'/)
  assert.match(outbound, /process\.env\.DGR_OUTBOUND_AUTOSEND_ENABLED !== 'true'/)
  assert.match(outbound, /if \(!html\.trim\(\)\) throw/)
  assert.match(followup, /if \(!providerResponse\.ok\)/)
  assert.match(followup, /providerAccepted \? 'accepted_by_provider' : 'draft_only'/)
  assert.match(followup, /if \(providerAccepted\) \{/)
})
