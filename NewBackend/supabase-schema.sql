-- Supabase / PostgreSQL schema for the Hisaab backend
-- Run this in the Supabase SQL editor.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  preferred_language VARCHAR(5) NOT NULL DEFAULT 'en',
  preferred_account_mode VARCHAR(20) NOT NULL DEFAULT 'personal'
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type VARCHAR(20) NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  date DATE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  debt_credit_id UUID,
  account_mode VARCHAR(20) NOT NULL DEFAULT 'personal',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_mode_date
  ON transactions (user_id, account_mode, date DESC, created_at DESC);

CREATE TABLE IF NOT EXISTS debt_credit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone VARCHAR(50),
  type VARCHAR(20) NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  rate NUMERIC(14, 2) NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 0,
  estimated_interest NUMERIC(14, 2),
  date DATE NOT NULL,
  notes TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  account_mode VARCHAR(20) NOT NULL DEFAULT 'personal',
  closed_at DATE,
  settled_interest NUMERIC(14, 2),
  settlement_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_debt_credit_user_mode_date
  ON debt_credit (user_id, account_mode, COALESCE(closed_at, date), created_at DESC);

DO $$
BEGIN
  ALTER TABLE transactions
    ADD CONSTRAINT fk_transactions_debt_credit
    FOREIGN KEY (debt_credit_id) REFERENCES debt_credit(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  action VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount NUMERIC(14, 2),
  reference_no VARCHAR(100),
  before_data JSONB,
  after_data JSONB,
  notes TEXT,
  prev_hash TEXT,
  row_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  account_mode VARCHAR(20) NOT NULL DEFAULT 'personal'
);

CREATE TABLE IF NOT EXISTS journal_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  reference_no VARCHAR(100),
  description TEXT,
  source_type VARCHAR(50) NOT NULL,
  source_id UUID,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  account_mode VARCHAR(20) NOT NULL DEFAULT 'personal'
);

CREATE TABLE IF NOT EXISTS journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID NOT NULL REFERENCES journal_vouchers(id) ON DELETE CASCADE,
  account_name VARCHAR(100) NOT NULL,
  account_type VARCHAR(50) NOT NULL,
  debit NUMERIC(14, 2) NOT NULL DEFAULT 0,
  credit NUMERIC(14, 2) NOT NULL DEFAULT 0,
  notes TEXT
);
