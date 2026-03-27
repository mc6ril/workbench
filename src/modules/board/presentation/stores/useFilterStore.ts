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

  setStatus: (status: string) => void;
  clearStatus: () => void;

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

  resetFilters: (): void => {
    set({ filters: initialFilters });
  },
}));
