"use client";

import React, { useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import { FilterIcon, SortIcon } from "@/presentation/components/icons";
import Button from "@/presentation/components/ui/Button";
import Input from "@/presentation/components/ui/Input";
import { useEpics } from "@/presentation/hooks/epic/useEpics";
import { useProject } from "@/presentation/hooks/project/useProject";
import { useTickets } from "@/presentation/hooks/ticket/useTickets";
import {
  getProjectViewConfig,
  getProjectViewKeyFromPath,
} from "@/presentation/navigation/projectViews.config";
import { useFilterStore } from "@/presentation/stores/useFilterStore";
import { useSortStore } from "@/presentation/stores/useSortStore";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { useTranslation } from "@/shared/i18n";
import { filterEpicsBySearch } from "@/shared/utils/epicUtils";
import { buildProjectRoute } from "@/shared/utils/routes";
import {
  buildTicketCode,
  filterTicketsBySearch,
} from "@/shared/utils/ticketUtils";

import styles from "./ProjectToolbar.module.scss";

type Props = {
  projectId: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onFilterClick?: () => void;
  onSortClick?: () => void;
  onAddClick?: () => void;
};

type SearchSuggestion = {
  id: string;
  label: string;
  href: string;
};

const ProjectToolbar = ({
  projectId,
  searchValue = "",
  onSearchChange,
  onFilterClick,
  onSortClick,
  onAddClick,
}: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const tSidebar = useTranslation("navigation.sidebar");
  const tNavbar = useTranslation("navigation.navbar");
  const tSearch = useTranslation("navigation.searchBar");
  const filters = useFilterStore((state) => state.filters);
  const sort = useSortStore((state) => state.sort);

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

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange?.(e.target.value);
    },
    [onSearchChange]
  );

  const effectiveTicketFilters = useMemo(() => {
    if (viewKey === PROJECT_VIEWS.BACKLOG) {
      return {
        ...filters,
        parentId: null,
      };
    }

    if (viewKey === PROJECT_VIEWS.BOARD) {
      return filters;
    }

    return undefined;
  }, [filters, viewKey]);

  const ticketSearchProjectId =
    viewKey === PROJECT_VIEWS.BACKLOG || viewKey === PROJECT_VIEWS.BOARD
      ? projectId
      : "";
  const epicSearchProjectId = viewKey === PROJECT_VIEWS.EPICS ? projectId : "";

  const { data: project } = useProject(ticketSearchProjectId);
  const { data: tickets = [] } = useTickets(
    ticketSearchProjectId,
    effectiveTicketFilters,
    sort
  );
  const { data: epics = [] } = useEpics(epicSearchProjectId);

  const projectShortCode = project?.shortCode;

  const searchSuggestions = useMemo<SearchSuggestion[]>(() => {
    const searchTerm = searchValue.trim();
    if (searchTerm === "") {
      return [];
    }

    if (viewKey === PROJECT_VIEWS.EPICS) {
      return filterEpicsBySearch(epics, searchTerm)
        .slice(0, 6)
        .map((epic) => ({
          id: epic.id,
          label: epic.name,
          href: `${buildProjectRoute(projectId, PROJECT_VIEWS.EPICS)}#epic-${epic.id}`,
        }));
    }

    if (viewKey === PROJECT_VIEWS.BACKLOG || viewKey === PROJECT_VIEWS.BOARD) {
      const targetView =
        viewKey === PROJECT_VIEWS.BACKLOG
          ? PROJECT_VIEWS.BACKLOG
          : PROJECT_VIEWS.BOARD;

      return filterTicketsBySearch(tickets, searchTerm, projectShortCode)
        .slice(0, 6)
        .map((ticket) => ({
          id: ticket.id,
          label: `${buildTicketCode(projectShortCode, ticket.codeNumber) ?? ticket.codeNumber} ${ticket.title}`,
          href: `${buildProjectRoute(projectId, targetView)}?ticket=${ticket.id}`,
        }));
    }

    return [];
  }, [epics, projectId, projectShortCode, searchValue, tickets, viewKey]);

  const navbarId = getAccessibilityId("project-toolbar");
  const searchId = getAccessibilityId("project-toolbar-search");

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
          <div className={styles["project-toolbar__search"]}>
            <Input
              id={searchId}
              type="search"
              placeholder={tSearch("placeholder")}
              aria-label={tSearch("ariaLabel")}
              value={searchValue}
              onChange={handleSearchChange}
              inline
            />
            {searchSuggestions.length > 0 && (
              <div className={styles["project-toolbar__search-results"]}>
                {searchSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    className={styles["project-toolbar__search-result-item"]}
                    onClick={() => {
                      router.push(suggestion.href);
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
