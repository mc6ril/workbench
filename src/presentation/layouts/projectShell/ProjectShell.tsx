"use client";

import React, { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

import AppFooter from "@/presentation/components/appFooter/AppFooter";
import Breadcrumbs from "@/presentation/components/breadcrumbs/Breadcrumbs";
import ProjectNavbar from "@/presentation/components/projectNavbar/ProjectNavbar";
import SidebarNavigation from "@/presentation/components/sidebarNavigation/SidebarNavigation";
import SkipLink from "@/presentation/components/skipLink/SkipLink";
import DashboardShell from "@/presentation/layouts/dashboardShell/DashboardShell";
import { useFilterStore } from "@/presentation/stores/useFilterStore";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { useTranslation } from "@/shared/i18n";
import { buildProjectRoute } from "@/shared/utils/routes";

type Props = {
  projectId: string;
  children: React.ReactNode;
};

const ProjectShell = ({ projectId, children }: Props) => {
  const router = useRouter();
  const tSkipLink = useTranslation("navigation.skipLink");
  const tSidebar = useTranslation("navigation.sidebar");
  const tBreadcrumbs = useTranslation("navigation.breadcrumbs");
  const mainContentId = getAccessibilityId("main-content");

  const search = useFilterStore((state) => state.search);
  const setSearch = useFilterStore((state) => state.setSearch);
  const resetSearch = useFilterStore((state) => state.resetSearch);
  const resetFilters = useFilterStore((state) => state.resetFilters);

  useEffect(() => {
    resetSearch();
    resetFilters();
  }, [projectId, resetFilters, resetSearch]);

  const handleFilterClick = useCallback(() => {
    // TODO: Open filter panel / modal
  }, []);

  const handleSortClick = useCallback(() => {
    // TODO: Open sort panel / modal
  }, []);

  const handleAddClick = useCallback(() => {
    router.push(
      `${buildProjectRoute(projectId, PROJECT_VIEWS.BACKLOG)}?createTicket=1`
    );
  }, [projectId, router]);

  return (
    <>
      <SkipLink targetId={mainContentId} label={tSkipLink("label")} />

      <DashboardShell
        sidebar={<SidebarNavigation projectId={projectId} />}
        sidebarAriaLabel={tSidebar("ariaLabel")}
        header={
          <ProjectNavbar
            projectId={projectId}
            searchValue={search}
            onSearchChange={setSearch}
            onFilterClick={handleFilterClick}
            onSortClick={handleSortClick}
            onAddClick={handleAddClick}
          />
        }
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
