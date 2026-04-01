import { create } from "zustand";

import {
  normalizeCatalogRecipeSearch,
  normalizeCatalogRecipeTagSlugs,
} from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";

type RecipesCatalogFiltersState = {
  search: string;
  selectedTagSlugs: string[];
};

type RecipesCatalogFiltersActions = {
  syncFromQueryState: (input: {
    search?: string | null;
    tagSlugs?: string[] | null;
  }) => void;
  setSearch: (search: string) => void;
  toggleTagSlug: (tagSlug: string) => void;
  clearFilters: () => void;
};

type RecipesCatalogFiltersStore = RecipesCatalogFiltersState &
  RecipesCatalogFiltersActions;

const initialState: RecipesCatalogFiltersState = {
  search: "",
  selectedTagSlugs: [],
};

export const useRecipesCatalogFiltersStore = create<RecipesCatalogFiltersStore>(
  (set) => ({
    ...initialState,

    syncFromQueryState: (input) => {
      set({
        search: normalizeCatalogRecipeSearch(input.search),
        selectedTagSlugs: normalizeCatalogRecipeTagSlugs(input.tagSlugs),
      });
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
      set(initialState);
    },
  })
);
