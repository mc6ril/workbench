import type { RecipeIngredient } from "@/modules/recipes/core/domain/recipe.types";

export type ShoppingIngredientGroup = {
  id: string;
  title: string;
  order: number;
};

const SHOPPING_GROUPS: ShoppingIngredientGroup[] = [
  {
    id: "produce",
    title: "Primeur",
    order: 0,
  },
  {
    id: "fresh",
    title: "Frais",
    order: 1,
  },
  {
    id: "pantry",
    title: "Epicerie",
    order: 2,
  },
  {
    id: "other",
    title: "Autres",
    order: 3,
  },
];

const PRODUCE_KEYWORDS = [
  "ail",
  "aneth",
  "avocat",
  "basilic",
  "brocoli",
  "carotte",
  "champignon",
  "chou",
  "citron",
  "coriandre",
  "concombre",
  "courgette",
  "curry leaves",
  "echalote",
  "epinard",
  "gingembre",
  "herbe",
  "laitue",
  "menthe",
  "oignon",
  "persil",
  "poireau",
  "poivron",
  "pomme de terre",
  "radis",
  "romarin",
  "salade",
  "thym",
  "tomate",
];

const FRESH_KEYWORDS = [
  "beurre",
  "boeuf",
  "bœuf",
  "cabillaud",
  "chevre",
  "chèvre",
  "creme",
  "crème",
  "fromage",
  "lait",
  "mozzarella",
  "oeuf",
  "œuf",
  "parmesan",
  "poisson",
  "poulet",
  "saumon",
  "steak",
  "tofu",
  "viande",
  "yaourt",
];

const PANTRY_KEYWORDS = [
  "bouillon",
  "farine",
  "haricot",
  "huile",
  "lentille",
  "miel",
  "nouille",
  "olive",
  "pate",
  "pâtes",
  "poivre",
  "quinoa",
  "riz",
  "sauce",
  "sel",
  "semoule",
  "sumac",
  "sucre",
  "tomate concassee",
  "vinaigre",
];

const findGroupById = (groupId: string): ShoppingIngredientGroup => {
  return (
    SHOPPING_GROUPS.find((group) => group.id === groupId) ??
    SHOPPING_GROUPS[SHOPPING_GROUPS.length - 1]
  );
};

const matchesAnyKeyword = (name: string, keywords: string[]) => {
  return keywords.some((keyword) => name.includes(keyword));
};

export const getShoppingGroupOrder = (groupId: string): number => {
  return findGroupById(groupId).order;
};

export const compareShoppingGroupIds = (
  leftGroupId: string,
  rightGroupId: string
): number => {
  return (
    getShoppingGroupOrder(leftGroupId) - getShoppingGroupOrder(rightGroupId)
  );
};

export const resolveShoppingIngredientGroup = (
  ingredient: Pick<RecipeIngredient, "displayName" | "normalizedName">
): ShoppingIngredientGroup => {
  const normalizedName = (
    ingredient.normalizedName ||
    ingredient.displayName ||
    ""
  ).toLowerCase();

  if (matchesAnyKeyword(normalizedName, PRODUCE_KEYWORDS)) {
    return findGroupById("produce");
  }

  if (matchesAnyKeyword(normalizedName, FRESH_KEYWORDS)) {
    return findGroupById("fresh");
  }

  if (matchesAnyKeyword(normalizedName, PANTRY_KEYWORDS)) {
    return findGroupById("pantry");
  }

  return findGroupById("other");
};
