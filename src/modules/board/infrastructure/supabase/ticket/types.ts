import type { TicketPriority } from "@/modules/board/core/domain/ticket.types";

export type TicketRow = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  column_id: string;
  position: number;
  code_number: number;
  priority: TicketPriority | null;
  due_date: string | null;
  story_points: number | null;
  created_by: string | null;
  completed_at: string | null;
  archived_at: string | null;
  archived_week_start: string | null;
  created_at: string;
  updated_at: string;
};

export type TicketAssigneeRow = {
  ticket_id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  assigned_at: string;
};

export type TicketSearchRow = Pick<TicketRow, "id" | "title" | "code_number">;
