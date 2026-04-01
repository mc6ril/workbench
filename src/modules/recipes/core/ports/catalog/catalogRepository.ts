import type {
  CatalogRecipeDetail,
  CatalogRecipeListInput,
  CatalogRecipeSummary,
  CatalogRecipeTag,
} from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";

export type CatalogRepository = {
  listByProject: (input: CatalogRecipeListInput) => Promise<CatalogRecipeSummary[]>;
  listTagsByProject: (projectId: string) => Promise<CatalogRecipeTag[]>;
  getDetail: (
    projectId: string,
    recipeId: string
  ) => Promise<CatalogRecipeDetail | null>;
};
