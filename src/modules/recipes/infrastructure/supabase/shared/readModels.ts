import { createDatabaseError } from "@/shared/errors/repositoryError";
import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";
import type { AppSupabaseClient } from "@/shared/infrastructure/supabase/types";

import {
  mapRecipeIngredientRowToDomain,
  mapShoppingListItemIngredientRowToDomain,
} from "./ingredientMappers";
import type {
  RecipeIngredientRow,
  RecipeRow,
  RecipeSelectionRow,
  RecipeStepRow,
  RecipeTagRow,
  ShoppingListItemRow,
  ShoppingListRecipeSourceJson,
} from "./persistence.types";

import type {
  CatalogRecipeCoverStyle,
  CatalogRecipeDetail,
  CatalogRecipeSummary,
} from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import { isCatalogRecipeCoverStyle } from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import type { RecipeDraft } from "@/modules/recipes/core/domain/editor/recipeDraft.types";
import { buildRecipeServingsLabel } from "@/modules/recipes/core/domain/editor/recipeEditor.helpers";
import {
  type Recipe,
  type RecipeSelection,
  type RecipeTag,
} from "@/modules/recipes/core/domain/recipe.types";

type LoadedRecipeGraph = {
  recipe: RecipeRow;
  ingredients: RecipeIngredientRow[];
  steps: RecipeStepRow[];
  tags: RecipeTag[];
};

const mapRecipeCoverStyle = (value: string): CatalogRecipeCoverStyle => {
  if (isCatalogRecipeCoverStyle(value)) {
    return value;
  }

  throw createDatabaseError(`Invalid recipe cover style: ${value}`);
};

export const mapRecipeTagRowToDomain = (row: RecipeTagRow): RecipeTag => {
  return {
    id: row.id,
    label: row.label,
    slug: row.slug,
  };
};

const mapRecipeStepRowToDomain = (
  row: RecipeStepRow
): Recipe["steps"][number] => {
  return {
    id: row.id,
    position: row.position,
    title: row.title,
    instruction: row.instruction,
    notes: row.notes,
    meta: row.meta,
  };
};

const mapLoadedRecipeGraphToRecipe = (graph: LoadedRecipeGraph): Recipe => {
  return {
    id: graph.recipe.id,
    title: graph.recipe.title,
    summary: graph.recipe.summary,
    totalTimeMinutes: graph.recipe.total_time_minutes,
    totalTimeLabel: graph.recipe.total_time_label,
    servingsCount: graph.recipe.servings_count,
    servingsLabel: buildRecipeServingsLabel({
      servingsCount: graph.recipe.servings_count,
    }),
    seasonalMonths: graph.recipe.seasonal_months ?? [],
    tags: graph.tags,
    ingredients: graph.ingredients.map(mapRecipeIngredientRowToDomain),
    steps: graph.steps.map(mapRecipeStepRowToDomain),
    note: graph.recipe.note,
    coverImageUrl: graph.recipe.cover_image_url,
  };
};

export const mapLoadedRecipeGraphToDraft = (
  graph: LoadedRecipeGraph
): RecipeDraft => {
  const recipe = mapLoadedRecipeGraphToRecipe(graph);

  return {
    ...recipe,
    id: recipe.id,
  };
};

export const mapLoadedRecipeGraphToCatalogSummary = (
  graph: LoadedRecipeGraph,
  isInQuickList: boolean
): CatalogRecipeSummary => {
  return mapRecipeRowToCatalogSummary(graph.recipe, graph.tags, isInQuickList);
};

export const mapRecipeRowToCatalogSummary = (
  recipe: RecipeRow,
  tags: RecipeTag[],
  isInQuickList: boolean
): CatalogRecipeSummary => {
  return {
    id: recipe.id,
    title: recipe.title,
    summary: recipe.summary,
    totalTimeLabel: recipe.total_time_label,
    servingsLabel: buildRecipeServingsLabel({
      servingsCount: recipe.servings_count,
    }),
    seasonalMonths: recipe.seasonal_months ?? [],
    coverImageUrl: recipe.cover_image_url,
    tags,
    coverStyle: mapRecipeCoverStyle(recipe.cover_style),
    isInQuickList,
  };
};

export const mapLoadedRecipeGraphToCatalogDetail = (
  graph: LoadedRecipeGraph,
  isInQuickList: boolean,
  lastCookedAt: string | null
): CatalogRecipeDetail => {
  const recipe = mapLoadedRecipeGraphToRecipe(graph);

  return {
    ...mapLoadedRecipeGraphToCatalogSummary(graph, isInQuickList),
    note: recipe.note,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    lastCookedAt,
  };
};

export const mapRecipeSelectionRowToDomain = (
  selection: RecipeSelectionRow,
  recipe: RecipeRow
): RecipeSelection => {
  const servingsCount = selection.servings_count ?? recipe.servings_count;

  return {
    id: selection.id,
    recipeId: selection.recipe_id,
    title: recipe.title,
    note: selection.note,
    servingsCount,
    servingsLabel: buildRecipeServingsLabel({
      servingsCount,
    }),
  };
};

export const parseShoppingListRecipeSources = (
  value: unknown
): ShoppingListRecipeSourceJson[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const recipeId = "recipeId" in item ? item.recipeId : null;
    const title = "title" in item ? item.title : null;

    if (typeof recipeId !== "string" || typeof title !== "string") {
      return [];
    }

    return [{ recipeId, title }];
  });
};

export const mapShoppingListItemRowToDomain = (row: ShoppingListItemRow) => {
  return {
    id: row.id,
    ingredient: mapShoppingListItemIngredientRowToDomain(row),
    checked: row.checked,
    recipes: parseShoppingListRecipeSources(row.recipe_sources),
  };
};

export const loadRecipeTagsByRecipeIds = async (
  client: AppSupabaseClient,
  projectId: string,
  recipeIds: string[]
): Promise<Map<string, RecipeTag[]>> => {
  if (recipeIds.length === 0) {
    return new Map();
  }

  const { data: tagLinkData, error: tagLinkError } = await client
    .from("recipe_tag_links")
    .select("project_id, recipe_id, tag_id, created_at")
    .eq("project_id", projectId)
    .in("recipe_id", recipeIds)
    .order("created_at", { ascending: true });

  if (tagLinkError) {
    return handleRepositoryError(tagLinkError, "RecipeTagLink", projectId);
  }

  const tagLinks = tagLinkData ?? [];
  const tagIds = [...new Set(tagLinks.map((tagLink) => tagLink.tag_id))];

  if (tagIds.length === 0) {
    return new Map(recipeIds.map((recipeId) => [recipeId, []]));
  }

  const { data: tagData, error: tagError } = await client
    .from("recipe_tags")
    .select("*")
    .eq("project_id", projectId)
    .in("id", tagIds);

  if (tagError) {
    return handleRepositoryError(tagError, "RecipeTag", projectId);
  }

  const tagRowsById = new Map(
    (tagData ?? []).map((tag) => [tag.id, mapRecipeTagRowToDomain(tag)])
  );

  const tagsByRecipeId = new Map<string, RecipeTag[]>();

  for (const recipeId of recipeIds) {
    tagsByRecipeId.set(recipeId, []);
  }

  for (const tagLink of tagLinks) {
    const tag = tagRowsById.get(tagLink.tag_id);

    if (!tag) {
      continue;
    }

    const currentRecipeTags = tagsByRecipeId.get(tagLink.recipe_id) ?? [];
    currentRecipeTags.push(tag);
    tagsByRecipeId.set(tagLink.recipe_id, currentRecipeTags);
  }

  return tagsByRecipeId;
};

export const loadRecipeGraphsByIds = async (
  client: AppSupabaseClient,
  projectId: string,
  requestedRecipeIds?: string[]
): Promise<Map<string, LoadedRecipeGraph>> => {
  if (requestedRecipeIds && requestedRecipeIds.length === 0) {
    return new Map();
  }

  let recipesQuery = client
    .from("recipes")
    .select("*")
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });

  if (requestedRecipeIds) {
    recipesQuery = recipesQuery.in("id", requestedRecipeIds);
  }

  const { data: recipeData, error: recipeError } = await recipesQuery;

  if (recipeError) {
    return handleRepositoryError(recipeError, "Recipe", projectId);
  }

  const recipes = recipeData ?? [];

  if (recipes.length === 0) {
    return new Map();
  }

  const recipeIds = recipes.map((recipe) => recipe.id);

  const [
    { data: ingredientData, error: ingredientError },
    { data: stepData, error: stepError },
    { data: tagLinkData, error: tagLinkError },
  ] = await Promise.all([
    client
      .from("recipe_ingredients")
      .select("*")
      .eq("project_id", projectId)
      .in("recipe_id", recipeIds)
      .order("position", { ascending: true }),
    client
      .from("recipe_steps")
      .select("*")
      .eq("project_id", projectId)
      .in("recipe_id", recipeIds)
      .order("position", { ascending: true }),
    client
      .from("recipe_tag_links")
      .select("project_id, recipe_id, tag_id, created_at")
      .eq("project_id", projectId)
      .in("recipe_id", recipeIds)
      .order("created_at", { ascending: true }),
  ]);

  if (ingredientError) {
    return handleRepositoryError(
      ingredientError,
      "RecipeIngredient",
      projectId
    );
  }

  if (stepError) {
    return handleRepositoryError(stepError, "RecipeStep", projectId);
  }

  if (tagLinkError) {
    return handleRepositoryError(tagLinkError, "RecipeTagLink", projectId);
  }

  const tagLinks = tagLinkData ?? [];
  const tagIds = [...new Set(tagLinks.map((tagLink) => tagLink.tag_id))];

  let tags: RecipeTagRow[] = [];

  if (tagIds.length > 0) {
    const { data: tagData, error: tagError } = await client
      .from("recipe_tags")
      .select("*")
      .eq("project_id", projectId)
      .in("id", tagIds);

    if (tagError) {
      return handleRepositoryError(tagError, "RecipeTag", projectId);
    }

    tags = tagData ?? [];
  }

  const ingredientsByRecipeId = new Map<string, RecipeIngredientRow[]>();
  const stepsByRecipeId = new Map<string, RecipeStepRow[]>();
  const tagsByRecipeId = new Map<string, RecipeTag[]>();
  const tagRowsById = new Map(
    tags.map((tag) => [tag.id, mapRecipeTagRowToDomain(tag)])
  );

  for (const ingredient of ingredientData ?? []) {
    const currentRecipeIngredients =
      ingredientsByRecipeId.get(ingredient.recipe_id) ?? [];
    currentRecipeIngredients.push(ingredient);
    ingredientsByRecipeId.set(ingredient.recipe_id, currentRecipeIngredients);
  }

  for (const step of stepData ?? []) {
    const currentRecipeSteps = stepsByRecipeId.get(step.recipe_id) ?? [];
    currentRecipeSteps.push(step);
    stepsByRecipeId.set(step.recipe_id, currentRecipeSteps);
  }

  for (const tagLink of tagLinks) {
    const tag = tagRowsById.get(tagLink.tag_id);

    if (!tag) {
      continue;
    }

    const currentRecipeTags = tagsByRecipeId.get(tagLink.recipe_id) ?? [];
    currentRecipeTags.push(tag);
    tagsByRecipeId.set(tagLink.recipe_id, currentRecipeTags);
  }

  return new Map(
    recipes.map((recipe) => [
      recipe.id,
      {
        recipe,
        ingredients: ingredientsByRecipeId.get(recipe.id) ?? [],
        steps: stepsByRecipeId.get(recipe.id) ?? [],
        tags: tagsByRecipeId.get(recipe.id) ?? [],
      },
    ])
  );
};
