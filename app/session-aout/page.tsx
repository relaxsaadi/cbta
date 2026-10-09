import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Planning des formations DGR/CBTA — KOST GROUP',
  description: 'Consultez le planning en vigueur pour les formations DGR/CBTA KOST GROUP.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function ExpiredAugustCampaignPage() {
  // The August/September 2026 urgency campaign is expired. Keeping the old
  // scarcity/deadline copy live would be misleading, so this legacy route now
  // forwards visitors to the maintained planning page.
  redirect('/planning')
}
