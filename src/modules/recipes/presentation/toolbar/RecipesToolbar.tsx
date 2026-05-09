"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { EyeIcon, EyeOffIcon, FilterIcon } from "@/shared/design-system/icons";
import { useTranslation } from "@/shared/i18n";
import { useAppRouter } from "@/shared/navigation/useAppRouter";
import { normalizePath } from "@/shared/utils/routes";

import ProjectToolbar from "@/domains/project/presentation/components/projectToolbar/ProjectToolbar";
import type { ProjectToolbarExtraTool } from "@/domains/project/presentation/components/projectToolbar/ProjectToolbar.types";
import { useProjectPermissions } from "@/domains/project/presentation/providers/permissions/ProjectPermissionsProvider";
import { RECIPES_QUICK_LIST_TOOL_ID } from "@/modules/recipes/presentation/constants/quickListFeedback";
import {
  buildRecipeCreationRoute,
  buildRecipesCatalogRoute,
} from "@/modules/recipes/presentation/routes";
import { useRecipesCatalogFiltersStore } from "@/modules/recipes/presentation/stores";
import { useRecipesQuickListFeedbackStore } from "@/modules/recipes/presentation/stores/useRecipesQuickListFeedbackStore";

type Props = {
  projectId: string;
};

const RecipesToolbar = ({ projectId }: Props) => {
  const router = useAppRouter();
  const pathname = usePathname();
  const tSidebar = useTranslation("navigation.sidebar");
  const tCatalog = useTranslation("pages.recipes.catalog");
  const pageTitle = tSidebar("items.recipes");
  const { canCreateTicket: canCreateRecipe } = useProjectPermissions();

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
  const quickListCount = useRecipesQuickListFeedbackStore(
    (state) => state.displayedCount
  );
  const quickListBadgePulseKey = useRecipesQuickListFeedbackStore(
    (state) => state.badgePulseKey
  );

  const [searchInput, setSearchInput] = useState(search);
  const isCatalogRoute =
    normalizePath(pathname) === buildRecipesCatalogRoute(projectId);
  const activeFilterCount = (search ? 1 : 0) + selectedFilterOptionIds.length;

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (!isCatalogRoute) return;
    const timeout = window.setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
      }
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [isCatalogRoute, search, searchInput, setSearch]);

  const handleAddClick = useCallback(() => {
    if (!canCreateRecipe) return;
    router.push(buildRecipeCreationRoute(projectId));
  }, [canCreateRecipe, projectId, router]);

  const toolbarExtraTools = useMemo<ProjectToolbarExtraTool[]>(() => {
    if (!isCatalogRoute) return [];
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
        domId: RECIPES_QUICK_LIST_TOOL_ID,
        label: tCatalog("toolbar.quickList"),
        ariaLabel: isQuickListOpen
          ? tCatalog("toolbar.quickListHideAriaLabel")
          : tCatalog("toolbar.quickListShowAriaLabel"),
        icon: isQuickListOpen ? (
          <EyeOffIcon size={16} />
        ) : (
          <EyeIcon size={16} />
        ),
        badgeCount: quickListCount ?? 0,
        badgePulseKey: quickListBadgePulseKey,
        onClick: toggleQuickList,
        isActive: isQuickListOpen,
      },
    ];
  }, [
    activeFilterCount,
    isCatalogRoute,
    isFiltersOpen,
    isQuickListOpen,
    quickListBadgePulseKey,
    quickListCount,
    tCatalog,
    toggleFilters,
    toggleQuickList,
  ]);

  return (
    <ProjectToolbar
      pageTitle={pageTitle}
      showSearch={isCatalogRoute}
      addActionType={isCatalogRoute ? "ticket" : null}
      addActionLabel={tCatalog("toolbar.addRecipe")}
      addActionAriaLabel={tCatalog("toolbar.addRecipeAriaLabel")}
      searchValue={isCatalogRoute ? searchInput : ""}
      onSearchChange={isCatalogRoute ? setSearchInput : undefined}
      onAddClick={handleAddClick}
      canAddAction={canCreateRecipe}
      extraTools={toolbarExtraTools}
    />
  );
};

export default RecipesToolbar;
