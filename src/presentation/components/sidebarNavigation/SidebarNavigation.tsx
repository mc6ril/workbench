"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { getEffectivePlan } from "@/core/domain/rules/planFeatures.rules";
import type { Project } from "@/core/domain/schema/project.schema";
import { SubscriptionPlan } from "@/core/domain/schema/subscription.schema";

import { getBoardConfiguration } from "@/core/usecases/board/getBoardConfiguration";
import { listEpics } from "@/core/usecases/epic/listEpics";
import { listProjectsWithStats } from "@/core/usecases/project/listProjectsWithStats";
import { listReclaimableProjects } from "@/core/usecases/project/listReclaimableProjects";
import { computeFeatureLockState } from "@/core/usecases/subscription/computeFeatureLockState";
import { getTicketAssigneesByProjectId } from "@/core/usecases/ticket/getTicketAssigneesByProjectId";
import { listTickets } from "@/core/usecases/ticket/listTickets";

import {
  boardRepository,
  epicRepository,
  projectRepository,
  ticketRepository,
} from "@/infrastructure/supabase/repositories";

import { useSession } from "@/presentation/hooks/auth/useSession";
import { useSignOut } from "@/presentation/hooks/auth/useSignOut";
import { queryKeys } from "@/presentation/hooks/queryKeys";
import { useSubscription } from "@/presentation/hooks/subscription/useSubscription";
import {
  buildProjectViewHref,
  getProjectViewConfigsForSidebar,
} from "@/presentation/navigation/projectViews.config";
import { useFilterStore } from "@/presentation/stores/useFilterStore";
import { useSortStore } from "@/presentation/stores/useSortStore";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { PAGE_ROUTES, PROJECT_VIEWS } from "@/shared/constants/routes";
import { useTranslation } from "@/shared/i18n";
import { markNavigationStart } from "@/shared/observability";
import { getInitials } from "@/shared/utils";
import { normalizeTicketSearch } from "@/shared/utils/ticketUtils";

import SidebarNavigationList from "./components/SidebarNavigationList";
import SidebarProfileMenu from "./components/SidebarProfileMenu";
import styles from "./SidebarNavigation.module.scss";
import type {
  SidebarItem,
  SidebarNavigationProps,
} from "./SidebarNavigation.types";
import { omitParentIdFilter } from "./SidebarNavigation.utils";

const SidebarNavigation = ({ projectId }: SidebarNavigationProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslation("navigation.sidebar");
  const signOutMutation = useSignOut();
  const filters = useFilterStore((state) => state.filters);
  const search = useFilterStore((state) => state.search);
  const sort = useSortStore((state) => state.sort);
  const { data: session, isLoading: isSessionLoading } = useSession();
  const {
    data: subscription,
    isLoading: isSubscriptionLoading,
    isFetched: isSubscriptionFetched,
  } = useSubscription();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const navListId = getAccessibilityId("sidebar-navigation-list");
  const profileMenuId = getAccessibilityId("sidebar-profile-menu");
  const profileTriggerId = getAccessibilityId("sidebar-profile-trigger");

  const isEntitlementsReady = useMemo((): boolean => {
    if (isSessionLoading) {
      return false;
    }

    if (!session) {
      return true;
    }

    if (isSubscriptionLoading) {
      return false;
    }

    return isSubscriptionFetched;
  }, [isSessionLoading, isSubscriptionFetched, isSubscriptionLoading, session]);

  const effectivePlan = useMemo((): SubscriptionPlan | null => {
    if (!isEntitlementsReady) {
      return null;
    }

    if (!subscription) {
      return SubscriptionPlan.FREE;
    }

    return getEffectivePlan(subscription);
  }, [isEntitlementsReady, subscription]);

  const items: SidebarItem[] = useMemo(() => {
    const configs = getProjectViewConfigsForSidebar();
    return configs.flatMap((config) => {
      const { locked, minimumPlan } =
        effectivePlan === null
          ? { locked: false, minimumPlan: undefined }
          : computeFeatureLockState(config.requiredFeature, effectivePlan);

      if (config.key === PROJECT_VIEWS.SETTINGS && locked) {
        return [];
      }

      const item: SidebarItem = {
        key: config.key,
        href: buildProjectViewHref(projectId, config.key),
        label: t(`items.${config.sidebarLabelKey}`),
        exactOnly: false,
        locked,
        planBadge: minimumPlan ? t(`locked.badge.${minimumPlan}`) : undefined,
      };
      return [item];
    });
  }, [projectId, t, effectivePlan]);

  const handleLockedClick = useCallback(() => {
    const from = encodeURIComponent(pathname ?? PAGE_ROUTES.WORKSPACE);
    router.push(`${PAGE_ROUTES.PRICING}?from=${from}`);
  }, [router, pathname]);

  const displayName =
    session?.displayName ?? session?.email ?? t("profile.userFallbackName");
  const initials = getInitials(session?.displayName ?? session?.email);
  const lockedAriaLabelTemplate = t("locked.ariaLabel");
  const workspaceHref = PAGE_ROUTES.WORKSPACE;
  const accountHref = `${PAGE_ROUTES.ACCOUNT}?from=${encodeURIComponent(pathname ?? PAGE_ROUTES.WORKSPACE)}`;

  const handleAddTabClick = useCallback(() => {
    // Future: add tab action. No-op for now.
  }, []);

  const projectWideFilters = useMemo(() => {
    return omitParentIdFilter(filters);
  }, [filters]);

  const effectiveSearch = useMemo(() => {
    const project = queryClient.getQueryData<Project>(
      queryKeys.projects.detail(projectId)
    );
    return normalizeTicketSearch(search, project?.shortCode);
  }, [projectId, queryClient, search]);

  const prefetchTicketViews = useCallback(() => {
    void queryClient.prefetchQuery({
      queryKey: queryKeys.projects.boardConfiguration(projectId),
      queryFn: () => getBoardConfiguration(boardRepository, projectId),
    });

    void queryClient.prefetchQuery({
      queryKey: queryKeys.projects.ticketsList(
        projectId,
        projectWideFilters,
        sort,
        effectiveSearch
      ),
      queryFn: () =>
        listTickets(
          ticketRepository,
          projectId,
          projectWideFilters,
          sort,
          effectiveSearch
        ),
    });

    void queryClient.prefetchQuery({
      queryKey: queryKeys.tickets.assigneesByProjectId(projectId),
      queryFn: () => getTicketAssigneesByProjectId(ticketRepository, projectId),
    });
  }, [effectiveSearch, projectId, projectWideFilters, queryClient, sort]);

  const prefetchEpicsView = useCallback(() => {
    void queryClient.prefetchQuery({
      queryKey: queryKeys.projects.epicsList(projectId),
      queryFn: () => listEpics(epicRepository, boardRepository, projectId),
    });
  }, [projectId, queryClient]);

  const prefetchProjectView = useCallback(
    (item: SidebarItem) => {
      if (item.locked) {
        return;
      }

      void router.prefetch(item.href);

      if (item.key === PROJECT_VIEWS.BOARD) {
        prefetchTicketViews();
        return;
      }

      if (item.key === PROJECT_VIEWS.EPICS) {
        prefetchEpicsView();
      }
    },
    [prefetchEpicsView, prefetchTicketViews, router]
  );

  const prefetchWorkspace = useCallback(() => {
    void router.prefetch(PAGE_ROUTES.WORKSPACE);

    if (!session?.userId) {
      return;
    }

    void queryClient.prefetchQuery({
      queryKey: queryKeys.projects.withStats(),
      queryFn: () => listProjectsWithStats(projectRepository),
    });
    void queryClient.prefetchQuery({
      queryKey: queryKeys.projects.reclaimable(),
      queryFn: () => listReclaimableProjects(projectRepository),
    });
  }, [queryClient, router, session?.userId]);

  const handleProfileTriggerClick = useCallback(() => {
    setProfileMenuOpen((prev) => {
      const next = !prev;
      if (next) {
        prefetchWorkspace();
      }
      return next;
    });
  }, [prefetchWorkspace]);

  const closeProfileMenu = useCallback(() => {
    setProfileMenuOpen(false);
  }, []);

  useEffect(() => {
    if (!profileMenuOpen) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        profileTriggerRef.current?.contains(target) === false &&
        profileMenuRef.current?.contains(target) === false
      ) {
        closeProfileMenu();
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeProfileMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileMenuOpen, closeProfileMenu]);

  const handleLogout = useCallback(() => {
    closeProfileMenu();
    signOutMutation.mutate();
  }, [closeProfileMenu, signOutMutation]);

  const handleSidebarItemClick = useCallback(
    (item: SidebarItem) => {
      if (item.locked) {
        handleLockedClick();
        return;
      }

      markNavigationStart(item.href, "sidebar");
    },
    [handleLockedClick]
  );

  const handleWorkspaceLinkClick = useCallback(() => {
    markNavigationStart(PAGE_ROUTES.WORKSPACE, "profile-menu");
    closeProfileMenu();
  }, [closeProfileMenu]);

  const handleAccountLinkClick = useCallback(() => {
    markNavigationStart(PAGE_ROUTES.ACCOUNT, "profile-menu");
    closeProfileMenu();
  }, [closeProfileMenu]);

  const getLockedAriaLabel = useCallback(
    (item: SidebarItem): string => {
      return lockedAriaLabelTemplate
        .replace("{feature}", item.label)
        .replace("{plan}", item.planBadge ?? "");
    },
    [lockedAriaLabelTemplate]
  );

  return (
    <div className={styles["sidebar-navigation"]}>
      <SidebarNavigationList
        items={items}
        pathname={pathname}
        navListId={navListId}
        addTabLabel={t("addTab")}
        addTabAriaLabel={t("addTabAriaLabel")}
        getLockedAriaLabel={getLockedAriaLabel}
        onAddTabClick={handleAddTabClick}
        onItemClick={handleSidebarItemClick}
        onItemPrefetch={prefetchProjectView}
      />

      <SidebarProfileMenu
        profileTriggerRef={profileTriggerRef}
        profileMenuRef={profileMenuRef}
        profileTriggerId={profileTriggerId}
        profileMenuId={profileMenuId}
        profileMenuOpen={profileMenuOpen}
        displayName={displayName}
        initials={initials}
        profileAriaLabel={t("profile.ariaLabel")}
        workspaceHref={workspaceHref}
        workspaceLabel={t("profile.backToWorkspace")}
        accountHref={accountHref}
        accountLabel={t("profile.profileSettings")}
        logoutLabel={t("profile.logout")}
        isSignOutPending={signOutMutation.isPending}
        onProfileTriggerClick={handleProfileTriggerClick}
        onWorkspacePrefetch={prefetchWorkspace}
        onWorkspaceLinkClick={handleWorkspaceLinkClick}
        onAccountLinkClick={handleAccountLinkClick}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default React.memo(SidebarNavigation);
