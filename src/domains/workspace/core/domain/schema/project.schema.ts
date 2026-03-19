import { z } from "zod";

import { ProjectRole } from "@/domains/project/core/domain/schema/projectRole.schema";

/**
 * UUID validation regex that accepts any valid UUID format
 * This is more permissive than Zod's .uuid() which may reject certain UUID versions
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
  shortCode: z
    .string()
    .transform((val) => String(val).trim().toUpperCase())
    .refine((val) => val.length === 2, {
      message: "Project short code must be exactly 2 characters",
    }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

/**
 * Project domain entity.
 */
export type Project = z.infer<typeof ProjectSchema>;

/**
 * Input for creating a new project (without id and timestamps).
 */
export const CreateProjectInputSchema = z.object({
  name: z.string().min(1, "Project name must not be empty"),
});

export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>;

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
 * Statistics for a project (member counts, ticket counts).
 * Used for workspace overview display.
 */
export type ProjectStats = {
  memberCount: number;
  ticketCount: number;
  inProgressCount: number;
  completedCount: number;
};

/**
 * Project with role and statistics for workspace overview.
 * Combines project data with user role and aggregated stats.
 */
export type ProjectWithStats = ProjectWithRole & ProjectStats;

/**
 * Input schema for adding a user to a project.
 * Used in addUserToProject usecase.
 */
export const AddUserToProjectInputSchema = z.object({
  projectId: z.string().uuid("Project ID must be a valid UUID"),
});

/**
 * A project that was orphaned (all members left) and can be reclaimed
 * by the original creator via email matching.
 */
export type ReclaimableProject = {
  id: string;
  name: string;
  shortCode: string;
  orphanedAt: Date;
};

export { PROJECT_ROLES, ProjectRole } from "@/domains/project/core/domain/schema/projectRole.schema";
