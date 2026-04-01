import type { SelectRecipeInput } from "@/modules/recipes/core/domain/planner/quickList.types";
import type { PlannerRepository } from "@/modules/recipes/core/ports/planner/plannerRepository";

type Dependencies = {
  plannerRepository: PlannerRepository;
};

export const selectRecipe =
  ({ plannerRepository }: Dependencies) =>
  (input: SelectRecipeInput) => {
    return plannerRepository.selectRecipe(input);
  };
