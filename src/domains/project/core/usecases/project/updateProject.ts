import { z } from "zod";

import { isAllowedProjectBoardEmoji } from "@/domains/project/core/domain/constants/projectBoardEmoji.constants";
import type { Project } from "@/domains/project/core/domain/project.types";
import { containsEmoji } from "@/domains/project/core/domain/rules/projectName.rules";
import type { ProjectGateway } from "@/domains/project/core/ports/project.gateway";

const ProjectIdSchema = z.string().uuid("Project ID must be a valid UUID");

export const UpdateProjectInputSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Project name must not be empty")
      .refine((value) => !containsEmoji(value), {
        message: "PROJECT_NAME_CONTAINS_EMOJI",
      })
      .optional(),
    boardEmoji: z
      .string()
      .refine((value) => isAllowedProjectBoardEmoji(value), {
        message: "INVALID_BOARD_EMOJI",
      })
      .optional(),
  })
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one project field must be provided",
  });

export type UpdateProjectInput = z.infer<typeof UpdateProjectInputSchema>;

/**
 * Update an existing project with validated, normalized input.
 */
export const updateProject = async (
  gateway: ProjectGateway,
  projectId: string,
  input: UpdateProjectInput
): Promise<Project> => {
  ProjectIdSchema.parse(projectId);
  const normalizedInput = UpdateProjectInputSchema.parse(input);

  return gateway.update(projectId, normalizedInput);
};
