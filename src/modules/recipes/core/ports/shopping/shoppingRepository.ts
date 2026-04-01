import type { ShoppingList } from "@/modules/recipes/core/domain/shopping/shoppingList.types";

export type ShoppingRepository = {
  getShoppingList: (projectId: string) => Promise<ShoppingList>;
};
