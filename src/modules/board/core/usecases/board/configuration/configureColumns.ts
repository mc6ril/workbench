import {
  applyConfigureColumnsPlan,
  assertColumnsCanBeDeleted,
  buildConfigureColumnsContext,
  buildValidatedDraftColumns,
  getOrCreateBoard,
} from "./configureColumns.helpers";

import {
  type BoardConfiguration,
  type ConfigureColumnsInput,
  ConfigureColumnsInputSchema,
} from "@/modules/board/core/domain/schema/board.schema";
import type { BoardRepository } from "@/modules/board/core/ports/boardRepository";

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
