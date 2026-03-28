import { create } from "zustand";

import type { TicketFilters } from "@/modules/board/core/domain/schema/ticket.schema";

type FilterState = {
  /**
   * Domain-aligned filters (single source of truth).
   * IMPORTANT: search must never be merged into this object.
   */
  filters: TicketFilters;
  /**
   * Search value used by server-side ticket queries.
   * Not part of TicketFilters to keep the domain filter shape stable.
   */
  search: string;
};

type FilterActions = {
  setSearch: (search: string) => void;
  resetSearch: () => void;

  setColumnId: (columnId: string) => void;
  clearColumnId: () => void;

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

  setColumnId: (columnId: string): void => {
    set((state) => ({
      filters: {
        ...state.filters,
        columnId,
      },
    }));
  },
  clearColumnId: (): void => {
    set((state) => {
      const { columnId: _columnId, ...rest } = state.filters;
      return { filters: rest };
    });
  },

  resetFilters: (): void => {
    set({ filters: initialFilters });
  },
}));
