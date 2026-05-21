import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";
import type { AppSupabaseClient } from "@/shared/infrastructure/supabase/types";
import { isUuid } from "@/shared/utils/uuid";

import {
  type CatalogRecipeListCursor,
  type CatalogRecipeListFilters,
  type CatalogRecipeListPagination,
  type CookingHistoryEntry,
  isCatalogRecipeCoverStyle,
  normalizeCatalogRecipeListFilters,
  normalizeCatalogRecipeListPagination,
} from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import {
  groupCatalogRecipeFilterOptionIdsByCategory,
  parseCatalogRecipeTagFilterOptionId,
} from "@/modules/recipes/core/domain/catalog/catalogRecipeFilters";
import type { RecipeTag } from "@/modules/recipes/core/domain/recipe.types";
import type { CatalogRepository } from "@/modules/recipes/core/ports/catalog/catalogRepository";
import type { RecipeRow } from "@/modules/recipes/infrastructure/supabase/shared/persistence.types";
import {
  loadRecipeGraphsByIds,
  loadRecipeTagsByRecipeIds,
  mapLoadedRecipeGraphToCatalogDetail,
  mapRecipeRowToCatalogSummary,
  mapRecipeTagRowToDomain,
} from "@/modules/recipes/infrastructure/supabase/shared/readModels";

const loadSelectedRecipeIds = async (
  client: AppSupabaseClient,
  projectId: string
): Promise<Set<string>> => {
  const { data, error } = await client
    .from("recipe_selections")
    .select("recipe_id")
    .eq("project_id", projectId);

  if (error) {
    return handleRepositoryError(error, "RecipeSelection", projectId);
  }

  return new Set((data ?? []).map((selection) => selection.recipe_id));
};

const resolveRecipeIdsMatchingSearch = async (
  client: AppSupabaseClient,
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
    return handleRepositoryError(
      ingredientDisplayError,
      "RecipeIngredient",
      projectId
    );
  }

  if (ingredientNormalizedError) {
    return handleRepositoryError(
      ingredientNormalizedError,
      "RecipeIngredient",
      projectId
    );
  }

  return [
    ...new Set([
      ...(titleMatches ?? []).map((row) => row.id),
      ...(summaryMatches ?? []).map((row) => row.id),
      ...(ingredientDisplayMatches ?? []).map((row) => row.recipe_id),
      ...(ingredientNormalizedMatches ?? []).map((row) => row.recipe_id),
    ]),
  ];
};

const resolveRecipeIdsMatchingSeason = async (
  client: AppSupabaseClient,
  projectId: string
): Promise<string[]> => {
  const currentMonth = new Date().getMonth() + 1;

  const { data, error } = await client
    .from("recipes")
    .select("id")
    .eq("project_id", projectId)
    .contains("seasonal_months", [currentMonth]);

  if (error) {
    return handleRepositoryError(error, "Recipe", projectId);
  }

  return (data ?? []).map((row) => row.id);
};

const resolveRecipeIdsMatchingFilters = async (
  client: AppSupabaseClient,
  projectId: string,
  filterOptionIds: string[]
): Promise<string[] | null> => {
  const selectedOptionsByCategory =
    groupCatalogRecipeFilterOptionIdsByCategory(filterOptionIds);
  const customTagSlugs = [
    ...new Set(
      filterOptionIds.flatMap((filterOptionId) => {
        const tagSlug = parseCatalogRecipeTagFilterOptionId(filterOptionId);

        return tagSlug ? [tagSlug] : [];
      })
    ),
  ];

  const hasSeasonFilter = selectedOptionsByCategory.has("season");
  const tagCategories = new Map(
    [...selectedOptionsByCategory.entries()].filter(([key]) => key !== "season")
  );

  if (
    tagCategories.size === 0 &&
    customTagSlugs.length === 0 &&
    !hasSeasonFilter
  ) {
    return null;
  }

  const [tagMatchedIds, seasonMatchedIds] = await Promise.all([
    (async (): Promise<string[] | null> => {
      if (tagCategories.size === 0 && customTagSlugs.length === 0) {
        return null;
      }

      const requestedTagSlugs = [
        ...new Set(
          [...tagCategories.values()].flatMap((options) =>
            options.flatMap((option) => option.tagSlugs)
          )
        ),
        ...customTagSlugs,
      ];

      const { data: tagData, error: tagError } = await client
        .from("recipe_tags")
        .select("id, slug")
        .eq("project_id", projectId)
        .in("slug", requestedTagSlugs);

      if (tagError) {
        return handleRepositoryError(tagError, "RecipeTag", projectId);
      }

      const tagRows = tagData ?? [];
      const tagIdBySlug = new Map(tagRows.map((tag) => [tag.slug, tag.id]));
      const tagIdsByCategory = new Map<string, Set<string>>();

      for (const [categoryKey, options] of tagCategories.entries()) {
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

      for (const customTagSlug of customTagSlugs) {
        const tagId = tagIdBySlug.get(customTagSlug);

        if (!tagId) {
          return [];
        }

        tagIdsByCategory.set(`custom:${customTagSlug}`, new Set([tagId]));
      }

      const selectedTagIds = [
        ...new Set([...tagIdsByCategory.values()].flatMap((ids) => [...ids])),
      ];
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

      for (const tagLink of tagLinkData ?? []) {
        const matchingCategoryKeys = categoryKeys.filter((categoryKey) =>
          tagIdsByCategory.get(categoryKey)?.has(tagLink.tag_id)
        );

        if (matchingCategoryKeys.length === 0) {
          continue;
        }

        const currentMatchedCategories =
          matchedCategoriesByRecipeId.get(tagLink.recipe_id) ??
          new Set<string>();

        for (const categoryKey of matchingCategoryKeys) {
          currentMatchedCategories.add(categoryKey);
        }

        matchedCategoriesByRecipeId.set(
          tagLink.recipe_id,
          currentMatchedCategories
        );
      }

      return [...matchedCategoriesByRecipeId.entries()]
        .filter(
          ([, matchedCategories]) =>
            matchedCategories.size === categoryKeys.length
        )
        .map(([recipeId]) => recipeId);
    })(),
    hasSeasonFilter
      ? resolveRecipeIdsMatchingSeason(client, projectId)
      : Promise.resolve(null),
  ]);

  return intersectRecipeIds(tagMatchedIds, seasonMatchedIds);
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

type CatalogRecipePage = {
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

const toCatalogRecipePage = (
  recipes: RecipeRow[],
  pageSize: number
): CatalogRecipePage => {
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

const loadCatalogRecipePage = async (
  client: AppSupabaseClient,
  projectId: string,
  filters: CatalogRecipeListFilters | undefined,
  pagination: CatalogRecipeListPagination
): Promise<CatalogRecipePage> => {
  const normalizedFilters = normalizeCatalogRecipeListFilters(filters);
  const [searchRecipeIds, filterRecipeIds] = await Promise.all([
    resolveRecipeIdsMatchingSearch(client, projectId, normalizedFilters.search),
    resolveRecipeIdsMatchingFilters(
      client,
      projectId,
      normalizedFilters.filterOptionIds
    ),
  ]);
  const filteredRecipeIds = intersectRecipeIds(
    searchRecipeIds,
    filterRecipeIds
  );

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

  return toCatalogRecipePage(data ?? [], pagination.pageSize);
};

const listPersistedCatalogTags = async (
  client: AppSupabaseClient,
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
    ...new Set((tagLinkData ?? []).map((tagLink) => tagLink.tag_id)),
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

  return (tagData ?? []).map(mapRecipeTagRowToDomain);
};

export const createCatalogRepository = (
  client: AppSupabaseClient
): CatalogRepository => ({
  async getHeader(projectId, recipeId) {
    if (!isUuid(recipeId)) {
      return null;
    }

    const { data, error } = await client
      .from("recipes")
      .select("id, title")
      .eq("project_id", projectId)
      .eq("id", recipeId)
      .maybeSingle();

    if (error) {
      return handleRepositoryError(error, "Recipe", recipeId);
    }

    return data;
  },
  async listByProject({ projectId, filters, pagination }) {
    const normalizedPagination =
      normalizeCatalogRecipeListPagination(pagination);
    const recipePage = await loadCatalogRecipePage(
      client,
      projectId,
      filters,
      normalizedPagination
    );

    if (recipePage.items.length === 0) {
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
    return listPersistedCatalogTags(client, projectId);
  },

  async getDetail(projectId, recipeId) {
    if (!isUuid(recipeId)) {
      return null;
    }

    const [
      recipeGraphs,
      { data: selectionData, error: selectionError },
      { data: historyData, error: historyError },
    ] = await Promise.all([
      loadRecipeGraphsByIds(client, projectId, [recipeId]),
      client
        .from("recipe_selections")
        .select("id")
        .eq("project_id", projectId)
        .eq("recipe_id", recipeId)
        .maybeSingle(),
      client
        .from("recipe_cooking_history")
        .select("cooked_at")
        .eq("project_id", projectId)
        .eq("recipe_id", recipeId)
        .order("cooked_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (selectionError) {
      return handleRepositoryError(selectionError, "RecipeSelection", recipeId);
    }

    if (historyError) {
      return handleRepositoryError(
        historyError,
        "RecipeCookingHistory",
        recipeId
      );
    }

    const recipeGraph = recipeGraphs.get(recipeId);

    if (!recipeGraph) {
      return null;
    }

    return mapLoadedRecipeGraphToCatalogDetail(
      recipeGraph,
      Boolean(selectionData),
      historyData?.cooked_at ?? null
    );
  },

  async listCookingHistory(projectId, limit) {
    const { data: historyData, error: historyError } = await client
      .from("recipe_cooking_history")
      .select("recipe_id, cooked_at")
      .eq("project_id", projectId)
      .order("cooked_at", { ascending: false })
      .limit(limit * 4);

    if (historyError) {
      return handleRepositoryError(
        historyError,
        "RecipeCookingHistory",
        projectId
      );
    }

    const seen = new Set<string>();
    const unique: Array<{ recipeId: string; cookedAt: string }> = [];

    for (const row of historyData ?? []) {
      if (!seen.has(row.recipe_id)) {
        seen.add(row.recipe_id);
        unique.push({ recipeId: row.recipe_id, cookedAt: row.cooked_at });
      }
      if (unique.length >= limit) break;
    }

    if (unique.length === 0) return [];

    const recipeIds = unique.map((e) => e.recipeId);
    const { data: recipeData, error: recipeError } = await client
      .from("recipes")
      .select("id, title, cover_style")
      .eq("project_id", projectId)
      .in("id", recipeIds);

    if (recipeError) {
      return handleRepositoryError(recipeError, "Recipe", projectId);
    }

    const recipeById = new Map((recipeData ?? []).map((r) => [r.id, r]));

    return unique.flatMap(({ recipeId, cookedAt }): CookingHistoryEntry[] => {
      const recipe = recipeById.get(recipeId);
      if (!recipe) return [];
      const coverStyle = isCatalogRecipeCoverStyle(recipe.cover_style)
        ? recipe.cover_style
        : "neutral";
      return [{ recipeId, title: recipe.title, cookedAt, coverStyle }];
    });
  },
});
