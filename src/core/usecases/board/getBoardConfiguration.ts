import { getDefaultBoardConfiguration } from "@/core/domain/rules/board.rules";
import type { BoardConfiguration } from "@/core/domain/schema/board.schema";

import type { BoardRepository } from "@/core/ports/boardRepository";

/**
 * Get board configuration for a project.
 * Returns the board and its columns, or creates a default configuration if no board exists.
 * Ensures a valid board configuration is always returned.
 *
 * @param repository - Board repository
 * @param projectId - Project ID
 * @returns Board configuration with board and columns
 * @throws DatabaseError if database operation fails
 */
export const getBoardConfiguration = async (
  repository: BoardRepository,
  projectId: string
): Promise<BoardConfiguration> => {
  // Find board for project
  let board = await repository.findByProject(projectId);

  // If board doesn't exist, create it
  if (!board) {
    board = await repository.create({ projectId });
  }

  // Fetch columns for board
  let columns = await repository.listColumnsByBoard(board.id);

  // If no columns exist, create default columns
  if (columns.length === 0) {
    const defaultConfig = getDefaultBoardConfiguration(projectId);
    columns = await Promise.all(
      defaultConfig.columns.map((columnInput) =>
        repository.createColumn({
          ...columnInput,
          boardId: board.id,
        })
      )
    );
  }

  return {
    board,
    columns,
  };
};
