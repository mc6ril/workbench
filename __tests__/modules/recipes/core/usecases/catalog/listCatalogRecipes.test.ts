import { listCatalogRecipes } from "@/modules/recipes/core/usecases/catalog/listCatalogRecipes";

describe("listCatalogRecipes", () => {
  it("passes project id and filters to the catalog repository", async () => {
    const listByProject = jest.fn().mockResolvedValue({
      items: [],
      hasMore: false,
      nextCursor: null,
    });

    await listCatalogRecipes({
      catalogRepository: {
        listByProject,
        listTagsByProject: jest.fn(),
        getDetail: jest.fn(),
      },
    })({
      projectId: "project-1",
      filters: {
        search: "citron",
        filterOptionIds: ["type-express"],
      },
    });

    expect(listByProject).toHaveBeenCalledWith({
      projectId: "project-1",
      filters: {
        search: "citron",
        filterOptionIds: ["type-express"],
      },
    });
  });
});
