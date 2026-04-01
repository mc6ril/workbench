"use client";

import { useMemo } from "react";

import { useTranslation } from "@/shared/i18n";

import type { ProjectViewContribution } from "@/domains/project/presentation/layouts/projectShell/projectViewContribution";
import ProjectToolbar from "@/modules/board/presentation/components/projectToolbar/ProjectToolbar";

export const useRecipesShellContribution = (): ProjectViewContribution => {
  const tSidebar = useTranslation("navigation.sidebar");
  const pageTitle = tSidebar("items.recipes");

  return useMemo<ProjectViewContribution>(() => {
    return {
      toolbar: (
        <ProjectToolbar
          pageTitle={pageTitle}
          showSearch={false}
          addActionType={null}
        />
      ),
    };
  }, [pageTitle]);
};
