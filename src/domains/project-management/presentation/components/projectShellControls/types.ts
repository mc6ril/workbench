import {
  TicketFilters,
  TicketPriority,
  TicketSort,
} from "@/domains/project-management/core/domain/schema/ticket.schema";
import {
  EpicProgressFilter,
  EpicSortField,
} from "@/domains/project-management/core/domain/types";
import type { SortDirection } from "@/shared/types";

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
  sprintOptions: Option[];
  labelOptions: Option[];
  onSetStatus: (value: string) => void;
  onClearStatus: () => void;
  onSetEpicId: (value: string) => void;
  onClearEpicId: () => void;
  onSetSprintId: (value: string | null) => void;
  onClearSprintId: () => void;
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
