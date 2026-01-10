import { createDomainRuleError } from "@/core/domain/domainRuleError";
import { validateBoardWithColumns } from "@/core/domain/rules/board.rules";
import type { BoardConfiguration } from "@/core/domain/schema/board.schema";
import {
  type ConfigureColumnsInput,
  ConfigureColumnsInputSchema,
} from "@/core/domain/schema/board.schema";

import type { BoardRepository } from "@/core/ports/boardRepository";

/**
 * Configure board columns for a project.
 * Updates existing columns by ID, creates new ones if ID not provided.
 * Supports idempotent behavior: reapplying the same configuration doesn't create duplicates.
 *
 * @param repository - Board repository
 * @param input - Board configuration input with project ID and columns
 * @returns Updated board configuration with board and columns
 * @throws ZodError if input is invalid
 * @throws DomainRuleError if validation fails (duplicate IDs, invalid order, duplicate statuses)
 * @throws DatabaseError if database operation fails
 */
export const configureColumns = async (
  repository: BoardRepository,
  input: ConfigureColumnsInput
): Promise<BoardConfiguration> => {
  // Validate input with Zod schema
  const validatedInput = ConfigureColumnsInputSchema.parse(input);

  // Find or create board for project
  let board = await repository.findByProject(validatedInput.projectId);
  if (!board) {
    board = await repository.create({ projectId: validatedInput.projectId });
  }

  // Fetch existing columns
  const existingColumns = await repository.listColumnsByBoard(board.id);
  const existingColumnsById = new Map(
    existingColumns.map((col) => [col.id, col])
  );

  // Track which columns to keep (those in input)
  const columnsToKeepIds = new Set<string>();

  // Process each input column: update existing or create new
  await Promise.all(
    validatedInput.columns.map(async (columnInput) => {
      if (columnInput.id && existingColumnsById.has(columnInput.id)) {
        // Update existing column
        columnsToKeepIds.add(columnInput.id);
        return repository.updateColumn(columnInput.id, {
          name: columnInput.name,
          status: columnInput.status,
          position: columnInput.position,
          visible: columnInput.visible,
        });
      } else {
        // Create new column
        return repository.createColumn({
          boardId: board.id,
          name: columnInput.name,
          status: columnInput.status,
          position: columnInput.position,
          visible: columnInput.visible ?? true,
        });
      }
    })
  );

  // Delete columns that exist in DB but not in input
  const columnsToDelete = existingColumns.filter(
    (col) => !columnsToKeepIds.has(col.id)
  );
  for (const columnToDelete of columnsToDelete) {
    await repository.deleteColumn(columnToDelete.id);
  }

  // Fetch all columns after updates (to get final state)
  const finalColumns = await repository.listColumnsByBoard(board.id);

  // Validate complete configuration using domain rules
  const validationResult = validateBoardWithColumns(board, finalColumns);
  if (!validationResult.success) {
    throw createDomainRuleError(
      validationResult.error.code,
      validationResult.error.message,
      validationResult.error.field
    );
  }

  return {
    board,
    columns: finalColumns,
  };
};
