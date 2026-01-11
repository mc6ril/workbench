-- Migration: Add visible field to columns table
-- Adds visible boolean field to columns table to match domain schema
-- Column domain schema includes visible field (default: true), database table must match
-- Ticket: 46 - Database tables implementation

-- ============================================================================
-- ADD VISIBLE FIELD TO COLUMNS TABLE
-- ============================================================================

-- Add visible field to columns table
-- Default value is true to match domain schema default
-- Field is NOT NULL to ensure consistency
DO $$
BEGIN
  -- Check if column already exists (idempotency)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'columns' AND column_name = 'visible'
  ) THEN
    ALTER TABLE columns
    ADD COLUMN visible boolean NOT NULL DEFAULT true;
    
    -- Add comment to document the field
    COMMENT ON COLUMN columns.visible IS 'Whether the column is visible in the board. Defaults to true.';
  END IF;
END $$;
