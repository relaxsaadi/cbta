'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { getSupabase } from '@/lib/supabase'
import {
  GraduationCap, Search, Play, Square, RefreshCw, ExternalLink,
  Linkedin, Mail, Phone, Trash2, ChevronDown, CheckCircle, XCircle,
  Clock, Star, Loader2, Users,
} from 'lucide-react'
import { INSTRUCTOR_COUNTRIES } from '@/lib/instructor-scanner'

interface Instructor {
  id: string
  full_name: string
  title: string
  company: string
  country: string
  city: string
  linkedin_url: string
  source_url: string
  email: string
  phone: string
  bio: string
  certifications: string
  score: number
  status: string
  notes: string
  created_at: string
}

interface LiveEvent {
  type: 'status' | 'instructor' | 'done' | 'error'
  msg?: string
  full_name?: string; country?: string; score?: number
  certifications?: string; email?: string; phone?: string; linkedin_url?: string
  saved?: number
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  found:     { label: 'Trouvé',     color: 'bg-gray-100 text-gray-600',   icon: <Search size={11} /> },
  contacted: { label: 'Contacté',   color: 'bg-blue-100 text-blue-700',   icon: <Mail size={11} /> },
  partner:   { label: 'Partenaire', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={11} /> },
  rejected:  { label: 'Rejeté',     color: 'bg-red-100 text-red-400',     icon: <XCircle size={11} /> },
}

const CERT_COLOR: Record<string, string> = {
  'CBTA': 'bg-[#0f2557] text-white',
  'IATA': 'bg-blue-600 text-white',
  'DGR': 'bg-orange-100 text-orange-700',
  'Examiner': 'bg-purple-100 text-purple-700',
  'Instructor': 'bg-teal-100 text-teal-700',
  'Train the Trainer': 'bg-indigo-100 text-indigo-700',
}

const CYCLE_PAUSE = 20_000

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [bgRunning, setBgRunning] = useState(false)
  const [events, setEvents] = useState<LiveEvent[]>([])
  const [fStatus, setFStatus] = useState('all')
  const [fCountry, setFCountry] = useState('all')
  const [fCert, setFCert] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [scanCountry, setScanCountry] = useState<string>('Algérie')
  const [scanSource, setScanSource] = useState<'web' | 'salesnav'>('salesnav')
  const [cycle, setCycle] = useState(0)
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({})
  const [bulkMenu, setBulkMenu] = useState(false)

  const esRef = useRef<EventSource | null>(null)
  const scanActiveRef = useRef(false)
  const cycleRef = useRef(0)
  const logRef = useRef<HTMLDivElement>(null)

  const fetch_ = useCallback(async () => {
    const { data } = await getSupabase().from('cbta_instructors').select('*').order('score', { ascending: false })
    setInstructors(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch_() }, [fetch_])
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight }, [events])
  useEffect(() => {
    const t = setInterval(fetch_, 90_000)
    return () => clearInterval(t)
  }, [fetch_])

  function connectStream() {
    if (!scanActiveRef.current) return
    cycleRef.current += 1
    setCycle(cycleRef.current)
    const label = scanCountry === 'all' ? (scanSource === 'salesnav' ? 'Algérie (défaut)' : 'Tous les pays') : scanCountry
    const sourceLabel = scanSource === 'salesnav' ? 'Sales Navigator' : 'Web'
    setEvents(p => [...p, { type: 'status', msg: `━━━ Cycle ${cycleRef.current} · ${sourceLabel} · ${label} ━━━` }])

    const secret = process.env.NEXT_PUBLIC_CRON_SECRET || ''
    const countriesParam = scanCountry === 'all' ? '' : encodeURIComponent(scanCountry)
    const endpoint = scanSource === 'salesnav' ? '/api/instructors/scan-sales-nav/stream' : '/api/instructors/scan/stream'
    const es = new EventSource(`${endpoint}?secret=${secret}&countries=${countriesParam}`)
    esRef.current = es

    es.addEventListener('status', e => { const d = JSON.parse(e.data); setEvents(p => [...p, { type: 'status', msg: d.msg }]) })
    es.addEventListener('instructor', e => {
      const d = JSON.parse(e.data)
      setEvents(p => [...p, { type: 'instructor', ...d }])
      fetch_()
    })
    es.addEventListener('done', e => {
      const d = JSON.parse(e.data)
      setEvents(p => [...p, { type: 'done', msg: d.msg, saved: d.saved }, { type: 'status', msg: scanActiveRef.current ? `⏸ ${CYCLE_PAUSE / 1000}s...` : '🛑 Arrêté.' }])
      es.close(); fetch_()
      if (scanActiveRef.current) setTimeout(connectStream, CYCLE_PAUSE); else setScanning(false)
    })
    es.addEventListener('error', (e: Event) => {
      const d = JSON.parse((e as MessageEvent).data || '{}')
      setEvents(p => [...p, { type: 'error', msg: d.msg || 'Erreur' }]); es.close()
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
      setEvents(p => [...p, { type: 'status', msg: '🛑 Arrêté.' }]); return
    }
    scanActiveRef.current = true; cycleRef.current = 0; setScanning(true)
    const label = scanCountry === 'all' ? (scanSource === 'salesnav' ? 'Algérie (défaut)' : 'Tous les pays') : scanCountry
    const sourceLabel = scanSource === 'salesnav' ? '🔗 Sales Navigator' : '🌐 Web'
    setEvents([{ type: 'status', msg: `🚀 Scan instructeurs CBTA · ${sourceLabel} · ${label}` }])
    connectStream()
  }

  async function triggerBackground() {
    if (bgRunning) return
    setBgRunning(true)
    try {
      const endpoint = scanSource === 'salesnav' ? '/api/instructors/scan-sales-nav' : '/api/instructors/scan'
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ countries: scanCountry === 'all' ? undefined : [scanCountry] }),
      })
    } finally { setBgRunning(false); fetch_() }
  }

  const toggle = (id: string) => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const selectAll = () => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(i => i.id)))

  async function bulkDelete() {
    if (!selected.size || !confirm(`Supprimer ${selected.size} instructeur(s) ?`)) return
    await getSupabase().from('cbta_instructors').delete().in('id', Array.from(selected))
    setSelected(new Set()); fetch_()
  }
  async function bulkStatus(status: string) {
    if (!selected.size) return
    await getSupabase().from('cbta_instructors').update({ status }).in('id', Array.from(selected))
    setSelected(new Set()); setBulkMenu(false); fetch_()
  }
  async function updateStatus(id: string, status: string) {
    await getSupabase().from('cbta_instructors').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    fetch_()
  }
  async function saveNotes(id: string) {
    const notes = notesDraft[id]
    if (notes === undefined) return
    await getSupabase().from('cbta_instructors').update({ notes, updated_at: new Date().toISOString() }).eq('id', id)
    fetch_()
  }
  async function saveContact(id: string, field: 'email' | 'phone' | 'country' | 'city', value: string) {
    await getSupabase().from('cbta_instructors').update({ [field]: value, updated_at: new Date().toISOString() }).eq('id', id)
    fetch_()
  }

  // All certifications for filter
  const allCerts = [...new Set(instructors.flatMap(i => i.certifications?.split(',').map(c => c.trim()).filter(Boolean) || []))]

  // Count per country — all entries, empty country → 'Non renseigné'
  const countryCounts = instructors.reduce<Record<string, number>>((a, i) => {
    const c = i.country?.trim() || 'Non renseigné'
    a[c] = (a[c] || 0) + 1
    return a
  }, {})
  // Sort by count desc; 'Non renseigné' and 'International' pushed to bottom
  const DEPRIORITIZED = new Set(['International', 'Non renseigné'])
  const countryOptions = Object.entries(countryCounts).sort((a, b) => {
    if (DEPRIORITIZED.has(a[0]) && !DEPRIORITIZED.has(b[0])) return 1
    if (!DEPRIORITIZED.has(a[0]) && DEPRIORITIZED.has(b[0])) return -1
    return b[1] - a[1]
  })

  const statusCounts = instructors.reduce<Record<string, number>>((a, i) => { a[i.status] = (a[i.status] || 0) + 1; return a }, {})

  const filtered = instructors.filter(i => {
    if (fStatus !== 'all' && i.status !== fStatus) return false
    if (fCountry !== 'all' && (i.country || 'Non renseigné') !== fCountry) return false
    if (fCert !== 'all' && !i.certifications?.includes(fCert)) return false
    return true
  })

  const isFiltered = fStatus !== 'all' || fCountry !== 'all' || fCert !== 'all'

  const stats = {
    total: filtered.length,
    hot: filtered.filter(i => i.score >= 8).length,
    withContact: filtered.filter(i => i.email || i.phone).length,
    partners: filtered.filter(i => i.status === 'partner').length,
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#0f2557] to-blue-700 p-2.5 rounded-xl">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Instructeurs CBTA</h1>
            <p className="text-gray-400 text-xs">Formateurs DGR certifiés IATA — prospects partenariat & recrutement</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={fetch_} className="text-gray-400 hover:text-gray-600 border border-gray-200 p-2 rounded-lg"><RefreshCw size={13} /></button>

          {selected.size > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
              <span className="text-xs text-blue-600 font-medium">{selected.size} sélectionné{selected.size > 1 ? 's' : ''}</span>
              <div className="relative">
                <button onClick={() => setBulkMenu(p => !p)}
                  className="flex items-center gap-1 text-xs border border-blue-300 bg-white text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-50">
                  Statut <ChevronDown size={10} />
                </button>
                {bulkMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-36 py-1">
                    {Object.entries(STATUS_MAP).map(([s, { label }]) => (
                      <button key={s} onClick={() => bulkStatus(s)} className="w-full text-left text-xs px-3 py-2 hover:bg-gray-50 text-gray-700">{label}</button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={bulkDelete} className="flex items-center gap-1 text-xs bg-red-500 text-white px-2.5 py-1 rounded-lg hover:bg-red-600">
                <Trash2 size={10} /> Supprimer
              </button>
            </div>
          )}

          <button onClick={triggerBackground} disabled={bgRunning || scanning}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-all ${bgRunning ? 'border-blue-300 text-blue-500 bg-blue-50' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
            {bgRunning ? <><Loader2 size={11} className="animate-spin" /> Arrière-plan...</> : '🌐 Arrière-plan'}
          </button>

          <button onClick={startScan} disabled={scanning && !scanActiveRef.current}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${scanning ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gradient-to-r from-[#0f2557] to-blue-700 text-white hover:opacity-90'}`}>
            {scanning ? <><Square size={13} /> Arrêter</> : <><Play size={13} /> Scan live</>}
          </button>
        </div>
      </div>

      {/* Source selector — Web vs Sales Navigator */}
      <div className="bg-gray-50 rounded-xl px-4 py-3 mb-3 flex items-center gap-4">
        <span className="text-xs font-semibold text-gray-500 flex-shrink-0">🔎 Source :</span>
        <div className="flex rounded-lg border-2 border-gray-200 overflow-hidden">
          <button
            onClick={() => !scanning && setScanSource('salesnav')}
            disabled={scanning}
            className={`px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${scanSource === 'salesnav' ? 'bg-[#0077B5] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'} ${scanning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Linkedin size={12} /> Sales Navigator
          </button>
          <button
            onClick={() => !scanning && setScanSource('web')}
            disabled={scanning}
            className={`px-3 py-1.5 text-xs font-semibold transition-all border-l-2 border-gray-200 ${scanSource === 'web' ? 'bg-[#0f2557] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'} ${scanning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            🌐 Web (Apify)
          </button>
        </div>
        <p className="ml-auto text-xs text-gray-400">
          {scanSource === 'salesnav'
            ? 'Recherche directe de profils LinkedIn via Sales Navigator (Unipile) — le plus fiable pour identifier des instructeurs actifs.'
            : 'Recherche large sur le web (Google/LinkedIn indexé via Apify) — complète le Sales Navigator.'}
        </p>
      </div>

      {/* Country selector — dropdown */}
      <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 flex items-center gap-4">
        <span className="text-xs font-semibold text-gray-500 flex-shrink-0">🌍 Scanner :</span>
        <select
          value={scanCountry}
          onChange={e => !scanning && setScanCountry(e.target.value)}
          disabled={scanning}
          className={`flex-1 max-w-xs text-sm font-medium border-2 rounded-xl px-3 py-2 focus:outline-none bg-white transition-all
            ${scanning ? 'opacity-50 cursor-not-allowed border-gray-200 text-gray-400' : 'border-[#0f2557] text-[#0f2557] cursor-pointer hover:border-blue-500'}`}
        >
          <option value="all">🌐 Tous les pays</option>
          {INSTRUCTOR_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {scanCountry !== 'all' && (
          <span className="text-xs bg-[#0f2557] text-white px-2.5 py-1 rounded-full font-medium">
            Résultats strictement limités à : {scanCountry}
          </span>
        )}
        <p className="ml-auto text-xs text-gray-400">
          {scanCountry === 'all' ? 'Tous pays · résultats mixtes' : `Scan ciblé · uniquement ${scanCountry}`}
        </p>
      </div>

      {/* Terminal */}
      {events.length > 0 && (
        <div className="bg-gray-950 rounded-xl p-3 mb-4 font-mono text-xs">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-800">
            <div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /><div className="w-2 h-2 rounded-full bg-yellow-500" /><div className="w-2 h-2 rounded-full bg-green-500" /></div>
            <span className="text-gray-500 ml-1">Instructeurs CBTA Scanner</span>
            {scanning && <><div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /><span className="text-gray-500">Cycle {cycle}</span></>}
          </div>
          <div ref={logRef} className="space-y-0.5 max-h-40 overflow-y-auto">
            {events.map((e, i) => (
              <div key={i} className={`flex gap-2 ${e.type === 'error' ? 'text-red-400' : e.type === 'done' ? 'text-green-400' : e.type === 'instructor' ? 'text-blue-300' : 'text-gray-500'}`}>
                <span className="text-gray-700 w-4 text-right flex-shrink-0">{i}</span>
                {e.type === 'instructor'
                  ? <span><span className="font-bold text-blue-400">🎓</span> <span className="text-gray-300">{e.full_name} ({e.country})</span> <span className="bg-blue-900 text-blue-300 px-1 rounded">{e.score}/10</span> <span className="text-gray-600">{e.certifications}</span></span>
                  : <span className={e.msg?.startsWith('━') ? 'text-gray-700' : ''}>{e.msg}</span>}
              </div>
            ))}
            {scanning && <div className="text-blue-400 flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" /> scan continu...</div>}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: isFiltered ? `Filtrés / ${instructors.length}` : 'Total profils', value: String(stats.total), color: 'bg-gray-50 text-gray-700' },
          { label: '⭐ Score ≥ 8', value: String(stats.hot), color: 'bg-blue-50 text-blue-700' },
          { label: '📬 Avec contact', value: String(stats.withContact), color: 'bg-green-50 text-green-700' },
          { label: '🤝 Partenaires', value: String(stats.partners), color: 'bg-purple-50 text-purple-700' },
        ].map(k => (
          <div key={k.label} className={`rounded-xl p-3 ${k.color}`}>
            <div className="text-xl font-bold">{k.value}</div>
            <div className="text-xs mt-0.5 opacity-80">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {!loading && instructors.length === 0 && events.length === 0 && (
        <div className="bg-gradient-to-br from-[#0f2557] to-blue-700 text-white rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">🎓</div>
          <h2 className="text-lg font-bold mb-2">Scanner les instructeurs CBTA</h2>
          <p className="text-blue-200 text-xs mb-5 max-w-md mx-auto">Trouve des formateurs DGR certifiés IATA sur LinkedIn et le web — pour recruter, créer des partenariats ou évaluer la concurrence.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={startScan} className="bg-white text-[#0f2557] px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-50 flex items-center gap-2"><Play size={14} /> Scan live</button>
            <button onClick={triggerBackground} className="bg-white/10 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-white/20 flex items-center gap-2">🌐 Arrière-plan</button>
          </div>
        </div>
      )}

      {/* Filters */}
      {instructors.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2 mb-3 items-center">
            {/* Status */}
            <button onClick={() => setFStatus('all')} className={`text-xs px-3 py-1.5 rounded-lg border ${fStatus === 'all' ? 'bg-[#0f2557] text-white border-[#0f2557]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              Tous ({instructors.length})
            </button>
            {Object.entries(STATUS_MAP).map(([s, { label, icon }]) => (
              <button key={s} onClick={() => setFStatus(s)}
                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border ${fStatus === s ? 'bg-[#0f2557] text-white border-[#0f2557]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {icon} {label} ({statusCounts[s] || 0})
              </button>
            ))}

            {/* Country */}
            <select value={fCountry} onChange={e => setFCountry(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 bg-white focus:outline-none">
              <option value="all">🌍 Tous les pays ({instructors.length})</option>
              {countryOptions.map(([c, n]) => (
                <option key={c} value={c}>{c} ({n})</option>
              ))}
            </select>

            {/* Certification */}
            <select value={fCert} onChange={e => setFCert(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 bg-white focus:outline-none">
              <option value="all">🏅 Certification</option>
              {allCerts.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {isFiltered && <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 font-medium">{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>}
            {filtered.length > 0 && (
              <button onClick={selectAll} className="ml-auto text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-2.5 py-1.5 rounded-lg">
                {selected.size === filtered.length ? 'Désélectionner' : `Sélectionner tout (${filtered.length})`}
              </button>
            )}
          </div>

          {filtered.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">Aucun profil pour ce filtre.</div>}

          <div className="space-y-2">
            {filtered.map(inst => {
              const certs = inst.certifications?.split(',').map(c => c.trim()).filter(Boolean) || []
              const isSelected = selected.has(inst.id)
              const statusCfg = STATUS_MAP[inst.status] || STATUS_MAP.found

              return (
                <div key={inst.id} className={`bg-white rounded-xl border-2 transition-all ${isSelected ? 'border-blue-400' : inst.status === 'partner' ? 'border-green-200' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className="p-4 flex items-start gap-3">

                    {/* Checkbox */}
                    <input type="checkbox" checked={isSelected} onChange={() => toggle(inst.id)} onClick={e => e.stopPropagation()}
                      className="w-4 h-4 rounded cursor-pointer accent-blue-600 flex-shrink-0 mt-3" />

                    {/* Avatar */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0 ${inst.score >= 8 ? 'bg-gradient-to-br from-[#0f2557] to-blue-600' : 'bg-gradient-to-br from-gray-400 to-gray-500'}`}>
                      {(inst.full_name || '?').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>

                    {/* CRM contact card */}
                    <div className="flex-1 min-w-0">

                      {/* Line 1: Name + score + status + expand */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-gray-900">{inst.full_name || '—'}</span>
                        <ScoreBadge score={inst.score} />
                        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${statusCfg.color}`}>{statusCfg.icon} {statusCfg.label}</span>
                        <div className="ml-auto flex items-center gap-1">
                          {certs.slice(0, 4).map(c => (
                            <span key={c} className={`text-xs px-1.5 py-0.5 rounded font-medium ${CERT_COLOR[c] || 'bg-gray-100 text-gray-600'}`}>{c}</span>
                          ))}
                          <button onClick={() => setExpanded(expanded === inst.id ? null : inst.id)}
                            className="text-gray-300 hover:text-gray-500 text-xs ml-2">{expanded === inst.id ? '▲' : '▼'}</button>
                        </div>
                      </div>

                      {/* Line 2: Titre · Entreprise */}
                      {(inst.title || inst.company) && (
                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 flex-wrap">
                          {inst.title && <span className="text-gray-600">{inst.title}</span>}
                          {inst.title && inst.company && <span className="text-gray-300">·</span>}
                          {inst.company && <span className="font-semibold text-gray-800">{inst.company}</span>}
                        </div>
                      )}

                      {/* Line 3: Contact fields in a grid — always visible */}
                      <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5">

                        {/* Email */}
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail size={12} className="text-gray-400 flex-shrink-0" />
                          {inst.email ? (
                            <a href={`mailto:${inst.email}`} onClick={e => e.stopPropagation()}
                              className="text-xs text-blue-600 hover:underline font-medium truncate">{inst.email}</a>
                          ) : (
                            <input
                              type="email"
                              placeholder="email@..."
                              className="text-xs text-gray-400 bg-gray-50 border border-dashed border-gray-200 rounded px-1.5 py-0.5 w-full focus:outline-none focus:border-blue-300 focus:bg-white"
                              onBlur={e => e.target.value && saveContact(inst.id, 'email', e.target.value)}
                              onClick={e => e.stopPropagation()}
                            />
                          )}
                        </div>

                        {/* Pays + Ville — éditables */}
                        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                          <span className="text-gray-400 flex-shrink-0 text-xs">🌍</span>
                          <input
                            type="text"
                            defaultValue={inst.city || ''}
                            placeholder="Ville"
                            className="text-xs text-gray-600 bg-transparent border-b border-dashed border-gray-200 focus:border-blue-300 focus:outline-none w-20 placeholder-gray-300"
                            onBlur={e => saveContact(inst.id, 'city', e.target.value)}
                          />
                          <span className="text-gray-200 text-xs">/</span>
                          <select
                            defaultValue={inst.country || ''}
                            className="text-xs text-gray-700 font-medium bg-transparent border-b border-dashed border-gray-200 focus:border-blue-300 focus:outline-none cursor-pointer"
                            onChange={e => saveContact(inst.id, 'country', e.target.value)}
                          >
                            <option value="">— Pays —</option>
                            {[...INSTRUCTOR_COUNTRIES, 'International', 'Autre'].map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        {/* Téléphone */}
                        <div className="flex items-center gap-2 min-w-0">
                          <Phone size={12} className="text-gray-400 flex-shrink-0" />
                          {inst.phone ? (
                            <a href={`tel:${inst.phone}`} onClick={e => e.stopPropagation()}
                              className="text-xs text-green-600 hover:underline font-medium truncate">{inst.phone}</a>
                          ) : (
                            <input
                              type="tel"
                              placeholder="+213 5XX..."
                              className="text-xs text-gray-400 bg-gray-50 border border-dashed border-gray-200 rounded px-1.5 py-0.5 w-full focus:outline-none focus:border-green-300 focus:bg-white"
                              onBlur={e => e.target.value && saveContact(inst.id, 'phone', e.target.value)}
                              onClick={e => e.stopPropagation()}
                            />
                          )}
                        </div>

                        {/* LinkedIn + Source */}
                        <div className="flex items-center gap-3">
                          {inst.linkedin_url ? (
                            <a href={inst.linkedin_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                              className="flex items-center gap-1 text-xs text-[#0077B5] hover:underline font-medium">
                              <Linkedin size={11} /> LinkedIn
                            </a>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-gray-300"><Linkedin size={11} /> —</span>
                          )}
                          {inst.source_url && (
                            <a href={inst.source_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                              className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 hover:underline">
                              <ExternalLink size={10} /> Source
                            </a>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Expanded */}
                  {expanded === inst.id && (
                    <div className="border-t border-gray-100 p-4 space-y-4">
                      {/* Bio */}
                      {inst.bio && (
                        <div>
                          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Bio / Extrait LinkedIn</div>
                          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 leading-relaxed">{inst.bio}</div>
                        </div>
                      )}

                      {/* Contact details — editable */}
                      <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Coordonnées</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Email</label>
                            <input type="email" defaultValue={inst.email || ''} placeholder="email@company.com"
                              onBlur={e => saveContact(inst.id, 'email', e.target.value)}
                              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Téléphone</label>
                            <input type="tel" defaultValue={inst.phone || ''} placeholder="+213 5XX XX XX XX"
                              onBlur={e => saveContact(inst.id, 'phone', e.target.value)}
                              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400" />
                          </div>
                        </div>
                      </div>

                      {/* LinkedIn */}
                      {inst.linkedin_url && (
                        <div>
                          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Profil LinkedIn</div>
                          <div className="flex items-center gap-3 bg-[#f0f7ff] border border-[#0077B5]/20 rounded-lg p-2.5">
                            <Linkedin size={16} className="text-[#0077B5] flex-shrink-0" />
                            <a href={inst.linkedin_url} target="_blank" rel="noopener noreferrer"
                              className="flex-1 text-xs text-[#0077B5] hover:underline break-all">{inst.linkedin_url}</a>
                            <a href={inst.linkedin_url} target="_blank" rel="noopener noreferrer"
                              className="flex-shrink-0 flex items-center gap-1 bg-[#0077B5] text-white px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[#005f8f]">
                              <ExternalLink size={10} /> Ouvrir
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Notes internes</div>
                        <textarea
                          defaultValue={inst.notes || ''}
                          placeholder="Ajouter une note..."
                          onChange={e => setNotesDraft(p => ({ ...p, [inst.id]: e.target.value }))}
                          onBlur={() => saveNotes(inst.id)}
                          rows={2}
                          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 resize-none"
                        />
                      </div>

                      {/* Status actions */}
                      <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
                        {[
                          { s: 'contacted', label: '📨 Contacté', cls: 'border-blue-200 text-blue-600 hover:bg-blue-50' },
                          { s: 'partner', label: '🤝 Partenaire', cls: 'border-green-200 text-green-600 hover:bg-green-50' },
                          { s: 'rejected', label: '❌ Rejeter', cls: 'border-red-200 text-red-400 hover:bg-red-50 ml-auto' },
                        ].map(({ s, label, cls }) => (
                          inst.status !== s && (
                            <button key={s} onClick={() => updateStatus(inst.id, s)}
                              className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-lg text-xs font-medium ${cls}`}>
                              {label}
                            </button>
                          )
                        ))}
                      </div>

                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={10} /> Trouvé le {new Date(inst.created_at).toLocaleDateString('fr-FR')}
                      </div>
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
          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          Chargement...
        </div>
      )}
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const c = score >= 8 ? 'bg-blue-100 text-blue-700' : score >= 6 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
  return <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${c}`}>⭐ {score}/10</span>
}
