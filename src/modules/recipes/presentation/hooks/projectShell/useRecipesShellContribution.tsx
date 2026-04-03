"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { EyeIcon, EyeOffIcon, FilterIcon } from "@/shared/design-system/icons";
import { useTranslation } from "@/shared/i18n";
import { normalizePath } from "@/shared/utils/routes";

import ProjectToolbar from "@/domains/project/presentation/components/projectToolbar/ProjectToolbar";
import type { ProjectToolbarExtraTool } from "@/domains/project/presentation/components/projectToolbar/ProjectToolbar.types";
import type { ProjectViewContribution } from "@/domains/project/presentation/layouts/projectShell/projectViewContribution";
import { useProjectPermissions } from "@/domains/project/presentation/providers/permissions/ProjectPermissionsProvider";
import {
  buildRecipeCreationRoute,
  buildRecipesCatalogRoute,
} from "@/modules/recipes/presentation/routes";
import { useRecipesCatalogFiltersStore } from "@/modules/recipes/presentation/stores";

export const useRecipesShellContribution = (
  projectId: string
): ProjectViewContribution => {
  const router = useRouter();
  const pathname = usePathname();
  const tSidebar = useTranslation("navigation.sidebar");
  const tCatalog = useTranslation("pages.recipes.catalog");
  const pageTitle = tSidebar("items.recipes");
  const { canCreateTicket: canCreateRecipe, isLoading: isPermissionsLoading } =
    useProjectPermissions();
  const search = useRecipesCatalogFiltersStore((state) => state.search);
  const setSearch = useRecipesCatalogFiltersStore((state) => state.setSearch);
  const toggleQuickList = useRecipesCatalogFiltersStore(
    (state) => state.toggleQuickList
  );
  const toggleFilters = useRecipesCatalogFiltersStore(
    (state) => state.toggleFilters
  );
  const isQuickListOpen = useRecipesCatalogFiltersStore(
    (state) => state.isQuickListOpen
  );
  const isFiltersOpen = useRecipesCatalogFiltersStore(
    (state) => state.isFiltersOpen
  );
  const selectedFilterOptionIds = useRecipesCatalogFiltersStore(
    (state) => state.selectedFilterOptionIds
  );
  const [searchInput, setSearchInput] = useState(search);
  const isCatalogRoute =
    normalizePath(pathname) === buildRecipesCatalogRoute(projectId);
  const activeFilterCount = (search ? 1 : 0) + selectedFilterOptionIds.length;

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (!isCatalogRoute) {
      return;
    }

    const timeout = window.setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isCatalogRoute, search, searchInput, setSearch]);

  const handleAddClick = useCallback(() => {
    if (!canCreateRecipe) {
      return;
    }

    router.push(buildRecipeCreationRoute(projectId));
  }, [canCreateRecipe, projectId, router]);

  const toolbarExtraTools = useMemo<ProjectToolbarExtraTool[]>(() => {
    if (!isCatalogRoute) {
      return [];
    }

    return [
      {
        key: "recipes-filters",
        label:
          activeFilterCount > 0
            ? `${tCatalog("toolbar.filter")} (${activeFilterCount})`
            : tCatalog("toolbar.filter"),
        ariaLabel: tCatalog("toolbar.filterAriaLabel"),
        icon: <FilterIcon size={16} />,
        onClick: toggleFilters,
        isActive: isFiltersOpen,
      },
      {
        key: "recipes-quick-list",
        label: tCatalog("toolbar.quickList"),
        ariaLabel: isQuickListOpen
          ? tCatalog("toolbar.quickListHideAriaLabel")
          : tCatalog("toolbar.quickListShowAriaLabel"),
        icon: isQuickListOpen ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />,
        onClick: toggleQuickList,
        isActive: isQuickListOpen,
      },
    ];
  }, [
    activeFilterCount,
    isCatalogRoute,
    isFiltersOpen,
    isQuickListOpen,
    tCatalog,
    toggleFilters,
    toggleQuickList,
  ]);

  return useMemo<ProjectViewContribution>(() => {
    return {
      toolbar: (
        <ProjectToolbar
          pageTitle={pageTitle}
          showSearch={isCatalogRoute}
          addActionType="ticket"
          addActionLabel={tCatalog("toolbar.addRecipe")}
          addActionAriaLabel={tCatalog("toolbar.addRecipeAriaLabel")}
          searchValue={isCatalogRoute ? searchInput : ""}
          onSearchChange={isCatalogRoute ? setSearchInput : undefined}
          onAddClick={handleAddClick}
          canAddAction={canCreateRecipe}
          isPermissionsLoading={isPermissionsLoading}
          extraTools={toolbarExtraTools}
        />
      ),
    };
  }, [
    canCreateRecipe,
    handleAddClick,
    isCatalogRoute,
    isPermissionsLoading,
    pageTitle,
    searchInput,
    tCatalog,
    toolbarExtraTools,
  ]);
};
