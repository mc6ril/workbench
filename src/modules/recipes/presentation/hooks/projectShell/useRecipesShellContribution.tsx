"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { EyeIcon, EyeOffIcon } from "@/shared/design-system/icons";
import { useTranslation } from "@/shared/i18n";
import { normalizePath } from "@/shared/utils/routes";

import type { ProjectViewContribution } from "@/domains/project/presentation/layouts/projectShell/projectViewContribution";
import { useProjectPermissions } from "@/domains/project/presentation/providers/permissions/ProjectPermissionsProvider";
import ProjectToolbar from "@/modules/board/presentation/components/projectToolbar/ProjectToolbar";
import type { ProjectToolbarExtraTool } from "@/modules/board/presentation/components/projectToolbar/ProjectToolbar.types";
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
  const pageTitle = tSidebar("items.recipes");
  const { canCreateTicket, isLoading: isPermissionsLoading } =
    useProjectPermissions();
  const search = useRecipesCatalogFiltersStore((state) => state.search);
  const setSearch = useRecipesCatalogFiltersStore((state) => state.setSearch);
  const toggleQuickList = useRecipesCatalogFiltersStore(
    (state) => state.toggleQuickList
  );
  const isQuickListOpen = useRecipesCatalogFiltersStore(
    (state) => state.isQuickListOpen
  );
  const [searchInput, setSearchInput] = useState(search);
  const isCatalogRoute =
    normalizePath(pathname) === buildRecipesCatalogRoute(projectId);

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
    if (!canCreateTicket) {
      return;
    }

    router.push(buildRecipeCreationRoute(projectId));
  }, [canCreateTicket, projectId, router]);

  const toolbarExtraTools = useMemo<ProjectToolbarExtraTool[]>(() => {
    if (!isCatalogRoute) {
      return [];
    }

    return [
      {
        key: "recipes-quick-list",
        label: "Quick list",
        ariaLabel: isQuickListOpen
          ? "Masquer la quick list"
          : "Afficher la quick list",
        icon: isQuickListOpen ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />,
        onClick: toggleQuickList,
        isActive: isQuickListOpen,
      },
    ];
  }, [isCatalogRoute, isQuickListOpen, toggleQuickList]);

  return useMemo<ProjectViewContribution>(() => {
    return {
      toolbar: (
        <ProjectToolbar
          pageTitle={pageTitle}
          showSearch={isCatalogRoute}
          addActionType="ticket"
          addActionLabel="Ajouter une recette"
          addActionAriaLabel="Créer une nouvelle recette"
          searchValue={isCatalogRoute ? searchInput : ""}
          onSearchChange={isCatalogRoute ? setSearchInput : undefined}
          onAddClick={handleAddClick}
          canAddAction={canCreateTicket}
          isPermissionsLoading={isPermissionsLoading}
          extraTools={toolbarExtraTools}
        />
      ),
    };
  }, [
    canCreateTicket,
    handleAddClick,
    isCatalogRoute,
    isPermissionsLoading,
    pageTitle,
    searchInput,
    toolbarExtraTools,
  ]);
};
