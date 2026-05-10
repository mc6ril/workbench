import React, { useCallback, useRef, useState } from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";
import Button from "@/shared/design-system/button";
import { PlusIcon, SearchIcon } from "@/shared/design-system/icons";
import Input from "@/shared/design-system/input";
import Link from "@/shared/design-system/link";
import Title from "@/shared/design-system/title";
import { useTranslations } from "@/shared/i18n";
import { useAppRouter } from "@/shared/navigation/useAppRouter";

import ProjectToolbarAssigneeFilters from "./components/ProjectToolbarAssigneeFilters";
import ProjectToolbarSuggestions from "./components/ProjectToolbarSuggestions";
import ProjectToolbarTools from "./components/ProjectToolbarTools";
import styles from "./ProjectToolbar.module.scss";
import type { ProjectToolbarProps } from "./ProjectToolbar.types";
import { useProjectToolbarSuggestions } from "./useProjectToolbarSuggestions";

import { useIsDesktopDashboardViewport } from "@/domains/project/presentation/components/dashboardShell/dashboardShell.helpers";

const ProjectToolbar = ({
  pageTitle,
  breadcrumb,
  showSearch = true,
  hideTitleOnMobile = false,
  addActionType = null,
  addActionLabel,
  addActionAriaLabel,
  searchValue = "",
  isSearchDisabled = false,
  onSearchChange,
  onAddClick,
  canAddAction = true,
  searchSuggestions = [],
  extraTools = [],
  assigneeFilters = [],
  areAssigneeFiltersDisabled = false,
  selectedAssigneeFilterId = null,
  assigneeFiltersLabel = "",
  onAssigneeFilterChange,
}: ProjectToolbarProps) => {
  const router = useAppRouter();
  const isDesktopViewport = useIsDesktopDashboardViewport();
  const tNavbar = useTranslations("navigation.navbar");
  const tSearch = useTranslations("navigation.searchBar");
  const showAddAction = addActionType !== null;
  const hasAssigneeFilters = assigneeFilters.length > 0;
  const hasToolbarTools = extraTools.length > 0;
  const isAddActionDisabled = !canAddAction;
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

  const handleAddActionClick = useCallback(() => {
    if (!canAddAction) {
      return;
    }

    onAddClick?.();
  }, [canAddAction, onAddClick]);

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

  const addButtonClasses = styles["project-toolbar__add-button"];

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
    enabled: showSearch && !isSearchDisabled,
    searchValue,
    searchSuggestions,
    onSearchChange,
    onSuggestionSelect: navigateToSuggestion,
  });

  if (breadcrumb) {
    return (
      <header id={navbarId} className={styles["project-toolbar"]} role="banner">
        <div className={styles["project-toolbar__content"]}>
          <nav
            className={styles["project-toolbar__breadcrumb"]}
            aria-label="breadcrumb"
          >
            <Link
              href={breadcrumb.parentHref}
              unstyled
              className={styles["project-toolbar__breadcrumb-parent"]}
            >
              {breadcrumb.parentLabel}
            </Link>
            {breadcrumb.childLabel ? (
              <>
                <span
                  className={styles["project-toolbar__breadcrumb-separator"]}
                  aria-hidden
                >
                  &gt;
                </span>
                <span className={styles["project-toolbar__breadcrumb-child"]}>
                  {breadcrumb.childLabel}
                </span>
              </>
            ) : null}
          </nav>
        </div>
      </header>
    );
  }

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
                disabled={areAssigneeFiltersDisabled}
                onChange={onAssigneeFilterChange}
              />
            ) : null}
          </div>

          <div className={styles["project-toolbar__actions"]}>
            {showSearch ? (
              <>
                {!isDesktopViewport && !isSearchDisabled ? (
                  <Button
                    label={searchLabel}
                    type="button"
                    variant="secondary"
                    onClick={handleSearchTriggerClick}
                    disabled={isSearchDisabled}
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
                      aria-disabled={isSearchDisabled}
                      tabIndex={isSearchDisabled ? -1 : undefined}
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
            {showAddAction && (
              <button
                type="button"
                className={addButtonClasses}
                onClick={handleAddActionClick}
                disabled={isAddActionDisabled}
                aria-disabled={!canAddAction}
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
