import type {
  CreateSprintInput,
  Sprint,
} from "@/domains/project-management/core/domain/schema/sprint.schema";
import { CreateSprintInputSchema } from "@/domains/project-management/core/domain/schema/sprint.schema";

import type { SprintRepository } from "@/domains/project-management/core/ports/sprintRepository";

/**
 * Create a new sprint in a project.
 * The sprint starts in "planned" status.
 */
export const createSprint = async (
  input: CreateSprintInput,
  repo: SprintRepository
): Promise<Sprint> => {
  const validated = CreateSprintInputSchema.parse(input);
  return repo.create(validated);
};
