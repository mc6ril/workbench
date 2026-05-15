import { listActiveSelections } from "@/modules/recipes/core/usecases/planner/listActiveSelections";
import { markAsCooked } from "@/modules/recipes/core/usecases/planner/markAsCooked";
import { markShoppingDone } from "@/modules/recipes/core/usecases/planner/markShoppingDone";
import { removeSelection } from "@/modules/recipes/core/usecases/planner/removeSelection";
import { selectRecipe } from "@/modules/recipes/core/usecases/planner/selectRecipe";

describe("Recipes planner use cases", () => {
  const plannerRepository = {
    listActiveSelections: jest.fn(),
    selectRecipe: jest.fn(),
    markShoppingDone: jest.fn(),
    markAsCooked: jest.fn(),
    removeSelection: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates active selection listing to the planner repository", async () => {
    plannerRepository.listActiveSelections.mockResolvedValueOnce([]);

    await listActiveSelections({
      plannerRepository,
    })("project-1");

    expect(plannerRepository.listActiveSelections).toHaveBeenCalledWith(
      "project-1"
    );
  });

  it("delegates recipe selection to the planner repository", async () => {
    plannerRepository.selectRecipe.mockResolvedValueOnce(null);

    await selectRecipe({
      plannerRepository,
    })({
      projectId: "project-1",
      recipeId: "recipe-1",
    });

    expect(plannerRepository.selectRecipe).toHaveBeenCalledWith({
      projectId: "project-1",
      recipeId: "recipe-1",
    });
  });

  it("delegates shopping done transition to the planner repository", async () => {
    plannerRepository.markShoppingDone.mockResolvedValueOnce(null);

    await markShoppingDone({
      plannerRepository,
    })({
      projectId: "project-1",
      selectionId: "selection-1",
    });

    expect(plannerRepository.markShoppingDone).toHaveBeenCalledWith({
      projectId: "project-1",
      selectionId: "selection-1",
    });
  });

  it("delegates cooked transition to the planner repository", async () => {
    plannerRepository.markAsCooked.mockResolvedValueOnce(null);

    await markAsCooked({
      plannerRepository,
    })({
      projectId: "project-1",
      selectionId: "selection-1",
    });

    expect(plannerRepository.markAsCooked).toHaveBeenCalledWith({
      projectId: "project-1",
      selectionId: "selection-1",
    });
  });

  it("delegates removal to the planner repository", async () => {
    plannerRepository.removeSelection.mockResolvedValueOnce(undefined);

    await removeSelection({
      plannerRepository,
    })({
      projectId: "project-1",
      selectionId: "selection-1",
    });

    expect(plannerRepository.removeSelection).toHaveBeenCalledWith({
      projectId: "project-1",
      selectionId: "selection-1",
    });
  });
});
