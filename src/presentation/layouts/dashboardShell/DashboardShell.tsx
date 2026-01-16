import React from "react";

import {
  ARIA_HIDDEN_VALUES,
  getAccessibilityId,
} from "@/shared/a11y/constants";

import styles from "./DashboardShell.module.scss";

type Props = {
  sidebar?: React.ReactNode;
  sidebarAriaLabel?: string;
  header?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  breadcrumbsAriaLabel?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

const DashboardShell = ({
  sidebar,
  sidebarAriaLabel,
  header,
  breadcrumbs,
  breadcrumbsAriaLabel,
  footer,
  children,
  className,
}: Props) => {
  const shellId = getAccessibilityId("dashboard-shell");
  const mainId = getAccessibilityId("main-content");

  const containerClasses = [styles["dashboard-shell"], className]
    .filter(Boolean)
    .join(" ");

  const isSidebarEmpty = !sidebar;
  const isHeaderEmpty = !header;
  const isBreadcrumbsEmpty = !breadcrumbs;
  const isFooterEmpty = !footer;

  const isHeaderSemanticElement =
    !!header && React.isValidElement(header) && header.type === "header";

  return (
    <div id={shellId} className={containerClasses}>
      <nav
        className={styles["dashboard-shell__sidebar"]}
        aria-hidden={
          isSidebarEmpty ? ARIA_HIDDEN_VALUES.TRUE : ARIA_HIDDEN_VALUES.FALSE
        }
        aria-label={sidebarAriaLabel}
      >
        {sidebar}
      </nav>

      <div className={styles["dashboard-shell__content"]}>
        {isHeaderSemanticElement ? (
          <div
            className={styles["dashboard-shell__header"]}
            aria-hidden={
              isHeaderEmpty ? ARIA_HIDDEN_VALUES.TRUE : ARIA_HIDDEN_VALUES.FALSE
            }
          >
            {header}
          </div>
        ) : (
          <header
            className={styles["dashboard-shell__header"]}
            aria-hidden={
              isHeaderEmpty ? ARIA_HIDDEN_VALUES.TRUE : ARIA_HIDDEN_VALUES.FALSE
            }
          >
            {header}
          </header>
        )}

        <nav
          className={styles["dashboard-shell__breadcrumbs"]}
          aria-hidden={
            isBreadcrumbsEmpty
              ? ARIA_HIDDEN_VALUES.TRUE
              : ARIA_HIDDEN_VALUES.FALSE
          }
          aria-label={breadcrumbsAriaLabel}
        >
          {breadcrumbs}
        </nav>

        <main id={mainId} className={styles["dashboard-shell__main"]}>
          {children}
        </main>

        <div
          className={styles["dashboard-shell__footer"]}
          aria-hidden={
            isFooterEmpty ? ARIA_HIDDEN_VALUES.TRUE : ARIA_HIDDEN_VALUES.FALSE
          }
        >
          {footer}
        </div>
      </div>
    </div>
  );
};

export default DashboardShell;
