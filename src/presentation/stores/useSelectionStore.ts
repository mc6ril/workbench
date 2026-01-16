import { create } from "zustand";

type SelectionState = {
  /**
   * Scope identifier for selection.
   * Example: `${projectId}:backlog` or `${projectId}:board`.
   */
  scopeKey: string | null;
  /**
   * Selected entity IDs (store IDs only to keep memory usage low).
   */
  selectedIds: string[];
};

type SelectionActions = {
  /**
   * Sets the selection scope.
   * - If scope is unchanged => keeps selection
   * - If scope changes => clears selection
   * - If scope becomes null => clears selection
   */
  setScope: (scopeKey: string | null) => void;
  toggle: (id: string) => void;
  selectMany: (ids: string[]) => void;
  clear: () => void;
  setSelectedIds: (ids: string[]) => void;
};

type SelectionStore = SelectionState & SelectionActions;

export const useSelectionStore = create<SelectionStore>((set) => ({
  scopeKey: null,
  selectedIds: [],

  setScope: (nextScopeKey: string | null): void => {
    set((state) => {
      if (state.scopeKey === nextScopeKey) {
        return state;
      }

      return {
        scopeKey: nextScopeKey,
        selectedIds: [],
      };
    });
  },
  toggle: (id: string): void => {
    set((state) => {
      const exists = state.selectedIds.includes(id);
      if (exists) {
        return { selectedIds: state.selectedIds.filter((x) => x !== id) };
      }

      return { selectedIds: [...state.selectedIds, id] };
    });
  },
  selectMany: (ids: string[]): void => {
    set((state) => {
      const setIds = new Set(state.selectedIds);
      for (const id of ids) {
        setIds.add(id);
      }
      return { selectedIds: Array.from(setIds) };
    });
  },
  clear: (): void => {
    set({ selectedIds: [] });
  },
  setSelectedIds: (ids: string[]): void => {
    set({ selectedIds: ids });
  },
}));
