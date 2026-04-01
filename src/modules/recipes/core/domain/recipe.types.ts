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

const normalizeOptionalText = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const normalized = value.trim().replace(/\s+/g, " ");

  return normalized || null;
};

export const normalizeRecipeIngredientName = (value: string): string => {
  const normalized = normalizeOptionalText(value);

  return normalized ? normalized.toLocaleLowerCase() : "";
};

export const resolveRecipeIngredientAmountText = ({
  amountValue,
  amountText,
}: Pick<CreateRecipeIngredientInput, "amountValue" | "amountText">): string | null => {
  const normalizedAmountText = normalizeOptionalText(amountText);

  if (normalizedAmountText) {
    return normalizedAmountText;
  }

  if (amountValue === undefined || amountValue === null) {
    return null;
  }

  return amountValue.toString();
};

export const createRecipeIngredient = (
  input: CreateRecipeIngredientInput
): RecipeIngredient => {
  const displayName = normalizeOptionalText(input.displayName) ?? "";

  return {
    id: input.id,
    displayName,
    normalizedName:
      normalizeOptionalText(input.normalizedName) ??
      normalizeRecipeIngredientName(displayName),
    amountValue: input.amountValue ?? null,
    amountText: resolveRecipeIngredientAmountText(input),
    unit: normalizeOptionalText(input.unit),
    notes: normalizeOptionalText(input.notes),
    kind: input.kind ?? "validated",
  };
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
