import { useMemo } from "react";

import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { useTranslations } from "@/shared/i18n";

import type { ProjectModuleKey } from "@/domains/project/core/domain/projectModule.types";
import type { SidebarItem } from "@/domains/project/presentation/components/sidebarNavigation/SidebarNavigation.types";
import {
  buildProjectViewHref,
  getProjectViewConfigsForSidebar,
  isProjectViewModuleEnabled,
} from "@/domains/project/presentation/navigation/projectViews.config";

export type UseSidebarItemsOptions = {
  enabledModules: readonly ProjectModuleKey[];
  isRecipesBoardVisible: boolean;
};

export const useSidebarItems = (
  projectId: string,
  options: UseSidebarItemsOptions
): SidebarItem[] => {
  const t = useTranslations("navigation.sidebar");

  const { enabledModules, isRecipesBoardVisible } = options;

  return useMemo((): SidebarItem[] => {
    const configs = getProjectViewConfigsForSidebar();

    return configs.flatMap((config) => {
      if (config.key === PROJECT_VIEWS.RECIPES && !isRecipesBoardVisible) {
        return [];
      }

      const enabled = isProjectViewModuleEnabled(config.key, enabledModules);

      return [
        {
          key: config.key,
          href: buildProjectViewHref(projectId, config.key),
          label: t(`items.${config.sidebarLabelKey}`),
          exactOnly: false,
          enabled,
        },
      ];
    });
  }, [enabledModules, isRecipesBoardVisible, projectId, t]);
};
