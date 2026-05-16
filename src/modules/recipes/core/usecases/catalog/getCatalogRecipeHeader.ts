import type { CatalogRepository } from "@/modules/recipes/core/ports/catalog/catalogRepository";

type Dependencies = {
  catalogRepository: CatalogRepository;
};

type GetCatalogRecipeHeaderInput = {
  projectId: string;
  recipeId: string;
};

export const getCatalogRecipeHeader =
  ({ catalogRepository }: Dependencies) =>
  ({ projectId, recipeId }: GetCatalogRecipeHeaderInput) => {
    return catalogRepository.getHeader(projectId, recipeId);
  };
