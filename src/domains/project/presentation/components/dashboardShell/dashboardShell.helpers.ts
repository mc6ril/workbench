import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";

export type DashboardShellProps = {
  sidebar?: ReactNode;
  sidebarAriaLabel?: string;
  header?: ReactNode;
  hideHeader?: boolean;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
};

export type DashboardShellInnerProps = DashboardShellProps & {
  isDesktopViewport: boolean;
  resolvedTheme?: string;
  openMenuLabel: string;
  closeMenuLabel: string;
};

export type SidebarSwipeGesture = {
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
};

export const DESKTOP_SIDEBAR_MEDIA_QUERY = "(min-width: 48rem)";

export const DASHBOARD_SHELL_THEME_COLOR_SELECTOR =
  'meta[name="theme-color"][data-dashboard-shell-theme-color="true"]';

export const joinDashboardShellClasses = (
  ...classes: Array<string | false | null | undefined>
): string => {
  return classes.filter(Boolean).join(" ");
};

export const isHorizontalLeftSwipe = (
  deltaX: number,
  deltaY: number
): boolean => {
  return deltaX < 0 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2;
};

export const getSidebarSwipeThreshold = (sidebarWidth: number): number => {
  return sidebarWidth > 0 ? sidebarWidth * 0.18 : 52;
};

const getDesktopViewportSnapshot = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(DESKTOP_SIDEBAR_MEDIA_QUERY).matches;
};

const subscribeToDesktopViewport = (callback: () => void): (() => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQuery = window.matchMedia(DESKTOP_SIDEBAR_MEDIA_QUERY);
  const handleChange = (): void => {
    callback();
  };

  mediaQuery.addEventListener("change", handleChange);

  return () => {
    mediaQuery.removeEventListener("change", handleChange);
  };
};

export const useIsDesktopDashboardViewport = (): boolean => {
  return useSyncExternalStore(
    subscribeToDesktopViewport,
    getDesktopViewportSnapshot,
    () => false
  );
};
