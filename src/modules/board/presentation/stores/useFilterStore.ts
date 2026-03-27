import { create } from "zustand";

import type {
  TicketFilters,
  TicketPriority,
} from "@/modules/board/core/domain/schema/ticket.schema";

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

  setPriority: (priority: TicketPriority) => void;
  clearPriority: () => void;

  setLabelIds: (labelIds: string[]) => void;
  clearLabelIds: () => void;

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

  setPriority: (priority: TicketPriority): void => {
    set((state) => ({
      filters: {
        ...state.filters,
        priority,
      },
    }));
  },
  clearPriority: (): void => {
    set((state) => {
      const { priority: _priority, ...rest } = state.filters;
      return { filters: rest };
    });
  },

  setLabelIds: (labelIds: string[]): void => {
    set((state) => ({
      filters: {
        ...state.filters,
        labelIds,
      },
    }));
  },
  clearLabelIds: (): void => {
    set((state) => {
      const { labelIds: _labelIds, ...rest } = state.filters;
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
