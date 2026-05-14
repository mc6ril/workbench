"use client";

import { useMemo } from "react";

import type { ProjectMember } from "@/domains/project/core/domain/project.types";
import type {
  Ticket,
  TicketAssignee,
} from "@/modules/board/core/domain/ticket.types";
import type { BoardTicketViewModel } from "@/modules/board/presentation/types/boardView.types";
import { resolveAssigneeIdentity } from "@/modules/board/utils/assigneeUtils";
import { buildTicketCode } from "@/modules/board/utils/ticketUtils";

type UseBoardTicketsInput = {
  tickets: Ticket[];
  projectShortCode?: string | null;
  assigneesByTicketId?: Record<string, TicketAssignee[]>;
  members?: ProjectMember[];
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
    checklistTotal: (ticket.checklist ?? []).length,
    checklistChecked: (ticket.checklist ?? []).filter((i) => i.checked).length,
  };
};

export const useBoardTickets = ({
  tickets,
  projectShortCode,
  assigneesByTicketId = {},
  members = [],
}: UseBoardTicketsInput) => {
  const ticketViewModelById = useMemo(() => {
    const map = new Map<string, BoardTicketViewModel>();

    for (const ticket of tickets) {
      const primaryAssignee = assigneesByTicketId[ticket.id]?.[0];
      const identity = resolveAssigneeIdentity(primaryAssignee, members);

      map.set(
        ticket.id,
        mapTicketToViewModel(
          ticket,
          projectShortCode,
          identity.displayName,
          identity.avatarUrl
        )
      );
    }

    return map;
  }, [assigneesByTicketId, members, projectShortCode, tickets]);

  return {
    filteredTickets: tickets,
    ticketViewModelById,
  };
};
