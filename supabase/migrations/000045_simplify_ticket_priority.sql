-- Migration: Simplify ticket priorities from five levels to three.
-- Remap legacy string values before tightening the check constraint.

UPDATE tickets
SET priority = CASE
  WHEN priority IN ('highest', 'high') THEN 'urgent'
  WHEN priority = 'medium' THEN 'normal'
  WHEN priority IN ('low', 'lowest') THEN 'low'
  ELSE priority
END
WHERE priority IS NOT NULL;

ALTER TABLE tickets
  DROP CONSTRAINT IF EXISTS tickets_priority_check;

ALTER TABLE tickets
  ADD CONSTRAINT tickets_priority_check
  CHECK (priority IS NULL OR priority IN ('urgent', 'normal', 'low'));
