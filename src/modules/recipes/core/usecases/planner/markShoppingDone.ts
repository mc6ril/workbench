import type { MarkShoppingDoneInput } from "@/modules/recipes/core/domain/planner/quickList.types";
import type { PlannerRepository } from "@/modules/recipes/core/ports/planner/plannerRepository";

type Dependencies = {
  plannerRepository: PlannerRepository;
};

export const markShoppingDone =
  ({ plannerRepository }: Dependencies) =>
  (input: MarkShoppingDoneInput) => {
    return plannerRepository.markShoppingDone(input);
  };
