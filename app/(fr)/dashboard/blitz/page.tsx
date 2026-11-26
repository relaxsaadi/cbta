'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  Flame, Target, Mail, MessageSquare, Phone, Linkedin, Globe,
  RefreshCw, CheckCircle, Clock, Zap, AlertTriangle, TrendingUp,
  Send, Users, DollarSign, Calendar, ChevronRight, Play, Copy, Check
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// September 30, 2026 — IATA CBTA certification deadline
const DEADLINE = new Date('2026-09-30T23:59:59')
const GOAL = 25

type BlitzTarget = {
  id: string
  company_name: string
  sector: string
  decision_maker_name: string | null
  decision_maker_title: string | null
  decision_maker_linkedin: string | null
  contact_email: string | null
  contact_phone: string | null
  deal_value_eur: number | null
  score: number | null
  status: string
  city: string | null
}

type OutreachResult = {
  prospect: BlitzTarget
  email: string
  linkedin: string
  whatsapp: string
  loading: boolean
  sent: boolean
  emailCopied: boolean
  linkedinCopied: boolean
  whatsappCopied: boolean
}

function useCountdown(deadline: Date) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, urgent: false })
  useEffect(() => {
    const tick = () => {
      const diff = deadline.getTime() - Date.now()
      if (diff <= 0) { setTime({ days: 0, hours: 0, minutes: 0, seconds: 0, urgent: true }); return }
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setTime({ days, hours, minutes, seconds, urgent: days < 30 })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [deadline])
  return time
}

export default function BlitzPage() {
  const countdown = useCountdown(DEADLINE)
  const [targets, setTargets] = useState<BlitzTarget[]>([])
  const [registered, setRegistered] = useState(0)
  const [loading, setLoading] = useState(true)
  const [blitzRunning, setBlitzRunning] = useState(false)
  const [results, setResults] = useState<OutreachResult[]>([])
  const [scanLoading, setScanLoading] = useState(false)
  const [africaScanLoading, setAfricaScanLoading] = useState(false)
  const [whatsappLoading, setWhatsappLoading] = useState(false)
  const [whatsappStatus, setWhatsappStatus] = useState<string | null>(null)
  const [stats, setStats] = useState({ total: 0, withEmail: 0, contacted: 0, qualified: 0, won: 0 })

  const fetchData = useCallback(async () => {
    const [{ data: prospects }, { data: won }] = await Promise.all([
      supabase
        .from('company_prospects')
        .select('*')
        .not('contact_email', 'is', null)
        .in('status', ['found', 'contacted'])
        .order('score', { ascending: false })
        .limit(10),
      supabase.from('company_prospects').select('id, status'),
    ])
    setTargets(prospects || [])
    const all = won || []
    setRegistered(all.filter(p => p.status === 'won').length)
    setStats({
      total: all.length,
      withEmail: 0,
      contacted: all.filter(p => p.status === 'contacted').length,
      qualified: all.filter(p => p.status === 'qualified').length,
      won: all.filter(p => p.status === 'won').length,
    })
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const launchBlitz = async () => {
    if (!targets.length) return
    setBlitzRunning(true)
    const initialResults: OutreachResult[] = targets.map(p => ({
      prospect: p, email: '', linkedin: '', whatsapp: '',
      loading: true, sent: false, emailCopied: false, linkedinCopied: false, whatsappCopied: false,
    }))
    setResults(initialResults)

    for (let i = 0; i < targets.length; i++) {
      const p = targets[i]
      try {
        const res = await fetch('/api/agents/blitz-outreach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prospect: p }),
        })
        const data = await res.json()
        setResults(prev => prev.map((r, idx) => idx === i
          ? { ...r, email: data.email || '', linkedin: data.linkedin || '', whatsapp: data.whatsapp || '', loading: false }
          : r
        ))
      } catch {
        setResults(prev => prev.map((r, idx) => idx === i ? { ...r, loading: false } : r))
      }
    }
    setBlitzRunning(false)
  }

  const markSent = async (idx: number) => {
    const r = results[idx]
    await supabase.from('company_prospects').update({ status: 'contacted', updated_at: new Date().toISOString() }).eq('id', r.prospect.id)
    setResults(prev => prev.map((item, i) => i === idx ? { ...item, sent: true } : item))
  }

  const copyField = (idx: number, field: 'email' | 'linkedin' | 'whatsapp') => {
    const text = results[idx][field]
    navigator.clipboard.writeText(text)
    const key = `${field}Copied` as 'emailCopied' | 'linkedinCopied' | 'whatsappCopied'
    setResults(prev => prev.map((r, i) => i === idx ? { ...r, [key]: true } : r))
    setTimeout(() => {
      setResults(prev => prev.map((r, i) => i === idx ? { ...r, [key]: false } : r))
    }, 2000)
  }

  const daysLeft = countdown.days
  const dailyTarget = registered < GOAL ? Math.ceil((GOAL - registered) / Math.max(daysLeft, 1)) : 0
  const weeksLeft = Math.ceil(daysLeft / 7)
  const progressPct = Math.min((registered / GOAL) * 100, 100)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="text-red-500" size={24} />
            <h1 className="text-2xl font-bold text-gray-900">Blitz Septembre 2026</h1>
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full animate-pulse">URGENT</span>
          </div>
          <p className="text-gray-500 text-sm">25 personnes formées avant le 30 septembre — ou révocation certification IATA CBTA</p>
        </div>
        <button onClick={fetchData} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg border border-gray-200">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* COUNTDOWN + PROGRESS */}
      <div className="grid grid-cols-2 gap-4">

        {/* Countdown */}
        <div className={`rounded-2xl p-6 ${countdown.urgent ? 'bg-red-900' : 'bg-gray-900'}`}>
          <div className="text-xs text-gray-400 mb-3 uppercase tracking-wider">Temps restant</div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { v: countdown.days, l: 'Jours' },
              { v: countdown.hours, l: 'Heures' },
              { v: countdown.minutes, l: 'Min' },
              { v: countdown.seconds, l: 'Sec' },
            ].map(({ v, l }) => (
              <div key={l} className="text-center">
                <div className={`text-3xl font-black tabular-nums ${countdown.urgent ? 'text-red-400' : 'text-white'}`}>{String(v).padStart(2, '0')}</div>
                <div className="text-xs text-gray-500 mt-1">{l}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-gray-500">
            📅 Deadline : 30 septembre 2026
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Objectif formations</div>
              <div className="text-4xl font-black text-gray-900">
                {registered}<span className="text-2xl text-gray-400">/{GOAL}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">Il manque</div>
              <div className="text-2xl font-bold text-red-600">{Math.max(GOAL - registered, 0)}</div>
              <div className="text-xs text-gray-500">personnes</div>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
            <div
              className={`h-3 rounded-full transition-all ${progressPct >= 100 ? 'bg-green-500' : progressPct > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-blue-50 rounded-lg p-2">
              <div className="font-bold text-blue-700">{weeksLeft}</div>
              <div className="text-gray-500">semaines</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-2">
              <div className="font-bold text-orange-700">{dailyTarget}/j</div>
              <div className="text-gray-500">à closer</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-2">
              <div className="font-bold text-purple-700">{stats.contacted}</div>
              <div className="text-gray-500">contactés</div>
            </div>
          </div>
        </div>
      </div>

      {/* STRATEGY AGENTS */}
      {whatsappStatus && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{whatsappStatus}</div>}
      <div className="grid grid-cols-5 gap-3">
        {[
          {
            icon: <Zap size={16} className="text-yellow-500" />,
            title: 'Blitz Email + LinkedIn',
            desc: `${targets.length} prospects prêts`,
            action: () => launchBlitz(),
            loading: blitzRunning,
            color: 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100',
            btnColor: 'bg-yellow-500 hover:bg-yellow-600 text-white',
            btnText: blitzRunning ? 'Génération...' : 'Lancer le Blitz',
          },
          {
            icon: <Globe size={16} className="text-green-500" />,
            title: 'Scan Algérie',
            desc: 'Nouveaux prospects',
            action: async () => {
              setScanLoading(true)
              await fetch('/api/prospects/scan', { method: 'POST' })
              setScanLoading(false)
            },
            loading: scanLoading,
            color: 'border-green-200 bg-green-50 hover:bg-green-100',
            btnColor: 'bg-green-600 hover:bg-green-700 text-white',
            btnText: scanLoading ? 'Scan...' : 'Scanner Algérie',
          },
          {
            icon: <Globe size={16} className="text-blue-500" />,
            title: 'Scan Afrique',
            desc: 'Maroc · Tunisie · Sénégal · CI · Gabon',
            action: async () => {
              setAfricaScanLoading(true)
              await fetch('/api/agents/africa-scan', { method: 'POST' })
              setAfricaScanLoading(false)
            },
            loading: africaScanLoading,
            color: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
            btnColor: 'bg-blue-600 hover:bg-blue-700 text-white',
            btnText: africaScanLoading ? 'Scan Afrique...' : 'Scanner Afrique',
          },
          {
            icon: <MessageSquare size={16} className="text-green-600" />,
            title: 'WhatsApp Blast',
            desc: 'Envoie aux prospects avec tel',
            action: async () => {
              setWhatsappLoading(true)
              setWhatsappStatus(null)
              try {
                const res = await fetch('/api/agents/whatsapp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
                const data = await res.json()
                if (!res.ok) setWhatsappStatus(data.error || 'Erreur')
                else setWhatsappStatus(data.message || 'Lancé')
              } catch { setWhatsappStatus('Erreur réseau') }
              setWhatsappLoading(false)
            },
            loading: whatsappLoading,
            color: 'border-green-200 bg-green-50 hover:bg-green-100',
            btnColor: 'bg-green-600 hover:bg-green-700 text-white',
            btnText: whatsappLoading ? 'Envoi...' : 'Blast WhatsApp',
          },
          {
            icon: <TrendingUp size={16} className="text-purple-500" />,
            title: 'Google Ads',
            desc: 'Optimisation urgence',
            action: () => window.open('https://ads.google.com', '_blank'),
            loading: false,
            color: 'border-purple-200 bg-purple-50 hover:bg-purple-100',
            btnColor: 'bg-purple-600 hover:bg-purple-700 text-white',
            btnText: 'Ouvrir Ads',
          },
        ].map((agent) => (
          <div key={agent.title} className={`rounded-xl border p-4 flex flex-col gap-3 transition-colors ${agent.color}`}>
            <div className="flex items-center gap-2">
              {agent.icon}
              <div>
                <div className="font-semibold text-gray-800 text-sm">{agent.title}</div>
                <div className="text-xs text-gray-500">{agent.desc}</div>
              </div>
            </div>
            <button
              onClick={agent.action}
              disabled={agent.loading}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60 ${agent.btnColor}`}
            >
              {agent.loading ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
              {agent.btnText}
            </button>
          </div>
        ))}
      </div>

      {/* CANAUX MARKETING — GUIDE D'ACTION */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} className="text-yellow-400" />
          <h2 className="font-bold">Plan Blitz — 25 formations en 87 jours</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              channel: '📱 WhatsApp Business',
              priority: 'PRIORITÉ 1',
              color: 'bg-green-500',
              tactics: [
                'Envoyer à tous les contacts trouvés via le script généré',
                'Message d\'urgence : "Obligation IATA — places limitées"',
                'Statut WhatsApp : compte à rebours live',
                'Broadcast list sur +213 542 30 53 83',
              ],
              effort: '2h/jour',
            },
            {
              channel: '💼 LinkedIn',
              priority: 'PRIORITÉ 2',
              color: 'bg-blue-500',
              tactics: [
                '20 connexions/jour avec responsables formation DZ',
                'InMail aux DRH + HSE des 144 prospects',
                'Post quotidien countdown + témoignage client',
                'Article LinkedIn : "Pourquoi les DGR IATA sont obligatoires"',
              ],
              effort: '1h/jour',
            },
            {
              channel: '📧 Email séquence',
              priority: 'PRIORITÉ 3',
              color: 'bg-purple-500',
              tactics: [
                'J0 : Email présentation urgence réglementaire',
                'J+3 : Relance avec calendrier sessions',
                'J+7 : Offre early bird -15% avant 31 juillet',
                'J+14 : Last call — places restantes',
              ],
              effort: 'Automatique',
            },
            {
              channel: '🎯 Google Ads',
              priority: 'PRIORITÉ 4',
              color: 'bg-yellow-500',
              tactics: [
                'Mots-clés urgence : "formation dgr obligatoire algérie"',
                'Budget +50% en août (deadline approche)',
                'Remarketing : visitors non-convertis',
                'Extension appel pour appels directs',
              ],
              effort: '30min/sem',
            },
            {
              channel: '📞 Appels directs',
              priority: 'PRIORITÉ 5',
              color: 'bg-red-500',
              tactics: [
                '10 appels/jour aux DG + responsables formation',
                'Script : urgence IATA + offre session août',
                'Cibler Air Algérie, Swissport, Sonatrach en premier',
                'Follow-up dans les 24h après email',
              ],
              effort: '2h/jour',
            },
            {
              channel: '🌍 Partenariats',
              priority: 'LEVIER x3',
              color: 'bg-orange-500',
              tactics: [
                'Contact ONDA / EGSA Alger : formation groupes',
                'Air Algérie Cargo : 1 contrat = 10-30 personnes',
                'Sonatrach : HSE — 1 session complète',
                'Association transitaires Algérie : annonce',
              ],
              effort: '3h cette semaine',
            },
          ].map((item) => (
            <div key={item.channel} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-sm">{item.channel}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${item.color} text-white`}>{item.priority}</span>
              </div>
              <ul className="space-y-1">
                {item.tactics.map((t, i) => (
                  <li key={i} className="text-xs text-gray-300 flex gap-1.5">
                    <span className="text-gray-500 shrink-0">→</span>{t}
                  </li>
                ))}
              </ul>
              <div className="mt-2 text-xs text-gray-500">⏱ {item.effort}</div>
            </div>
          ))}
        </div>
      </div>

      {/* BLITZ RESULTS */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-orange-500" />
            <h2 className="font-bold text-gray-900">Messages générés — {results.filter(r => !r.loading).length}/{results.length} prêts</h2>
          </div>
          {results.map((r, idx) => (
            <div key={r.prospect.id} className={`bg-white rounded-xl border p-5 ${r.sent ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-gray-900">{r.prospect.company_name}</div>
                  <div className="text-sm text-gray-500">
                    {r.prospect.decision_maker_name} · {r.prospect.decision_maker_title}
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    {r.prospect.contact_email && <span className="flex items-center gap-1"><Mail size={10} />{r.prospect.contact_email}</span>}
                    {r.prospect.contact_phone && <span className="flex items-center gap-1"><Phone size={10} />{r.prospect.contact_phone}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {r.sent ? (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle size={14} />Envoyé</span>
                  ) : (
                    <button onClick={() => markSent(idx)} disabled={r.loading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-40">
                      <CheckCircle size={12} />Marquer envoyé
                    </button>
                  )}
                </div>
              </div>
              {r.loading ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
                  <RefreshCw size={14} className="animate-spin" />Agent IA en cours...
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'email' as const, icon: <Mail size={11} />, label: 'Email', color: 'bg-indigo-50 border-indigo-100', copied: r.emailCopied, href: r.prospect.contact_email ? `mailto:${r.prospect.contact_email}?body=${encodeURIComponent(r.email)}` : null },
                    { key: 'linkedin' as const, icon: <Linkedin size={11} />, label: 'LinkedIn', color: 'bg-blue-50 border-blue-100', copied: r.linkedinCopied, href: r.prospect.decision_maker_linkedin || null },
                    { key: 'whatsapp' as const, icon: <MessageSquare size={11} />, label: 'WhatsApp', color: 'bg-green-50 border-green-100', copied: r.whatsappCopied, href: r.prospect.contact_phone ? `https://wa.me/${r.prospect.contact_phone.replace(/\s+/g, '')}` : null },
                  ].map(({ key, icon, label, color, copied, href }) => (
                    <div key={key} className={`rounded-lg border p-3 ${color}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1 text-xs font-medium text-gray-600">{icon}{label}</div>
                        <div className="flex gap-1">
                          <button onClick={() => copyField(idx, key)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                            {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                          </button>
                          {href && (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-400 hover:text-gray-600 rounded">
                              <Send size={11} />
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed max-h-24 overflow-auto font-mono">
                        {r[key] || '—'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TOP TARGETS — Priorité maximale */}
      {!results.length && !loading && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target size={14} className="text-red-500" />
              <h2 className="font-semibold text-gray-900 text-sm">Top 10 cibles prioritaires (emails vérifiés)</h2>
            </div>
            <button onClick={launchBlitz} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
              <Flame size={14} />Lancer le Blitz
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {targets.map((p, i) => (
              <div key={p.id} className="flex items-center px-5 py-3 hover:bg-gray-50">
                <div className="w-6 text-xs text-gray-400 font-bold">{i + 1}</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">{p.company_name}</div>
                  <div className="text-xs text-gray-500">{p.decision_maker_name} · {p.decision_maker_title}</div>
                </div>
                <div className="flex items-center gap-3">
                  {p.contact_email && (
                    <a href={`mailto:${p.contact_email}`} className="text-indigo-400 hover:text-indigo-600" title={p.contact_email}>
                      <Mail size={14} />
                    </a>
                  )}
                  {p.decision_maker_linkedin && (
                    <a href={p.decision_maker_linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
                      <Linkedin size={14} />
                    </a>
                  )}
                  {p.contact_phone && (
                    <a href={`https://wa.me/${p.contact_phone.replace(/\s+/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-600">
                      <MessageSquare size={14} />
                    </a>
                  )}
                  <span className="text-xs font-bold text-blue-700">€{(p.deal_value_eur || 0).toLocaleString()}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${(p.score || 0) >= 9 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.score}/10</span>
                </div>
              </div>
            ))}
            {!targets.length && (
              <div className="text-center py-8 text-gray-400 text-sm">
                <AlertTriangle size={20} className="mx-auto mb-2" />
                Aucun prospect avec email trouvé — lancez d'abord le scan Algérie
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
