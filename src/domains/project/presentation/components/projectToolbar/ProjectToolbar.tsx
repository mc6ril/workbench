"use client";

import React, { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { getAccessibilityId } from "@/shared/a11y/constants";
import Button from "@/shared/design-system/button";
import { PlusIcon, SearchIcon } from "@/shared/design-system/icons";
import Input from "@/shared/design-system/input";
import Title from "@/shared/design-system/title";
import { useTranslation } from "@/shared/i18n";

import ProjectToolbarAssigneeFilters from "./components/ProjectToolbarAssigneeFilters";
import ProjectToolbarSuggestions from "./components/ProjectToolbarSuggestions";
import ProjectToolbarTools from "./components/ProjectToolbarTools";
import styles from "./ProjectToolbar.module.scss";
import type { ProjectToolbarProps } from "./ProjectToolbar.types";
import { useProjectToolbarSuggestions } from "./useProjectToolbarSuggestions";

import { useIsDesktopDashboardViewport } from "@/domains/project/presentation/components/dashboardShell/dashboardShell.helpers";

const ProjectToolbar = ({
  pageTitle,
  showSearch = true,
  hideTitleOnMobile = false,
  addActionType = null,
  addActionLabel,
  addActionAriaLabel,
  searchValue = "",
  onSearchChange,
  onAddClick,
  canAddAction = true,
  isPermissionsLoading = false,
  searchSuggestions = [],
  extraTools = [],
  assigneeFilters = [],
  selectedAssigneeFilterId = null,
  assigneeFiltersLabel = "",
  onAssigneeFilterChange,
}: ProjectToolbarProps) => {
  const router = useRouter();
  const isDesktopViewport = useIsDesktopDashboardViewport();
  const tNavbar = useTranslation("navigation.navbar");
  const tSearch = useTranslation("navigation.searchBar");
  const showAddAction = addActionType !== null;
  const hasAssigneeFilters = assigneeFilters.length > 0;
  const hasToolbarTools = extraTools.length > 0;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const hasSearchQuery = searchValue.trim().length > 0;
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const isMobileSearchExpanded = isMobileSearchOpen || hasSearchQuery;

  const addLabel = addActionLabel ?? tNavbar("addTicket");
  const addAriaLabel = addActionAriaLabel ?? tNavbar("addTicketAriaLabel");

  const navbarId = getAccessibilityId("project-toolbar");
  const pageTitleHeadingId = getAccessibilityId("project-toolbar-page-title");
  const searchId = getAccessibilityId("project-toolbar-search");
  const suggestionsId = getAccessibilityId("project-toolbar-suggestions");
  const searchLabel = tSearch("ariaLabel");

  const navigateToSuggestion = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router]
  );

  const handleSearchTriggerClick = useCallback(() => {
    if (isDesktopViewport) {
      return;
    }

    if (isMobileSearchExpanded) {
      setIsMobileSearchOpen(false);
      searchInputRef.current?.blur();
      onSearchChange?.("");
      return;
    }

    setIsMobileSearchOpen(true);
    window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  }, [isDesktopViewport, isMobileSearchExpanded, onSearchChange]);

  const searchClasses = [
    styles["project-toolbar__search"],
    !isDesktopViewport &&
      isMobileSearchExpanded &&
      styles["project-toolbar__search--mobile-open"],
  ]
    .filter(Boolean)
    .join(" ");

  const searchTriggerClasses = [
    styles["project-toolbar__tool"],
    isMobileSearchExpanded && styles["project-toolbar__tool--active"],
    styles["project-toolbar__search-trigger"],
  ]
    .filter(Boolean)
    .join(" ");

  const primaryRowClasses = [
    styles["project-toolbar__primary"],
    !isDesktopViewport &&
      isMobileSearchExpanded &&
      styles["project-toolbar__primary--mobile-search-expanded"],
  ]
    .filter(Boolean)
    .join(" ");

  const titleClasses = [
    styles["project-toolbar__title"],
    hideTitleOnMobile && styles["project-toolbar__title--mobile-hidden"],
  ]
    .filter(Boolean)
    .join(" ");

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
    enabled: showSearch,
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
      aria-labelledby={pageTitleHeadingId}
    >
      <div className={styles["project-toolbar__content"]}>
        <div className={primaryRowClasses}>
          <div className={styles["project-toolbar__left"]}>
            <Title
              variant="h1"
              id={pageTitleHeadingId}
              className={titleClasses}
            >
              {pageTitle}
            </Title>
            {hasToolbarTools ? (
              <ProjectToolbarTools extraTools={extraTools} />
            ) : null}
            {hasAssigneeFilters ? (
              <ProjectToolbarAssigneeFilters
                filters={assigneeFilters}
                selectedFilterId={selectedAssigneeFilterId}
                label={assigneeFiltersLabel}
                onChange={onAssigneeFilterChange}
              />
            ) : null}
          </div>

          <div className={styles["project-toolbar__actions"]}>
            {showSearch ? (
              <>
                {!isDesktopViewport ? (
                  <Button
                    label={searchLabel}
                    type="button"
                    variant="secondary"
                    onClick={handleSearchTriggerClick}
                    className={searchTriggerClasses}
                    title={searchLabel}
                    aria-controls={searchId}
                    aria-expanded={isMobileSearchExpanded}
                    aria-pressed={isMobileSearchExpanded}
                  >
                    <SearchIcon />
                  </Button>
                ) : null}
                <div ref={searchContainerRef} className={searchClasses}>
                  <div className={styles["project-toolbar__search-field"]}>
                    <Input
                      ref={searchInputRef}
                      id={searchId}
                      type="search"
                      placeholder={tSearch("placeholder")}
                      aria-label={searchLabel}
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
                  </div>
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
              </>
            ) : null}
            {showAddAction && !isPermissionsLoading && (
              <button
                type="button"
                className={styles["project-toolbar__add-button"]}
                onClick={onAddClick}
                disabled={!canAddAction}
                aria-label={addAriaLabel}
                title={addLabel}
              >
                <PlusIcon size={18} />
                <span className={styles["project-toolbar__add-label"]}>
                  {addLabel}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(ProjectToolbar);
