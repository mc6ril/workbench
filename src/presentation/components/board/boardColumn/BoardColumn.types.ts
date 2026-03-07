import type { BoardTicketViewModel } from "@/shared/types/board";

export type BoardColumnProps = {
  id: string;
  title: string;
  tickets: BoardTicketViewModel[];
  isDragging?: boolean;
  onTicketClick?: (ticketId: string) => void;
  className?: string;
};
