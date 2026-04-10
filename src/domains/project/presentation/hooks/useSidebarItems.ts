import { useMemo } from "react";

import { useTranslations } from "@/shared/i18n";

import type { SidebarItem } from "@/domains/project/presentation/components/sidebarNavigation/SidebarNavigation.types";
import {
  buildProjectViewHref,
  getProjectViewConfigsForSidebar,
} from "@/domains/project/presentation/navigation/projectViews.config";

export const useSidebarItems = (projectId: string): SidebarItem[] => {
  const t = useTranslations("navigation.sidebar");

  return useMemo((): SidebarItem[] => {
    const configs = getProjectViewConfigsForSidebar();

    return configs.map((config) => ({
      key: config.key,
      href: buildProjectViewHref(projectId, config.key),
      label: t(`items.${config.sidebarLabelKey}`),
      exactOnly: false,
      locked: false,
    }));
  }, [projectId, t]);
};
