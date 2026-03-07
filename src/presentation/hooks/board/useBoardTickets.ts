"use client";

import { useMemo } from "react";

import type { Ticket } from "@/core/domain/schema/ticket.schema";

import { useTicketAssigneesByTicketIds } from "@/presentation/hooks/ticket/useTicketAssigneesByTicketIds";

import type { BoardTicketViewModel } from "@/shared/types/board";
import { buildTicketCode } from "@/shared/utils/ticketUtils";

type UseBoardTicketsInput = {
  tickets: Ticket[];
  projectShortCode?: string | null;
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
    status: ticket.status,
    assigneeName: assigneeName ?? null,
    assigneeAvatarUrl: assigneeAvatarUrl ?? null,
  };
};

export const useBoardTickets = ({
  tickets,
  projectShortCode,
}: UseBoardTicketsInput) => {
  const filteredTicketIds = useMemo(() => {
    return tickets.map((ticket) => ticket.id);
  }, [tickets]);

  const { data: assigneesByTicketId = {} } =
    useTicketAssigneesByTicketIds(filteredTicketIds);

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
