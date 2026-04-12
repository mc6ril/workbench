import type { RemoveSelectionInput } from "@/modules/recipes/core/domain/planner/quickList.types";
import type { PlannerRepository } from "@/modules/recipes/core/ports/planner/plannerRepository";

type Dependencies = {
  plannerRepository: PlannerRepository;
};

export const removeSelection =
  ({ plannerRepository }: Dependencies) =>
  (input: RemoveSelectionInput) => {
    return plannerRepository.removeSelection(input);
  };
