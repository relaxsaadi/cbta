import { NextRequest, NextResponse } from 'next/server'
import { processFollowups } from '@/lib/agent'

export const maxDuration = 60

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await processFollowups()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[agent/followup]', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
