import { createDatabaseError } from "@/shared/errors/repositoryError";
import { toDate } from "@/shared/utils/guards";

import type {
  Ticket,
  TicketPriority,
  TicketSearchItem,
} from "@/modules/board/core/domain/ticket.types";
import { isTicketPriority } from "@/modules/board/core/domain/ticket.types";
import type {
  TicketRow,
  TicketSearchRow,
} from "@/modules/board/infrastructure/supabase/ticket/types";

const mapTicketPriority = (value: string | null): TicketPriority | null => {
  if (value === null) {
    return null;
  }

  if (isTicketPriority(value)) {
    return value;
  }

  throw createDatabaseError(`Invalid ticket priority: ${value}`);
};

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
    columnId: row.column_id,
    position: row.position,
    codeNumber: row.code_number,
    priority: mapTicketPriority(row.priority),
    dueDate: row.due_date,
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

export const mapTicketSearchRowToDomain = (
  row: TicketSearchRow
): TicketSearchItem => {
  return {
    id: row.id,
    title: row.title,
    codeNumber: row.code_number,
  };
};

export const mapTicketSearchRowsToDomain = (
  rows: TicketSearchRow[]
): TicketSearchItem[] => {
  return rows.map(mapTicketSearchRowToDomain);
};
