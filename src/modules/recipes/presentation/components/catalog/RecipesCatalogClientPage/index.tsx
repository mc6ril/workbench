"use client";

import { useCallback } from "react";

import RecipesCatalogFiltersSheet from "../RecipesCatalogFiltersSheet";
import RecipesQuickListFeedbackLayer from "../RecipesQuickListFeedbackLayer";
import RecipesQuickListRail from "../RecipesQuickListRail";
import RecipesCatalogActiveFilters from "./RecipesCatalogActiveFilters";
import RecipesCatalogHeader from "./RecipesCatalogHeader";
import RecipesCatalogResults from "./RecipesCatalogResults";
import styles from "./styles.module.scss";

import type {
  CatalogRecipeListResponse,
  CookingHistoryEntry,
} from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import type { QuickListRecipe } from "@/modules/recipes/core/domain/planner/quickList.types";
import type { RecipeTag } from "@/modules/recipes/core/domain/recipe.types";
import RecipesCookingHistory from "@/modules/recipes/presentation/components/catalog/RecipesCookingHistory";
import {
  RECIPES_QUICK_LIST_FEEDBACK_DURATION_MS,
  RECIPES_QUICK_LIST_TOOL_ID,
} from "@/modules/recipes/presentation/constants/quickListFeedback";
import { useRecipesCatalogClientPage } from "@/modules/recipes/presentation/hooks/catalog/useRecipesCatalogClientPage";
import type { RecipesCatalogQueryState } from "@/modules/recipes/presentation/routing/catalogSearchParams";
import { useRecipesQuickListFeedbackStore } from "@/modules/recipes/presentation/stores/useRecipesQuickListFeedbackStore";

type Props = {
  projectId: string;
  initialRecipesPage: CatalogRecipeListResponse;
  initialQueryState: RecipesCatalogQueryState;
  initialTags: RecipeTag[];
  quickListRecipes: QuickListRecipe[];
  initialCookingHistory: CookingHistoryEntry[];
};

const RecipesCatalogClientPage = ({
  initialCookingHistory,
  ...props
}: Props) => {
  const commitAnimatedCount = useRecipesQuickListFeedbackStore(
    (state) => state.commitAnimatedCount
  );
  const completeAnimation = useRecipesQuickListFeedbackStore(
    (state) => state.completeAnimation
  );
  const enqueueAnimation = useRecipesQuickListFeedbackStore(
    (state) => state.enqueueAnimation
  );
  const getProjectedCount = useRecipesQuickListFeedbackStore(
    (state) => state.getProjectedCount
  );
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
  } = useRecipesCatalogClientPage({ ...props });
  const handleQuickListMutationSuccess = useCallback(
    ({
      sourceElement,
      delta,
    }: {
      sourceElement: HTMLButtonElement;
      delta: 1 | -1;
    }) => {
      const targetCount = Math.max(
        getProjectedCount(quickListRecipes.length) + delta,
        0
      );
      const targetElement = document.getElementById(RECIPES_QUICK_LIST_TOOL_ID);
      const prefersReducedMotion =
        window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ??
        false;

      if (!targetElement || prefersReducedMotion) {
        commitAnimatedCount(targetCount);
        return;
      }

      const sourceRect = sourceElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const animation = enqueueAnimation({
        startX: sourceRect.left + sourceRect.width / 2,
        startY: sourceRect.top + sourceRect.height / 2,
        endX: targetRect.left + targetRect.width / 2,
        endY: targetRect.top + targetRect.height / 2,
        targetCount,
      });

      window.setTimeout(() => {
        completeAnimation(animation.id);
      }, RECIPES_QUICK_LIST_FEEDBACK_DURATION_MS);
    },
    [
      commitAnimatedCount,
      completeAnimation,
      enqueueAnimation,
      getProjectedCount,
      quickListRecipes.length,
    ]
  );

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

          {!hasActiveFilters ? (
            <RecipesCookingHistory
              projectId={props.projectId}
              entries={initialCookingHistory}
            />
          ) : null}

          <RecipesCatalogResults
            projectId={props.projectId}
            recipes={recipes}
            quickListRecipes={quickListRecipes}
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
            onQuickListMutationSuccess={handleQuickListMutationSuccess}
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

      <RecipesQuickListFeedbackLayer />
    </>
  );
};

export default RecipesCatalogClientPage;
