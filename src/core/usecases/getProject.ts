import type { Project } from "@/core/domain/project/project.schema";

import type { ProjectRepository } from "@/core/ports/projectRepository";

/**
 * Get a project by ID.
 *
 * @param repository - Project repository
 * @param id - Project ID
 * @returns Project or null if not found
 * @throws DatabaseError if database operation fails
 */
export async function getProject(
  repository: ProjectRepository,
  id: string
): Promise<Project | null> {
  return repository.findById(id);
}
