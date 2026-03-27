import {
  TicketFilters,
  TicketPriority,
  TicketSort,
} from "@/modules/board/core/domain/schema/ticket.schema";

type Option = {
  value: string;
  label: string;
};

export type TicketFilterControlsProps = {
  filters: TicketFilters;
  statusOptions: Option[];
  labelOptions: Option[];
  onSetStatus: (value: string) => void;
  onClearStatus: () => void;
  onSetPriority: (value: TicketPriority) => void;
  onClearPriority: () => void;
  onSetLabelIds: (value: string[]) => void;
  onClearLabelIds: () => void;
  onResetFilters: () => void;
};

export type TicketSortControlsProps = {
  sort: TicketSort;
  onSetField: (field: TicketSort["field"]) => void;
  onSetDirection: (direction: TicketSort["direction"]) => void;
  onResetSort: () => void;
};
