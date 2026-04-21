"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { PAGE_ROUTES, PROJECT_VIEWS } from "@/shared/constants/routes";
import Badge from "@/shared/design-system/badge";
import Button from "@/shared/design-system/button";
import Modal from "@/shared/design-system/modal";
import { useTranslations } from "@/shared/i18n";
import { useMarketingRoutes } from "@/shared/i18n/useMarketingRoutes";
import { useAppRouter } from "@/shared/navigation/useAppRouter";
import { markNavigationStart } from "@/shared/navigationPerf";

import SidebarNavigationList from "./components/SidebarNavigationList";
import SidebarProfileMenu from "./components/SidebarProfileMenu";
import styles from "./SidebarNavigation.module.scss";
import type {
  SidebarItem,
  SidebarNavigationProps,
} from "./SidebarNavigation.types";

import { useSignOut } from "@/domains/auth/presentation/hooks/user/useSignOut";
import { ProjectModuleKey } from "@/domains/project/core/domain/projectModule.types";
import { useEnableProjectModule } from "@/domains/project/presentation/hooks/useEnableProjectModule";
import { useSidebarItems } from "@/domains/project/presentation/hooks/useSidebarItems";
import { buildProjectViewHref } from "@/domains/project/presentation/navigation/projectViews.config";
import { useProjectShellSnapshot } from "@/domains/project/presentation/providers/ProjectShellSnapshotProvider";
import { useViewer } from "@/domains/viewer/presentation/hooks/useViewer";

const RECIPES_MODULE_TAGS = ["Repas", "Quick list", "Courses"];
const RECIPES_MODULE_POINTS = [
  "Catalogue filtrable avec quick list toujours visible.",
  "Détail recette calme, lisible et prêt pour la cuisine.",
  "Shopping list claire, pensée pour le rythme de la semaine.",
];

const SidebarNavigation = ({ projectId }: SidebarNavigationProps) => {
  const pathname = usePathname();
  const router = useAppRouter();
  const { pricing } = useMarketingRoutes();
  const t = useTranslations("navigation.sidebar");
  const signOutMutation = useSignOut();
  const enableProjectModuleMutation = useEnableProjectModule();
  const { enabledModules, isRecipesBoardVisible } = useProjectShellSnapshot();
  const { data: viewer } = useViewer();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isModuleLibraryOpen, setIsModuleLibraryOpen] = useState(false);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const navListId = getAccessibilityId("sidebar-navigation-list");
  const profileMenuId = getAccessibilityId("sidebar-profile-menu");
  const profileTriggerId = getAccessibilityId("sidebar-profile-trigger");
  const items = useSidebarItems(projectId, {
    enabledModules,
    isRecipesBoardVisible,
  });
  const recipesHref = buildProjectViewHref(projectId, PROJECT_VIEWS.RECIPES);
  const recipesItem = useMemo(() => {
    return items.find((item) => item.key === PROJECT_VIEWS.RECIPES) ?? null;
  }, [items]);
  const canShowRecipesModule = recipesItem !== null && !recipesItem.enabled;
  const canEnableRecipes =
    recipesItem !== null && !recipesItem.enabled && !recipesItem.locked;
  const recipesModuleStatusLabel =
    recipesItem?.locked && recipesItem.planBadge
      ? t("moduleLibrary.recipes.lockedStatus").replace(
          "{plan}",
          recipesItem.planBadge
        )
      : t("moduleLibrary.recipes.status");
  const recipesModuleCtaLabel =
    recipesItem?.locked && canShowRecipesModule
      ? t("moduleLibrary.recipes.upgradeCta")
      : t("moduleLibrary.recipes.cta");

  const handleLockedClick = useCallback(() => {
    const from = encodeURIComponent(pathname ?? PAGE_ROUTES.WORKSPACE);
    router.push(`${pricing}?from=${from}`);
  }, [router, pathname, pricing]);

  const displayNameValue = viewer?.displayName?.trim();
  const emailValue = viewer?.loginEmail?.trim();
  const profileIdentity = displayNameValue || emailValue;
  const displayName = profileIdentity ?? t("profile.userFallbackName");
  const workspaceHref = PAGE_ROUTES.WORKSPACE;
  const accountHref = `${PAGE_ROUTES.ACCOUNT}?from=${encodeURIComponent(pathname ?? PAGE_ROUTES.WORKSPACE)}`;

  const closeModuleLibrary = useCallback(() => {
    setIsModuleLibraryOpen(false);
  }, []);

  const handleAddTabClick = useCallback(() => {
    setIsModuleLibraryOpen(true);
  }, []);

  const prefetchProjectView = useCallback(
    (item: SidebarItem) => {
      if (item.locked) {
        return;
      }

      void router.prefetch(item.href);
    },
    [router]
  );

  const prefetchWorkspace = useCallback(() => {
    void router.prefetch(PAGE_ROUTES.WORKSPACE);
  }, [router]);

  const handleEnableRecipes = useCallback(() => {
    enableProjectModuleMutation.mutate(
      {
        projectId,
        moduleKey: ProjectModuleKey.RECIPES,
      },
      {
        onSuccess: () => {
          closeModuleLibrary();
          router.push(recipesHref);
        },
      }
    );
  }, [
    closeModuleLibrary,
    enableProjectModuleMutation,
    projectId,
    recipesHref,
    router,
  ]);

  const handleRecipesModuleAction = useCallback(() => {
    if (!recipesItem) {
      return;
    }

    if (recipesItem.locked) {
      handleLockedClick();
      return;
    }

    handleEnableRecipes();
  }, [handleEnableRecipes, handleLockedClick, recipesItem]);

  const handleProfileTriggerClick = useCallback(() => {
    setProfileMenuOpen((prev) => {
      return !prev;
    });
  }, []);

  const closeProfileMenu = useCallback(() => {
    setProfileMenuOpen(false);
  }, []);

  useEffect(() => {
    if (!profileMenuOpen) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        profileTriggerRef.current?.contains(target) === false &&
        profileMenuRef.current?.contains(target) === false
      ) {
        closeProfileMenu();
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeProfileMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileMenuOpen, closeProfileMenu]);

  const handleLogout = useCallback(() => {
    closeProfileMenu();
    signOutMutation.mutate();
  }, [closeProfileMenu, signOutMutation]);

  const handleSidebarItemClick = useCallback(
    (item: SidebarItem) => {
      if (item.locked) {
        handleLockedClick();
        return;
      }

      markNavigationStart(item.href, "sidebar");
    },
    [handleLockedClick]
  );

  const handleWorkspaceLinkClick = useCallback(() => {
    markNavigationStart(PAGE_ROUTES.WORKSPACE, "profile-menu");
    closeProfileMenu();
  }, [closeProfileMenu]);

  const handleAccountLinkClick = useCallback(() => {
    markNavigationStart(PAGE_ROUTES.ACCOUNT, "profile-menu");
    closeProfileMenu();
  }, [closeProfileMenu]);

  const getLockedAriaLabel = useCallback(
    (item: SidebarItem): string => {
      return t("locked.ariaLabel", {
        feature: item.label,
        plan: item.planBadge ?? "",
      });
    },
    [t]
  );
  const visibleItems = useMemo(() => {
    return items.filter((item) => item.enabled);
  }, [items]);

  return (
    <>
      <div className={styles["sidebar-navigation"]}>
        <SidebarNavigationList
          items={visibleItems}
          pathname={pathname}
          navListId={navListId}
          addTabLabel={t("addTab")}
          addTabAriaLabel={t("addTabAriaLabel")}
          getLockedAriaLabel={getLockedAriaLabel}
          onAddTabClick={handleAddTabClick}
          onItemClick={handleSidebarItemClick}
          onItemPrefetch={prefetchProjectView}
        />

        <SidebarProfileMenu
          profileTriggerRef={profileTriggerRef}
          profileMenuRef={profileMenuRef}
          profileTriggerId={profileTriggerId}
          profileMenuId={profileMenuId}
          profileMenuOpen={profileMenuOpen}
          displayName={displayName}
          avatarUrl={viewer?.avatarUrl}
          profileAriaLabel={t("profile.ariaLabel")}
          workspaceHref={workspaceHref}
          workspaceLabel={t("profile.backToWorkspace")}
          accountHref={accountHref}
          accountLabel={t("profile.profileSettings")}
          logoutLabel={t("profile.logout")}
          isSignOutPending={signOutMutation.isPending}
          onProfileTriggerClick={handleProfileTriggerClick}
          onWorkspacePrefetch={prefetchWorkspace}
          onWorkspaceLinkClick={handleWorkspaceLinkClick}
          onAccountLinkClick={handleAccountLinkClick}
          onLogout={handleLogout}
        />
      </div>

      <Modal
        isOpen={isModuleLibraryOpen}
        onClose={closeModuleLibrary}
        title={t("moduleLibrary.title")}
        size="full"
      >
        <div className={styles["sidebar-navigation__module-library"]}>
          <p className={styles["sidebar-navigation__module-library-copy"]}>
            {t("moduleLibrary.intro")}
          </p>

          {canShowRecipesModule ? (
            <div className={styles["sidebar-navigation__module-layout"]}>
              <div className={styles["sidebar-navigation__module-list"]}>
                <button
                  type="button"
                  className={styles["sidebar-navigation__module-list-item"]}
                  onClick={handleRecipesModuleAction}
                >
                  <div
                    className={styles["sidebar-navigation__module-card-header"]}
                  >
                    <div className={styles["sidebar-navigation__module-meta"]}>
                      <span
                        className={styles["sidebar-navigation__module-mark"]}
                        aria-hidden="true"
                      >
                        Rc
                      </span>
                      <div>
                        <h3
                          className={styles["sidebar-navigation__module-title"]}
                        >
                          Recipes
                        </h3>
                        <p
                          className={
                            styles["sidebar-navigation__module-subtitle"]
                          }
                        >
                          {t("moduleLibrary.recipes.subtitle")}
                        </p>
                      </div>
                    </div>
                    <Badge
                      label={recipesModuleStatusLabel}
                      variant={recipesItem?.locked ? "warning" : "info"}
                      size="small"
                    />
                  </div>

                  <p className={styles["sidebar-navigation__module-teaser"]}>
                    {t("moduleLibrary.recipes.teaser")}
                  </p>

                  <div className={styles["sidebar-navigation__module-tags"]}>
                    {RECIPES_MODULE_TAGS.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </button>
              </div>

              <div className={styles["sidebar-navigation__module-preview"]}>
                <div
                  className={styles["sidebar-navigation__module-preview-card"]}
                >
                  <div
                    className={
                      styles["sidebar-navigation__module-preview-topbar"]
                    }
                    aria-hidden="true"
                  >
                    <span />
                    <span />
                    <span />
                  </div>

                  <div>
                    <p
                      className={
                        styles["sidebar-navigation__module-preview-kicker"]
                      }
                    >
                      {t("moduleLibrary.preview.kicker")}
                    </p>
                    <h3
                      className={
                        styles["sidebar-navigation__module-preview-title"]
                      }
                    >
                      {t("moduleLibrary.preview.title")}
                    </h3>
                  </div>

                  <div
                    className={
                      styles["sidebar-navigation__module-preview-visual"]
                    }
                    aria-hidden="true"
                  >
                    <div
                      className={
                        styles["sidebar-navigation__module-preview-catalogue"]
                      }
                    >
                      <span />
                      <span />
                      <span />
                    </div>
                    <div
                      className={
                        styles["sidebar-navigation__module-preview-sidebar"]
                      }
                    >
                      <div />
                      <div />
                      <div />
                    </div>
                  </div>

                  <ul className={styles["sidebar-navigation__module-points"]}>
                    {RECIPES_MODULE_POINTS.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>

                  <div className={styles["sidebar-navigation__module-actions"]}>
                    <Button
                      label={recipesModuleCtaLabel}
                      onClick={handleRecipesModuleAction}
                      disabled={
                        canEnableRecipes &&
                        enableProjectModuleMutation.isPending
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles["sidebar-navigation__module-empty"]}>
              <Badge label={t("moduleLibrary.empty.badge")} variant="success" />
              <h3 className={styles["sidebar-navigation__module-empty-title"]}>
                {t("moduleLibrary.empty.title")}
              </h3>
              <p className={styles["sidebar-navigation__module-empty-copy"]}>
                {t("moduleLibrary.empty.description")}
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default React.memo(SidebarNavigation);
