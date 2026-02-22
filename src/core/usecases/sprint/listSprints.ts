import type { SprintWithStats } from "@/core/domain/schema/sprint.schema";

import type { SprintRepository } from "@/core/ports/sprintRepository";

/**
 * List all sprints for a project with their ticket statistics.
 * Returns sprints ordered by position (planned/active first, then completed).
 */
export const listSprints = async (
  projectId: string,
  repo: SprintRepository
): Promise<SprintWithStats[]> => {
  const sprints = await repo.listByProject(projectId);

  const sprintsWithStats = await Promise.all(
    sprints.map(async (sprint) => {
      const stats = await repo.getSprintStats(sprint.id);
      return {
        ...sprint,
        ticketCount: stats.ticketCount,
        completedCount: stats.completedCount,
      };
    })
  );

  return sprintsWithStats;
};
