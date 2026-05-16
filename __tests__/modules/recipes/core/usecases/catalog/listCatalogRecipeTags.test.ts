import { listCatalogRecipeTags } from "@/modules/recipes/core/usecases/catalog/listCatalogRecipeTags";

describe("listCatalogRecipeTags", () => {
  it("reads catalogue tags through the catalog repository", async () => {
    const listTagsByProject = jest.fn().mockResolvedValue([]);

    await listCatalogRecipeTags({
      catalogRepository: {
        listByProject: jest.fn(),
        listTagsByProject,
        getHeader: jest.fn(),
        getDetail: jest.fn(),
        listCookingHistory: jest.fn(),
      },
    })("project-1");

    expect(listTagsByProject).toHaveBeenCalledWith("project-1");
  });
});
