import { z } from "zod";

/**
 * Zod schema for Label entity.
 * Labels are project-scoped tags with a color for visual identification.
 */
export const LabelSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1, "Label name must not be empty"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid hex"),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Label = z.infer<typeof LabelSchema>;

/**
 * Input for creating a new label.
 */
export const CreateLabelInputSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1, "Label name must not be empty"),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional()
    .default("#6B7280"),
});

export type CreateLabelInput = z.infer<typeof CreateLabelInputSchema>;

/**
 * Input for updating an existing label.
 */
export const UpdateLabelInputSchema = z.object({
  name: z.string().min(1, "Label name must not be empty").optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
});

export type UpdateLabelInput = z.infer<typeof UpdateLabelInputSchema>;
