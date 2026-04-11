"use client";

import RecipesCatalogFiltersSheet from "../RecipesCatalogFiltersSheet";
import RecipesQuickListRail from "../RecipesQuickListRail";
import RecipesCatalogActiveFilters from "./RecipesCatalogActiveFilters";
import RecipesCatalogHeader from "./RecipesCatalogHeader";
import RecipesCatalogResults from "./RecipesCatalogResults";
import styles from "./styles.module.scss";

import type { CatalogRecipeListResponse } from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import type { QuickListRecipe } from "@/modules/recipes/core/domain/planner/quickList.types";
import type { RecipeTag } from "@/modules/recipes/core/domain/recipe.types";
import { useRecipesCatalogClientPage } from "@/modules/recipes/presentation/hooks/catalog/useRecipesCatalogClientPage";
import type { RecipesCatalogQueryState } from "@/modules/recipes/presentation/routing/catalogSearchParams";

type Props = {
  projectId: string;
  initialRecipesPage: CatalogRecipeListResponse;
  initialQueryState: RecipesCatalogQueryState;
  initialTags: RecipeTag[];
  quickListRecipes: QuickListRecipe[];
};

const RecipesCatalogClientPage = (props: Props) => {
  const {
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
    quickListRecipes,
    isFiltersOpen,
    draftSelectedFilterOptionIds,
    appliedFilterOptionIds,
    catalogMainRef,
    loadMoreSentinelRef,
    clearFilters,
    fetchNextPage,
    closeQuickList,
    closeFilters,
    toggleDraftFilterOptionId,
    applyDraftFilters,
    resetDraftFilters,
  } = useRecipesCatalogClientPage(props);

  return (
    <>
      <div className={styles["recipes-page"]}>
        <section className={styles["recipes-page__catalog-shell"]}>
          <RecipesCatalogHeader
            recipesCount={recipes.length}
            hasActiveFilters={hasActiveFilters}
            isRefreshing={isRefreshing}
          />

          <RecipesCatalogActiveFilters
            search={search}
            selectedFilterLabels={selectedFilterLabels}
          />

          <RecipesCatalogResults
            projectId={props.projectId}
            recipes={recipes}
            hasActiveFilters={hasActiveFilters}
            showInitialLoader={showInitialLoader}
            showLoadMoreControls={showLoadMoreControls}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            catalogMainRef={catalogMainRef}
            loadMoreSentinelRef={loadMoreSentinelRef}
            onClearFilters={clearFilters}
            onFetchNextPage={() => {
              void fetchNextPage();
            }}
          />
        </section>
      </div>

      <RecipesQuickListRail
        isOpen={isQuickListOpen}
        projectId={props.projectId}
        recipes={quickListRecipes}
        onClose={closeQuickList}
        onRecipeNavigate={closeQuickList}
      />

      <RecipesCatalogFiltersSheet
        isOpen={isFiltersOpen}
        filterGroups={filterGroups}
        selectedFilterOptionIds={draftSelectedFilterOptionIds}
        appliedFilterOptionIds={appliedFilterOptionIds}
        onClose={closeFilters}
        onToggleFilterOption={toggleDraftFilterOptionId}
        onApplyFilters={applyDraftFilters}
        onResetFilters={resetDraftFilters}
      />
    </>
  );
};

export default RecipesCatalogClientPage;
