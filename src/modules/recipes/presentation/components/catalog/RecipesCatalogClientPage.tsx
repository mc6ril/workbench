"use client";

import { startTransition, useDeferredValue, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import Badge from "@/shared/design-system/badge";
import Link from "@/shared/design-system/link";
import Loader from "@/shared/design-system/loader";
import Title from "@/shared/design-system/title";

import RecipeCatalogCard from "./RecipeCatalogCard";
import RecipesQuickListRail from "./RecipesQuickListRail";

import type {
  CatalogRecipeSummary,
  CatalogRecipeTag,
} from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import type { QuickListRecipe } from "@/modules/recipes/core/domain/planner/quickList.types";
import {
  useListActiveSelections,
  useListRecipes,
  useListRecipeTags,
} from "@/modules/recipes/presentation/hooks";
import type { RecipesCatalogQueryState } from "@/modules/recipes/presentation/pages/recipes/catalogSearchParams";
import {
  buildRecipesCatalogSearchParams,
  parseRecipesCatalogSearchParams,
} from "@/modules/recipes/presentation/pages/recipes/catalogSearchParams";
import styles from "@/modules/recipes/presentation/pages/recipes/styles.module.scss";
import {
  buildRecipeCreationRoute,
  buildRecipesQuickListRoute,
  buildRecipesShoppingRoute,
} from "@/modules/recipes/presentation/routes";
import { useRecipesCatalogFiltersStore } from "@/modules/recipes/presentation/stores";

type Props = {
  projectId: string;
  initialRecipes: CatalogRecipeSummary[];
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
  initialRecipes,
  initialTags,
  initialQueryState,
  quickListRecipes,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasHydratedFiltersRef = useRef(false);

  if (!hasHydratedFiltersRef.current) {
    useRecipesCatalogFiltersStore.setState({
      search: initialQueryState.search,
      selectedTagSlugs: initialQueryState.tagSlugs,
    });
    hasHydratedFiltersRef.current = true;
  }

  const search = useRecipesCatalogFiltersStore((state) => state.search);
  const selectedTagSlugs = useRecipesCatalogFiltersStore(
    (state) => state.selectedTagSlugs
  );
  const syncFromQueryState = useRecipesCatalogFiltersStore(
    (state) => state.syncFromQueryState
  );
  const setSearch = useRecipesCatalogFiltersStore((state) => state.setSearch);
  const toggleTagSlug = useRecipesCatalogFiltersStore(
    (state) => state.toggleTagSlug
  );
  const clearFilters = useRecipesCatalogFiltersStore(
    (state) => state.clearFilters
  );
  const deferredSearch = useDeferredValue(search);
  const currentSearchParams = searchParams.toString();

  useEffect(() => {
    const nextQueryState = parseRecipesCatalogSearchParams(searchParams);

    if (
      nextQueryState.search === search &&
      areTagSlugsEqual(nextQueryState.tagSlugs, selectedTagSlugs)
    ) {
      return;
    }

    syncFromQueryState(nextQueryState);
  }, [search, searchParams, selectedTagSlugs, syncFromQueryState]);

  useEffect(() => {
    const nextSearchParams = buildRecipesCatalogSearchParams({
      search,
      tagSlugs: selectedTagSlugs,
    });
    const nextSearchParamsString = nextSearchParams.toString();

    if (nextSearchParamsString === currentSearchParams) {
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
  }, [currentSearchParams, pathname, router, search, selectedTagSlugs]);

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
      initialData: isInitialRecipesQuery ? initialRecipes : undefined,
    }
  );
  const tagsQuery = useListRecipeTags(projectId, {
    initialData: initialTags,
  });
  const quickListQuery = useListActiveSelections(projectId, {
    initialData: quickListRecipes,
  });
  const recipes = recipesQuery.data ?? [];
  const tags = tagsQuery.data ?? [];
  const activeQuickListRecipes = quickListQuery.data ?? [];
  const hasActiveFilters = search.length > 0 || selectedTagSlugs.length > 0;
  const showInitialLoader = recipesQuery.isLoading && recipes.length === 0;
  const isRefreshing = recipesQuery.isFetching && !showInitialLoader;

  return (
    <div className={styles["recipes-page"]}>
      <section className={styles["recipes-page__hero"]}>
        <div className={styles["recipes-page__hero-copy"]}>
          <span className={styles["recipes-page__eyebrow"]}>
            Recipes / catalogue
          </span>
          <Title variant="h1" className={styles["recipes-page__hero-title"]}>
            Recherche visible, tags combinables et quick list toujours à portée.
          </Title>
          <p className={styles["recipes-page__hero-description"]}>
            Le catalogue reprend la hiérarchie validée dans la preview: on
            explore vite, on garde le rail semaine en contexte, et la logique de
            requête reste côté module sans dupliquer les recettes en client.
          </p>
          <div className={styles["recipes-page__hero-badges"]}>
            <Badge label="Recherche serveur" variant="info" size="small" />
            <Badge label="Filtres multi-tags" variant="info" size="small" />
            <Badge label="Quick list visible" variant="info" size="small" />
          </div>
          <div className={styles["recipes-page__hero-actions"]}>
            <Link
              href={buildRecipesQuickListRoute(projectId)}
              className={styles["recipes-page__primary-cta"]}
            >
              Ouvrir la quick list
            </Link>
            <Link
              href={buildRecipesShoppingRoute(projectId)}
              className={styles["recipes-page__secondary-link"]}
            >
              Voir les courses
            </Link>
            <Link
              href={buildRecipeCreationRoute(projectId)}
              className={styles["recipes-page__secondary-link"]}
            >
              Créer une recette
            </Link>
          </div>
        </div>

        <div className={styles["recipes-page__metric-grid"]}>
          <article className={styles["recipes-page__metric-card"]}>
            <span className={styles["recipes-page__metric-value"]}>
              {recipes.length}
            </span>
            <span className={styles["recipes-page__metric-label"]}>
              recette{recipes.length > 1 ? "s" : ""} visible
              {hasActiveFilters ? "s après filtres" : "s dans le catalogue"}.
            </span>
          </article>
          <article className={styles["recipes-page__metric-card"]}>
            <span className={styles["recipes-page__metric-value"]}>
              {tags.length}
            </span>
            <span className={styles["recipes-page__metric-label"]}>
              tag{tags.length > 1 ? "s" : ""} disponible
              {tags.length > 1 ? "s" : ""} pour resserrer la navigation.
            </span>
          </article>
          <article className={styles["recipes-page__metric-card"]}>
            <span className={styles["recipes-page__metric-value"]}>
              {activeQuickListRecipes.length}
            </span>
            <span className={styles["recipes-page__metric-label"]}>
              recette{activeQuickListRecipes.length > 1 ? "s" : ""} déjà présente
              {activeQuickListRecipes.length > 1 ? "s" : ""} dans la quick list.
            </span>
          </article>
        </div>
      </section>

      <section className={styles["recipes-page__window"]}>
        <div className={styles["recipes-page__window-topbar"]}>
          <div className={styles["recipes-page__window-dots"]} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <span className={styles["recipes-page__window-label"]}>
            Recipes / catalogue
          </span>
        </div>

        <div className={styles["recipes-page__window-head"]}>
          <p className={styles["recipes-page__window-title"]}>
            Recherche + filtres + rail quick list
          </p>
          <p className={styles["recipes-page__window-description"]}>
            La recherche texte et les tags partent en requêtes serveur, pendant
            que l&apos;état local reste limité à l&apos;UI du catalogue et à ses
            query params simples.
          </p>
        </div>

        <div className={styles["recipes-page__window-body"]}>
          <div className={styles["recipes-page__catalogue"]}>
            <div className={styles["recipes-page__catalogue-head"]}>
              <label
                htmlFor="recipes-catalog-search"
                className={styles["recipes-page__search-shell"]}
              >
                <span
                  className={styles["recipes-page__search-icon"]}
                  aria-hidden="true"
                >
                  Recherche
                </span>
                <input
                  id="recipes-catalog-search"
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.currentTarget.value);
                  }}
                  className={styles["recipes-page__search-input"]}
                  placeholder="Rechercher un plat, un ingrédient ou une envie du moment"
                />
              </label>

              <div className={styles["recipes-page__filter-row"]}>
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
            </div>

            <div className={styles["recipes-page__catalogue-layout"]}>
              <div className={styles["recipes-page__catalogue-main"]}>
                <div className={styles["recipes-page__catalogue-toolbar"]}>
                  <div>
                    <p className={styles["recipes-page__panel-kicker"]}>
                      Catalogue
                    </p>
                    <h2 className={styles["recipes-page__panel-title"]}>
                      {hasActiveFilters
                        ? "Résultats filtrés"
                        : "Toutes les recettes"}
                    </h2>
                  </div>
                  <p className={styles["recipes-page__results-copy"]}>
                    {showInitialLoader
                      ? "Chargement du catalogue..."
                      : `${recipes.length} résultat${recipes.length > 1 ? "s" : ""}${
                          isRefreshing ? " • mise à jour..." : ""
                        }`}
                  </p>
                </div>

                {showInitialLoader ? (
                  <div className={styles["recipes-page__loading-shell"]}>
                    <Loader variant="inline" size="medium" />
                  </div>
                ) : recipes.length === 0 ? (
                  <div className={styles["recipes-page__empty-state"]}>
                    <p className={styles["recipes-page__panel-kicker"]}>
                      Aucun résultat
                    </p>
                    <h3 className={styles["recipes-page__empty-state-title"]}>
                      Aucune recette ne correspond aux filtres actuels.
                    </h3>
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
                  <div className={styles["recipes-page__recipe-grid"]}>
                    {recipes.map((recipe) => (
                      <RecipeCatalogCard
                        key={recipe.id}
                        projectId={projectId}
                        recipe={recipe}
                      />
                    ))}
                  </div>
                )}
              </div>

              <RecipesQuickListRail
                projectId={projectId}
                recipes={activeQuickListRecipes}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RecipesCatalogClientPage;
