export const CATALOG_RECIPE_FILTER_CATEGORY_KEYS = [
  "popular",
  "type",
  "nutrition",
  "nutriScore",
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
  createOption("popular-low-calories", "popular", [
    "faible-en-calories",
    "low-calorie",
  ]),
  createOption("popular-boost-nutri", "popular", [
    "boost-nutri",
    "faible-en-calories",
    "fibres-plus",
    "omega-3",
    "omega3",
    "proteine",
    "proteine-plus",
    "proteinee",
    "riche-en-legumes",
  ]),
  createOption("popular-organic-vegetables", "popular", [
    "legumes-bio",
    "bio",
  ]),
  createOption("popular-vegetarian", "popular", [
    "vegetarien",
    "vegetarian",
    "veggie",
    "vege",
  ]),
  createOption("popular-gourmand", "popular", [
    "gourmand",
    "grand-gourmet",
  ]),
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
  createOption("nutrition-low-calories", "nutrition", [
    "faible-en-calories",
    "low-calorie",
  ]),
  createOption("nutrition-fibers-plus", "nutrition", [
    "fibres-plus",
    "fiber-plus",
  ]),
  createOption("nutrition-omega-3", "nutrition", ["omega-3", "omega3"]),
  createOption("nutrition-protein", "nutrition", [
    "proteine",
    "proteine-plus",
    "proteinee",
    "protein",
  ]),
  createOption("nutrition-vegetables-rich", "nutrition", [
    "riche-en-legumes",
    "rich-in-vegetables",
  ]),
  createOption("nutri-score-a", "nutriScore", ["nutri-a", "nutriscore-a"]),
  createOption("nutri-score-b", "nutriScore", ["nutri-b", "nutriscore-b"]),
  createOption("nutri-score-c", "nutriScore", ["nutri-c", "nutriscore-c"]),
  createOption("nutri-score-d", "nutriScore", ["nutri-d", "nutriscore-d"]),
  createOption("nutri-score-e", "nutriScore", ["nutri-e", "nutriscore-e"]),
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

export type CatalogRecipeFilterOptionId =
  (typeof CATALOG_RECIPE_FILTER_OPTION_DEFINITIONS)[number]["id"];

const FILTER_OPTION_IDS = new Set<string>(
  CATALOG_RECIPE_FILTER_OPTION_DEFINITIONS.map((option) => option.id)
);

export const normalizeCatalogRecipeFilterOptionIds = (
  value: string[] | null | undefined
): CatalogRecipeFilterOptionId[] => {
  if (!value || value.length === 0) {
    return [];
  }

  return [...new Set(value.map((optionId) => optionId.trim()).filter(Boolean))]
    .filter((optionId): optionId is CatalogRecipeFilterOptionId =>
      FILTER_OPTION_IDS.has(optionId)
    )
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
): Map<CatalogRecipeFilterCategoryKey, CatalogRecipeFilterOptionDefinition[]> => {
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
