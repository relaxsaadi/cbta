import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Échappe les entrées utilisateur avant insertion dans le HTML de l'email interne
function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { nom, prenom, email, telephone, entreprise, poste, effectif, categorie_dgr, session_souhaitee, message, source } = body

  if (!email || !telephone) {
    return NextResponse.json({ error: 'email and telephone required' }, { status: 400 })
  }

  const supabase = getSupabase()

  // Save to leads table (create if needed)
  const { error } = await supabase.from('session_registrations').insert({
    nom,
    prenom,
    email,
    telephone,
    entreprise,
    poste,
    effectif: effectif || 1,
    categorie_dgr,
    session_souhaitee: session_souhaitee || 'aout',
    message,
    source: source || 'direct',
    created_at: new Date().toISOString(),
  })

  if (error) {
    // Table might not exist yet — log and continue
    console.error('[leads] Supabase insert error:', error.message)
  }

  // Notify via Resend if configured
  if (process.env.RESEND_API_KEY) {
    const fullName = [prenom, nom].filter(Boolean).join(' ')
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'KOST GROUP — Inscription <noreply@dgr.kostacademy.com>',
        to: ['kostgroupe@gmail.com'],
        subject: `🎯 Nouvelle inscription session ${escapeHtml(session_souhaitee || 'août')} — ${escapeHtml(fullName || email)}`,
        html: `
          <h2>Nouvelle inscription DGR IATA</h2>
          <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
            <tr><td style="padding:4px 12px 4px 0;color:#666">Nom</td><td><strong>${escapeHtml(fullName)}</strong></td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#666">Téléphone</td><td><a href="tel:${escapeHtml(telephone)}">${escapeHtml(telephone)}</a></td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#666">Entreprise</td><td>${escapeHtml(entreprise) || '—'}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#666">Poste</td><td>${escapeHtml(poste) || '—'}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#666">Effectif</td><td>${escapeHtml(effectif || 1)} personne(s)</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#666">Catégorie DGR</td><td>${escapeHtml(categorie_dgr) || '—'}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#666">Session souhaitée</td><td><strong>${session_souhaitee === 'aout' ? '18-22 Août 2026 ⭐' : '15-19 Septembre 2026'}</strong></td></tr>
            ${message ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Message</td><td>${escapeHtml(message)}</td></tr>` : ''}
            <tr><td style="padding:4px 12px 4px 0;color:#666">Source</td><td>${source || 'direct'}</td></tr>
          </table>
          <hr style="margin:20px 0;border:none;border-top:1px solid #eee"/>
          <p style="font-size:12px;color:#999">
            Répondre à cet email contacte directement le prospect.<br>
            WhatsApp : <a href="https://wa.me/${String(telephone).replace(/[^0-9]/g, '')}">Ouvrir WhatsApp</a>
          </p>
        `,
        reply_to: String(email),
      }),
    }).catch(err => console.error('[leads] Resend error:', err))
  }

  // Sync to GoHighLevel CRM
  if (process.env.GHL_TOKEN && process.env.GHL_LOCATION_ID) {
    try {
      const fullName = [prenom, nom].filter(Boolean).join(' ')
      const ghlPayload: Record<string, unknown> = {
        locationId: process.env.GHL_LOCATION_ID,
        email: String(email),
        phone: String(telephone),
        firstName: String(prenom || fullName.split(' ')[0] || ''),
        lastName: String(nom || fullName.split(' ').slice(1).join(' ') || ''),
        companyName: String(entreprise || ''),
        tags: ['DGR-Lead', String(source || 'site'), String(categorie_dgr || 'DGR-7.1').replace(/\s+/g, '-')],
        source: 'API',
      }

      const ghlRes = await fetch('https://services.leadconnectorhq.com/contacts/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GHL_TOKEN}`,
          'Content-Type': 'application/json',
          Version: '2021-07-28',
        },
        body: JSON.stringify(ghlPayload),
      })

      const ghlData = await ghlRes.json()
      if (!ghlRes.ok) {
        console.error('[leads] GHL error:', ghlData)
      } else {
        console.info('[leads] GHL contact créé:', ghlData?.contact?.id)
      }
    } catch (err) {
      console.error('[leads] GHL sync failed:', err)
    }
  }

  console.info('[leads] inscription enregistrée:', { email, session_souhaitee, entreprise })
  return NextResponse.json({ ok: true })
}
