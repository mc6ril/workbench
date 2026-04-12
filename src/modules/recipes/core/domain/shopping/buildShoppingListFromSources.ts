import {
  createRecipeIngredient,
  formatRecipeIngredientAmountValue,
  isRecipeIngredientUnitSupported,
  type RecipeIngredient,
  type RecipeSelection,
} from "@/modules/recipes/core/domain/recipe.types";
import { compareShoppingGroupIds } from "@/modules/recipes/core/domain/shopping/shoppingGrouping";
import {
  buildShoppingList,
  type ShoppingList,
  type ShoppingListItem,
} from "@/modules/recipes/core/domain/shopping/shoppingList.types";

export type ShoppingListIngredientSource = {
  id: string;
  groupId: string;
  groupTitle: string;
  ingredient: RecipeIngredient;
  checked?: boolean;
  recipe: Pick<RecipeSelection, "recipeId" | "title">;
};

export const canMergeShoppingIngredient = (
  ingredient: RecipeIngredient
): boolean => {
  return (
    ingredient.amountValue !== null &&
    Boolean(ingredient.normalizedName) &&
    Boolean(ingredient.unit) &&
    isRecipeIngredientUnitSupported(ingredient.unit)
  );
};

export const buildShoppingIngredientMergeKey = (
  source: Pick<ShoppingListIngredientSource, "groupId" | "ingredient">
): string => {
  return [
    source.groupId,
    source.ingredient.kind,
    source.ingredient.unit,
    source.ingredient.normalizedName,
  ].join("::");
};

const appendRecipeReference = (
  item: ShoppingListItem,
  recipe: ShoppingListIngredientSource["recipe"]
) => {
  if (item.recipes.some((entry) => entry.recipeId === recipe.recipeId)) {
    return;
  }

  item.recipes.push(recipe);
};

export const buildShoppingListFromSources = (
  sources: ShoppingListIngredientSource[]
): ShoppingList => {
  const groups = new Map<
    string,
    {
      id: string;
      title: string;
      items: ShoppingListItem[];
    }
  >();
  const mergeableItems = new Map<string, ShoppingListItem>();

  const getOrCreateGroup = (
    source: ShoppingListIngredientSource
  ): { id: string; title: string; items: ShoppingListItem[] } => {
    const existingGroup = groups.get(source.groupId);

    if (existingGroup) {
      return existingGroup;
    }

    const newGroup = {
      id: source.groupId,
      title: source.groupTitle,
      items: [],
    };

    groups.set(source.groupId, newGroup);

    return newGroup;
  };

  sources.forEach((source) => {
    const group = getOrCreateGroup(source);

    if (canMergeShoppingIngredient(source.ingredient)) {
      const mergeKey = buildShoppingIngredientMergeKey(source);
      const existingItem = mergeableItems.get(mergeKey);

      if (existingItem) {
        const mergedAmountValue =
          (existingItem.ingredient.amountValue ?? 0) +
          source.ingredient.amountValue!;

        existingItem.ingredient = createRecipeIngredient({
          id: existingItem.ingredient.id,
          displayName: existingItem.ingredient.displayName,
          normalizedName: existingItem.ingredient.normalizedName,
          amountValue: mergedAmountValue,
          amountText: formatRecipeIngredientAmountValue(mergedAmountValue),
          unit: existingItem.ingredient.unit,
          notes: existingItem.ingredient.notes,
          kind: existingItem.ingredient.kind,
        });
        existingItem.checked = existingItem.checked && Boolean(source.checked);
        appendRecipeReference(existingItem, source.recipe);
        return;
      }

      const newItem: ShoppingListItem = {
        id: source.id,
        ingredient: source.ingredient,
        checked: Boolean(source.checked),
        recipes: [source.recipe],
      };

      group.items.push(newItem);
      mergeableItems.set(mergeKey, newItem);
      return;
    }

    group.items.push({
      id: source.id,
      ingredient: source.ingredient,
      checked: Boolean(source.checked),
      recipes: [source.recipe],
    });
  });

  return buildShoppingList(
    Array.from(groups.values()).sort((leftGroup, rightGroup) =>
      compareShoppingGroupIds(leftGroup.id, rightGroup.id)
    )
  );
};
