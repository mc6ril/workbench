/**
 * Row type for the sprints table.
 * Represents a sprint/iteration within a project.
 */
export type SprintRow = {
  id: string;
  project_id: string;
  name: string;
  goal: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  position: number;
  created_at: string;
  updated_at: string;
};
