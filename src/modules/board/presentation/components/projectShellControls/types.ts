import {
  TicketFilters,
  TicketSort,
} from "@/modules/board/core/domain/schema/ticket.schema";

type Option = {
  value: string;
  label: string;
};

export type TicketFilterControlsProps = {
  filters: TicketFilters;
  statusOptions: Option[];
  onSetStatus: (value: string) => void;
  onClearStatus: () => void;
  onResetFilters: () => void;
};

export type TicketSortControlsProps = {
  sort: TicketSort;
  onSetField: (field: TicketSort["field"]) => void;
  onSetDirection: (direction: TicketSort["direction"]) => void;
  onResetSort: () => void;
};
