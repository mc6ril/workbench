import { z } from "zod";

/**
 * Zod schema for Epic entity.
 * Validates data coming from external sources.
 */
export const EpicSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1, "Epic name must not be empty"),
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

/**
 * Epic domain entity.
 */
export type Epic = z.infer<typeof EpicSchema>;

/**
 * Input for creating a new epic (without id and timestamps).
 */
export const CreateEpicInputSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1, "Epic name must not be empty"),
  description: z.string().nullable().optional(),
});

export type CreateEpicInput = z.infer<typeof CreateEpicInputSchema>;

/**
 * Input for updating an existing epic.
 */
export const UpdateEpicInputSchema = z.object({
  name: z.string().min(1, "Epic name must not be empty").optional(),
  description: z.string().nullable().optional(),
});

export type UpdateEpicInput = z.infer<typeof UpdateEpicInputSchema>;
