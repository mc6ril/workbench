type Option = {
  value: string;
  label: string;
};

export type BoardFiltersProps = {
  search: string;
  status?: string;
  epicId?: string;
  assigneeId?: string;
  statusOptions: Option[];
  epicOptions: Option[];
  assigneeOptions: Option[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value?: string) => void;
  onEpicChange: (value?: string) => void;
  onAssigneeChange: (value?: string) => void;
  onResetFilters?: () => void;
  className?: string;
};
