import type { BoardColumnConfig } from "@/modules/board/core/domain/types/board.types";

import type { BoardColumnProps } from "@/modules/board/presentation/components/board/boardColumn/BoardColumn.types";

export type BoardViewProps = {
  columns: BoardColumnConfig[];
  renderColumn: (
    config: BoardColumnConfig
  ) => Omit<
    BoardColumnProps,
    "id" | "title" | "tickets" | "isSortable" | "isDragging"
  > & {
    tickets: BoardColumnProps["tickets"];
  };
  isLoading?: boolean;
  isEmpty?: boolean;
  isDragging?: boolean;
  isDragEnabled?: boolean;
  errorMessage?: string;
  className?: string;
};
