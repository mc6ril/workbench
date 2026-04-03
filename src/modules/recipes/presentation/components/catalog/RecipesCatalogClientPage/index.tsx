"use client";

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { FilterIcon } from "@/shared/design-system/icons";
import Loader from "@/shared/design-system/loader";

import RecipesCatalogFiltersSheet from "../RecipesCatalogFiltersSheet";
import RecipesQuickListRail from "../RecipesQuickListRail";
import styles from "./styles.module.scss";

import type {
  CatalogRecipeListResponse,
  CatalogRecipeTag,
} from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import type { QuickListRecipe } from "@/modules/recipes/core/domain/planner/quickList.types";
import RecipeCatalogCard from "@/modules/recipes/presentation/components/catalog/RecipeCatalogCard/index";
import { useListRecipes } from "@/modules/recipes/presentation/hooks/catalog/listRecipes";
import { useListRecipeTags } from "@/modules/recipes/presentation/hooks/catalog/listRecipeTags";
import { useListActiveSelections } from "@/modules/recipes/presentation/hooks/planner/listActiveSelections";
import type { RecipesCatalogQueryState } from "@/modules/recipes/presentation/routing/catalogSearchParams";
import {
  buildRecipesCatalogSearchParams,
  parseRecipesCatalogSearchParams,
} from "@/modules/recipes/presentation/routing/catalogSearchParams";
import { useRecipesCatalogFiltersStore } from "@/modules/recipes/presentation/stores";

type Props = {
  projectId: string;
  initialRecipesPage: CatalogRecipeListResponse;
  initialTags: CatalogRecipeTag[];
  initialQueryState: RecipesCatalogQueryState;
  quickListRecipes: QuickListRecipe[];
};

const areTagSlugsEqual = (left: string[], right: string[]) => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
};

const cx = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ");
};

const RecipesCatalogClientPage = ({
  projectId,
  initialRecipesPage,
  initialTags,
  initialQueryState,
  quickListRecipes,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const initializedCatalogStateRef = useRef<string | null>(null);
  const catalogMainRef = useRef<HTMLDivElement | null>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);
  const initialQueryStateKey = `${projectId}:${initialQueryState.search}:${initialQueryState.tagSlugs.join(",")}`;

  const search = useRecipesCatalogFiltersStore((state) => state.search);
  const selectedTagSlugs = useRecipesCatalogFiltersStore(
    (state) => state.selectedTagSlugs
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
  const toggleTagSlug = useRecipesCatalogFiltersStore(
    (state) => state.toggleTagSlug
  );
  const clearFilters = useRecipesCatalogFiltersStore(
    (state) => state.clearFilters
  );
  const setQuickListOpen = useRecipesCatalogFiltersStore(
    (state) => state.setQuickListOpen
  );
  const toggleFilters = useRecipesCatalogFiltersStore(
    (state) => state.toggleFilters
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
      tagSlugs: initialQueryState.tagSlugs,
    });
    initializedCatalogStateRef.current = initialQueryStateKey;
  }, [
    initialQueryState.search,
    initialQueryState.tagSlugs,
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
      areTagSlugsEqual(nextQueryState.tagSlugs, currentState.selectedTagSlugs)
    ) {
      return;
    }

    syncFromQueryState(nextQueryState);
  }, [searchParamsKey, syncFromQueryState]);

  useEffect(() => {
    const nextSearchParams = buildRecipesCatalogSearchParams({
      search,
      tagSlugs: selectedTagSlugs,
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
  }, [pathname, router, search, searchParamsKey, selectedTagSlugs]);

  const isInitialRecipesQuery =
    deferredSearch === initialQueryState.search &&
    areTagSlugsEqual(selectedTagSlugs, initialQueryState.tagSlugs);

  const recipesQuery = useListRecipes(
    projectId,
    {
      search: deferredSearch,
      tagSlugs: selectedTagSlugs,
    },
    {
      initialData: isInitialRecipesQuery ? initialRecipesPage : undefined,
    }
  );
  const tagsQuery = useListRecipeTags(projectId, {
    initialData: initialTags,
  });
  const quickListQuery = useListActiveSelections(projectId, {
    initialData: quickListRecipes,
  });
  const recipes = recipesQuery.recipes;
  const fetchNextPage = recipesQuery.fetchNextPage;
  const hasNextPage = recipesQuery.hasNextPage;
  const isFetchingNextPage = recipesQuery.isFetchingNextPage;
  const tags = useMemo(() => {
    return tagsQuery.data ?? [];
  }, [tagsQuery.data]);
  const activeQuickListRecipes = quickListQuery.data ?? [];
  const tagsBySlug = useMemo(() => {
    return new Map(tags.map((tag) => [tag.slug, tag]));
  }, [tags]);
  const hasActiveFilters = search.length > 0 || selectedTagSlugs.length > 0;
  const showInitialLoader = recipesQuery.isLoading && recipes.length === 0;
  const isRefreshing =
    recipesQuery.isFetching &&
    !showInitialLoader &&
    !isFetchingNextPage;
  const activeFilterCount = (search ? 1 : 0) + selectedTagSlugs.length;
  const showLoadMoreControls =
    recipes.length > 0 && (hasNextPage || isFetchingNextPage);

  useEffect(() => {
    if (
      !hasNextPage ||
      isFetchingNextPage ||
      typeof IntersectionObserver === "undefined"
    ) {
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

  return (
    <>
      <div className={styles["recipes-page"]}>
        <section className={styles["recipes-page__catalog-shell"]}>
          <div className={styles["recipes-page__catalog-head"]}>
            <div>
              <p className={styles["recipes-page__panel-kicker"]}>Catalogue</p>
              <h1 className={styles["recipes-page__catalog-title"]}>
                {hasActiveFilters ? "Résultats filtrés" : "Toutes les recettes"}
              </h1>
            </div>
            <div className={styles["recipes-page__catalog-summary"]}>
              <strong>{recipes.length}</strong>
              <span>
                recette{recipes.length > 1 ? "s" : ""}
                {hasActiveFilters ? " après filtres" : " disponible"}
                {recipes.length > 1 ? "s" : ""}
              </span>
              {isRefreshing ? (
                <span className={styles["recipes-page__catalog-status"]}>
                  Mise à jour...
                </span>
              ) : null}
            </div>
          </div>

          <div className={styles["recipes-page__filter-bar"]}>
            <button
              type="button"
              className={cx(
                styles["recipes-page__filter-pill"],
                isFiltersOpen && styles["recipes-page__filter-pill--active"]
              )}
              onClick={toggleFilters}
              aria-expanded={isFiltersOpen}
              aria-pressed={isFiltersOpen}
            >
              <FilterIcon size={14} />
              <span>
                Filtrer
                {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              </span>
            </button>

            {tags.map((tag) => {
              const isActive = selectedTagSlugs.includes(tag.slug);

              return (
                <button
                  key={tag.id}
                  type="button"
                  className={cx(
                    styles["recipes-page__filter-pill"],
                    isActive && styles["recipes-page__filter-pill--active"]
                  )}
                  aria-pressed={isActive}
                  onClick={() => {
                    toggleTagSlug(tag.slug);
                  }}
                >
                  {tag.label}
                </button>
              );
            })}

            {hasActiveFilters ? (
              <button
                type="button"
                className={cx(
                  styles["recipes-page__filter-pill"],
                  styles["recipes-page__filter-pill--ghost"]
                )}
                onClick={() => {
                  clearFilters();
                }}
              >
                Réinitialiser
              </button>
            ) : null}
          </div>

          {hasActiveFilters ? (
            <div className={styles["recipes-page__active-filters"]}>
              {search ? (
                <span className={styles["recipes-page__tag"]}>
                  Recherche: {search}
                </span>
              ) : null}
              {selectedTagSlugs.map((tagSlug) => (
                <span key={tagSlug} className={styles["recipes-page__tag"]}>
                  {tagsBySlug.get(tagSlug)?.label ?? tagSlug}
                </span>
              ))}
            </div>
          ) : null}

          <div className={styles["recipes-page__catalog-layout"]}>
            <div
              ref={catalogMainRef}
              className={styles["recipes-page__catalog-main"]}
            >
              {showInitialLoader ? (
                <div className={styles["recipes-page__loading-shell"]}>
                  <Loader variant="inline" size="medium" />
                </div>
              ) : recipes.length === 0 ? (
                <div className={styles["recipes-page__empty-state"]}>
                  <p className={styles["recipes-page__panel-kicker"]}>
                    Aucun résultat
                  </p>
                  <h2 className={styles["recipes-page__empty-state-title"]}>
                    Aucune recette ne correspond aux filtres actuels.
                  </h2>
                  <p className={styles["recipes-page__empty-state-copy"]}>
                    Essayez une recherche plus courte ou retirez un tag pour
                    rouvrir le catalogue.
                  </p>
                  {hasActiveFilters ? (
                    <button
                      type="button"
                      className={styles["recipes-page__secondary-link"]}
                      onClick={() => {
                        clearFilters();
                      }}
                    >
                      Réinitialiser les filtres
                    </button>
                  ) : null}
                </div>
              ) : (
                <>
                  <div className={styles["recipes-page__recipe-grid"]}>
                    {recipes.map((recipe) => (
                      <RecipeCatalogCard
                        key={recipe.id}
                        projectId={projectId}
                        recipe={recipe}
                      />
                    ))}
                  </div>

                  {showLoadMoreControls ? (
                    <div className={styles["recipes-page__pagination"]}>
                      <div
                        ref={loadMoreSentinelRef}
                        className={styles["recipes-page__sentinel"]}
                        aria-hidden="true"
                      />

                      <button
                        type="button"
                        className={styles["recipes-page__load-more-button"]}
                        onClick={() => {
                          void fetchNextPage();
                        }}
                        disabled={!hasNextPage || isFetchingNextPage}
                      >
                        {isFetchingNextPage ? "Chargement..." : "Charger plus"}
                      </button>

                      {isFetchingNextPage ? (
                        <div className={styles["recipes-page__load-more-status"]}>
                          <Loader
                            variant="inline"
                            size="small"
                            message="Chargement des recettes suivantes..."
                            ariaLabel="Chargement des recettes suivantes"
                          />
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      <RecipesQuickListRail
        isOpen={isQuickListOpen}
        projectId={projectId}
        recipes={activeQuickListRecipes}
        onClose={() => {
          setQuickListOpen(false);
        }}
        onRecipeNavigate={() => {
          setQuickListOpen(false);
        }}
      />

      <RecipesCatalogFiltersSheet
        isOpen={isFiltersOpen}
        search={search}
        tags={tags}
        selectedTagSlugs={selectedTagSlugs}
        hasActiveFilters={hasActiveFilters}
        onClose={closeFilters}
        onToggleTag={toggleTagSlug}
        onClearFilters={clearFilters}
      />
    </>
  );
};

export default RecipesCatalogClientPage;
