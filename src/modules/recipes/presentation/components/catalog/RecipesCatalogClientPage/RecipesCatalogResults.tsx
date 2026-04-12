import type { RefObject } from "react";

import Loader from "@/shared/design-system/loader";

import RecipesCatalogEmptyState from "./RecipesCatalogEmptyState";
import RecipesCatalogPagination from "./RecipesCatalogPagination";
import styles from "./styles.module.scss";

import type { CatalogRecipeSummary } from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import type { QuickListRecipe } from "@/modules/recipes/core/domain/planner/quickList.types";
import RecipeCatalogCard from "@/modules/recipes/presentation/components/catalog/RecipeCatalogCard/index";

type Props = {
  projectId: string;
  recipes: CatalogRecipeSummary[];
  quickListRecipes: QuickListRecipe[];
  hasActiveFilters: boolean;
  showInitialLoader: boolean;
  showLoadMoreControls: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  catalogMainRef: RefObject<HTMLDivElement | null>;
  loadMoreSentinelRef: RefObject<HTMLDivElement | null>;
  onClearFilters: () => void;
  onFetchNextPage: () => void;
  onQuickListMutationSuccess: (input: {
    sourceElement: HTMLButtonElement;
    delta: 1 | -1;
  }) => void;
};

const RecipesCatalogResults = ({
  projectId,
  recipes,
  quickListRecipes,
  hasActiveFilters,
  showInitialLoader,
  showLoadMoreControls,
  hasNextPage,
  isFetchingNextPage,
  catalogMainRef,
  loadMoreSentinelRef,
  onClearFilters,
  onFetchNextPage,
  onQuickListMutationSuccess,
}: Props) => {
  const quickListSelectionIdByRecipeId = new Map(
    quickListRecipes.map((selection) => [selection.recipeId, selection.id])
  );

  return (
    <div className={styles["recipes-page__catalog-layout"]}>
      <div ref={catalogMainRef} className={styles["recipes-page__catalog-main"]}>
        {showInitialLoader ? (
          <div className={styles["recipes-page__loading-shell"]}>
            <Loader variant="inline" size="medium" />
          </div>
        ) : recipes.length === 0 ? (
          <RecipesCatalogEmptyState
            hasActiveFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
          />
        ) : (
          <>
            <div className={styles["recipes-page__recipe-grid"]}>
              {recipes.map((recipe) => (
                <RecipeCatalogCard
                  key={recipe.id}
                  projectId={projectId}
                  recipe={recipe}
                  quickListSelectionId={
                    quickListSelectionIdByRecipeId.get(recipe.id) ?? null
                  }
                  onQuickListMutationSuccess={onQuickListMutationSuccess}
                />
              ))}
            </div>

            {showLoadMoreControls ? (
              <RecipesCatalogPagination
                loadMoreSentinelRef={loadMoreSentinelRef}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                onFetchNextPage={onFetchNextPage}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default RecipesCatalogResults;
