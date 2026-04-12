import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { buildProjectRoute } from "@/shared/utils/routes";

export const RECIPES_ROUTE_SEGMENTS = Object.freeze({
  QUICK_LIST: "quick-list",
  SHOPPING_LIST: "shopping-list",
  NEW: "new",
  EDIT: "edit",
});

export const buildRecipesCatalogRoute = (projectId: string) => {
  return buildProjectRoute(projectId, PROJECT_VIEWS.RECIPES);
};

export const buildRecipesQuickListRoute = (projectId: string) => {
  return `${buildRecipesCatalogRoute(projectId)}/${RECIPES_ROUTE_SEGMENTS.QUICK_LIST}`;
};

export const buildRecipesShoppingRoute = (projectId: string) => {
  return `${buildRecipesCatalogRoute(projectId)}/${RECIPES_ROUTE_SEGMENTS.SHOPPING_LIST}`;
};

export const buildRecipeCreationRoute = (projectId: string) => {
  return `${buildRecipesCatalogRoute(projectId)}/${RECIPES_ROUTE_SEGMENTS.NEW}`;
};

export const buildRecipeDetailRoute = (projectId: string, recipeId: string) => {
  return `${buildRecipesCatalogRoute(projectId)}/${recipeId}`;
};

export const buildRecipeEditRoute = (projectId: string, recipeId: string) => {
  return `${buildRecipeDetailRoute(projectId, recipeId)}/${RECIPES_ROUTE_SEGMENTS.EDIT}`;
};
