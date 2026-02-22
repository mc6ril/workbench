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
  codeNumber: z.number().int().positive(),
  startDate: z.coerce.date().nullable(),
  targetDate: z.coerce.date().nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid hex"),
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
  startDate: z.coerce.date().nullable().optional(),
  targetDate: z.coerce.date().nullable().optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  codeNumber: z.number().int().positive().optional(),
});

export type CreateEpicInput = z.infer<typeof CreateEpicInputSchema>;

/**
 * Input for updating an existing epic.
 */
export const UpdateEpicInputSchema = z.object({
  name: z.string().min(1, "Epic name must not be empty").optional(),
  description: z.string().nullable().optional(),
  startDate: z.coerce.date().nullable().optional(),
  targetDate: z.coerce.date().nullable().optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
});

export type UpdateEpicInput = z.infer<typeof UpdateEpicInputSchema>;

/**
 * Epic with progress calculation.
 * Used when listing epics to display progress indicator.
 */
export type EpicWithProgress = Epic & {
  progress: number; // Progress percentage (0-100)
};

/**
 * Epic detail with progress and assigned tickets.
 * Used when retrieving epic details to show full epic information.
 */
export type EpicDetail = Epic & {
  progress: number; // Progress percentage (0-100)
  tickets: Array<{
    id: string;
    title: string;
    status: string;
  }>; // Tickets assigned to epic (minimal ticket info)
};

/**
 * Input for getting an epic by project short code and code number.
 * Used in getEpicByCode usecase.
 */
export const GetEpicByCodeInputSchema = z.object({
  projectShortCode: z.string().min(1, "Project short code must not be empty"),
  codeNumber: z
    .number()
    .int()
    .positive("Code number must be a positive integer"),
});

export type GetEpicByCodeInput = z.infer<typeof GetEpicByCodeInputSchema>;

/**
 * Input for repository create method where codeNumber is required.
 * The usecase allocates the code number before calling the repository.
 */
export const CreateEpicRepositoryInputSchema = CreateEpicInputSchema.extend({
  codeNumber: z.number().int().positive(),
});

export type CreateEpicRepositoryInput = z.infer<
  typeof CreateEpicRepositoryInputSchema
>;
