import { create } from "zustand";

import type { TicketSort } from "@/core/domain/schema/ticket.schema";

type SortState = {
  sort: TicketSort;
};

type SortActions = {
  setSort: (sort: TicketSort) => void;
  setField: (field: TicketSort["field"]) => void;
  setDirection: (direction: TicketSort["direction"]) => void;
  resetSort: () => void;
};

type SortStore = SortState & SortActions;

const defaultSort: TicketSort = { field: "createdAt", direction: "desc" };

export const useSortStore = create<SortStore>((set) => ({
  sort: defaultSort,

  setSort: (sort: TicketSort): void => {
    set({ sort });
  },
  setField: (field: TicketSort["field"]): void => {
    set((state) => ({
      sort: {
        ...state.sort,
        field,
      },
    }));
  },
  setDirection: (direction: TicketSort["direction"]): void => {
    set((state) => ({
      sort: {
        ...state.sort,
        direction,
      },
    }));
  },
  resetSort: (): void => {
    set({ sort: defaultSort });
  },
}));

