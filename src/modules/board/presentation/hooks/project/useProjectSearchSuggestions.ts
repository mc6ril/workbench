import { useMemo } from "react";

import { PROJECT_VIEWS, type ProjectView } from "@/shared/constants/routes";
import { buildProjectRoute } from "@/shared/utils/routes";

import type { Ticket } from "@/modules/board/core/domain/schema/ticket.schema";
import { useProjectShortCode } from "@/modules/board/presentation/hooks/project/useProjectShortCode";
import { useTickets } from "@/modules/board/presentation/hooks/ticket/useTickets";
import {
  buildTicketCode,
  normalizeTicketSearch,
} from "@/modules/board/utils/ticketUtils";

export type ProjectSearchSuggestion = {
  id: string;
  label: string;
  href: string;
};

const EMPTY_TICKETS: Ticket[] = [];
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
}: Input): ProjectSearchSuggestion[] => {
  const isTicketView = viewKey === PROJECT_VIEWS.BOARD;
  const searchTerm = searchValue.trim();

  const { data: projectShortCode } = useProjectShortCode(projectId);
  const effectiveSearch = useMemo(() => {
    return normalizeTicketSearch(searchTerm, projectShortCode);
  }, [projectShortCode, searchTerm]);
  const hasEffectiveSearchTerm = effectiveSearch.trim() !== "";

  // Intentionally ignore active filter/sort stores here:
  // suggestions should act as a global lookup within the current ticket view.
  const { data: ticketsData } = useTickets(
    projectId,
    undefined,
    effectiveSearch,
    { enabled: isTicketView && hasEffectiveSearchTerm, limit: 20 }
  );
  const tickets = ticketsData ?? EMPTY_TICKETS;

  return useMemo(() => {
    if (searchTerm === "") {
      return EMPTY_SEARCH_SUGGESTIONS;
    }

    if (isTicketView) {
      return tickets.slice(0, 6).map((ticket) => ({
        id: ticket.id,
        label: `${buildTicketCode(projectShortCode, ticket.codeNumber) ?? ticket.codeNumber} ${ticket.title}`,
        href: `${buildProjectRoute(projectId, viewKey)}?ticket=${ticket.id}`,
      }));
    }

    return EMPTY_SEARCH_SUGGESTIONS;
  }, [
    isTicketView,
    projectId,
    projectShortCode,
    searchTerm,
    tickets,
    viewKey,
  ]);
};
