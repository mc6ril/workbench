import { promoteRecipeAddition } from "@/modules/recipes/core/usecases/editor/promoteRecipeAddition";

describe("promoteRecipeAddition", () => {
  const editorRepository = {
    getCreationDraft: jest.fn(),
    getDraft: jest.fn(),
    listTagsByProject: jest.fn(),
    promoteAdditionToValidated: jest.fn(),
    createRecipe: jest.fn(),
    updateRecipe: jest.fn(),
  };
  const shoppingRepository = {
    getShoppingList: jest.fn(),
    generateShoppingList: jest.fn(),
    setShoppingListItemChecked: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("promotes the addition and regenerates the shopping list", async () => {
    editorRepository.promoteAdditionToValidated.mockResolvedValueOnce(
      undefined
    );
    shoppingRepository.generateShoppingList.mockResolvedValueOnce({
      groups: [],
      checkedCount: 0,
      pendingCount: 0,
    });

    await promoteRecipeAddition({
      editorRepository,
      shoppingRepository,
    })({
      projectId: "project-1",
      recipeId: "recipe-1",
      ingredientId: "ingredient-1",
    });

    expect(editorRepository.promoteAdditionToValidated).toHaveBeenCalledWith({
      projectId: "project-1",
      recipeId: "recipe-1",
      ingredientId: "ingredient-1",
    });
    expect(shoppingRepository.generateShoppingList).toHaveBeenCalledWith(
      "project-1"
    );
  });
});
