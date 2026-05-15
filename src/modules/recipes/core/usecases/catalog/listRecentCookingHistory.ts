import type { CatalogRepository } from "@/modules/recipes/core/ports/catalog/catalogRepository";

const RECENT_COOKING_HISTORY_LIMIT = 10;

type Dependencies = {
  catalogRepository: CatalogRepository;
};

export const listRecentCookingHistory =
  ({ catalogRepository }: Dependencies) =>
  (projectId: string) => {
    return catalogRepository.listCookingHistory(
      projectId,
      RECENT_COOKING_HISTORY_LIMIT
    );
  };
