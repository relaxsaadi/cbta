import { NextRequest } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { scanCbtaInstructorsUnipile } from '@/lib/unipile'

export const maxDuration = 300

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('secret') !== process.env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const countriesParam = req.nextUrl.searchParams.get('countries')
  const targetCountries = countriesParam ? countriesParam.split(',').map(c => c.trim()).filter(Boolean) : ['Algérie']

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }

      try {
        send('status', { msg: `🔗 Scan LinkedIn Sales Navigator démarré — ${targetCountries.join(', ')}` })

        const supabase = getSupabase()
        let saved = 0

        const instructors = await scanCbtaInstructorsUnipile(
          msg => send('status', { msg }),
          targetCountries
        )

        send('status', { msg: `💾 Enregistrement de ${instructors.length} profils...` })

        for (const inst of instructors) {
          // Deduplicate by source_url
          const { data: existing } = await supabase
            .from('cbta_instructors')
            .select('id')
            .eq('source_url', inst.source_url)
            .maybeSingle()

          if (existing) continue

          const { error } = await supabase.from('cbta_instructors').insert({
            full_name: inst.full_name,
            title: inst.title,
            company: inst.company,
            country: inst.country,
            city: inst.city || null,
            linkedin_url: inst.linkedin_url || null,
            source_url: inst.source_url,
            email: inst.email || null,
            phone: inst.phone || null,
            bio: inst.bio,
            certifications: inst.certifications,
            score: inst.score,
            status: 'found',
          })

          if (!error) {
            saved++
            send('instructor', {
              full_name: inst.full_name,
              title: inst.title,
              company: inst.company,
              country: inst.country,
              score: inst.score,
              certifications: inst.certifications,
              email: inst.email,
              phone: inst.phone,
              linkedin_url: inst.linkedin_url,
            })
          }
        }

        send('done', {
          saved,
          msg: saved > 0
            ? `✅ ${saved} instructeur(s) CBTA ajouté(s) via Sales Navigator`
            : '🔍 Aucun nouveau profil (déjà en base ou score < 4)',
        })
      } catch (e) {
        send('error', { msg: String(e) })
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
