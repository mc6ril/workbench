import type {
  CreateProjectInput,
  Project,
  ProjectRole,
  ProjectWithRole,
} from "@/core/domain/project/project.schema";

/**
 * Repository contract for Project operations.
 * Hides infrastructure details and exposes domain-shaped operations.
 */
export type ProjectRepository = {
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

  /**
   * Add current user to a project as a member.
   * @param projectId - Project ID
   * @param role - Role to assign (default: 'viewer'). Note: Users can only self-add as 'viewer'. Admins can add with any role.
   * @returns The project the user was added to
   * @throws NotFoundError if project not found
   * @throws ConstraintError if user is already a member
   * @throws DatabaseError if database operation fails or permission denied
   */
  addCurrentUserAsMember(
    projectId: string,
    role?: ProjectRole
  ): Promise<Project>;
};
