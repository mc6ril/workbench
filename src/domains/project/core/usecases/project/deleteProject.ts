import { createNotFoundError } from "@/shared/errors/repositoryError";

import type { ProjectRepository } from "@/domains/project/core/ports/projectRepository";

/**
 * Delete a project by its identifier.
 * Ensures the project exists before delegating the delete to the repository.
 */
export const deleteProject = async (
  repository: ProjectRepository,
  projectId: string
): Promise<void> => {
  const project = await repository.findById(projectId);
  if (!project) {
    throw createNotFoundError("Project", projectId);
  }

  await repository.delete(projectId);
};
