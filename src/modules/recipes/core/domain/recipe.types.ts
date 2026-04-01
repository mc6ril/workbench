import {
  formatRecipeIngredientAmountValue,
  normalizeRecipeIngredientAmount,
  normalizeRecipeIngredientName,
  normalizeRecipeIngredientText,
  normalizeRecipeIngredientUnit,
} from "@/modules/recipes/core/domain/ingredientFormat";

export const RECIPE_INGREDIENT_KIND_VALUES = [
  "validated",
  "addition_candidate",
] as const;

export type RecipeIngredientKind =
  (typeof RECIPE_INGREDIENT_KIND_VALUES)[number];

export type RecipeIngredient = {
  id: string;
  displayName: string;
  normalizedName: string;
  amountValue: number | null;
  amountText: string | null;
  unit: string | null;
  notes: string | null;
  kind: RecipeIngredientKind;
};

export type RecipeTag = {
  id: string;
  label: string;
  slug: string;
};

export type RecipeStep = {
  id: string;
  position: number;
  title: string | null;
  instruction: string;
  notes: string | null;
  meta: string | null;
};

export type Recipe = {
  id: string;
  title: string;
  summary: string;
  totalTimeMinutes: number | null;
  totalTimeLabel: string;
  servingsCount: number | null;
  servingsLabel: string;
  tags: RecipeTag[];
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  note: string | null;
  coverImageUrl: string | null;
};

export type RecipeSelection = {
  id: string;
  recipeId: string;
  title: string;
  note: string | null;
  servingsCount: number | null;
  servingsLabel: string;
};

type CreateRecipeIngredientInput = {
  id: string;
  displayName: string;
  normalizedName?: string | null;
  amountValue?: number | null;
  amountText?: string | null;
  unit?: string | null;
  notes?: string | null;
  kind?: RecipeIngredientKind;
};

export type CreateRecipeIngredientFromDraftInput = {
  id: string;
  displayName: string;
  amount?: string | null;
  unit?: string | null;
  notes?: string | null;
  kind?: RecipeIngredientKind;
};

export const resolveRecipeIngredientAmountText = ({
  amountValue,
  amountText,
}: Pick<CreateRecipeIngredientInput, "amountValue" | "amountText">): string | null => {
  const normalizedAmountText =
    normalizeRecipeIngredientAmount(amountText).amountText;

  if (normalizedAmountText) {
    return normalizedAmountText;
  }

  if (amountValue === undefined || amountValue === null) {
    return null;
  }

  return formatRecipeIngredientAmountValue(amountValue);
};

export const createRecipeIngredient = (
  input: CreateRecipeIngredientInput
): RecipeIngredient => {
  const displayName = normalizeRecipeIngredientText(input.displayName) ?? "";

  return {
    id: input.id,
    displayName,
    normalizedName:
      normalizeRecipeIngredientName(input.normalizedName ?? displayName),
    amountValue: input.amountValue ?? null,
    amountText: resolveRecipeIngredientAmountText(input),
    unit: normalizeRecipeIngredientUnit(input.unit),
    notes: normalizeRecipeIngredientText(input.notes),
    kind: input.kind ?? "validated",
  };
};

export const createRecipeIngredientFromDraftInput = (
  input: CreateRecipeIngredientFromDraftInput
): RecipeIngredient => {
  const normalizedAmount = normalizeRecipeIngredientAmount(input.amount);

  return createRecipeIngredient({
    id: input.id,
    displayName: input.displayName,
    amountValue: normalizedAmount.amountValue,
    amountText: normalizedAmount.amountText,
    unit: input.unit,
    notes: input.notes,
    kind: input.kind,
  });
};

export const formatRecipeIngredientLabel = (
  ingredient: Pick<RecipeIngredient, "amountText" | "unit" | "displayName">
): string => {
  return [ingredient.amountText, ingredient.unit, ingredient.displayName]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" ");
};

export const isAdditionCandidateIngredient = (
  ingredient: Pick<RecipeIngredient, "kind">
): boolean => {
  return ingredient.kind === "addition_candidate";
};

export {
  formatRecipeIngredientAmountValue,
  isRecipeIngredientUnitSupported,
  type NormalizedRecipeIngredientAmount,
  normalizeRecipeIngredientAmount,
  normalizeRecipeIngredientName,
  normalizeRecipeIngredientUnit,
  RECIPE_INGREDIENT_UNIT_VALUES,
  type RecipeIngredientUnit,
} from "@/modules/recipes/core/domain/ingredientFormat";
