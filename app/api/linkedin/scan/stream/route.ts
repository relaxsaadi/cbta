import { NextRequest } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { scanLinkedInProspects } from '@/lib/linkedin-scanner'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const country = req.nextUrl.searchParams.get('country') || 'all'
  const sectors = req.nextUrl.searchParams.get('sectors')?.split(',').filter(Boolean)

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (type: string, data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type, ...data })}\n\n`))
      }

      try {
        const supabase = getSupabase()
        let saved = 0
        let skipped = 0

        const prospects = await scanLinkedInProspects(
          (msg) => send('progress', { msg }),
          sectors,
          country === 'all' ? undefined : country,
        )

        send('progress', { msg: `💾 Sauvegarde de ${prospects.length} prospects...` })

        for (const p of prospects) {
          const { data: existing } = await supabase
            .from('linkedin_prospects')
            .select('id')
            .eq('linkedin_username', p.linkedin_username)
            .maybeSingle()

          if (existing) { skipped++; continue }

          const { error } = await supabase.from('linkedin_prospects').insert({
            linkedin_username: p.linkedin_username,
            full_name: p.full_name,
            title: p.title,
            company: p.company,
            country: p.country,
            sector: p.sector,
            score: p.score,
            profile_url: p.profile_url,
            connection_status: 'found',
            notes: p.notes || null,
          })

          if (!error) {
            saved++
            send('prospect', {
              full_name: p.full_name,
              company: p.company,
              country: p.country,
              score: p.score,
              sector: p.sector,
            })
          }
        }

        send('done', { msg: `✅ Scan terminé — ${saved} nouveaux, ${skipped} doublons` })
      } catch (err) {
        send('error', { msg: String(err) })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
