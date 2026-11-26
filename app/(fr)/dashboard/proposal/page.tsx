'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { FileText, RefreshCw, Download, Mail, Building2, Users, Search, ChevronDown } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Prospect = {
  id: string; company_name: string; sector: string; decision_maker_name: string | null
  decision_maker_title: string | null; contact_email: string | null; estimated_staff: number | null
  deal_value_eur: number | null; status: string; country: string
}

const HEADCOUNT_OPTIONS = [1, 3, 5, 10, 15, 20, 30]

export default function ProposalPage() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [selected, setSelected] = useState<Prospect | null>(null)
  const [headcount, setHeadcount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [proposalHtml, setProposalHtml] = useState('')
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null)
  const [search, setSearch] = useState('')
  const [fetching, setFetching] = useState(true)

  const fetchProspects = useCallback(async () => {
    const { data } = await supabase
      .from('company_prospects')
      .select('id,company_name,sector,decision_maker_name,decision_maker_title,contact_email,estimated_staff,deal_value_eur,status,country')
      .in('status', ['contacted', 'qualified', 'found'])
      .order('score', { ascending: false })
      .limit(100)
    setProspects(data || [])
    setFetching(false)
  }, [])

  useEffect(() => { fetchProspects() }, [fetchProspects])

  const generate = async () => {
    if (!selected) return
    setLoading(true)
    setProposalHtml('')
    try {
      const res = await fetch('/api/agents/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospect: selected, headcount }),
      })
      const data = await res.json()
      setProposalHtml(data.html || '')
      setSummary(data.summary || null)
      // Upgrade status to qualified
      await supabase.from('company_prospects').update({ status: 'qualified', updated_at: new Date().toISOString() }).eq('id', selected.id)
      setProspects(prev => prev.map(p => p.id === selected.id ? { ...p, status: 'qualified' } : p))
    } catch {
      setProposalHtml('<p style="color:red">Erreur génération</p>')
    }
    setLoading(false)
  }

  const downloadHtml = () => {
    if (!proposalHtml || !selected) return
    const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Proposition KOST — ${selected.company_name}</title></head><body>${proposalHtml}</body></html>`], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `Proposition_KOST_${selected.company_name.replace(/\s+/g, '_')}.html`
    a.click(); URL.revokeObjectURL(url)
  }

  const sendByEmail = async () => {
    if (!selected?.contact_email || !proposalHtml) return
    await fetch('/api/agents/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prospect: selected, customHtml: proposalHtml }),
    })
    alert(`Proposition envoyée à ${selected.contact_email}`)
  }

  const filtered = prospects.filter(p =>
    !search || p.company_name.toLowerCase().includes(search.toLowerCase()) ||
    p.decision_maker_name?.toLowerCase().includes(search.toLowerCase())
  )

  const STATUS_COLOR: Record<string, string> = {
    found: 'bg-blue-100 text-blue-700', contacted: 'bg-yellow-100 text-yellow-700',
    qualified: 'bg-orange-100 text-orange-700', proposal: 'bg-purple-100 text-purple-700',
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left — prospect selector */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FileText size={16} className="text-purple-500" />Générer une Proposition
          </h2>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Chercher entreprise..."
              className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {fetching ? (
            <div className="p-4 space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : filtered.map(p => (
            <button key={p.id} onClick={() => { setSelected(p); setProposalHtml(''); setSummary(null) }}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-purple-50 transition-colors ${selected?.id === p.id ? 'bg-purple-50 border-l-2 border-l-purple-500' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-900 text-sm truncate">{p.company_name}</div>
                <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ml-1 ${STATUS_COLOR[p.status] || 'bg-gray-100 text-gray-500'}`}>{p.status}</span>
              </div>
              <div className="text-xs text-gray-500 truncate mt-0.5">{p.decision_maker_name || '—'} · {p.country}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Right — config + preview */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Building2 size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Sélectionnez un prospect à gauche</p>
            </div>
          </div>
        ) : (
          <>
            {/* Config bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 flex-wrap">
              <div>
                <div className="font-bold text-gray-900">{selected.company_name}</div>
                <div className="text-xs text-gray-500">{selected.decision_maker_name} · {selected.decision_maker_title}</div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white">
                  <Users size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-600">Personnes à former :</span>
                  <div className="relative">
                    <select value={headcount} onChange={e => setHeadcount(Number(e.target.value))}
                      className="text-sm font-semibold text-gray-900 pr-6 appearance-none bg-transparent focus:outline-none">
                      {HEADCOUNT_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <button onClick={generate} disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-60 transition-colors">
                  {loading ? <RefreshCw size={14} className="animate-spin" /> : <FileText size={14} />}
                  {loading ? 'Génération Sonnet...' : 'Générer la proposition'}
                </button>
                {proposalHtml && (
                  <>
                    <button onClick={downloadHtml}
                      className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900">
                      <Download size={13} />HTML
                    </button>
                    {selected.contact_email && (
                      <button onClick={sendByEmail}
                        className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                        <Mail size={13} />Envoyer
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Summary strip */}
            {summary && (
              <div className="bg-purple-50 border-b border-purple-100 px-6 py-3 flex gap-6 text-sm flex-wrap">
                <span className="text-purple-700"><strong>{summary.headcount as number} personnes</strong> × {(summary as Record<string,unknown[]>).categories?.slice(0,2).join(', ')}</span>
                <span className="text-gray-600">Tarif standard : <strong>€{(summary.total_normal as number)?.toLocaleString()}</strong></span>
                <span className="text-green-700 font-semibold">Early bird avant 15 août : <strong>€{(summary.total_early_bird as number)?.toLocaleString()}</strong></span>
                <span className="text-red-600 text-xs font-medium">Sessions : {(summary.sessions as string[])?.join(' / ')}</span>
              </div>
            )}

            {/* Preview */}
            <div className="flex-1 overflow-auto p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
                  <RefreshCw size={28} className="animate-spin text-purple-500" />
                  <div className="text-center">
                    <p className="font-medium text-gray-600">Claude Sonnet génère la proposition...</p>
                    <p className="text-xs mt-1">Personnalisation secteur + calcul tarifaire + mise en page</p>
                  </div>
                </div>
              ) : proposalHtml ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-500 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-yellow-400" /><div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="ml-2">Proposition — {selected.company_name}</span>
                  </div>
                  <div className="p-6" dangerouslySetInnerHTML={{ __html: proposalHtml }} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-300">
                  <div className="text-center">
                    <FileText size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Cliquez "Générer la proposition" pour créer un devis personnalisé</p>
                    <p className="text-xs mt-1 text-gray-400">Généré par Claude Sonnet — personnalisé secteur + tarifs + sessions</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
