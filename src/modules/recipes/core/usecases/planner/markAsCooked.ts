import type { MarkAsCookedInput } from "@/modules/recipes/core/domain/planner/quickList.types";
import type { PlannerRepository } from "@/modules/recipes/core/ports/planner/plannerRepository";

type Dependencies = {
  plannerRepository: PlannerRepository;
};

export const markAsCooked =
  ({ plannerRepository }: Dependencies) =>
  (input: MarkAsCookedInput) => {
    return plannerRepository.markAsCooked(input);
  };
