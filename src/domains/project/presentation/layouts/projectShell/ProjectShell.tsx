"use client";

import React from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";
import SkipLink from "@/shared/design-system/skip_link";
import { useTranslations } from "@/shared/i18n";

import type { ProjectShellSnapshot } from "@/domains/project/core/domain/projectShell.types";
import DashboardShell from "@/domains/project/presentation/components/dashboardShell";
import ProjectRealtime from "@/domains/project/presentation/components/projectRealtime/ProjectRealtime";
import ProjectToolbarSlot from "@/domains/project/presentation/components/projectToolbarSlot/ProjectToolbarSlot";
import SidebarNavigation from "@/domains/project/presentation/components/sidebarNavigation/SidebarNavigation";
import { ToolbarBreadcrumbProvider } from "@/domains/project/presentation/contexts/ToolbarBreadcrumb";
import { ProjectPermissionsProvider } from "@/domains/project/presentation/providers/permissions/ProjectPermissionsProvider";
import { ProjectShellSnapshotProvider } from "@/domains/project/presentation/providers/ProjectShellSnapshotProvider";

type Props = {
  projectId: string;
  shellSnapshot: ProjectShellSnapshot;
  children: React.ReactNode;
};

const ProjectShellContent = ({
  projectId,
  children,
}: Omit<Props, "shellSnapshot">) => {
  const tSkipLink = useTranslations("navigation.skipLink");
  const tSidebar = useTranslations("navigation.sidebar");
  const mainContentId = getAccessibilityId("main-content");

  return (
    <ToolbarBreadcrumbProvider>
      <ProjectRealtime projectId={projectId} />
      <SkipLink targetId={mainContentId} label={tSkipLink("label")} />
      <DashboardShell
        sidebar={<SidebarNavigation projectId={projectId} />}
        sidebarAriaLabel={tSidebar("ariaLabel")}
        header={<ProjectToolbarSlot projectId={projectId} />}
      >
        {children}
      </DashboardShell>
    </ToolbarBreadcrumbProvider>
  );
};

const ProjectShell = ({ projectId, shellSnapshot, children }: Props) => {
  return (
    <ProjectShellSnapshotProvider snapshot={shellSnapshot}>
      <ProjectPermissionsProvider>
        <ProjectShellContent projectId={projectId}>
          {children}
        </ProjectShellContent>
      </ProjectPermissionsProvider>
    </ProjectShellSnapshotProvider>
  );
};

export default ProjectShell;
