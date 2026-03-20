import type { RefObject } from "react";
import Link from "next/link";

import { UserProfileIcon } from "@/shared/design-system/icons";

import styles from "@/domains/project/presentation/components/sidebarNavigation/SidebarNavigation.module.scss";

type Props = {
  profileTriggerRef: RefObject<HTMLButtonElement | null>;
  profileMenuRef: RefObject<HTMLDivElement | null>;
  profileTriggerId: string;
  profileMenuId: string;
  profileMenuOpen: boolean;
  displayName: string;
  initials: string;
  profileAriaLabel: string;
  workspaceHref: string;
  workspaceLabel: string;
  accountHref: string;
  accountLabel: string;
  logoutLabel: string;
  isSignOutPending: boolean;
  onProfileTriggerClick: () => void;
  onWorkspacePrefetch: () => void;
  onWorkspaceLinkClick: () => void;
  onAccountLinkClick: () => void;
  onLogout: () => void;
};

const SidebarProfileMenu = ({
  profileTriggerRef,
  profileMenuRef,
  profileTriggerId,
  profileMenuId,
  profileMenuOpen,
  displayName,
  initials,
  profileAriaLabel,
  workspaceHref,
  workspaceLabel,
  accountHref,
  accountLabel,
  logoutLabel,
  isSignOutPending,
  onProfileTriggerClick,
  onWorkspacePrefetch,
  onWorkspaceLinkClick,
  onAccountLinkClick,
  onLogout,
}: Props) => {
  return (
    <div className={styles["sidebar-navigation__profile"]}>
      <button
        ref={profileTriggerRef}
        id={profileTriggerId}
        type="button"
        className={styles["sidebar-navigation__profile-trigger"]}
        onClick={onProfileTriggerClick}
        aria-label={profileAriaLabel}
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

      {profileMenuOpen ? (
        <div
          ref={profileMenuRef}
          id={profileMenuId}
          role="menu"
          className={styles["sidebar-navigation__profile-menu"]}
          aria-labelledby={profileTriggerId}
        >
          <Link
            href={workspaceHref}
            prefetch={false}
            role="menuitem"
            className={styles["sidebar-navigation__profile-menu-item"]}
            onMouseEnter={onWorkspacePrefetch}
            onFocus={onWorkspacePrefetch}
            onClick={onWorkspaceLinkClick}
          >
            {workspaceLabel}
          </Link>
          <Link
            href={accountHref}
            prefetch={false}
            role="menuitem"
            className={styles["sidebar-navigation__profile-menu-item"]}
            onClick={onAccountLinkClick}
          >
            {accountLabel}
          </Link>
          <button
            type="button"
            role="menuitem"
            className={styles["sidebar-navigation__profile-menu-item"]}
            onClick={onLogout}
            disabled={isSignOutPending}
          >
            {logoutLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default SidebarProfileMenu;
