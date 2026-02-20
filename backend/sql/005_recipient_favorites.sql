CREATE TABLE IF NOT EXISTS recipient_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_name VARCHAR(100),
  recipient_identifier VARCHAR(255) NOT NULL,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, recipient_identifier)
);

CREATE INDEX IF NOT EXISTS idx_recipient_favorites_user_id_last_used
  ON recipient_favorites (user_id, last_used_at DESC);
