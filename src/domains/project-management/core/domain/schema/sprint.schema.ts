import { z } from "zod";

/**
 * Sprint status represents the lifecycle of a sprint.
 * - planned: Sprint is created but not started
 * - active: Sprint is in progress (only one per project)
 * - completed: Sprint is finished
 */
export const SprintStatusSchema = z.enum(["planned", "active", "completed"]);

export type SprintStatus = z.infer<typeof SprintStatusSchema>;

/**
 * Zod schema for Sprint entity.
 * Sprints group tickets into iterations within a project.
 */
export const SprintSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1, "Sprint name must not be empty"),
  goal: z.string().nullable(),
  startDate: z.coerce.date().nullable(),
  endDate: z.coerce.date().nullable(),
  status: SprintStatusSchema,
  position: z.number().int().nonnegative(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Sprint = z.infer<typeof SprintSchema>;

/**
 * Input for creating a new sprint.
 */
export const CreateSprintInputSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1, "Sprint name must not be empty"),
  goal: z.string().nullable().optional(),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
});

export type CreateSprintInput = z.infer<typeof CreateSprintInputSchema>;

/**
 * Input for updating an existing sprint.
 */
export const UpdateSprintInputSchema = z.object({
  name: z.string().min(1, "Sprint name must not be empty").optional(),
  goal: z.string().nullable().optional(),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  status: SprintStatusSchema.optional(),
});

export type UpdateSprintInput = z.infer<typeof UpdateSprintInputSchema>;

/**
 * Sprint with ticket count and progress metrics.
 */
export type SprintWithStats = Sprint & {
  ticketCount: number;
  completedCount: number;
};
