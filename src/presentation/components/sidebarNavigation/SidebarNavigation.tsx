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

import { getEffectivePlan } from "@/core/domain/schema/planFeatures.schema";
import { SubscriptionPlan } from "@/core/domain/schema/subscription.schema";

import { PlusIcon, UserProfileIcon } from "@/presentation/components/icons";
import NavigationItem from "@/presentation/components/ui/NavigationItem";
import { useSession } from "@/presentation/hooks/auth/useSession";
import { useSignOut } from "@/presentation/hooks/auth/useSignOut";
import { useSubscription } from "@/presentation/hooks/subscription/useSubscription";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { PAGE_ROUTES } from "@/shared/constants/routes";
import { useTranslation } from "@/shared/i18n";
import { getInitials, isActiveHref } from "@/shared/utils";

import styles from "./SidebarNavigation.module.scss";

import {
  buildProjectViewHref,
  computeViewLockedState,
  getProjectViewConfigsForSidebar,
} from "@/configs/projectRoutes";

type Props = {
  projectId: string;
};

type SidebarItem = {
  key: string;
  href: string;
  label: string;
  exactOnly: boolean;
  locked: boolean;
  planBadge?: string;
};

const SidebarNavigation = ({ projectId }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslation("navigation.sidebar");
  const signOutMutation = useSignOut();
  const { data: session } = useSession();
  const { data: subscription } = useSubscription();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const navListId = getAccessibilityId("sidebar-navigation-list");
  const profileMenuId = getAccessibilityId("sidebar-profile-menu");
  const profileTriggerId = getAccessibilityId("sidebar-profile-trigger");

  const effectivePlan = useMemo((): SubscriptionPlan => {
    if (!subscription) {
      return SubscriptionPlan.FREE;
    }
    return getEffectivePlan(subscription);
  }, [subscription]);

  const items: SidebarItem[] = useMemo(() => {
    const configs = getProjectViewConfigsForSidebar();
    return configs.map((config) => {
      const { locked, minimumPlan } = computeViewLockedState(
        config,
        effectivePlan
      );
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

  const handleProfileTriggerClick = useCallback(() => {
    setProfileMenuOpen((prev) => !prev);
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
              onClick={item.locked ? handleLockedClick : undefined}
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
              onClick={closeProfileMenu}
            >
              {t("profile.backToWorkspace")}
            </Link>
            <Link
              href={`${PAGE_ROUTES.ACCOUNT}?from=${encodeURIComponent(pathname ?? PAGE_ROUTES.WORKSPACE)}`}
              role="menuitem"
              className={styles["sidebar-navigation__profile-menu-item"]}
              onClick={closeProfileMenu}
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
