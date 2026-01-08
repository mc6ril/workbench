import { z } from "zod";

/**
 * Zod schema for Ticket entity.
 * Validates data coming from external sources.
 */
export const TicketSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  title: z.string().min(1, "Ticket title must not be empty"),
  description: z.string().nullable(),
  status: z.string().min(1, "Ticket status must not be empty"),
  position: z.number().int().nonnegative("Position must be non-negative"),
  epicId: z.string().uuid().nullable(),
  parentId: z.string().uuid().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

/**
 * Ticket domain entity.
 */
export type Ticket = z.infer<typeof TicketSchema>;

/**
 * Input for creating a new ticket (without id and timestamps).
 */
export const CreateTicketInputSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1, "Ticket title must not be empty"),
  description: z.string().nullable().optional(),
  status: z.string().min(1, "Ticket status must not be empty"),
  position: z.number().int().nonnegative().default(0),
  epicId: z.string().uuid().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
});

export type CreateTicketInput = z.infer<typeof CreateTicketInputSchema>;

/**
 * Input for updating an existing ticket.
 */
export const UpdateTicketInputSchema = z.object({
  title: z.string().min(1, "Ticket title must not be empty").optional(),
  description: z.string().nullable().optional(),
  status: z.string().min(1, "Ticket status must not be empty").optional(),
  position: z.number().int().nonnegative().optional(),
  epicId: z.string().uuid().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
});

export type UpdateTicketInput = z.infer<typeof UpdateTicketInputSchema>;

/**
 * Filters for querying tickets.
 * Used for future filtering support in ticket queries.
 */
export type TicketFilters = {
  status?: string;
  epicId?: string;
  // Future filtering options
};
