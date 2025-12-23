import type {
  CreateTicketInput,
  Ticket,
  UpdateTicketInput,
} from "@/core/domain/ticket/ticket.schema";

/**
 * Repository contract for Ticket operations.
 * Hides infrastructure details and exposes domain-shaped operations.
 */
export type TicketRepository = {
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
   * @returns Array of tickets
   * @throws DatabaseError if database operation fails
   */
  listByProject(projectId: string): Promise<Ticket[]>;

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
};
