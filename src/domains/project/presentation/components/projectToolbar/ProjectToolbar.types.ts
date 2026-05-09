import type { ReactNode } from "react";

export type ProjectToolbarSearchSuggestion = {
  id: string;
  label: string;
  href: string;
  isArchived: boolean;
};

export type ProjectToolbarAddActionType = "ticket";

export type ProjectToolbarExtraTool = {
  key: string;
  label: string;
  ariaLabel: string;
  icon?: ReactNode;
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

export type ProjectToolbarProps = {
  pageTitle: string;
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
  /** Selected member user id, {@link PROJECT_TOOLBAR_UNASSIGNED_FILTER_ID}, or null. */
  selectedAssigneeFilterId?: string | null;
  assigneeFiltersLabel?: string;
  onAssigneeFilterChange?: (filterId: string | null) => void;
};
