/**
 * Supabase row type for projects table.
 * Represents the data as stored in Supabase (snake_case).
 */
export type ProjectRow = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};
