import { listActiveSelections } from "@/modules/recipes/core/usecases/planner/listActiveSelections";
import { markSelectionDone } from "@/modules/recipes/core/usecases/planner/markSelectionDone";
import { removeSelection } from "@/modules/recipes/core/usecases/planner/removeSelection";
import { selectRecipe } from "@/modules/recipes/core/usecases/planner/selectRecipe";

describe("Recipes planner use cases", () => {
  const plannerRepository = {
    listActiveSelections: jest.fn(),
    selectRecipe: jest.fn(),
    markSelectionDone: jest.fn(),
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

  it("delegates done transitions to the planner repository", async () => {
    plannerRepository.markSelectionDone.mockResolvedValueOnce(null);

    await markSelectionDone({
      plannerRepository,
    })({
      projectId: "project-1",
      selectionId: "selection-1",
    });

    expect(plannerRepository.markSelectionDone).toHaveBeenCalledWith({
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
