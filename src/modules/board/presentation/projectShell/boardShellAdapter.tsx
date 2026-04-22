"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { GuideIcon } from "@/shared/design-system/icons";
import { useTranslations } from "@/shared/i18n";
import { useAppRouter } from "@/shared/navigation/useAppRouter";
import { buildProjectRoute, normalizePath } from "@/shared/utils/routes";

import type { ProjectMember } from "@/domains/project/core/domain/project.types";
import ProjectToolbar from "@/domains/project/presentation/components/projectToolbar/ProjectToolbar";
import {
  PROJECT_TOOLBAR_UNASSIGNED_FILTER_ID,
  type ProjectToolbarAssigneeFilter,
  type ProjectToolbarExtraTool,
} from "@/domains/project/presentation/components/projectToolbar/ProjectToolbar.types";
import { useProjectMembers } from "@/domains/project/presentation/hooks/member/useProjectMembers";
import { buildProjectToolbarProps } from "@/domains/project/presentation/layouts/projectShell/buildProjectToolbarProps";
import { useRegisterProjectViewContribution } from "@/domains/project/presentation/layouts/projectShell/ProjectShellContributionContext";
import type { ProjectViewContribution } from "@/domains/project/presentation/layouts/projectShell/projectViewContribution";
import {
  getProjectViewConfig,
  getProjectViewKeyFromPath,
} from "@/domains/project/presentation/navigation/projectViews.config";
import { useProjectPermissions } from "@/domains/project/presentation/providers/permissions/ProjectPermissionsProvider";
import type { TicketFilters } from "@/modules/board/core/domain/ticket.types";
import { useBoardConfiguration } from "@/modules/board/presentation/hooks/board/useBoardConfiguration";
import { useProjectSearchSuggestions } from "@/modules/board/presentation/hooks/project/useProjectSearchSuggestions";
import { useProjectRealtime } from "@/modules/board/presentation/hooks/realtime/useProjectRealtime";
import { useFilterStore } from "@/modules/board/presentation/stores/useFilterStore";

type Props = {
  projectId: string;
};

const EMPTY_PROJECT_MEMBERS: ProjectMember[] = [];
const EMPTY_FILTERS: TicketFilters = {};

type BoardShellRuntimeAdapterProps = {
  projectId: string;
  isEnabled: boolean;
  boardId: string | undefined;
  initializeProject: (projectId: string) => void;
};

const BoardShellRuntimeAdapter = ({
  projectId,
  isEnabled,
  boardId,
  initializeProject,
}: BoardShellRuntimeAdapterProps) => {
  useProjectRealtime(projectId, boardId, {
    enabled: isEnabled,
  });

  useEffect(() => {
    initializeProject(projectId);
  }, [initializeProject, projectId]);

  return null;
};

const BoardShellContributionAdapter = ({ projectId }: Props) => {
  const router = useAppRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const tSidebar = useTranslations("navigation.sidebar");
  const tNavbar = useTranslations("navigation.navbar");
  const tBoardFilters = useTranslations("pages.board.filters");
  const tBoardOnboarding = useTranslations("pages.board.onboarding");
  const { canCreateTicket, isLoading: isPermissionsLoading } =
    useProjectPermissions();

  const currentViewKey = useMemo(() => {
    return getProjectViewKeyFromPath(normalizePath(pathname), projectId);
  }, [pathname, projectId]);
  const currentViewConfig = useMemo(() => {
    return getProjectViewConfig(currentViewKey);
  }, [currentViewKey]);
  const isBoardShellView = currentViewKey === PROJECT_VIEWS.BOARD;

  const filterProjectId = useFilterStore((state) => state.projectId);
  const rawSearch = useFilterStore((state) => state.search);
  const setSearch = useFilterStore((state) => state.setSearch);
  const initializeProject = useFilterStore((state) => state.initializeProject);
  const rawFilters = useFilterStore((state) => state.filters);
  const setAssigneeUserId = useFilterStore((state) => state.setAssigneeUserId);
  const setUnassignedOnly = useFilterStore((state) => state.setUnassignedOnly);
  const clearAssigneeUserId = useFilterStore(
    (state) => state.clearAssigneeUserId
  );
  const isFilterStoreReady = filterProjectId === projectId;
  const search = isFilterStoreReady ? rawSearch : "";
  const filters = isFilterStoreReady ? rawFilters : EMPTY_FILTERS;
  const [searchInput, setSearchInput] = useState(search);
  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  // Keep the board page as the SSR owner of boardConfiguration.
  // If the shell starts the same query during server render, it can create a
  // pending cache entry outside the page hydration boundary and trigger a
  // loading->loaded hydration mismatch in BoardView.
  const { data: boardConfiguration } = useBoardConfiguration(projectId, {
    enabled: isBoardShellView && isClientReady,
  });
  const { data: projectMembersData } = useProjectMembers(
    isBoardShellView ? projectId : undefined
  );
  const projectMembers = projectMembersData ?? EMPTY_PROJECT_MEMBERS;

  const searchSuggestions = useProjectSearchSuggestions({
    projectId,
    viewKey: currentViewKey,
    searchValue: currentViewConfig.navbar.showSearch ? search : "",
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
        feedback: "none",
      });
    },
    [pathname, router, searchParamsString]
  );

  const isOnboardingReviewRequested =
    isBoardShellView && searchParams.get("onboarding") === "1";

  const handleReviewGuideClick = useCallback(() => {
    updateQueryParams({
      onboarding: isOnboardingReviewRequested ? null : "1",
    });
  }, [isOnboardingReviewRequested, updateQueryParams]);

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
    if (!canCreateTicket) {
      return;
    }

    router.push(
      `${buildProjectRoute(projectId, PROJECT_VIEWS.BOARD)}?createTicket=1`
    );
  }, [canCreateTicket, projectId, router]);

  const currentViewLabel = tSidebar(
    `items.${currentViewConfig.sidebarLabelKey}`
  );

  const onboardingAriaLabels = useMemo(() => {
    return {
      reviewAriaLabel: tBoardOnboarding("reviewCtaAriaLabel"),
      hideAriaLabel: tBoardOnboarding("hideCtaAriaLabel"),
    };
  }, [tBoardOnboarding]);

  const assigneeFilters = useMemo<ProjectToolbarAssigneeFilter[]>(() => {
    if (!isBoardShellView) {
      return [];
    }

    const unassignedFilter: ProjectToolbarAssigneeFilter = {
      type: "unassigned",
      label: tBoardFilters("assigneeUnassignedLabel"),
    };

    const memberFilters: ProjectToolbarAssigneeFilter[] = projectMembers.map(
      (member) => ({
        type: "member" as const,
        userId: member.userId,
        label: member.profile.displayName?.trim() || member.profile.email,
        avatarUrl: member.profile.avatarUrl ?? null,
      })
    );

    return [unassignedFilter, ...memberFilters];
  }, [isBoardShellView, projectMembers, tBoardFilters]);

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
    const toolbarProps = buildProjectToolbarProps({
      pageTitle: currentViewLabel,
      viewKey: currentViewKey,
      viewConfig: currentViewConfig,
      tNavbar,
      tBoardFilters,
      tBoardOnboarding,
      overrides: {
        searchValue: currentViewConfig.navbar.showSearch ? searchInput : "",
        isSearchDisabled: false,
        searchSuggestions:
          currentViewConfig.navbar.showSearch ? searchSuggestions : [],
        onSearchChange:
          currentViewConfig.navbar.showSearch ? setSearchInput : undefined,
        onAddClick: handleAddClick,
        canAddAction: canCreateTicket,
        isPermissionsLoading,
        extraTools: toolbarExtraTools,
        assigneeFilters,
        areAssigneeFiltersDisabled: false,
        selectedAssigneeFilterId: filters.unassignedOnly
          ? PROJECT_TOOLBAR_UNASSIGNED_FILTER_ID
          : (filters.assigneeUserId ?? null),
        assigneeFiltersLabel: tBoardFilters("assigneeLabel"),
        onAssigneeFilterChange: handleAssigneeFilterChange,
      },
    });

    return <ProjectToolbar {...toolbarProps} />;
  }, [
    assigneeFilters,
    canCreateTicket,
    currentViewConfig,
    currentViewKey,
    currentViewLabel,
    handleAddClick,
    handleAssigneeFilterChange,
    isPermissionsLoading,
    filters.assigneeUserId,
    filters.unassignedOnly,
    searchInput,
    searchSuggestions,
    tBoardFilters,
    tBoardOnboarding,
    tNavbar,
    toolbarExtraTools,
  ]);

  const contribution = useMemo<ProjectViewContribution>(() => {
    return {
      toolbar,
    };
  }, [toolbar]);

  useRegisterProjectViewContribution(contribution);

  return (
    <BoardShellRuntimeAdapter
      projectId={projectId}
      isEnabled={isBoardShellView}
      boardId={boardConfiguration?.board.id}
      initializeProject={initializeProject}
    />
  );
};

const BoardShellAdapter = ({ projectId }: Props) => {
  const pathname = usePathname();
  const currentViewKey = useMemo(() => {
    return getProjectViewKeyFromPath(normalizePath(pathname), projectId);
  }, [pathname, projectId]);

  if (currentViewKey === PROJECT_VIEWS.RECIPES) {
    return null;
  }

  return <BoardShellContributionAdapter projectId={projectId} />;
};

export default BoardShellAdapter;
