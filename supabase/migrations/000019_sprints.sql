-- Migration: Create sprints table and add sprint_id to tickets
-- Implements Jira-like sprint/backlog categorization:
-- - Tickets with sprint_id = NULL are in the "Backlog" section
-- - Tickets with a sprint_id belong to that sprint
-- - Only one sprint can be active per project at a time

CREATE TABLE sprints (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(trim(name)) > 0),
  goal text,
  start_date timestamptz,
  end_date timestamptz,
  status text NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'active', 'completed')),
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Only one active sprint per project
CREATE UNIQUE INDEX idx_sprints_one_active_per_project
  ON sprints(project_id) WHERE status = 'active';

-- Ordering sprints within a project
CREATE INDEX idx_sprints_project_position ON sprints(project_id, position);

-- Auto-update updated_at
CREATE TRIGGER update_sprints_updated_at
  BEFORE UPDATE ON sprints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add sprint_id to tickets (NULL = backlog, non-null = in sprint)
ALTER TABLE tickets
  ADD COLUMN sprint_id uuid DEFAULT NULL
    REFERENCES sprints(id) ON DELETE SET NULL;

CREATE INDEX idx_tickets_sprint ON tickets(sprint_id)
  WHERE sprint_id IS NOT NULL;

-- RLS for sprints
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sprints for their projects"
  ON sprints FOR SELECT
  USING (is_project_member(project_id));

CREATE POLICY "Users can create sprints if they have edit permission"
  ON sprints FOR INSERT
  WITH CHECK (can_edit_project(project_id));

CREATE POLICY "Users can update sprints if they have edit permission"
  ON sprints FOR UPDATE
  USING (can_edit_project(project_id));

CREATE POLICY "Users can delete sprints if they have edit permission"
  ON sprints FOR DELETE
  USING (can_edit_project(project_id));
