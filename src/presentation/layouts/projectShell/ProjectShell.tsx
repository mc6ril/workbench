"use client";

import React from "react";

import AppFooter from "@/presentation/components/appFooter/AppFooter";
import AppHeader from "@/presentation/components/appHeader/AppHeader";
import Breadcrumbs from "@/presentation/components/breadcrumbs/Breadcrumbs";
import SidebarNavigation from "@/presentation/components/sidebarNavigation/SidebarNavigation";
import SkipLink from "@/presentation/components/skipLink/SkipLink";
import { useProject } from "@/presentation/hooks/project/useProject";
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

  const { data: project } = useProject(projectId);

  const mainContentId = getAccessibilityId("main-content");
  const headerTitle = project?.name ?? tBreadcrumbs("project");

  return (
    <>
      <SkipLink targetId={mainContentId} label={tSkipLink("label")} />

      <DashboardShell
        sidebar={<SidebarNavigation projectId={projectId} />}
        sidebarAriaLabel={tSidebar("ariaLabel")}
        header={<AppHeader title={headerTitle} />}
        breadcrumbs={<Breadcrumbs projectId={projectId} />}
        breadcrumbsAriaLabel={tBreadcrumbs("ariaLabel")}
        footer={<AppFooter />}
      >
        {children}
      </DashboardShell>
    </>
  );
};

export default ProjectShell;
