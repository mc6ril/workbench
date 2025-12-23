import { z } from "zod";

/**
 * Zod schema for Project entity.
 * Validates data coming from Supabase or external sources.
 */
export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Project name must not be empty"),
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
