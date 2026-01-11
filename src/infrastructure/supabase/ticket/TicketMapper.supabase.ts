import type { Ticket } from "@/core/domain/schema/ticket.schema";

import type { TicketRow } from "@/infrastructure/supabase/types";

import { toDate } from "@/shared/utils/guards";

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
    epicId: row.epic_id,
    parentId: row.parent_id,
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
