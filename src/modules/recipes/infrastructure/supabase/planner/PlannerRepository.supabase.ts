import type { SupabaseClient } from "@supabase/supabase-js";

import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";

import type { PlannerRepository } from "@/modules/recipes/core/ports/planner/plannerRepository";
import type {
  RecipeRow,
  RecipeSelectionRow,
} from "@/modules/recipes/infrastructure/supabase/shared/persistence.types";
import { mapRecipeSelectionRowToDomain } from "@/modules/recipes/infrastructure/supabase/shared/readModels";
import { listQuickListFixtureSelections } from "@/modules/recipes/infrastructure/supabase/shared/recipesFixtureData";

/**
 * Step 5:
 * the quick list now reads the persisted project-scoped selections when they
 * exist, with the former fixture kept as a temporary compatibility fallback.
 */
export const createPlannerRepository = (
  client: SupabaseClient
): PlannerRepository => ({
  async listQuickList(projectId) {
    const { data: selectionData, error: selectionError } = await client
      .from("recipe_selections")
      .select("*")
      .eq("project_id", projectId)
      .order("position", { ascending: true });

    if (selectionError) {
      return handleRepositoryError(selectionError, "RecipeSelection", projectId);
    }

    const selections = (selectionData ?? []) as RecipeSelectionRow[];

    if (selections.length === 0) {
      return listQuickListFixtureSelections();
    }

    const recipeIds = selections.map((selection) => selection.recipe_id);
    const { data: recipeData, error: recipeError } = await client
      .from("recipes")
      .select(
        "id, project_id, title, summary, total_time_minutes, total_time_label, servings_count, servings_label, note, cover_image_url, cover_style, created_at, updated_at"
      )
      .eq("project_id", projectId)
      .in("id", recipeIds);

    if (recipeError) {
      return handleRepositoryError(recipeError, "Recipe", projectId);
    }

    const recipesById = new Map(
      ((recipeData ?? []) as RecipeRow[]).map((recipe) => [recipe.id, recipe])
    );

    return selections.flatMap((selection) => {
      const recipe = recipesById.get(selection.recipe_id);

      if (!recipe) {
        return [];
      }

      return [mapRecipeSelectionRowToDomain(selection, recipe)];
    });
  },
});
