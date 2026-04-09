import { useMemo } from "react";

import { PROJECT_VIEWS, type ProjectView } from "@/shared/constants/routes";
import { buildTicketDetailRoute } from "@/shared/utils/routes";

import type { TicketSearchItem } from "@/modules/board/core/domain/ticket.types";
import { buildArchivedSuggestionFallback } from "@/modules/board/presentation/hooks/project/archivedSuggestionFallback";
import { useProjectShortCode } from "@/modules/board/presentation/hooks/project/useProjectShortCode";
import { useTicketByCodeIncludingArchived } from "@/modules/board/presentation/hooks/ticket/useTicketByCodeIncludingArchived";
import { useTicketSearchSuggestions } from "@/modules/board/presentation/hooks/ticket/useTicketSearchSuggestions";
import {
  buildTicketCode,
  normalizeTicketSearch,
  parseTicketCodeForProject,
} from "@/modules/board/utils/ticketUtils";

export type ProjectSearchSuggestion = {
  id: string;
  label: string;
  href: string;
  isArchived: boolean;
};

const EMPTY_TICKET_SEARCH_ITEMS: TicketSearchItem[] = [];
const EMPTY_SEARCH_SUGGESTIONS: ProjectSearchSuggestion[] = [];

type Input = {
  projectId: string;
  viewKey: ProjectView;
  searchValue: string;
};

export const useProjectSearchSuggestions = ({
  projectId,
  viewKey,
  searchValue,
}: Input): ProjectToolbarSearchSuggestion[] => {
  const isTicketView = viewKey === PROJECT_VIEWS.BOARD;
  const searchTerm = searchValue.trim();
  const shouldResolveProjectShortCode = isTicketView && searchTerm !== "";

  const { data: projectShortCode } = useProjectShortCode(projectId, {
    enabled: shouldResolveProjectShortCode,
  });
  const effectiveSearch = useMemo(() => {
    return normalizeTicketSearch(searchTerm, projectShortCode);
  }, [projectShortCode, searchTerm]);
  const hasEffectiveSearchTerm = effectiveSearch.trim() !== "";

  // Intentionally ignore active filter/sort stores here:
  // suggestions should act as a global lookup within the current ticket view.
  const { data: ticketsData } = useTicketSearchSuggestions(
    projectId,
    effectiveSearch,
    { enabled: isTicketView && hasEffectiveSearchTerm, limit: 6 }
  );
  const tickets = ticketsData ?? EMPTY_TICKET_SEARCH_ITEMS;

  const parsedTicketCode = useMemo(() => {
    return parseTicketCodeForProject(searchTerm, projectShortCode);
  }, [projectShortCode, searchTerm]);

  const shouldLookupArchivedByCode =
    isTicketView &&
    hasEffectiveSearchTerm &&
    tickets.length === 0 &&
    parsedTicketCode.matchesProject &&
    parsedTicketCode.codeNumber != null;

  const { data: archivedTicket } = useTicketByCodeIncludingArchived(
    projectId,
    parsedTicketCode.codeNumber,
    { enabled: shouldLookupArchivedByCode }
  );

  return useMemo(() => {
    if (searchTerm === "") {
      return EMPTY_SEARCH_SUGGESTIONS;
    }

    if (isTicketView) {
      if (tickets.length > 0) {
        return tickets.map((ticket) => ({
          id: ticket.id,
          label: `${buildTicketCode(projectShortCode, ticket.codeNumber) ?? ticket.codeNumber} ${ticket.title}`,
          href: buildTicketDetailRoute(projectId, ticket.id),
          isArchived: false,
        }));
      }

      const archivedFallback = buildArchivedSuggestionFallback({
        projectId,
        projectShortCode,
        searchTerm,
        activeTicketsCount: tickets.length,
        archivedTicket,
      });

      return archivedFallback.length > 0 ? archivedFallback : EMPTY_SEARCH_SUGGESTIONS;
    }

    return EMPTY_SEARCH_SUGGESTIONS;
  }, [
    isTicketView,
    projectId,
    projectShortCode,
    searchTerm,
    tickets,
    archivedTicket,
  ]);
};
