CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  category VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'disconnected',
  last_four VARCHAR(4),
  wallet_address VARCHAR(255),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name)
);

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS source_wallet_id UUID REFERENCES wallets(id),
  ADD COLUMN IF NOT EXISTS destination_currency VARCHAR(10),
  ADD COLUMN IF NOT EXISTS net_amount NUMERIC(20, 8),
  ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(128);

CREATE TABLE IF NOT EXISTS transaction_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods (user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_category_status ON payment_methods (category, status);
CREATE INDEX IF NOT EXISTS idx_transactions_sender_created_at ON transactions (sender_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_idempotency ON transactions (sender_user_id, idempotency_key);
CREATE INDEX IF NOT EXISTS idx_transaction_events_transaction_id ON transaction_events (transaction_id);
