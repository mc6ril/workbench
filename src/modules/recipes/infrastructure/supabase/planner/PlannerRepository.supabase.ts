import type { SupabaseClient } from "@supabase/supabase-js";

import { createNotFoundError } from "@/shared/errors/repositoryError";
import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";

import type {
  DoneQuickListSelection,
  QuickListRecipe,
  SelectRecipeInput,
} from "@/modules/recipes/core/domain/planner/quickList.types";
import type { PlannerRepository } from "@/modules/recipes/core/ports/planner/plannerRepository";
import type {
  RecipeRow,
  RecipeSelectionRow,
} from "@/modules/recipes/infrastructure/supabase/shared/persistence.types";
import { mapRecipeSelectionRowToDomain } from "@/modules/recipes/infrastructure/supabase/shared/readModels";

const RECIPE_SELECTION_FIELDS =
  "id, project_id, recipe_id, position, note, servings_count, servings_label, created_at, updated_at";

const RECIPE_SELECTION_RECIPE_FIELDS =
  "id, project_id, title, summary, total_time_minutes, total_time_label, servings_count, servings_label, note, cover_image_url, cover_style, created_at, updated_at";

const mapSelectionToActiveQuickListRecipe = (
  selection: RecipeSelectionRow,
  recipe: RecipeRow
): QuickListRecipe => {
  return {
    ...mapRecipeSelectionRowToDomain(selection, recipe),
    status: "active",
  };
};

const listSelectionRows = async (
  client: SupabaseClient,
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

  return (data ?? []) as RecipeSelectionRow[];
};

const loadRecipeById = async (
  client: SupabaseClient,
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

  return data as RecipeRow;
};

const loadRecipesByIds = async (
  client: SupabaseClient,
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

  return new Map(
    ((data ?? []) as RecipeRow[]).map((recipe) => [recipe.id, recipe])
  );
};

const loadSelectionByRecipeId = async (
  client: SupabaseClient,
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

  return (data as RecipeSelectionRow | null) ?? null;
};

const loadSelectionById = async (
  client: SupabaseClient,
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

  return data as RecipeSelectionRow;
};

const loadNextSelectionPosition = async (
  client: SupabaseClient,
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

  const highestPosition = (data?.[0] as Pick<RecipeSelectionRow, "position"> | undefined)
    ?.position;

  return typeof highestPosition === "number" ? highestPosition + 1 : 0;
};

const insertSelection = async (
  client: SupabaseClient,
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
    })
    .select(RECIPE_SELECTION_FIELDS)
    .single();

  if (error) {
    return handleRepositoryError(error, "RecipeSelection", input.recipeId);
  }

  return data as RecipeSelectionRow;
};

export const createPlannerRepository = (
  client: SupabaseClient
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

      return [mapSelectionToActiveQuickListRecipe(selection, recipe)];
    });
  },

  async selectRecipe(input) {
    const existingSelection = await loadSelectionByRecipeId(
      client,
      input.projectId,
      input.recipeId
    );
    const recipe = await loadRecipeById(client, input.projectId, input.recipeId);

    if (existingSelection) {
      return mapSelectionToActiveQuickListRecipe(existingSelection, recipe);
    }

    const insertedSelection = await insertSelection(client, input, recipe);

    return mapSelectionToActiveQuickListRecipe(insertedSelection, recipe);
  },

  async markSelectionDone(input) {
    const selection = await loadSelectionById(
      client,
      input.projectId,
      input.selectionId
    );
    const recipe = await loadRecipeById(client, input.projectId, selection.recipe_id);
    const { error } = await client
      .from("recipe_selections")
      .delete()
      .eq("project_id", input.projectId)
      .eq("id", input.selectionId);

    if (error) {
      return handleRepositoryError(error, "RecipeSelection", input.selectionId);
    }

    const doneSelection: DoneQuickListSelection = {
      selectionId: input.selectionId,
      recipeId: selection.recipe_id,
      title: recipe.title,
      status: "done",
    };

    return doneSelection;
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
