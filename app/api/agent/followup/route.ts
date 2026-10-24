import { NextRequest, NextResponse } from 'next/server'
import { requireDashboardRequest } from '@/lib/dashboard-auth'
import { processFollowups } from '@/lib/agent'

export const maxDuration = 60

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
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

// Human button uses POST; scheduled GET above remains Bearer-only.
export async function POST(req: NextRequest) {
  const denied = requireDashboardRequest(req)
  if (denied) return denied
  try {
    const result = await processFollowups()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[agent/followup manual]', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
