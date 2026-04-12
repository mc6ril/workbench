const normalizeRecipeIngredientText = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const normalized = value.trim().replace(/\s+/g, " ");

  return normalized || null;
};

const normalizeLookupText = (value: string): string => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLocaleLowerCase();
};

export const RECIPE_INGREDIENT_UNIT_VALUES = [
  "g",
  "kg",
  "ml",
  "cl",
  "l",
  "piece",
  "botte",
  "cs",
  "cc",
] as const;

export type RecipeIngredientUnit =
  (typeof RECIPE_INGREDIENT_UNIT_VALUES)[number];

const RECIPE_INGREDIENT_UNIT_LOOKUP: Record<string, RecipeIngredientUnit> = {
  g: "g",
  gramme: "g",
  grammes: "g",
  gr: "g",
  kg: "kg",
  kilo: "kg",
  kilos: "kg",
  ml: "ml",
  cl: "cl",
  l: "l",
  litre: "l",
  litres: "l",
  piece: "piece",
  pieces: "piece",
  botte: "botte",
  bottes: "botte",
  cs: "cs",
  "c a s": "cs",
  "c a soupe": "cs",
  "cuillere a soupe": "cs",
  "cuilleres a soupe": "cs",
  cc: "cc",
  "c a c": "cc",
  "c a cafe": "cc",
  "cuillere a cafe": "cc",
  "cuilleres a cafe": "cc",
};

export type NormalizedRecipeIngredientAmount = {
  amountValue: number | null;
  amountText: string | null;
  isStructured: boolean;
};

export const normalizeRecipeIngredientName = (value: string): string => {
  const normalized = normalizeRecipeIngredientText(value);

  return normalized ? normalized.toLocaleLowerCase() : "";
};

export const normalizeRecipeIngredientUnit = (
  value?: string | null
): string | null => {
  const normalized = normalizeRecipeIngredientText(value);

  if (!normalized) {
    return null;
  }

  const canonicalUnit =
    RECIPE_INGREDIENT_UNIT_LOOKUP[normalizeLookupText(normalized)];

  return canonicalUnit ?? normalized.toLocaleLowerCase();
};

export const isRecipeIngredientUnitSupported = (
  value?: string | null
): value is RecipeIngredientUnit => {
  return RECIPE_INGREDIENT_UNIT_VALUES.includes(
    value as RecipeIngredientUnit
  );
};

export const normalizeRecipeIngredientAmount = (
  value?: string | null
): NormalizedRecipeIngredientAmount => {
  const normalized = normalizeRecipeIngredientText(value);

  if (!normalized) {
    return {
      amountValue: null,
      amountText: null,
      isStructured: false,
    };
  }

  const compactFraction = normalized.replace(/\s*\/\s*/g, "/");

  if (/^\d+(?:[.,]\d+)?$/.test(compactFraction)) {
    return {
      amountValue: Number(compactFraction.replace(",", ".")),
      amountText: compactFraction,
      isStructured: true,
    };
  }

  const fractionMatch = /^(\d+)\/(\d+)$/.exec(compactFraction);

  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);

    if (denominator !== 0) {
      return {
        amountValue: numerator / denominator,
        amountText: compactFraction,
        isStructured: true,
      };
    }
  }

  return {
    amountValue: null,
    amountText: compactFraction,
    isStructured: false,
  };
};

export const formatRecipeIngredientAmountValue = (value: number): string => {
  if (Number.isInteger(value)) {
    return value.toString();
  }

  const roundedValue = Math.round(value * 100) / 100;

  return roundedValue.toString().replace(/(\.\d*?)0+$/, "$1");
};

export { normalizeRecipeIngredientText };
