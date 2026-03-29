import { z } from "zod";

import { isAllowedProjectBoardEmoji } from "@/domains/project/core/domain/constants/projectBoardEmoji.constants";
import { containsEmoji } from "@/domains/project/core/domain/rules/projectName.rules";
import type { ProjectRole } from "@/domains/project/core/domain/schema/projectRole.schema";

const projectNamePlainSchema = z
  .string()
  .trim()
  .min(1, "Project name must not be empty")
  .refine((val) => !containsEmoji(val), {
    message: "PROJECT_NAME_CONTAINS_EMOJI",
  });

const projectShortCodeSchema = z
  .string()
  .transform((val) => String(val).trim().toUpperCase())
  .refine((val) => /^\p{L}{2}$/u.test(val), {
    message: "PROJECT_SHORT_CODE_INVALID",
  });

/**
 * UUID validation regex that accepts any valid UUID format.
 * This is more permissive than Zod's .uuid() which may reject certain UUID versions.
 */
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Zod schema for Project entity.
 * Validates data coming from external sources.
 */
export const ProjectSchema = z.object({
  id: z
    .string()
    .transform((val) => String(val).trim().toLowerCase())
    .refine((val) => uuidRegex.test(val), {
      message: "Invalid UUID format",
    }),
  name: z.string().min(1, "Project name must not be empty"),
  shortCode: projectShortCodeSchema,
  boardEmoji: z.string().min(1).max(32),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

/** Project domain entity. */
export type Project = z.infer<typeof ProjectSchema>;

/** Input for creating a new project (without id and timestamps). */
export const CreateProjectInputSchema = z.object({
  name: projectNamePlainSchema,
});

export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>;

/**
 * Input schema for updating an existing project.
 * At least one updatable field must be provided.
 */
export const UpdateProjectInputSchema = z
  .object({
    name: projectNamePlainSchema.optional(),
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
 * Project with role information for the current user.
 * Used when listing projects to display user's role in each project.
 */
export type ProjectWithRole = Project & {
  role: ProjectRole;
};

/**
 * Input schema for getting a project by ID.
 * Used internally for validation in getProject usecase.
 */
export const GetProjectInputSchema = z.object({
  id: z.string().uuid("Project ID must be a valid UUID"),
});

/**
 * Input schema for adding a user to a project.
 * Used in addUserToProject usecase.
 */
export const AddUserToProjectInputSchema = z.object({
  projectId: z.string().uuid("Project ID must be a valid UUID"),
});

export {
  PROJECT_ROLES,
  ProjectRole,
} from "@/domains/project/core/domain/schema/projectRole.schema";
