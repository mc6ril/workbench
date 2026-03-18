import type {
  CreateEpicRepositoryInput,
  Epic,
  UpdateEpicInput,
} from "@/domains/project-management/core/domain/schema/epic.schema";
import type { Ticket } from "@/domains/project-management/core/domain/schema/ticket.schema";

/**
 * Repository contract for Epic operations.
 * Hides infrastructure details and exposes domain-shaped operations.
 */
export type EpicRepository = {
  /**
   * Get the next available code number for a project.
   * Used when creating a new epic to allocate a human-readable code.
   * @param projectId - Project ID
   * @returns Next positive integer code number for the project
   * @throws DatabaseError if database operation fails
   */
  getNextCodeNumberForProject(projectId: string): Promise<number>;

  /**
   * Get an epic by its human-readable code number within a project.
   * @param projectId - Project ID
   * @param codeNumber - Epic code number (positive integer, WB-E-<codeNumber>)
   * @returns Epic or null if not found
   * @throws DatabaseError if database operation fails
   */
  findByCode(projectId: string, codeNumber: number): Promise<Epic | null>;

  /**
   * Get an epic by ID.
   * @param id - Epic ID
   * @returns Epic or null if not found
   * @throws DatabaseError if database operation fails
   */
  findById(id: string): Promise<Epic | null>;

  /**
   * Get all epics for a project.
   * @param projectId - Project ID
   * @returns Array of epics
   * @throws DatabaseError if database operation fails
   */
  listByProject(projectId: string): Promise<Epic[]>;

  /**
   * Create a new epic.
   * Expects codeNumber to be already allocated by the usecase.
   * @param input - Epic creation data with required codeNumber
   * @returns Created epic
   * @throws ConstraintError if constraint violation occurs
   * @throws DatabaseError if database operation fails
   */
  create(input: CreateEpicRepositoryInput): Promise<Epic>;

  /**
   * Update an existing epic.
   * @param id - Epic ID
   * @param input - Epic update data
   * @returns Updated epic
   * @throws NotFoundError if epic not found
   * @throws ConstraintError if constraint violation occurs
   * @throws DatabaseError if database operation fails
   */
  update(id: string, input: UpdateEpicInput): Promise<Epic>;

  /**
   * Delete an epic by ID.
   * Tickets assigned to this epic will have their epicId set to null (cascade behavior).
   * @param id - Epic ID
   * @throws NotFoundError if epic not found
   * @throws DatabaseError if database operation fails
   */
  delete(id: string): Promise<void>;

  /**
   * List all tickets assigned to an epic.
   * @param epicId - Epic ID
   * @returns Array of tickets assigned to the epic
   * @throws DatabaseError if database operation fails
   */
  listTicketsByEpic(epicId: string): Promise<Ticket[]>;
};
