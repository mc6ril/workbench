import type { ProjectSearchSuggestion } from "@/domains/project-management/presentation/hooks/project/useProjectSearchSuggestions";

export type ProjectToolbarProps = {
  projectId: string;
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
