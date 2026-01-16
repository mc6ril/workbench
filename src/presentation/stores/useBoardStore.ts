import { create } from "zustand";

type BoardState = {
  /**
   * View-only flag for board configuration panel visibility.
   */
  isConfigPanelOpen: boolean;
  /**
   * Column visibility overrides.
   *
   * Convention:
   * - empty array => no columns are hidden (everything visible by default)
   */
  hiddenColumnIds: string[];
};

type BoardActions = {
  setIsConfigPanelOpen: (isOpen: boolean) => void;
  openConfigPanel: () => void;
  closeConfigPanel: () => void;

  hideColumn: (columnId: string) => void;
  showColumn: (columnId: string) => void;
  setHiddenColumnIds: (hiddenColumnIds: string[]) => void;

  /**
   * Resets board view state to defaults:
   * - config panel closed
   * - no hidden columns (all visible)
   */
  resetBoardView: () => void;
};

type BoardStore = BoardState & BoardActions;

const defaultHiddenColumnIds: string[] = [];

export const useBoardStore = create<BoardStore>((set) => ({
  isConfigPanelOpen: false,
  hiddenColumnIds: defaultHiddenColumnIds,

  setIsConfigPanelOpen: (isOpen: boolean): void => {
    set({ isConfigPanelOpen: isOpen });
  },
  openConfigPanel: (): void => {
    set({ isConfigPanelOpen: true });
  },
  closeConfigPanel: (): void => {
    set({ isConfigPanelOpen: false });
  },

  hideColumn: (columnId: string): void => {
    set((state) => {
      if (state.hiddenColumnIds.includes(columnId)) {
        return state;
      }

      return { hiddenColumnIds: [...state.hiddenColumnIds, columnId] };
    });
  },
  showColumn: (columnId: string): void => {
    set((state) => ({
      hiddenColumnIds: state.hiddenColumnIds.filter((id) => id !== columnId),
    }));
  },
  setHiddenColumnIds: (hiddenColumnIds: string[]): void => {
    set({ hiddenColumnIds });
  },

  resetBoardView: (): void => {
    set({
      isConfigPanelOpen: false,
      hiddenColumnIds: defaultHiddenColumnIds,
    });
  },
}));
