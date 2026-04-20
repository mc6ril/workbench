import type {
  RecipeIngredientRow,
  ShoppingListItemRow,
} from "./persistence.types";

import {
  createRecipeIngredient,
  type RecipeIngredient,
  type RecipeIngredientKind,
} from "@/modules/recipes/core/domain/recipe.types";

type PersistedIngredientFields = {
  id: string;
  displayName: string;
  normalizedName: string;
  amountValue: number | null;
  amountText: string | null;
  unit: string | null;
  notes: string | null;
  kind: RecipeIngredientKind;
};

const mapPersistedIngredientFieldsToDomain = (
  fields: PersistedIngredientFields
): RecipeIngredient => {
  return createRecipeIngredient({
    id: fields.id,
    displayName: fields.displayName,
    normalizedName: fields.normalizedName,
    amountValue: fields.amountValue,
    amountText: fields.amountText,
    unit: fields.unit,
    notes: fields.notes,
    kind: fields.kind,
  });
};

export const mapRecipeIngredientRowToDomain = (
  row: RecipeIngredientRow
): RecipeIngredient => {
  return mapPersistedIngredientFieldsToDomain({
    id: row.id,
    displayName: row.display_name,
    normalizedName: row.normalized_name,
    amountValue: row.amount_value,
    amountText: row.amount_text,
    unit: row.unit,
    notes: row.notes,
    kind: row.kind,
  });
};

export const mapShoppingListItemIngredientRowToDomain = (
  row: ShoppingListItemRow
): RecipeIngredient => {
  return mapPersistedIngredientFieldsToDomain({
    id: row.id,
    displayName: row.display_name,
    normalizedName: row.normalized_name,
    amountValue: row.amount_value,
    amountText: row.amount_text,
    unit: row.unit,
    notes: row.notes,
    kind: row.ingredient_kind,
  });
};
