import { recipesQueryKeys } from "@/modules/recipes/queryKeys";

describe("recipesQueryKeys.catalog.infinite", () => {
  it("depends on normalized filters only", () => {
    expect(
      recipesQueryKeys.catalog.infinite("project-1", {
        search: "  citron  ",
        filterOptionIds: [
          "type-express",
          "popular-vegetarian",
          "type-express",
        ],
      })
    ).toEqual([
      "recipes",
      "project-1",
      "catalog",
      "list",
      "infinite",
      {
        search: "citron",
        filterOptionIds: ["popular-vegetarian", "type-express"],
      },
    ]);
  });

  it("keeps the same key for equivalent filter states", () => {
    expect(
      recipesQueryKeys.catalog.infinite("project-1", {
        search: "citron",
        filterOptionIds: ["popular-vegetarian", "type-express"],
      })
    ).toEqual(
      recipesQueryKeys.catalog.infinite("project-1", {
        search: "citron",
        filterOptionIds: ["type-express", "popular-vegetarian"],
      })
    );
  });
});
