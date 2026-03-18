import type {
  CreateSprintInput,
  Sprint,
  UpdateSprintInput,
} from "@/domains/project-management/core/domain/schema/sprint.schema";

/**
 * Repository contract for Sprint operations.
 *
 * Sprints organize tickets into iterations. A project may have
 * zero or more sprints. Only one sprint can be active per project
 * at any time (enforced at DB level).
 */
export type SprintRepository = {
  /**
   * Get a sprint by ID.
   * @returns Sprint or null if not found
   */
  findById(id: string): Promise<Sprint | null>;

  /**
   * List all sprints for a project, ordered by position.
   */
  listByProject(projectId: string): Promise<Sprint[]>;

  /**
   * Create a new sprint in planned status.
   * Position is auto-assigned as the next available.
   */
  create(input: CreateSprintInput): Promise<Sprint>;

  /**
   * Update an existing sprint.
   * @throws NotFoundError if sprint not found
   * @throws ConstraintError if activating a sprint when another is already active
   */
  update(id: string, input: UpdateSprintInput): Promise<Sprint>;

  /**
   * Delete a sprint. Tickets in this sprint will have sprint_id set to NULL.
   * @throws NotFoundError if sprint not found
   */
  delete(id: string): Promise<void>;

  /**
   * Get ticket count and completed count for a sprint.
   * Used for displaying sprint progress in project workflow views.
   */
  getSprintStats(
    sprintId: string
  ): Promise<{ ticketCount: number; completedCount: number }>;
};
