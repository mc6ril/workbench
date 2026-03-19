import { createDomainRuleError } from "@/shared/errors/domainRuleError";
import { canCompleteSprint } from "@/domains/project-management/core/domain/rules/sprint.rules";
import type { Sprint } from "@/domains/project-management/core/domain/schema/sprint.schema";

import type { SprintRepository } from "@/domains/project-management/core/ports/sprintRepository";

/**
 * Complete an active sprint.
 * Tickets still in this sprint will remain assigned to it
 * for historical tracking.
 *
 * @throws DomainRuleError if sprint is not active
 */
export const completeSprint = async (
  sprintId: string,
  repo: SprintRepository
): Promise<Sprint> => {
  const sprint = await repo.findById(sprintId);

  if (!sprint) {
    throw createDomainRuleError("Sprint not found");
  }

  if (!canCompleteSprint(sprint)) {
    throw createDomainRuleError("Only active sprints can be completed");
  }

  return repo.update(sprintId, {
    status: "completed",
    endDate: new Date(),
  });
};
