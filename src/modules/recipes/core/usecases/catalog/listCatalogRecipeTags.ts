import type { CatalogRepository } from "@/modules/recipes/core/ports/catalog/catalogRepository";

type Dependencies = {
  catalogRepository: CatalogRepository;
};

export const listCatalogRecipeTags =
  ({ catalogRepository }: Dependencies) =>
  (projectId: string) => {
    return catalogRepository.listTagsByProject(projectId);
  };
