import { NextRequest, NextResponse } from 'next/server'

const GHL_TOKEN = process.env.GHL_TOKEN!
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID!

type BatchContact = {
  firstName: string
  lastName: string
  email?: string
  company?: string
  title?: string
  tags: string[]
  linkedin?: string
  source?: string
}

async function pushOne(c: BatchContact): Promise<{ status: 'pushed' | 'duplicate' | 'error'; id?: string; error?: string }> {
  const payload = {
    locationId: GHL_LOCATION_ID,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email || undefined,
    companyName: c.company || '',
    tags: c.tags,
    source: c.source || 'GetLeads-API',
  }

  const res = await fetch('https://services.leadconnectorhq.com/contacts/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GHL_TOKEN}`,
      'Content-Type': 'application/json',
      Version: '2021-07-28',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    // GHL 422 means duplicate contact (same email already exists in location)
    // Check the body to distinguish genuine duplicates from validation errors
    if (res.status === 422 && body.includes('contact')) return { status: 'duplicate' }
    return { status: 'error', error: `HTTP ${res.status}: ${body.slice(0, 200)}` }
  }

  const result = await res.json()
  const contactId = result?.contact?.id
  if (!contactId) return { status: 'error', error: 'No contact ID returned' }

  // Add LinkedIn note if available
  // Save title + LinkedIn as a note
  const noteLines = [
    c.title ? `Poste: ${c.title}` : null,
    c.linkedin ? `LinkedIn: ${c.linkedin}` : null,
    `Source: GetLeads — ${c.tags.join(', ')}`,
  ].filter(Boolean)
  await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GHL_TOKEN}`,
      'Content-Type': 'application/json',
      Version: '2021-07-28',
    },
    body: JSON.stringify({ userId: contactId, body: noteLines.join('\n') }),
  }).catch(() => null)

  return { status: 'pushed', id: contactId }
}

export async function POST(req: NextRequest) {
  if (!GHL_TOKEN || !GHL_LOCATION_ID) {
    return NextResponse.json({ error: 'GHL not configured' }, { status: 500 })
  }

  const body = await req.json().catch(() => ({}))
  const contacts: BatchContact[] = body.contacts || []

  if (!contacts.length) {
    return NextResponse.json({ error: 'No contacts provided' }, { status: 400 })
  }

  const results: Array<{ name: string; company: string; status: string; id?: string; error?: string }> = []

  for (const c of contacts) {
    const result = await pushOne(c)
    results.push({
      name: `${c.firstName} ${c.lastName}`.trim(),
      company: c.company || '',
      ...result,
    })
    // Small delay to respect rate limits
    await new Promise(r => setTimeout(r, 200))
  }

  const pushed = results.filter(r => r.status === 'pushed').length
  const duplicates = results.filter(r => r.status === 'duplicate').length
  const errors = results.filter(r => r.status === 'error').length

  return NextResponse.json({ pushed, duplicates, errors, total: contacts.length, results })
}
