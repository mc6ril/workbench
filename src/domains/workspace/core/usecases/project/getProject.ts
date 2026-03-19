import { createNotFoundError } from "@/domains/project-management/core/domain/repositoryError";
import {
  GetProjectInputSchema,
  type Project,
} from "@/domains/workspace/core/domain/schema/project.schema";

import type { ProjectRepository } from "@/domains/workspace/core/ports/projectRepository";

/**
 * Get a project by ID.
 * Validates input and retrieves the project, throwing NotFoundError if not found.
 *
 * @param repository - Project repository
 * @param id - Project ID
 * @returns Project
 * @throws ZodError if input is invalid (non-UUID)
 * @throws NotFoundError if project not found
 * @throws DatabaseError if database operation fails
 */
export const getProject = async (
  repository: ProjectRepository,
  id: string
): Promise<Project> => {
  // Validate input with Zod schema
  GetProjectInputSchema.parse({ id });

  // Fetch project from repository
  const project = await repository.findById(id);

  // Throw NotFoundError if project not found
  if (!project) {
    throw createNotFoundError("Project", id);
  }

  return project;
};
