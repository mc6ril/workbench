import { createRecipeIngredientFromDraftInput } from "@/modules/recipes/core/domain/recipe.types";
import { buildShoppingListFromSources } from "@/modules/recipes/core/domain/shopping/buildShoppingListFromSources";

describe("buildShoppingListFromSources", () => {
  it("merges only safe structured ingredients and sums their amounts", () => {
    const shoppingList = buildShoppingListFromSources([
      {
        id: "shopping-rice-1",
        groupId: "pantry",
        groupTitle: "Epicerie",
        ingredient: createRecipeIngredientFromDraftInput({
          id: "ingredient-rice-1",
          displayName: "Riz basmati",
          amount: "180",
          unit: "g",
        }),
        checked: true,
        recipe: {
          recipeId: "recipe-1",
          title: "Poulet citron",
        },
      },
      {
        id: "shopping-rice-2",
        groupId: "pantry",
        groupTitle: "Epicerie",
        ingredient: createRecipeIngredientFromDraftInput({
          id: "ingredient-rice-2",
          displayName: "riz basmati",
          amount: "220",
          unit: "g",
        }),
        checked: false,
        recipe: {
          recipeId: "recipe-2",
          title: "Bol tofu",
        },
      },
    ]);

    expect(shoppingList.groups).toHaveLength(1);
    expect(shoppingList.groups[0].items).toHaveLength(1);
    expect(shoppingList.groups[0].items[0].ingredient.amountValue).toBe(400);
    expect(shoppingList.groups[0].items[0].ingredient.amountText).toBe("400");
    expect(shoppingList.groups[0].items[0].recipes).toEqual([
      { recipeId: "recipe-1", title: "Poulet citron" },
      { recipeId: "recipe-2", title: "Bol tofu" },
    ]);
    expect(shoppingList.groups[0].items[0].checked).toBe(false);
  });

  it("keeps ambiguous ingredients distinct when the amount is not structured", () => {
    const shoppingList = buildShoppingListFromSources([
      {
        id: "shopping-pepper-1",
        groupId: "pantry",
        groupTitle: "Epicerie",
        ingredient: createRecipeIngredientFromDraftInput({
          id: "ingredient-pepper-1",
          displayName: "Poivre noir",
          amount: "au gout",
        }),
        recipe: {
          recipeId: "recipe-1",
          title: "Poulet citron",
        },
      },
      {
        id: "shopping-pepper-2",
        groupId: "pantry",
        groupTitle: "Epicerie",
        ingredient: createRecipeIngredientFromDraftInput({
          id: "ingredient-pepper-2",
          displayName: "poivre noir",
          amount: "au gout",
        }),
        recipe: {
          recipeId: "recipe-2",
          title: "Bol tofu",
        },
      },
    ]);

    expect(shoppingList.groups[0].items).toHaveLength(2);
    expect(shoppingList.groups[0].items[0].ingredient.amountValue).toBeNull();
    expect(shoppingList.groups[0].items[0].ingredient.amountText).toBe(
      "au gout"
    );
    expect(shoppingList.groups[0].items[1].recipes).toEqual([
      { recipeId: "recipe-2", title: "Bol tofu" },
    ]);
  });

  it("does not merge ingredients with unsupported units", () => {
    const shoppingList = buildShoppingListFromSources([
      {
        id: "shopping-yaourt-1",
        groupId: "fresh",
        groupTitle: "Frais",
        ingredient: createRecipeIngredientFromDraftInput({
          id: "ingredient-yaourt-1",
          displayName: "Yaourt grec",
          amount: "1",
          unit: "pot",
        }),
        recipe: {
          recipeId: "recipe-1",
          title: "Poulet citron",
        },
      },
      {
        id: "shopping-yaourt-2",
        groupId: "fresh",
        groupTitle: "Frais",
        ingredient: createRecipeIngredientFromDraftInput({
          id: "ingredient-yaourt-2",
          displayName: "yaourt grec",
          amount: "1",
          unit: "pot",
        }),
        recipe: {
          recipeId: "recipe-2",
          title: "Bol tofu",
        },
      },
    ]);

    expect(shoppingList.groups[0].items).toHaveLength(2);
  });

  it("keeps addition candidates distinct from validated ingredients", () => {
    const shoppingList = buildShoppingListFromSources([
      {
        id: "shopping-citron-1",
        groupId: "produce",
        groupTitle: "Primeur",
        ingredient: createRecipeIngredientFromDraftInput({
          id: "ingredient-citron-1",
          displayName: "Citron jaune",
          amount: "1",
          unit: "piece",
          kind: "validated",
        }),
        recipe: {
          recipeId: "recipe-1",
          title: "Poulet citron",
        },
      },
      {
        id: "shopping-citron-2",
        groupId: "produce",
        groupTitle: "Primeur",
        ingredient: createRecipeIngredientFromDraftInput({
          id: "ingredient-citron-2",
          displayName: "citron jaune",
          amount: "1",
          unit: "piece",
          kind: "addition_candidate",
        }),
        recipe: {
          recipeId: "recipe-2",
          title: "Bol tofu",
        },
      },
    ]);

    expect(shoppingList.groups[0].items).toHaveLength(2);
    expect(shoppingList.groups[0].items[0].ingredient.kind).toBe("validated");
    expect(shoppingList.groups[0].items[1].ingredient.kind).toBe(
      "addition_candidate"
    );
  });
});
