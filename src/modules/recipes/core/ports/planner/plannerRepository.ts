import type {
  CookedSelection,
  MarkAsCookedInput,
  MarkShoppingDoneInput,
  QuickListRecipe,
  RemoveSelectionInput,
  SelectRecipeInput,
} from "@/modules/recipes/core/domain/planner/quickList.types";

export type PlannerRepository = {
  listActiveSelections: (projectId: string) => Promise<QuickListRecipe[]>;
  selectRecipe: (input: SelectRecipeInput) => Promise<QuickListRecipe>;
  markShoppingDone: (
    input: MarkShoppingDoneInput
  ) => Promise<QuickListRecipe>;
  markAsCooked: (input: MarkAsCookedInput) => Promise<CookedSelection>;
  removeSelection: (input: RemoveSelectionInput) => Promise<void>;
};
