import type { Ticket } from "@/core/domain/ticket/ticket.schema";
import { TicketSchema } from "@/core/domain/ticket/ticket.schema";

import type { TicketRow } from "@/infrastructure/supabase/types/ticketRow";

/**
 * Maps a Supabase row to a domain Ticket entity.
 * Converts snake_case database fields to camelCase domain fields.
 *
 * @param row - Supabase row data
 * @returns Domain Ticket entity
 * @throws Error if row data is invalid
 */
export const mapTicketRowToDomain = (row: TicketRow): Ticket => {
  return TicketSchema.parse({
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description,
    status: row.status,
    position: row.position,
    epicId: row.epic_id,
    parentId: row.parent_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
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
