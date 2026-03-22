import type {
  CreateProjectInput,
  Project,
  ProjectWithRole,
} from "@/domains/project/core/domain/schema/project.schema";

/**
 * Repository contract for project-owned Project operations.
 * Hides infrastructure details and exposes domain-shaped operations.
 */
export type ProjectRepository = {
  /**
   * Get a project by its short code.
   * @param shortCode - 2-letter project short code (e.g. 'WB')
   * @returns Project or null if not found
   * @throws DatabaseError if database operation fails
   */
  findByShortCode(shortCode: string): Promise<Project | null>;

  /**
   * Get a project by ID.
   * @param id - Project ID
   * @returns Project or null if not found
   * @throws DatabaseError if database operation fails
   */
  findById(id: string): Promise<Project | null>;

  /**
   * Get all projects accessible to the current user with their roles.
   * @returns Array of projects with role information for the current user
   * @throws DatabaseError if database operation fails
   */
  list(): Promise<ProjectWithRole[]>;

  /**
   * Create a new project.
   * @param input - Project creation data
   * @returns Created project
   * @throws ConstraintError if constraint violation occurs
   * @throws DatabaseError if database operation fails
   */
  create(input: CreateProjectInput): Promise<Project>;

  /**
   * Update an existing project.
   * @param id - Project ID
   * @param input - Project update data
   * @returns Updated project
   * @throws NotFoundError if project not found
   * @throws ConstraintError if constraint violation occurs
   * @throws DatabaseError if database operation fails
   */
  update(id: string, input: Partial<CreateProjectInput>): Promise<Project>;

  /**
   * Delete a project by ID.
   * @param id - Project ID
   * @throws NotFoundError if project not found
   * @throws DatabaseError if database operation fails
   */
  delete(id: string): Promise<void>;
};
