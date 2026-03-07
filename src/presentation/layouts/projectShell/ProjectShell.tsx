"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import AppFooter from "@/presentation/components/appFooter/AppFooter";
import Breadcrumbs from "@/presentation/components/breadcrumbs/Breadcrumbs";
import ProjectToolbar from "@/presentation/components/projectToolbar/ProjectToolbar";
import SidebarNavigation from "@/presentation/components/sidebarNavigation/SidebarNavigation";
import SkipLink from "@/presentation/components/skipLink/SkipLink";
import Button from "@/presentation/components/ui/Button";
import Modal from "@/presentation/components/ui/Modal";
import Select from "@/presentation/components/ui/Select";
import { useBoardConfiguration } from "@/presentation/hooks/board/useBoardConfiguration";
import { useEpics } from "@/presentation/hooks/epic/useEpics";
import DashboardShell from "@/presentation/layouts/dashboardShell/DashboardShell";
import { getProjectViewKeyFromPath } from "@/presentation/navigation/projectViews.config";
import { useFilterStore } from "@/presentation/stores/useFilterStore";
import { useSortStore } from "@/presentation/stores/useSortStore";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { useTranslation } from "@/shared/i18n";
import type {
  EpicProgressFilter,
  EpicSortField,
  SortDirection,
} from "@/shared/types";
import { buildProjectRoute } from "@/shared/utils/routes";

import styles from "./ProjectShell.module.scss";

type Props = {
  projectId: string;
  children: React.ReactNode;
};

const ProjectShell = ({ projectId, children }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tSkipLink = useTranslation("navigation.skipLink");
  const tSidebar = useTranslation("navigation.sidebar");
  const tBreadcrumbs = useTranslation("navigation.breadcrumbs");
  const tNavbar = useTranslation("navigation.navbar");
  const tTicketFilters = useTranslation("pages.backlog.filters");
  const mainContentId = getAccessibilityId("main-content");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const viewKey = useMemo(
    () => getProjectViewKeyFromPath(pathname, projectId),
    [pathname, projectId]
  );
  const isTicketView =
    viewKey === PROJECT_VIEWS.BACKLOG || viewKey === PROJECT_VIEWS.BOARD;

  const search = useFilterStore((state) => state.search);
  const setSearch = useFilterStore((state) => state.setSearch);
  const filters = useFilterStore((state) => state.filters);
  const setStatus = useFilterStore((state) => state.setStatus);
  const clearStatus = useFilterStore((state) => state.clearStatus);
  const setEpicId = useFilterStore((state) => state.setEpicId);
  const clearEpicId = useFilterStore((state) => state.clearEpicId);
  const resetSearch = useFilterStore((state) => state.resetSearch);
  const resetFilters = useFilterStore((state) => state.resetFilters);
  const sort = useSortStore((state) => state.sort);
  const setField = useSortStore((state) => state.setField);
  const setDirection = useSortStore((state) => state.setDirection);
  const resetSort = useSortStore((state) => state.resetSort);
  const { data: boardConfiguration } = useBoardConfiguration(projectId);
  const { data: epics = [] } = useEpics(projectId);

  const updateQueryParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value == null || value === "") {
          params.delete(key);
          continue;
        }
        params.set(key, value);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  const epicProgressFilter = useMemo<EpicProgressFilter>(() => {
    const value = searchParams.get("epicProgress");
    if (
      value === "all" ||
      value === "notStarted" ||
      value === "inProgress" ||
      value === "completed"
    ) {
      return value;
    }
    return "all";
  }, [searchParams]);

  const epicSortField = useMemo<EpicSortField>(() => {
    const value = searchParams.get("epicSortField");
    if (
      value === "name" ||
      value === "createdAt" ||
      value === "updatedAt" ||
      value === "progress"
    ) {
      return value;
    }
    return "updatedAt";
  }, [searchParams]);

  const epicSortDirection = useMemo<SortDirection>(() => {
    const value = searchParams.get("epicSortDirection");
    if (value === "asc" || value === "desc") {
      return value;
    }
    return "desc";
  }, [searchParams]);

  const statusOptions = useMemo(() => {
    const columns = boardConfiguration?.columns ?? [];
    return columns.map((column) => ({
      value: column.status,
      label: column.name,
    }));
  }, [boardConfiguration?.columns]);

  const epicOptions = useMemo(() => {
    return epics.map((epic) => ({
      value: epic.id,
      label: epic.name,
    }));
  }, [epics]);

  useEffect(() => {
    resetSearch();
    resetFilters();
    resetSort();
  }, [projectId, resetFilters, resetSearch, resetSort]);

  const handleFilterClick = useCallback(() => {
    setIsFilterModalOpen(true);
  }, []);

  const handleSortClick = useCallback(() => {
    setIsSortModalOpen(true);
  }, []);

  const handleAddClick = useCallback(() => {
    router.push(
      `${buildProjectRoute(projectId, PROJECT_VIEWS.BACKLOG)}?createTicket=1`
    );
  }, [projectId, router]);

  return (
    <>
      <SkipLink targetId={mainContentId} label={tSkipLink("label")} />

      <DashboardShell
        sidebar={<SidebarNavigation projectId={projectId} />}
        sidebarAriaLabel={tSidebar("ariaLabel")}
        header={
          <ProjectToolbar
            projectId={projectId}
            searchValue={search}
            onSearchChange={setSearch}
            onFilterClick={handleFilterClick}
            onSortClick={handleSortClick}
            onAddClick={handleAddClick}
          />
        }
        breadcrumbs={<Breadcrumbs projectId={projectId} />}
        breadcrumbsAriaLabel={tBreadcrumbs("ariaLabel")}
        footer={<AppFooter />}
      >
        {children}
      </DashboardShell>

      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => {
          setIsFilterModalOpen(false);
        }}
        title={tNavbar("filter")}
      >
        {isTicketView ? (
          <div className={styles["project-shell__modal-controls"]}>
            <Select
              label={tTicketFilters("statusLabel")}
              value={filters.status ?? ""}
              onChange={(event) => {
                const nextStatus = event.target.value;
                if (nextStatus) {
                  setStatus(nextStatus);
                  return;
                }
                clearStatus();
              }}
              options={[
                { value: "", label: "" },
                ...statusOptions.map((option) => ({
                  value: option.value,
                  label: option.label,
                })),
              ]}
            />
            <Select
              label={tTicketFilters("epicLabel")}
              value={filters.epicId ?? ""}
              onChange={(event) => {
                const nextEpicId = event.target.value;
                if (nextEpicId) {
                  setEpicId(nextEpicId);
                  return;
                }
                clearEpicId();
              }}
              options={[
                { value: "", label: "" },
                ...epicOptions.map((option) => ({
                  value: option.value,
                  label: option.label,
                })),
              ]}
            />
            <Button
              label={tTicketFilters("resetLabel")}
              onClick={resetFilters}
              variant="secondary"
            />
          </div>
        ) : (
          <div className={styles["project-shell__modal-controls"]}>
            <Select
              label={tNavbar("epicFilterLabel")}
              value={epicProgressFilter}
              onChange={(event) => {
                updateQueryParams({
                  epicProgress: event.target.value,
                });
              }}
              options={[
                { value: "all", label: tNavbar("epicFilterAll") },
                { value: "notStarted", label: tNavbar("epicFilterNotStarted") },
                { value: "inProgress", label: tNavbar("epicFilterInProgress") },
                { value: "completed", label: tNavbar("epicFilterCompleted") },
              ]}
            />
            <Button
              label={tNavbar("resetEpicFilters")}
              onClick={() => {
                updateQueryParams({ epicProgress: "all" });
              }}
              variant="secondary"
            />
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isSortModalOpen}
        onClose={() => {
          setIsSortModalOpen(false);
        }}
        title={tNavbar("sort")}
      >
        {isTicketView ? (
          <div className={styles["project-shell__modal-controls"]}>
            <Select
              label={tNavbar("ticketSortFieldLabel")}
              value={sort.field}
              onChange={(event) => {
                setField(event.target.value as typeof sort.field);
              }}
              options={[
                { value: "createdAt", label: tNavbar("ticketSortCreatedAt") },
                { value: "title", label: tNavbar("ticketSortTitle") },
                { value: "position", label: tNavbar("ticketSortPosition") },
                { value: "priority", label: tNavbar("ticketSortPriority") },
                { value: "dueDate", label: tNavbar("ticketSortDueDate") },
              ]}
            />
            <Select
              label={tNavbar("sortDirectionLabel")}
              value={sort.direction}
              onChange={(event) => {
                setDirection(event.target.value as typeof sort.direction);
              }}
              options={[
                { value: "asc", label: tNavbar("sortDirectionAsc") },
                { value: "desc", label: tNavbar("sortDirectionDesc") },
              ]}
            />
            <Button
              label={tNavbar("resetTicketSort")}
              onClick={resetSort}
              variant="secondary"
            />
          </div>
        ) : (
          <div className={styles["project-shell__modal-controls"]}>
            <Select
              label={tNavbar("epicSortFieldLabel")}
              value={epicSortField}
              onChange={(event) => {
                updateQueryParams({
                  epicSortField: event.target.value,
                });
              }}
              options={[
                { value: "updatedAt", label: tNavbar("epicSortUpdatedAt") },
                { value: "createdAt", label: tNavbar("epicSortCreatedAt") },
                { value: "name", label: tNavbar("epicSortName") },
                { value: "progress", label: tNavbar("epicSortProgress") },
              ]}
            />
            <Select
              label={tNavbar("sortDirectionLabel")}
              value={epicSortDirection}
              onChange={(event) => {
                updateQueryParams({
                  epicSortDirection: event.target.value,
                });
              }}
              options={[
                { value: "asc", label: tNavbar("sortDirectionAsc") },
                { value: "desc", label: tNavbar("sortDirectionDesc") },
              ]}
            />
            <Button
              label={tNavbar("resetEpicSort")}
              onClick={() => {
                updateQueryParams({
                  epicSortField: "updatedAt",
                  epicSortDirection: "desc",
                });
              }}
              variant="secondary"
            />
          </div>
        )}
      </Modal>
    </>
  );
};

export default ProjectShell;
