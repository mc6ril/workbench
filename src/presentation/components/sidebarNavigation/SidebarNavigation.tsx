"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { getEffectivePlan } from "@/core/domain/rules/planFeatures.rules";
import type { Project } from "@/core/domain/schema/project.schema";
import { SubscriptionPlan } from "@/core/domain/schema/subscription.schema";
import type { TicketFilters } from "@/core/domain/schema/ticket.schema";

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

import { PlusIcon, UserProfileIcon } from "@/presentation/components/icons";
import NavigationItem from "@/presentation/components/ui/NavigationItem";
import { useSession } from "@/presentation/hooks/auth/useSession";
import { useSignOut } from "@/presentation/hooks/auth/useSignOut";
import { queryKeys } from "@/presentation/hooks/queryKeys";
import { useSubscription } from "@/presentation/hooks/subscription/useSubscription";
import {
  buildProjectViewHref,
  getProjectViewConfigsForSidebar,
  type ProjectViewKey,
} from "@/presentation/navigation/projectViews.config";
import { useFilterStore } from "@/presentation/stores/useFilterStore";
import { useSortStore } from "@/presentation/stores/useSortStore";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { PAGE_ROUTES, PROJECT_VIEWS } from "@/shared/constants/routes";
import { useTranslation } from "@/shared/i18n";
import { markNavigationStart } from "@/shared/observability";
import { getInitials, isActiveHref } from "@/shared/utils";
import { normalizeTicketSearch } from "@/shared/utils/ticketUtils";

import styles from "./SidebarNavigation.module.scss";

type Props = {
  projectId: string;
};

type SidebarItem = {
  key: ProjectViewKey;
  href: string;
  label: string;
  exactOnly: boolean;
  locked: boolean;
  planBadge?: string;
};

const omitParentIdFilter = (filters: TicketFilters): TicketFilters => {
  if (!Object.prototype.hasOwnProperty.call(filters, "parentId")) {
    return filters;
  }

  const { parentId: _parentId, ...rest } = filters;
  return rest;
};

const SidebarNavigation = ({ projectId }: Props) => {
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
    return configs.map((config) => {
      const { locked, minimumPlan } =
        effectivePlan === null
          ? { locked: false, minimumPlan: undefined }
          : computeFeatureLockState(config.requiredFeature, effectivePlan);

      return {
        key: config.key,
        href: buildProjectViewHref(projectId, config.key),
        label: t(`items.${config.sidebarLabelKey}`),
        exactOnly: config.key === "home",
        locked,
        planBadge: minimumPlan ? t(`locked.badge.${minimumPlan}`) : undefined,
      };
    });
  }, [projectId, t, effectivePlan]);

  const handleLockedClick = useCallback(() => {
    const from = encodeURIComponent(pathname ?? PAGE_ROUTES.WORKSPACE);
    router.push(`${PAGE_ROUTES.PRICING}?from=${from}`);
  }, [router, pathname]);

  const displayName =
    session?.displayName ?? session?.email ?? t("profile.userFallbackName");
  const initials = getInitials(session?.displayName ?? session?.email);

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

      if (
        item.key === PROJECT_VIEWS.BOARD ||
        item.key === PROJECT_VIEWS.BACKLOG
      ) {
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

  return (
    <div className={styles["sidebar-navigation"]}>
      <div className={styles["sidebar-navigation__nav"]}>
        <ul id={navListId} className={styles["sidebar-navigation__list"]}>
          {items.map((item) => (
            <NavigationItem
              key={item.key}
              href={item.href}
              label={item.label}
              active={
                !item.locked &&
                isActiveHref(pathname, item.href, {
                  exactOnly: item.exactOnly,
                })
              }
              locked={item.locked}
              planBadge={item.planBadge}
              onClick={() => {
                handleSidebarItemClick(item);
              }}
              onMouseEnter={() => {
                prefetchProjectView(item);
              }}
              onFocus={() => {
                prefetchProjectView(item);
              }}
              ariaLabel={
                item.locked
                  ? t("locked.ariaLabel")
                      .replace("{feature}", item.label)
                      .replace("{plan}", item.planBadge ?? "")
                  : undefined
              }
            />
          ))}
        </ul>

        <button
          type="button"
          className={styles["sidebar-navigation__add-tab"]}
          onClick={handleAddTabClick}
          aria-label={t("addTabAriaLabel")}
        >
          <PlusIcon
            className={styles["sidebar-navigation__add-tab-icon"]}
            size={16}
          />
          <span className={styles["sidebar-navigation__add-tab-label"]}>
            {t("addTab")}
          </span>
        </button>
      </div>

      <div className={styles["sidebar-navigation__profile"]}>
        <button
          ref={profileTriggerRef}
          id={profileTriggerId}
          type="button"
          className={styles["sidebar-navigation__profile-trigger"]}
          onClick={handleProfileTriggerClick}
          aria-label={t("profile.ariaLabel")}
          aria-expanded={profileMenuOpen}
          aria-haspopup="menu"
          aria-controls={profileMenuId}
        >
          <span
            className={styles["sidebar-navigation__profile-avatar"]}
            aria-hidden
          >
            {initials}
          </span>
          <span className={styles["sidebar-navigation__profile-name"]}>
            {displayName}
          </span>
          <UserProfileIcon
            className={styles["sidebar-navigation__profile-icon"]}
            size={14}
          />
        </button>

        {profileMenuOpen && (
          <div
            ref={profileMenuRef}
            id={profileMenuId}
            role="menu"
            className={styles["sidebar-navigation__profile-menu"]}
            aria-labelledby={profileTriggerId}
          >
            <Link
              href={PAGE_ROUTES.WORKSPACE}
              role="menuitem"
              className={styles["sidebar-navigation__profile-menu-item"]}
              onMouseEnter={prefetchWorkspace}
              onFocus={prefetchWorkspace}
              onClick={handleWorkspaceLinkClick}
            >
              {t("profile.backToWorkspace")}
            </Link>
            <Link
              href={`${PAGE_ROUTES.ACCOUNT}?from=${encodeURIComponent(pathname ?? PAGE_ROUTES.WORKSPACE)}`}
              role="menuitem"
              className={styles["sidebar-navigation__profile-menu-item"]}
              onClick={handleAccountLinkClick}
            >
              {t("profile.profileSettings")}
            </Link>
            <button
              type="button"
              role="menuitem"
              className={styles["sidebar-navigation__profile-menu-item"]}
              onClick={handleLogout}
              disabled={signOutMutation.isPending}
            >
              {t("profile.logout")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SidebarNavigation);
