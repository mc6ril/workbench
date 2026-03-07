"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import { FilterIcon, SortIcon } from "@/presentation/components/icons";
import Button from "@/presentation/components/ui/Button";
import Input from "@/presentation/components/ui/Input";
import type { ProjectSearchSuggestion } from "@/presentation/hooks/project/useProjectSearchSuggestions";
import {
  getProjectViewConfig,
  getProjectViewKeyFromPath,
} from "@/presentation/navigation/projectViews.config";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./ProjectToolbar.module.scss";

type Props = {
  projectId: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onFilterClick?: () => void;
  onSortClick?: () => void;
  onAddClick?: () => void;
  searchSuggestions?: ProjectSearchSuggestion[];
};

const ProjectToolbar = ({
  projectId,
  searchValue = "",
  onSearchChange,
  onFilterClick,
  onSortClick,
  onAddClick,
  searchSuggestions = [],
}: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const tSidebar = useTranslation("navigation.sidebar");
  const tNavbar = useTranslation("navigation.navbar");
  const tSearch = useTranslation("navigation.searchBar");
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] =
    useState<number>(-1);

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

  const showSuggestions =
    isSuggestionsOpen &&
    searchValue.trim() !== "" &&
    searchSuggestions.length > 0;

  const closeSuggestions = useCallback(() => {
    setIsSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = e.target.value;
      onSearchChange?.(nextValue);

      if (nextValue.trim() === "") {
        closeSuggestions();
        return;
      }

      setIsSuggestionsOpen(true);
    },
    [closeSuggestions, onSearchChange]
  );

  const openSuggestions = useCallback(() => {
    if (searchValue.trim() === "" || searchSuggestions.length === 0) {
      return;
    }
    setIsSuggestionsOpen(true);
  }, [searchSuggestions.length, searchValue]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent): void => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        closeSuggestions();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [closeSuggestions]);

  const navbarId = getAccessibilityId("project-toolbar");
  const searchId = getAccessibilityId("project-toolbar-search");
  const suggestionsId = getAccessibilityId("project-toolbar-suggestions");

  const navigateToSuggestion = useCallback(
    (href: string) => {
      closeSuggestions();
      router.push(href);
    },
    [closeSuggestions, router]
  );

  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (searchSuggestions.length === 0) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        openSuggestions();
        setActiveSuggestionIndex((prev) =>
          prev < searchSuggestions.length - 1 ? prev + 1 : 0
        );
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        openSuggestions();
        setActiveSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : searchSuggestions.length - 1
        );
        return;
      }

      if (event.key === "Escape") {
        closeSuggestions();
        return;
      }

      if (event.key === "Enter" && activeSuggestionIndex >= 0) {
        event.preventDefault();
        const suggestion = searchSuggestions[activeSuggestionIndex];
        if (suggestion) {
          navigateToSuggestion(suggestion.href);
        }
      }
    },
    [
      activeSuggestionIndex,
      closeSuggestions,
      navigateToSuggestion,
      openSuggestions,
      searchSuggestions,
    ]
  );

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
            <div className={styles["project-toolbar__tools"]}>
              <button
                type="button"
                className={styles["project-toolbar__tool"]}
                onClick={onFilterClick}
                aria-label={tNavbar("filterAriaLabel")}
                title={tNavbar("filter")}
              >
                <FilterIcon />
                <span className={styles["project-toolbar__tool-label"]}>
                  {tNavbar("filter")}
                </span>
              </button>
              <button
                type="button"
                className={styles["project-toolbar__tool"]}
                onClick={onSortClick}
                aria-label={tNavbar("sortAriaLabel")}
                title={tNavbar("sort")}
              >
                <SortIcon />
                <span className={styles["project-toolbar__tool-label"]}>
                  {tNavbar("sort")}
                </span>
              </button>
            </div>
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
            {showSuggestions && (
              <div
                id={suggestionsId}
                role="listbox"
                className={styles["project-toolbar__search-results"]}
              >
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    id={`${suggestionsId}-option-${index}`}
                    key={suggestion.id}
                    type="button"
                    role="option"
                    aria-selected={index === activeSuggestionIndex}
                    className={[
                      styles["project-toolbar__search-result-item"],
                      index === activeSuggestionIndex
                        ? styles["project-toolbar__search-result-item--active"]
                        : undefined,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onMouseEnter={() => {
                      setActiveSuggestionIndex(index);
                    }}
                    onMouseDown={(event) => {
                      event.preventDefault();
                    }}
                    onClick={() => {
                      navigateToSuggestion(suggestion.href);
                    }}
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
            )}
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

export default React.memo(ProjectToolbar);
