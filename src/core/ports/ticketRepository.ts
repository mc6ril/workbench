import type {
  CreateTicketInput,
  Ticket,
  TicketAssignee,
  TicketFilters,
  TicketSort,
  UpdateTicketInput,
} from "@/core/domain/schema/ticket.schema";

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
   * @param sort - Optional sorting applied at the database level
   * @returns Array of tickets
   * @throws DatabaseError if database operation fails
   */
  listByProject(
    projectId: string,
    filters?: TicketFilters,
    sort?: TicketSort
  ): Promise<Ticket[]>;

  /**
   * Get tickets by status.
   * @param projectId - Project ID
   * @param status - Ticket status
   * @returns Array of tickets ordered by position
   * @throws DatabaseError if database operation fails
   */
  listByStatus(projectId: string, status: string): Promise<Ticket[]>;

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
   * Move a ticket to a new status/column and position.
   * Updates both status and position in a single atomic operation.
   * Used for drag-and-drop operations on the board.
   * @param id - Ticket ID
   * @param status - New status/column
   * @param position - New position within the column
   * @returns Updated ticket
   * @throws NotFoundError if ticket not found
   * @throws ConstraintError if constraint violation occurs
   * @throws DatabaseError if database operation fails
   */
  moveTicket(id: string, status: string, position: number): Promise<Ticket>;

  /**
   * Assign a ticket to an epic.
   * Updates the ticket's epicId field to reference the epic.
   * @param ticketId - Ticket ID to assign
   * @param epicId - Epic ID to assign ticket to
   * @returns Updated ticket with epicId set
   * @throws NotFoundError if ticket not found
   * @throws ConstraintError if constraint violation occurs
   * @throws DatabaseError if database operation fails
   */
  assignToEpic(ticketId: string, epicId: string): Promise<Ticket>;

  /**
   * Unassign a ticket from its epic.
   * Sets the ticket's epicId field to null.
   * @param ticketId - Ticket ID to unassign
   * @returns Updated ticket with epicId set to null
   * @throws NotFoundError if ticket not found
   * @throws DatabaseError if database operation fails
   */
  unassignFromEpic(ticketId: string): Promise<Ticket>;

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
   * Used for efficient board/backlog rendering (avoids N+1).
   * @param ticketIds - Array of ticket IDs
   * @returns Map of ticketId -> assignees array
   * @throws DatabaseError if database operation fails
   */
  getAssigneesByTicketIds(
    ticketIds: string[]
  ): Promise<Record<string, TicketAssignee[]>>;
};
