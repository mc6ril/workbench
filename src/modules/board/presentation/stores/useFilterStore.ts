import { create } from "zustand";

import { PROJECT_TOOLBAR_UNASSIGNED_FILTER_ID } from "@/domains/project/presentation/components/projectToolbar/ProjectToolbar.types";
import type { TicketFilters } from "@/modules/board/core/domain/ticket.types";

type FilterState = {
  /**
   * Project scope currently associated with the store values.
   * When the route switches to another project, filters/search must be reset.
   */
  projectId: string | null;
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
  initializeProject: (projectId: string) => void;
  setSearch: (search: string) => void;
  resetSearch: () => void;

  setColumnId: (columnId: string) => void;
  clearColumnId: () => void;

  setAssigneeFilterIds: (filterIds: string[]) => void;

  /**
   * Resets domain-aligned filters only. Does NOT reset search.
   */
  resetFilters: () => void;
};

type FilterStore = FilterState & FilterActions;

const initialFilters: TicketFilters = {};
const initialSearch = "";

export const useFilterStore = create<FilterStore>((set) => ({
  projectId: null,
  filters: initialFilters,
  search: initialSearch,

  initializeProject: (projectId: string): void => {
    set((state) => {
      if (state.projectId === projectId) {
        return state;
      }

      return {
        projectId,
        filters: initialFilters,
        search: initialSearch,
      };
    });
  },

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

  setAssigneeFilterIds: (filterIds: string[]): void => {
    set((state) => {
      const {
        assigneeUserIds: _ids,
        unassignedOnly: _u,
        ...rest
      } = state.filters;
      const userIds = filterIds.filter(
        (id) => id !== PROJECT_TOOLBAR_UNASSIGNED_FILTER_ID
      );
      const unassigned = filterIds.includes(
        PROJECT_TOOLBAR_UNASSIGNED_FILTER_ID
      );
      return {
        filters: {
          ...rest,
          ...(userIds.length > 0 ? { assigneeUserIds: userIds } : {}),
          ...(unassigned ? { unassignedOnly: true } : {}),
        },
      };
    });
  },

  resetFilters: (): void => {
    set({ filters: initialFilters });
  },
}));
