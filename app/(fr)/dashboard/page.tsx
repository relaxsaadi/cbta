'use client'
import { useEffect, useState } from 'react'
import { supabase, STATUS_LABELS, SECTORS, type Lead, type LeadStatus } from '@/lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, TrendingUp, Globe, Award, Plus } from 'lucide-react'
import Link from 'next/link'

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#f97316', '#22c55e', '#ef4444']

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('leads')
      .select('*, company:companies(*)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setLeads(data || [])
        setLoading(false)
      })
  }, [])

  const total = leads.length
  const signed = leads.filter(l => l.status === 'signed').length
  const pipeline = leads.filter(l => ['contacted', 'negotiating'].includes(l.status))
  const pipelineValue = pipeline.reduce((sum, l) => sum + (l.value_eur || 0), 0)
  const countries = [...new Set(leads.map(l => l.company?.country).filter(Boolean))].length

  // By status
  const statusData = (['new', 'contacted', 'negotiating', 'signed', 'lost'] as LeadStatus[]).map(s => ({
    name: STATUS_LABELS[s],
    value: leads.filter(l => l.status === s).length,
  })).filter(d => d.value > 0)

  // By country
  const countryMap: Record<string, number> = {}
  leads.forEach(l => {
    const c = l.company?.country || 'Autre'
    countryMap[c] = (countryMap[c] || 0) + 1
  })
  const countryData = Object.entries(countryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }))

  // By sector
  const sectorMap: Record<string, number> = {}
  leads.forEach(l => {
    const s = l.company?.sector || 'other'
    sectorMap[s] = (sectorMap[s] || 0) + 1
  })

  const recent = leads.slice(0, 5)

  if (loading) return <LoadingState />

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vue globale</h1>
          <p className="text-gray-500 text-sm mt-1">Prospection DGR IATA — Afrique & Maghreb</p>
        </div>
        <Link
          href="/dashboard/leads?new=1"
          className="flex items-center gap-2 bg-[#0f2557] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a3a7a] transition-colors"
        >
          <Plus size={16} /> Ajouter un lead
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <KPICard icon={<Users size={20} />} label="Total leads" value={total} color="blue" />
        <KPICard icon={<Award size={20} />} label="Contrats signés" value={signed} color="green" />
        <KPICard icon={<TrendingUp size={20} />} label="Pipeline (EUR)" value={`€${pipelineValue.toLocaleString()}`} color="orange" />
        <KPICard icon={<Globe size={20} />} label="Pays couverts" value={countries} color="purple" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Leads par pays */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Leads par pays</h2>
          {countryData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={countryData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={110} />
                <Tooltip />
                <Bar dataKey="value" fill="#0f2557" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Par statut */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Pipeline par statut</h2>
          {statusData.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value">
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {statusData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-gray-600">{d.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Secteurs + Derniers leads */}
      <div className="grid grid-cols-2 gap-6">
        {/* Secteurs */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Répartition par secteur</h2>
          {Object.keys(sectorMap).length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="space-y-3">
              {Object.entries(sectorMap).sort((a, b) => b[1] - a[1]).map(([s, count]) => (
                <div key={s} className="flex items-center gap-3">
                  <div className="text-sm w-44 truncate text-gray-600">{SECTORS[s as keyof typeof SECTORS] || s}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-[#0f2557] h-2 rounded-full"
                      style={{ width: `${(count / total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Derniers leads */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Derniers leads ajoutés</h2>
            <Link href="/dashboard/leads" className="text-xs text-blue-600 hover:underline">Voir tout →</Link>
          </div>
          {recent.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              Aucun lead pour l'instant.<br />
              <Link href="/dashboard/leads?new=1" className="text-blue-600 hover:underline mt-2 inline-block">
                Ajouter le premier lead →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map(lead => (
                <div key={lead.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{lead.company?.name}</div>
                    <div className="text-xs text-gray-400">{lead.company?.country} · {SECTORS[lead.company?.sector as keyof typeof SECTORS] || ''}</div>
                  </div>
                  <StatusBadge status={lead.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KPICard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`inline-flex p-2 rounded-lg ${colors[color]} mb-3`}>{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const colors: Record<LeadStatus, string> = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-yellow-100 text-yellow-700',
    negotiating: 'bg-orange-100 text-orange-700',
    signed: 'bg-green-100 text-green-700',
    lost: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

function EmptyChart() {
  return (
    <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
      Aucune donnée — ajoutez des leads pour voir les graphiques
    </div>
  )
}

function LoadingState() {
  return (
    <div className="p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => <div key={i} className="h-64 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    </div>
  )
}
