import type { SetShoppingListItemCheckedInput } from "@/modules/recipes/core/domain/shopping/shoppingList.types";
import type { ShoppingRepository } from "@/modules/recipes/core/ports/shopping/shoppingRepository";

type Dependencies = {
  shoppingRepository: ShoppingRepository;
};

export const setShoppingListItemChecked =
  ({ shoppingRepository }: Dependencies) =>
  (input: SetShoppingListItemCheckedInput) => {
    return shoppingRepository.setShoppingListItemChecked(input);
  };
