import { buildMissingDefaultColumnCreates } from "@/modules/board/core/domain/board.defaults";
import type { BoardConfiguration } from "@/modules/board/core/domain/board.types";
import type { BoardRepository } from "@/modules/board/core/ports/boardRepository";

/**
 * Get board configuration for a project.
 * Ensures the board row exists, then ensures each default workflow state (todo,
 * in_progress, done) has at least one column—creating only missing defaults so
 * reopening the project does not insert duplicate lanes when columns already exist.
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
  let board = await repository.findByProject(projectId);

  if (!board) {
    board = await repository.create({ projectId });
  }

  let columns = await repository.listColumnsByBoard(board.id);

  const missingCreates = buildMissingDefaultColumnCreates(columns);

  if (missingCreates.length > 0) {
    await Promise.all(
      missingCreates.map((columnInput) =>
        repository.createColumn({
          ...columnInput,
          boardId: board.id,
        })
      )
    );
    columns = await repository.listColumnsByBoard(board.id);
  }

  return {
    board,
    columns,
  };
};
