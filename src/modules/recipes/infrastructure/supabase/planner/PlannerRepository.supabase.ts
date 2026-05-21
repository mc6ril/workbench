import { createNotFoundError } from "@/shared/errors/repositoryError";
import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";
import type { AppSupabaseClient } from "@/shared/infrastructure/supabase/types";

import type {
  CookedSelection,
  QuickListRecipe,
  QuickListSelectionStatus,
  SelectRecipeInput,
} from "@/modules/recipes/core/domain/planner/quickList.types";
import type { PlannerRepository } from "@/modules/recipes/core/ports/planner/plannerRepository";
import type {
  RecipeRow,
  RecipeSelectionRow,
} from "@/modules/recipes/infrastructure/supabase/shared/persistence.types";
import { mapRecipeSelectionRowToDomain } from "@/modules/recipes/infrastructure/supabase/shared/readModels";

const RECIPE_SELECTION_FIELDS =
  "id, project_id, recipe_id, position, note, servings_count, servings_label, status, created_at, updated_at";

const RECIPE_SELECTION_RECIPE_FIELDS =
  "id, project_id, title, summary, total_time_minutes, total_time_label, servings_count, servings_label, note, cover_image_url, cover_style, seasonal_months, created_at, updated_at";

const mapSelectionToQuickListRecipe = (
  selection: RecipeSelectionRow,
  recipe: RecipeRow
): QuickListRecipe => {
  return {
    ...mapRecipeSelectionRowToDomain(selection, recipe),
    status: selection.status as QuickListSelectionStatus,
  };
};

const listSelectionRows = async (
  client: AppSupabaseClient,
  projectId: string
): Promise<RecipeSelectionRow[]> => {
  const { data, error } = await client
    .from("recipe_selections")
    .select(RECIPE_SELECTION_FIELDS)
    .eq("project_id", projectId)
    .order("position", { ascending: true });

  if (error) {
    return handleRepositoryError(error, "RecipeSelection", projectId);
  }

  return data ?? [];
};

const loadRecipeById = async (
  client: AppSupabaseClient,
  projectId: string,
  recipeId: string
): Promise<RecipeRow> => {
  const { data, error } = await client
    .from("recipes")
    .select(RECIPE_SELECTION_RECIPE_FIELDS)
    .eq("project_id", projectId)
    .eq("id", recipeId)
    .maybeSingle();

  if (error) {
    return handleRepositoryError(error, "Recipe", recipeId);
  }

  if (!data) {
    throw createNotFoundError(
      "Recipe",
      recipeId,
      `Recipe ${recipeId} is not persisted in project ${projectId}`
    );
  }

  return data;
};

const loadRecipesByIds = async (
  client: AppSupabaseClient,
  projectId: string,
  recipeIds: string[]
): Promise<Map<string, RecipeRow>> => {
  if (recipeIds.length === 0) {
    return new Map();
  }

  const { data, error } = await client
    .from("recipes")
    .select(RECIPE_SELECTION_RECIPE_FIELDS)
    .eq("project_id", projectId)
    .in("id", recipeIds);

  if (error) {
    return handleRepositoryError(error, "Recipe", projectId);
  }

  return new Map((data ?? []).map((recipe) => [recipe.id, recipe]));
};

const loadSelectionByRecipeId = async (
  client: AppSupabaseClient,
  projectId: string,
  recipeId: string
): Promise<RecipeSelectionRow | null> => {
  const { data, error } = await client
    .from("recipe_selections")
    .select(RECIPE_SELECTION_FIELDS)
    .eq("project_id", projectId)
    .eq("recipe_id", recipeId)
    .maybeSingle();

  if (error) {
    return handleRepositoryError(error, "RecipeSelection", recipeId);
  }

  return data ?? null;
};

const loadSelectionById = async (
  client: AppSupabaseClient,
  projectId: string,
  selectionId: string
): Promise<RecipeSelectionRow> => {
  const { data, error } = await client
    .from("recipe_selections")
    .select(RECIPE_SELECTION_FIELDS)
    .eq("project_id", projectId)
    .eq("id", selectionId)
    .maybeSingle();

  if (error) {
    return handleRepositoryError(error, "RecipeSelection", selectionId);
  }

  if (!data) {
    throw createNotFoundError("RecipeSelection", selectionId);
  }

  return data;
};

const loadNextSelectionPosition = async (
  client: AppSupabaseClient,
  projectId: string
): Promise<number> => {
  const { data, error } = await client
    .from("recipe_selections")
    .select("position")
    .eq("project_id", projectId)
    .order("position", { ascending: false })
    .limit(1);

  if (error) {
    return handleRepositoryError(error, "RecipeSelection", projectId);
  }

  const highestPosition = data?.[0]?.position;

  return typeof highestPosition === "number" ? highestPosition + 1 : 0;
};

const insertSelection = async (
  client: AppSupabaseClient,
  input: SelectRecipeInput,
  recipe: RecipeRow
): Promise<RecipeSelectionRow> => {
  const position = await loadNextSelectionPosition(client, input.projectId);
  const { data, error } = await client
    .from("recipe_selections")
    .insert({
      project_id: input.projectId,
      recipe_id: input.recipeId,
      position,
      note: null,
      servings_count: recipe.servings_count,
      servings_label: recipe.servings_label,
      status: "pending",
    })
    .select(RECIPE_SELECTION_FIELDS)
    .single();

  if (error) {
    return handleRepositoryError(error, "RecipeSelection", input.recipeId);
  }

  return data;
};

export const createPlannerRepository = (
  client: AppSupabaseClient
): PlannerRepository => ({
  async listActiveSelections(projectId) {
    const selections = await listSelectionRows(client, projectId);

    if (selections.length === 0) {
      return [];
    }

    const recipesById = await loadRecipesByIds(
      client,
      projectId,
      selections.map((selection) => selection.recipe_id)
    );

    return selections.flatMap((selection) => {
      const recipe = recipesById.get(selection.recipe_id);

      if (!recipe) {
        return [];
      }

      return [mapSelectionToQuickListRecipe(selection, recipe)];
    });
  },

  async selectRecipe(input) {
    const existingSelection = await loadSelectionByRecipeId(
      client,
      input.projectId,
      input.recipeId
    );
    const recipe = await loadRecipeById(
      client,
      input.projectId,
      input.recipeId
    );

    if (existingSelection) {
      if (existingSelection.status !== "pending") {
        const { data, error } = await client
          .from("recipe_selections")
          .update({ status: "pending" })
          .eq("project_id", input.projectId)
          .eq("id", existingSelection.id)
          .select(RECIPE_SELECTION_FIELDS)
          .single();

        if (error) {
          return handleRepositoryError(
            error,
            "RecipeSelection",
            existingSelection.id
          );
        }

        return mapSelectionToQuickListRecipe(data, recipe);
      }

      return mapSelectionToQuickListRecipe(existingSelection, recipe);
    }

    const insertedSelection = await insertSelection(client, input, recipe);

    return mapSelectionToQuickListRecipe(insertedSelection, recipe);
  },

  async markShoppingDone(input) {
    const { data, error } = await client
      .from("recipe_selections")
      .update({ status: "shopping_done" })
      .eq("project_id", input.projectId)
      .eq("id", input.selectionId)
      .select(RECIPE_SELECTION_FIELDS)
      .single();

    if (error) {
      return handleRepositoryError(error, "RecipeSelection", input.selectionId);
    }

    const recipe = await loadRecipeById(
      client,
      input.projectId,
      data.recipe_id
    );

    return mapSelectionToQuickListRecipe(data, recipe);
  },

  async markAsCooked(input) {
    const selection = await loadSelectionById(
      client,
      input.projectId,
      input.selectionId
    );
    const recipe = await loadRecipeById(
      client,
      input.projectId,
      selection.recipe_id
    );

    const { error: deleteError } = await client
      .from("recipe_selections")
      .delete()
      .eq("project_id", input.projectId)
      .eq("id", input.selectionId);

    if (deleteError) {
      return handleRepositoryError(
        deleteError,
        "RecipeSelection",
        input.selectionId
      );
    }

    const { error: historyError } = await client
      .from("recipe_cooking_history")
      .insert({
        project_id: input.projectId,
        recipe_id: selection.recipe_id,
      });

    if (historyError) {
      return handleRepositoryError(
        historyError,
        "RecipeCookingHistory",
        selection.recipe_id
      );
    }

    const cookedSelection: CookedSelection = {
      selectionId: input.selectionId,
      recipeId: selection.recipe_id,
      title: recipe.title,
    };

    return cookedSelection;
  },

  async removeSelection(input) {
    const { error } = await client
      .from("recipe_selections")
      .delete()
      .eq("project_id", input.projectId)
      .eq("id", input.selectionId);

    if (error) {
      return handleRepositoryError(error, "RecipeSelection", input.selectionId);
    }
  },
});
