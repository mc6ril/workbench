import type { SupabaseClient } from "@supabase/supabase-js";

import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";

import type { CatalogRepository } from "@/modules/recipes/core/ports/catalog/catalogRepository";
import type { RecipeSelectionRow } from "@/modules/recipes/infrastructure/supabase/shared/persistence.types";
import {
  loadRecipeGraphsByIds,
  mapLoadedRecipeGraphToCatalogDetail,
  mapLoadedRecipeGraphToCatalogSummary,
} from "@/modules/recipes/infrastructure/supabase/shared/readModels";
import {
  getCatalogFixtureDetail,
  listCatalogFixtureRecipes,
} from "@/modules/recipes/infrastructure/supabase/shared/recipesFixtureData";

/**
 * Step 5:
 * read from the real Recipes schema and keep the former preview fixtures only as
 * a temporary fallback until write flows land in the next steps.
 */
export const createCatalogRepository = (
  client: SupabaseClient
): CatalogRepository => ({
  async listByProject(projectId) {
    const recipeGraphs = await loadRecipeGraphsByIds(client, projectId);

    if (recipeGraphs.size === 0) {
      return listCatalogFixtureRecipes();
    }

    const { data: selectionData, error: selectionError } = await client
      .from("recipe_selections")
      .select("id, project_id, recipe_id, position, note, servings_count, servings_label, created_at, updated_at")
      .eq("project_id", projectId);

    if (selectionError) {
      return handleRepositoryError(selectionError, "RecipeSelection", projectId);
    }

    const selectedRecipeIds = new Set(
      ((selectionData ?? []) as RecipeSelectionRow[]).map(
        (selection) => selection.recipe_id
      )
    );

    return Array.from(recipeGraphs.values()).map((recipeGraph) =>
      mapLoadedRecipeGraphToCatalogSummary(
        recipeGraph,
        selectedRecipeIds.has(recipeGraph.recipe.id)
      )
    );
  },

  async getDetail(projectId, recipeId) {
    const recipeGraphs = await loadRecipeGraphsByIds(client, projectId, [recipeId]);
    const recipeGraph = recipeGraphs.get(recipeId);

    if (!recipeGraph) {
      return getCatalogFixtureDetail(recipeId);
    }

    const { data: selectionData, error: selectionError } = await client
      .from("recipe_selections")
      .select("id")
      .eq("project_id", projectId)
      .eq("recipe_id", recipeId)
      .maybeSingle();

    if (selectionError) {
      return handleRepositoryError(selectionError, "RecipeSelection", recipeId);
    }

    return mapLoadedRecipeGraphToCatalogDetail(recipeGraph, Boolean(selectionData));
  },
});
