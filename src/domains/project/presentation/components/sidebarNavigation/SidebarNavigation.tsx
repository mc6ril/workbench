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

import { getAccessibilityId } from "@/shared/a11y/constants";
import { PAGE_ROUTES, PROJECT_VIEWS } from "@/shared/constants/routes";
import { useTranslation } from "@/shared/i18n";
import { markNavigationStart } from "@/shared/navigationPerf";
import { useMyProfile } from "@/shared/profile";
import { useSession } from "@/shared/session";

import SidebarNavigationList from "./components/SidebarNavigationList";
import SidebarProfileMenu from "./components/SidebarProfileMenu";
import styles from "./SidebarNavigation.module.scss";
import type {
  SidebarItem,
  SidebarNavigationProps,
} from "./SidebarNavigation.types";
import { omitParentIdFilter } from "./SidebarNavigation.utils";

import { useSignOut } from "@/domains/auth/presentation/hooks/user/useSignOut";
import { queryKeys } from "@/domains/project/presentation/hooks/queryKeys";
import { useSidebarItems } from "@/domains/project/presentation/hooks/useSidebarItems";
import { usePrefetchWorkspaceProjects } from "@/domains/workspace/presentation/hooks/usePrefetchWorkspaceProjects";
import { usePrefetchProjectViews } from "@/modules/board/presentation/hooks/project/usePrefetchProjectViews";
import { useFilterStore } from "@/modules/board/presentation/stores/useFilterStore";
import { useSortStore } from "@/modules/board/presentation/stores/useSortStore";
import { normalizeTicketSearch } from "@/modules/board/utils/ticketUtils";

type CachedProjectSummary = {
  shortCode?: string;
};

const SidebarNavigation = ({ projectId }: SidebarNavigationProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslation("navigation.sidebar");
  const signOutMutation = useSignOut();
  const filters = useFilterStore((state) => state.filters);
  const search = useFilterStore((state) => state.search);
  const sort = useSortStore((state) => state.sort);
  const { data: session } = useSession();
  const { data: profile } = useMyProfile();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const navListId = getAccessibilityId("sidebar-navigation-list");
  const profileMenuId = getAccessibilityId("sidebar-profile-menu");
  const profileTriggerId = getAccessibilityId("sidebar-profile-trigger");
  const items = useSidebarItems(projectId);

  const handleLockedClick = useCallback(() => {
    const from = encodeURIComponent(pathname ?? PAGE_ROUTES.WORKSPACE);
    router.push(`${PAGE_ROUTES.PRICING}?from=${from}`);
  }, [router, pathname]);

  const displayNameValue = profile?.displayName?.trim();
  const emailValue = session?.email?.trim();
  const profileIdentity = displayNameValue || emailValue;
  const displayName = profileIdentity ?? t("profile.userFallbackName");
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
    const project = queryClient.getQueryData<CachedProjectSummary>(
      queryKeys.projects.detail(projectId)
    );
    return normalizeTicketSearch(search, project?.shortCode);
  }, [projectId, queryClient, search]);
  const { prefetchBoardView, prefetchEpicsView } = usePrefetchProjectViews({
    projectId,
    filters: projectWideFilters,
    sort,
    search: effectiveSearch,
  });
  const prefetchWorkspaceProjects = usePrefetchWorkspaceProjects();

  const prefetchProjectView = useCallback(
    (item: SidebarItem) => {
      if (item.locked) {
        return;
      }

      void router.prefetch(item.href);

      if (item.key === PROJECT_VIEWS.BOARD) {
        prefetchBoardView();
        return;
      }

      if (item.key === PROJECT_VIEWS.EPICS) {
        prefetchEpicsView();
      }
    },
    [prefetchBoardView, prefetchEpicsView, router]
  );

  const prefetchWorkspace = useCallback(() => {
    void router.prefetch(PAGE_ROUTES.WORKSPACE);
    prefetchWorkspaceProjects(session?.userId);
  }, [prefetchWorkspaceProjects, router, session?.userId]);

  const handleProfileTriggerClick = useCallback(() => {
    setProfileMenuOpen((prev) => {
      return !prev;
    });
  }, []);

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
        avatarUrl={profile?.avatarUrl}
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
