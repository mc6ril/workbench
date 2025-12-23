/**
 * Supabase row type for tickets table.
 * Represents the data as stored in Supabase (snake_case).
 */
export type TicketRow = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: string;
  position: number;
  epic_id: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
};
