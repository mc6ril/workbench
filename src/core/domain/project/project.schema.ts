import { z } from "zod";

/**
 * UUID validation regex that accepts any valid UUID format
 * This is more permissive than Zod's .uuid() which may reject certain UUID versions
 */
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Zod schema for Project entity.
 * Validates data coming from Supabase or external sources.
 */
export const ProjectSchema = z.object({
  id: z
    .string()
    .transform((val) => String(val).trim().toLowerCase())
    .refine((val) => uuidRegex.test(val), {
      message: "Invalid UUID format",
    }),
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
