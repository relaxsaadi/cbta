
'use client'
import { useEffect, useState } from 'react'
import { trackLead, trackWhatsApp, trackPhoneClick } from '@/lib/tracking'

const DEADLINE_SESSION = new Date('2026-08-15T23:59:59') // Early bird deadline
const SESSION_DATE = '18 – 22 Août 2026'
const NEXT_SESSION = '15 – 19 Septembre 2026'
const PLACES_LEFT = 12 // Artificial scarcity — update manually

function Countdown({ deadline }: { deadline: Date }) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 })
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, deadline.getTime() - Date.now())
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [deadline])
  return (
    <div className="flex gap-3 justify-center">
      {[{ v: t.d, l: 'Jours' }, { v: t.h, l: 'Heures' }, { v: t.m, l: 'Min' }, { v: t.s, l: 'Sec' }].map(({ v, l }) => (
        <div key={l} className="bg-white/10 rounded-xl px-4 py-3 text-center min-w-[70px]">
          <div className="text-3xl font-black text-white tabular-nums">{String(v).padStart(2, '0')}</div>
          <div className="text-xs text-red-200 mt-1">{l}</div>
        </div>
      ))}
    </div>
  )
}

type FormData = { nom: string; prenom: string; email: string; telephone: string; entreprise: string; poste: string; effectif: string; categorie: string; session: string; message: string }

const INITIAL: FormData = { nom: '', prenom: '', email: '', telephone: '', entreprise: '', poste: '', effectif: '1', categorie: '', session: 'aout', message: '' }

const CATEGORIES = [
  { value: '7.1', label: 'Cat. 7.1 — Expéditeurs de marchandises dangereuses' },
  { value: '7.3', label: 'Cat. 7.3 — Acceptation du fret (agents cargo)' },
  { value: '7.4', label: 'Cat. 7.4 — Personnel de piste & manutention' },
  { value: '7.5', label: 'Cat. 7.5 — Personnel au sol (compagnies aériennes)' },
  { value: '7.6', label: 'Cat. 7.6 — Agents de fret & transitaires' },
  { value: '1',   label: 'Cat. 1 — Pilotes & équipage cabine' },
  { value: '10',  label: 'Cat. 7.10 — Responsables sécurité aéroportuaire' },
]

export default function SessionAoutPage() {
  const [form, setForm] = useState<FormData>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nom || !form.email || !form.telephone || !form.entreprise || !form.categorie) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }
    setSubmitting(true); setError('')
    try {
      // Track Google Ads conversion + GA4
      trackLead({
        email: form.email,
        pays: 'Algérie',
        formation: `DGR Cat.${form.categorie}`,
      })
      // Also save to Supabase leads
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'session-aout-landing',
          nom: form.nom, prenom: form.prenom, email: form.email,
          telephone: form.telephone, entreprise: form.entreprise,
          poste: form.poste, effectif: parseInt(form.effectif),
          categorie_dgr: form.categorie, session_souhaitee: form.session,
          message: form.message,
        }),
      })
      setSubmitted(true)
    } catch {
      setError('Erreur réseau. Appelez-nous directement : +213 542 30 53 83')
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-black text-gray-900 mb-3">Inscription confirmée !</h1>
          <p className="text-gray-600 mb-6">
            Vous serez contacté sous 24h par notre équipe pour confirmer votre place à la session{' '}
            <strong>{form.session === 'aout' ? SESSION_DATE : NEXT_SESSION}</strong>.
          </p>
          <div className="bg-green-50 rounded-xl p-4 text-sm text-green-800 mb-6">
            <strong>KOST GROUP</strong> vous rappellera au <strong>{form.telephone}</strong><br />
            ou contactez-nous directement :
          </div>
          <a href="https://wa.me/213542305383?text=Bonjour%2C%20je%20viens%20de%20m%27inscrire%20pour%20la%20formation%20DGR%20IATA"
            onClick={() => trackWhatsApp("session-aout-confirmation")}
            className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700">
            💬 Confirmer sur WhatsApp
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO — urgence rouge */}
      <div className="bg-gradient-to-br from-red-900 via-red-800 to-[#0f2557] text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-500/30 border border-red-400/40 rounded-full px-4 py-1.5 text-sm font-semibold mb-5 animate-pulse">
            ⚠️ PLACES LIMITÉES — {PLACES_LEFT} places restantes
          </div>
          <h1 className="text-3xl md:text-4xl font-black leading-tight mb-3">
            Formation DGR IATA CBTA<br />
            <span className="text-yellow-400">Session Août 2026 — Dernière chance</span>
          </h1>
          <p className="text-red-200 text-base mb-6 max-w-xl mx-auto">
            Deadline IATA : <strong className="text-white">30 septembre 2026</strong>. Tout personnel manipulant des marchandises dangereuses non certifié expose votre entreprise à une <strong className="text-yellow-400">suspension immédiate</strong>.
          </p>
          <Countdown deadline={DEADLINE_SESSION} />
          <p className="text-red-300 text-xs mt-3">Avant la fin de l'offre early bird (−50 EUR/personne)</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-8">

        {/* LEFT — proof + sessions */}
        <div className="space-y-5">

          {/* Sessions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">📅 Sessions disponibles</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                <div>
                  <div className="font-bold text-gray-900">Session Août 2026 <span className="text-yellow-600 text-xs">⭐ PRIORITAIRE</span></div>
                  <div className="text-sm text-gray-600">{SESSION_DATE} · {PLACES_LEFT} places restantes</div>
                  <div className="text-xs text-green-700 font-semibold mt-1">Early bird : −50 EUR/personne si inscription avant 15 août</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl opacity-80">
                <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                <div>
                  <div className="font-bold text-gray-700">Session Septembre 2026</div>
                  <div className="text-sm text-gray-500">{NEXT_SESSION} · Dernière session avant deadline IATA</div>
                  <div className="text-xs text-red-600 font-medium mt-1">⚠️ Aucune session après septembre</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-4">💰 Tarifs</h2>
            <div className="space-y-2 text-sm">
              {[
                { label: '1–4 personnes', price: '450 EUR/pers', note: '' },
                { label: '5–9 personnes', price: '380 EUR/pers', note: '−15%' },
                { label: '10+ personnes', price: '320 EUR/pers', note: '−29%', best: true },
                { label: 'Early bird (avant 15 août)', price: '−50 EUR/pers', note: '🔥', highlight: true },
              ].map(r => (
                <div key={r.label} className={`flex items-center justify-between px-3 py-2 rounded-lg ${r.best ? 'bg-blue-50 border border-blue-200' : r.highlight ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                  <span className={r.best ? 'font-semibold text-blue-800' : r.highlight ? 'font-semibold text-green-700' : 'text-gray-700'}>{r.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${r.highlight ? 'text-green-600' : 'text-gray-900'}`}>{r.price}</span>
                    {r.note && <span className="text-xs text-green-600 font-semibold">{r.note}</span>}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">Paiement EUR/USD sécurisé · Facture entreprise disponible</p>
          </div>

          {/* Social proof */}
          <div className="bg-[#0f2557] rounded-2xl p-5 text-white">
            <div className="text-xs text-blue-300 uppercase tracking-wider mb-3">KOST GROUP — Certifié IATA CBTA</div>
            <div className="grid grid-cols-3 gap-3 text-center mb-4">
              {[{ v: '95%', l: 'Taux réussite' }, { v: '1er', l: "Centre CBTA Algérie" }, { v: '10', l: 'Catégories DGR' }].map(({ v, l }) => (
                <div key={l}>
                  <div className="text-2xl font-black text-yellow-400">{v}</div>
                  <div className="text-xs text-blue-200">{l}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-blue-200">Certifié par l'IATA — Certificat reconnu mondialement, identique à Genève ou Bruxelles.</p>
            <a href="https://wa.me/213542305383" target="_blank" onClick={() => trackWhatsApp("session-aout-sidebar")} className="flex items-center justify-center gap-2 mt-4 py-2.5 bg-green-500 hover:bg-green-600 rounded-xl text-sm font-bold transition-colors">
              💬 Question ? WhatsApp direct
            </a>
          </div>
        </div>

        {/* RIGHT — registration form */}
        <div className="bg-white rounded-2xl border-2 border-red-200 shadow-xl p-6">
          <div className="text-center mb-5">
            <div className="text-red-600 text-xs font-bold uppercase tracking-wider mb-1">Réservez votre place maintenant</div>
            <h2 className="text-lg font-black text-gray-900">Formulaire d'inscription</h2>
            <p className="text-xs text-gray-500 mt-1">Réponse sous 24h · Sans engagement · Places limitées</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Prénom *</label>
                <input value={form.prenom} onChange={set('prenom')} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" placeholder="Mohamed" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Nom *</label>
                <input value={form.nom} onChange={set('nom')} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" placeholder="Benali" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Email professionnel *</label>
              <input type="email" value={form.email} onChange={set('email')} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" placeholder="m.benali@entreprise.dz" />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">WhatsApp / Téléphone *</label>
              <input type="tel" value={form.telephone} onChange={set('telephone')} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" placeholder="+213 5XX XX XX XX" />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Entreprise *</label>
              <input value={form.entreprise} onChange={set('entreprise')} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" placeholder="Air Algérie / Sonatrach / ..." />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Poste occupé</label>
              <input value={form.poste} onChange={set('poste')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" placeholder="Resp. Formation / Agent Cargo / HSE..." />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Nb de personnes *</label>
                <select value={form.effectif} onChange={set('effectif')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
                  {['1','2','3','5','8','10','15','20','30'].map(n => <option key={n} value={n}>{n} personne{Number(n) > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Session *</label>
                <select value={form.session} onChange={set('session')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
                  <option value="aout">Août 2026 ⭐</option>
                  <option value="septembre">Septembre 2026</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Catégorie DGR *</label>
              <select value={form.categorie} onChange={set('categorie')} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
                <option value="">Sélectionner une catégorie...</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold text-base hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-60 shadow-lg">
              {submitting ? '⏳ Envoi en cours...' : '🎯 Réserver ma place — Session Août 2026'}
            </button>

            <p className="text-center text-xs text-gray-400">
              Sans engagement · Réponse sous 24h · Ou appelez : <a href="tel:+213542305383" onClick={trackPhoneClick} className="text-blue-600 font-medium">+213 542 30 53 83</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
