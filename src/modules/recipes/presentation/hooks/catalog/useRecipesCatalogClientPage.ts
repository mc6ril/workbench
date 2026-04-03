"use client";

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useTranslation } from "@/shared/i18n";

import type { CatalogRecipeListResponse } from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import type { QuickListRecipe } from "@/modules/recipes/core/domain/planner/quickList.types";
import { buildRecipesCatalogFilterGroups } from "@/modules/recipes/presentation/components/catalog/recipesCatalogFilterGroups";
import { useListRecipes } from "@/modules/recipes/presentation/hooks/catalog/listRecipes";
import { useListActiveSelections } from "@/modules/recipes/presentation/hooks/planner/listActiveSelections";
import type { RecipesCatalogQueryState } from "@/modules/recipes/presentation/routing/catalogSearchParams";
import {
  buildRecipesCatalogSearchParams,
  parseRecipesCatalogSearchParams,
} from "@/modules/recipes/presentation/routing/catalogSearchParams";
import { useRecipesCatalogFiltersStore } from "@/modules/recipes/presentation/stores";

type Input = {
  projectId: string;
  initialRecipesPage: CatalogRecipeListResponse;
  initialQueryState: RecipesCatalogQueryState;
  quickListRecipes: QuickListRecipe[];
};

const areFilterOptionIdsEqual = (left: string[], right: string[]) => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
};

export const useRecipesCatalogClientPage = ({
  projectId,
  initialRecipesPage,
  initialQueryState,
  quickListRecipes,
}: Input) => {
  const t = useTranslation("pages.recipes.catalog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const initializedCatalogStateRef = useRef<string | null>(null);
  const catalogMainRef = useRef<HTMLDivElement | null>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);
  const initialQueryStateKey = `${projectId}:${initialQueryState.search}:${initialQueryState.filterOptionIds.join(",")}`;

  const search = useRecipesCatalogFiltersStore((state) => state.search);
  const selectedFilterOptionIds = useRecipesCatalogFiltersStore(
    (state) => state.selectedFilterOptionIds
  );
  const draftSelectedFilterOptionIds = useRecipesCatalogFiltersStore(
    (state) => state.draftSelectedFilterOptionIds
  );
  const isQuickListOpen = useRecipesCatalogFiltersStore(
    (state) => state.isQuickListOpen
  );
  const isFiltersOpen = useRecipesCatalogFiltersStore(
    (state) => state.isFiltersOpen
  );
  const initializeCatalogState = useRecipesCatalogFiltersStore(
    (state) => state.initializeCatalogState
  );
  const syncFromQueryState = useRecipesCatalogFiltersStore(
    (state) => state.syncFromQueryState
  );
  const toggleDraftFilterOptionId = useRecipesCatalogFiltersStore(
    (state) => state.toggleDraftFilterOptionId
  );
  const applyDraftFilters = useRecipesCatalogFiltersStore(
    (state) => state.applyDraftFilters
  );
  const resetDraftFilters = useRecipesCatalogFiltersStore(
    (state) => state.resetDraftFilters
  );
  const clearFilters = useRecipesCatalogFiltersStore(
    (state) => state.clearFilters
  );
  const setQuickListOpen = useRecipesCatalogFiltersStore(
    (state) => state.setQuickListOpen
  );
  const closeFilters = useRecipesCatalogFiltersStore(
    (state) => state.closeFilters
  );
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    if (initializedCatalogStateRef.current === initialQueryStateKey) {
      return;
    }

    initializeCatalogState({
      search: initialQueryState.search,
      filterOptionIds: initialQueryState.filterOptionIds,
    });
    initializedCatalogStateRef.current = initialQueryStateKey;
  }, [
    initialQueryState.search,
    initialQueryState.filterOptionIds,
    initialQueryStateKey,
    initializeCatalogState,
  ]);

  useEffect(() => {
    const nextQueryState = parseRecipesCatalogSearchParams(
      new URLSearchParams(searchParamsKey)
    );
    const currentState = useRecipesCatalogFiltersStore.getState();

    if (
      nextQueryState.search === currentState.search &&
      areFilterOptionIdsEqual(
        nextQueryState.filterOptionIds,
        currentState.selectedFilterOptionIds
      )
    ) {
      return;
    }

    syncFromQueryState(nextQueryState);
  }, [searchParamsKey, syncFromQueryState]);

  useEffect(() => {
    const nextSearchParams = buildRecipesCatalogSearchParams({
      search,
      filterOptionIds: selectedFilterOptionIds,
    });
    const nextSearchParamsString = nextSearchParams.toString();

    if (nextSearchParamsString === searchParamsKey) {
      return;
    }

    startTransition(() => {
      router.replace(
        nextSearchParamsString
          ? `${pathname}?${nextSearchParamsString}`
          : pathname,
        {
          scroll: false,
        }
      );
    });
  }, [pathname, router, search, searchParamsKey, selectedFilterOptionIds]);

  const isInitialRecipesQuery =
    deferredSearch === initialQueryState.search &&
    areFilterOptionIdsEqual(
      selectedFilterOptionIds,
      initialQueryState.filterOptionIds
    );

  const recipesQuery = useListRecipes(
    projectId,
    {
      search: deferredSearch,
      filterOptionIds: selectedFilterOptionIds,
    },
    {
      initialData: isInitialRecipesQuery ? initialRecipesPage : undefined,
    }
  );
  const quickListQuery = useListActiveSelections(projectId, {
    initialData: quickListRecipes,
  });

  const {
    recipes,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
  } = recipesQuery;
  const filterGroups = useMemo(() => buildRecipesCatalogFilterGroups(t), [t]);
  const selectedFilterLabels = useMemo(() => {
    const labelsById = new Map(
      filterGroups.flatMap((group) =>
        group.options.map((option) => [option.id, option.label] as const)
      )
    );

    return selectedFilterOptionIds.map(
      (filterOptionId) => labelsById.get(filterOptionId) ?? filterOptionId
    );
  }, [filterGroups, selectedFilterOptionIds]);

  const hasActiveFilters =
    search.length > 0 || selectedFilterOptionIds.length > 0;
  const showInitialLoader = isLoading && recipes.length === 0;
  const isRefreshing = isFetching && !showInitialLoader && !isFetchingNextPage;
  const showLoadMoreControls =
    recipes.length > 0 && (hasNextPage || isFetchingNextPage);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || typeof IntersectionObserver === "undefined") {
      return;
    }

    const sentinel = loadMoreSentinelRef.current;
    const catalogMain = catalogMainRef.current;

    if (!sentinel || !catalogMain) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        void fetchNextPage();
      },
      {
        root: catalogMain,
        rootMargin: "240px 0px",
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
    search,
    recipes,
    hasActiveFilters,
    selectedFilterLabels,
    showInitialLoader,
    isRefreshing,
    showLoadMoreControls,
    hasNextPage,
    isFetchingNextPage,
    filterGroups,
    isQuickListOpen,
    quickListRecipes: quickListQuery.data ?? [],
    isFiltersOpen,
    draftSelectedFilterOptionIds,
    appliedFilterOptionIds: selectedFilterOptionIds,
    catalogMainRef,
    loadMoreSentinelRef,
    clearFilters,
    fetchNextPage,
    closeQuickList: () => {
      setQuickListOpen(false);
    },
    closeFilters,
    toggleDraftFilterOptionId,
    applyDraftFilters,
    resetDraftFilters,
  };
};
