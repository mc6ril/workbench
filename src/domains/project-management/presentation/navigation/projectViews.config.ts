import { PlanFeature } from "@/domains/project-management/core/domain/rules/planFeatures.rules";

import { PROJECT_VIEWS } from "@/shared/constants/routes";

/** Project view keys available in the project shell. */
export const PROJECT_VIEW_KEYS = Object.freeze([
  PROJECT_VIEWS.BOARD,
  PROJECT_VIEWS.EPICS,
  PROJECT_VIEWS.SETTINGS,
]);

export type ProjectViewKey = (typeof PROJECT_VIEW_KEYS)[number];

export type NavbarAddActionType = "ticket" | "epic";

export type ProjectViewNavbarConfig = {
  showFilterSort: boolean;
  addActionType: NavbarAddActionType | null;
};

export type ProjectViewConfig = {
  key: ProjectViewKey;
  path: string;
  sidebarLabelKey: string;
  navbar: ProjectViewNavbarConfig;
  showInSidebar?: boolean;
  requiredFeature?: PlanFeature;
};

type ProjectViewConfigInput = {
  navbar: ProjectViewNavbarConfig;
  sidebarLabelKey?: string;
  showInSidebar?: boolean;
  requiredFeature?: PlanFeature;
  pathOverride?: string;
};

const PROJECT_VIEW_CONFIG_INPUTS: Record<
  ProjectViewKey,
  ProjectViewConfigInput
> = Object.freeze({
  [PROJECT_VIEWS.BOARD]: {
    navbar: { showFilterSort: true, addActionType: "ticket" },
  },
  [PROJECT_VIEWS.EPICS]: {
    navbar: { showFilterSort: true, addActionType: "epic" },
    requiredFeature: PlanFeature.EPICS,
  },
  [PROJECT_VIEWS.SETTINGS]: {
    navbar: { showFilterSort: false, addActionType: null },
    requiredFeature: PlanFeature.PRIORITIES,
  },
});

const createProjectViewConfig = (
  key: ProjectViewKey,
  input: ProjectViewConfigInput
): ProjectViewConfig => {
  return {
    key,
    path: input.pathOverride ?? key,
    sidebarLabelKey: input.sidebarLabelKey ?? key,
    navbar: input.navbar,
    showInSidebar: input.showInSidebar,
    requiredFeature: input.requiredFeature,
  };
};

const PROJECT_VIEW_CONFIGS: Record<ProjectViewKey, ProjectViewConfig> =
  Object.freeze({
    [PROJECT_VIEWS.BOARD]: createProjectViewConfig(
      PROJECT_VIEWS.BOARD,
      PROJECT_VIEW_CONFIG_INPUTS[PROJECT_VIEWS.BOARD]
    ),
    [PROJECT_VIEWS.EPICS]: createProjectViewConfig(
      PROJECT_VIEWS.EPICS,
      PROJECT_VIEW_CONFIG_INPUTS[PROJECT_VIEWS.EPICS]
    ),
    [PROJECT_VIEWS.SETTINGS]: createProjectViewConfig(
      PROJECT_VIEWS.SETTINGS,
      PROJECT_VIEW_CONFIG_INPUTS[PROJECT_VIEWS.SETTINGS]
    ),
  });

export const getProjectViewKeyFromPath = (
  pathname: string,
  projectId: string
): ProjectViewKey => {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const prefix = `/${projectId}`;
  if (normalized === prefix) {
    return PROJECT_VIEWS.BOARD;
  }
  for (const key of PROJECT_VIEW_KEYS) {
    const config = PROJECT_VIEW_CONFIGS[key];
    if (config.path && normalized.startsWith(`${prefix}/${config.path}`)) {
      return key;
    }
  }
  return PROJECT_VIEWS.BOARD;
};

export const getProjectViewConfig = (
  key: ProjectViewKey
): ProjectViewConfig => {
  return PROJECT_VIEW_CONFIGS[key];
};

export const buildProjectViewHref = (
  projectId: string,
  key: ProjectViewKey
): string => {
  const config = PROJECT_VIEW_CONFIGS[key];
  return `/${projectId}/${config.path}`;
};

export const getProjectViewConfigsForSidebar = (): ProjectViewConfig[] => {
  return PROJECT_VIEW_KEYS.map((key) => PROJECT_VIEW_CONFIGS[key]).filter(
    (config) => config.showInSidebar !== false
  );
};
