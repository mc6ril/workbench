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
  SORT_DIRECTION_VALUES,
  TICKET_SORT_FIELD_VALUES,
} from "@/modules/board/constants/filterSort";
import Breadcrumbs from "@/modules/board/presentation/components/breadcrumbs/Breadcrumbs";
import TicketFilterControls from "@/modules/board/presentation/components/projectShellControls/TicketFilterControls";
import TicketSortControls from "@/modules/board/presentation/components/projectShellControls/TicketSortControls";
import ProjectToolbar from "@/modules/board/presentation/components/projectToolbar/ProjectToolbar";
import type { ProjectToolbarExtraTool } from "@/modules/board/presentation/components/projectToolbar/ProjectToolbar.types";
import { useBoardConfiguration } from "@/modules/board/presentation/hooks/board/useBoardConfiguration";
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

const isBoardShellViewPath = (pathname: string, projectId: string): boolean => {
  const normalizedPathname = normalizePath(pathname);
  const projectRootPath = `/${projectId}`;

  return (
    normalizedPathname === projectRootPath ||
    normalizedPathname.startsWith(`${projectRootPath}/${PROJECT_VIEWS.BOARD}`)
  );
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
  const { canCreateTicket, isLoading: isPermissionsLoading } =
    useProjectPermissions();

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const isBoardShellView = useMemo(() => {
    return isBoardShellViewPath(pathname, projectId);
  }, [pathname, projectId]);

  const search = useFilterStore((state) => state.search);
  const setSearch = useFilterStore((state) => state.setSearch);
  const [searchInput, setSearchInput] = useState(search);
  const filters = useFilterStore((state) => state.filters);
  const setStatus = useFilterStore((state) => state.setStatus);
  const clearStatus = useFilterStore((state) => state.clearStatus);
  const resetSearch = useFilterStore((state) => state.resetSearch);
  const resetFilters = useFilterStore((state) => state.resetFilters);
  const sort = useSortStore((state) => state.sort);
  const setField = useSortStore((state) => state.setField);
  const setDirection = useSortStore((state) => state.setDirection);
  const resetSort = useSortStore((state) => state.resetSort);

  const { data: projectShortCode } = useProjectShortCode(projectId);
  const effectiveSearch = useMemo(() => {
    return normalizeTicketSearch(search, projectShortCode);
  }, [projectShortCode, search]);

  const { prefetchBoardView } = usePrefetchProjectViews({
    projectId,
    filters,
    sort,
    search: effectiveSearch,
  });
  const prefetchRef = useRef({
    isBoardShellView,
    prefetchBoardView,
  });

  useEffect(() => {
    prefetchRef.current = {
      isBoardShellView,
      prefetchBoardView,
    };
  }, [isBoardShellView, prefetchBoardView]);

  const onMount = useCallback(() => {
    if (!prefetchRef.current.isBoardShellView) {
      return;
    }

    prefetchRef.current.prefetchBoardView();
  }, []);

  const { data: boardConfiguration } = useBoardConfiguration(projectId, {
    enabled: isBoardShellView,
  });

  useProjectRealtime(projectId, boardConfiguration?.board.id, {
    enabled: isBoardShellView,
  });

  const searchSuggestions = useProjectSearchSuggestions({
    projectId,
    viewKey: isBoardShellView ? PROJECT_VIEWS.BOARD : PROJECT_VIEWS.SETTINGS,
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

  const isOnboardingReviewRequested =
    isBoardShellView && searchParams.get("onboarding") === "1";
  const isFilterActive = Object.keys(filters).length > 0;
  const isSortActive =
    sort.field !== TICKET_SORT_FIELD_VALUES.CREATED_AT ||
    sort.direction !== SORT_DIRECTION_VALUES.DESC;

  const statusOptions = useMemo(() => {
    const columns = boardConfiguration?.columns ?? [];
    return columns.map((column) => ({
      value: column.status,
      label: column.name,
    }));
  }, [boardConfiguration?.columns]);

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

  const handleAddClick = useCallback(() => {
    if (!canCreateTicket) {
      return;
    }

    router.push(`${buildProjectRoute(projectId, PROJECT_VIEWS.BOARD)}?createTicket=1`);
  }, [canCreateTicket, projectId, router]);

  const currentViewLabel = isBoardShellView
    ? tSidebar(`items.${PROJECT_VIEWS.BOARD}`)
    : null;

  const onboardingAriaLabels = useMemo(() => {
    return {
      reviewAriaLabel: tBoardOnboarding("reviewCtaAriaLabel"),
      hideAriaLabel: tBoardOnboarding("hideCtaAriaLabel"),
    };
  }, [tBoardOnboarding]);

  const toolbarExtraTools = useMemo<ProjectToolbarExtraTool[]>(() => {
    if (!isBoardShellView) {
      return [];
    }

    return [
      {
        key: "review-guide",
        label: tNavbar("reviewGuide"),
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
    onboardingAriaLabels.hideAriaLabel,
    onboardingAriaLabels.reviewAriaLabel,
    tNavbar,
  ]);

  const toolbar = useMemo(() => {
    if (!currentViewLabel) {
      return null;
    }

    return (
      <ProjectToolbar
        pageTitle={currentViewLabel}
        showFilterSort
        addActionType="ticket"
        searchValue={searchInput}
        searchSuggestions={searchSuggestions}
        onSearchChange={setSearchInput}
        onFilterClick={handleFilterClick}
        onSortClick={handleSortClick}
        isFilterActive={isFilterActive}
        isSortActive={isSortActive}
        onAddClick={handleAddClick}
        canAddAction={canCreateTicket}
        isPermissionsLoading={isPermissionsLoading}
        extraTools={toolbarExtraTools}
      />
    );
  }, [
    canCreateTicket,
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
    if (!isBoardShellView) {
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
          <TicketFilterControls
            filters={filters}
            statusOptions={statusOptions}
            onSetStatus={setStatus}
            onClearStatus={clearStatus}
            onResetFilters={handleResetTicketFilters}
          />
        </Modal>

        <Modal
          isOpen={isSortModalOpen}
          onClose={() => {
            setIsSortModalOpen(false);
          }}
          title={tNavbar("sort")}
        >
          <TicketSortControls
            sort={sort}
            onSetField={setField}
            onSetDirection={setDirection}
            onResetSort={handleResetTicketSort}
          />
        </Modal>
      </>
    );
  }, [
    clearStatus,
    filters,
    handleResetTicketFilters,
    handleResetTicketSort,
    isBoardShellView,
    isFilterModalOpen,
    isSortModalOpen,
    setDirection,
    setField,
    setStatus,
    sort,
    statusOptions,
    tNavbar,
  ]);

  const contribution = useMemo<ProjectViewContribution>(() => {
    if (!isBoardShellView) {
      return EMPTY_PROJECT_VIEW_CONTRIBUTION;
    }

    return {
      toolbar,
      breadcrumbs,
      filters: filtersContent,
      onMount,
    };
  }, [breadcrumbs, filtersContent, isBoardShellView, onMount, toolbar]);

  useRegisterProjectViewContribution(contribution);

  return null;
};

export default BoardShellAdapter;
