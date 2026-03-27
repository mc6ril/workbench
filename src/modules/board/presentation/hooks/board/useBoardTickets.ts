"use client";

import { useMemo } from "react";

import { useProjectMembers } from "@/domains/project/presentation/hooks/member/useProjectMembers";
import type { Ticket } from "@/modules/board/core/domain/schema/ticket.schema";
import type { BoardTicketViewModel } from "@/modules/board/core/domain/types/board.types";
import { useTicketAssigneesByProjectId } from "@/modules/board/presentation/hooks/ticket/useTicketAssigneesByProjectId";
import { resolveAssigneeIdentity } from "@/modules/board/utils/assigneeUtils";
import { buildTicketCode } from "@/modules/board/utils/ticketUtils";

type UseBoardTicketsInput = {
  projectId: string;
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
    priority: ticket.priority,
    storyPoints: ticket.storyPoints,
  };
};

export const useBoardTickets = ({
  projectId,
  tickets,
  projectShortCode,
}: UseBoardTicketsInput) => {
  const { data: assigneesByTicketId = {} } =
    useTicketAssigneesByProjectId(projectId);
  const { data: projectMembers = [] } = useProjectMembers(projectId);

  const ticketViewModelById = useMemo(() => {
    const map = new Map<string, BoardTicketViewModel>();

    for (const ticket of tickets) {
      const primaryAssignee = assigneesByTicketId[ticket.id]?.[0];
      const assigneeIdentity = resolveAssigneeIdentity(
        primaryAssignee,
        projectMembers
      );

      map.set(
        ticket.id,
        mapTicketToViewModel(
          ticket,
          projectShortCode,
          assigneeIdentity.displayName,
          assigneeIdentity.avatarUrl
        )
      );
    }

    return map;
  }, [assigneesByTicketId, projectMembers, projectShortCode, tickets]);

  return {
    filteredTickets: tickets,
    ticketViewModelById,
  };
};
