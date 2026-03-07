import type { BoardColumnProps } from "@/presentation/components/board/boardColumn/BoardColumn.types";

import type { BoardColumnConfig } from "@/shared/types/board";

export type BoardViewProps = {
  columns: BoardColumnConfig[];
  renderColumn: (config: BoardColumnConfig) => Omit<
    BoardColumnProps,
    "id" | "title" | "tickets"
  > & {
    tickets: BoardColumnProps["tickets"];
  };
  isLoading?: boolean;
  isEmpty?: boolean;
  isDragging?: boolean;
  errorMessage?: string;
  className?: string;
};
