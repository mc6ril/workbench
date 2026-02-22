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
  codeNumber: z.number().int().positive(),
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
  codeNumber: z.number().int().positive().optional(),
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
 * Input for creating a subtask (parentId is required).
 */
export const CreateSubtaskInputSchema = CreateTicketInputSchema.extend({
  parentId: z.string().uuid(), // Required, not optional
});

export type CreateSubtaskInput = z.infer<typeof CreateSubtaskInputSchema>;

/**
 * Input for reordering tickets.
 * Used for bulk position updates within a column or board.
 */
export const ReorderTicketInputSchema = z.object({
  ticketPositions: z
    .array(
      z.object({
        id: z.string().uuid(),
        position: z.number().int().nonnegative(),
      })
    )
    .min(1, "At least one ticket position is required"),
});

export type ReorderTicketInput = z.infer<typeof ReorderTicketInputSchema>;

/**
 * Filters for querying tickets.
 * Used for filtering support in ticket queries.
 */
export type TicketFilters = {
  status?: string;
  epicId?: string;
  parentId?: string | null;
  assigneeIds?: string[];
};

/**
 * Sorting options for ticket queries.
 * Sorting is applied at the repository level (database ordering), not in hooks.
 */
export const TicketSortFieldSchema = z.enum(["createdAt", "position", "title"]);
export type TicketSortField = z.infer<typeof TicketSortFieldSchema>;

export const SortDirectionSchema = z.enum(["asc", "desc"]);
export type SortDirection = z.infer<typeof SortDirectionSchema>;

export const TicketSortSchema = z.object({
  field: TicketSortFieldSchema,
  direction: SortDirectionSchema,
});

export type TicketSort = z.infer<typeof TicketSortSchema>;

/**
 * Input for getting a ticket by project short code and code number.
 * Used in getTicketByCode usecase.
 */
export const GetTicketByCodeInputSchema = z.object({
  projectShortCode: z.string().min(1, "Project short code must not be empty"),
  codeNumber: z
    .number()
    .int()
    .positive("Code number must be a positive integer"),
});

export type GetTicketByCodeInput = z.infer<typeof GetTicketByCodeInputSchema>;

/**
 * Input schema for single ticket ID validation.
 * Used in getTicketDetail, deleteTicket, and similar usecases.
 */
export const TicketIdInputSchema = z.object({
  id: z.string().uuid("Ticket ID must be a valid UUID"),
});

export type TicketIdInput = z.infer<typeof TicketIdInputSchema>;

/**
 * Input for assigning a ticket to an epic.
 * Validates both ticketId and epicId as UUIDs.
 */
export const AssignTicketToEpicInputSchema = z.object({
  ticketId: z.string().uuid("Ticket ID must be a valid UUID"),
  epicId: z.string().uuid("Epic ID must be a valid UUID"),
});

export type AssignTicketToEpicInput = z.infer<
  typeof AssignTicketToEpicInputSchema
>;

/**
 * Input for unassigning a ticket from its epic.
 * Validates ticketId as UUID.
 */
export const UnassignTicketFromEpicInputSchema = z.object({
  ticketId: z.string().uuid("Ticket ID must be a valid UUID"),
});

export type UnassignTicketFromEpicInput = z.infer<
  typeof UnassignTicketFromEpicInputSchema
>;

/**
 * Input for moving a ticket to a new status and position.
 * Used for drag-and-drop operations on the board.
 */
export const MoveTicketInputSchema = z.object({
  id: z.string().uuid("Ticket ID must be a valid UUID"),
  status: z.string().min(1, "Status must not be empty"),
  position: z.number().int().nonnegative("Position must be non-negative"),
});

/** A user assigned to a ticket, with their profile summary. */
export type TicketAssignee = {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  assignedAt: Date;
};

/** A ticket enriched with its assignees list. */
export type TicketWithAssignees = Ticket & {
  assignees: TicketAssignee[];
};

/**
 * Input for assigning users to a ticket.
 * Supports multi-assignment (multiple user IDs).
 */
export const AssignUsersToTicketInputSchema = z.object({
  ticketId: z.string().uuid("Ticket ID must be a valid UUID"),
  userIds: z
    .array(z.string().uuid("User ID must be a valid UUID"))
    .min(1, "At least one user ID is required"),
});

export type AssignUsersToTicketInput = z.infer<
  typeof AssignUsersToTicketInputSchema
>;

/**
 * Input for unassigning users from a ticket.
 */
export const UnassignUsersFromTicketInputSchema = z.object({
  ticketId: z.string().uuid("Ticket ID must be a valid UUID"),
  userIds: z
    .array(z.string().uuid("User ID must be a valid UUID"))
    .min(1, "At least one user ID is required"),
});

export type UnassignUsersFromTicketInput = z.infer<
  typeof UnassignUsersFromTicketInputSchema
>;
