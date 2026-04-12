import type { PromoteRecipeAdditionInput } from "@/modules/recipes/core/domain/editor/recipeEditor.types";
import type { EditorRepository } from "@/modules/recipes/core/ports/editor/editorRepository";
import type { ShoppingRepository } from "@/modules/recipes/core/ports/shopping/shoppingRepository";

type Dependencies = {
  editorRepository: EditorRepository;
  shoppingRepository: ShoppingRepository;
};

export const promoteRecipeAddition =
  ({ editorRepository, shoppingRepository }: Dependencies) =>
  async (input: PromoteRecipeAdditionInput) => {
    await editorRepository.promoteAdditionToValidated(input);
    await shoppingRepository.generateShoppingList(input.projectId);
  };
