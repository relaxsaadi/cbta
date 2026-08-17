import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { lead_id, email_override } = await req.json()

  const { data: lead, error } = await getSupabase()
    .from('intent_leads')
    .select('*')
    .eq('id', lead_id)
    .single()

  if (error || !lead) return NextResponse.json({ error: 'Lead introuvable' }, { status: 404 })

  const toEmail = email_override || lead.email
  if (!toEmail) return NextResponse.json({ error: 'Pas d\'email pour ce lead' }, { status: 400 })

  const msgHtml = lead.message_draft
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')

  const { error: sendError } = await resend.emails.send({
    from: 'KOST GROUP <cbta@dgr.kostacademy.com>',
    to: toEmail,
    subject: `Formation DGR IATA — KOST GROUP, 1er centre CBTA certifié d'Algérie`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:#0f2557;padding:16px 20px;border-radius:10px 10px 0 0;">
        <span style="color:white;font-weight:bold;font-size:16px;">KOST GROUP</span>
        <span style="color:#93c5fd;font-size:12px;display:block;margin-top:2px;">1er Centre IATA CBTA certifié d'Algérie — Agrément N°537</span>
      </div>
      <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;">
        <p style="font-size:14px;line-height:1.7;color:#374151;">${msgHtml}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
        <p style="font-size:12px;color:#6b7280;">📞 +213 542 30 53 83 &nbsp;|&nbsp; 🌐 <a href="https://dgr.kostacademy.com" style="color:#0f2557;">dgr.kostacademy.com</a></p>
      </div>
    </div>`,
    text: lead.message_draft,
  })

  if (sendError) return NextResponse.json({ error: String(sendError) }, { status: 500 })

  // Save email + mark sent
  await getSupabase().from('intent_leads').update({
    email: toEmail,
    status: 'sent',
    sent_at: new Date().toISOString(),
  }).eq('id', lead_id)

  return NextResponse.json({ ok: true })
}
