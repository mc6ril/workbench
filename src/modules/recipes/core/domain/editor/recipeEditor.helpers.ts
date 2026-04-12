import {
  CATALOG_RECIPE_COVER_STYLE_VALUES,
  type CatalogRecipeCoverStyle,
} from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import { normalizeRecipeIngredientText } from "@/modules/recipes/core/domain/ingredientFormat";

export const normalizeRecipeEditorText = (
  value?: string | null
): string | null => {
  return normalizeRecipeIngredientText(value);
};

export const normalizeRecipeTagLabel = (
  value?: string | null
): string | null => {
  return normalizeRecipeEditorText(value);
};

export const DEFAULT_RECIPE_SERVINGS_LABEL = "portions";

const normalizeRecipeServingsCount = (
  value?: string | number | null
): string | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? String(value) : null;
  }

  return normalizeRecipeEditorText(value);
};

export const buildRecipeServingsLabel = ({
  servingsCount,
}: {
  servingsCount?: string | number | null;
}): string => {
  const normalizedCount = normalizeRecipeServingsCount(servingsCount);

  if (!normalizedCount) {
    return "";
  }

  return `${normalizedCount} ${DEFAULT_RECIPE_SERVINGS_LABEL}`;
};

export const buildRecipeTagSlug = (value: string): string => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const resolveRecipeCoverStyle = (
  title: string
): CatalogRecipeCoverStyle => {
  const normalizedTitle = title.trim().toLocaleLowerCase();

  if (!normalizedTitle) {
    return "neutral";
  }

  let hash = 0;

  for (const character of normalizedTitle) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return CATALOG_RECIPE_COVER_STYLE_VALUES[
    hash % CATALOG_RECIPE_COVER_STYLE_VALUES.length
  ];
};
