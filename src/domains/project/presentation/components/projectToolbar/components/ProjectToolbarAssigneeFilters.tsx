import { useEffect, useRef, useState } from "react";

import Avatar from "@/shared/design-system/avatar";
import { FilterIcon, UserProfileIcon } from "@/shared/design-system/icons";

import styles from "@/domains/project/presentation/components/projectToolbar/ProjectToolbar.module.scss";
import {
  PROJECT_TOOLBAR_UNASSIGNED_FILTER_ID,
  type ProjectToolbarAssigneeFilter,
} from "@/domains/project/presentation/components/projectToolbar/ProjectToolbar.types";

type Props = {
  filters: ProjectToolbarAssigneeFilter[];
  selectedFilterIds?: string[];
  label: string;
  disabled?: boolean;
  onChange?: (filterIds: string[]) => void;
};

const getFilterKey = (filter: ProjectToolbarAssigneeFilter): string => {
  if (filter.type === "unassigned") {
    return PROJECT_TOOLBAR_UNASSIGNED_FILTER_ID;
  }
  return filter.userId;
};

const ProjectToolbarAssigneeFilters = ({
  filters,
  selectedFilterIds = [],
  label,
  disabled = false,
  onChange,
}: Props) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!mobileContainerRef.current?.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isMobileMenuOpen]);

  if (filters.length === 0) {
    return null;
  }

  const handleToggle = (filterKey: string) => {
    if (disabled) return;
    const isSelected = selectedFilterIds.includes(filterKey);
    const next = isSelected
      ? selectedFilterIds.filter((id) => id !== filterKey)
      : [...selectedFilterIds, filterKey];
    onChange?.(next);
  };

  const activeCount = selectedFilterIds.length;

  const renderAvatarContent = (filter: ProjectToolbarAssigneeFilter) =>
    filter.type === "unassigned" ? (
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
    );

  return (
    <>
      {/* Desktop: overlapping avatars */}
      <div
        className={styles["project-toolbar__assignee-filters"]}
        role="group"
        aria-label={label}
      >
        {filters.map((filter, index) => {
          const filterKey = getFilterKey(filter);
          const isSelected = selectedFilterIds.includes(filterKey);

          return (
            <button
              key={filterKey}
              type="button"
              style={
                { "--btn-z": filters.length - index } as React.CSSProperties
              }
              className={[
                styles["project-toolbar__assignee-button"],
                isSelected &&
                  styles["project-toolbar__assignee-button--selected"],
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleToggle(filterKey)}
              aria-label={`${label}: ${filter.label}`}
              aria-disabled={disabled}
              aria-pressed={isSelected}
              title={filter.label}
            >
              {renderAvatarContent(filter)}
            </button>
          );
        })}
      </div>

      {/* Mobile: filter button + dropdown */}
      <div
        ref={mobileContainerRef}
        className={styles["project-toolbar__assignee-mobile"]}
      >
        <button
          type="button"
          className={[
            styles["project-toolbar__tool"],
            activeCount > 0 && styles["project-toolbar__tool--active"],
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => setIsMobileMenuOpen((v) => !v)}
          aria-label={label}
          aria-expanded={isMobileMenuOpen}
          aria-haspopup="listbox"
          title={label}
        >
          <FilterIcon size={14} />
          {activeCount > 0 && (
            <span className={styles["project-toolbar__tool-badge"]}>
              {activeCount}
            </span>
          )}
        </button>

        {isMobileMenuOpen && (
          <div
            className={styles["project-toolbar__assignee-dropdown"]}
            role="listbox"
            aria-label={label}
            aria-multiselectable="true"
          >
            {filters.map((filter) => {
              const filterKey = getFilterKey(filter);
              const isSelected = selectedFilterIds.includes(filterKey);

              return (
                <button
                  key={filterKey}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={[
                    styles["project-toolbar__assignee-dropdown-item"],
                    isSelected &&
                      styles[
                        "project-toolbar__assignee-dropdown-item--selected"
                      ],
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => {
                    handleToggle(filterKey);
                  }}
                  aria-label={filter.label}
                  aria-disabled={disabled}
                >
                  <span
                    className={
                      styles["project-toolbar__assignee-dropdown-avatar"]
                    }
                  >
                    {renderAvatarContent(filter)}
                  </span>
                  <span
                    className={
                      styles["project-toolbar__assignee-dropdown-label"]
                    }
                  >
                    {filter.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default ProjectToolbarAssigneeFilters;
