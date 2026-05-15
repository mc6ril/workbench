import type {
  CatalogRecipeDetail,
  CatalogRecipeListInput,
  CatalogRecipeListResponse,
  CatalogRecipeTag,
  CookingHistoryEntry,
} from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";

export type CatalogRepository = {
  listByProject: (
    input: CatalogRecipeListInput
  ) => Promise<CatalogRecipeListResponse>;
  listTagsByProject: (projectId: string) => Promise<CatalogRecipeTag[]>;
  getDetail: (
    projectId: string,
    recipeId: string
  ) => Promise<CatalogRecipeDetail | null>;
  listCookingHistory: (
    projectId: string,
    limit: number
  ) => Promise<CookingHistoryEntry[]>;
};
