import { ZodError } from "zod";

import { resolveRecipeCoverStyle } from "@/modules/recipes/core/domain/editor/recipeEditor.helpers";
import { normalizeRecipeEditorSubmission } from "@/modules/recipes/core/usecases/editor/saveRecipe";

describe("normalizeRecipeEditorSubmission", () => {
  it("normalizes tags, ingredients, additions and steps for persistence", () => {
    const result = normalizeRecipeEditorSubmission({
      projectId: "11111111-1111-4111-8111-111111111111",
      title: "  Poulet citron & riz pilaf  ",
      summary: "  Un diner simple et rassurant. ",
      servingsCount: "2",
      totalTimeMinutes: "35",
      coverImageUrl: "https://example.com/recipe.jpg",
      note: "  Tester le sumac sur une seule portion. ",
      tags: [
        { label: " Rapide " },
        { label: "rapide" },
        { label: "Poulet roti" },
      ],
      validatedIngredients: [
        { amount: "", unit: "", displayName: "", notes: "" },
        {
          amount: "1/2",
          unit: "c. a s.",
          displayName: "Citron jaune",
          notes: "zeste + jus",
        },
        {
          amount: "180",
          unit: "g",
          displayName: "riz basmati",
          notes: "",
        },
      ],
      additionIngredients: [
        {
          amount: "au gout",
          unit: "",
          displayName: "sumac",
          notes: "a valider",
        },
      ],
      steps: [
        { instruction: "", meta: "" },
        {
          instruction: "  Lancer le riz avec 300 ml d'eau. ",
          meta: "Base",
        },
      ],
    });

    expect(result.title).toBe("Poulet citron & riz pilaf");
    expect(result.summary).toBe("Un diner simple et rassurant.");
    expect(result.servingsCount).toBe(2);
    expect(result.servingsLabel).toBe("2 portions");
    expect(result.totalTimeMinutes).toBe(35);
    expect(result.totalTimeLabel).toBe("35 min");
    expect(result.coverImageUrl).toBe("https://example.com/recipe.jpg");
    expect(result.coverStyle).toBe(
      resolveRecipeCoverStyle("Poulet citron & riz pilaf")
    );
    expect(result.note).toBe("Tester le sumac sur une seule portion.");
    expect(result.tags).toEqual([
      { label: "Poulet roti", slug: "poulet-roti" },
      { label: "Rapide", slug: "rapide" },
    ]);
    expect(result.ingredients).toEqual([
      expect.objectContaining({
        position: 1,
        displayName: "Citron jaune",
        normalizedName: "citron jaune",
        amountText: "1/2",
        amountValue: 0.5,
        unit: "cs",
        notes: "zeste + jus",
        kind: "validated",
      }),
      expect.objectContaining({
        position: 2,
        displayName: "riz basmati",
        amountText: "180",
        amountValue: 180,
        unit: "g",
        kind: "validated",
      }),
      expect.objectContaining({
        position: 3,
        displayName: "sumac",
        amountText: "au gout",
        amountValue: null,
        unit: null,
        kind: "addition_candidate",
      }),
    ]);
    expect(result.steps).toEqual([
      {
        position: 1,
        title: null,
        instruction: "Lancer le riz avec 300 ml d'eau.",
        notes: null,
        meta: "Base",
      },
    ]);
  });

  it("rejects a submission without validated ingredients", () => {
    expect(() =>
      normalizeRecipeEditorSubmission({
        projectId: "11111111-1111-4111-8111-111111111111",
        title: "Recette test",
        summary: "",
        servingsCount: "",
        totalTimeMinutes: "",
        coverImageUrl: "",
        note: "",
        tags: [],
        validatedIngredients: [
          { amount: "", unit: "", displayName: "", notes: "" },
        ],
        additionIngredients: [
          {
            amount: "1",
            unit: "piece",
            displayName: "sumac",
            notes: "",
          },
        ],
        steps: [{ instruction: "Melanger.", meta: "" }],
      })
    ).toThrow(ZodError);
  });

  it("rejects an invalid cover image URL", () => {
    expect(() =>
      normalizeRecipeEditorSubmission({
        projectId: "11111111-1111-4111-8111-111111111111",
        title: "Recette test",
        summary: "",
        servingsCount: "",
        totalTimeMinutes: "",
        coverImageUrl: "pas-une-url",
        note: "",
        tags: [],
        validatedIngredients: [
          {
            amount: "1",
            unit: "piece",
            displayName: "citron",
            notes: "",
          },
        ],
        additionIngredients: [],
        steps: [{ instruction: "Melanger.", meta: "" }],
      })
    ).toThrow("L'image doit etre une URL complete.");
  });

  it("builds the servings label from the servings count", () => {
    const result = normalizeRecipeEditorSubmission({
      projectId: "11111111-1111-4111-8111-111111111111",
      title: "Recette test",
      summary: "",
      servingsCount: "4",
      totalTimeMinutes: "",
      coverImageUrl: "",
      note: "",
      tags: [],
      validatedIngredients: [
        {
          amount: "1",
          unit: "piece",
          displayName: "citron",
          notes: "",
        },
      ],
      additionIngredients: [],
      steps: [{ instruction: "Melanger.", meta: "" }],
    });

    expect(result.servingsCount).toBe(4);
    expect(result.servingsLabel).toBe("4 portions");
  });
});
