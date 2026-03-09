"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import AppFooter from "@/presentation/components/appFooter/AppFooter";
import Breadcrumbs from "@/presentation/components/breadcrumbs/Breadcrumbs";
import EpicFilterControls from "@/presentation/components/projectShellControls/EpicFilterControls";
import EpicSortControls from "@/presentation/components/projectShellControls/EpicSortControls";
import TicketFilterControls from "@/presentation/components/projectShellControls/TicketFilterControls";
import TicketSortControls from "@/presentation/components/projectShellControls/TicketSortControls";
import ProjectToolbar from "@/presentation/components/projectToolbar/ProjectToolbar";
import SidebarNavigation from "@/presentation/components/sidebarNavigation/SidebarNavigation";
import SkipLink from "@/presentation/components/skipLink/SkipLink";
import Modal from "@/presentation/components/ui/Modal";
import { useBoardConfiguration } from "@/presentation/hooks/board/useBoardConfiguration";
import { useEpicQueryParams } from "@/presentation/hooks/epic/useEpicQueryParams";
import { useEpics } from "@/presentation/hooks/epic/useEpics";
import { useLabels } from "@/presentation/hooks/label";
import { useProjectSearchSuggestions } from "@/presentation/hooks/project/useProjectSearchSuggestions";
import { useProjectRealtime } from "@/presentation/hooks/realtime/useProjectRealtime";
import { useSprints } from "@/presentation/hooks/sprint";
import DashboardShell from "@/presentation/layouts/dashboardShell/DashboardShell";
import { getProjectViewKeyFromPath } from "@/presentation/navigation/projectViews.config";
import {
  ProjectPermissionsProvider,
  useProjectPermissions,
} from "@/presentation/providers/permissions";
import { useFilterStore } from "@/presentation/stores/useFilterStore";
import { useSortStore } from "@/presentation/stores/useSortStore";

import { getAccessibilityId } from "@/shared/a11y/constants";
import {
  EPIC_PROGRESS_FILTER_VALUES,
  EPIC_SORT_FIELD_VALUES,
  SORT_DIRECTION_VALUES,
  TICKET_SORT_FIELD_VALUES,
} from "@/shared/constants/filterSort";
import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { useTranslation } from "@/shared/i18n";
import { buildProjectRoute } from "@/shared/utils/routes";

type Props = {
  projectId: string;
  children: React.ReactNode;
};

const ProjectShellContent = ({ projectId, children }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    canCreateEpic,
    canCreateTicket,
    isLoading: isPermissionsLoading,
  } = useProjectPermissions();
  const tSkipLink = useTranslation("navigation.skipLink");
  const tSidebar = useTranslation("navigation.sidebar");
  const tBreadcrumbs = useTranslation("navigation.breadcrumbs");
  const tNavbar = useTranslation("navigation.navbar");
  const mainContentId = getAccessibilityId("main-content");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const viewKey = useMemo(
    () => getProjectViewKeyFromPath(pathname, projectId),
    [pathname, projectId]
  );
  const isTicketView =
    viewKey === PROJECT_VIEWS.BACKLOG || viewKey === PROJECT_VIEWS.BOARD;

  const search = useFilterStore((state) => state.search);
  const setSearch = useFilterStore((state) => state.setSearch);
  const [searchInput, setSearchInput] = useState(search);
  const filters = useFilterStore((state) => state.filters);
  const setStatus = useFilterStore((state) => state.setStatus);
  const clearStatus = useFilterStore((state) => state.clearStatus);
  const setEpicId = useFilterStore((state) => state.setEpicId);
  const clearEpicId = useFilterStore((state) => state.clearEpicId);
  const setSprintId = useFilterStore((state) => state.setSprintId);
  const clearSprintId = useFilterStore((state) => state.clearSprintId);
  const setPriority = useFilterStore((state) => state.setPriority);
  const clearPriority = useFilterStore((state) => state.clearPriority);
  const setLabelIds = useFilterStore((state) => state.setLabelIds);
  const clearLabelIds = useFilterStore((state) => state.clearLabelIds);
  const resetSearch = useFilterStore((state) => state.resetSearch);
  const resetFilters = useFilterStore((state) => state.resetFilters);
  const sort = useSortStore((state) => state.sort);
  const setField = useSortStore((state) => state.setField);
  const setDirection = useSortStore((state) => state.setDirection);
  const resetSort = useSortStore((state) => state.resetSort);
  const { data: boardConfiguration } = useBoardConfiguration(projectId, {
    enabled: isTicketView,
  });
  useProjectRealtime(projectId, boardConfiguration?.board.id);
  const { data: epics = [] } = useEpics(projectId, { enabled: isTicketView });
  const { data: sprints = [] } = useSprints(projectId, {
    enabled: isTicketView,
  });
  const { data: labels = [] } = useLabels(projectId, { enabled: isTicketView });
  const searchSuggestions = useProjectSearchSuggestions({
    projectId,
    viewKey,
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

    return () => {
      window.clearTimeout(timeout);
    };
  }, [search, searchInput, setSearch]);

  const updateQueryParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value == null || value === "") {
          params.delete(key);
          continue;
        }
        params.set(key, value);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  const { epicProgressFilter, epicSortField, epicSortDirection } =
    useEpicQueryParams(searchParams);
  const isTicketFilterActive = Object.keys(filters).length > 0;
  const isTicketSortActive =
    sort.field !== TICKET_SORT_FIELD_VALUES.CREATED_AT ||
    sort.direction !== SORT_DIRECTION_VALUES.DESC;
  const isEpicFilterActive =
    epicProgressFilter !== EPIC_PROGRESS_FILTER_VALUES.ALL;
  const isEpicSortActive =
    epicSortField !== EPIC_SORT_FIELD_VALUES.UPDATED_AT ||
    epicSortDirection !== SORT_DIRECTION_VALUES.DESC;
  const isFilterActive = isTicketView
    ? isTicketFilterActive
    : isEpicFilterActive;
  const isSortActive = isTicketView ? isTicketSortActive : isEpicSortActive;

  const statusOptions = useMemo(() => {
    const columns = boardConfiguration?.columns ?? [];
    return columns.map((column) => ({
      value: column.status,
      label: column.name,
    }));
  }, [boardConfiguration?.columns]);

  const epicOptions = useMemo(() => {
    if (!isTicketView) {
      return [];
    }

    return epics.map((epic) => ({
      value: epic.id,
      label: epic.name,
    }));
  }, [epics, isTicketView]);

  const sprintOptions = useMemo(() => {
    if (!isTicketView) {
      return [];
    }

    return sprints.map((sprint) => ({
      value: sprint.id,
      label: sprint.name,
    }));
  }, [isTicketView, sprints]);

  const labelOptions = useMemo(() => {
    if (!isTicketView) {
      return [];
    }

    return labels.map((label) => ({
      value: label.id,
      label: label.name,
    }));
  }, [isTicketView, labels]);

  useEffect(() => {
    resetSearch();
    resetFilters();
    resetSort();
  }, [projectId, resetFilters, resetSearch, resetSort]);

  const handleFilterClick = useCallback(() => {
    setIsFilterModalOpen(true);
  }, []);

  const handleSortClick = useCallback(() => {
    setIsSortModalOpen(true);
  }, []);
  const handleResetTicketFilters = useCallback(() => {
    resetFilters();
    setIsFilterModalOpen(false);
  }, [resetFilters]);
  const handleResetTicketSort = useCallback(() => {
    resetSort();
    setIsSortModalOpen(false);
  }, [resetSort]);

  const canAddAction = useMemo(() => {
    if (viewKey === PROJECT_VIEWS.EPICS) {
      return canCreateEpic;
    }

    if (viewKey === PROJECT_VIEWS.BACKLOG || viewKey === PROJECT_VIEWS.BOARD) {
      return canCreateTicket;
    }

    return false;
  }, [canCreateEpic, canCreateTicket, viewKey]);

  const handleAddClick = useCallback(() => {
    if (!canAddAction) {
      return;
    }

    if (viewKey === PROJECT_VIEWS.EPICS) {
      router.push(
        `${buildProjectRoute(projectId, PROJECT_VIEWS.EPICS)}?createEpic=1`
      );
      return;
    }

    router.push(
      `${buildProjectRoute(projectId, PROJECT_VIEWS.BACKLOG)}?createTicket=1`
    );
  }, [canAddAction, projectId, router, viewKey]);

  return (
    <>
      <SkipLink targetId={mainContentId} label={tSkipLink("label")} />

      <DashboardShell
        sidebar={<SidebarNavigation projectId={projectId} />}
        sidebarAriaLabel={tSidebar("ariaLabel")}
        header={
          <ProjectToolbar
            projectId={projectId}
            searchValue={searchInput}
            searchSuggestions={searchSuggestions}
            onSearchChange={setSearchInput}
            onFilterClick={handleFilterClick}
            onSortClick={handleSortClick}
            isFilterActive={isFilterActive}
            isSortActive={isSortActive}
            onAddClick={handleAddClick}
            canAddAction={canAddAction}
            isPermissionsLoading={isPermissionsLoading}
          />
        }
        breadcrumbs={<Breadcrumbs projectId={projectId} />}
        breadcrumbsAriaLabel={tBreadcrumbs("ariaLabel")}
        footer={<AppFooter />}
      >
        {children}
      </DashboardShell>

      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => {
          setIsFilterModalOpen(false);
        }}
        title={tNavbar("filter")}
      >
        {isTicketView ? (
          <TicketFilterControls
            filters={filters}
            statusOptions={statusOptions}
            epicOptions={epicOptions}
            sprintOptions={sprintOptions}
            labelOptions={labelOptions}
            onSetStatus={setStatus}
            onClearStatus={clearStatus}
            onSetEpicId={setEpicId}
            onClearEpicId={clearEpicId}
            onSetSprintId={setSprintId}
            onClearSprintId={clearSprintId}
            onSetPriority={setPriority}
            onClearPriority={clearPriority}
            onSetLabelIds={setLabelIds}
            onClearLabelIds={clearLabelIds}
            onResetFilters={handleResetTicketFilters}
          />
        ) : (
          <EpicFilterControls
            epicProgressFilter={epicProgressFilter}
            onChange={(nextFilter) => {
              updateQueryParams({ epicProgress: nextFilter });
            }}
            onReset={() => {
              updateQueryParams({
                epicProgress: EPIC_PROGRESS_FILTER_VALUES.ALL,
              });
              setIsFilterModalOpen(false);
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={isSortModalOpen}
        onClose={() => {
          setIsSortModalOpen(false);
        }}
        title={tNavbar("sort")}
      >
        {isTicketView ? (
          <TicketSortControls
            sort={sort}
            onSetField={setField}
            onSetDirection={setDirection}
            onResetSort={handleResetTicketSort}
          />
        ) : (
          <EpicSortControls
            epicSortField={epicSortField}
            epicSortDirection={epicSortDirection}
            onSetField={(nextField) => {
              updateQueryParams({ epicSortField: nextField });
            }}
            onSetDirection={(nextDirection) => {
              updateQueryParams({ epicSortDirection: nextDirection });
            }}
            onReset={() => {
              updateQueryParams({
                epicSortField: EPIC_SORT_FIELD_VALUES.UPDATED_AT,
                epicSortDirection: SORT_DIRECTION_VALUES.DESC,
              });
              setIsSortModalOpen(false);
            }}
          />
        )}
      </Modal>
    </>
  );
};

const ProjectShell = ({ projectId, children }: Props) => {
  return (
    <ProjectPermissionsProvider projectId={projectId}>
      <ProjectShellContent projectId={projectId}>
        {children}
      </ProjectShellContent>
    </ProjectPermissionsProvider>
  );
};

export default ProjectShell;
