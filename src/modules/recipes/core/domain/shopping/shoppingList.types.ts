import type {
  RecipeIngredient,
  RecipeSelection,
} from "@/modules/recipes/core/domain/recipe.types";

export type ShoppingListItem = {
  id: string;
  ingredient: RecipeIngredient;
  checked: boolean;
  recipes: Array<Pick<RecipeSelection, "recipeId" | "title">>;
};

export type ShoppingListGroup = {
  id: string;
  title: string;
  items: ShoppingListItem[];
};

export type ShoppingList = {
  groups: ShoppingListGroup[];
  checkedCount: number;
  pendingCount: number;
};

export type SetShoppingListItemCheckedInput = {
  projectId: string;
  itemId: string;
  checked: boolean;
};

export const buildShoppingList = (
  groups: ShoppingListGroup[]
): ShoppingList => {
  const items = groups.flatMap((group) => group.items);
  const checkedCount = items.filter((item) => item.checked).length;

  return {
    groups,
    checkedCount,
    pendingCount: items.length - checkedCount,
  };
};
