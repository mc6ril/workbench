import type { ReactNode } from "react";

import type { ProjectSearchSuggestion } from "@/modules/board/presentation/hooks/project/useProjectSearchSuggestions";

export type ProjectToolbarAddActionType = "ticket";

export type ProjectToolbarExtraTool = {
  key: string;
  label: string;
  ariaLabel: string;
  icon?: ReactNode;
  onClick?: () => void;
  isActive?: boolean;
};

export type ProjectToolbarProps = {
  pageTitle: string;
  showSearch?: boolean;
  showFilterSort?: boolean;
  addActionType?: ProjectToolbarAddActionType | null;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onFilterClick?: () => void;
  onSortClick?: () => void;
  isFilterActive?: boolean;
  isSortActive?: boolean;
  onAddClick?: () => void;
  canAddAction?: boolean;
  isPermissionsLoading?: boolean;
  searchSuggestions?: ProjectSearchSuggestion[];
  extraTools?: ProjectToolbarExtraTool[];
};
