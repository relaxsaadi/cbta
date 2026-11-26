'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase, STATUS_LABELS, type Lead } from '@/lib/supabase'
import { Mail, Send, Clock, CheckCheck, AlertCircle } from 'lucide-react'

const EMAIL_TEMPLATES = [
  {
    id: 'intro',
    name: 'Email 1 — Introduction réglementaire',
    subject: 'Obligation IATA DGR — Formation obligatoire pour votre équipe',
    body: `Madame, Monsieur,

La réglementation IATA (Résolution 618) et l'Annexe 18 de l'ICAO imposent à toutes les entreprises opérant dans le fret aérien une certification DGR (Marchandises Dangereuses) pour leur personnel.

KOST GROUP, premier centre IATA CBTA certifié d'Algérie (Agrément État N° 537), propose des formations DGR sur site, adaptées à votre secteur d'activité.

Durée : 3 jours / 24h — Certificat IATA reconnu internationalement.

Seriez-vous disponible pour un échange de 15 minutes cette semaine ?

Cordialement,
KOST GROUP
+213 542 30 53 83 | dgr.kostacademy.com`,
  },
  {
    id: 'social_proof',
    name: 'Email 2 — Preuve sociale',
    subject: 'Air Algérie, Algérie Télécom... ils ont choisi KOST GROUP',
    body: `Madame, Monsieur,

Suite à mon précédent message, je souhaitais vous partager quelques références :

Parmi nos clients certifiés DGR IATA :
✓ Air Algérie
✓ Algérie Télécom
✓ ALSTOM
✓ Banque d'Algérie
✓ + 80 entreprises en Algérie et Afrique

Nous proposons des sessions intra-entreprise sur votre site, avec une flexibilité totale sur les dates.

Souhaitez-vous recevoir notre proposition commerciale ?

Cordialement,
KOST GROUP`,
  },
  {
    id: 'urgency',
    name: 'Email 3 — Urgence réglementaire',
    subject: 'Attention : contrôle IATA — Votre personnel est-il certifié ?',
    body: `Madame, Monsieur,

Les audits IATA se multiplient en Afrique. En cas de non-conformité, les sanctions sont lourdes : amendes, suspension de licence cargo, responsabilité civile.

Notre prochaine session DGR IATA est prévue prochainement. Les places sont limitées à 25 participants.

Je vous propose de réserver dès maintenant en m'envoyant un message WhatsApp : +213 542 30 53 83

Cordialement,
KOST GROUP`,
  },
]

export default function CampagnesPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [logs, setLogs] = useState<{ id: string; lead_id: string; subject: string; sent_at: string; status: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState(EMAIL_TEMPLATES[0].id)
  const [sending, setSending] = useState(false)

  const fetchData = useCallback(async () => {
    const [leadsRes, logsRes] = await Promise.all([
      supabase.from('leads').select('*, company:companies(*)').in('status', ['new', 'contacted']).order('created_at', { ascending: false }),
      supabase.from('email_logs').select('*').order('sent_at', { ascending: false }).limit(50),
    ])
    setLeads(leadsRes.data || [])
    setLogs(logsRes.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const template = EMAIL_TEMPLATES.find(t => t.id === selectedTemplate)!

  const handleSendCampaign = async () => {
    if (selectedLeads.length === 0) return alert('Sélectionnez au moins un lead')
    if (!confirm(`Envoyer "${template.name}" à ${selectedLeads.length} contact(s) ?`)) return
    setSending(true)

    // Log emails in Supabase
    for (const lead_id of selectedLeads) {
      await supabase.from('email_logs').insert({
        lead_id,
        subject: template.subject,
        body: template.body,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
    }

    // Update lead status to contacted
    await supabase.from('leads').update({ status: 'contacted', updated_at: new Date().toISOString() })
      .in('id', selectedLeads)

    setSending(false)
    setSelectedLeads([])
    fetchData()
    alert(`✅ ${selectedLeads.length} email(s) enregistré(s). Copiez le texte ci-dessous et envoyez via Gmail / WhatsApp.`)
  }

  const toggleLead = (id: string) =>
    setSelectedLeads(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const stats = {
    sent: logs.length,
    opened: logs.filter(l => l.status === 'opened').length,
    replied: logs.filter(l => l.status === 'replied').length,
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Campagnes email</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez vos séquences de prospection</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard icon={<Send size={18} />} label="Emails envoyés" value={stats.sent} color="blue" />
        <StatCard icon={<CheckCheck size={18} />} label="Ouverts" value={stats.opened} color="green" />
        <StatCard icon={<Mail size={18} />} label="Réponses" value={stats.replied} color="orange" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Template + Leads */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">1. Choisir le template</h2>
            <div className="space-y-2">
              {EMAIL_TEMPLATES.map(t => (
                <label key={t.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedTemplate === t.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="template" value={t.id} checked={selectedTemplate === t.id} onChange={() => setSelectedTemplate(t.id)} className="mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{t.subject}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Aperçu</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Objet :</div>
              <div className="text-sm font-medium text-gray-900 mb-3">{template.subject}</div>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">{template.body}</pre>
            </div>
          </div>
        </div>

        {/* Right: Lead selection */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">2. Sélectionner les destinataires</h2>
              <button
                onClick={() => setSelectedLeads(leads.map(l => l.id))}
                className="text-xs text-blue-600 hover:underline"
              >
                Tout sélectionner ({leads.length})
              </button>
            </div>
            {loading ? (
              <div className="text-gray-400 text-sm animate-pulse">Chargement...</div>
            ) : leads.length === 0 ? (
              <div className="text-gray-400 text-sm text-center py-6">Aucun lead avec email disponible</div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {leads.map(lead => (
                  <label key={lead.id} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${selectedLeads.includes(lead.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <input type="checkbox" checked={selectedLeads.includes(lead.id)} onChange={() => toggleLead(lead.id)} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{lead.company?.name}</div>
                      <div className="text-xs text-gray-400">{lead.company?.country} · {lead.company?.email || 'Pas d\'email'}</div>
                    </div>
                    <span className="text-xs text-gray-400">{STATUS_LABELS[lead.status]}</span>
                  </label>
                ))}
              </div>
            )}

            <button
              onClick={handleSendCampaign}
              disabled={sending || selectedLeads.length === 0}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-[#0f2557] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a3a7a] transition-colors disabled:opacity-40"
            >
              <Send size={15} />
              {sending ? 'Enregistrement...' : `Envoyer à ${selectedLeads.length} contact${selectedLeads.length > 1 ? 's' : ''}`}
            </button>
          </div>

          {/* Log history */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Historique récent</h2>
            {logs.length === 0 ? (
              <div className="text-gray-400 text-sm text-center py-4">Aucun email envoyé</div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {logs.slice(0, 10).map(log => (
                  <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <StatusDot status={log.status} />
                      <div>
                        <div className="text-xs font-medium text-gray-700 truncate max-w-52">{log.subject}</div>
                        <div className="text-xs text-gray-400">{new Date(log.sent_at).toLocaleDateString('fr-FR')}</div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 capitalize">{log.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
      <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  )
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    sent: 'bg-blue-400',
    opened: 'bg-green-400',
    replied: 'bg-green-600',
    bounced: 'bg-red-400',
  }
  return <div className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[status] || 'bg-gray-300'}`} />
}
