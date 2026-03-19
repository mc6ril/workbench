import type { BoardTicketViewModel } from "@/modules/board/core/domain/types/board.types";

export type BoardColumnProps = {
  id: string;
  title: string;
  tickets: BoardTicketViewModel[];
  isDragging?: boolean;
  isSortable?: boolean;
  onTicketClick?: (ticketId: string) => void;
  className?: string;
};
