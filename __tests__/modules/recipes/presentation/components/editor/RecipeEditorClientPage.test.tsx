import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import { useAppRouter } from "@/shared/navigation/useAppRouter";

import type { SaveRecipeEditorInput } from "@/modules/recipes/core/domain/editor/recipeEditor.types";
import RecipeEditorClientPage from "@/modules/recipes/presentation/components/editor/RecipeEditorClientPage";
import { useCreateRecipe } from "@/modules/recipes/presentation/hooks/editor/useCreateRecipe";
import {
  getCreateRecipeLocalDraftStorageKey,
  saveCreateRecipeLocalDraft,
} from "@/modules/recipes/presentation/hooks/editor/useCreateRecipeLocalDraft";
import { useUpdateRecipe } from "@/modules/recipes/presentation/hooks/editor/useUpdateRecipe";
import { useUploadRecipeCover } from "@/modules/recipes/presentation/hooks/editor/useUploadRecipeCover";

jest.mock("@/modules/recipes/presentation/actions/editor", () => ({
  revalidateRecipeDetailCache: jest.fn().mockResolvedValue(undefined),
}));

jest.mock(
  "@/modules/recipes/presentation/hooks/editor/useCreateRecipe",
  () => ({
    useCreateRecipe: jest.fn(),
  })
);

jest.mock(
  "@/modules/recipes/presentation/hooks/editor/useUpdateRecipe",
  () => ({
    useUpdateRecipe: jest.fn(),
  })
);

jest.mock(
  "@/modules/recipes/presentation/hooks/editor/useUploadRecipeCover",
  () => ({
    useUploadRecipeCover: jest.fn(),
  })
);

jest.mock("@/shared/navigation/useAppRouter", () => ({
  useAppRouter: jest.fn(),
}));

const PROJECT_ID = "11111111-1111-4111-8111-111111111111";
const CREATED_RECIPE_ID = "22222222-2222-4222-8222-222222222222";
const mockPush = jest.fn();
const mockCreateRecipeMutateAsync = jest.fn();

const baseDraft = {
  id: null,
  title: "",
  summary: "",
  totalTimeMinutes: null,
  totalTimeLabel: "",
  servingsCount: null,
  servingsLabel: "",
  seasonalMonths: [],
  tags: [],
  ingredients: [],
  steps: [],
  note: null,
  coverImageUrl: null,
};

const createPersistedValues = (
  overrides: Partial<SaveRecipeEditorInput> = {}
): SaveRecipeEditorInput => ({
  projectId: PROJECT_ID,
  title: "Poulet citron",
  summary: "",
  servingsCount: "",
  totalTimeMinutes: "",
  coverImageUrl: "",
  note: "",
  seasonalMonths: [],
  tags: [],
  validatedIngredients: [
    {
      amount: "",
      unit: "",
      displayName: "Poulet",
      notes: "",
    },
  ],
  additionIngredients: [],
  steps: [
    {
      instruction: "Cuire doucement.",
      meta: "",
    },
  ],
  ...overrides,
});

describe("RecipeEditorClientPage local draft", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    window.localStorage.clear();

    jest.mocked(useAppRouter).mockReturnValue({
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
      push: mockPush,
      refresh: jest.fn(),
      replace: jest.fn(),
    });

    jest.mocked(useCreateRecipe).mockReturnValue({
      isPending: false,
      mutateAsync: mockCreateRecipeMutateAsync,
    } as unknown as ReturnType<typeof useCreateRecipe>);

    jest.mocked(useUpdateRecipe).mockReturnValue({
      isPending: false,
      mutateAsync: jest.fn(),
    } as unknown as ReturnType<typeof useUpdateRecipe>);

    jest.mocked(useUploadRecipeCover).mockReturnValue({
      isPending: false,
      mutateAsync: jest.fn(),
    } as unknown as ReturnType<typeof useUploadRecipeCover>);

    mockCreateRecipeMutateAsync.mockResolvedValue({
      id: CREATED_RECIPE_ID,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("restores the local draft on reload and surfaces the draft status", async () => {
    saveCreateRecipeLocalDraft(
      createPersistedValues({
        title: "Poulet citron retrouve",
      })
    );

    render(
      <RecipeEditorClientPage
        projectId={PROJECT_ID}
        mode="create"
        draft={baseDraft}
        availableTags={[]}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Titre")).toHaveValue(
        "Poulet citron retrouve"
      );
    });

    expect(screen.getByText("Brouillon local")).toBeInTheDocument();
    expect(
      screen.getByText(
        'Appuyez sur le bouton "Créer la recette" tout en bas pour l’enregistrer.'
      )
    ).toBeInTheDocument();
  });

  it("adds ingredients and steps quickly with the Enter key and hides the step marker field", () => {
    render(
      <RecipeEditorClientPage
        projectId={PROJECT_ID}
        mode="create"
        draft={baseDraft}
        availableTags={[]}
      />
    );

    const ingredientInputs = screen.getAllByLabelText("Ingrédient");
    fireEvent.change(ingredientInputs[0], {
      target: { value: "Carottes" },
    });
    fireEvent.keyDown(ingredientInputs[0], {
      key: "Enter",
      code: "Enter",
    });

    expect(screen.getAllByLabelText("Ingrédient")).toHaveLength(2);

    const stepInput = screen.getByLabelText("Instruction");
    fireEvent.change(stepInput, {
      target: { value: "Mélanger." },
    });
    fireEvent.keyDown(stepInput, {
      key: "Enter",
      code: "Enter",
    });

    expect(screen.getAllByLabelText("Instruction")).toHaveLength(2);
    expect(screen.queryByLabelText("Repère")).not.toBeInTheDocument();
  });

  it("offers default filter tags alongside custom project tags", () => {
    render(
      <RecipeEditorClientPage
        projectId={PROJECT_ID}
        mode="create"
        draft={baseDraft}
        availableTags={[
          {
            id: "tag-1",
            label: "Batch cooking",
            slug: "batch-cooking",
          },
        ]}
      />
    );

    expect(screen.getByRole("button", { name: "Express" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Batch cooking" })
    ).toBeInTheDocument();
  });

  it("autosaves locally and clears the draft after a successful creation", async () => {
    render(
      <RecipeEditorClientPage
        projectId={PROJECT_ID}
        mode="create"
        draft={baseDraft}
        availableTags={[]}
      />
    );

    fireEvent.change(screen.getByLabelText("Titre"), {
      target: { value: "Gratin rapide" },
    });
    fireEvent.change(screen.getAllByLabelText("Ingrédient")[0], {
      target: { value: "Pommes de terre" },
    });
    fireEvent.change(screen.getByLabelText("Instruction"), {
      target: { value: "Enfourner 30 minutes." },
    });

    await act(async () => {
      jest.advanceTimersByTime(850);
    });

    const storageKey = getCreateRecipeLocalDraftStorageKey(PROJECT_ID);
    const savedDraft = window.localStorage.getItem(storageKey);

    expect(savedDraft).not.toBeNull();
    expect(savedDraft).toContain("Gratin rapide");

    fireEvent.click(screen.getByRole("button", { name: "Créer la recette" }));

    await waitFor(() => {
      expect(mockCreateRecipeMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: PROJECT_ID,
          title: "Gratin rapide",
        })
      );
    });

    await waitFor(() => {
      expect(window.localStorage.getItem(storageKey)).toBeNull();
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining(CREATED_RECIPE_ID)
      );
    });
  });
});
