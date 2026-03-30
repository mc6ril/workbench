import { z } from "zod";

import type { Project } from "@/domains/project/core/domain/project.types";
import { containsEmoji } from "@/domains/project/core/domain/rules/projectName.rules";
import type { ProjectGateway } from "@/domains/project/core/ports/project.gateway";

export const CreateProjectInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Project name must not be empty")
    .refine((value) => !containsEmoji(value), {
      message: "PROJECT_NAME_CONTAINS_EMOJI",
    }),
});

export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>;

/**
 * Create a new project.
 * Validates input and creates a new project.
 * Note: RLS policies ensure users can only create projects if they have no existing project access.
 * The creator is automatically added as admin via database trigger.
 *
 * @param repository - Project repository
 * @param input - Project creation data (name)
 * @returns Created project
 * @throws ConstraintError if constraint violation occurs (e.g., user already has project access)
 * @throws DatabaseError if database operation fails
 */
export const createProject = async (
  gateway: ProjectGateway,
  input: CreateProjectInput
): Promise<Project> => {
  const validatedInput = CreateProjectInputSchema.parse(input);

  return gateway.create({
    name: validatedInput.name,
  });
};
