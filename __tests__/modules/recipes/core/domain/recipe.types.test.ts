import {
  createRecipeIngredient,
  formatRecipeIngredientLabel,
  isAdditionCandidateIngredient,
  normalizeRecipeIngredientName,
} from "@/modules/recipes/core/domain/recipe.types";

describe("normalizeRecipeIngredientName", () => {
  it("collapses whitespace and lowercases ingredient names", () => {
    expect(normalizeRecipeIngredientName("  Citron   jaune  ")).toBe(
      "citron jaune"
    );
  });

  it("returns an empty string when the ingredient name is blank", () => {
    expect(normalizeRecipeIngredientName("   ")).toBe("");
  });
});

describe("createRecipeIngredient", () => {
  it("derives a normalized name, amount text and default validated kind", () => {
    const ingredient = createRecipeIngredient({
      id: "ingredient-lemon",
      displayName: "  Citron   jaune  ",
      amountValue: 2,
      unit: " pieces ",
      notes: " zeste + jus ",
    });

    expect(ingredient).toEqual({
      id: "ingredient-lemon",
      displayName: "Citron jaune",
      normalizedName: "citron jaune",
      amountValue: 2,
      amountText: "2",
      unit: "pieces",
      notes: "zeste + jus",
      kind: "validated",
    });
  });

  it("keeps an explicit amount text and addition candidate kind", () => {
    const ingredient = createRecipeIngredient({
      id: "ingredient-sumac",
      displayName: "Sumac",
      amountValue: 0.5,
      amountText: "1/2",
      kind: "addition_candidate",
    });

    expect(ingredient.amountValue).toBe(0.5);
    expect(ingredient.amountText).toBe("1/2");
    expect(ingredient.kind).toBe("addition_candidate");
    expect(isAdditionCandidateIngredient(ingredient)).toBe(true);
  });
});

describe("formatRecipeIngredientLabel", () => {
  it("uses the structured amount, unit and display name fields", () => {
    const ingredient = createRecipeIngredient({
      id: "ingredient-rice",
      displayName: "riz basmati",
      amountText: "180",
      unit: "g",
    });

    expect(formatRecipeIngredientLabel(ingredient)).toBe("180 g riz basmati");
  });

  it("omits empty amount or unit fragments", () => {
    const ingredient = createRecipeIngredient({
      id: "ingredient-coriander",
      displayName: "coriandre",
    });

    expect(formatRecipeIngredientLabel(ingredient)).toBe("coriandre");
  });
});
