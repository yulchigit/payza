-- Remove duplicate idempotency keys if any exist from previous runs.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY sender_user_id, idempotency_key
      ORDER BY created_at ASC, id ASC
    ) AS row_num
  FROM transactions
  WHERE idempotency_key IS NOT NULL
)
DELETE FROM transactions t
USING ranked r
WHERE t.id = r.id
  AND r.row_num > 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'uq_transactions_sender_idempotency'
  ) THEN
    ALTER TABLE transactions
      ADD CONSTRAINT uq_transactions_sender_idempotency
      UNIQUE (sender_user_id, idempotency_key);
  END IF;
END $$;
