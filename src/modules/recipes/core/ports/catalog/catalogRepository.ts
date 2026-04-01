import type {
  CatalogRecipeDetail,
  CatalogRecipeSummary,
} from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";

export type CatalogRepository = {
  listByProject: (projectId: string) => Promise<CatalogRecipeSummary[]>;
  getDetail: (
    projectId: string,
    recipeId: string
  ) => Promise<CatalogRecipeDetail | null>;
};
