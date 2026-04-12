import type { CatalogRepository } from "@/modules/recipes/core/ports/catalog/catalogRepository";

type Dependencies = {
  catalogRepository: CatalogRepository;
};

type GetCatalogRecipeDetailInput = {
  projectId: string;
  recipeId: string;
};

export const getCatalogRecipeDetail =
  ({ catalogRepository }: Dependencies) =>
  ({ projectId, recipeId }: GetCatalogRecipeDetailInput) => {
    return catalogRepository.getDetail(projectId, recipeId);
  };
