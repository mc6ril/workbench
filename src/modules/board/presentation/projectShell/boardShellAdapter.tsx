"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { GuideIcon } from "@/shared/design-system/icons";
import { useTranslation } from "@/shared/i18n";
import { buildProjectRoute, normalizePath } from "@/shared/utils/routes";

import type { ProjectMember } from "@/domains/project/core/domain/project.types";
import { useProjectMembers } from "@/domains/project/presentation/hooks/member/useProjectMembers";
import { useRegisterProjectViewContribution } from "@/domains/project/presentation/layouts/projectShell/ProjectShellContributionContext";
import type { ProjectViewContribution } from "@/domains/project/presentation/layouts/projectShell/projectViewContribution";
import {
  getProjectViewConfig,
  getProjectViewKeyFromPath,
} from "@/domains/project/presentation/navigation/projectViews.config";
import { useProjectPermissions } from "@/domains/project/presentation/providers/permissions/ProjectPermissionsProvider";
import type { TicketFilters } from "@/modules/board/core/domain/ticket.types";
import ProjectToolbar from "@/modules/board/presentation/components/projectToolbar/ProjectToolbar";
import {
  PROJECT_TOOLBAR_UNASSIGNED_FILTER_ID,
  type ProjectToolbarAssigneeFilter,
  type ProjectToolbarExtraTool,
} from "@/modules/board/presentation/components/projectToolbar/ProjectToolbar.types";
import { useBoardConfiguration } from "@/modules/board/presentation/hooks/board/useBoardConfiguration";
import { useProjectSearchSuggestions } from "@/modules/board/presentation/hooks/project/useProjectSearchSuggestions";
import { useProjectRealtime } from "@/modules/board/presentation/hooks/realtime/useProjectRealtime";
import { useFilterStore } from "@/modules/board/presentation/stores/useFilterStore";

type Props = {
  projectId: string;
};

const EMPTY_PROJECT_MEMBERS: ProjectMember[] = [];
const EMPTY_FILTERS: TicketFilters = {};

const BoardShellAdapter = ({ projectId }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const tSidebar = useTranslation("navigation.sidebar");
  const tNavbar = useTranslation("navigation.navbar");
  const tBoardFilters = useTranslation("pages.board.filters");
  const tBoardOnboarding = useTranslation("pages.board.onboarding");
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

  const { data: boardConfiguration } = useBoardConfiguration(projectId, {
    enabled: isBoardShellView,
  });
  const { data: projectMembersData } = useProjectMembers(
    isBoardShellView ? projectId : undefined
  );
  const projectMembers = projectMembersData ?? EMPTY_PROJECT_MEMBERS;

  useProjectRealtime(projectId, boardConfiguration?.board.id, {
    enabled: isBoardShellView,
  });

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

  useEffect(() => {
    initializeProject(projectId);
  }, [initializeProject, projectId]);

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
    return (
      <ProjectToolbar
        pageTitle={currentViewLabel}
        showSearch={currentViewConfig.navbar.showSearch}
        hideTitleOnMobile={isBoardShellView}
        addActionType={currentViewConfig.navbar.addActionType}
        searchValue={currentViewConfig.navbar.showSearch ? searchInput : ""}
        searchSuggestions={
          currentViewConfig.navbar.showSearch ? searchSuggestions : []
        }
        onSearchChange={
          currentViewConfig.navbar.showSearch ? setSearchInput : undefined
        }
        onAddClick={handleAddClick}
        canAddAction={canCreateTicket}
        isPermissionsLoading={isPermissionsLoading}
        extraTools={toolbarExtraTools}
        assigneeFilters={assigneeFilters}
        selectedAssigneeFilterId={
          filters.unassignedOnly
            ? PROJECT_TOOLBAR_UNASSIGNED_FILTER_ID
            : (filters.assigneeUserId ?? null)
        }
        assigneeFiltersLabel={tBoardFilters("assigneeLabel")}
        onAssigneeFilterChange={handleAssigneeFilterChange}
      />
    );
  }, [
    assigneeFilters,
    canCreateTicket,
    currentViewLabel,
    currentViewConfig.navbar.addActionType,
    currentViewConfig.navbar.showSearch,
    handleAddClick,
    handleAssigneeFilterChange,
    isBoardShellView,
    isPermissionsLoading,
    filters.assigneeUserId,
    filters.unassignedOnly,
    searchInput,
    searchSuggestions,
    tBoardFilters,
    toolbarExtraTools,
  ]);

  const contribution = useMemo<ProjectViewContribution>(() => {
    return {
      toolbar,
    };
  }, [toolbar]);

  useRegisterProjectViewContribution(contribution);

  return null;
};

export default BoardShellAdapter;
