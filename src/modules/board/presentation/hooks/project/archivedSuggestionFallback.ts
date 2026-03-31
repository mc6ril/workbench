import { buildTicketDetailRoute } from "@/shared/utils/routes";

import type { Ticket } from "@/modules/board/core/domain/ticket.types";
import type { ProjectSearchSuggestion } from "@/modules/board/presentation/hooks/project/useProjectSearchSuggestions";
import { buildTicketCode, parseTicketCodeForProject } from "@/modules/board/utils/ticketUtils";

type BuildArchivedSuggestionFallbackInput = {
  projectId: string;
  projectShortCode: string | null | undefined;
  searchTerm: string;
  activeTicketsCount: number;
  archivedTicket: Ticket | null | undefined;
};

export const buildArchivedSuggestionFallback = ({
  projectId,
  projectShortCode,
  searchTerm,
  activeTicketsCount,
  archivedTicket,
}: BuildArchivedSuggestionFallbackInput): ProjectSearchSuggestion[] => {
  if (activeTicketsCount > 0) {
    return [];
  }

  const parsed = parseTicketCodeForProject(searchTerm, projectShortCode);
  if (!parsed.matchesProject || parsed.codeNumber == null) {
    return [];
  }

  if (!archivedTicket || archivedTicket.archivedAt == null) {
    return [];
  }

  return [
    {
      id: archivedTicket.id,
      label: `${buildTicketCode(projectShortCode, archivedTicket.codeNumber) ?? archivedTicket.codeNumber} ${archivedTicket.title}`,
      href: buildTicketDetailRoute(projectId, archivedTicket.id),
      isArchived: true,
    },
  ];
};

