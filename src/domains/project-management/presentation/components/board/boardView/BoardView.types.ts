import type { BoardColumnConfig } from "@/shared/types/board";

import type { BoardColumnProps } from "@/domains/project-management/presentation/components/board/boardColumn/BoardColumn.types";

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
