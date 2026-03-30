import type { TicketFilters } from "@/modules/board/core/domain/ticket.types";

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
