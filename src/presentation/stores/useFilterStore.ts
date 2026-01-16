import { create } from "zustand";

import type { TicketFilters } from "@/core/domain/schema/ticket.schema";

type FilterState = {
  /**
   * Domain-aligned filters (single source of truth).
   * IMPORTANT: UI-only search must never be merged into this object.
   */
  filters: TicketFilters;
  /**
   * UI-only search value. Not part of TicketFilters and must not be used in query keys.
   */
  search: string;
};

type FilterActions = {
  setSearch: (search: string) => void;
  resetSearch: () => void;

  setStatus: (status: string) => void;
  clearStatus: () => void;

  setEpicId: (epicId: string) => void;
  clearEpicId: () => void;

  /**
   * parentId supports two explicit modes:
   * - null: only top-level tickets (parentId IS NULL)
   * - string: only subtasks of that parent
   *
   * To remove the parentId filter entirely (undefined), use clearParentId().
   */
  setParentId: (parentId: string | null) => void;
  clearParentId: () => void;

  /**
   * Resets domain-aligned filters only. Does NOT reset search.
   */
  resetFilters: () => void;
};

type FilterStore = FilterState & FilterActions;

const initialFilters: TicketFilters = {};
const initialSearch = "";

export const useFilterStore = create<FilterStore>((set) => ({
  filters: initialFilters,
  search: initialSearch,

  setSearch: (search: string): void => {
    set({ search });
  },
  resetSearch: (): void => {
    set({ search: initialSearch });
  },

  setStatus: (status: string): void => {
    set((state) => ({
      filters: {
        ...state.filters,
        status,
      },
    }));
  },
  clearStatus: (): void => {
    set((state) => {
      const { status: _status, ...rest } = state.filters;
      return { filters: rest };
    });
  },

  setEpicId: (epicId: string): void => {
    set((state) => ({
      filters: {
        ...state.filters,
        epicId,
      },
    }));
  },
  clearEpicId: (): void => {
    set((state) => {
      const { epicId: _epicId, ...rest } = state.filters;
      return { filters: rest };
    });
  },

  setParentId: (parentId: string | null): void => {
    set((state) => ({
      filters: {
        ...state.filters,
        parentId,
      },
    }));
  },
  clearParentId: (): void => {
    set((state) => {
      const { parentId: _parentId, ...rest } = state.filters;
      return { filters: rest };
    });
  },

  resetFilters: (): void => {
    set({ filters: initialFilters });
  },
}));

