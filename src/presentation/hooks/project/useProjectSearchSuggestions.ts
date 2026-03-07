import { useMemo } from "react";

import { useEpics } from "@/presentation/hooks/epic/useEpics";
import { useTickets } from "@/presentation/hooks/ticket/useTickets";
import type { ProjectViewKey } from "@/presentation/navigation/projectViews.config";

import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { filterEpicsBySearch } from "@/shared/utils/epicUtils";
import { buildProjectRoute } from "@/shared/utils/routes";
import {
  buildTicketCode,
  filterTicketsBySearch,
} from "@/shared/utils/ticketUtils";

import { useProject } from "./useProject";

export type ProjectSearchSuggestion = {
  id: string;
  label: string;
  href: string;
};

type Input = {
  projectId: string;
  viewKey: ProjectViewKey;
  searchValue: string;
};

export const useProjectSearchSuggestions = ({
  projectId,
  viewKey,
  searchValue,
}: Input): ProjectSearchSuggestion[] => {
  const isTicketView =
    viewKey === PROJECT_VIEWS.BACKLOG || viewKey === PROJECT_VIEWS.BOARD;
  const isBacklogView = viewKey === PROJECT_VIEWS.BACKLOG;
  const isEpicsView = viewKey === PROJECT_VIEWS.EPICS;

  const { data: project } = useProject(projectId, {
    enabled: isTicketView,
  });

  // Intentionally ignore active filter/sort stores here:
  // suggestions should act as a global lookup within the current ticket view.
  const { data: tickets = [] } = useTickets(
    projectId,
    isBacklogView ? { parentId: null } : undefined,
    undefined,
    { enabled: isTicketView }
  );

  const { data: epics = [] } = useEpics(projectId, { enabled: isEpicsView });

  const projectShortCode = project?.shortCode;

  return useMemo(() => {
    const searchTerm = searchValue.trim();
    if (searchTerm === "") {
      return [];
    }

    if (isEpicsView) {
      return filterEpicsBySearch(epics, searchTerm)
        .slice(0, 6)
        .map((epic) => ({
          id: epic.id,
          label: epic.name,
          href: `${buildProjectRoute(projectId, PROJECT_VIEWS.EPICS)}#epic-${epic.id}`,
        }));
    }

    if (isTicketView) {
      return filterTicketsBySearch(tickets, searchTerm, projectShortCode)
        .slice(0, 6)
        .map((ticket) => ({
          id: ticket.id,
          label: `${buildTicketCode(projectShortCode, ticket.codeNumber) ?? ticket.codeNumber} ${ticket.title}`,
          href: `${buildProjectRoute(projectId, viewKey)}?ticket=${ticket.id}`,
        }));
    }

    return [];
  }, [
    epics,
    isEpicsView,
    isTicketView,
    projectId,
    projectShortCode,
    searchValue,
    tickets,
    viewKey,
  ]);
};
