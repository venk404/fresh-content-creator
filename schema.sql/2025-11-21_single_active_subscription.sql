-- Enforce at most one active subscription per customer_email
-- Safe to run multiple times

BEGIN;

-- 1) Optional data cleanup (idempotent):
--    For each customer_email, keep the most recent 'active' subscription
--    by start_date, cancel any additional 'active' rows.
WITH actives AS (
  SELECT
    subscription_id,
    customer_email,
    start_date,
    ROW_NUMBER() OVER (
      PARTITION BY customer_email
      ORDER BY start_date DESC NULLS LAST
    ) AS rn
  FROM subscriptions
  WHERE status = 'active'
)
UPDATE subscriptions s
SET
  status = 'cancelled',
  cancelled_at = COALESCE(cancelled_at, NOW())
FROM actives a
WHERE s.subscription_id = a.subscription_id
  AND a.rn > 1
  AND s.status = 'active';

-- 2) Create a partial unique index so only one 'active' row exists per customer_email
--    Note: If using a migration runner that wraps each statement in its own transaction,
--    this will still be idempotent due to IF NOT EXISTS.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_subscription_per_email
  ON subscriptions (customer_email)
  WHERE status = 'active';

COMMIT;