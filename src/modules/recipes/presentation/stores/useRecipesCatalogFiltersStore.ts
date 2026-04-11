import { create } from "zustand";

import { normalizeCatalogRecipeSearch } from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import {
  type CatalogRecipeFilterOptionId,
  normalizeCatalogRecipeFilterOptionIds,
} from "@/modules/recipes/core/domain/catalog/catalogRecipeFilters";

type RecipesCatalogFiltersState = {
  search: string;
  selectedFilterOptionIds: CatalogRecipeFilterOptionId[];
  draftSelectedFilterOptionIds: CatalogRecipeFilterOptionId[];
  isQuickListOpen: boolean;
  isFiltersOpen: boolean;
};

type RecipesCatalogFiltersActions = {
  syncFromQueryState: (input: {
    search?: string | null;
    filterOptionIds?: string[] | null;
  }) => void;
  initializeCatalogState: (input: {
    search?: string | null;
    filterOptionIds?: string[] | null;
  }) => void;
  setSearch: (search: string) => void;
  toggleDraftFilterOptionId: (filterOptionId: string) => void;
  applyDraftFilters: () => void;
  resetDraftFilters: () => void;
  clearFilters: () => void;
  setQuickListOpen: (isOpen: boolean) => void;
  toggleQuickList: () => void;
  openFilters: () => void;
  closeFilters: () => void;
  toggleFilters: () => void;
};

type RecipesCatalogFiltersStore = RecipesCatalogFiltersState &
  RecipesCatalogFiltersActions;

const initialState: RecipesCatalogFiltersState = {
  search: "",
  selectedFilterOptionIds: [],
  draftSelectedFilterOptionIds: [],
  isQuickListOpen: false,
  isFiltersOpen: false,
};

const toggleFilterOptionIdInSelection = (
  selectedFilterOptionIds: CatalogRecipeFilterOptionId[],
  filterOptionId: string
) => {
  const normalizedFilterOptionId = normalizeCatalogRecipeFilterOptionIds([
    filterOptionId,
  ])[0];

  if (!normalizedFilterOptionId) {
    return selectedFilterOptionIds;
  }

  const hasOption = selectedFilterOptionIds.includes(normalizedFilterOptionId);

  return normalizeCatalogRecipeFilterOptionIds(
    hasOption
      ? selectedFilterOptionIds.filter(
          (value) => value !== normalizedFilterOptionId
        )
      : [...selectedFilterOptionIds, normalizedFilterOptionId]
  );
};

export const useRecipesCatalogFiltersStore = create<RecipesCatalogFiltersStore>(
  (set) => ({
    ...initialState,

    syncFromQueryState: (input) => {
      set((state) => ({
        search: normalizeCatalogRecipeSearch(input.search),
        selectedFilterOptionIds: normalizeCatalogRecipeFilterOptionIds(
          input.filterOptionIds
        ),
        draftSelectedFilterOptionIds: state.isFiltersOpen
          ? state.draftSelectedFilterOptionIds
          : normalizeCatalogRecipeFilterOptionIds(input.filterOptionIds),
        isQuickListOpen: state.isQuickListOpen,
        isFiltersOpen: state.isFiltersOpen,
      }));
    },

    initializeCatalogState: (input) => {
      set((state) => ({
        ...state,
        search: normalizeCatalogRecipeSearch(input.search),
        selectedFilterOptionIds: normalizeCatalogRecipeFilterOptionIds(
          input.filterOptionIds
        ),
        draftSelectedFilterOptionIds: normalizeCatalogRecipeFilterOptionIds(
          input.filterOptionIds
        ),
        isFiltersOpen: false,
      }));
    },

    setSearch: (search) => {
      set({
        search: normalizeCatalogRecipeSearch(search),
      });
    },

    toggleDraftFilterOptionId: (filterOptionId) => {
      set((state) => {
        return {
          draftSelectedFilterOptionIds: toggleFilterOptionIdInSelection(
            state.draftSelectedFilterOptionIds,
            filterOptionId
          ),
        };
      });
    },

    applyDraftFilters: () => {
      set((state) => ({
        selectedFilterOptionIds: normalizeCatalogRecipeFilterOptionIds(
          state.draftSelectedFilterOptionIds
        ),
        isFiltersOpen: false,
      }));
    },

    resetDraftFilters: () => {
      set({
        draftSelectedFilterOptionIds: initialState.draftSelectedFilterOptionIds,
      });
    },

    clearFilters: () => {
      set((state) => ({
        ...state,
        search: initialState.search,
        selectedFilterOptionIds: initialState.selectedFilterOptionIds,
        draftSelectedFilterOptionIds: initialState.draftSelectedFilterOptionIds,
      }));
    },

    setQuickListOpen: (isQuickListOpen) => {
      set({
        isQuickListOpen,
      });
    },

    toggleQuickList: () => {
      set((state) => ({
        isQuickListOpen: !state.isQuickListOpen,
      }));
    },

    openFilters: () => {
      set((state) => ({
        isFiltersOpen: true,
        draftSelectedFilterOptionIds: state.selectedFilterOptionIds,
      }));
    },

    closeFilters: () => {
      set((state) => ({
        isFiltersOpen: false,
        draftSelectedFilterOptionIds: state.selectedFilterOptionIds,
      }));
    },

    toggleFilters: () => {
      set((state) => ({
        isFiltersOpen: !state.isFiltersOpen,
        draftSelectedFilterOptionIds: state.selectedFilterOptionIds,
      }));
    },
  })
);
