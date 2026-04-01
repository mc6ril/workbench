import type { CatalogRecipeListInput } from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import type { CatalogRepository } from "@/modules/recipes/core/ports/catalog/catalogRepository";

type Dependencies = {
  catalogRepository: CatalogRepository;
};

export const listCatalogRecipes =
  ({ catalogRepository }: Dependencies) =>
  (input: CatalogRecipeListInput) => {
    return catalogRepository.listByProject(input);
  };
