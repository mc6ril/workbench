import type { PlannerRepository } from "@/modules/recipes/core/ports/planner/plannerRepository";

type Dependencies = {
  plannerRepository: PlannerRepository;
};

export const listQuickListRecipes =
  ({ plannerRepository }: Dependencies) =>
  (projectId: string) => {
    return plannerRepository.listQuickList(projectId);
  };
