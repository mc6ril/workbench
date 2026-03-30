import { z } from "zod";

import {
  applyConfigureColumnsPlan,
  assertColumnsCanBeDeleted,
  buildConfigureColumnsContext,
  buildValidatedDraftColumns,
  getOrCreateBoard,
} from "./configureColumns.helpers";

import {
  type BoardConfiguration,
  COLUMN_WORKFLOW_STATE_VALUES,
  type ConfigureColumnsInput,
} from "@/modules/board/core/domain/board.types";
import type { BoardRepository } from "@/modules/board/core/ports/boardRepository";

const ColumnWorkflowStateSchema = z.enum(COLUMN_WORKFLOW_STATE_VALUES);

const ConfigureColumnsInputSchema = z.object({
  projectId: z.string().uuid(),
  columns: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        name: z.string().min(1, "Column name must not be empty"),
        key: z.string().min(1, "Column key must not be empty").optional(),
        state: ColumnWorkflowStateSchema,
        position: z.number().int().nonnegative(),
        visible: z.boolean().default(true),
      })
    )
    .min(1, "At least one column is required"),
});

/**
 * Configure board columns for a project.
 * Updates existing columns by ID, creates new ones if ID not provided.
 * Supports idempotent behavior: reapplying the same configuration doesn't create duplicates.
 *
 * @param repository - Board repository
 * @param input - Board configuration input with project ID and columns
 * @returns Updated board configuration with board and columns
 * @throws ZodError if input is invalid
 * @throws DomainRuleError if validation fails (invalid order, missing done state)
 * @throws DatabaseError if database operation fails
 */
export const configureColumns = async (
  repository: BoardRepository,
  input: ConfigureColumnsInput
): Promise<BoardConfiguration> => {
  const validatedInput = ConfigureColumnsInputSchema.parse(input);
  const board = await getOrCreateBoard(repository, validatedInput.projectId);

  const existingColumns = await repository.listColumnsByBoard(board.id);
  const { existingColumnsById, columnsToDelete } = buildConfigureColumnsContext(
    existingColumns,
    validatedInput.columns
  );

  await assertColumnsCanBeDeleted(repository, columnsToDelete);

  const draftColumns = buildValidatedDraftColumns(
    board,
    validatedInput.columns,
    existingColumnsById
  );

  await applyConfigureColumnsPlan(repository, {
    boardId: board.id,
    inputColumns: validatedInput.columns,
    existingColumns,
    existingColumnsById,
    columnsToDelete,
    draftColumns,
  });

  const finalColumns = await repository.listColumnsByBoard(board.id);

  return {
    board,
    columns: finalColumns,
  };
};
