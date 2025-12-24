import type { ProjectWithRole } from "@/core/domain/project/project.schema";

import type { ProjectRepository } from "@/core/ports/projectRepository";

/**
 * List all projects accessible to the current user with their roles.
 * RLS policies automatically filter projects to only those where user is a member.
 *
 * @param repository - Project repository
 * @returns Array of projects with role information accessible to the user
 * @throws DatabaseError if database operation fails
 */
export async function listProjects(
  repository: ProjectRepository
): Promise<ProjectWithRole[]> {
  return repository.list();
}

