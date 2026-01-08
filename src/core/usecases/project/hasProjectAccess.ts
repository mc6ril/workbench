import type { ProjectRepository } from "@/core/ports/projectRepository";

/**
 * Check if the current user has access to any project.
 * Uses optimized SQL function for lightweight boolean check without loading project data.
 *
 * @param repository - Project repository
 * @returns True if user has access to at least one project, false otherwise
 * @throws DatabaseError if database operation fails
 */
export const hasProjectAccess = async (
  repository: ProjectRepository
): Promise<boolean> => {
  return repository.hasProjectAccess();
};
