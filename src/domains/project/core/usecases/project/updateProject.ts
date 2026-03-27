import { z } from "zod";

import type {
  CreateProjectInput,
  Project,
} from "@/domains/project/core/domain/schema/project.schema";
import { GetProjectInputSchema } from "@/domains/project/core/domain/schema/project.schema";
import type { ProjectRepository } from "@/domains/project/core/ports/projectRepository";

const UpdateProjectInputSchema = z
  .object({
    name: z.string().trim().min(1, "Project name must not be empty").optional(),
  })
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one project field must be provided",
  });

/**
 * Update an existing project with validated, normalized input.
 */
export const updateProject = async (
  repository: ProjectRepository,
  projectId: string,
  input: Partial<CreateProjectInput>
): Promise<Project> => {
  GetProjectInputSchema.parse({ id: projectId });
  const normalizedInput = UpdateProjectInputSchema.parse(input);

  return repository.update(projectId, normalizedInput);
};
