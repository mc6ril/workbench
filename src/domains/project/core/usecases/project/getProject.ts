import { z } from "zod";

import { createNotFoundError } from "@/shared/errors/repositoryError";

import type { Project } from "@/domains/project/core/domain/project.types";
import type { ProjectGateway } from "@/domains/project/core/ports/project.gateway";

const GetProjectInputSchema = z.object({
  id: z.string().uuid("Project ID must be a valid UUID"),
});

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
  gateway: ProjectGateway,
  id: string
): Promise<Project> => {
  GetProjectInputSchema.parse({ id });

  const project = await gateway.findById(id);

  if (!project) {
    throw createNotFoundError("Project", id);
  }

  return project;
};
