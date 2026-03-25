import { FilterIcon, SortIcon } from "@/shared/design-system/icons";

import styles from "@/modules/board/presentation/components/projectToolbar/ProjectToolbar.module.scss";
import type { ProjectToolbarExtraTool } from "@/modules/board/presentation/components/projectToolbar/ProjectToolbar.types";

type Props = {
  isFilterActive: boolean;
  isSortActive: boolean;
  onFilterClick?: () => void;
  onSortClick?: () => void;
  filterLabel: string;
  filterAriaLabel: string;
  sortLabel: string;
  sortAriaLabel: string;
  extraTools?: ProjectToolbarExtraTool[];
};

const buildToolClassName = (isActive: boolean): string => {
  return [
    styles["project-toolbar__tool"],
    isActive ? styles["project-toolbar__tool--active"] : undefined,
  ]
    .filter(Boolean)
    .join(" ");
};

const ProjectToolbarTools = ({
  isFilterActive,
  isSortActive,
  onFilterClick,
  onSortClick,
  filterLabel,
  filterAriaLabel,
  sortLabel,
  sortAriaLabel,
  extraTools = [],
}: Props) => {
  return (
    <div className={styles["project-toolbar__tools"]}>
      <button
        type="button"
        className={buildToolClassName(isFilterActive)}
        onClick={onFilterClick}
        aria-label={filterAriaLabel}
        title={filterLabel}
        aria-pressed={isFilterActive}
      >
        <FilterIcon />
        <span className={styles["project-toolbar__tool-label"]}>
          {filterLabel}
        </span>
      </button>
      <button
        type="button"
        className={buildToolClassName(isSortActive)}
        onClick={onSortClick}
        aria-label={sortAriaLabel}
        title={sortLabel}
        aria-pressed={isSortActive}
      >
        <SortIcon />
        <span className={styles["project-toolbar__tool-label"]}>
          {sortLabel}
        </span>
      </button>
      {extraTools.map((tool) => (
        <button
          key={tool.key}
          type="button"
          className={buildToolClassName(tool.isActive ?? false)}
          onClick={tool.onClick}
          aria-label={tool.ariaLabel}
          title={tool.label}
          aria-pressed={tool.isActive ?? false}
        >
          {tool.icon ?? (
            <span className={styles["project-toolbar__tool-label"]}>
              {tool.label}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default ProjectToolbarTools;
