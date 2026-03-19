import { calculateEpicProgress } from "@/modules/board/core/domain/rules/epic.rules";
import type { EpicWithProgress } from "@/modules/board/core/domain/schema/epic.schema";

import type { BoardRepository } from "@/modules/board/core/ports/boardRepository";
import type { EpicRepository } from "@/modules/board/core/ports/epicRepository";

/**
 * List all epics for a project with progress calculation.
 * Each epic includes a progress indicator based on assigned tickets.
 * Progress is calculated as percentage of completed tickets (0-100).
 *
 * @param repository - Epic repository
 * @param projectId - Project ID
 * @returns Array of epics with progress
 * @throws DatabaseError if database operation fails
 */
export const listEpics = async (
  repository: EpicRepository,
  boardRepository: BoardRepository,
  projectId: string
): Promise<EpicWithProgress[]> => {
  // Fetch all epics for project
  const epics = await repository.listByProject(projectId);
  const board = await boardRepository.findByProject(projectId);
  const columns = board
    ? await boardRepository.listColumnsByBoard(board.id)
    : [];

  // Calculate progress for each epic
  const epicsWithProgress: EpicWithProgress[] = await Promise.all(
    epics.map(async (epic) => {
      // Fetch tickets assigned to epic
      const tickets = await repository.listTicketsByEpic(epic.id);

      // Calculate progress
      const progress = calculateEpicProgress(tickets, columns);

      // Return epic with progress
      return {
        ...epic,
        progress,
      };
    })
  );

  return epicsWithProgress;
};
