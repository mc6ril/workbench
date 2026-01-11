/**
 * Supabase row types representing database table structures.
 * These types match the snake_case column names from Supabase tables.
 */

export type BoardRow = {
  id: string;
  project_id: string;
  created_at: string;
  updated_at: string;
};

export type ColumnRow = {
  id: string;
  board_id: string;
  name: string;
  status: string;
  position: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
};

export type EpicRow = {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectMemberRow = {
  id: string;
  project_id: string;
  user_id: string;
  role: "admin" | "member" | "viewer";
  created_at: string;
  updated_at: string;
};

export type ProjectRow = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

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
