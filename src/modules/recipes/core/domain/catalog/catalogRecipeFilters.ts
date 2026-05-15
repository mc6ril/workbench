export const CATALOG_RECIPE_FILTER_CATEGORY_KEYS = [
  "popular",
  "type",
  "dietary",
  "equipment",
] as const;

export type CatalogRecipeFilterCategoryKey =
  (typeof CATALOG_RECIPE_FILTER_CATEGORY_KEYS)[number];

export type CatalogRecipeFilterOptionDefinition = {
  id: string;
  category: CatalogRecipeFilterCategoryKey;
  tagSlugs: string[];
};

export const CATALOG_RECIPE_TAG_FILTER_OPTION_PREFIX = "tag.";

const createOption = (
  id: string,
  category: CatalogRecipeFilterCategoryKey,
  tagSlugs: string[]
): CatalogRecipeFilterOptionDefinition => {
  return {
    id,
    category,
    tagSlugs,
  };
};

export const CATALOG_RECIPE_FILTER_OPTION_DEFINITIONS = [
  createOption("popular-express", "popular", ["express", "rapide"]),
  createOption("popular-organic-vegetables", "popular", ["legumes-bio", "bio"]),
  createOption("popular-vegetarian", "popular", [
    "vegetarien",
    "vegetarian",
    "veggie",
    "vege",
  ]),
  createOption("popular-gourmand", "popular", ["gourmand", "grand-gourmet"]),
  createOption("type-crustaceans", "type", [
    "crustaces",
    "crevette",
    "crevettes",
    "gambas",
    "shrimp",
  ]),
  createOption("type-express", "type", ["express", "rapide"]),
  createOption("type-family", "type", [
    "famille",
    "family",
    "kids-friendly",
    "kid-friendly",
    "kids",
  ]),
  createOption("type-healthy", "type", [
    "healthy",
    "sain",
    "equilibre",
    "light",
  ]),
  createOption("type-world", "type", [
    "monde",
    "italien",
    "mexique",
    "asiatique",
    "indien",
    "japonais",
    "thai",
    "oriental",
    "libanais",
    "grec",
    "espagnol",
    "marocain",
  ]),
  createOption("type-fish", "type", [
    "poisson",
    "fish",
    "saumon",
    "thon",
    "cabillaud",
    "merlu",
    "colin",
    "truite",
    "poisson-blanc",
    "poisson-noble",
  ]),
  createOption("type-veggie", "type", [
    "vegetarien",
    "vegetarian",
    "veggie",
    "vege",
    "vegetal",
  ]),
  createOption("type-meat", "type", [
    "viande",
    "meat",
    "boeuf",
    "poulet",
    "porc",
    "dinde",
    "canard",
    "lapin",
    "veau",
    "agneau",
    "steak",
    "jambon",
    "saucisse",
  ]),
  createOption("dietary-naturally-gluten-free", "dietary", [
    "naturellement-sans-gluten",
    "sans-gluten",
    "gluten-free",
  ]),
  createOption("equipment-two-hobs-max", "equipment", [
    "2-plaques-maximum",
    "deux-plaques-maximum",
  ]),
  createOption("equipment-food-processor", "equipment", [
    "compatible-robot-de-cuisine",
    "robot-de-cuisine",
  ]),
  createOption("equipment-no-oven", "equipment", ["sans-four"]),
  createOption("equipment-no-blender", "equipment", ["sans-mixeur"]),
] as const satisfies readonly CatalogRecipeFilterOptionDefinition[];

export const CATALOG_RECIPE_VISIBLE_FILTER_CATEGORY_KEYS: CatalogRecipeFilterCategoryKey[] =
  [...CATALOG_RECIPE_FILTER_CATEGORY_KEYS];

export type CatalogRecipePredefinedFilterOptionId =
  (typeof CATALOG_RECIPE_FILTER_OPTION_DEFINITIONS)[number]["id"];
export type CatalogRecipeTagFilterOptionId =
  `${typeof CATALOG_RECIPE_TAG_FILTER_OPTION_PREFIX}${string}`;
export type CatalogRecipeFilterOptionId =
  | CatalogRecipePredefinedFilterOptionId
  | CatalogRecipeTagFilterOptionId;

const FILTER_OPTION_IDS = new Set<string>(
  CATALOG_RECIPE_FILTER_OPTION_DEFINITIONS.map((option) => option.id)
);

export const createCatalogRecipeTagFilterOptionId = (
  tagSlug: string
): CatalogRecipeTagFilterOptionId => {
  return `${CATALOG_RECIPE_TAG_FILTER_OPTION_PREFIX}${tagSlug}`;
};

export const parseCatalogRecipeTagFilterOptionId = (
  optionId: string
): string | null => {
  if (!optionId.startsWith(CATALOG_RECIPE_TAG_FILTER_OPTION_PREFIX)) {
    return null;
  }

  const tagSlug = optionId
    .slice(CATALOG_RECIPE_TAG_FILTER_OPTION_PREFIX.length)
    .trim()
    .toLocaleLowerCase();

  return tagSlug ? tagSlug : null;
};

export const listCatalogRecipeDefaultTagSlugs = (): string[] => {
  return [
    ...new Set(
      CATALOG_RECIPE_FILTER_OPTION_DEFINITIONS.flatMap(
        (option) => option.tagSlugs
      )
    ),
  ].sort();
};

export const normalizeCatalogRecipeFilterOptionIds = (
  value: string[] | null | undefined
): CatalogRecipeFilterOptionId[] => {
  if (!value || value.length === 0) {
    return [];
  }

  return [...new Set(value.map((optionId) => optionId.trim()).filter(Boolean))]
    .flatMap((optionId) => {
      if (FILTER_OPTION_IDS.has(optionId)) {
        return [optionId as CatalogRecipePredefinedFilterOptionId];
      }

      const tagSlug = parseCatalogRecipeTagFilterOptionId(optionId);

      if (!tagSlug) {
        return [];
      }

      return [createCatalogRecipeTagFilterOptionId(tagSlug)];
    })
    .sort();
};

export const getCatalogRecipeFilterOptionDefinition = (
  optionId: string
): CatalogRecipeFilterOptionDefinition | null => {
  return (
    CATALOG_RECIPE_FILTER_OPTION_DEFINITIONS.find(
      (option) => option.id === optionId
    ) ?? null
  );
};

export const groupCatalogRecipeFilterOptionIdsByCategory = (
  optionIds: string[]
): Map<
  CatalogRecipeFilterCategoryKey,
  CatalogRecipeFilterOptionDefinition[]
> => {
  const groupedOptions = new Map<
    CatalogRecipeFilterCategoryKey,
    CatalogRecipeFilterOptionDefinition[]
  >();

  for (const optionId of normalizeCatalogRecipeFilterOptionIds(optionIds)) {
    const option = getCatalogRecipeFilterOptionDefinition(optionId);

    if (!option) {
      continue;
    }

    const currentOptions = groupedOptions.get(option.category) ?? [];
    currentOptions.push(option);
    groupedOptions.set(option.category, currentOptions);
  }

  return groupedOptions;
};
