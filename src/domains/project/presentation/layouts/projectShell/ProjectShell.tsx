"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { PROJECT_VIEWS } from "@/shared/constants/routes";
import SkipLink from "@/shared/design-system/skip_link";
import { useTranslations } from "@/shared/i18n";
import { buildProjectRoute, normalizePath } from "@/shared/utils/routes";

import type { ProjectShellSnapshot } from "@/domains/project/core/domain/projectShell.types";
import DashboardShell from "@/domains/project/presentation/components/dashboardShell";
import ProjectToolbar from "@/domains/project/presentation/components/projectToolbar/ProjectToolbar";
import SidebarNavigation from "@/domains/project/presentation/components/sidebarNavigation/SidebarNavigation";
import { buildProjectToolbarProps } from "@/domains/project/presentation/layouts/projectShell/buildProjectToolbarProps";
import {
  ProjectShellContributionProvider,
  useRegisteredProjectShellContribution,
} from "@/domains/project/presentation/layouts/projectShell/ProjectShellContributionContext";
import {
  getProjectViewConfig,
  getProjectViewKeyFromPath,
} from "@/domains/project/presentation/navigation/projectViews.config";
import { ProjectPermissionsProvider } from "@/domains/project/presentation/providers/permissions/ProjectPermissionsProvider";
import { ProjectShellSnapshotProvider } from "@/domains/project/presentation/providers/ProjectShellSnapshotProvider";

type Props = {
  projectId: string;
  shellSnapshot: ProjectShellSnapshot;
  children: React.ReactNode;
  shellAdapter?: React.ReactNode;
};

const ProjectShellContent = ({
  projectId,
  children,
  shellAdapter,
}: Omit<Props, "shellSnapshot">) => {
  const pathname = usePathname();
  const tSkipLink = useTranslations("navigation.skipLink");
  const tSidebar = useTranslations("navigation.sidebar");
  const tNavbar = useTranslations("navigation.navbar");
  const tBoardFilters = useTranslations("pages.board.filters");
  const tBoardOnboarding = useTranslations("pages.board.onboarding");
  const mainContentId = getAccessibilityId("main-content");
  const { toolbar: registeredToolbar, filters } =
    useRegisteredProjectShellContribution();
  const isTicketDetailRoute = normalizePath(pathname).startsWith(
    `${buildProjectRoute(projectId, PROJECT_VIEWS.BOARD)}/tickets/`
  );

  const baseToolbar = useMemo(() => {
    const viewKey = getProjectViewKeyFromPath(
      normalizePath(pathname),
      projectId
    );
    const viewConfig = getProjectViewConfig(viewKey);
    const pageTitle = tSidebar(`items.${viewConfig.sidebarLabelKey}`);

    return (
      <ProjectToolbar
        {...buildProjectToolbarProps({
          pageTitle,
          viewKey,
          viewConfig,
          tNavbar,
          tBoardFilters,
          tBoardOnboarding,
        })}
      />
    );
  }, [pathname, projectId, tBoardFilters, tBoardOnboarding, tNavbar, tSidebar]);

  const header = registeredToolbar ?? baseToolbar;

  return (
    <>
      {shellAdapter}

      <SkipLink targetId={mainContentId} label={tSkipLink("label")} />

      <DashboardShell
        sidebar={<SidebarNavigation projectId={projectId} />}
        sidebarAriaLabel={tSidebar("ariaLabel")}
        header={header}
        hideHeader={isTicketDetailRoute}
      >
        {children}
      </DashboardShell>
      {filters}
    </>
  );
};

const ProjectShell = ({
  projectId,
  shellSnapshot,
  children,
  shellAdapter,
}: Props) => {
  return (
    <ProjectShellSnapshotProvider snapshot={shellSnapshot}>
      <ProjectPermissionsProvider projectId={projectId}>
        <ProjectShellContributionProvider>
          <ProjectShellContent
            projectId={projectId}
            shellAdapter={shellAdapter}
          >
            {children}
          </ProjectShellContent>
        </ProjectShellContributionProvider>
      </ProjectPermissionsProvider>
    </ProjectShellSnapshotProvider>
  );
};

export default ProjectShell;
