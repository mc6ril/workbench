"use client";

import React, { useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getAccessibilityId } from "@/shared/a11y/constants";
import Button from "@/shared/design-system/Button";
import Input from "@/shared/design-system/Input";
import { useTranslation } from "@/shared/i18n";

import ProjectToolbarSuggestions from "./components/ProjectToolbarSuggestions";
import ProjectToolbarTools from "./components/ProjectToolbarTools";
import styles from "./ProjectToolbar.module.scss";
import type { ProjectToolbarProps } from "./ProjectToolbar.types";

import { useProjectToolbarSuggestions } from "@/domains/project-management/presentation/hooks/project/useProjectToolbarSuggestions";
import {
  getProjectViewConfig,
  getProjectViewKeyFromPath,
} from "@/domains/project/presentation/navigation/projectViews.config";

const ProjectToolbar = ({
  projectId,
  searchValue = "",
  onSearchChange,
  onFilterClick,
  onSortClick,
  isFilterActive = false,
  isSortActive = false,
  onAddClick,
  canAddAction = true,
  isPermissionsLoading = false,
  searchSuggestions = [],
}: ProjectToolbarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const tSidebar = useTranslation("navigation.sidebar");
  const tNavbar = useTranslation("navigation.navbar");
  const tSearch = useTranslation("navigation.searchBar");

  const viewKey = useMemo(
    () => getProjectViewKeyFromPath(pathname, projectId),
    [pathname, projectId]
  );

  const viewConfig = useMemo(() => getProjectViewConfig(viewKey), [viewKey]);

  const pageTitle = useMemo(
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

  const navbarId = getAccessibilityId("project-toolbar");
  const searchId = getAccessibilityId("project-toolbar-search");
  const suggestionsId = getAccessibilityId("project-toolbar-suggestions");

  const navigateToSuggestion = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router]
  );

  const {
    searchContainerRef,
    showSuggestions,
    activeSuggestionIndex,
    handleSearchChange,
    handleSearchKeyDown,
    openSuggestions,
    handleSuggestionMouseEnter,
    handleSuggestionMouseDown,
    handleSuggestionSelect,
  } = useProjectToolbarSuggestions({
    searchValue,
    searchSuggestions,
    onSearchChange,
    onSuggestionSelect: navigateToSuggestion,
  });

  return (
    <header
      id={navbarId}
      className={styles["project-toolbar"]}
      role="banner"
      aria-label={pageTitle}
    >
      <div className={styles["project-toolbar__content"]}>
        <div className={styles["project-toolbar__left"]}>
          <h1 className={styles["project-toolbar__title"]}>{pageTitle}</h1>
          {showFilterSort && (
            <ProjectToolbarTools
              isFilterActive={isFilterActive}
              isSortActive={isSortActive}
              onFilterClick={onFilterClick}
              onSortClick={onSortClick}
              filterLabel={tNavbar("filter")}
              filterAriaLabel={tNavbar("filterAriaLabel")}
              sortLabel={tNavbar("sort")}
              sortAriaLabel={tNavbar("sortAriaLabel")}
            />
          )}
        </div>

        <div className={styles["project-toolbar__right"]}>
          <div
            ref={searchContainerRef}
            className={styles["project-toolbar__search"]}
          >
            <Input
              id={searchId}
              type="search"
              placeholder={tSearch("placeholder")}
              aria-label={tSearch("ariaLabel")}
              role="combobox"
              aria-autocomplete="list"
              aria-controls={suggestionsId}
              aria-expanded={showSuggestions}
              aria-activedescendant={
                activeSuggestionIndex >= 0
                  ? `${suggestionsId}-option-${activeSuggestionIndex}`
                  : undefined
              }
              value={searchValue}
              onChange={handleSearchChange}
              onFocus={openSuggestions}
              onKeyDown={handleSearchKeyDown}
              inline
            />
            {showSuggestions ? (
              <ProjectToolbarSuggestions
                suggestionsId={suggestionsId}
                searchSuggestions={searchSuggestions}
                activeSuggestionIndex={activeSuggestionIndex}
                onSuggestionMouseEnter={handleSuggestionMouseEnter}
                onSuggestionMouseDown={handleSuggestionMouseDown}
                onSuggestionSelect={handleSuggestionSelect}
              />
            ) : null}
          </div>
          {showAddAction && !isPermissionsLoading && (
            <Button
              label={addLabel}
              onClick={onAddClick}
              variant="primary"
              disabled={!canAddAction}
              aria-label={addAriaLabel}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default React.memo(ProjectToolbar);
