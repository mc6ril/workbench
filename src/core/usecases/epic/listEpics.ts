import { calculateEpicProgress } from "@/core/domain/rules/epic.rules";
import type { EpicWithProgress } from "@/core/domain/schema/epic.schema";

import type { EpicRepository } from "@/core/ports/epicRepository";

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
  projectId: string
): Promise<EpicWithProgress[]> => {
  // Fetch all epics for project
  const epics = await repository.listByProject(projectId);

  // Calculate progress for each epic
  const epicsWithProgress: EpicWithProgress[] = await Promise.all(
    epics.map(async (epic) => {
      // Fetch tickets assigned to epic
      const tickets = await repository.listTicketsByEpic(epic.id);

      // Calculate progress
      const progress = calculateEpicProgress(tickets);

      // Return epic with progress
      return {
        ...epic,
        progress,
      };
    })
  );

  return epicsWithProgress;
};
