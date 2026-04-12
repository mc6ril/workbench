import { generateShoppingList } from "@/modules/recipes/core/usecases/shopping/generateShoppingList";
import { getShoppingList } from "@/modules/recipes/core/usecases/shopping/getShoppingList";
import { setShoppingListItemChecked } from "@/modules/recipes/core/usecases/shopping/setShoppingListItemChecked";

describe("Recipes shopping use cases", () => {
  const shoppingRepository = {
    getShoppingList: jest.fn(),
    generateShoppingList: jest.fn(),
    setShoppingListItemChecked: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates shopping list reading to the shopping repository", async () => {
    shoppingRepository.getShoppingList.mockResolvedValueOnce({
      groups: [],
      checkedCount: 0,
      pendingCount: 0,
    });

    await getShoppingList({
      shoppingRepository,
    })("project-1");

    expect(shoppingRepository.getShoppingList).toHaveBeenCalledWith("project-1");
  });

  it("delegates shopping list generation to the shopping repository", async () => {
    shoppingRepository.generateShoppingList.mockResolvedValueOnce({
      groups: [],
      checkedCount: 0,
      pendingCount: 0,
    });

    await generateShoppingList({
      shoppingRepository,
    })("project-1");

    expect(shoppingRepository.generateShoppingList).toHaveBeenCalledWith(
      "project-1"
    );
  });

  it("delegates checked state updates to the shopping repository", async () => {
    shoppingRepository.setShoppingListItemChecked.mockResolvedValueOnce(undefined);

    await setShoppingListItemChecked({
      shoppingRepository,
    })({
      projectId: "project-1",
      itemId: "item-1",
      checked: true,
    });

    expect(shoppingRepository.setShoppingListItemChecked).toHaveBeenCalledWith({
      projectId: "project-1",
      itemId: "item-1",
      checked: true,
    });
  });
});
