import { createRecipeIngredient } from "@/modules/recipes/core/domain/recipe.types";
import { buildShoppingList } from "@/modules/recipes/core/domain/shopping/shoppingList.types";

describe("buildShoppingList", () => {
  it("computes checked and pending counts from grouped shopping items", () => {
    const validatedIngredient = createRecipeIngredient({
      id: "ingredient-lemon",
      displayName: "citron jaune",
      amountText: "2",
      kind: "validated",
    });
    const additionCandidateIngredient = createRecipeIngredient({
      id: "ingredient-sumac",
      displayName: "sumac",
      amountText: "1",
      unit: "sachet",
      kind: "addition_candidate",
    });

    const shoppingList = buildShoppingList([
      {
        id: "group-produce",
        title: "Primeur",
        items: [
          {
            id: "item-lemon",
            ingredient: validatedIngredient,
            checked: true,
            recipes: [{ recipeId: "recipe-1", title: "Poulet citron" }],
          },
        ],
      },
      {
        id: "group-pantry",
        title: "Epicerie",
        items: [
          {
            id: "item-sumac",
            ingredient: additionCandidateIngredient,
            checked: false,
            recipes: [{ recipeId: "recipe-1", title: "Poulet citron" }],
          },
        ],
      },
    ]);

    expect(shoppingList.checkedCount).toBe(1);
    expect(shoppingList.pendingCount).toBe(1);
    expect(shoppingList.groups[1].items[0].ingredient.kind).toBe(
      "addition_candidate"
    );
  });

  it("returns zero counts for an empty shopping list", () => {
    expect(buildShoppingList([])).toEqual({
      groups: [],
      checkedCount: 0,
      pendingCount: 0,
    });
  });
});
