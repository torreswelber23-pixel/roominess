-- Homes / Roominess domain schema.
-- Apply after the upstream Meta sample tables documented in README.md.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE lead_stage AS ENUM ('new', 'contacted', 'qualified', 'visit_scheduled', 'proposal', 'won', 'lost');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE lead_temperature AS ENUM ('cold', 'warm', 'hot');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  display_name VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  email VARCHAR,
  source VARCHAR NOT NULL DEFAULT 'whatsapp',
  stage lead_stage NOT NULL DEFAULT 'new',
  score SMALLINT NOT NULL DEFAULT 10 CHECK (score BETWEEN 0 AND 100),
  temperature lead_temperature NOT NULL DEFAULT 'cold',
  intent VARCHAR,
  property_type VARCHAR,
  preferred_location VARCHAR,
  budget_min NUMERIC(14,2),
  budget_max NUMERIC(14,2),
  bedrooms SMALLINT,
  urgency VARCHAR,
  qualification_summary TEXT,
  next_best_action TEXT,
  last_contact_at TIMESTAMPTZ,
  next_action_at TIMESTAMPTZ,
  assigned_to VARCHAR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, phone)
);
CREATE INDEX IF NOT EXISTS leads_user_stage_idx ON leads (user_id, stage, score DESC);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  waba_id VARCHAR NOT NULL,
  phone_number_id VARCHAR NOT NULL,
  contact_phone VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'open',
  last_message_preview TEXT,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unread_count INTEGER NOT NULL DEFAULT 0,
  assigned_to VARCHAR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, phone_number_id, contact_phone)
);
CREATE INDEX IF NOT EXISTS conversations_user_recent_idx ON conversations (user_id, last_message_at DESC);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  meta_message_id VARCHAR UNIQUE,
  direction VARCHAR NOT NULL CHECK (direction IN ('inbound', 'outbound', 'system')),
  message_type VARCHAR NOT NULL DEFAULT 'text',
  body TEXT,
  status VARCHAR,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS messages_conversation_time_idx ON messages (conversation_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS lead_qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  provider VARCHAR NOT NULL,
  model VARCHAR,
  score SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 100),
  summary TEXT NOT NULL,
  missing_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  next_best_action TEXT,
  input_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lead_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  event_type VARCHAR NOT NULL,
  actor_type VARCHAR NOT NULL DEFAULT 'system',
  actor_id VARCHAR,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS call_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  phone_number_id VARCHAR NOT NULL,
  contact_phone VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'unknown',
  permission_type VARCHAR,
  expires_at TIMESTAMPTZ,
  remaining_requests INTEGER,
  last_requested_at TIMESTAMPTZ,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, phone_number_id, contact_phone)
);

CREATE TABLE IF NOT EXISTS voice_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  meta_call_id VARCHAR NOT NULL UNIQUE,
  waba_id VARCHAR NOT NULL,
  phone_number_id VARCHAR NOT NULL,
  contact_phone VARCHAR,
  direction VARCHAR NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status VARCHAR NOT NULL,
  permission_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  transcript TEXT,
  summary TEXT,
  recording_url TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voice_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  provider VARCHAR,
  model VARCHAR,
  voice_id VARCHAR,
  language VARCHAR NOT NULL DEFAULT 'pt-BR',
  system_prompt TEXT,
  tools JSONB NOT NULL DEFAULT '[]'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  from_actor VARCHAR NOT NULL,
  to_actor VARCHAR NOT NULL,
  reason TEXT,
  status VARCHAR NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  external_calendar_provider VARCHAR,
  external_event_id VARCHAR,
  appointment_type VARCHAR NOT NULL DEFAULT 'property_visit',
  status VARCHAR NOT NULL DEFAULT 'scheduled',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  provider VARCHAR NOT NULL,
  external_id VARCHAR,
  operation VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  next_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Production hardening: enable RLS and add policies matching your Auth0 tenant model
-- before exposing database access outside server-only code.
