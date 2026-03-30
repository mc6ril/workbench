import type {
  CreateTicketInput,
  Ticket,
  TicketAssignee,
  TicketFilters,
  UpdateTicketInput,
} from "@/modules/board/core/domain/ticket.types";

/**
 * Repository contract for Ticket operations.
 * Hides infrastructure details and exposes domain-shaped operations.
 */
export type TicketRepository = {
  /**
   * Get the next available code number for a project.
   * Used when creating a new ticket to allocate a human-readable code.
   * @param projectId - Project ID
   * @returns Next positive integer code number for the project
   * @throws DatabaseError if database operation fails
   */
  getNextCodeNumberForProject(projectId: string): Promise<number>;

  /**
   * Get a ticket by its human-readable code number within a project.
   * @param projectId - Project ID
   * @param codeNumber - Ticket code number (positive integer, WB-<codeNumber>)
   * @returns Ticket or null if not found
   * @throws DatabaseError if database operation fails
   */
  findByCode(projectId: string, codeNumber: number): Promise<Ticket | null>;

  /**
   * Get a ticket by ID.
   * @param id - Ticket ID
   * @returns Ticket or null if not found
   * @throws DatabaseError if database operation fails
   */
  findById(id: string): Promise<Ticket | null>;

  /**
   * Get all tickets for a project.
   * @param projectId - Project ID
   * @param filters - Optional filters for ticket filtering
   * @param search - Optional search term (title, description, code number)
   * @param limit - Optional max number of rows
   * @returns Array of tickets
   * @throws DatabaseError if database operation fails
   */
  listByProject(
    projectId: string,
    filters?: TicketFilters,
    search?: string,
    limit?: number
  ): Promise<Ticket[]>;

  /**
   * Get tickets by column.
   * @param projectId - Project ID
   * @param columnId - Target column ID
   * @returns Array of tickets ordered by position
   * @throws DatabaseError if database operation fails
   */
  listByColumnId(projectId: string, columnId: string): Promise<Ticket[]>;

  /**
   * Create a new ticket.
   * @param input - Ticket creation data
   * @returns Created ticket
   * @throws ConstraintError if constraint violation occurs
   * @throws DatabaseError if database operation fails
   */
  create(input: CreateTicketInput): Promise<Ticket>;

  /**
   * Update an existing ticket.
   * @param id - Ticket ID
   * @param input - Ticket update data
   * @returns Updated ticket
   * @throws NotFoundError if ticket not found
   * @throws ConstraintError if constraint violation occurs
   * @throws DatabaseError if database operation fails
   */
  update(id: string, input: UpdateTicketInput): Promise<Ticket>;

  /**
   * Delete a ticket by ID.
   * @param id - Ticket ID
   * @throws NotFoundError if ticket not found
   * @throws DatabaseError if database operation fails
   */
  delete(id: string): Promise<void>;

  /**
   * Bulk update ticket positions.
   * Used for drag-and-drop reordering of tickets within a column or board.
   * @param ticketPositions - Array of ticket ID and position pairs
   * @returns Array of updated tickets
   * @throws NotFoundError if any ticket not found
   * @throws ConstraintError if constraint violation occurs
   * @throws DatabaseError if database operation fails
   */
  updatePositions(
    ticketPositions: Array<{ id: string; position: number }>
  ): Promise<Ticket[]>;

  /**
   * Move a ticket to a new column and position.
   * Updates both column assignment and position in a single atomic operation.
   * Used for drag-and-drop operations on the board.
   * @param id - Ticket ID
   * @param columnId - New column ID
   * @param position - New position within the column
   * @returns Updated ticket
   * @throws NotFoundError if ticket not found
   * @throws ConstraintError if constraint violation occurs
   * @throws DatabaseError if database operation fails
   */
  moveTicket(
    id: string,
    columnId: string,
    position: number,
    completedAt: Date | null
  ): Promise<Ticket>;

  /**
   * Atomically move a ticket to a new column/position and reorder affected tickets.
   * Designed for cross-column drag-and-drop to avoid partial updates.
   * @param input - Move target + affected ticket positions
   * @returns Array of updated tickets
   * @throws NotFoundError if moved ticket not found
   * @throws ConstraintError if constraint violation occurs
   * @throws DatabaseError if database operation fails
   */
  moveAndReorderTicket(input: {
    ticketId: string;
    columnId: string;
    position: number;
    completedAt: Date | null;
    ticketPositions: Array<{ id: string; position: number }>;
  }): Promise<Ticket[]>;

  /**
   * Archive completed tickets in batch using the current weekly boundary.
   * Implementations must archive only tickets that are still in a done workflow
   * state, are not already archived, and were completed before the start of the
   * current local week in the provided timezone.
   *
   * @param input.runAt - Reference time used to resolve the current week boundary
   * @param input.timeZone - IANA timezone used to evaluate the week rule
   * @returns Number of tickets archived in this batch
   * @throws DatabaseError if database operation fails
   */
  archiveCompletedTicketsBatch(input: {
    runAt: Date;
    timeZone: string;
  }): Promise<number>;

  /**
   * Assign multiple users to a ticket.
   * Existing assignments are preserved; duplicates are silently ignored.
   * @param ticketId - Ticket to assign users to
   * @param userIds - User IDs to assign
   * @throws DatabaseError if database operation fails or permission denied
   */
  assignUsers(ticketId: string, userIds: string[]): Promise<void>;

  /**
   * Unassign multiple users from a ticket.
   * Non-existing assignments are silently ignored.
   * @param ticketId - Ticket to unassign users from
   * @param userIds - User IDs to unassign
   * @throws DatabaseError if database operation fails or permission denied
   */
  unassignUsers(ticketId: string, userIds: string[]): Promise<void>;

  /**
   * Get all assignees for a ticket with their profile summary.
   * @param ticketId - Ticket to get assignees for
   * @returns Array of assignees ordered by assignment date
   * @throws DatabaseError if database operation fails
   */
  getAssignees(ticketId: string): Promise<TicketAssignee[]>;

  /**
   * Batch-load assignees for multiple tickets.
   * Used for efficient board rendering (avoids N+1).
   * @param ticketIds - Array of ticket IDs
   * @returns Map of ticketId -> assignees array
   * @throws DatabaseError if database operation fails
   */
  getAssigneesByTicketIds(
    ticketIds: string[]
  ): Promise<Record<string, TicketAssignee[]>>;

  /**
   * Load assignees for all tickets in a project.
   * Useful when views already load project-scoped tickets and want to avoid request waterfalls.
   * @param projectId - Project ID
   * @returns Map of ticketId -> assignees array
   * @throws DatabaseError if database operation fails
   */
  getAssigneesByProjectId(
    projectId: string
  ): Promise<Record<string, TicketAssignee[]>>;
};
