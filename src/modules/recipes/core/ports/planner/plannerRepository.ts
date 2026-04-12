import type {
  DoneQuickListSelection,
  MarkSelectionDoneInput,
  QuickListRecipe,
  RemoveSelectionInput,
  SelectRecipeInput,
} from "@/modules/recipes/core/domain/planner/quickList.types";

export type PlannerRepository = {
  listActiveSelections: (projectId: string) => Promise<QuickListRecipe[]>;
  selectRecipe: (input: SelectRecipeInput) => Promise<QuickListRecipe>;
  markSelectionDone: (
    input: MarkSelectionDoneInput
  ) => Promise<DoneQuickListSelection>;
  removeSelection: (input: RemoveSelectionInput) => Promise<void>;
};
