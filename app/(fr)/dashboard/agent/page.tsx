'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Bot, Play, Clock, Send, CheckCheck, AlertTriangle, Zap } from 'lucide-react'

export default function AgentPage() {
  const [logs, setLogs] = useState<{ id: string; subject: string; sent_at: string; status: string; lead_id: string }[]>([])
  const [stats, setStats] = useState({ new: 0, contacted: 0, noEmail: 0 })
  const [running, setRunning] = useState(false)
  const [lastRun, setLastRun] = useState<{ processed: number; sent: number; skipped: number } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const [logsRes, newLeads, contacted] = await Promise.all([
      supabase.from('email_logs').select('*').order('sent_at', { ascending: false }).limit(20),
      supabase.from('leads').select('id', { count: 'exact' }).eq('status', 'new'),
      supabase.from('leads').select('id', { count: 'exact' }).eq('status', 'contacted'),
    ])
    setLogs(logsRes.data || [])
    setStats({
      new: newLeads.count || 0,
      contacted: contacted.count || 0,
      noEmail: 0,
    })
  }

  async function runAgent() {
    setRunning(true)
    setError('')
    setLastRun(null)
    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'local'}` },
      })
      const data = await res.json()
      if (data.ok) {
        setLastRun(data)
        fetchData()
      } else {
        setError(data.error || 'Erreur inconnue')
      }
    } catch (e) {
      setError(String(e))
    }
    setRunning(false)
  }

  async function runFollowup() {
    setRunning(true)
    setError('')
    try {
      const res = await fetch('/api/agent/followup', {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'local'}` },
      })
      const data = await res.json()
      if (data.ok) {
        setLastRun({ processed: data.j3 + data.j7, sent: data.j3 + data.j7, skipped: 0 })
        fetchData()
      } else {
        setError(data.error || 'Erreur inconnue')
      }
    } catch (e) {
      setError(String(e))
    }
    setRunning(false)
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-[#0f2557] p-2.5 rounded-xl">
          <Bot size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent autonome</h1>
          <p className="text-gray-500 text-sm">Prospection automatique — DGR IATA Afrique</p>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <div className="text-3xl font-bold text-blue-700">{stats.new}</div>
          <div className="text-sm text-blue-600 mt-1">Leads en attente</div>
          <div className="text-xs text-blue-400 mt-1">Prêts à être traités</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5">
          <div className="text-3xl font-bold text-yellow-700">{stats.contacted}</div>
          <div className="text-sm text-yellow-600 mt-1">En cours de séquence</div>
          <div className="text-xs text-yellow-400 mt-1">Attente réponse / relance</div>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-5">
          <div className="text-3xl font-bold text-green-700">{logs.filter(l => l.status === 'replied').length}</div>
          <div className="text-sm text-green-600 mt-1">Réponses reçues</div>
          <div className="text-xs text-green-400 mt-1">À traiter manuellement</div>
        </div>
      </div>

      {/* Cron schedule */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock size={16} /> Planning automatique (Vercel Cron)
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <div>
                <div className="text-sm font-medium text-gray-900">Prospection nouveaux leads</div>
                <div className="text-xs text-gray-400">Lun–Ven à 08h00 — 10 leads max/jour</div>
              </div>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Actif</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <div>
                <div className="text-sm font-medium text-gray-900">Relances J+3 et J+7</div>
                <div className="text-xs text-gray-400">Lun–Ven à 09h00 — séquences automatiques</div>
              </div>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Actif</span>
          </div>
        </div>
      </div>

      {/* Manual controls */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Zap size={16} /> Lancer manuellement
        </h2>
        <div className="flex gap-3">
          <button
            onClick={runAgent}
            disabled={running || stats.new === 0}
            className="flex items-center gap-2 bg-[#0f2557] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a3a7a] transition-colors disabled:opacity-40"
          >
            <Play size={15} />
            {running ? 'En cours...' : `Traiter les ${stats.new} nouveaux leads`}
          </button>
          <button
            onClick={runFollowup}
            disabled={running}
            className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-40"
          >
            <Send size={15} />
            Lancer les relances
          </button>
        </div>

        {lastRun && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
            ✅ Terminé — {lastRun.processed} traités · {lastRun.sent} emails envoyés · {lastRun.skipped} ignorés
          </div>
        )}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 flex items-start gap-2">
            <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}

        {stats.new === 0 && !running && (
          <p className="mt-3 text-xs text-gray-400">
            Aucun lead en attente. <a href="/dashboard/leads?new=1" className="text-blue-500 hover:underline">Ajouter des leads →</a>
          </p>
        )}
      </div>

      {/* Email log */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Derniers emails envoyés</h2>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">Aucun email envoyé pour l'instant</div>
        ) : (
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <StatusIcon status={log.status} />
                  <div>
                    <div className="text-sm text-gray-900 truncate max-w-md">{log.subject}</div>
                    <div className="text-xs text-gray-400">{new Date(log.sent_at).toLocaleString('fr-FR')}</div>
                  </div>
                </div>
                <StatusBadge status={log.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'sent') return <Send size={15} className="text-blue-500" />
  if (status === 'opened') return <CheckCheck size={15} className="text-green-500" />
  if (status === 'replied') return <CheckCheck size={15} className="text-green-700" />
  return <AlertTriangle size={15} className="text-red-400" />
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    sent: 'bg-blue-100 text-blue-700',
    opened: 'bg-green-100 text-green-700',
    replied: 'bg-green-200 text-green-800',
    bounced: 'bg-red-100 text-red-700',
  }
  const labels: Record<string, string> = {
    sent: 'Envoyé', opened: 'Ouvert', replied: 'Répondu', bounced: 'Bounce',
  }
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {labels[status] || status}
    </span>
  )
}
