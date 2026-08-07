'use client'
import { useEffect, useState, useCallback } from 'react'
import {
  Building2, User, Globe, Mail, X, Copy, Check,
  FileText, MessageSquare, RefreshCw, Zap, ExternalLink,
  Send, Users, Phone, Search, ChevronDown
} from 'lucide-react'

const SECTOR_LABELS: Record<string, string> = {
  all:               '🌍 Tous secteurs',
  oil_gas:           '⛽ Pétrole & Gaz',
  freight_forwarder: '📦 Transitaires',
  airline:           '✈️ Aérien',
  ground_handler:    '🔧 Ground handler',
  pharma:            '💊 Pharma',
  chemical:          '🧪 Chimie',
  mining:            '⛏️ Mines & Explosifs',
  medical:           '🏥 Médical',
  courier:           '🚚 Courrier express',
}

const COUNTRY_LABELS: Record<string, string> = {
  algerie:      '🇩🇿 Algérie',
  maroc:        '🇲🇦 Maroc',
  senegal:      '🇸🇳 Sénégal',
  cameroun:     '🇨🇲 Cameroun',
  'cote-ivoire':'🇨🇮 Côte d\'Ivoire',
  tunisie:      '🇹🇳 Tunisie',
}

type GHLContact = {
  id: string
  name: string
  firstName: string
  lastName: string
  company: string
  email: string | null
  phone: string | null
  title: string | null
  sector: string
  sectorLabel: string
  country: string
  countryLabel: string
  source: string
  tags: string[]
  createdAt: string
}

type ApolloResult = {
  name: string
  title: string
  company: string
  email: string | null
  linkedin: string | null
  ghl_id: string | null
  status: string
}

type PanelType = 'apollo' | 'email' | 'linkedin' | 'followup' | 'summary'

type Panel = {
  open: boolean
  type: PanelType | null
  contact: GHLContact | null
  content: string
  loading: boolean
}

const PANEL_TITLES: Record<PanelType, string> = {
  apollo:   '🚀 Scan Apollo → GHL',
  email:    '📧 Email de prospection',
  linkedin: '💼 Message LinkedIn',
  followup: '🔁 Relance',
  summary:  '📋 Fiche entreprise',
}

export default function ProspectsPage() {
  const [contacts, setContacts] = useState<GHLContact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sectorFilter, setSectorFilter] = useState('all')
  const [countryFilter, setCountryFilter] = useState('all')

  // Apollo scan state
  const [apolloSector, setApolloSector] = useState('all')
  const [apolloLimit, setApolloLimit] = useState(25)
  const [apolloRunning, setApolloRunning] = useState(false)
  const [apolloStats, setApolloStats] = useState<{
    total: number; withEmail: number; pushed: number; duplicates: number; credits: number; available: number
  } | null>(null)

  const [panel, setPanel] = useState<Panel>({
    open: false, type: null, contact: null, content: '', loading: false,
  })
  const [copied, setCopied] = useState(false)
  const [loadingRows, setLoadingRows] = useState<Record<string, string>>({})

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/prospects/ghl')
      const data = await res.json()
      setContacts(data.contacts || [])
    } catch {
      setContacts([])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchContacts() }, [fetchContacts])

  const filtered = contacts.filter(c => {
    if (sectorFilter !== 'all' && c.sector !== sectorFilter) return false
    if (countryFilter !== 'all' && c.country !== countryFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.title || '').toLowerCase().includes(q)
    }
    return true
  })

  const sectors = [...new Set(contacts.map(c => c.sector))].filter(s => s !== 'all').sort()
  const countries = [...new Set(contacts.map(c => c.country))].filter(Boolean).sort()

  const runApollo = async () => {
    setApolloRunning(true)
    setPanel({
      open: true, type: 'apollo', contact: null,
      content: `🔍 Recherche Apollo en cours...\n\nSecteur : ${SECTOR_LABELS[apolloSector] || apolloSector}\nQuantité demandée : ${apolloLimit} contacts\n\nInterrogation de la base Apollo.io...`,
      loading: true,
    })
    try {
      const res = await fetch('/api/prospects/apollo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sector: apolloSector, limit: apolloLimit }),
      })
      const data = await res.json()
      if (res.ok) {
        setApolloStats({
          total: data.total_found || 0,
          withEmail: data.with_email || 0,
          pushed: data.pushed || 0,
          duplicates: data.duplicates || 0,
          credits: data.credits_used || 0,
          available: data.apollo_total_available || 0,
        })
        const lines = [
          `✅ Scan terminé`,
          ``,
          `📊 Résultats :`,
          `  • Disponibles dans Apollo : ${data.apollo_total_available?.toLocaleString() || '?'}`,
          `  • Récupérés : ${data.total_found}`,
          `  • Avec email : ${data.with_email}`,
          `  • Ajoutés dans GHL : ${data.pushed} ✅`,
          `  • Doublons ignorés : ${data.duplicates} ♻️`,
          `  • Crédits Apollo utilisés : ${data.credits_used}`,
          ``,
          `👥 Contacts traités :`,
          ...(data.contacts || []).map((c: ApolloResult) => {
            const icon = c.status === 'pushed' ? '✅' : c.status === 'duplicate' ? '♻️' : '❌'
            return `  ${icon} ${c.name}${c.title ? ` — ${c.title}` : ''}${c.company ? ` @ ${c.company}` : ''}${c.email ? `\n     📧 ${c.email}` : ''}`
          }),
        ]
        setPanel(prev => ({ ...prev, content: lines.join('\n'), loading: false }))
        // Refresh GHL view
        await fetchContacts()
      } else {
        setPanel(prev => ({ ...prev, content: `❌ Erreur: ${data.error || 'Erreur inconnue'}`, loading: false }))
      }
    } catch {
      setPanel(prev => ({ ...prev, content: '❌ Erreur réseau', loading: false }))
    }
    setApolloRunning(false)
  }

  const generate = async (type: 'email' | 'linkedin' | 'followup' | 'summary', contact: GHLContact) => {
    setLoadingRows(prev => ({ ...prev, [contact.id]: type }))
    setPanel({ open: true, type, contact, content: '', loading: true })
    const prospect = {
      company_name: contact.company,
      decision_maker_name: contact.name,
      decision_maker_title: contact.title,
      contact_email: contact.email,
      sector: contact.sector,
    }
    try {
      const res = await fetch('/api/prospects/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, prospect }),
      })
      const data = await res.json()
      setPanel(prev => ({ ...prev, content: data.text || 'Erreur', loading: false }))
    } catch {
      setPanel(prev => ({ ...prev, content: '❌ Erreur réseau', loading: false }))
    }
    setLoadingRows(prev => {
      const n = { ...prev }; delete n[contact.id]; return n
    })
  }

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const withEmail = contacts.filter(c => c.email).length

  if (loading) return (
    <div className="p-8 space-y-3">
      {[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-gray-200 rounded-xl animate-pulse" />)}
    </div>
  )

  return (
    <div className="flex h-full">
      <div className={`flex-1 p-8 overflow-auto transition-all ${panel.open ? 'mr-[440px]' : ''}`}>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prospects B2B</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {contacts.length} contacts GHL · {withEmail} avec email
              <span className="ml-2 text-purple-600 font-medium">source: Apollo → GHL</span>
            </p>
          </div>
          <button onClick={fetchContacts} className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg" title="Actualiser">
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Apollo Scan Panel */}
        <div className="mb-5 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">Scan Apollo.io → GHL</span>
            {apolloStats && (
              <span className="text-xs text-purple-500 ml-auto">
                Dernier scan : +{apolloStats.pushed} ajoutés · {apolloStats.credits} crédits
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Sector */}
            <div className="relative">
              <select value={apolloSector} onChange={e => setApolloSector(e.target.value)}
                className="appearance-none border border-purple-200 rounded-lg pl-3 pr-7 py-1.5 text-xs text-purple-700 bg-white focus:outline-none focus:ring-1 focus:ring-purple-400">
                {Object.entries(SECTOR_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
            </div>

            {/* Quantity selector */}
            <div className="flex items-center gap-1 border border-purple-200 rounded-lg bg-white overflow-hidden">
              {[10, 25, 50, 100].map(n => (
                <button key={n} onClick={() => setApolloLimit(n)}
                  className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${apolloLimit === n ? 'bg-purple-600 text-white' : 'text-purple-600 hover:bg-purple-50'}`}>
                  {n}
                </button>
              ))}
            </div>

            {/* Reveal emails toggle info */}
            <span className="text-xs text-purple-400">contacts · emails révélés (1 crédit/email)</span>

            {/* Launch button */}
            <button onClick={runApollo} disabled={apolloRunning}
              className="ml-auto flex items-center gap-2 px-4 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60">
              <Users size={13} className={apolloRunning ? 'animate-pulse' : ''} />
              {apolloRunning ? 'Recherche...' : `Scanner ${apolloLimit} contacts`}
            </button>
          </div>

          {/* Sector description */}
          <p className="text-xs text-purple-400 mt-2">
            {apolloSector === 'all'
              ? 'Cible : HSE/QHSE/Logistics/Cargo/Safety managers — tous secteurs DGR'
              : apolloSector === 'oil_gas' ? 'Cible : Sonatrach, TotalEnergies, SLB, Halliburton, ENTP — obligation DGR pour matières radioactives & flammables'
              : apolloSector === 'freight_forwarder' ? 'Cible : SDV/Bolloré, DHL Global Forwarding, Kuehne+Nagel — obligation IATA DGR pour acceptation fret'
              : apolloSector === 'airline' ? 'Cible : Air Algérie, Tassili Airlines — personnel cargo obligatoire DGR IATA Cat. 3-5'
              : apolloSector === 'ground_handler' ? 'Cible : Swissport, dnata — handling DGR obligatoire IATA'
              : apolloSector === 'pharma' ? 'Cible : Saidal, Sanofi, GSK — glace sèche Classe 9, biologiques Classe 6.2'
              : apolloSector === 'chemical' ? 'Cible : ENPC, Cevital — Classe 3/8, transport aérien de produits chimiques'
              : apolloSector === 'mining' ? 'Cible : ENSP, Orica — Classe 1 explosifs, transport aérien matériel de forage'
              : apolloSector === 'medical' ? 'Cible : CHU, cliniques — Classe 6.2 biologiques, Classe 7 radioactifs médicaux'
              : apolloSector === 'courier' ? 'Cible : DHL Express, FedEx, Aramex — DGR obligatoire pour tout opérateur express aérien'
              : ''}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Nom, entreprise, email, titre..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
          <select value={sectorFilter} onChange={e => setSectorFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
            <option value="all">Tous les secteurs ({contacts.length})</option>
            {sectors.map(s => {
              const count = contacts.filter(c => c.sector === s).length
              return <option key={s} value={s}>{SECTOR_LABELS[s] || s} ({count})</option>
            })}
          </select>
          <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
            <option value="all">🌍 Tous les pays</option>
            {countries.map(co => {
              const count = contacts.filter(c => c.country === co).length
              return <option key={co} value={co}>{COUNTRY_LABELS[co] || co} ({count})</option>
            })}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3 mb-5">
          {[
            { label: 'Total GHL', value: contacts.length, color: 'text-gray-700' },
            { label: 'Avec email', value: withEmail, color: 'text-green-700' },
            { label: 'Sans email', value: contacts.length - withEmail, color: 'text-red-500' },
            { label: 'Secteurs', value: sectors.length, color: 'text-purple-700' },
            { label: 'Filtrés', value: filtered.length, color: 'text-blue-700' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-6">#</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Contact</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Entreprise</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Secteur</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Email / Tél</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">IA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c, i) => {
                const rowLoading = loadingRows[c.id]
                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>

                    {/* Contact */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <User size={12} className="text-gray-400 shrink-0" />
                        <span className="font-medium text-gray-900 text-xs">{c.name}</span>
                      </div>
                      {c.title && <div className="text-xs text-gray-400 mt-0.5 pl-4 truncate max-w-[160px]" title={c.title}>{c.title}</div>}
                    </td>

                    {/* Company */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800 text-xs">{c.company || '—'}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{c.source}</div>
                    </td>

                    {/* Sector + Country */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600">{c.sectorLabel || c.sector}</span>
                      {c.countryLabel && (
                        <div className="text-xs text-gray-400 mt-0.5">{c.countryLabel}</div>
                      )}
                    </td>

                    {/* Email / Phone */}
                    <td className="px-4 py-3 max-w-[180px]">
                      {c.email ? (
                        <div className="flex items-center gap-1">
                          <Mail size={10} className="text-green-500 shrink-0" />
                          <a href={`mailto:${c.email}`} className="text-xs text-green-700 hover:underline truncate">{c.email}</a>
                        </div>
                      ) : (
                        <span className="text-xs text-red-400 italic">Pas d'email</span>
                      )}
                      {c.phone && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Phone size={10} className="text-gray-400 shrink-0" />
                          <span className="text-xs text-gray-500">{c.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* AI Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => generate('linkedin', c)} disabled={!!rowLoading} title="Message LinkedIn"
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-40">
                          {rowLoading === 'linkedin' ? <RefreshCw size={12} className="animate-spin" /> : <MessageSquare size={12} />}
                        </button>
                        <button onClick={() => generate('email', c)} disabled={!!rowLoading || !c.email} title="Rédiger email"
                          className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-40">
                          {rowLoading === 'email' ? <RefreshCw size={12} className="animate-spin" /> : <Mail size={12} />}
                        </button>
                        <button onClick={() => generate('followup', c)} disabled={!!rowLoading || !c.email} title="Relance"
                          className="p-1.5 text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-40">
                          {rowLoading === 'followup' ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                        </button>
                        <button onClick={() => generate('summary', c)} disabled={!!rowLoading} title="Fiche entreprise"
                          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40">
                          {rowLoading === 'summary' ? <RefreshCw size={12} className="animate-spin" /> : <FileText size={12} />}
                        </button>
                        <a href={`https://app.strategixs.net/contacts/detail/${c.id}`} target="_blank" rel="noopener noreferrer"
                          title="Voir dans GHL" className="p-1.5 text-gray-300 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors">
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Globe size={32} className="mx-auto mb-2 opacity-30" />
              <p>{contacts.length === 0 ? 'Lance un scan Apollo pour remplir GHL' : 'Aucun contact correspond aux filtres'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Slide panel */}
      {panel.open && (
        <div className="fixed right-0 top-0 h-full w-[440px] bg-white border-l border-gray-200 shadow-xl flex flex-col z-50">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
            <div>
              <div className="font-semibold text-gray-900 text-sm">{panel.type ? PANEL_TITLES[panel.type] : ''}</div>
              {panel.contact && <div className="text-xs text-gray-500 mt-0.5">{panel.contact.company} — {panel.contact.name}</div>}
            </div>
            <button onClick={() => setPanel(prev => ({ ...prev, open: false }))} className="text-gray-400 hover:text-gray-600 p-1">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-5">
            {panel.loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                <RefreshCw size={24} className="animate-spin" />
                <p className="text-sm">
                  {panel.type === 'apollo' ? 'Interrogation Apollo.io...' : 'Agent IA...'}
                </p>
              </div>
            ) : (
              <div>
                {panel.contact && panel.type !== 'apollo' && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-blue-600" />
                      <span className="font-medium text-blue-900">{panel.contact.company}</span>
                    </div>
                    <div className="mt-1 text-blue-700">{panel.contact.name}{panel.contact.title ? ` — ${panel.contact.title}` : ''}</div>
                    {panel.contact.email && <div className="mt-0.5 text-green-700 font-medium">{panel.contact.email}</div>}
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed font-mono border border-gray-200 min-h-[200px]">
                  {panel.content || <span className="text-gray-400 italic">Aucun contenu</span>}
                </div>
              </div>
            )}
          </div>

          {!panel.loading && panel.content && panel.type !== 'apollo' && (
            <div className="border-t border-gray-200 p-4 flex flex-wrap gap-2">
              <button onClick={() => copyText(panel.content)}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800">
                {copied ? <Check size={13} /> : <Copy size={13} />}{copied ? 'Copié !' : 'Copier'}
              </button>
              {panel.type === 'email' && panel.contact?.email && (
                <a href={`mailto:${panel.contact.email}?body=${encodeURIComponent(panel.content)}`}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700">
                  <Mail size={13} />Ouvrir email
                </a>
              )}
            </div>
          )}

          {!panel.loading && panel.content && panel.type === 'apollo' && (
            <div className="border-t border-gray-200 p-4">
              <button onClick={() => copyText(panel.content)}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800">
                {copied ? <Check size={13} /> : <Copy size={13} />}{copied ? 'Copié !' : 'Copier le rapport'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
