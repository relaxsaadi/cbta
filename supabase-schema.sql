-- KOST GROUP — Africa CRM Schema
-- Run this in Supabase SQL Editor

-- Companies
CREATE TABLE companies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  country text NOT NULL DEFAULT 'Algérie',
  sector text NOT NULL DEFAULT 'freight',
  website text,
  email text,
  phone text,
  contact_name text,
  contact_title text,
  created_at timestamptz DEFAULT now()
);

-- Leads
CREATE TABLE leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','contacted','negotiating','signed','lost')),
  source text DEFAULT 'manual',
  notes text,
  value_eur numeric DEFAULT 0,
  participants_count integer DEFAULT 25,
  next_action text,
  next_action_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Email logs
CREATE TABLE email_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  subject text,
  body text,
  sent_at timestamptz DEFAULT now(),
  opened_at timestamptz,
  status text DEFAULT 'sent'
    CHECK (status IN ('sent','opened','replied','bounced'))
);

-- RLS: allow all (auth à ajouter plus tard)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON companies FOR ALL USING (true);
CREATE POLICY "Allow all" ON leads FOR ALL USING (true);
CREATE POLICY "Allow all" ON email_logs FOR ALL USING (true);
