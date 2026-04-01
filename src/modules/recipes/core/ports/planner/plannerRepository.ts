import type { QuickListRecipe } from "@/modules/recipes/core/domain/planner/quickList.types";

export type PlannerRepository = {
  listQuickList: (projectId: string) => Promise<QuickListRecipe[]>;
};
