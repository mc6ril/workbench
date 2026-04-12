import type { ShoppingList } from "@/modules/recipes/core/domain/shopping/shoppingList.types";
import type { SetShoppingListItemCheckedInput } from "@/modules/recipes/core/domain/shopping/shoppingList.types";

export type ShoppingRepository = {
  getShoppingList: (projectId: string) => Promise<ShoppingList>;
  generateShoppingList: (projectId: string) => Promise<ShoppingList>;
  setShoppingListItemChecked: (
    input: SetShoppingListItemCheckedInput
  ) => Promise<void>;
};
