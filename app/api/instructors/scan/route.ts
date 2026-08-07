import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { scanCbtaInstructors } from '@/lib/instructor-scanner'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  let targetCountries: string[] | undefined
  try { const b = await req.json(); targetCountries = b.countries } catch {}

  const supabase = getSupabase()
  const instructors = await scanCbtaInstructors(undefined, targetCountries)
  let saved = 0, duplicates = 0

  for (const inst of instructors) {
    const { data: existing } = await supabase.from('cbta_instructors').select('id').eq('source_url', inst.source_url).maybeSingle()
    if (existing) { duplicates++; continue }
    const { error } = await supabase.from('cbta_instructors').insert({ ...inst, status: 'found' })
    if (!error) saved++
  }

  return NextResponse.json({ ok: true, saved, duplicates, total: instructors.length })
}

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = getSupabase()
  const instructors = await scanCbtaInstructors()
  let saved = 0
  for (const inst of instructors) {
    const { data: existing } = await supabase.from('cbta_instructors').select('id').eq('source_url', inst.source_url).maybeSingle()
    if (existing) continue
    const { error } = await supabase.from('cbta_instructors').insert({ ...inst, status: 'found' })
    if (!error) saved++
  }
  return NextResponse.json({ ok: true, saved })
}
