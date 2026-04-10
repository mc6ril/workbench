import type { BoardTicketViewModel } from "@/modules/board/presentation/types/boardView.types";

export type BoardColumnProps = {
  id: string;
  title: string;
  tickets: readonly BoardTicketViewModel[];
  isDragging?: boolean;
  isSortable?: boolean;
  onTicketClick?: (ticketId: string) => void;
  onTicketPrefetch?: (ticketId: string) => void;
  className?: string;
};
