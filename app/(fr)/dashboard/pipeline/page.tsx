'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase, STATUS_LABELS, SECTORS, type Lead, type LeadStatus } from '@/lib/supabase'

const COLUMNS: LeadStatus[] = ['new', 'contacted', 'negotiating', 'signed']

const COLUMN_STYLES: Record<LeadStatus, { header: string; bg: string; dot: string }> = {
  new:          { header: 'bg-blue-50 text-blue-700',    bg: 'bg-blue-50/50',    dot: 'bg-blue-500' },
  contacted:    { header: 'bg-yellow-50 text-yellow-700', bg: 'bg-yellow-50/50',  dot: 'bg-yellow-500' },
  negotiating:  { header: 'bg-orange-50 text-orange-700', bg: 'bg-orange-50/50',  dot: 'bg-orange-500' },
  signed:       { header: 'bg-green-50 text-green-700',  bg: 'bg-green-50/50',   dot: 'bg-green-500' },
  lost:         { header: 'bg-red-50 text-red-700',      bg: 'bg-red-50/50',     dot: 'bg-red-500' },
}

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLeads = useCallback(async () => {
    const { data } = await supabase
      .from('leads')
      .select('*, company:companies(*)')
      .in('status', COLUMNS)
      .order('updated_at', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const moveStatus = async (lead: Lead, newStatus: LeadStatus) => {
    await supabase.from('leads').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', lead.id)
    fetchLeads()
  }

  if (loading) return (
    <div className="p-8">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-8" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />)}
      </div>
    </div>
  )

  const totalValue = leads.filter(l => l.status === 'signed').reduce((s, l) => s + (l.value_eur || 0), 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-gray-500 text-sm mt-1">
            {leads.length} opportunité{leads.length > 1 ? 's' : ''} · CA signé : <strong className="text-green-600">€{totalValue.toLocaleString()}</strong>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 items-start">
        {COLUMNS.map(status => {
          const col = leads.filter(l => l.status === status)
          const colValue = col.reduce((s, l) => s + (l.value_eur || 0), 0)
          const style = COLUMN_STYLES[status]
          return (
            <div key={status} className="flex flex-col gap-2">
              {/* Column header */}
              <div className={`rounded-lg px-3 py-2.5 flex items-center justify-between ${style.header}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                  <span className="font-semibold text-sm">{STATUS_LABELS[status]}</span>
                </div>
                <span className="text-xs font-bold bg-white/60 px-1.5 py-0.5 rounded-full">{col.length}</span>
              </div>

              {/* Value */}
              {colValue > 0 && (
                <div className="text-xs text-gray-500 text-center">€{colValue.toLocaleString()} potentiel</div>
              )}

              {/* Cards */}
              <div className={`rounded-xl min-h-32 p-2 space-y-2 ${style.bg}`}>
                {col.length === 0 ? (
                  <div className="text-center py-8 text-xs text-gray-400">Aucun lead</div>
                ) : col.map(lead => (
                  <LeadCard key={lead.id} lead={lead} onMove={moveStatus} currentStatus={status} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LeadCard({ lead, onMove, currentStatus }: {
  lead: Lead
  onMove: (lead: Lead, status: LeadStatus) => void
  currentStatus: LeadStatus
}) {
  const [showMenu, setShowMenu] = useState(false)
  const nextStatuses = COLUMNS.filter(s => s !== currentStatus)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow relative">
      <div className="font-medium text-gray-900 text-sm">{lead.company?.name}</div>
      <div className="text-xs text-gray-500 mt-0.5">
        {lead.company?.country} · {SECTORS[lead.company?.sector as keyof typeof SECTORS]?.split(' ')[1] || ''}
      </div>
      {lead.company?.contact_name && (
        <div className="text-xs text-gray-400 mt-1">{lead.company.contact_name}</div>
      )}
      {lead.value_eur ? (
        <div className="text-xs font-semibold text-green-700 mt-2">€{lead.value_eur.toLocaleString()}</div>
      ) : null}
      {lead.next_action && (
        <div className="text-xs text-orange-600 mt-1 truncate">→ {lead.next_action}</div>
      )}
      {lead.participants_count ? (
        <div className="text-xs text-gray-400 mt-1">{lead.participants_count} participants</div>
      ) : null}

      {/* Move button */}
      <div className="mt-2 flex justify-end">
        <div className="relative">
          <button
            onClick={() => setShowMenu(v => !v)}
            className="text-xs text-blue-600 hover:underline"
          >
            Déplacer →
          </button>
          {showMenu && (
            <div className="absolute right-0 top-5 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-32 py-1">
              {nextStatuses.map(s => (
                <button
                  key={s}
                  onClick={() => { onMove(lead, s); setShowMenu(false) }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-700"
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
              <button
                onClick={() => { onMove(lead, 'lost'); setShowMenu(false) }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-red-600"
              >
                Perdu ✗
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
