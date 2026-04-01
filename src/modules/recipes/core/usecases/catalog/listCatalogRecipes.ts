import type { CatalogRepository } from "@/modules/recipes/core/ports/catalog/catalogRepository";

type Dependencies = {
  catalogRepository: CatalogRepository;
};

export const listCatalogRecipes =
  ({ catalogRepository }: Dependencies) =>
  (projectId: string) => {
    return catalogRepository.listByProject(projectId);
  };
