"use client";

import React from "react";
import { usePathname } from "next/navigation";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { PROJECT_VIEWS } from "@/shared/constants/routes";
import SkipLink from "@/shared/design-system/skip_link";
import { useTranslation } from "@/shared/i18n";
import { buildProjectRoute, normalizePath } from "@/shared/utils/routes";

import DashboardShell from "@/domains/project/presentation/components/dashboardShell";
import SidebarNavigation from "@/domains/project/presentation/components/sidebarNavigation/SidebarNavigation";
import {
  ProjectShellContributionProvider,
  useProjectShellContribution,
} from "@/domains/project/presentation/layouts/projectShell/ProjectShellContributionContext";
import { ProjectPermissionsProvider } from "@/domains/project/presentation/providers/permissions/ProjectPermissionsProvider";

type Props = {
  projectId: string;
  children: React.ReactNode;
  shellAdapter?: React.ReactNode;
};

const ProjectShellContent = ({ projectId, children, shellAdapter }: Props) => {
  const pathname = usePathname();
  const tSkipLink = useTranslation("navigation.skipLink");
  const tSidebar = useTranslation("navigation.sidebar");
  const mainContentId = getAccessibilityId("main-content");
  const { toolbar, filters } = useProjectShellContribution();
  const isTicketDetailRoute = normalizePath(pathname).startsWith(
    `${buildProjectRoute(projectId, PROJECT_VIEWS.BOARD)}/tickets/`
  );

  return (
    <>
      {shellAdapter}

      <SkipLink targetId={mainContentId} label={tSkipLink("label")} />

      <DashboardShell
        sidebar={<SidebarNavigation projectId={projectId} />}
        sidebarAriaLabel={tSidebar("ariaLabel")}
        header={toolbar}
        hideHeader={isTicketDetailRoute}
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
