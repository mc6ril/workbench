"use client";

import React from "react";

import { Link } from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./NavigationItem.module.scss";

type Props = {
  /** Navigation URL */
  href: string;
  /** Navigation label (translation key or plain text) */
  label: string;
  /** Optional icon element */
  icon?: React.ReactNode;
  /** Whether this is the active/current route */
  active?: boolean;
  /** Click handler (optional, for custom navigation logic) */
  onClick?: () => void;
  /** Custom ARIA label for accessibility */
  ariaLabel?: string;
  /** Additional CSS class name */
  className?: string;
};

/**
 * Reusable NavigationItem component for menu navigation items.
 * Uses Link component for navigation with active state support.
 * Includes full accessibility support with proper ARIA attributes.
 *
 * @example
 * ```tsx
 * <NavigationItem href="/dashboard" label="common.dashboard" active />
 * ```
 *
 * @example
 * ```tsx
 * <NavigationItem
 *   href="/settings"
 *   label="Settings"
 *   icon={<SettingsIcon />}
 *   onClick={handleNavigation}
 * />
 * ```
 */
const NavigationItem = ({
  href,
  label,
  icon,
  active = false,
  onClick,
  ariaLabel,
  className,
}: Props) => {
  const navItemId = getAccessibilityId(`nav-item-${href}`);
  const t = useTranslation("common");
  const displayLabel = label.startsWith("common.")
    ? t(label.replace("common.", ""))
    : label;
  const displayAriaLabel = ariaLabel || displayLabel;

  const navItemClasses = [
    styles["navigation-item"],
    active && styles["navigation-item--active"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const linkProps = active
    ? {
        "aria-current": "page" as const,
      }
    : {};

  return (
    <li id={navItemId} className={navItemClasses} role="none">
      <Link
        href={href}
        variant="default"
        className={styles["navigation-item__link"]}
        aria-label={displayAriaLabel}
        onClick={onClick}
        {...linkProps}
      >
        {icon && (
          <span className={styles["navigation-item__icon"]} aria-hidden="true">
            {icon}
          </span>
        )}
        <span className={styles["navigation-item__label"]}>{displayLabel}</span>
      </Link>
    </li>
  );
};

export default React.memo(NavigationItem);
