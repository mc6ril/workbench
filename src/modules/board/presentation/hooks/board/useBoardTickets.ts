"use client";

import { useMemo } from "react";

import type {
  Ticket,
  TicketAssignee,
} from "@/modules/board/core/domain/ticket.types";
import type { BoardTicketViewModel } from "@/modules/board/presentation/types/boardView.types";
import { buildTicketCode } from "@/modules/board/utils/ticketUtils";

type UseBoardTicketsInput = {
  tickets: Ticket[];
  projectShortCode?: string | null;
  assigneesByTicketId?: Record<string, TicketAssignee[]>;
};

const mapTicketToViewModel = (
  ticket: Ticket,
  projectShortCode: string | null | undefined,
  assigneeName?: string | null,
  assigneeAvatarUrl?: string | null
): BoardTicketViewModel => {
  return {
    id: ticket.id,
    title: ticket.title,
    ticketCode: buildTicketCode(projectShortCode, ticket.codeNumber),
    columnId: ticket.columnId,
    assigneeName: assigneeName ?? null,
    assigneeAvatarUrl: assigneeAvatarUrl ?? null,
    priority: ticket.priority,
    storyPoints: ticket.storyPoints,
  };
};

export const useBoardTickets = ({
  tickets,
  projectShortCode,
  assigneesByTicketId = {},
}: UseBoardTicketsInput) => {
  const ticketViewModelById = useMemo(() => {
    const map = new Map<string, BoardTicketViewModel>();

    for (const ticket of tickets) {
      const primaryAssignee = assigneesByTicketId[ticket.id]?.[0];

      map.set(
        ticket.id,
        mapTicketToViewModel(
          ticket,
          projectShortCode,
          primaryAssignee?.displayName,
          primaryAssignee?.avatarUrl
        )
      );
    }

    return map;
  }, [assigneesByTicketId, projectShortCode, tickets]);

  return {
    filteredTickets: tickets,
    ticketViewModelById,
  };
};
