"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  ARIA_HIDDEN_VALUES,
  getAccessibilityId,
} from "@/shared/a11y/constants";

import {
  DASHBOARD_SHELL_THEME_COLOR_SELECTOR,
  type DashboardShellInnerProps,
  getSidebarSwipeThreshold,
  isHorizontalLeftSwipe,
  joinDashboardShellClasses,
  type SidebarSwipeGesture,
} from "./dashboardShell.helpers";
import styles from "./DashboardShell.module.scss";

const DashboardShellInner = ({
  sidebar,
  sidebarAriaLabel,
  header,
  hideHeader = false,
  footer,
  children,
  className,
  isDesktopViewport,
  resolvedTheme,
  openMenuLabel,
  closeMenuLabel,
}: DashboardShellInnerProps) => {
  const shellId = getAccessibilityId("dashboard-shell");
  const mainId = getAccessibilityId("main-content");
  const mobileSidebarId = getAccessibilityId("dashboard-shell-mobile-sidebar");
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileSidebarRef = useRef<HTMLElement>(null);
  const sidebarSwipeGestureRef = useRef<SidebarSwipeGesture | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const containerClasses = joinDashboardShellClasses(
    styles["dashboard-shell"],
    className
  );

  const isSidebarEmpty = !sidebar;
  const isHeaderEmpty = !header;
  const isFooterEmpty = !footer;
  const isSidebarVisible =
    !isSidebarEmpty && (isDesktopViewport || isMobileSidebarOpen);
  const isHeaderRegionEmpty = isHeaderEmpty && isSidebarEmpty;

  const restoreFocusToMenuTrigger = useCallback(() => {
    if (typeof document === "undefined") {
      return;
    }

    const activeElement = document.activeElement;
    if (
      activeElement instanceof HTMLElement &&
      mobileSidebarRef.current?.contains(activeElement)
    ) {
      menuTriggerRef.current?.focus();
    }
  }, []);

  const openMobileSidebar = useCallback(() => {
    if (isDesktopViewport) {
      return;
    }

    setIsMobileSidebarOpen(true);
  }, [isDesktopViewport]);

  const closeMobileSidebar = useCallback(() => {
    restoreFocusToMenuTrigger();
    setIsMobileSidebarOpen(false);
  }, [restoreFocusToMenuTrigger]);

  const handleSidebarClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (
        !isDesktopViewport &&
        event.target instanceof HTMLElement &&
        event.target.closest('[data-sidebar-dismiss="true"]')
      ) {
        closeMobileSidebar();
      }
    },
    [closeMobileSidebar, isDesktopViewport]
  );

  const handleSidebarTouchStart = useCallback(
    (event: React.TouchEvent<HTMLElement>) => {
      if (isDesktopViewport || !isMobileSidebarOpen) {
        sidebarSwipeGestureRef.current = null;
        return;
      }

      const touch = event.touches[0];
      if (!touch) {
        sidebarSwipeGestureRef.current = null;
        return;
      }

      sidebarSwipeGestureRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        lastX: touch.clientX,
        lastY: touch.clientY,
      };
    },
    [isDesktopViewport, isMobileSidebarOpen]
  );

  const handleSidebarTouchMove = useCallback(
    (event: React.TouchEvent<HTMLElement>) => {
      const swipeGesture = sidebarSwipeGestureRef.current;
      const touch = event.touches[0];

      if (!swipeGesture || !touch) {
        return;
      }

      swipeGesture.lastX = touch.clientX;
      swipeGesture.lastY = touch.clientY;

      const deltaX = touch.clientX - swipeGesture.startX;
      const deltaY = touch.clientY - swipeGesture.startY;

      if (isHorizontalLeftSwipe(deltaX, deltaY) && event.cancelable) {
        event.preventDefault();
      }
    },
    []
  );

  const handleSidebarTouchEnd = useCallback(() => {
    const swipeGesture = sidebarSwipeGestureRef.current;
    sidebarSwipeGestureRef.current = null;

    if (!swipeGesture) {
      return;
    }

    const deltaX = swipeGesture.lastX - swipeGesture.startX;
    const deltaY = swipeGesture.lastY - swipeGesture.startY;
    const sidebarWidth = mobileSidebarRef.current?.clientWidth ?? 0;
    const minimumSwipeDistance = getSidebarSwipeThreshold(sidebarWidth);

    if (
      deltaX <= -minimumSwipeDistance &&
      isHorizontalLeftSwipe(deltaX, deltaY)
    ) {
      closeMobileSidebar();
    }
  }, [closeMobileSidebar]);

  const handleSidebarTouchCancel = useCallback(() => {
    sidebarSwipeGestureRef.current = null;
  }, []);

  useEffect(() => {
    if (!isMobileSidebarOpen || isDesktopViewport) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isDesktopViewport, isMobileSidebarOpen]);

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileSidebar();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [closeMobileSidebar, isMobileSidebarOpen]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const rootElement = document.documentElement;
    const bodyElement = document.body;

    const removeShellThemeColorMetas = (): void => {
      document.head
        .querySelectorAll(DASHBOARD_SHELL_THEME_COLOR_SELECTOR)
        .forEach((node) => {
          node.remove();
        });
    };

    if (!isMobileSidebarOpen || isDesktopViewport) {
      removeShellThemeColorMetas();
      rootElement.style.removeProperty("background-color");
      rootElement.style.removeProperty("background-image");
      bodyElement.style.removeProperty("background-color");
      bodyElement.style.removeProperty("background-image");
      return;
    }

    const overlayThemeColor =
      getComputedStyle(rootElement)
        .getPropertyValue("--color-secondary")
        .trim() || "#ffffff";

    removeShellThemeColorMetas();

    const appendThemeColorOverride = (media: string): void => {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = overlayThemeColor;
      meta.media = media;
      meta.dataset.dashboardShellThemeColor = "true";
      document.head.appendChild(meta);
    };

    appendThemeColorOverride("(prefers-color-scheme: light)");
    appendThemeColorOverride("(prefers-color-scheme: dark)");

    rootElement.style.setProperty("background-color", overlayThemeColor);
    rootElement.style.setProperty("background-image", "none");
    bodyElement.style.setProperty("background-color", overlayThemeColor);
    bodyElement.style.setProperty("background-image", "none");

    return () => {
      removeShellThemeColorMetas();
      rootElement.style.removeProperty("background-color");
      rootElement.style.removeProperty("background-image");
      bodyElement.style.removeProperty("background-color");
      bodyElement.style.removeProperty("background-image");
    };
  }, [isDesktopViewport, isMobileSidebarOpen, resolvedTheme]);

  const backdropClasses = joinDashboardShellClasses(
    styles["dashboard-shell__sidebar-backdrop"],
    isMobileSidebarOpen && styles["dashboard-shell__sidebar-backdrop--open"]
  );

  const sidebarClasses = joinDashboardShellClasses(
    styles["dashboard-shell__sidebar"],
    isMobileSidebarOpen && styles["dashboard-shell__sidebar--open"]
  );

  const contentClasses = joinDashboardShellClasses(
    styles["dashboard-shell__content"],
    hideHeader && styles["dashboard-shell__content--no-header"],
    isFooterEmpty && styles["dashboard-shell__content--no-footer"]
  );

  return (
    <div id={shellId} className={containerClasses}>
      {!isSidebarEmpty ? (
        <button
          type="button"
          className={backdropClasses}
          aria-label={closeMenuLabel}
          aria-hidden={
            isMobileSidebarOpen
              ? ARIA_HIDDEN_VALUES.FALSE
              : ARIA_HIDDEN_VALUES.TRUE
          }
          tabIndex={isMobileSidebarOpen ? 0 : -1}
          onClick={closeMobileSidebar}
        />
      ) : null}

      <nav
        id={mobileSidebarId}
        ref={mobileSidebarRef}
        className={sidebarClasses}
        inert={!isSidebarVisible}
        aria-hidden={
          isSidebarVisible ? ARIA_HIDDEN_VALUES.FALSE : ARIA_HIDDEN_VALUES.TRUE
        }
        aria-label={sidebarAriaLabel}
        onClick={handleSidebarClick}
        onTouchStart={handleSidebarTouchStart}
        onTouchMove={handleSidebarTouchMove}
        onTouchEnd={handleSidebarTouchEnd}
        onTouchCancel={handleSidebarTouchCancel}
      >
        <div className={styles["dashboard-shell__sidebar-inner"]}>
          <div className={styles["dashboard-shell__sidebar-mobile-header"]}>
            <button
              type="button"
              className={styles["dashboard-shell__sidebar-close"]}
              onClick={closeMobileSidebar}
              aria-label={closeMenuLabel}
            >
              <span
                className={styles["dashboard-shell__sidebar-close-icon"]}
                aria-hidden="true"
              >
                <span
                  className={styles["dashboard-shell__sidebar-close-line"]}
                />
                <span
                  className={styles["dashboard-shell__sidebar-close-line"]}
                />
              </span>
            </button>
          </div>
          {sidebar}
        </div>
      </nav>

      <div className={contentClasses}>
        {!hideHeader ? (
          <div
            className={styles["dashboard-shell__header"]}
            aria-hidden={
              isHeaderRegionEmpty
                ? ARIA_HIDDEN_VALUES.TRUE
                : ARIA_HIDDEN_VALUES.FALSE
            }
          >
            <div className={styles["dashboard-shell__header-bar"]}>
              {!isSidebarEmpty ? (
                <button
                  type="button"
                  ref={menuTriggerRef}
                  className={styles["dashboard-shell__menu-trigger"]}
                  onClick={openMobileSidebar}
                  aria-label={openMenuLabel}
                  aria-controls={mobileSidebarId}
                  aria-expanded={isMobileSidebarOpen}
                >
                  <span
                    className={styles["dashboard-shell__menu-icon"]}
                    aria-hidden="true"
                  >
                    <span
                      className={styles["dashboard-shell__menu-icon-line"]}
                    />
                    <span
                      className={styles["dashboard-shell__menu-icon-line"]}
                    />
                    <span
                      className={styles["dashboard-shell__menu-icon-line"]}
                    />
                  </span>
                </button>
              ) : null}
              <div className={styles["dashboard-shell__header-content"]}>
                {header}
              </div>
            </div>
          </div>
        ) : null}

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

export default DashboardShellInner;
