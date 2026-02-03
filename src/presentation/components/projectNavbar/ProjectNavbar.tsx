"use client";

import React, { useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";

import { FilterIcon, SortIcon } from "@/presentation/components/icons";
import { Button, Input } from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./ProjectNavbar.module.scss";

import {
  getProjectViewConfig,
  getProjectViewKeyFromPath,
} from "@/configs/projectRoutes";

type Props = {
  projectId: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onFilterClick?: () => void;
  onSortClick?: () => void;
  onAddClick?: () => void;
};

const ProjectNavbar = ({
  projectId,
  searchValue = "",
  onSearchChange,
  onFilterClick,
  onSortClick,
  onAddClick,
}: Props) => {
  const pathname = usePathname();
  const tSidebar = useTranslation("navigation.sidebar");
  const tNavbar = useTranslation("navigation.navbar");
  const tSearch = useTranslation("navigation.searchBar");

  const viewKey = useMemo(
    () => getProjectViewKeyFromPath(pathname, projectId),
    [pathname, projectId]
  );

  const viewConfig = useMemo(() => getProjectViewConfig(viewKey), [viewKey]);

  const boardTitle = useMemo(
    () => tSidebar(`items.${viewConfig.sidebarLabelKey}`),
    [tSidebar, viewConfig.sidebarLabelKey]
  );

  const { showFilterSort, addActionType } = viewConfig.navbar;
  const showAddAction = addActionType !== null;

  const addLabel =
    addActionType === "epic" ? tNavbar("addEpic") : tNavbar("addTicket");
  const addAriaLabel =
    addActionType === "epic"
      ? tNavbar("addEpicAriaLabel")
      : tNavbar("addTicketAriaLabel");

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange?.(e.target.value);
    },
    [onSearchChange]
  );

  const navbarId = getAccessibilityId("project-navbar");
  const searchId = getAccessibilityId("project-navbar-search");

  return (
    <header
      id={navbarId}
      className={styles["project-navbar"]}
      role="banner"
      aria-label={boardTitle}
    >
      <div className={styles["project-navbar__content"]}>
        <div className={styles["project-navbar__left"]}>
          <h1 className={styles["project-navbar__title"]}>{boardTitle}</h1>
          {showFilterSort && (
            <div className={styles["project-navbar__tools"]}>
              <button
                type="button"
                className={styles["project-navbar__tool"]}
                onClick={onFilterClick}
                aria-label={tNavbar("filterAriaLabel")}
                title={tNavbar("filter")}
              >
                <FilterIcon />
                <span className={styles["project-navbar__tool-label"]}>
                  {tNavbar("filter")}
                </span>
              </button>
              <button
                type="button"
                className={styles["project-navbar__tool"]}
                onClick={onSortClick}
                aria-label={tNavbar("sortAriaLabel")}
                title={tNavbar("sort")}
              >
                <SortIcon />
                <span className={styles["project-navbar__tool-label"]}>
                  {tNavbar("sort")}
                </span>
              </button>
            </div>
          )}
        </div>

        <div className={styles["project-navbar__right"]}>
          <div className={styles["project-navbar__search"]}>
            <Input
              id={searchId}
              type="search"
              placeholder={tSearch("placeholder")}
              aria-label={tSearch("ariaLabel")}
              value={searchValue}
              onChange={handleSearchChange}
              inline
            />
          </div>
          {showAddAction && (
            <Button
              label={addLabel}
              onClick={onAddClick}
              variant="primary"
              aria-label={addAriaLabel}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default React.memo(ProjectNavbar);
