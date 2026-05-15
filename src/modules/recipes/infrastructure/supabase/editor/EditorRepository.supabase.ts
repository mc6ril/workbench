import { createNotFoundError } from "@/shared/errors/repositoryError";
import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";
import type { AppSupabaseClient } from "@/shared/infrastructure/supabase/types";
import { isUuid } from "@/shared/utils/uuid";

import { EMPTY_RECIPE_DRAFT } from "@/modules/recipes/core/domain/editor/recipeDraft.types";
import type {
  CreateRecipeInput,
  PersistedRecipeIngredientInput,
  PersistedRecipeStepInput,
  PersistedRecipeTagInput,
  PromoteRecipeAdditionInput,
  UpdateRecipeInput,
} from "@/modules/recipes/core/domain/editor/recipeEditor.types";
import type { EditorRepository } from "@/modules/recipes/core/ports/editor/editorRepository";
import type {
  RecipeTagLinkRow,
  RecipeTagRow,
} from "@/modules/recipes/infrastructure/supabase/shared/persistence.types";
import {
  loadRecipeGraphsByIds,
  mapLoadedRecipeGraphToDraft,
  mapRecipeTagRowToDomain,
} from "@/modules/recipes/infrastructure/supabase/shared/readModels";

const buildRecipeRowPayload = (
  input: CreateRecipeInput | UpdateRecipeInput
) => {
  return {
    project_id: input.projectId,
    title: input.title,
    summary: input.summary,
    total_time_minutes: input.totalTimeMinutes,
    total_time_label: input.totalTimeLabel,
    servings_count: input.servingsCount,
    servings_label: input.servingsLabel,
    note: input.note,
    cover_image_url: input.coverImageUrl,
    cover_style: input.coverStyle,
  };
};

const mapPersistedIngredientToRow = (
  projectId: string,
  recipeId: string,
  ingredient: PersistedRecipeIngredientInput
) => {
  return {
    project_id: projectId,
    recipe_id: recipeId,
    position: ingredient.position,
    display_name: ingredient.displayName,
    normalized_name: ingredient.normalizedName,
    amount_value: ingredient.amountValue,
    amount_text: ingredient.amountText,
    unit: ingredient.unit,
    notes: ingredient.notes,
    kind: ingredient.kind,
  };
};

const mapPersistedStepToRow = (
  projectId: string,
  recipeId: string,
  step: PersistedRecipeStepInput
) => {
  return {
    project_id: projectId,
    recipe_id: recipeId,
    position: step.position,
    title: step.title,
    instruction: step.instruction,
    notes: step.notes,
    meta: step.meta,
  };
};

const loadPersistedDraft = async (
  client: AppSupabaseClient,
  projectId: string,
  recipeId: string
) => {
  const recipeGraphs = await loadRecipeGraphsByIds(client, projectId, [
    recipeId,
  ]);
  const recipeGraph = recipeGraphs.get(recipeId);

  if (!recipeGraph) {
    throw createNotFoundError("Recipe", recipeId);
  }

  return mapLoadedRecipeGraphToDraft(recipeGraph);
};

const replaceRecipeIngredients = async (
  client: AppSupabaseClient,
  projectId: string,
  recipeId: string,
  ingredients: PersistedRecipeIngredientInput[]
) => {
  const { error: deleteError } = await client
    .from("recipe_ingredients")
    .delete()
    .eq("project_id", projectId)
    .eq("recipe_id", recipeId);

  if (deleteError) {
    return handleRepositoryError(deleteError, "RecipeIngredient", recipeId);
  }

  if (ingredients.length === 0) {
    return;
  }

  const { error: insertError } = await client
    .from("recipe_ingredients")
    .insert(
      ingredients.map((ingredient) =>
        mapPersistedIngredientToRow(projectId, recipeId, ingredient)
      )
    );

  if (insertError) {
    return handleRepositoryError(insertError, "RecipeIngredient", recipeId);
  }
};

const replaceRecipeSteps = async (
  client: AppSupabaseClient,
  projectId: string,
  recipeId: string,
  steps: PersistedRecipeStepInput[]
) => {
  const { error: deleteError } = await client
    .from("recipe_steps")
    .delete()
    .eq("project_id", projectId)
    .eq("recipe_id", recipeId);

  if (deleteError) {
    return handleRepositoryError(deleteError, "RecipeStep", recipeId);
  }

  if (steps.length === 0) {
    return;
  }

  const { error: insertError } = await client
    .from("recipe_steps")
    .insert(
      steps.map((step) => mapPersistedStepToRow(projectId, recipeId, step))
    );

  if (insertError) {
    return handleRepositoryError(insertError, "RecipeStep", recipeId);
  }
};

const ensurePersistedTags = async (
  client: AppSupabaseClient,
  projectId: string,
  tags: PersistedRecipeTagInput[]
): Promise<RecipeTagRow[]> => {
  if (tags.length === 0) {
    return [];
  }

  const tagSlugs = tags.map((tag) => tag.slug);
  const { data: existingTagData, error: existingTagError } = await client
    .from("recipe_tags")
    .select("*")
    .eq("project_id", projectId)
    .in("slug", tagSlugs);

  if (existingTagError) {
    return handleRepositoryError(existingTagError, "RecipeTag", projectId);
  }

  const existingTags = existingTagData ?? [];
  const existingSlugs = new Set(existingTags.map((tag) => tag.slug));
  const missingTags = tags.filter((tag) => !existingSlugs.has(tag.slug));

  if (missingTags.length > 0) {
    const { error: insertError } = await client.from("recipe_tags").upsert(
      missingTags.map((tag) => ({
        project_id: projectId,
        label: tag.label,
        slug: tag.slug,
      })),
      {
        onConflict: "project_id,slug",
        ignoreDuplicates: true,
      }
    );

    if (insertError) {
      return handleRepositoryError(insertError, "RecipeTag", projectId);
    }
  }

  const { data: tagData, error: tagError } = await client
    .from("recipe_tags")
    .select("*")
    .eq("project_id", projectId)
    .in("slug", tagSlugs);

  if (tagError) {
    return handleRepositoryError(tagError, "RecipeTag", projectId);
  }

  return tagData ?? [];
};

const replaceRecipeTagLinks = async (
  client: AppSupabaseClient,
  projectId: string,
  recipeId: string,
  tags: PersistedRecipeTagInput[]
) => {
  const { error: deleteError } = await client
    .from("recipe_tag_links")
    .delete()
    .eq("project_id", projectId)
    .eq("recipe_id", recipeId);

  if (deleteError) {
    return handleRepositoryError(deleteError, "RecipeTagLink", recipeId);
  }

  if (tags.length === 0) {
    return;
  }

  const persistedTags = await ensurePersistedTags(client, projectId, tags);

  if (persistedTags.length === 0) {
    return;
  }

  const tagLinks: RecipeTagLinkRow[] = persistedTags.map((tag) => ({
    project_id: projectId,
    recipe_id: recipeId,
    tag_id: tag.id,
    created_at: new Date().toISOString(),
  }));

  const { error: insertError } = await client
    .from("recipe_tag_links")
    .insert(tagLinks);

  if (insertError) {
    return handleRepositoryError(insertError, "RecipeTagLink", recipeId);
  }
};

const syncRecipeGraph = async (
  client: AppSupabaseClient,
  input: CreateRecipeInput | UpdateRecipeInput,
  recipeId: string
) => {
  await replaceRecipeIngredients(
    client,
    input.projectId,
    recipeId,
    input.ingredients
  );
  await replaceRecipeSteps(client, input.projectId, recipeId, input.steps);
  await replaceRecipeTagLinks(client, input.projectId, recipeId, input.tags);
};

const promoteAdditionToValidated = async (
  client: AppSupabaseClient,
  input: PromoteRecipeAdditionInput
) => {
  const { data, error } = await client
    .from("recipe_ingredients")
    .update({
      kind: "validated",
    })
    .eq("project_id", input.projectId)
    .eq("recipe_id", input.recipeId)
    .eq("id", input.ingredientId)
    .eq("kind", "addition_candidate")
    .select("id")
    .maybeSingle();

  if (error) {
    return handleRepositoryError(error, "RecipeIngredient", input.ingredientId);
  }

  if (!data) {
    throw createNotFoundError("RecipeIngredient", input.ingredientId);
  }
};

export const createEditorRepository = (
  client: AppSupabaseClient
): EditorRepository => ({
  async getCreationDraft() {
    return EMPTY_RECIPE_DRAFT;
  },

  async getDraft(projectId, recipeId) {
    if (!isUuid(recipeId)) {
      return null;
    }

    const recipeGraphs = await loadRecipeGraphsByIds(client, projectId, [
      recipeId,
    ]);
    const recipeGraph = recipeGraphs.get(recipeId);

    if (!recipeGraph) {
      return null;
    }

    return mapLoadedRecipeGraphToDraft(recipeGraph);
  },

  async listTagsByProject(projectId) {
    const { data, error } = await client
      .from("recipe_tags")
      .select("*")
      .eq("project_id", projectId)
      .order("label", { ascending: true });

    if (error) {
      return handleRepositoryError(error, "RecipeTag", projectId);
    }

    return (data ?? []).map(mapRecipeTagRowToDomain);
  },

  async promoteAdditionToValidated(input) {
    return promoteAdditionToValidated(client, input);
  },

  async createRecipe(input) {
    const { data, error } = await client
      .from("recipes")
      .insert(buildRecipeRowPayload(input))
      .select("id")
      .single();

    if (error) {
      return handleRepositoryError(error, "Recipe", input.projectId);
    }

    if (!data) {
      throw createNotFoundError("Recipe", "unknown");
    }

    await syncRecipeGraph(client, input, data.id);

    return loadPersistedDraft(client, input.projectId, data.id);
  },

  async updateRecipe(input) {
    const { data, error } = await client
      .from("recipes")
      .update(buildRecipeRowPayload(input))
      .eq("project_id", input.projectId)
      .eq("id", input.recipeId)
      .select("id")
      .maybeSingle();

    if (error) {
      return handleRepositoryError(error, "Recipe", input.recipeId);
    }

    if (!data) {
      throw createNotFoundError("Recipe", input.recipeId);
    }

    await syncRecipeGraph(client, input, data.id);

    return loadPersistedDraft(client, input.projectId, data.id);
  },
});
