import type {
  CatalogRecipeCoverStyle,
  CatalogRecipeDetail,
  CatalogRecipeSummary,
} from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import type { RecipeDraft } from "@/modules/recipes/core/domain/editor/recipeDraft.types";
import {
  type CreateRecipeIngredientFromDraftInput,
  createRecipeIngredientFromDraftInput,
  type RecipeSelection,
  type RecipeStep,
  type RecipeTag,
} from "@/modules/recipes/core/domain/recipe.types";
import type { ShoppingListIngredientSource } from "@/modules/recipes/core/domain/shopping/buildShoppingListFromSources";

type FixtureIngredientSource = CreateRecipeIngredientFromDraftInput & {
  shoppingGroupId?: string;
  shoppingGroupTitle?: string;
  checked?: boolean;
};

type FixtureRecipeSource = {
  id: string;
  title: string;
  summary: string;
  totalTimeMinutes: number | null;
  totalTimeLabel: string;
  servingsCount: number | null;
  servingsLabel: string;
  coverStyle: CatalogRecipeCoverStyle;
  tags: RecipeTag[];
  ingredients: FixtureIngredientSource[];
  steps: RecipeStep[];
  note: string | null;
  coverImageUrl: string | null;
};

const buildTag = (label: string): RecipeTag => {
  const slug = label.toLocaleLowerCase().replace(/\s+/g, "-");

  return {
    id: `tag-${slug}`,
    label,
    slug,
  };
};

const buildStep = (
  id: string,
  position: number,
  instruction: string,
  meta: string,
  title?: string | null
): RecipeStep => {
  return {
    id,
    position,
    title: title ?? null,
    instruction,
    notes: null,
    meta,
  };
};

const CREATION_DRAFT_SOURCE: FixtureRecipeSource = {
  id: "creation-draft",
  title: "",
  summary: "",
  totalTimeMinutes: null,
  totalTimeLabel: "",
  servingsCount: null,
  servingsLabel: "",
  coverStyle: "neutral",
  tags: [buildTag("Poisson"), buildTag("Rapide")],
  ingredients: [
    {
      id: "creation-ingredient-fish",
      displayName: "poisson blanc",
      amount: "2",
      unit: "piece",
      notes: "ou cabillaud",
    },
    {
      id: "creation-ingredient-potatoes",
      displayName: "pommes de terre grenaille",
      amount: "320",
      unit: "g",
      notes: null,
    },
    {
      id: "creation-ingredient-miso",
      displayName: "miso blanc",
      amount: "1/2",
      unit: "cs",
      notes: "tester dans la marinade",
      kind: "addition_candidate",
    },
  ],
  steps: [
    buildStep(
      "creation-step-1",
      1,
      "Preparer la marinade, napper le poisson puis laisser reposer 15 min.",
      "Action courte"
    ),
  ],
  note: null,
  coverImageUrl: null,
};

const EDIT_RECIPE_SOURCES: Record<string, FixtureRecipeSource> = {
  "poulet-citron-riz-pilaf": {
    id: "poulet-citron-riz-pilaf",
    title: "Poulet citron & riz pilaf",
    summary:
      "Lecture calme, ajouts distincts et ingredients ranges dans une structure stable.",
    totalTimeMinutes: 35,
    totalTimeLabel: "35 min",
    servingsCount: 2,
    servingsLabel: "2 portions",
    coverStyle: "citrus",
    tags: [buildTag("Rapide"), buildTag("Poulet"), buildTag("Soir de semaine")],
    ingredients: [
      {
        id: "edit-ingredient-poulet",
        displayName: "poulet",
        amount: "2",
        unit: "piece",
        notes: "de taille moyenne",
        shoppingGroupId: "fresh",
        shoppingGroupTitle: "Frais",
      },
      {
        id: "edit-ingredient-rice",
        displayName: "riz basmati",
        amount: "180",
        unit: "g",
        notes: null,
        shoppingGroupId: "pantry",
        shoppingGroupTitle: "Epicerie",
      },
      {
        id: "edit-ingredient-lemon",
        displayName: "citron jaune",
        amount: "1",
        unit: "piece",
        notes: "zeste + jus",
        shoppingGroupId: "produce",
        shoppingGroupTitle: "Primeur",
        checked: true,
      },
      {
        id: "edit-ingredient-coriander",
        displayName: "coriandre",
        amount: "1",
        unit: "botte",
        notes: "pour servir",
        shoppingGroupId: "produce",
        shoppingGroupTitle: "Primeur",
      },
      {
        id: "edit-ingredient-sumac",
        displayName: "sumac",
        amount: "1/2",
        unit: "cc",
        notes: "a valider si la sauce plait",
        kind: "addition_candidate",
        shoppingGroupId: "pantry",
        shoppingGroupTitle: "Epicerie",
      },
      {
        id: "edit-ingredient-pepper",
        displayName: "poivre noir",
        amount: "au gout",
        unit: null,
        notes: "la quantite reste textuelle",
        shoppingGroupId: "pantry",
        shoppingGroupTitle: "Epicerie",
      },
    ],
    steps: [
      buildStep(
        "edit-step-1",
        1,
        "Rincer le riz puis le lancer avec un filet d'huile et 300 ml d'eau.",
        "6 min actif"
      ),
      buildStep(
        "edit-step-2",
        2,
        "Saisir le poulet jusqu'a coloration puis couvrir 8 min a feu doux.",
        "Poele"
      ),
      buildStep(
        "edit-step-3",
        3,
        "Melanger yaourt, citron, sel et un filet d'huile.",
        "Sauce"
      ),
      buildStep(
        "edit-step-4",
        4,
        "Servir avec coriandre et tester le sumac sur une seule portion.",
        "Ajout a evaluer"
      ),
    ],
    note: "La sauce yaourt-citron plait beaucoup. Le sumac reste a confirmer.",
    coverImageUrl: null,
  },
  "bol-croustillant-tofu-miel-sesame": {
    id: "bol-croustillant-tofu-miel-sesame",
    title: "Bol croustillant tofu miel-sesame",
    summary:
      "Deuxieme recette de quick list pour produire une vraie sortie shopping sans parser complexe.",
    totalTimeMinutes: 30,
    totalTimeLabel: "30 min",
    servingsCount: 2,
    servingsLabel: "2 portions",
    coverStyle: "green",
    tags: [buildTag("Vege"), buildTag("Batch"), buildTag("Croquant")],
    ingredients: [
      {
        id: "tofu-ingredient-tofu",
        displayName: "tofu ferme",
        amount: "450",
        unit: "g",
        notes: null,
        shoppingGroupId: "fresh",
        shoppingGroupTitle: "Frais",
      },
      {
        id: "tofu-ingredient-rice",
        displayName: "riz basmati",
        amount: "220",
        unit: "g",
        notes: "base commune pour la semaine",
        shoppingGroupId: "pantry",
        shoppingGroupTitle: "Epicerie",
      },
      {
        id: "tofu-ingredient-coriander",
        displayName: "coriandre",
        amount: "1/2",
        unit: "botte",
        notes: "pour finir le bol",
        shoppingGroupId: "produce",
        shoppingGroupTitle: "Primeur",
      },
      {
        id: "tofu-ingredient-soy",
        displayName: "sauce soja",
        amount: "2.5",
        unit: "cs",
        notes: null,
        shoppingGroupId: "pantry",
        shoppingGroupTitle: "Epicerie",
      },
      {
        id: "tofu-ingredient-chili",
        displayName: "flocons de chili",
        amount: "au gout",
        unit: null,
        notes: "reste volontairement hors structuration",
        kind: "addition_candidate",
        shoppingGroupId: "pantry",
        shoppingGroupTitle: "Epicerie",
      },
    ],
    steps: [
      buildStep(
        "tofu-step-1",
        1,
        "Cuire le riz puis preparer la marinade miel-sesame.",
        "Base"
      ),
      buildStep(
        "tofu-step-2",
        2,
        "Saisir le tofu jusqu'a obtenir des bords croustillants.",
        "Poele"
      ),
      buildStep(
        "tofu-step-3",
        3,
        "Assembler le bol puis ajuster le chili seulement au besoin.",
        "Finition"
      ),
    ],
    note: null,
    coverImageUrl: null,
  },
};

const QUICK_LIST_RECIPE_IDS = [
  "poulet-citron-riz-pilaf",
  "bol-croustillant-tofu-miel-sesame",
] as const;

const normalizeFixtureRecipeSource = (
  source: FixtureRecipeSource,
  overrides?: {
    id?: RecipeDraft["id"];
    title?: string;
  }
): RecipeDraft => {
  return {
    id: overrides?.id ?? source.id,
    title: overrides?.title ?? source.title,
    summary: source.summary,
    totalTimeMinutes: source.totalTimeMinutes,
    totalTimeLabel: source.totalTimeLabel,
    servingsCount: source.servingsCount,
    servingsLabel: source.servingsLabel,
    tags: source.tags,
    ingredients: source.ingredients.map((ingredient) =>
      createRecipeIngredientFromDraftInput(ingredient)
    ),
    steps: source.steps,
    note: source.note,
    coverImageUrl: source.coverImageUrl,
  };
};

const formatTitleFromRecipeId = (recipeId: string): string => {
  const normalized = decodeURIComponent(recipeId)
    .replace(/[-_]+/g, " ")
    .trim();

  if (!normalized) {
    return "Recette";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export const getCreationDraftFixture = (): RecipeDraft => {
  const draft = normalizeFixtureRecipeSource(CREATION_DRAFT_SOURCE, {
    id: null,
  });

  return {
    ...draft,
    id: null,
  };
};

export const getRecipeDraftFixture = (
  recipeId: string
): RecipeDraft | null => {
  const source = EDIT_RECIPE_SOURCES[recipeId];

  if (source) {
    return normalizeFixtureRecipeSource(source);
  }

  const fallbackSource = EDIT_RECIPE_SOURCES["poulet-citron-riz-pilaf"];

  return normalizeFixtureRecipeSource(fallbackSource, {
    id: recipeId,
    title: formatTitleFromRecipeId(recipeId),
  });
};

export const listQuickListFixtureSelections = (): RecipeSelection[] => {
  return QUICK_LIST_RECIPE_IDS.map((recipeId, index) => {
    const recipe = EDIT_RECIPE_SOURCES[recipeId];

    return {
      id: `selection-${recipe.id}`,
      recipeId: recipe.id,
      title: recipe.title,
      note:
        index === 0
          ? "Mardi soir, avec sauce yaourt citronnee."
          : "Samedi midi, legumes du marche a ecouler.",
      servingsCount: recipe.servingsCount,
      servingsLabel: recipe.servingsLabel,
    };
  });
};

const mapFixtureSourceToCatalogSummary = (
  source: FixtureRecipeSource
): CatalogRecipeSummary => {
  return {
    id: source.id,
    title: source.title,
    summary: source.summary,
    totalTimeLabel: source.totalTimeLabel,
    servingsLabel: source.servingsLabel,
    tags: source.tags,
    coverStyle: source.coverStyle,
    isInQuickList: QUICK_LIST_RECIPE_IDS.includes(
      source.id as (typeof QUICK_LIST_RECIPE_IDS)[number]
    ),
  };
};

const mapFixtureSourceToCatalogDetail = (
  source: FixtureRecipeSource
): CatalogRecipeDetail => {
  return {
    ...mapFixtureSourceToCatalogSummary(source),
    note: source.note,
    ingredients: source.ingredients.map((ingredient) =>
      createRecipeIngredientFromDraftInput(ingredient)
    ),
    steps: source.steps,
  };
};

export const listCatalogFixtureRecipes = (): CatalogRecipeSummary[] => {
  return Object.values(EDIT_RECIPE_SOURCES).map(mapFixtureSourceToCatalogSummary);
};

export const getCatalogFixtureDetail = (
  recipeId: string
): CatalogRecipeDetail | null => {
  const source = EDIT_RECIPE_SOURCES[recipeId];

  if (!source) {
    return null;
  }

  return mapFixtureSourceToCatalogDetail(source);
};

const buildShoppingIngredientSource = (
  recipe: FixtureRecipeSource,
  ingredient: FixtureIngredientSource
): ShoppingListIngredientSource => {
  return {
    id: `shopping-${recipe.id}-${ingredient.id}`,
    groupId: ingredient.shoppingGroupId ?? "other",
    groupTitle: ingredient.shoppingGroupTitle ?? "Autres",
    ingredient: createRecipeIngredientFromDraftInput(ingredient),
    checked: ingredient.checked,
    recipe: {
      recipeId: recipe.id,
      title: recipe.title,
    },
  };
};

export const listShoppingFixtureSources = (): ShoppingListIngredientSource[] => {
  return QUICK_LIST_RECIPE_IDS.flatMap((recipeId) => {
    const recipe = EDIT_RECIPE_SOURCES[recipeId];

    return recipe.ingredients
      .filter(
        (
          ingredient
        ): ingredient is FixtureIngredientSource & {
          shoppingGroupId: string;
          shoppingGroupTitle: string;
        } => Boolean(ingredient.shoppingGroupId && ingredient.shoppingGroupTitle)
      )
      .map((ingredient) => buildShoppingIngredientSource(recipe, ingredient));
  });
};

export const getQuickListFixtureSelectionCount = (): number => {
  return QUICK_LIST_RECIPE_IDS.length;
};
