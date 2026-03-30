import { createNotFoundError } from "@/shared/errors/repositoryError";

import type { ProjectGateway } from "@/domains/project/core/ports/project.gateway";

/**
 * Delete a project by its identifier.
 * Ensures the project exists before delegating the delete to the repository.
 */
export const deleteProject = async (
  gateway: ProjectGateway,
  projectId: string
): Promise<void> => {
  const project = await gateway.findById(projectId);
  if (!project) {
    throw createNotFoundError("Project", projectId);
  }

  await gateway.delete(projectId);
};
