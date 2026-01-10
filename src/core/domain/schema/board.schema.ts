import { z } from "zod";

/**
 * Zod schema for Board entity.
 * Validates data coming from external sources.
 */
export const BoardSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

/**
 * Board domain entity.
 */
export type Board = z.infer<typeof BoardSchema>;

/**
 * Input for creating a new board (without id and timestamps).
 */
export const CreateBoardInputSchema = z.object({
  projectId: z.string().uuid(),
});

export type CreateBoardInput = z.infer<typeof CreateBoardInputSchema>;

/**
 * Zod schema for Column entity.
 * Validates data coming from external sources.
 */
export const ColumnSchema = z.object({
  id: z.string().uuid(),
  boardId: z.string().uuid(),
  name: z.string().min(1, "Column name must not be empty"),
  status: z.string().min(1, "Column status must not be empty"),
  position: z.number().int().nonnegative("Position must be non-negative"),
  visible: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

/**
 * Column domain entity.
 */
export type Column = z.infer<typeof ColumnSchema>;

/**
 * Input for creating a new column (without id and timestamps).
 */
export const CreateColumnInputSchema = z.object({
  boardId: z.string().uuid(),
  name: z.string().min(1, "Column name must not be empty"),
  status: z.string().min(1, "Column status must not be empty"),
  position: z.number().int().nonnegative().default(0),
  visible: z.boolean().default(true).optional(),
});

export type CreateColumnInput = z.infer<typeof CreateColumnInputSchema>;

/**
 * Input for updating an existing column.
 */
export const UpdateColumnInputSchema = z.object({
  name: z.string().min(1, "Column name must not be empty").optional(),
  status: z.string().min(1, "Column status must not be empty").optional(),
  position: z.number().int().nonnegative().optional(),
  visible: z.boolean().optional(),
});

export type UpdateColumnInput = z.infer<typeof UpdateColumnInputSchema>;

/**
 * Input for configuring board columns.
 * Represents a complete board configuration with all columns.
 * Supports idempotent behavior: updating existing columns by ID, creating new ones.
 */
export const ConfigureColumnsInputSchema = z.object({
  projectId: z.string().uuid(), // Project ID to find/create board
  columns: z
    .array(
      z.object({
        id: z.string().uuid().optional(), // Optional: if provided, update existing; if not, create new
        name: z.string().min(1, "Column name must not be empty"),
        status: z.string().min(1, "Column status must not be empty"),
        position: z.number().int().nonnegative(),
        visible: z.boolean().default(true),
      })
    )
    .min(1, "At least one column is required"),
});

export type ConfigureColumnsInput = z.infer<typeof ConfigureColumnsInputSchema>;

/**
 * Board configuration with columns.
 * Used when retrieving board configuration.
 */
export type BoardConfiguration = {
  board: Board;
  columns: Column[];
};
