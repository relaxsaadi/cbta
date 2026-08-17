'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase, STATUS_LABELS, STATUS_COLORS, SECTORS, COUNTRIES, type Lead, type Company, type LeadStatus, type Sector } from '@/lib/supabase'
import { Search, Plus, X, ChevronDown, Pencil, Trash2 } from 'lucide-react'

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCountry, setFilterCountry] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSector, setFilterSector] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editLead, setEditLead] = useState<Lead | null>(null)

  const fetchLeads = useCallback(async () => {
    const { data } = await supabase
      .from('leads')
      .select('*, company:companies(*)')
      .order('created_at', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const filtered = leads.filter(l => {
    const name = l.company?.name?.toLowerCase() || ''
    const contact = l.company?.contact_name?.toLowerCase() || ''
    const q = search.toLowerCase()
    return (
      (!search || name.includes(q) || contact.includes(q)) &&
      (!filterCountry || l.company?.country === filterCountry) &&
      (!filterStatus || l.status === filterStatus) &&
      (!filterSector || l.company?.sector === filterSector)
    )
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce lead ?')) return
    await supabase.from('leads').delete().eq('id', id)
    fetchLeads()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} contact{filtered.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setEditLead(null); setShowModal(true) }}
          className="flex items-center gap-2 bg-[#0f2557] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a3a7a] transition-colors"
        >
          <Plus size={16} /> Nouveau lead
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Select value={filterCountry} onChange={setFilterCountry} placeholder="Pays">
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Select value={filterStatus} onChange={setFilterStatus} placeholder="Statut">
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Select>
        <Select value={filterSector} onChange={setFilterSector} placeholder="Secteur">
          {Object.entries(SECTORS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Select>
        {(filterCountry || filterStatus || filterSector || search) && (
          <button
            onClick={() => { setFilterCountry(''); setFilterStatus(''); setFilterSector(''); setSearch('') }}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            <X size={13} /> Réinitialiser
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 text-sm mb-3">Aucun lead trouvé</div>
            <button
              onClick={() => { setEditLead(null); setShowModal(true) }}
              className="text-blue-600 text-sm hover:underline"
            >
              + Ajouter le premier lead
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Entreprise</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Pays</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Secteur</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Valeur</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Prochaine action</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{lead.company?.name}</div>
                    {lead.company?.website && (
                      <a href={lead.company.website} target="_blank" className="text-xs text-blue-500 hover:underline">
                        {lead.company.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{lead.company?.country}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{SECTORS[lead.company?.sector as Sector] || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{lead.company?.contact_name || '—'}</div>
                    <div className="text-xs text-gray-400">{lead.company?.contact_title}</div>
                    {lead.company?.email && (
                      <a href={`mailto:${lead.company.email}`} className="text-xs text-blue-500 hover:underline">{lead.company.email}</a>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[lead.status]}`}>
                      {STATUS_LABELS[lead.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-medium">
                    {lead.value_eur ? `€${lead.value_eur.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-600">{lead.next_action || '—'}</div>
                    {lead.next_action_date && (
                      <div className="text-xs text-gray-400">{new Date(lead.next_action_date).toLocaleDateString('fr-FR')}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditLead(lead); setShowModal(true) }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <LeadModal
          lead={editLead}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchLeads() }}
        />
      )}
    </div>
  )
}

function Select({ value, onChange, placeholder, children }: {
  value: string; onChange: (v: string) => void; placeholder: string; children: React.ReactNode
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  )
}

function LeadModal({ lead, onClose, onSaved }: { lead: Lead | null; onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    company_name: lead?.company?.name || '',
    country: lead?.company?.country || 'Algérie',
    sector: lead?.company?.sector || 'freight',
    website: lead?.company?.website || '',
    email: lead?.company?.email || '',
    phone: lead?.company?.phone || '',
    contact_name: lead?.company?.contact_name || '',
    contact_title: lead?.company?.contact_title || '',
    status: lead?.status || 'new',
    value_eur: lead?.value_eur || 0,
    participants_count: lead?.participants_count || 25,
    source: lead?.source || 'manual',
    notes: lead?.notes || '',
    next_action: lead?.next_action || '',
    next_action_date: lead?.next_action_date || '',
  })

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.company_name) return alert('Nom de l\'entreprise requis')
    setSaving(true)

    let company_id = lead?.company_id

    if (!company_id) {
      const { data } = await supabase.from('companies').insert({
        name: form.company_name,
        country: form.country,
        sector: form.sector,
        website: form.website || null,
        email: form.email || null,
        phone: form.phone || null,
        contact_name: form.contact_name || null,
        contact_title: form.contact_title || null,
      }).select().single()
      company_id = data?.id
    } else {
      await supabase.from('companies').update({
        name: form.company_name,
        country: form.country,
        sector: form.sector,
        website: form.website || null,
        email: form.email || null,
        phone: form.phone || null,
        contact_name: form.contact_name || null,
        contact_title: form.contact_title || null,
      }).eq('id', company_id)
    }

    const leadData = {
      company_id,
      status: form.status as LeadStatus,
      value_eur: Number(form.value_eur),
      participants_count: Number(form.participants_count),
      source: form.source,
      notes: form.notes || null,
      next_action: form.next_action || null,
      next_action_date: form.next_action_date || null,
      updated_at: new Date().toISOString(),
    }

    if (lead) {
      await supabase.from('leads').update(leadData).eq('id', lead.id)
    } else {
      await supabase.from('leads').insert(leadData)
    }

    setSaving(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{lead ? 'Modifier le lead' : 'Nouveau lead'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-5">
          <Section title="Entreprise">
            <Field label="Nom *"><Input value={form.company_name} onChange={v => set('company_name', v)} placeholder="Air Sénégal" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pays">
                <select value={form.country} onChange={e => set('country', e.target.value)} className="input">
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Secteur">
                <select value={form.sector} onChange={e => set('sector', e.target.value)} className="input">
                  {Object.entries(SECTORS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Site web"><Input value={form.website} onChange={v => set('website', v)} placeholder="https://..." /></Field>
          </Section>

          <Section title="Contact">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nom"><Input value={form.contact_name} onChange={v => set('contact_name', v)} placeholder="John Doe" /></Field>
              <Field label="Poste"><Input value={form.contact_title} onChange={v => set('contact_title', v)} placeholder="Directeur Ops" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email"><Input value={form.email} onChange={v => set('email', v)} placeholder="contact@..." /></Field>
              <Field label="Téléphone"><Input value={form.phone} onChange={v => set('phone', v)} placeholder="+221..." /></Field>
            </div>
          </Section>

          <Section title="Opportunité">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Statut">
                <select value={form.status} onChange={e => set('status', e.target.value)} className="input">
                  {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
              <Field label="Valeur (EUR)"><Input type="number" value={String(form.value_eur)} onChange={v => set('value_eur', v)} placeholder="12000" /></Field>
              <Field label="Participants"><Input type="number" value={String(form.participants_count)} onChange={v => set('participants_count', v)} placeholder="25" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Source">
                <select value={form.source} onChange={e => set('source', e.target.value)} className="input">
                  <option value="manual">Manuel</option>
                  <option value="apify_linkedin">Apify LinkedIn</option>
                  <option value="apify_maps">Apify Maps</option>
                  <option value="referral">Référence</option>
                  <option value="inbound">Entrant</option>
                </select>
              </Field>
              <Field label="Date prochaine action"><Input type="date" value={form.next_action_date} onChange={v => set('next_action_date', v)} /></Field>
            </div>
            <Field label="Prochaine action"><Input value={form.next_action} onChange={v => set('next_action', v)} placeholder="Envoyer proposition..." /></Field>
            <Field label="Notes">
              <textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                rows={3}
                className="input resize-none"
                placeholder="Notes libres..."
              />
            </Field>
          </Section>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Annuler</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm bg-[#0f2557] text-white rounded-lg hover:bg-[#1a3a7a] transition-colors disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="input"
    />
  )
}
