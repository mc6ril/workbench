import type { Project } from "@/core/domain/project/project.schema";

import type { ProjectRepository } from "@/core/ports/projectRepository";

/**
 * List all projects accessible to the current user.
 * RLS policies automatically filter projects to only those where user is a member.
 *
 * @param repository - Project repository
 * @returns Array of projects accessible to the user
 * @throws DatabaseError if database operation fails
 */
export async function listProjects(
  repository: ProjectRepository
): Promise<Project[]> {
  return repository.list();
}

