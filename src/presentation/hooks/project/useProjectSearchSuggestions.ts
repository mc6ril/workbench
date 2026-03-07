import { useMemo } from "react";

import { useEpics } from "@/presentation/hooks/epic/useEpics";
import { useTickets } from "@/presentation/hooks/ticket/useTickets";
import type { ProjectViewKey } from "@/presentation/navigation/projectViews.config";

import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { filterEpicsBySearch } from "@/shared/utils/epicUtils";
import { buildProjectRoute } from "@/shared/utils/routes";
import {
  buildTicketCode,
  normalizeTicketSearch,
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
  const searchTerm = searchValue.trim();

  const { data: project } = useProject(projectId, {
    enabled: isTicketView,
  });

  const { data: epics = [] } = useEpics(projectId, { enabled: isEpicsView });

  const projectShortCode = project?.shortCode;
  const effectiveSearch = useMemo(() => {
    return normalizeTicketSearch(searchTerm, projectShortCode);
  }, [projectShortCode, searchTerm]);
  const hasEffectiveSearchTerm = effectiveSearch.trim() !== "";

  // Intentionally ignore active filter/sort stores here:
  // suggestions should act as a global lookup within the current ticket view.
  const { data: tickets = [] } = useTickets(
    projectId,
    isBacklogView ? { parentId: null } : undefined,
    undefined,
    effectiveSearch,
    { enabled: isTicketView && hasEffectiveSearchTerm, limit: 20 }
  );
  return useMemo(() => {
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
      return tickets.slice(0, 6).map((ticket) => ({
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
    searchTerm,
    tickets,
    viewKey,
  ]);
};
