import { PROJECT_VIEWS } from "@/shared/constants/routes";

/**
 * Project view keys. "home" is the project root; others match path segments.
 * Single source of truth for project-scoped routes and navbar behavior.
 */
export const PROJECT_VIEW_KEYS = Object.freeze([
  "home",
  PROJECT_VIEWS.BACKLOG,
  PROJECT_VIEWS.BOARD,
  PROJECT_VIEWS.EPICS,
  PROJECT_VIEWS.SETTINGS,
]);

export type ProjectViewKey = (typeof PROJECT_VIEW_KEYS)[number];

/** Type of add action in navbar (ticket vs epic). */
export type NavbarAddActionType = "ticket" | "epic";

export type ProjectViewNavbarConfig = {
  /** Whether to show filter and sort buttons. */
  showFilterSort: boolean;
  /** Add button type; null hides the add button. */
  addActionType: NavbarAddActionType | null;
};

export type ProjectViewConfig = {
  key: ProjectViewKey;
  /** Path segment (empty for home). Used to build href: /{projectId}/{path} */
  path: string;
  /** i18n key suffix for sidebar label: navigation.sidebar.items.{sidebarLabelKey} */
  sidebarLabelKey: string;
  navbar: ProjectViewNavbarConfig;
};

const HOME_KEY: ProjectViewKey = "home";

const PROJECT_VIEW_CONFIGS: Record<ProjectViewKey, ProjectViewConfig> =
  Object.freeze({
    [HOME_KEY]: {
      key: HOME_KEY,
      path: "",
      sidebarLabelKey: "home",
      navbar: { showFilterSort: false, addActionType: null },
    },
    [PROJECT_VIEWS.BACKLOG]: {
      key: PROJECT_VIEWS.BACKLOG,
      path: PROJECT_VIEWS.BACKLOG,
      sidebarLabelKey: "backlog",
      navbar: { showFilterSort: true, addActionType: "ticket" },
    },
    [PROJECT_VIEWS.BOARD]: {
      key: PROJECT_VIEWS.BOARD,
      path: PROJECT_VIEWS.BOARD,
      sidebarLabelKey: "board",
      navbar: { showFilterSort: true, addActionType: "ticket" },
    },
    [PROJECT_VIEWS.EPICS]: {
      key: PROJECT_VIEWS.EPICS,
      path: PROJECT_VIEWS.EPICS,
      sidebarLabelKey: "epics",
      navbar: { showFilterSort: true, addActionType: "epic" },
    },
    [PROJECT_VIEWS.SETTINGS]: {
      key: PROJECT_VIEWS.SETTINGS,
      path: PROJECT_VIEWS.SETTINGS,
      sidebarLabelKey: "settings",
      navbar: { showFilterSort: false, addActionType: null },
    },
  });

/**
 * Resolves project view key from pathname and projectId.
 */
export function getProjectViewKeyFromPath(
  pathname: string,
  projectId: string
): ProjectViewKey {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const prefix = `/${projectId}`;
  if (normalized === prefix) {
    return HOME_KEY;
  }
  for (const key of PROJECT_VIEW_KEYS) {
    if (key === HOME_KEY) {
      continue;
    }
    const config = PROJECT_VIEW_CONFIGS[key];
    if (config.path && normalized.startsWith(`${prefix}/${config.path}`)) {
      return key;
    }
  }
  return HOME_KEY;
}

/**
 * Returns config for a project view key.
 */
export function getProjectViewConfig(key: ProjectViewKey): ProjectViewConfig {
  return PROJECT_VIEW_CONFIGS[key];
}

/**
 * Builds href for a project view. Home => /{projectId}, others => /{projectId}/{path}.
 */
export function buildProjectViewHref(
  projectId: string,
  key: ProjectViewKey
): string {
  const config = PROJECT_VIEW_CONFIGS[key];
  if (!config.path) {
    return `/${projectId}`;
  }
  return `/${projectId}/${config.path}`;
}

/**
 * All project view configs in sidebar order.
 */
export function getProjectViewConfigsForSidebar(): ProjectViewConfig[] {
  return PROJECT_VIEW_KEYS.map((key) => PROJECT_VIEW_CONFIGS[key]);
}
