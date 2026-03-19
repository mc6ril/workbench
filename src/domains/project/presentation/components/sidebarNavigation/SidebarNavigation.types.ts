import type { ProjectViewKey } from "@/domains/project/presentation/navigation/projectViews.config";

export type SidebarNavigationProps = {
  projectId: string;
};

export type SidebarItem = {
  key: ProjectViewKey;
  href: string;
  label: string;
  exactOnly: boolean;
  locked: boolean;
  planBadge?: string;
};
