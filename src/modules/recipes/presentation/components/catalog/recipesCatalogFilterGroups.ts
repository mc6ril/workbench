import type { TranslationFunction } from "@/shared/i18n";

import {
  CATALOG_RECIPE_FILTER_CATEGORY_KEYS,
  CATALOG_RECIPE_FILTER_OPTION_DEFINITIONS,
  type CatalogRecipeFilterCategoryKey,
} from "@/modules/recipes/core/domain/catalog/catalogRecipeFilters";

export type RecipesCatalogFilterOption = {
  id: string;
  label: string;
};

export type RecipesCatalogFilterGroup = {
  key: CatalogRecipeFilterCategoryKey;
  title: string;
  options: RecipesCatalogFilterOption[];
};

export const buildRecipesCatalogFilterGroups = (
  t: TranslationFunction
): RecipesCatalogFilterGroup[] => {
  return CATALOG_RECIPE_FILTER_CATEGORY_KEYS.map((categoryKey) => ({
    key: categoryKey,
    title: t(`sheet.groups.${categoryKey}.title`),
    options: CATALOG_RECIPE_FILTER_OPTION_DEFINITIONS.filter(
      (option) => option.category === categoryKey
    ).map((option) => ({
      id: option.id,
      label: t(`sheet.options.${option.id}`),
    })),
  }));
};
