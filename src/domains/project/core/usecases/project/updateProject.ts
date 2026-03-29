import type { Project } from "@/domains/project/core/domain/schema/project.schema";
import {
  GetProjectInputSchema,
  type UpdateProjectInput,
  UpdateProjectInputSchema,
} from "@/domains/project/core/domain/schema/project.schema";
import type { ProjectRepository } from "@/domains/project/core/ports/projectRepository";

/**
 * Update an existing project with validated, normalized input.
 */
export const updateProject = async (
  repository: ProjectRepository,
  projectId: string,
  input: UpdateProjectInput
): Promise<Project> => {
  GetProjectInputSchema.parse({ id: projectId });
  const normalizedInput = UpdateProjectInputSchema.parse(input);

  return repository.update(projectId, normalizedInput);
};
