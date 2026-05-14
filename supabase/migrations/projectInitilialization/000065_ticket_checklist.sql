ALTER TABLE tickets
  ADD COLUMN checklist jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN tickets.checklist IS
  'Ordered list of checklist items: [{id, text, checked, position}]';
