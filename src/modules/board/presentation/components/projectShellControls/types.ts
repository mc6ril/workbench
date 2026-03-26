import type { SortDirection } from "@/modules/board/core/domain/schema/ticket.schema";
import {
  TicketFilters,
  TicketPriority,
  TicketSort,
} from "@/modules/board/core/domain/schema/ticket.schema";
import {
  EpicProgressFilter,
  EpicSortField,
} from "@/modules/board/core/domain/types";

type Option = {
  value: string;
  label: string;
};

export type EpicFilterControlsProps = {
  epicProgressFilter: EpicProgressFilter;
  onChange: (next: EpicProgressFilter) => void;
  onReset: () => void;
};

export type TicketFilterControlsProps = {
  filters: TicketFilters;
  statusOptions: Option[];
  epicOptions: Option[];
  labelOptions: Option[];
  onSetStatus: (value: string) => void;
  onClearStatus: () => void;
  onSetEpicId: (value: string) => void;
  onClearEpicId: () => void;
  onSetPriority: (value: TicketPriority) => void;
  onClearPriority: () => void;
  onSetLabelIds: (value: string[]) => void;
  onClearLabelIds: () => void;
  onResetFilters: () => void;
};

export type EpicSortControlsProps = {
  epicSortField: EpicSortField;
  epicSortDirection: SortDirection;
  onSetField: (field: EpicSortField) => void;
  onSetDirection: (direction: SortDirection) => void;
  onReset: () => void;
};

export type TicketSortControlsProps = {
  sort: TicketSort;
  onSetField: (field: TicketSort["field"]) => void;
  onSetDirection: (direction: TicketSort["direction"]) => void;
  onResetSort: () => void;
};
