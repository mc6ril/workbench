import type {
  CatalogRecipeDetail,
  CatalogRecipeHeader,
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
  getHeader: (
    projectId: string,
    recipeId: string
  ) => Promise<CatalogRecipeHeader | null>;
  getDetail: (
    projectId: string,
    recipeId: string
  ) => Promise<CatalogRecipeDetail | null>;
  listCookingHistory: (
    projectId: string,
    limit: number
  ) => Promise<CookingHistoryEntry[]>;
};
