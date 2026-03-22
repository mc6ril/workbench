import type { ProjectSearchSuggestion } from "@/modules/board/presentation/hooks/project/useProjectSearchSuggestions";

export type ProjectToolbarAddActionType = "ticket" | "epic";

export type ProjectToolbarProps = {
  pageTitle: string;
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
};
