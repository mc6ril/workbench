import { toDate } from "@/shared/utils/guards";

import type { Ticket } from "@/modules/board/core/domain/schema/ticket.schema";
import type { TicketRow } from "@/modules/board/infrastructure/supabase/ticket/types";

/**
 * Maps a Supabase row to a domain Ticket entity.
 * Translates snake_case database fields to camelCase domain fields.
 *
 * Pure transformation function: only translates structure and converts types (no validation, no error handling).
 *
 * @param row - Supabase row data
 * @returns Domain Ticket entity
 */
export const mapTicketRowToDomain = (row: TicketRow): Ticket => {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description,
    status: row.status,
    position: row.position,
    codeNumber: row.code_number,
    epicId: row.epic_id,
    parentId: row.parent_id,
    sprintId: row.sprint_id,
    priority: row.priority as Ticket["priority"],
    dueDate: row.due_date ? toDate(row.due_date) : null,
    storyPoints: row.story_points,
    createdBy: row.created_by,
    completedAt: row.completed_at ? toDate(row.completed_at) : null,
    archivedAt: row.archived_at ? toDate(row.archived_at) : null,
    archivedWeekStart: row.archived_week_start
      ? toDate(row.archived_week_start)
      : null,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
};

/**
 * Maps multiple Supabase rows to domain Ticket entities.
 *
 * @param rows - Array of Supabase row data
 * @returns Array of domain Ticket entities
 */
export const mapTicketRowsToDomain = (rows: TicketRow[]): Ticket[] => {
  return rows.map(mapTicketRowToDomain);
};
