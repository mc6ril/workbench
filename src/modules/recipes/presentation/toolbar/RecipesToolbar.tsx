"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import {
  FilterIcon,
  MealsIcon,
  ShoppingCartIcon,
} from "@/shared/design-system/icons";
import { useTranslation } from "@/shared/i18n";
import { useAppRouter } from "@/shared/navigation/useAppRouter";
import { normalizePath } from "@/shared/utils/routes";

import ProjectToolbar from "@/domains/project/presentation/components/projectToolbar/ProjectToolbar";
import type { ProjectToolbarExtraTool } from "@/domains/project/presentation/components/projectToolbar/ProjectToolbar.types";
import { useToolbarBreadcrumb } from "@/domains/project/presentation/contexts/ToolbarBreadcrumb";
import { useProjectPermissions } from "@/domains/project/presentation/providers/permissions/ProjectPermissionsProvider";
import { RECIPES_QUICK_LIST_TOOL_ID } from "@/modules/recipes/presentation/constants/quickListFeedback";
import {
  buildRecipeCreationRoute,
  buildRecipesCatalogRoute,
  buildRecipesShoppingRoute,
  RECIPES_ROUTE_SEGMENTS,
} from "@/modules/recipes/presentation/routes";
import { useRecipesCatalogFiltersStore } from "@/modules/recipes/presentation/stores";
import { useRecipesQuickListFeedbackStore } from "@/modules/recipes/presentation/stores/useRecipesQuickListFeedbackStore";

const SPECIAL_SEGMENTS = [
  RECIPES_ROUTE_SEGMENTS.QUICK_LIST,
  RECIPES_ROUTE_SEGMENTS.SHOPPING_LIST,
  RECIPES_ROUTE_SEGMENTS.NEW,
] as const;

type Props = {
  projectId: string;
};

const RecipesToolbar = ({ projectId }: Props) => {
  const router = useAppRouter();
  const pathname = usePathname();
  const tSidebar = useTranslation("navigation.sidebar");
  const tCatalog = useTranslation("pages.recipes.catalog");
  const tQuickList = useTranslation("pages.recipes.quickList");
  const tShopping = useTranslation("pages.recipes.shopping");
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
  const catalogRoute = buildRecipesCatalogRoute(projectId);
  const normalizedPathname = normalizePath(pathname);
  const isCatalogRoute = normalizedPathname === catalogRoute;
  const isQuickListRoute =
    normalizedPathname ===
    `${catalogRoute}/${RECIPES_ROUTE_SEGMENTS.QUICK_LIST}`;
  const isShoppingRoute =
    normalizedPathname ===
    `${catalogRoute}/${RECIPES_ROUTE_SEGMENTS.SHOPPING_LIST}`;
  const isRecipeDetailRoute =
    !isCatalogRoute &&
    normalizedPathname.startsWith(`${catalogRoute}/`) &&
    !SPECIAL_SEGMENTS.some((seg) =>
      normalizedPathname.startsWith(`${catalogRoute}/${seg}`)
    );

  const { childLabel, renderActions } = useToolbarBreadcrumb();
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

  const shoppingRoute = buildRecipesShoppingRoute(projectId);

  const toolbarExtraTools = useMemo<ProjectToolbarExtraTool[]>(() => {
    const tools: ProjectToolbarExtraTool[] = [];

    if (isCatalogRoute) {
      tools.push(
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
          icon: <MealsIcon size={16} />,
          iconOnly: true,
          badgeCount: quickListCount ?? 0,
          badgePulseKey: quickListBadgePulseKey,
          onClick: toggleQuickList,
          isActive: isQuickListOpen,
        }
      );
    }

    if (!isShoppingRoute) {
      tools.push({
        key: "recipes-shopping-list",
        label: tCatalog("toolbar.shoppingList"),
        ariaLabel: tCatalog("toolbar.shoppingListAriaLabel"),
        icon: <ShoppingCartIcon size={16} />,
        iconOnly: true,
        onClick: () => router.push(shoppingRoute),
      });
    }

    return tools;
  }, [
    activeFilterCount,
    isCatalogRoute,
    isFiltersOpen,
    isQuickListOpen,
    isShoppingRoute,
    quickListBadgePulseKey,
    quickListCount,
    router,
    shoppingRoute,
    tCatalog,
    toggleFilters,
    toggleQuickList,
  ]);

  if (isRecipeDetailRoute) {
    return (
      <ProjectToolbar
        pageTitle={pageTitle}
        breadcrumb={{
          parentLabel: pageTitle,
          parentHref: catalogRoute,
          childLabel,
          actions: renderActions?.(),
        }}
      />
    );
  }

  if (isQuickListRoute) {
    return (
      <ProjectToolbar
        pageTitle={pageTitle}
        breadcrumb={{
          parentLabel: pageTitle,
          parentHref: catalogRoute,
          childLabel: tQuickList("kicker"),
        }}
        extraTools={toolbarExtraTools}
      />
    );
  }

  if (isShoppingRoute) {
    return (
      <ProjectToolbar
        pageTitle={pageTitle}
        breadcrumb={{
          parentLabel: pageTitle,
          parentHref: catalogRoute,
          childLabel: tShopping("breadcrumbLabel"),
        }}
      />
    );
  }

  return (
    <ProjectToolbar
      pageTitle={pageTitle}
      showSearch={isCatalogRoute}
      addActionType={isCatalogRoute ? "recipe" : null}
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
