"use client";

import React from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";
import AppFooter from "@/shared/design-system/app_footer";
import SkipLink from "@/shared/design-system/skip_link";
import { useTranslation } from "@/shared/i18n";

import DashboardShell from "@/domains/project/presentation/components/dashboardShell";
import SidebarNavigation from "@/domains/project/presentation/components/sidebarNavigation/SidebarNavigation";
import {
  ProjectShellContributionProvider,
  useProjectShellContribution,
} from "@/domains/project/presentation/layouts/projectShell/ProjectShellContributionContext";
import {
  ProjectPermissionsProvider,
} from "@/domains/project/presentation/providers/permissions";

type Props = {
  projectId: string;
  children: React.ReactNode;
  shellAdapter?: React.ReactNode;
};

const ProjectShellContent = ({ projectId, children, shellAdapter }: Props) => {
  const tSkipLink = useTranslation("navigation.skipLink");
  const tSidebar = useTranslation("navigation.sidebar");
  const mainContentId = getAccessibilityId("main-content");
  const { toolbar, filters } = useProjectShellContribution();

  return (
    <>
      {shellAdapter}

      <SkipLink targetId={mainContentId} label={tSkipLink("label")} />

      <DashboardShell
        sidebar={<SidebarNavigation projectId={projectId} />}
        sidebarAriaLabel={tSidebar("ariaLabel")}
        header={toolbar}
        footer={<AppFooter />}
      >
        {children}
      </DashboardShell>
      {filters}
    </>
  );
};

const ProjectShell = ({ projectId, children, shellAdapter }: Props) => {
  return (
    <ProjectPermissionsProvider projectId={projectId}>
      <ProjectShellContributionProvider>
        <ProjectShellContent projectId={projectId} shellAdapter={shellAdapter}>
          {children}
        </ProjectShellContent>
      </ProjectShellContributionProvider>
    </ProjectPermissionsProvider>
  );
};

export default ProjectShell;
