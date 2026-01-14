"use client";

import React, { useMemo } from "react";
import Link from "next/link";

import { getAccessibilityId } from "@/shared/a11y/constants";

import styles from "./Link.module.scss";

type LinkVariant = "default" | "primary" | "secondary";

type Props = {
  /** Link URL */
  href: string;
  /** Link content */
  children: React.ReactNode;
  /** Link variant style */
  variant?: LinkVariant;
  /** Whether this is an external link */
  external?: boolean;
  /** Custom ARIA label for accessibility */
  ariaLabel?: string;
  /** Additional CSS class name */
  className?: string;
} & React.ComponentPropsWithoutRef<typeof Link>;

/**
 * Reusable Link component that wraps Next.js Link for consistent navigation styling.
 * Supports internal navigation (client-side routing) and external links with proper security attributes.
 * Includes full accessibility support.
 *
 * @example
 * ```tsx
 * <Link href="/dashboard">Go to Dashboard</Link>
 * ```
 *
 * @example
 * ```tsx
 * <Link href="https://example.com" external variant="primary">
 *   External Link
 * </Link>
 * ```
 */
const LinkComponent = ({
  href,
  children,
  variant = "default",
  external = false,
  ariaLabel,
  className,
  ...linkProps
}: Props) => {
  const linkId = useMemo(() => getAccessibilityId(`link-${href}`), [href]);

  const linkClasses = [
    styles.link,
    styles[`link--${variant}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const externalProps = external
    ? {
        target: "_blank",
        rel: "noopener noreferrer",
        "aria-label": ariaLabel
          ? `${ariaLabel} (Opens in new tab)`
          : `${children} (Opens in new tab)`,
      }
    : {
        "aria-label": ariaLabel,
      };

  // For external links, use regular <a> tag instead of Next.js Link
  if (external) {
    return (
      <a
        id={linkId}
        href={href}
        className={linkClasses}
        {...externalProps}
        {...linkProps}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      id={linkId}
      href={href}
      className={linkClasses}
      {...externalProps}
      {...linkProps}
    >
      {children}
    </Link>
  );
};

export default React.memo(LinkComponent);
