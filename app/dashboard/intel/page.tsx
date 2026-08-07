'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { getSupabase } from '@/lib/supabase'
import {
  Zap, Search, CheckCircle, Clock, Send, XCircle, RefreshCw, Play,
  Globe, Briefcase, Square, ExternalLink, Trash2, ChevronDown, Mail, Loader2,
} from 'lucide-react'
import { SCAN_COUNTRIES } from '@/lib/apify'

interface IntentLead {
  id: string; source: string; source_url: string; company_name: string
  country: string; intent_signal: string; raw_snippet: string; score: number
  status: string; message_draft: string; email?: string
  sent_at?: string; posted_at?: string; created_at: string
}

interface LiveEvent {
  type: 'status' | 'lead' | 'done' | 'error'
  msg?: string; company_name?: string; country?: string
  source?: string; score?: number; intent_signal?: string; saved?: number
}

const SRC_ICON: Record<string, React.ReactNode> = {
  google_search: <Search size={10} />, google_maps: <Globe size={10} />, job_board: <Briefcase size={10} />,
}
const SRC_COLOR: Record<string, string> = {
  google_search: 'bg-blue-100 text-blue-700',
  google_maps: 'bg-green-100 text-green-700',
  job_board: 'bg-indigo-100 text-indigo-700',
}

const INDUSTRIES: { kw: string[]; label: string; color: string }[] = [
  { kw: ['transitaire', 'freight forwarder', 'commissionnaire'], label: 'Transitaire', color: 'bg-sky-100 text-sky-700' },
  { kw: ['handling', 'ground handler', 'escale', 'assistance en escale'], label: 'Ground Handling', color: 'bg-teal-100 text-teal-700' },
  { kw: ['compagnie aérienne', 'airline', 'air algérie', 'royal air maroc'], label: 'Compagnie aérienne', color: 'bg-violet-100 text-violet-700' },
  { kw: ['pétrol', 'oil', 'gas', 'sonatrach', 'hydrocarbure'], label: 'Pétrole & Gaz', color: 'bg-amber-100 text-amber-700' },
  { kw: ['pharma', 'laboratoire', 'médicament'], label: 'Pharmaceutique', color: 'bg-pink-100 text-pink-700' },
  { kw: ['maritime', 'port', 'conteneur', 'shipping'], label: 'Maritime', color: 'bg-cyan-100 text-cyan-700' },
  { kw: ['cargo', 'fret aérien', 'air cargo', 'air freight'], label: 'Cargo aérien', color: 'bg-orange-100 text-orange-700' },
  { kw: ['logistique', 'logistics', 'supply chain'], label: 'Logistique', color: 'bg-lime-100 text-lime-700' },
]

function getIndustry(signal: string, snippet: string, source: string) {
  const t = (signal + ' ' + snippet).toLowerCase()
  const found = INDUSTRIES.find(i => i.kw.some(k => t.includes(k)))
  if (found) return found
  if (source === 'job_board') return { label: 'RH / Recrutement', color: 'bg-gray-100 text-gray-600' }
  return null
}

const CYCLE_PAUSE = 20_000

export default function IntelPage() {
  const [leads, setLeads] = useState<IntentLead[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [bgRunning, setBgRunning] = useState(false)
  const [events, setEvents] = useState<LiveEvent[]>([])
  const [fStatus, setFStatus] = useState('all')
  const [fCountry, setFCountry] = useState('all')
  const [fIndustry, setFIndustry] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [scanCountry, setScanCountry] = useState<string>('all')
  const [cycle, setCycle] = useState(0)
  const [emailDraft, setEmailDraft] = useState<Record<string, string>>({})
  const [sending, setSending] = useState<string | null>(null)
  const [sendResult, setSendResult] = useState<Record<string, 'ok' | 'error'>>({})
  const [bulkStatusMenu, setBulkStatusMenu] = useState(false)

  const esRef = useRef<EventSource | null>(null)
  const scanActiveRef = useRef(false)
  const cycleRef = useRef(0)
  const logRef = useRef<HTMLDivElement>(null)
  const autoRefRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchLeads = useCallback(async () => {
    const { data } = await getSupabase().from('intent_leads').select('*').order('score', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchLeads() }, [fetchLeads])
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [events])

  // Auto-refresh every 90s to pick up cron/bg scan results
  useEffect(() => {
    autoRefRef.current = setInterval(fetchLeads, 90_000)
    return () => { if (autoRefRef.current) clearInterval(autoRefRef.current) }
  }, [fetchLeads])

  function connectStream() {
    if (!scanActiveRef.current) return
    cycleRef.current += 1
    setCycle(cycleRef.current)
    const label = scanCountry === 'all' ? 'Tous les pays' : scanCountry
    setEvents(prev => [...prev, { type: 'status', msg: `━━━ Cycle ${cycleRef.current} · ${label} ━━━` }])
    const secret = process.env.NEXT_PUBLIC_CRON_SECRET || ''
    const countriesParam = scanCountry === 'all' ? '' : encodeURIComponent(scanCountry)
    const es = new EventSource(`/api/agent/intel/stream?secret=${secret}&countries=${countriesParam}`)
    esRef.current = es
    es.addEventListener('status', e => { const d = JSON.parse(e.data); setEvents(p => [...p, { type: 'status', msg: d.msg }]) })
    es.addEventListener('lead', e => { const d = JSON.parse(e.data); setEvents(p => [...p, { type: 'lead', ...d }]); fetchLeads() })
    es.addEventListener('done', e => {
      const d = JSON.parse(e.data)
      setEvents(p => [...p, { type: 'done', msg: d.msg, saved: d.saved }, { type: 'status', msg: scanActiveRef.current ? `⏸ ${CYCLE_PAUSE / 1000}s...` : '🛑 Arrêté.' }])
      es.close(); fetchLeads()
      if (scanActiveRef.current) setTimeout(connectStream, CYCLE_PAUSE); else setScanning(false)
    })
    es.addEventListener('error', (e: Event) => {
      const d = JSON.parse((e as MessageEvent).data || '{}')
      setEvents(p => [...p, { type: 'error', msg: d.msg || 'Erreur stream' }]); es.close()
      if (scanActiveRef.current) setTimeout(connectStream, CYCLE_PAUSE); else setScanning(false)
    })
    es.onerror = () => {
      es.close()
      if (scanActiveRef.current) { setEvents(p => [...p, { type: 'status', msg: '⚠ Reconnexion...' }]); setTimeout(connectStream, 5000) }
      else setScanning(false)
    }
  }

  function startScan() {
    if (scanning) {
      scanActiveRef.current = false; esRef.current?.close(); setScanning(false)
      setEvents(p => [...p, { type: 'status', msg: '🛑 Scan arrêté.' }]); return
    }
    scanActiveRef.current = true; cycleRef.current = 0; setScanning(true)
    const label = scanCountry === 'all' ? 'Tous les pays' : scanCountry
    setEvents([{ type: 'status', msg: `🚀 Scan continu · ${label}` }])
    connectStream()
  }

  async function triggerBackground() {
    if (bgRunning) return
    setBgRunning(true)
    const label = scanCountry === 'all' ? 'Tous les pays' : scanCountry
    setEvents(p => [...p, { type: 'status', msg: `🌐 Lancement arrière-plan · ${label}` }])
    try {
      await fetch('/api/agent/intel', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ countries: scanCountry === 'all' ? undefined : [scanCountry] }),
      })
      setEvents(p => [...p, { type: 'done', msg: '✅ Scan arrière-plan terminé — leads mis à jour.' }])
    } catch {
      setEvents(p => [...p, { type: 'error', msg: 'Erreur arrière-plan' }])
    } finally { setBgRunning(false); fetchLeads() }
  }

  // Selections
  const toggle = (id: string) => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const selectAll = () => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(l => l.id)))

  // Bulk ops
  async function bulkDelete() {
    if (!selected.size || !confirm(`Supprimer ${selected.size} lead(s) ?`)) return
    await getSupabase().from('intent_leads').delete().in('id', Array.from(selected))
    setSelected(new Set()); fetchLeads()
  }
  async function bulkStatus(status: string) {
    if (!selected.size) return
    await getSupabase().from('intent_leads').update({ status, ...(status === 'sent' ? { sent_at: new Date().toISOString() } : {}) }).in('id', Array.from(selected))
    setSelected(new Set()); setBulkStatusMenu(false); fetchLeads()
  }

  // Per-lead ops
  async function updateStatus(id: string, status: string) {
    await getSupabase().from('intent_leads').update({ status, ...(status === 'sent' ? { sent_at: new Date().toISOString() } : {}) }).eq('id', id)
    fetchLeads()
  }
  async function saveEmail(id: string, email: string) {
    await getSupabase().from('intent_leads').update({ email }).eq('id', id)
    fetchLeads()
  }
  async function sendEmail(lead: IntentLead) {
    const email = emailDraft[lead.id] ?? lead.email ?? ''
    if (!email) return
    setSending(lead.id)
    const res = await fetch('/api/agent/intel/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: lead.id, email_override: email }),
    })
    setSending(null)
    setSendResult(p => ({ ...p, [lead.id]: res.ok ? 'ok' : 'error' }))
    if (res.ok) fetchLeads()
  }
  function approveAndCopy(lead: IntentLead) {
    navigator.clipboard.writeText(lead.message_draft).catch(() => {})
    updateStatus(lead.id, 'sent')
    if (lead.source_url) window.open(lead.source_url, '_blank')
  }

  // Derived data
  const industries = leads.reduce<Record<string, number>>((a, l) => {
    const ind = getIndustry(l.intent_signal, l.raw_snippet, l.source)?.label
    if (ind) a[ind] = (a[ind] || 0) + 1; return a
  }, {})
  const countryCounts = leads.reduce<Record<string, number>>((a, l) => { a[l.country] = (a[l.country] || 0) + 1; return a }, {})

  const filtered = leads.filter(l => {
    if (fStatus !== 'all' && l.status !== fStatus) return false
    if (fCountry !== 'all' && l.country !== fCountry) return false
    if (fIndustry !== 'all' && getIndustry(l.intent_signal, l.raw_snippet, l.source)?.label !== fIndustry) return false
    return true
  })

  // Stats based on filtered view
  const fStats = {
    total: filtered.length,
    hot: filtered.filter(l => l.score >= 8).length,
    pending: filtered.filter(l => l.status === 'pending_approval').length,
    sent: filtered.filter(l => l.status === 'sent').length,
  }
  const isFiltered = fStatus !== 'all' || fCountry !== 'all' || fIndustry !== 'all'

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2.5 rounded-xl">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Leads Chauds</h1>
            <p className="text-gray-400 text-xs">Clients potentiels DGR — concurrents filtrés</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchLeads} title="Rafraîchir" className="text-gray-400 hover:text-gray-600 border border-gray-200 p-2 rounded-lg">
            <RefreshCw size={13} />
          </button>

          {/* Bulk actions — only when items selected */}
          {selected.size > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
              <span className="text-xs text-blue-600 font-medium">{selected.size} sélectionné{selected.size > 1 ? 's' : ''}</span>
              {/* Bulk status */}
              <div className="relative">
                <button onClick={() => setBulkStatusMenu(p => !p)}
                  className="flex items-center gap-1 text-xs border border-blue-300 bg-white text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-50">
                  Changer statut <ChevronDown size={11} />
                </button>
                {bulkStatusMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-36 py-1">
                    {[['pending_approval', '⏳ En attente'], ['sent', '📤 Envoyé'], ['rejected', '❌ Rejeté']].map(([s, l]) => (
                      <button key={s} onClick={() => bulkStatus(s)}
                        className="w-full text-left text-xs px-3 py-2 hover:bg-gray-50 text-gray-700">{l}</button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={bulkDelete}
                className="flex items-center gap-1 text-xs bg-red-500 text-white px-2.5 py-1 rounded-lg hover:bg-red-600">
                <Trash2 size={11} /> Supprimer
              </button>
            </div>
          )}

          {/* Background trigger */}
          <button onClick={triggerBackground} disabled={bgRunning || scanning}
            title="Lance un scan côté serveur — continue même si tu fermes l'onglet"
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-all ${bgRunning ? 'border-blue-300 text-blue-500 bg-blue-50' : 'border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700'}`}>
            {bgRunning ? <><Loader2 size={12} className="animate-spin" /> Arrière-plan...</> : <>🌐 Arrière-plan</>}
          </button>

          {/* Realtime scan */}
          <button onClick={startScan}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${scanning ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:opacity-90'}`}>
            {scanning ? <><Square size={13} /> Arrêter</> : <><Play size={13} /> Scan live</>}
          </button>
        </div>
      </div>

      {/* Country scan selector */}
      <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 flex items-center gap-4">
        <span className="text-xs font-semibold text-gray-500 flex-shrink-0">🌍 Scanner :</span>
        <select value={scanCountry} onChange={e => !scanning && setScanCountry(e.target.value)} disabled={scanning}
          className={`flex-1 max-w-xs text-sm font-medium border-2 rounded-xl px-3 py-2 focus:outline-none bg-white transition-all
            ${scanning ? 'opacity-50 cursor-not-allowed border-gray-200 text-gray-400' : 'border-orange-500 text-orange-600 cursor-pointer'}`}>
          <option value="all">🌐 Tous les pays</option>
          {SCAN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {scanCountry !== 'all' && (
          <span className="text-xs bg-orange-500 text-white px-2.5 py-1 rounded-full font-medium">
            Résultats limités à : {scanCountry}
          </span>
        )}
      </div>

      {/* Terminal */}
      {events.length > 0 && (
        <div className="bg-gray-950 rounded-xl p-3 mb-4 font-mono text-xs">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-800">
            <div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /><div className="w-2 h-2 rounded-full bg-yellow-500" /><div className="w-2 h-2 rounded-full bg-green-500" /></div>
            <span className="text-gray-500 ml-1">KOST Agent</span>
            {scanning && <><div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /><span className="text-gray-500">Cycle {cycle}</span></>}
            {bgRunning && <><Loader2 size={10} className="animate-spin text-blue-400" /><span className="text-blue-400">Arrière-plan</span></>}
          </div>
          <div ref={logRef} className="space-y-0.5 max-h-40 overflow-y-auto">
            {events.map((e, i) => (
              <div key={i} className={`flex gap-2 ${e.type === 'error' ? 'text-red-400' : e.type === 'done' ? 'text-green-400' : e.type === 'lead' ? 'text-yellow-300' : 'text-gray-500'}`}>
                <span className="text-gray-700 w-4 text-right flex-shrink-0">{i}</span>
                {e.type === 'lead'
                  ? <span><span className="font-bold text-yellow-400">LEAD</span> <span className="text-gray-300">{e.company_name} ({e.country})</span> <span className={`px-1 rounded text-xs ${e.score! >= 8 ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>{e.score}/10</span></span>
                  : <span className={e.msg?.startsWith('━') ? 'text-gray-700' : ''}>{e.msg}</span>}
              </div>
            ))}
            {(scanning || bgRunning) && <div className="text-orange-400 flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-orange-400 animate-pulse" /> en cours...</div>}
          </div>
        </div>
      )}

      {/* KPIs — reflect current filter */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: isFiltered ? `Filtrés / ${leads.length}` : 'Total leads', value: isFiltered ? `${fStats.total}` : String(leads.length), color: 'bg-gray-50 text-gray-700' },
          { label: '🔥 Score ≥ 8', value: String(fStats.hot), color: 'bg-red-50 text-red-700' },
          { label: '⏳ En attente', value: String(fStats.pending), color: 'bg-yellow-50 text-yellow-700' },
          { label: '📤 Envoyés', value: String(fStats.sent), color: 'bg-blue-50 text-blue-700' },
        ].map(k => (
          <div key={k.label} className={`rounded-xl p-3 ${k.color}`}>
            <div className="text-xl font-bold">{k.value}</div>
            <div className="text-xs mt-0.5 opacity-80">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {!loading && leads.length === 0 && events.length === 0 && (
        <div className="bg-gradient-to-br from-[#0f2557] to-[#1e3a7a] text-white rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">🎯</div>
          <h2 className="text-lg font-bold mb-2">Intent-Based Prospecting</h2>
          <p className="text-blue-200 text-xs mb-5 max-w-md mx-auto">Choisis les pays cibles, puis <strong>Scan live</strong> (temps réel dans le navigateur) ou <strong>Arrière-plan</strong> (tourne sur Vercel même si tu fermes l&apos;onglet).</p>
          <div className="flex gap-3 justify-center">
            <button onClick={startScan} className="bg-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 flex items-center gap-2"><Play size={14} /> Scan live</button>
            <button onClick={triggerBackground} className="bg-white/10 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-white/20 flex items-center gap-2">🌐 Arrière-plan</button>
          </div>
        </div>
      )}

      {/* Filters */}
      {leads.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2 mb-3 items-center">
            {/* Status tabs */}
            {[
              { k: 'all', label: `Tous (${leads.length})` },
              { k: 'pending_approval', label: `⏳ Attente (${leads.filter(l => l.status === 'pending_approval').length})` },
              { k: 'sent', label: `📤 Envoyés (${leads.filter(l => l.status === 'sent').length})` },
              { k: 'rejected', label: `❌ Rejetés (${leads.filter(l => l.status === 'rejected').length})` },
            ].map(f => (
              <button key={f.k} onClick={() => setFStatus(f.k)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${fStatus === f.k ? 'bg-[#0f2557] text-white border-[#0f2557]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {f.label}
              </button>
            ))}

            {/* Country */}
            <select value={fCountry} onChange={e => setFCountry(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 bg-white focus:outline-none">
              <option value="all">🌍 Pays ({leads.length})</option>
              {Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).map(([c, n]) => (
                <option key={c} value={c}>{c} ({n})</option>
              ))}
            </select>

            {/* Industry */}
            <select value={fIndustry} onChange={e => setFIndustry(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 bg-white focus:outline-none">
              <option value="all">🏭 Secteur ({leads.length})</option>
              {Object.entries(industries).sort((a, b) => b[1] - a[1]).map(([ind, n]) => (
                <option key={ind} value={ind}>{ind} ({n})</option>
              ))}
            </select>

            {/* Active filter badge + select all */}
            {isFiltered && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 font-medium">
                {fStats.total} résultat{fStats.total > 1 ? 's' : ''}
              </span>
            )}
            {filtered.length > 0 && (
              <button onClick={selectAll} className="ml-auto text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-2.5 py-1.5 rounded-lg">
                {selected.size === filtered.length ? 'Désélectionner' : `Tout sélectionner (${filtered.length})`}
              </button>
            )}
          </div>

          {filtered.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">Aucun lead pour ce filtre.</div>}

          <div className="space-y-2">
            {filtered.map(lead => {
              const ind = getIndustry(lead.intent_signal, lead.raw_snippet, lead.source)
              const isSelected = selected.has(lead.id)
              const emailVal = emailDraft[lead.id] ?? lead.email ?? ''
              const sr = sendResult[lead.id]

              return (
                <div key={lead.id} className={`bg-white rounded-xl border-2 transition-all ${isSelected ? 'border-blue-400' : lead.status === 'pending_approval' ? 'border-orange-200' : 'border-gray-100'}`}>
                  <div className="p-3.5">
                    {/* Row 1 */}
                    <div className="flex items-center gap-2 mb-2">
                      <input type="checkbox" checked={isSelected} onChange={() => toggle(lead.id)} onClick={e => e.stopPropagation()}
                        className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-600 flex-shrink-0" />
                      <div className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}>
                        <span className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${SRC_COLOR[lead.source] || 'bg-gray-100 text-gray-600'}`}>
                          {SRC_ICON[lead.source]} {lead.source.replace(/_/g, ' ')}
                        </span>
                        <span className="font-semibold text-gray-900 truncate text-sm">{lead.company_name}</span>
                        <span className="text-gray-400 text-xs border border-gray-200 px-1.5 py-0.5 rounded flex-shrink-0">{lead.country}</span>
                        {ind && <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${ind.color}`}>{ind.label}</span>}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <ScoreBadge score={lead.score} />
                        <StatusDot status={lead.status} />
                        <span className="text-gray-300 text-xs cursor-pointer" onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}>
                          {expanded === lead.id ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {/* Signal */}
                    <div className="ml-5 text-xs text-gray-600 mb-1.5">📡 {lead.intent_signal}</div>

                    {/* Dates */}
                    <div className="ml-5 flex flex-wrap gap-3 mb-2">
                      {lead.posted_at && <span className="text-xs text-orange-600 flex items-center gap-1"><Clock size={9} /> Publié : {lead.posted_at}</span>}
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={9} /> {new Date(lead.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })} {new Date(lead.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Snippet */}
                    {lead.raw_snippet && (
                      <div className="ml-5 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border-l-2 border-gray-200 leading-relaxed mb-2">{lead.raw_snippet}</div>
                    )}

                    {/* Source URL */}
                    {lead.source_url
                      ? <a href={lead.source_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                          className="ml-5 flex items-center gap-1 text-xs text-blue-600 hover:underline break-all">
                          <ExternalLink size={9} className="flex-shrink-0" /> {lead.source_url}
                        </a>
                      : <span className="ml-5 text-xs text-gray-300 italic">Pas de lien source</span>
                    }
                  </div>

                  {/* Expanded */}
                  {expanded === lead.id && (
                    <div className="border-t border-gray-100 p-4 space-y-4">
                      {/* Message */}
                      <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Message (Claude)</div>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {lead.message_draft}
                        </div>
                      </div>

                      {/* Source */}
                      {lead.source_url && (
                        <div>
                          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Source exacte</div>
                          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                            <a href={lead.source_url} target="_blank" rel="noopener noreferrer"
                              className="flex-1 min-w-0 text-blue-700 hover:underline text-xs break-all">{lead.source_url}</a>
                            <a href={lead.source_url} target="_blank" rel="noopener noreferrer"
                              className="flex-shrink-0 flex items-center gap-1 bg-blue-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700">
                              <ExternalLink size={10} /> Ouvrir
                            </a>
                          </div>
                          {lead.posted_at && <div className="mt-1 text-xs text-orange-600">📅 {lead.posted_at}</div>}
                        </div>
                      )}

                      {/* Email + Send via Resend */}
                      <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Envoyer par email</div>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            placeholder="contact@entreprise.com"
                            value={emailVal}
                            onChange={e => setEmailDraft(p => ({ ...p, [lead.id]: e.target.value }))}
                            onBlur={() => emailVal && saveEmail(lead.id, emailVal)}
                            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
                          />
                          <button
                            onClick={() => sendEmail(lead)}
                            disabled={!emailVal || sending === lead.id}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${emailVal ? 'bg-[#0f2557] text-white hover:bg-[#1e3a7a]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                            {sending === lead.id ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                            {sending === lead.id ? 'Envoi...' : 'Envoyer'}
                          </button>
                        </div>
                        {sr === 'ok' && <div className="mt-1.5 text-xs text-green-600 flex items-center gap-1"><CheckCircle size={11} /> Email envoyé avec succès via Resend</div>}
                        {sr === 'error' && <div className="mt-1.5 text-xs text-red-500">Erreur — vérifier domaine Resend et email</div>}
                        {!emailVal && <div className="mt-1 text-xs text-gray-400">Saisis l&apos;email du contact pour envoyer directement depuis le dashboard</div>}
                      </div>

                      {/* Quick actions */}
                      <div className="flex gap-2 flex-wrap pt-1 border-t border-gray-100">
                        <button onClick={() => approveAndCopy(lead)}
                          className="flex items-center gap-1.5 bg-green-600 text-white px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                          <CheckCircle size={13} /> Copier &amp; Marquer envoyé
                        </button>
                        {lead.status !== 'rejected' && (
                          <button onClick={() => updateStatus(lead.id, 'rejected')}
                            className="flex items-center gap-1.5 border border-red-200 text-red-400 px-3 py-2 rounded-lg text-sm hover:bg-red-50 ml-auto">
                            <XCircle size={13} /> Rejeter
                          </button>
                        )}
                      </div>

                      {lead.status === 'sent' && (
                        <div className="text-xs text-green-600 flex items-center gap-1.5">
                          <Send size={11} /> Envoyé {lead.sent_at ? new Date(lead.sent_at).toLocaleString('fr-FR') : ''}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-400 gap-3">
          <div className="animate-spin w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full" />
          Chargement...
        </div>
      )}
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const c = score >= 8 ? 'bg-red-100 text-red-700' : score >= 6 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
  return <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${c}`}>🔥 {score}/10</span>
}
function StatusDot({ status }: { status: string }) {
  const m: Record<string, { c: string; i: React.ReactNode }> = {
    pending_approval: { c: 'text-yellow-500', i: <Clock size={13} /> },
    sent: { c: 'text-blue-500', i: <Send size={13} /> },
    rejected: { c: 'text-red-400', i: <XCircle size={13} /> },
  }
  const cfg = m[status] || { c: 'text-gray-400', i: null }
  return <span className={cfg.c}>{cfg.i}</span>
}
