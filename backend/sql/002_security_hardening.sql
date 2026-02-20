ALTER TABLE users
  ADD COLUMN IF NOT EXISTS failed_login_attempts INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ NULL;

CREATE TABLE IF NOT EXISTS auth_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  email VARCHAR(255) NULL,
  event_type VARCHAR(50) NOT NULL,
  is_success BOOLEAN NOT NULL,
  failure_reason VARCHAR(100) NULL,
  ip_address INET NULL,
  user_agent VARCHAR(512) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_user_id ON auth_audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_email ON auth_audit_logs (email);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_event_type_created_at
  ON auth_audit_logs (event_type, created_at DESC);
