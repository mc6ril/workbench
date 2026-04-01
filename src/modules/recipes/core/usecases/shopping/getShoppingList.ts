import type { ShoppingRepository } from "@/modules/recipes/core/ports/shopping/shoppingRepository";

type Dependencies = {
  shoppingRepository: ShoppingRepository;
};

export const getShoppingList =
  ({ shoppingRepository }: Dependencies) =>
  (projectId: string) => {
    return shoppingRepository.getShoppingList(projectId);
  };
