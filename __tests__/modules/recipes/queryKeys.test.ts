import { recipesQueryKeys } from "@/modules/recipes/queryKeys";

describe("recipesQueryKeys.catalog.infinite", () => {
  it("depends on normalized filters only", () => {
    expect(
      recipesQueryKeys.catalog.infinite("project-1", {
        search: "  citron  ",
        tagSlugs: ["rapide", "vegetarien", "rapide"],
      })
    ).toEqual([
      "recipes",
      "project-1",
      "catalog",
      "list",
      "infinite",
      {
        search: "citron",
        tagSlugs: ["rapide", "vegetarien"],
      },
    ]);
  });

  it("keeps the same key for equivalent filter states", () => {
    expect(
      recipesQueryKeys.catalog.infinite("project-1", {
        search: "citron",
        tagSlugs: ["vegetarien", "rapide"],
      })
    ).toEqual(
      recipesQueryKeys.catalog.infinite("project-1", {
        search: "citron",
        tagSlugs: ["rapide", "vegetarien"],
      })
    );
  });
});
