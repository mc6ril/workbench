import Avatar from "@/shared/design-system/avatar";
import { UserProfileIcon } from "@/shared/design-system/icons";

import styles from "@/modules/board/presentation/components/projectToolbar/ProjectToolbar.module.scss";
import {
  PROJECT_TOOLBAR_UNASSIGNED_FILTER_ID,
  type ProjectToolbarAssigneeFilter,
} from "@/modules/board/presentation/components/projectToolbar/ProjectToolbar.types";

type Props = {
  filters: ProjectToolbarAssigneeFilter[];
  selectedFilterId?: string | null;
  label: string;
  onChange?: (filterId: string | null) => void;
};

const getFilterKey = (filter: ProjectToolbarAssigneeFilter): string => {
  if (filter.type === "unassigned") {
    return PROJECT_TOOLBAR_UNASSIGNED_FILTER_ID;
  }

  return filter.userId;
};

const ProjectToolbarAssigneeFilters = ({
  filters,
  selectedFilterId,
  label,
  onChange,
}: Props) => {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div
      className={styles["project-toolbar__assignee-filters"]}
      role="group"
      aria-label={label}
    >
      {filters.map((filter) => {
        const filterKey = getFilterKey(filter);
        const isSelected = filterKey === selectedFilterId;

        return (
          <button
            key={filterKey}
            type="button"
            className={[
              styles["project-toolbar__assignee-button"],
              isSelected &&
                styles["project-toolbar__assignee-button--selected"],
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => {
              onChange?.(isSelected ? null : filterKey);
            }}
            aria-label={`${label}: ${filter.label}`}
            aria-pressed={isSelected}
            title={filter.label}
          >
            {filter.type === "unassigned" ? (
              <span
                className={styles["project-toolbar__assignee-unassigned"]}
                aria-hidden
              >
                <UserProfileIcon size={14} />
              </span>
            ) : (
              <Avatar
                src={filter.avatarUrl}
                name={filter.label}
                size="sm"
                aria-label={filter.label}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ProjectToolbarAssigneeFilters;
