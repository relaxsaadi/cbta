'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { getSupabase } from '@/lib/supabase'
import { Linkedin, Search, Star, UserPlus, MessageSquare, CheckCircle, RefreshCw, TrendingUp, Users, Send, Eye, Play, Square, Loader2 } from 'lucide-react'
import { LINKEDIN_SECTORS, LINKEDIN_COUNTRIES } from '@/lib/linkedin-scanner'

type ConnectionStatus = 'found' | 'pending' | 'connected' | 'messaged' | 'replied'

interface Prospect {
  id: string
  linkedin_username: string
  full_name: string
  title: string
  company: string
  country: string
  sector: string
  score: number
  connection_status: ConnectionStatus
  profile_url: string
  note_sent?: string
  message_sent?: string
  connected_at?: string
  messaged_at?: string
  notes?: string
  created_at: string
}

const STATUS_CONFIG: Record<ConnectionStatus, { label: string; color: string; icon: React.ReactNode }> = {
  found: { label: 'Trouvé', color: 'bg-gray-100 text-gray-600', icon: <Eye size={12} /> },
  pending: { label: 'Demande envoyée', color: 'bg-blue-100 text-blue-700', icon: <UserPlus size={12} /> },
  connected: { label: 'Connecté', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={12} /> },
  messaged: { label: 'Message envoyé', color: 'bg-purple-100 text-purple-700', icon: <Send size={12} /> },
  replied: { label: 'Répondu ✅', color: 'bg-emerald-100 text-emerald-700', icon: <MessageSquare size={12} /> },
}

const SECTORS = [
  { value: 'airline', label: '✈️ Compagnie aérienne', keywords: 'directeur opérations compagnie aérienne IATA cargo' },
  { value: 'freight', label: '📦 Freight forwarder', keywords: 'freight forwarder dangerous goods DGR transitaire fret aérien' },
  { value: 'handler', label: '🔧 Ground handler', keywords: 'ground handling manager cargo aéroport manutention' },
  { value: 'oil_gas', label: '⛽ Pétrole & Gaz', keywords: 'responsable logistique pétrole gaz transport aérien dangereux' },
  { value: 'courier', label: '🚚 Courrier express', keywords: 'DHL FedEx UPS courrier express dangerous goods manager' },
  { value: 'pompier', label: '🚒 Pompiers / Urgence', keywords: 'chef pompiers aéroport sécurité incendie aéronautique' },
]

const TARGET_COUNTRIES = ['Algérie', 'Maroc', 'Tunisie', 'Sénégal', "Côte d'Ivoire", 'Cameroun', 'Gabon']

export default function LinkedInPage() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterSector, setFilterSector] = useState<string>('all')
  const [searchQ, setSearchQ] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [actionModal, setActionModal] = useState<{ prospect: Prospect; type: 'connect' | 'message' } | null>(null)

  // Scan state
  const [scanning, setScanning] = useState(false)
  const [scanCountry, setScanCountry] = useState<string>('all')
  const [scanSectors, setScanSectors] = useState<string[]>([])
  const [scanEvents, setScanEvents] = useState<Array<{ type: string; msg?: string; full_name?: string; company?: string; country?: string; score?: number }>>([])
  const esRef = useRef<EventSource | null>(null)
  const logRef = useRef<HTMLDivElement>(null)

  const fetchProspects = useCallback(async () => {
    const { data } = await getSupabase()
      .from('linkedin_prospects')
      .select('*')
      .order('score', { ascending: false })
    setProspects(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchProspects() }, [fetchProspects])

  const filtered = prospects.filter(p => {
    if (filterStatus !== 'all' && p.connection_status !== filterStatus) return false
    if (filterSector !== 'all' && p.sector !== filterSector) return false
    if (searchQ && !`${p.full_name} ${p.company} ${p.title}`.toLowerCase().includes(searchQ.toLowerCase())) return false
    return true
  })

  const stats = {
    total: prospects.length,
    pending: prospects.filter(p => p.connection_status === 'pending').length,
    connected: prospects.filter(p => p.connection_status === 'connected').length,
    replied: prospects.filter(p => p.connection_status === 'replied').length,
    hot: prospects.filter(p => p.score >= 8).length,
  }

  async function updateStatus(id: string, status: ConnectionStatus, extra?: Partial<Prospect>) {
    await getSupabase().from('linkedin_prospects').update({
      connection_status: status,
      updated_at: new Date().toISOString(),
      ...extra,
    }).eq('id', id)
    fetchProspects()
  }

  async function deleteSelected() {
    if (!confirm(`Supprimer ${selected.length} prospect(s) ?`)) return
    await getSupabase().from('linkedin_prospects').delete().in('id', selected)
    setSelected([])
    fetchProspects()
  }

  const toggleSelect = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  function startScan() {
    if (scanning) {
      esRef.current?.close()
      setScanning(false)
      return
    }
    setScanEvents([])
    setScanning(true)
    const secret = process.env.NEXT_PUBLIC_CRON_SECRET || ''
    const countryParam = scanCountry === 'all' ? '' : encodeURIComponent(scanCountry)
    const sectorsParam = scanSectors.length ? scanSectors.join(',') : ''
    const url = `/api/linkedin/scan/stream?secret=${secret}&country=${countryParam}&sectors=${sectorsParam}`
    const es = new EventSource(url)
    esRef.current = es

    es.onmessage = (e) => {
      const data = JSON.parse(e.data)
      setScanEvents(prev => [...prev.slice(-80), data])
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
      if (data.type === 'done' || data.type === 'error') {
        es.close()
        setScanning(false)
        fetchProspects()
      }
    }
    es.onerror = () => { es.close(); setScanning(false) }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#0077B5] p-2.5 rounded-xl">
            <Linkedin size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">LinkedIn Agent</h1>
            <p className="text-gray-500 text-sm">Prospection B2B automatisée — DGR IATA Afrique</p>
          </div>
        </div>
        <button onClick={fetchProspects} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-2 rounded-lg">
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <KpiCard icon={<Users size={16} />} label="Total prospects" value={stats.total} color="blue" />
        <KpiCard icon={<Star size={16} />} label="Score ≥ 8/10" value={stats.hot} color="yellow" />
        <KpiCard icon={<UserPlus size={16} />} label="Demandes envoyées" value={stats.pending} color="indigo" />
        <KpiCard icon={<CheckCircle size={16} />} label="Connectés" value={stats.connected} color="green" />
        <KpiCard icon={<MessageSquare size={16} />} label="Réponses" value={stats.replied} color="emerald" />
      </div>

      {/* How it works */}
      {prospects.length === 0 && !loading && (
        <div className="bg-[#0f2557] text-white rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-2">Comment fonctionne l'agent LinkedIn</h2>
          <p className="text-blue-200 text-sm mb-6">L'agent Claude recherche des décideurs sur LinkedIn, les score 1-10, génère des messages personnalisés et suit les connexions.</p>
          <div className="grid grid-cols-4 gap-4">
            {[
              { n: '1', t: 'Recherche', d: 'Claude cherche des décideurs (DRH, Directeur Ops, Cargo Manager) en Afrique' },
              { n: '2', t: 'Scoring IA', d: 'Score 1-10 basé sur le poste, le pays, le secteur et l\'obligation IATA' },
              { n: '3', t: 'Connexion', d: 'Message de connexion personnalisé généré par Claude, envoyé via LinkedIn' },
              { n: '4', t: 'Suivi CRM', d: 'Statut mis à jour : trouvé → demande → connecté → message → répondu' },
            ].map(s => (
              <div key={s.n} className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-300 mb-1">{s.n}</div>
                <div className="font-semibold mb-1">{s.t}</div>
                <div className="text-xs text-blue-200">{s.d}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-blue-900/50 rounded-xl p-4 text-sm text-blue-200">
            💡 <strong className="text-white">Pour lancer une recherche :</strong> Demandez à Claude dans cette session "<em>prospecte des freight forwarders au Maroc sur LinkedIn</em>" — l'agent cherche, score et sauvegarde automatiquement ici.
          </div>
        </div>
      )}

      {/* Scan panel */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-4 flex-wrap mb-4">
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Linkedin size={14} className="text-[#0077B5]" /> Scan LinkedIn</span>

          {/* Country dropdown */}
          <select value={scanCountry} onChange={e => !scanning && setScanCountry(e.target.value)} disabled={scanning}
            className={`text-sm border-2 rounded-xl px-3 py-2 focus:outline-none bg-white transition-all
              ${scanning ? 'opacity-50 cursor-not-allowed border-gray-200 text-gray-400' : 'border-[#0077B5] text-[#0077B5] cursor-pointer'}`}>
            <option value="all">🌐 Tous les pays</option>
            {LINKEDIN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {scanCountry !== 'all' && (
            <span className="text-xs bg-[#0077B5] text-white px-2.5 py-1 rounded-full font-medium">
              Limité à : {scanCountry}
            </span>
          )}

          <button onClick={startScan}
            className={`ml-auto flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${scanning ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[#0077B5] text-white hover:bg-[#006097]'}`}>
            {scanning ? <><Square size={13} /> Arrêter</> : <><Play size={13} /> Scan LinkedIn</>}
          </button>
        </div>

        {/* Sector chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs text-gray-400 self-center">Secteurs :</span>
          {LINKEDIN_SECTORS.map(s => (
            <button key={s.value} onClick={() => !scanning && setScanSectors(p => p.includes(s.value) ? p.filter(x => x !== s.value) : [...p, s.value])}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${scanning ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                ${scanSectors.includes(s.value) ? 'bg-[#0077B5] text-white border-[#0077B5]' : 'border-gray-300 text-gray-500 bg-white hover:border-[#0077B5]'}`}>
              {s.label}
            </button>
          ))}
          <button onClick={() => !scanning && setScanSectors(scanSectors.length === LINKEDIN_SECTORS.length ? [] : LINKEDIN_SECTORS.map(s => s.value))}
            className="text-xs text-gray-400 hover:text-gray-600 underline ml-1">
            {scanSectors.length === LINKEDIN_SECTORS.length ? 'Tout désélectionner' : 'Tout sélectionner'}
          </button>
        </div>

        {/* Terminal */}
        {scanEvents.length > 0 && (
          <div className="bg-gray-950 rounded-xl p-3 font-mono text-xs">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-800">
              <div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /><div className="w-2 h-2 rounded-full bg-yellow-500" /><div className="w-2 h-2 rounded-full bg-green-500" /></div>
              <span className="text-gray-500">LinkedIn Scanner</span>
              {scanning && <><Loader2 size={10} className="animate-spin text-blue-400" /><span className="text-blue-400">en cours...</span></>}
            </div>
            <div ref={logRef} className="space-y-0.5 max-h-36 overflow-y-auto">
              {scanEvents.map((e, i) => (
                <div key={i} className={`${e.type === 'error' ? 'text-red-400' : e.type === 'done' ? 'text-green-400' : e.type === 'prospect' ? 'text-yellow-300' : 'text-gray-500'}`}>
                  {e.type === 'prospect'
                    ? <span><span className="text-yellow-400 font-bold">NEW</span> {e.full_name} ({e.country}) <span className={`px-1 rounded ${e.score! >= 8 ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>{e.score}/10</span></span>
                    : <span>{e.msg}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search Targets */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp size={16} /> Cibles de prospection prioritaires
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {SECTORS.map(s => (
            <div key={s.value} className="border border-gray-100 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-800 mb-1">{s.label}</div>
              <div className="text-xs text-gray-400 mb-2">Keywords : <em>{s.keywords}</em></div>
              <div className="flex flex-wrap gap-1">
                {TARGET_COUNTRIES.slice(0, 4).map(c => (
                  <span key={c} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{c}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters + Table */}
      {prospects.length > 0 && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un prospect..."
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none">
              <option value="all">Tous les statuts</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select value={filterSector} onChange={e => setFilterSector(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none">
              <option value="all">Tous les secteurs</option>
              {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            {selected.length > 0 && (
              <button onClick={deleteSelected} className="text-sm text-red-600 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-50">
                Supprimer ({selected.length})
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left"><input type="checkbox" onChange={e => setSelected(e.target.checked ? filtered.map(p => p.id) : [])} /></th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Prospect</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Entreprise</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Pays</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0077B5] flex items-center justify-center text-white text-xs font-bold">
                          {(p.full_name || 'X')[0]}
                        </div>
                        <div>
                          <a href={p.profile_url || `https://linkedin.com/in/${p.linkedin_username}`} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-900 hover:text-[#0077B5]">
                            {p.full_name || p.linkedin_username}
                          </a>
                          <div className="text-xs text-gray-400 truncate max-w-48">{p.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.company}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.country}</td>
                    <td className="px-4 py-3">
                      <ScoreBadge score={p.score} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.connection_status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {p.connection_status === 'found' && (
                          <button
                            onClick={() => updateStatus(p.id, 'pending', { connected_at: new Date().toISOString() })}
                            className="text-xs bg-[#0077B5] text-white px-2.5 py-1.5 rounded-lg hover:bg-[#005885] flex items-center gap-1"
                          >
                            <UserPlus size={11} /> Marquer envoyé
                          </button>
                        )}
                        {p.connection_status === 'pending' && (
                          <button
                            onClick={() => updateStatus(p.id, 'connected')}
                            className="text-xs bg-green-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-green-700 flex items-center gap-1"
                          >
                            <CheckCircle size={11} /> Connecté
                          </button>
                        )}
                        {p.connection_status === 'connected' && (
                          <button
                            onClick={() => updateStatus(p.id, 'messaged', { messaged_at: new Date().toISOString() })}
                            className="text-xs bg-purple-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-purple-700 flex items-center gap-1"
                          >
                            <Send size={11} /> Message envoyé
                          </button>
                        )}
                        {p.connection_status === 'messaged' && (
                          <button
                            onClick={() => updateStatus(p.id, 'replied', { replied_at: new Date().toISOString() } as Partial<Prospect>)}
                            className="text-xs bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-emerald-700 flex items-center gap-1"
                          >
                            <MessageSquare size={11} /> Répondu
                          </button>
                        )}
                        <a
                          href={p.profile_url || `https://linkedin.com/in/${p.linkedin_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#0077B5] border border-[#0077B5]/30 px-2.5 py-1.5 rounded-lg hover:bg-[#0077B5]/5"
                        >
                          Voir profil
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm">Aucun prospect trouvé avec ces filtres</div>
            )}
          </div>
          <div className="mt-3 text-xs text-gray-400">{filtered.length} prospect(s) affichés sur {prospects.length} total</div>
        </>
      )}

      {loading && (
        <div className="text-center py-12 text-gray-400">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
          Chargement...
        </div>
      )}
    </div>
  )
}

function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    emerald: 'bg-emerald-50 text-emerald-700',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 8 ? 'bg-green-100 text-green-700' : score >= 6 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${color}`}>
      <Star size={10} /> {score}/10
    </span>
  )
}

function StatusBadge({ status }: { status: ConnectionStatus }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.found
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  )
}
