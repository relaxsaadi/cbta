import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _client
}

export const supabase = {
  from: (...args: Parameters<SupabaseClient['from']>) => getSupabase().from(...args),
  auth: new Proxy({} as SupabaseClient['auth'], {
    get(_, prop) {
      return getSupabase().auth[prop as keyof SupabaseClient['auth']]
    },
  }),
} as unknown as SupabaseClient

export type Sector = 'airline' | 'freight' | 'handler' | 'courier' | 'oil_gas' | 'pompier' | 'other'
export type LeadStatus = 'new' | 'contacted' | 'negotiating' | 'signed' | 'lost'

export interface Company {
  id: string
  name: string
  country: string
  sector: Sector
  website?: string
  email?: string
  phone?: string
  contact_name?: string
  contact_title?: string
  created_at: string
}

export interface Lead {
  id: string
  company_id: string
  status: LeadStatus
  source?: string
  notes?: string
  value_eur: number
  participants_count: number
  next_action?: string
  next_action_date?: string
  created_at: string
  updated_at: string
  company?: Company
}

export interface EmailLog {
  id: string
  lead_id: string
  subject: string
  sent_at: string
  opened_at?: string
  status: 'sent' | 'opened' | 'replied' | 'bounced'
}

export const SECTORS: Record<Sector, string> = {
  airline: '✈️ Compagnie aérienne',
  freight: '📦 Freight forwarder',
  handler: '🔧 Ground handler',
  courier: '🚚 Courrier express',
  oil_gas: '⛽ Pétrole & Gaz',
  pompier: '🚒 Pompiers / Urgence',
  other: '🏢 Autre',
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Nouveau',
  contacted: 'Contacté',
  negotiating: 'Négociation',
  signed: 'Signé ✅',
  lost: 'Perdu',
}

export const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  negotiating: 'bg-orange-100 text-orange-700',
  signed: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
}

export const COUNTRIES = [
  'Algérie', 'Maroc', 'Tunisie', 'Sénégal', "Côte d'Ivoire",
  'Cameroun', 'Gabon', 'Mali', 'Nigeria', 'Kenya', 'Éthiopie',
  'Ghana', 'Tanzanie', 'Angola', 'RDC', 'Autre'
]
