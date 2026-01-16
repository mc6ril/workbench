"use client";

import React from "react";

import Breadcrumbs from "@/presentation/components/breadcrumbs/Breadcrumbs";
import SidebarNavigation from "@/presentation/components/sidebarNavigation/SidebarNavigation";
import SkipLink from "@/presentation/components/skipLink/SkipLink";
import DashboardShell from "@/presentation/layouts/dashboardShell/DashboardShell";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

type Props = {
  projectId: string;
  children: React.ReactNode;
};

const ProjectShell = ({ projectId, children }: Props) => {
  const tSkipLink = useTranslation("navigation.skipLink");
  const tSidebar = useTranslation("navigation.sidebar");
  const tBreadcrumbs = useTranslation("navigation.breadcrumbs");

  const mainContentId = getAccessibilityId("main-content");

  return (
    <>
      <SkipLink targetId={mainContentId} label={tSkipLink("label")} />

      <DashboardShell
        sidebar={<SidebarNavigation projectId={projectId} />}
        sidebarAriaLabel={tSidebar("ariaLabel")}
        breadcrumbs={<Breadcrumbs projectId={projectId} />}
        breadcrumbsAriaLabel={tBreadcrumbs("ariaLabel")}
      >
        {children}
      </DashboardShell>
    </>
  );
};

export default ProjectShell;
