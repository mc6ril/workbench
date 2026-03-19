import { createDomainRuleError } from "@/shared/errors/domainRuleError";
import { canStartSprint } from "@/modules/board/core/domain/rules/sprint.rules";
import type { Sprint } from "@/modules/board/core/domain/schema/sprint.schema";

import type { SprintRepository } from "@/modules/board/core/ports/sprintRepository";

/**
 * Start a planned sprint, marking it as active.
 * Only one sprint can be active per project (DB constraint).
 *
 * @throws DomainRuleError if sprint is not in planned status
 * @throws ConstraintError if another sprint is already active
 */
export const startSprint = async (
  sprintId: string,
  repo: SprintRepository
): Promise<Sprint> => {
  const sprint = await repo.findById(sprintId);

  if (!sprint) {
    throw createDomainRuleError("Sprint not found");
  }

  if (!canStartSprint(sprint)) {
    throw createDomainRuleError("Only planned sprints can be started");
  }

  return repo.update(sprintId, {
    status: "active",
    startDate: new Date(),
  });
};
