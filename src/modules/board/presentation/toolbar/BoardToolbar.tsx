"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { useTranslations } from "@/shared/i18n";
import { useAppRouter } from "@/shared/navigation/useAppRouter";
import { buildProjectRoute, normalizePath } from "@/shared/utils/routes";

import type { ProjectMember } from "@/domains/project/core/domain/project.types";
import ProjectToolbar from "@/domains/project/presentation/components/projectToolbar/ProjectToolbar";
import {
  PROJECT_TOOLBAR_UNASSIGNED_FILTER_ID,
  type ProjectToolbarAssigneeFilter,
} from "@/domains/project/presentation/components/projectToolbar/ProjectToolbar.types";
import { useToolbarBreadcrumb } from "@/domains/project/presentation/contexts/ToolbarBreadcrumb";
import { useProjectMembers } from "@/domains/project/presentation/hooks/member/useProjectMembers";
import { getProjectViewConfig } from "@/domains/project/presentation/navigation/projectViews.config";
import { useProjectPermissions } from "@/domains/project/presentation/providers/permissions/ProjectPermissionsProvider";
import type { TicketFilters } from "@/modules/board/core/domain/ticket.types";
import { useProjectSearchSuggestions } from "@/modules/board/presentation/hooks/project/useProjectSearchSuggestions";
import { useFilterStore } from "@/modules/board/presentation/stores/useFilterStore";

const EMPTY_PROJECT_MEMBERS: ProjectMember[] = [];
const EMPTY_FILTERS: TicketFilters = {};
const boardViewConfig = getProjectViewConfig(PROJECT_VIEWS.BOARD);

type Props = {
  projectId: string;
};

const BoardToolbar = ({ projectId }: Props) => {
  const router = useAppRouter();
  const pathname = usePathname();
  const tSidebar = useTranslations("navigation.sidebar");
  const tBoardFilters = useTranslations("pages.board.filters");
  const { canCreateTicket } = useProjectPermissions();

  const boardRoute = buildProjectRoute(projectId, PROJECT_VIEWS.BOARD);
  const isTicketDetailRoute = normalizePath(pathname).startsWith(
    `${boardRoute}/tickets/`
  );
  const { childLabel } = useToolbarBreadcrumb();

  const filterProjectId = useFilterStore((state) => state.projectId);
  const rawSearch = useFilterStore((state) => state.search);
  const rawFilters = useFilterStore((state) => state.filters);
  const setSearch = useFilterStore((state) => state.setSearch);
  const setAssigneeUserId = useFilterStore((state) => state.setAssigneeUserId);
  const setUnassignedOnly = useFilterStore((state) => state.setUnassignedOnly);
  const clearAssigneeUserId = useFilterStore(
    (state) => state.clearAssigneeUserId
  );
  const initializeProject = useFilterStore((state) => state.initializeProject);

  const isFilterStoreReady = filterProjectId === projectId;
  const search = isFilterStoreReady ? rawSearch : "";
  const filters = isFilterStoreReady ? rawFilters : EMPTY_FILTERS;
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    initializeProject(projectId);
  }, [initializeProject, projectId]);

  const { data: projectMembersData } = useProjectMembers(projectId);
  const projectMembers = projectMembersData ?? EMPTY_PROJECT_MEMBERS;

  const pageTitle = tSidebar(`items.${boardViewConfig.sidebarLabelKey}`);

  const searchSuggestions = useProjectSearchSuggestions({
    projectId,
    viewKey: PROJECT_VIEWS.BOARD,
    searchValue: search,
  });

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
      }
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [search, searchInput, setSearch]);

  const handleAssigneeFilterChange = useCallback(
    (filterId: string | null) => {
      if (!filterId) {
        clearAssigneeUserId();
        return;
      }
      if (filterId === PROJECT_TOOLBAR_UNASSIGNED_FILTER_ID) {
        setUnassignedOnly();
        return;
      }
      setAssigneeUserId(filterId);
    },
    [clearAssigneeUserId, setAssigneeUserId, setUnassignedOnly]
  );

  const handleAddClick = useCallback(() => {
    if (!canCreateTicket) return;
    router.push(
      `${buildProjectRoute(projectId, PROJECT_VIEWS.BOARD)}?createTicket=1`
    );
  }, [canCreateTicket, projectId, router]);

  const assigneeFilters = useMemo<ProjectToolbarAssigneeFilter[]>(() => {
    const unassigned: ProjectToolbarAssigneeFilter = {
      type: "unassigned",
      label: tBoardFilters("assigneeUnassignedLabel"),
    };
    const members: ProjectToolbarAssigneeFilter[] = projectMembers.map(
      (member) => ({
        type: "member" as const,
        userId: member.userId,
        label: member.profile.displayName?.trim() || member.profile.email,
        avatarUrl: member.profile.avatarUrl ?? null,
      })
    );
    return [unassigned, ...members];
  }, [projectMembers, tBoardFilters]);

  if (isTicketDetailRoute) {
    return (
      <ProjectToolbar
        pageTitle={pageTitle}
        breadcrumb={{
          parentLabel: pageTitle,
          parentHref: boardRoute,
          childLabel,
        }}
      />
    );
  }

  return (
    <ProjectToolbar
      pageTitle={pageTitle}
      hideTitleOnMobile
      showSearch
      addActionType="ticket"
      searchValue={searchInput}
      isSearchDisabled={false}
      searchSuggestions={searchSuggestions}
      onSearchChange={setSearchInput}
      onAddClick={handleAddClick}
      canAddAction={canCreateTicket}
      assigneeFilters={assigneeFilters}
      areAssigneeFiltersDisabled={false}
      selectedAssigneeFilterId={
        filters.unassignedOnly
          ? PROJECT_TOOLBAR_UNASSIGNED_FILTER_ID
          : (filters.assigneeUserId ?? null)
      }
      assigneeFiltersLabel={tBoardFilters("assigneeLabel")}
      onAssigneeFilterChange={handleAssigneeFilterChange}
    />
  );
};

export default BoardToolbar;
