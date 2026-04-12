import { getRecipeDraft } from "@/modules/recipes/core/usecases/editor/getRecipeDraft";

describe("getRecipeDraft", () => {
  it("loads a creation draft when no recipe id is provided", async () => {
    const getCreationDraft = jest.fn().mockResolvedValue({
      id: "draft",
    });
    const getDraft = jest.fn();

    await getRecipeDraft({
      editorRepository: {
        getCreationDraft,
        getDraft,
        listTagsByProject: jest.fn(),
        createRecipe: jest.fn(),
        updateRecipe: jest.fn(),
        promoteAdditionToValidated: jest.fn(),
      },
    })({
      projectId: "project-1",
    });

    expect(getCreationDraft).toHaveBeenCalledWith("project-1");
    expect(getDraft).not.toHaveBeenCalled();
  });

  it("loads an existing draft when a recipe id is provided", async () => {
    const getCreationDraft = jest.fn();
    const getDraft = jest.fn().mockResolvedValue({
      id: "recipe-1",
    });

    await getRecipeDraft({
      editorRepository: {
        getCreationDraft,
        getDraft,
        listTagsByProject: jest.fn(),
        createRecipe: jest.fn(),
        updateRecipe: jest.fn(),
        promoteAdditionToValidated: jest.fn(),
      },
    })({
      projectId: "project-1",
      recipeId: "recipe-1",
    });

    expect(getDraft).toHaveBeenCalledWith("project-1", "recipe-1");
    expect(getCreationDraft).not.toHaveBeenCalled();
  });
});
