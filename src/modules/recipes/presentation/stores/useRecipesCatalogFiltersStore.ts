import { create } from "zustand";

import {
  normalizeCatalogRecipeSearch,
  normalizeCatalogRecipeTagSlugs,
} from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";

type RecipesCatalogFiltersState = {
  search: string;
  selectedTagSlugs: string[];
  isQuickListOpen: boolean;
  isFiltersOpen: boolean;
};

type RecipesCatalogFiltersActions = {
  syncFromQueryState: (input: {
    search?: string | null;
    tagSlugs?: string[] | null;
  }) => void;
  initializeCatalogState: (input: {
    search?: string | null;
    tagSlugs?: string[] | null;
  }) => void;
  setSearch: (search: string) => void;
  toggleTagSlug: (tagSlug: string) => void;
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
  selectedTagSlugs: [],
  isQuickListOpen: false,
  isFiltersOpen: false,
};

export const useRecipesCatalogFiltersStore = create<RecipesCatalogFiltersStore>(
  (set) => ({
    ...initialState,

    syncFromQueryState: (input) => {
      set((state) => ({
        search: normalizeCatalogRecipeSearch(input.search),
        selectedTagSlugs: normalizeCatalogRecipeTagSlugs(input.tagSlugs),
        isQuickListOpen: state.isQuickListOpen,
        isFiltersOpen: state.isFiltersOpen,
      }));
    },

    initializeCatalogState: (input) => {
      set((state) => ({
        ...state,
        search: normalizeCatalogRecipeSearch(input.search),
        selectedTagSlugs: normalizeCatalogRecipeTagSlugs(input.tagSlugs),
        isFiltersOpen: false,
      }));
    },

    setSearch: (search) => {
      set({
        search: normalizeCatalogRecipeSearch(search),
      });
    },

    toggleTagSlug: (tagSlug) => {
      const normalizedTagSlug = normalizeCatalogRecipeTagSlugs([tagSlug])[0];

      if (!normalizedTagSlug) {
        return;
      }

      set((state) => {
        const hasTag = state.selectedTagSlugs.includes(normalizedTagSlug);

        return {
          selectedTagSlugs: normalizeCatalogRecipeTagSlugs(
            hasTag
              ? state.selectedTagSlugs.filter((value) => value !== normalizedTagSlug)
              : [...state.selectedTagSlugs, normalizedTagSlug]
          ),
        };
      });
    },

    clearFilters: () => {
      set((state) => ({
        ...state,
        search: initialState.search,
        selectedTagSlugs: initialState.selectedTagSlugs,
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
      set({
        isFiltersOpen: true,
      });
    },

    closeFilters: () => {
      set({
        isFiltersOpen: false,
      });
    },

    toggleFilters: () => {
      set((state) => ({
        isFiltersOpen: !state.isFiltersOpen,
      }));
    },
  })
);
