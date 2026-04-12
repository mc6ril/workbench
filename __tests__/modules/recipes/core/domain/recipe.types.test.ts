import {
  createRecipeIngredient,
  createRecipeIngredientFromDraftInput,
  formatRecipeIngredientLabel,
  isAdditionCandidateIngredient,
  normalizeRecipeIngredientAmount,
  normalizeRecipeIngredientName,
  normalizeRecipeIngredientUnit,
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
  it("derives a normalized name, amount text and canonical unit", () => {
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
      unit: "piece",
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

describe("normalizeRecipeIngredientAmount", () => {
  it("supports integer, decimal and fractional amounts", () => {
    expect(normalizeRecipeIngredientAmount("2")).toEqual({
      amountValue: 2,
      amountText: "2",
      isStructured: true,
    });

    expect(normalizeRecipeIngredientAmount("2.5")).toEqual({
      amountValue: 2.5,
      amountText: "2.5",
      isStructured: true,
    });

    expect(normalizeRecipeIngredientAmount("1 / 2")).toEqual({
      amountValue: 0.5,
      amountText: "1/2",
      isStructured: true,
    });
  });

  it("falls back to amount text when the quantity is not structured", () => {
    expect(normalizeRecipeIngredientAmount("au gout")).toEqual({
      amountValue: null,
      amountText: "au gout",
      isStructured: false,
    });
  });
});

describe("normalizeRecipeIngredientUnit", () => {
  it("maps common aliases to the v1 unit list", () => {
    expect(normalizeRecipeIngredientUnit(" C. a s. ")).toBe("cs");
    expect(normalizeRecipeIngredientUnit("Pieces")).toBe("piece");
  });

  it("keeps unknown units as normalized free text", () => {
    expect(normalizeRecipeIngredientUnit("Sachet")).toBe("sachet");
  });
});

describe("createRecipeIngredientFromDraftInput", () => {
  it("keeps display name and normalized name separated", () => {
    const ingredient = createRecipeIngredientFromDraftInput({
      id: "ingredient-sumac",
      displayName: "  Sumac fumee  ",
      amount: "1/2",
      unit: "cc",
      kind: "addition_candidate",
    });

    expect(ingredient.displayName).toBe("Sumac fumee");
    expect(ingredient.normalizedName).toBe("sumac fumee");
    expect(ingredient.amountValue).toBe(0.5);
    expect(ingredient.amountText).toBe("1/2");
    expect(ingredient.unit).toBe("cc");
  });

  it("preserves amountText when the amount cannot be structured", () => {
    const ingredient = createRecipeIngredientFromDraftInput({
      id: "ingredient-pepper",
      displayName: "Poivre noir",
      amount: "au gout",
    });

    expect(ingredient.amountValue).toBeNull();
    expect(ingredient.amountText).toBe("au gout");
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
