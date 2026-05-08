"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { useTranslations } from "@/shared/i18n";
import { normalizePath } from "@/shared/utils/routes";

import ProjectToolbar from "@/domains/project/presentation/components/projectToolbar/ProjectToolbar";
import {
  getProjectViewConfig,
  getProjectViewKeyFromPath,
} from "@/domains/project/presentation/navigation/projectViews.config";
import BoardToolbar from "@/modules/board/presentation/toolbar/BoardToolbar";
import RecipesToolbar from "@/modules/recipes/presentation/toolbar/RecipesToolbar";

type Props = {
  projectId: string;
};

const ProjectToolbarSlot = ({ projectId }: Props) => {
  const pathname = usePathname();
  const tSidebar = useTranslations("navigation.sidebar");
  const viewKey = useMemo(
    () => getProjectViewKeyFromPath(normalizePath(pathname), projectId),
    [pathname, projectId]
  );

  if (viewKey === PROJECT_VIEWS.BOARD) {
    return <BoardToolbar projectId={projectId} />;
  }

  if (viewKey === PROJECT_VIEWS.RECIPES) {
    return <RecipesToolbar projectId={projectId} />;
  }

  const viewConfig = getProjectViewConfig(viewKey);
  const pageTitle = tSidebar(`items.${viewConfig.sidebarLabelKey}`);

  return <ProjectToolbar pageTitle={pageTitle} showSearch={viewConfig.navbar.showSearch} />;
};

export default ProjectToolbarSlot;
