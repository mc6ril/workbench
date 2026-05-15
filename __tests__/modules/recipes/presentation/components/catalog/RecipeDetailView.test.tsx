import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import RecipeDetailView from "@/modules/recipes/presentation/components/catalog/RecipeDetailView";

const baseRecipe = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Poulet citron",
  summary: "Une recette simple et rapide.",
  totalTimeLabel: "35 min",
  totalTimeMinutes: 35,
  servingsLabel: "4 personnes",
  servingsCount: 4,
  coverImageUrl: null,
  note: "Bien saisir avant d'ajouter le bouillon.",
  coverStyle: "citrus" as const,
  isInQuickList: true,
  tags: [
    {
      id: "tag-1",
      label: "Rapide",
      slug: "rapide",
    },
    {
      id: "tag-2",
      label: "Batch cooking",
      slug: "batch-cooking",
    },
  ],
  ingredients: [
    {
      id: "ingredient-1",
      displayName: "riz",
      normalizedName: "riz",
      amountValue: 250,
      amountText: "250",
      unit: "g",
      notes: "Rincer avant cuisson",
      kind: "validated" as const,
    },
    {
      id: "ingredient-2",
      displayName: "citron confit",
      normalizedName: "citron confit",
      amountValue: 1,
      amountText: "1",
      unit: null,
      notes: "Tester en fin de cuisson",
      kind: "addition_candidate" as const,
    },
  ],
  steps: [
    {
      id: "step-1",
      position: 1,
      title: "Preparer la base",
      instruction: "Faire revenir l'oignon dans l'huile d'olive.",
      notes: "Feu moyen.",
      meta: "5 min",
    },
    {
      id: "step-2",
      position: 2,
      title: null,
      instruction: "Ajouter le bouillon puis laisser mijoter.",
      notes: null,
      meta: "20 min",
    },
  ],
};

describe("RecipeDetailView", () => {
  it("renders the recipe detail layout with tags, additions, ingredients and steps", () => {
    render(
      <RecipeDetailView
        recipe={baseRecipe}
        canValidateAdditions
        isValidationPending={false}
        onValidateAddition={jest.fn()}
      />
    );

    expect(screen.getByText("Rapide")).toBeInTheDocument();
    expect(screen.getByText("Batch cooking")).toBeInTheDocument();
    expect(screen.getByText("A tester")).toBeInTheDocument();
    expect(screen.getByText("Ingrédients")).toBeInTheDocument();
    expect(screen.getByText("250 g riz")).toBeInTheDocument();
    expect(screen.getByText("Preparer la base")).toBeInTheDocument();
  });

  it("delegates addition validation through the provided handler", async () => {
    const onValidateAddition = jest.fn().mockResolvedValue(undefined);

    render(
      <RecipeDetailView
        recipe={baseRecipe}
        canValidateAdditions
        isValidationPending={false}
        onValidateAddition={onValidateAddition}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Valider cet ajout" }));

    await waitFor(() => {
      expect(onValidateAddition).toHaveBeenCalledWith("ingredient-2");
    });
  });
});
