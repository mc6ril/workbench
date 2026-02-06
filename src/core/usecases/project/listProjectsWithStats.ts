import type { ProjectWithStats } from "@/core/domain/schema/project.schema";

import type { ProjectRepository } from "@/core/ports/projectRepository";

/**
 * List all projects accessible to the current user with their roles and statistics.
 * Uses optimized SQL function for aggregated counts (member count, ticket counts).
 *
 * @param repository - Project repository
 * @returns Array of projects with role and statistics
 * @throws DatabaseError if database operation fails
 */
export const listProjectsWithStats = async (
  repository: ProjectRepository
): Promise<ProjectWithStats[]> => {
  return repository.listWithStats();
};
