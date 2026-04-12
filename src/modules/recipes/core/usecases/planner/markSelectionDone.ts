import type { MarkSelectionDoneInput } from "@/modules/recipes/core/domain/planner/quickList.types";
import type { PlannerRepository } from "@/modules/recipes/core/ports/planner/plannerRepository";

type Dependencies = {
  plannerRepository: PlannerRepository;
};

export const markSelectionDone =
  ({ plannerRepository }: Dependencies) =>
  (input: MarkSelectionDoneInput) => {
    return plannerRepository.markSelectionDone(input);
  };
