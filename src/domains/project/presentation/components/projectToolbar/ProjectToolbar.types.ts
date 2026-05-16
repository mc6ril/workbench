import type { ReactNode } from "react";

export type ProjectToolbarSearchSuggestion = {
  id: string;
  label: string;
  href: string;
  isArchived: boolean;
};

export type ProjectToolbarAddActionType = "ticket" | "recipe";

export type ProjectToolbarExtraTool = {
  key: string;
  label: string;
  ariaLabel: string;
  icon?: ReactNode;
  iconOnly?: boolean;
  domId?: string;
  badgeCount?: number;
  badgePulseKey?: number;
  onClick?: () => void;
  isActive?: boolean;
  disabled?: boolean;
};

/** Sentinel id for the "no assignees" filter (not a user UUID). */
export const PROJECT_TOOLBAR_UNASSIGNED_FILTER_ID = "unassigned" as const;

export type ProjectToolbarAssigneeFilter =
  | {
      type: "member";
      userId: string;
      label: string;
      avatarUrl: string | null;
    }
  | {
      type: "unassigned";
      label: string;
    };

export type ProjectToolbarBreadcrumb = {
  parentLabel: string;
  parentHref: string;
  childLabel: string | null;
  actions?: ReactNode;
};

export type ProjectToolbarProps = {
  pageTitle: string;
  breadcrumb?: ProjectToolbarBreadcrumb;
  showSearch?: boolean;
  hideTitleOnMobile?: boolean;
  addActionType?: ProjectToolbarAddActionType | null;
  addActionLabel?: string;
  addActionAriaLabel?: string;
  searchValue?: string;
  isSearchDisabled?: boolean;
  onSearchChange?: (value: string) => void;
  onAddClick?: () => void;
  canAddAction?: boolean;
  searchSuggestions?: ProjectToolbarSearchSuggestion[];
  extraTools?: ProjectToolbarExtraTool[];
  assigneeFilters?: ProjectToolbarAssigneeFilter[];
  areAssigneeFiltersDisabled?: boolean;
  /** Selected filter ids: member user ids and/or {@link PROJECT_TOOLBAR_UNASSIGNED_FILTER_ID}. */
  selectedAssigneeFilterIds?: string[];
  assigneeFiltersLabel?: string;
  onAssigneeFilterChange?: (filterIds: string[]) => void;
};
