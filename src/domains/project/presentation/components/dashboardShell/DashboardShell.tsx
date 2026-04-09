"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

import { useTranslations } from "@/shared/i18n";

import {
  type DashboardShellProps,
  useIsDesktopDashboardViewport,
} from "./dashboardShell.helpers";
import DashboardShellInner from "./DashboardShellInner";

const DashboardShell = (props: DashboardShellProps) => {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const tSidebar = useTranslations("navigation.sidebar");
  const isDesktopViewport = useIsDesktopDashboardViewport();

  const shellResetKey = `${pathname}:${isDesktopViewport ? "desktop" : "mobile"}`;

  return (
    <DashboardShellInner
      key={shellResetKey}
      {...props}
      isDesktopViewport={isDesktopViewport}
      resolvedTheme={resolvedTheme}
      openMenuLabel={tSidebar("openMenu")}
      closeMenuLabel={tSidebar("closeMenu")}
    />
  );
};

export default DashboardShell;
