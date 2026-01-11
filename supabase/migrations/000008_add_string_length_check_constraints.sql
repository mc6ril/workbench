-- Migration: Add string length CHECK constraints for data validation
-- Adds CHECK constraints to ensure text fields have non-empty values (length > 0 after trim)
-- These constraints enforce domain rules at the database level (defense-in-depth)
-- Ticket: 47 - Database constraints implementation

-- ============================================================================
-- CHECK CONSTRAINTS FOR STRING LENGTH VALIDATION
-- ============================================================================

-- Add CHECK constraint for projects.name
-- Ensures project name is not empty (length > 0 after trimming whitespace)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'ck_projects_name_not_empty'
  ) THEN
    ALTER TABLE projects
    ADD CONSTRAINT ck_projects_name_not_empty
    CHECK (length(trim(name)) > 0);
  END IF;
END $$;

-- Add CHECK constraint for tickets.title
-- Ensures ticket title is not empty (length > 0 after trimming whitespace)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'ck_tickets_title_not_empty'
  ) THEN
    ALTER TABLE tickets
    ADD CONSTRAINT ck_tickets_title_not_empty
    CHECK (length(trim(title)) > 0);
  END IF;
END $$;

-- Add CHECK constraint for tickets.status
-- Ensures ticket status is not empty (length > 0 after trimming whitespace)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'ck_tickets_status_not_empty'
  ) THEN
    ALTER TABLE tickets
    ADD CONSTRAINT ck_tickets_status_not_empty
    CHECK (length(trim(status)) > 0);
  END IF;
END $$;

-- Add CHECK constraint for epics.name
-- Ensures epic name is not empty (length > 0 after trimming whitespace)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'ck_epics_name_not_empty'
  ) THEN
    ALTER TABLE epics
    ADD CONSTRAINT ck_epics_name_not_empty
    CHECK (length(trim(name)) > 0);
  END IF;
END $$;

-- Add CHECK constraint for columns.name
-- Ensures column name is not empty (length > 0 after trimming whitespace)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'ck_columns_name_not_empty'
  ) THEN
    ALTER TABLE columns
    ADD CONSTRAINT ck_columns_name_not_empty
    CHECK (length(trim(name)) > 0);
  END IF;
END $$;

-- Add CHECK constraint for columns.status
-- Ensures column status is not empty (length > 0 after trimming whitespace)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'ck_columns_status_not_empty'
  ) THEN
    ALTER TABLE columns
    ADD CONSTRAINT ck_columns_status_not_empty
    CHECK (length(trim(status)) > 0);
  END IF;
END $$;
