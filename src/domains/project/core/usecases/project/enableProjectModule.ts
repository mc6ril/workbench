import { z } from "zod";

import { createNotFoundError } from "@/shared/errors/repositoryError";

import type { Project } from "@/domains/project/core/domain/project.types";
import {
  hasProjectModule,
  ProjectModuleKey,
} from "@/domains/project/core/domain/projectModule.types";
import type { ProjectGateway } from "@/domains/project/core/ports/project.gateway";

const EnableProjectModuleInputSchema = z.object({
  projectId: z.string().uuid("Project ID must be a valid UUID"),
  moduleKey: z.nativeEnum(ProjectModuleKey),
});

/**
 * Enables a project module once and keeps the operation idempotent.
 */
export const enableProjectModule = async (
  gateway: ProjectGateway,
  projectId: string,
  moduleKey: ProjectModuleKey
): Promise<Project> => {
  const validatedInput = EnableProjectModuleInputSchema.parse({
    projectId,
    moduleKey,
  });

  const project = await gateway.findById(validatedInput.projectId);

  if (!project) {
    throw createNotFoundError("Project", validatedInput.projectId);
  }

  if (hasProjectModule(project.enabledModules, validatedInput.moduleKey)) {
    return project;
  }

  return gateway.update(validatedInput.projectId, {
    enabledModules: [...project.enabledModules, validatedInput.moduleKey],
  });
};
