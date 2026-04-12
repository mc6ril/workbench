import type { TranslationFunction } from "@/shared/i18n";

import {
  CATALOG_RECIPE_FILTER_OPTION_DEFINITIONS,
  CATALOG_RECIPE_VISIBLE_FILTER_CATEGORY_KEYS,
  type CatalogRecipeFilterCategoryKey,
  createCatalogRecipeTagFilterOptionId,
  listCatalogRecipeDefaultTagSlugs,
} from "@/modules/recipes/core/domain/catalog/catalogRecipeFilters";
import type { RecipeTag } from "@/modules/recipes/core/domain/recipe.types";

export type RecipesCatalogFilterOption = {
  id: string;
  label: string;
};

export type RecipesCatalogFilterGroup = {
  key: CatalogRecipeFilterCategoryKey | "customTags";
  title: string;
  options: RecipesCatalogFilterOption[];
};

export const buildRecipesCatalogFilterGroups = (
  t: TranslationFunction,
  availableTags: RecipeTag[]
): RecipesCatalogFilterGroup[] => {
  const groups: RecipesCatalogFilterGroup[] =
    CATALOG_RECIPE_VISIBLE_FILTER_CATEGORY_KEYS.map((categoryKey) => ({
      key: categoryKey,
      title: t(`sheet.groups.${categoryKey}.title`),
      options: CATALOG_RECIPE_FILTER_OPTION_DEFINITIONS.filter(
        (option) => option.category === categoryKey
      ).map((option) => ({
        id: option.id,
        label: t(`sheet.options.${option.id}`),
      })),
    }));

  const defaultTagSlugs = new Set(listCatalogRecipeDefaultTagSlugs());
  const customTagOptions = availableTags
    .filter((tag) => !defaultTagSlugs.has(tag.slug))
    .map((tag) => ({
      id: createCatalogRecipeTagFilterOptionId(tag.slug),
      label: tag.label,
    }))
    .sort((left, right) => left.label.localeCompare(right.label, "fr"));

  if (customTagOptions.length > 0) {
    groups.push({
      key: "customTags",
      title: t("sheet.groups.customTags.title"),
      options: customTagOptions,
    });
  }

  return groups;
};
