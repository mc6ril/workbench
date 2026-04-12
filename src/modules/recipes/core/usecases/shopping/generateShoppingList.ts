import type { ShoppingRepository } from "@/modules/recipes/core/ports/shopping/shoppingRepository";

type Dependencies = {
  shoppingRepository: ShoppingRepository;
};

export const generateShoppingList =
  ({ shoppingRepository }: Dependencies) =>
  (projectId: string) => {
    return shoppingRepository.generateShoppingList(projectId);
  };
