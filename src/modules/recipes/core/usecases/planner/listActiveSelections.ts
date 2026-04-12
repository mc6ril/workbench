import type { PlannerRepository } from "@/modules/recipes/core/ports/planner/plannerRepository";

type Dependencies = {
  plannerRepository: PlannerRepository;
};

export const listActiveSelections =
  ({ plannerRepository }: Dependencies) =>
  (projectId: string) => {
    return plannerRepository.listActiveSelections(projectId);
  };
