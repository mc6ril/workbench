import type { SupabaseClient } from "@supabase/supabase-js";

import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";
import { isUuid } from "@/shared/utils/uuid";

import {
  type CatalogRecipeListCursor,
  type CatalogRecipeListFilters,
  type CatalogRecipeListPagination,
  normalizeCatalogRecipeListFilters,
  normalizeCatalogRecipeListPagination,
} from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import {
  groupCatalogRecipeFilterOptionIdsByCategory,
} from "@/modules/recipes/core/domain/catalog/catalogRecipeFilters";
import type { RecipeTag } from "@/modules/recipes/core/domain/recipe.types";
import type { CatalogRepository } from "@/modules/recipes/core/ports/catalog/catalogRepository";
import type {
  RecipeIngredientRow,
  RecipeRow,
  RecipeSelectionRow,
  RecipeTagLinkRow,
  RecipeTagRow,
} from "@/modules/recipes/infrastructure/supabase/shared/persistence.types";
import {
  loadRecipeGraphsByIds,
  loadRecipeTagsByRecipeIds,
  mapLoadedRecipeGraphToCatalogDetail,
  mapRecipeRowToCatalogSummary,
  mapRecipeTagRowToDomain,
} from "@/modules/recipes/infrastructure/supabase/shared/readModels";
import {
  getCatalogFixtureDetail,
  listCatalogFixtureRecipePage,
  listCatalogFixtureTags,
} from "@/modules/recipes/infrastructure/supabase/shared/recipesFixtureData";

const hasPersistedCatalogRecipes = async (
  client: SupabaseClient,
  projectId: string
): Promise<boolean> => {
  const { data, error } = await client
    .from("recipes")
    .select("id")
    .eq("project_id", projectId)
    .limit(1);

  if (error) {
    return handleRepositoryError(error, "Recipe", projectId);
  }

  return (data ?? []).length > 0;
};

const loadSelectedRecipeIds = async (
  client: SupabaseClient,
  projectId: string
): Promise<Set<string>> => {
  const { data, error } = await client
    .from("recipe_selections")
    .select("recipe_id")
    .eq("project_id", projectId);

  if (error) {
    return handleRepositoryError(error, "RecipeSelection", projectId);
  }

  return new Set(
    ((data ?? []) as Array<Pick<RecipeSelectionRow, "recipe_id">>).map(
      (selection) => selection.recipe_id
    )
  );
};

const resolveRecipeIdsMatchingSearch = async (
  client: SupabaseClient,
  projectId: string,
  search: string
): Promise<string[] | null> => {
  if (!search) {
    return null;
  }

  const searchPattern = `%${search}%`;
  const [
    { data: titleMatches, error: titleError },
    { data: summaryMatches, error: summaryError },
    { data: ingredientDisplayMatches, error: ingredientDisplayError },
    { data: ingredientNormalizedMatches, error: ingredientNormalizedError },
  ] = await Promise.all([
    client
      .from("recipes")
      .select("id")
      .eq("project_id", projectId)
      .ilike("title", searchPattern),
    client
      .from("recipes")
      .select("id")
      .eq("project_id", projectId)
      .ilike("summary", searchPattern),
    client
      .from("recipe_ingredients")
      .select("recipe_id")
      .eq("project_id", projectId)
      .ilike("display_name", searchPattern),
    client
      .from("recipe_ingredients")
      .select("recipe_id")
      .eq("project_id", projectId)
      .ilike("normalized_name", searchPattern),
  ]);

  if (titleError) {
    return handleRepositoryError(titleError, "Recipe", projectId);
  }

  if (summaryError) {
    return handleRepositoryError(summaryError, "Recipe", projectId);
  }

  if (ingredientDisplayError) {
    return handleRepositoryError(ingredientDisplayError, "RecipeIngredient", projectId);
  }

  if (ingredientNormalizedError) {
    return handleRepositoryError(ingredientNormalizedError, "RecipeIngredient", projectId);
  }

  return [
    ...new Set([
      ...((titleMatches ?? []) as Array<Pick<RecipeRow, "id">>).map((row) => row.id),
      ...((summaryMatches ?? []) as Array<Pick<RecipeRow, "id">>).map((row) => row.id),
      ...((ingredientDisplayMatches ?? []) as Array<Pick<RecipeIngredientRow, "recipe_id">>).map(
        (row) => row.recipe_id
      ),
      ...((ingredientNormalizedMatches ?? []) as Array<
        Pick<RecipeIngredientRow, "recipe_id">
      >).map((row) => row.recipe_id),
    ]),
  ];
};

const resolveRecipeIdsMatchingFilters = async (
  client: SupabaseClient,
  projectId: string,
  filterOptionIds: string[]
): Promise<string[] | null> => {
  const selectedOptionsByCategory =
    groupCatalogRecipeFilterOptionIdsByCategory(filterOptionIds);

  if (selectedOptionsByCategory.size === 0) {
    return null;
  }

  const requestedTagSlugs = [
    ...new Set(
      [...selectedOptionsByCategory.values()].flatMap((options) =>
        options.flatMap((option) => option.tagSlugs)
      )
    ),
  ];

  const { data: tagData, error: tagError } = await client
    .from("recipe_tags")
    .select("id, slug")
    .eq("project_id", projectId)
    .in("slug", requestedTagSlugs);

  if (tagError) {
    return handleRepositoryError(tagError, "RecipeTag", projectId);
  }

  const tagRows = (tagData ?? []) as Array<Pick<RecipeTagRow, "id" | "slug">>;
  const tagIdBySlug = new Map(tagRows.map((tag) => [tag.slug, tag.id]));
  const tagIdsByCategory = new Map<string, Set<string>>();

  for (const [categoryKey, options] of selectedOptionsByCategory.entries()) {
    const tagIds = new Set(
      options.flatMap((option) =>
        option.tagSlugs.flatMap((tagSlug) => {
          const tagId = tagIdBySlug.get(tagSlug);
          return tagId ? [tagId] : [];
        })
      )
    );

    if (tagIds.size === 0) {
      return [];
    }

    tagIdsByCategory.set(categoryKey, tagIds);
  }

  const selectedTagIds = [...new Set([...tagIdsByCategory.values()].flatMap((ids) => [...ids]))];
  const { data: tagLinkData, error: tagLinkError } = await client
    .from("recipe_tag_links")
    .select("recipe_id, tag_id")
    .eq("project_id", projectId)
    .in("tag_id", selectedTagIds);

  if (tagLinkError) {
    return handleRepositoryError(tagLinkError, "RecipeTagLink", projectId);
  }

  const categoryKeys = [...tagIdsByCategory.keys()];
  const matchedCategoriesByRecipeId = new Map<string, Set<string>>();

  for (const tagLink of (tagLinkData ?? []) as RecipeTagLinkRow[]) {
    const matchingCategoryKeys = categoryKeys.filter((categoryKey) =>
      tagIdsByCategory.get(categoryKey)?.has(tagLink.tag_id)
    );

    if (matchingCategoryKeys.length === 0) {
      continue;
    }

    const currentMatchedCategories =
      matchedCategoriesByRecipeId.get(tagLink.recipe_id) ?? new Set<string>();

    for (const categoryKey of matchingCategoryKeys) {
      currentMatchedCategories.add(categoryKey);
    }

    matchedCategoriesByRecipeId.set(tagLink.recipe_id, currentMatchedCategories);
  }

  return [...matchedCategoriesByRecipeId.entries()]
    .filter(([, matchedCategories]) => matchedCategories.size === categoryKeys.length)
    .map(([recipeId]) => recipeId);
};

const intersectRecipeIds = (
  left: string[] | null,
  right: string[] | null
): string[] | null => {
  if (!left && !right) {
    return null;
  }

  if (!left) {
    return right;
  }

  if (!right) {
    return left;
  }

  const rightIds = new Set(right);
  return left.filter((recipeId) => rightIds.has(recipeId));
};

type CatalogRecipeRowPage = {
  items: RecipeRow[];
  nextCursor: CatalogRecipeListCursor | null;
  hasMore: boolean;
};

const buildCatalogRecipeListCursor = (
  recipe: Pick<RecipeRow, "id" | "updated_at">
): CatalogRecipeListCursor => {
  return {
    updatedAt: recipe.updated_at,
    id: recipe.id,
  };
};

const toCatalogRecipeRowPage = (
  recipes: RecipeRow[],
  pageSize: number
): CatalogRecipeRowPage => {
  const items = recipes.slice(0, pageSize);
  const hasMore = recipes.length > pageSize;

  return {
    items,
    hasMore,
    nextCursor:
      hasMore && items.length > 0
        ? buildCatalogRecipeListCursor(items[items.length - 1])
        : null,
  };
};

const loadCatalogRecipeRows = async (
  client: SupabaseClient,
  projectId: string,
  filters: CatalogRecipeListFilters | undefined,
  pagination: CatalogRecipeListPagination
): Promise<CatalogRecipeRowPage> => {
  const normalizedFilters = normalizeCatalogRecipeListFilters(filters);
  const [searchRecipeIds, filterRecipeIds] = await Promise.all([
    resolveRecipeIdsMatchingSearch(client, projectId, normalizedFilters.search),
    resolveRecipeIdsMatchingFilters(
      client,
      projectId,
      normalizedFilters.filterOptionIds
    ),
  ]);
  const filteredRecipeIds = intersectRecipeIds(searchRecipeIds, filterRecipeIds);

  if (filteredRecipeIds && filteredRecipeIds.length === 0) {
    return {
      items: [],
      hasMore: false,
      nextCursor: null,
    };
  }

  let recipesQuery = client
    .from("recipes")
    .select("*")
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(pagination.pageSize + 1);

  if (filteredRecipeIds) {
    recipesQuery = recipesQuery.in("id", filteredRecipeIds);
  }

  if (pagination.cursor) {
    recipesQuery = recipesQuery.or(
      [
        `updated_at.lt.${pagination.cursor.updatedAt}`,
        `and(updated_at.eq.${pagination.cursor.updatedAt},id.lt.${pagination.cursor.id})`,
      ].join(",")
    );
  }

  const { data, error } = await recipesQuery;

  if (error) {
    return handleRepositoryError(error, "Recipe", projectId);
  }

  return toCatalogRecipeRowPage((data ?? []) as RecipeRow[], pagination.pageSize);
};

const listPersistedCatalogTags = async (
  client: SupabaseClient,
  projectId: string
): Promise<RecipeTag[]> => {
  const { data: tagLinkData, error: tagLinkError } = await client
    .from("recipe_tag_links")
    .select("tag_id")
    .eq("project_id", projectId);

  if (tagLinkError) {
    return handleRepositoryError(tagLinkError, "RecipeTagLink", projectId);
  }

  const tagIds = [
    ...new Set(
      ((tagLinkData ?? []) as Array<Pick<RecipeTagLinkRow, "tag_id">>).map(
        (tagLink) => tagLink.tag_id
      )
    ),
  ];

  if (tagIds.length === 0) {
    return [];
  }

  const { data: tagData, error: tagError } = await client
    .from("recipe_tags")
    .select("*")
    .eq("project_id", projectId)
    .in("id", tagIds)
    .order("label", { ascending: true });

  if (tagError) {
    return handleRepositoryError(tagError, "RecipeTag", projectId);
  }

  return ((tagData ?? []) as RecipeTagRow[]).map(mapRecipeTagRowToDomain);
};

/**
 * Step 6:
 * keep the real Recipes schema as the source of truth for catalogue reads and
 * reduce the fixture fallback to the catalogue repository only while write flows
 * are still landing in later steps.
 */
export const createCatalogRepository = (
  client: SupabaseClient
): CatalogRepository => ({
  async listByProject({ projectId, filters, pagination }) {
    const normalizedPagination =
      normalizeCatalogRecipeListPagination(pagination);
    const recipePage = await loadCatalogRecipeRows(
      client,
      projectId,
      filters,
      normalizedPagination
    );

    if (recipePage.items.length === 0) {
      const hasPersistedRecipes = await hasPersistedCatalogRecipes(client, projectId);

      if (!hasPersistedRecipes) {
        return listCatalogFixtureRecipePage(filters, normalizedPagination);
      }

      return {
        items: [],
        hasMore: false,
        nextCursor: null,
      };
    }

    const recipeIds = recipePage.items.map((recipe) => recipe.id);
    const [tagsByRecipeId, selectedRecipeIds] = await Promise.all([
      loadRecipeTagsByRecipeIds(client, projectId, recipeIds),
      loadSelectedRecipeIds(client, projectId),
    ]);

    return {
      items: recipePage.items.map((recipe) =>
        mapRecipeRowToCatalogSummary(
          recipe,
          tagsByRecipeId.get(recipe.id) ?? [],
          selectedRecipeIds.has(recipe.id)
        )
      ),
      hasMore: recipePage.hasMore,
      nextCursor: recipePage.nextCursor,
    };
  },

  async listTagsByProject(projectId) {
    const tags = await listPersistedCatalogTags(client, projectId);

    if (tags.length > 0) {
      return tags;
    }

    const hasPersistedRecipes = await hasPersistedCatalogRecipes(client, projectId);

    if (!hasPersistedRecipes) {
      return listCatalogFixtureTags();
    }

    return [];
  },

  async getDetail(projectId, recipeId) {
    if (!isUuid(recipeId)) {
      return getCatalogFixtureDetail(recipeId);
    }

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
