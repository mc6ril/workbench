"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { GuideIcon } from "@/shared/design-system/icons";
import Modal from "@/shared/design-system/modal";
import { useTranslation } from "@/shared/i18n";
import { buildProjectRoute, normalizePath } from "@/shared/utils/routes";

import {
  EMPTY_PROJECT_VIEW_CONTRIBUTION,
  type ProjectViewContribution,
} from "@/domains/project/core/domain/shell/projectViewContribution";
import { useRegisterProjectViewContribution } from "@/domains/project/presentation/layouts/projectShell/ProjectShellContributionContext";
import { useProjectPermissions } from "@/domains/project/presentation/providers/permissions";
import {
  EPIC_PROGRESS_FILTER_VALUES,
  EPIC_SORT_FIELD_VALUES,
  SORT_DIRECTION_VALUES,
  TICKET_SORT_FIELD_VALUES,
} from "@/modules/board/constants/filterSort";
import type { EpicWithProgress } from "@/modules/board/core/domain/schema/epic.schema";
import type { Label } from "@/modules/board/core/domain/schema/label.schema";
import type { TicketFilters } from "@/modules/board/core/domain/schema/ticket.schema";
import Breadcrumbs from "@/modules/board/presentation/components/breadcrumbs/Breadcrumbs";
import EpicFilterControls from "@/modules/board/presentation/components/projectShellControls/EpicFilterControls";
import EpicSortControls from "@/modules/board/presentation/components/projectShellControls/EpicSortControls";
import TicketFilterControls from "@/modules/board/presentation/components/projectShellControls/TicketFilterControls";
import TicketSortControls from "@/modules/board/presentation/components/projectShellControls/TicketSortControls";
import ProjectToolbar from "@/modules/board/presentation/components/projectToolbar/ProjectToolbar";
import type { ProjectToolbarExtraTool } from "@/modules/board/presentation/components/projectToolbar/ProjectToolbar.types";
import { useBoardConfiguration } from "@/modules/board/presentation/hooks/board/useBoardConfiguration";
import { useEpicQueryParams } from "@/modules/board/presentation/hooks/epic/useEpicQueryParams";
import { useEpics } from "@/modules/board/presentation/hooks/epic/useEpics";
import { useLabels } from "@/modules/board/presentation/hooks/label";
import { usePrefetchProjectViews } from "@/modules/board/presentation/hooks/project/usePrefetchProjectViews";
import { useProjectSearchSuggestions } from "@/modules/board/presentation/hooks/project/useProjectSearchSuggestions";
import { useProjectShortCode } from "@/modules/board/presentation/hooks/project/useProjectShortCode";
import { useProjectRealtime } from "@/modules/board/presentation/hooks/realtime/useProjectRealtime";
import { useFilterStore } from "@/modules/board/presentation/stores/useFilterStore";
import { useSortStore } from "@/modules/board/presentation/stores/useSortStore";
import { normalizeTicketSearch } from "@/modules/board/utils/ticketUtils";

type Props = {
  projectId: string;
};

type BoardShellViewKey =
  | typeof PROJECT_VIEWS.BOARD
  | typeof PROJECT_VIEWS.EPICS;

const EMPTY_EPICS: readonly EpicWithProgress[] = [];
const EMPTY_LABELS: readonly Label[] = [];

const getBoardShellViewKey = (
  pathname: string,
  projectId: string
): BoardShellViewKey | null => {
  const normalizedPathname = normalizePath(pathname);
  const projectRootPath = `/${projectId}`;

  if (
    normalizedPathname === projectRootPath ||
    normalizedPathname.startsWith(`${projectRootPath}/${PROJECT_VIEWS.BOARD}`)
  ) {
    return PROJECT_VIEWS.BOARD;
  }

  if (normalizedPathname.startsWith(`${projectRootPath}/${PROJECT_VIEWS.EPICS}`)) {
    return PROJECT_VIEWS.EPICS;
  }

  return null;
};

const omitHiddenTicketFilters = (filters: TicketFilters): TicketFilters => {
  if (!Object.prototype.hasOwnProperty.call(filters, "sprintId")) {
    return filters;
  }

  const { sprintId: _sprintId, ...rest } = filters;
  return rest;
};

const omitParentIdFilter = (filters: TicketFilters): TicketFilters => {
  if (!Object.prototype.hasOwnProperty.call(filters, "parentId")) {
    return filters;
  }

  const { parentId: _parentId, ...rest } = filters;
  return rest;
};

const BoardShellAdapter = ({ projectId }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const tSidebar = useTranslation("navigation.sidebar");
  const tBreadcrumbs = useTranslation("navigation.breadcrumbs");
  const tNavbar = useTranslation("navigation.navbar");
  const tBoardOnboarding = useTranslation("pages.board.onboarding");
  const tEpicsOnboarding = useTranslation("pages.epics.onboarding");
  const {
    canCreateEpic,
    canCreateTicket,
    isLoading: isPermissionsLoading,
  } = useProjectPermissions();

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const currentViewKey = useMemo(
    () => getBoardShellViewKey(pathname, projectId),
    [pathname, projectId]
  );
  const isBoardShellView = currentViewKey !== null;
  const isTicketView = currentViewKey === PROJECT_VIEWS.BOARD;

  const search = useFilterStore((state) => state.search);
  const setSearch = useFilterStore((state) => state.setSearch);
  const [searchInput, setSearchInput] = useState(search);
  const rawFilters = useFilterStore((state) => state.filters);
  const setStatus = useFilterStore((state) => state.setStatus);
  const clearStatus = useFilterStore((state) => state.clearStatus);
  const setEpicId = useFilterStore((state) => state.setEpicId);
  const clearEpicId = useFilterStore((state) => state.clearEpicId);
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

  const filters = useMemo(() => {
    return omitHiddenTicketFilters(rawFilters);
  }, [rawFilters]);

  const projectWideFilters = useMemo(() => {
    return omitParentIdFilter(filters);
  }, [filters]);

  const { data: projectShortCode } = useProjectShortCode(projectId);
  const effectiveSearch = useMemo(() => {
    return normalizeTicketSearch(search, projectShortCode);
  }, [projectShortCode, search]);
  const { prefetchBoardView, prefetchEpicsView } = usePrefetchProjectViews({
    projectId,
    filters: projectWideFilters,
    sort,
    search: effectiveSearch,
  });
  const prefetchRef = useRef({
    isBoardShellView,
    prefetchBoardView,
    prefetchEpicsView,
  });

  useEffect(() => {
    prefetchRef.current = {
      isBoardShellView,
      prefetchBoardView,
      prefetchEpicsView,
    };
  }, [isBoardShellView, prefetchBoardView, prefetchEpicsView]);

  const onMount = useCallback(() => {
    if (!prefetchRef.current.isBoardShellView) {
      return;
    }

    prefetchRef.current.prefetchBoardView();
    prefetchRef.current.prefetchEpicsView();
  }, []);

  const shouldLoadTicketFilterData = isTicketView && isFilterModalOpen;
  const { data: boardConfiguration } = useBoardConfiguration(projectId, {
    enabled: isTicketView,
  });

  useProjectRealtime(projectId, boardConfiguration?.board.id, {
    enabled: isBoardShellView,
  });

  const { data: epicsData } = useEpics(projectId, {
    enabled: shouldLoadTicketFilterData,
  });
  const epics = epicsData ?? EMPTY_EPICS;
  const { data: labelsData } = useLabels(projectId, {
    enabled: shouldLoadTicketFilterData,
  });
  const labels = labelsData ?? EMPTY_LABELS;
  const searchSuggestions = useProjectSearchSuggestions({
    projectId,
    viewKey: currentViewKey ?? PROJECT_VIEWS.SETTINGS,
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

  useEffect(() => {
    resetSearch();
    resetFilters();
    resetSort();
  }, [projectId, resetFilters, resetSearch, resetSort]);

  useEffect(() => {
    if (isBoardShellView) {
      return;
    }

    setIsFilterModalOpen(false);
    setIsSortModalOpen(false);
  }, [isBoardShellView]);

  const updateQueryParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParamsString);
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
    [pathname, router, searchParamsString]
  );

  const { epicProgressFilter, epicSortField, epicSortDirection } =
    useEpicQueryParams(searchParams);
  const isOnboardingReviewRequested =
    isBoardShellView && searchParams.get("onboarding") === "1";
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
    : currentViewKey === PROJECT_VIEWS.EPICS
      ? isEpicFilterActive
      : false;
  const isSortActive = isTicketView
    ? isTicketSortActive
    : currentViewKey === PROJECT_VIEWS.EPICS
      ? isEpicSortActive
      : false;

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

  const labelOptions = useMemo(() => {
    if (!isTicketView) {
      return [];
    }

    return labels.map((label) => ({
      value: label.id,
      label: label.name,
    }));
  }, [isTicketView, labels]);

  const handleFilterClick = useCallback(() => {
    setIsFilterModalOpen(true);
  }, []);

  const handleSortClick = useCallback(() => {
    setIsSortModalOpen(true);
  }, []);

  const handleReviewGuideClick = useCallback(() => {
    updateQueryParams({
      onboarding: isOnboardingReviewRequested ? null : "1",
    });
  }, [isOnboardingReviewRequested, updateQueryParams]);

  const handleResetTicketFilters = useCallback(() => {
    resetFilters();
    setIsFilterModalOpen(false);
  }, [resetFilters]);

  const handleResetTicketSort = useCallback(() => {
    resetSort();
    setIsSortModalOpen(false);
  }, [resetSort]);

  const canAddAction = useMemo(() => {
    if (currentViewKey === PROJECT_VIEWS.EPICS) {
      return canCreateEpic;
    }

    if (currentViewKey === PROJECT_VIEWS.BOARD) {
      return canCreateTicket;
    }

    return false;
  }, [canCreateEpic, canCreateTicket, currentViewKey]);

  const handleAddClick = useCallback(() => {
    if (!canAddAction) {
      return;
    }

    if (currentViewKey === PROJECT_VIEWS.EPICS) {
      router.push(
        `${buildProjectRoute(projectId, PROJECT_VIEWS.EPICS)}?createEpic=1`
      );
      return;
    }

    if (currentViewKey === PROJECT_VIEWS.BOARD) {
      router.push(
        `${buildProjectRoute(projectId, PROJECT_VIEWS.BOARD)}?createTicket=1`
      );
    }
  }, [canAddAction, currentViewKey, projectId, router]);

  const currentViewLabel = useMemo(() => {
    if (!currentViewKey) {
      return null;
    }

    return tSidebar(`items.${currentViewKey}`);
  }, [currentViewKey, tSidebar]);
  const onboardingAriaLabels = useMemo(() => {
    if (currentViewKey === PROJECT_VIEWS.EPICS) {
      return {
        reviewAriaLabel: tEpicsOnboarding("reviewCtaAriaLabel"),
        hideAriaLabel: tEpicsOnboarding("hideCtaAriaLabel"),
      };
    }

    return {
      reviewAriaLabel: tBoardOnboarding("reviewCtaAriaLabel"),
      hideAriaLabel: tBoardOnboarding("hideCtaAriaLabel"),
    };
  }, [currentViewKey, tBoardOnboarding, tEpicsOnboarding]);

  const toolbarExtraTools = useMemo<ProjectToolbarExtraTool[]>(() => {
    if (!isBoardShellView) {
      return [];
    }

    return [
      {
        key: "review-guide",
        label: isOnboardingReviewRequested
          ? tNavbar("reviewGuide")
          : tNavbar("reviewGuide"),
        ariaLabel: isOnboardingReviewRequested
          ? onboardingAriaLabels.hideAriaLabel
          : onboardingAriaLabels.reviewAriaLabel,
        icon: <GuideIcon />,
        onClick: handleReviewGuideClick,
        isActive: isOnboardingReviewRequested,
      },
    ];
  }, [
    handleReviewGuideClick,
    isBoardShellView,
    isOnboardingReviewRequested,
    tNavbar,
    onboardingAriaLabels.hideAriaLabel,
    onboardingAriaLabels.reviewAriaLabel,
  ]);

  const toolbar = useMemo(() => {
    if (!currentViewKey || !currentViewLabel) {
      return null;
    }

    return (
      <ProjectToolbar
        pageTitle={currentViewLabel}
        showFilterSort
        addActionType={
          currentViewKey === PROJECT_VIEWS.EPICS ? "epic" : "ticket"
        }
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
        extraTools={toolbarExtraTools}
      />
    );
  }, [
    canAddAction,
    currentViewKey,
    currentViewLabel,
    handleAddClick,
    handleFilterClick,
    handleSortClick,
    isFilterActive,
    isPermissionsLoading,
    isSortActive,
    searchInput,
    searchSuggestions,
    toolbarExtraTools,
  ]);

  const breadcrumbs = useMemo(() => {
    if (!currentViewLabel) {
      return null;
    }

    return (
      <Breadcrumbs
        projectHref={buildProjectRoute(projectId, PROJECT_VIEWS.BOARD)}
        projectLabel={tBreadcrumbs("project")}
        currentLabel={currentViewLabel}
      />
    );
  }, [currentViewLabel, projectId, tBreadcrumbs]);

  const filtersContent = useMemo(() => {
    if (!currentViewKey) {
      return null;
    }

    return (
      <>
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
              labelOptions={labelOptions}
              onSetStatus={setStatus}
              onClearStatus={clearStatus}
              onSetEpicId={setEpicId}
              onClearEpicId={clearEpicId}
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
  }, [
    clearEpicId,
    clearLabelIds,
    clearPriority,
    clearStatus,
    currentViewKey,
    epicOptions,
    epicProgressFilter,
    epicSortDirection,
    epicSortField,
    filters,
    handleResetTicketFilters,
    handleResetTicketSort,
    isFilterModalOpen,
    isSortModalOpen,
    isTicketView,
    labelOptions,
    setDirection,
    setEpicId,
    setField,
    setIsFilterModalOpen,
    setIsSortModalOpen,
    setLabelIds,
    setPriority,
    setStatus,
    sort,
    statusOptions,
    tNavbar,
    updateQueryParams,
  ]);

  const contribution = useMemo<ProjectViewContribution>(() => {
    if (!currentViewKey) {
      return EMPTY_PROJECT_VIEW_CONTRIBUTION;
    }

    return {
      toolbar,
      breadcrumbs,
      filters: filtersContent,
      onMount,
    };
  }, [breadcrumbs, currentViewKey, filtersContent, onMount, toolbar]);

  useRegisterProjectViewContribution(contribution);

  return null;
};

export default BoardShellAdapter;
