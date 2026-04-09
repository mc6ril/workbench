import { PAGE_ROUTES, PROJECT_VIEWS } from "@/shared/constants/routes";

import {
  canAccessFeature,
  getMinimumPlanForFeature,
  PlanFeature,
} from "@/domains/billing/core/domain/planFeatures.rules";
import { SubscriptionPlan } from "@/domains/billing/core/domain/subscription.types";
import {
  hasProjectModule,
  ProjectModuleKey,
} from "@/domains/project/core/domain/projectModule.types";

/** Project view keys available in the project shell. */
export const PROJECT_VIEW_KEYS = Object.freeze([
  PROJECT_VIEWS.BOARD,
  PROJECT_VIEWS.RECIPES,
  PROJECT_VIEWS.SETTINGS,
]);

export type ProjectViewKey = (typeof PROJECT_VIEW_KEYS)[number];

export type NavbarAddActionType = "ticket";

export type ProjectViewNavbarConfig = {
  showSearch: boolean;
  addActionType: NavbarAddActionType | null;
};

export type ProjectViewConfig = {
  key: ProjectViewKey;
  path: string;
  sidebarLabelKey: string;
  navbar: ProjectViewNavbarConfig;
  showInSidebar?: boolean;
  requiredFeature?: PlanFeature;
  requiredModule?: ProjectModuleKey;
};

export type ProjectViewAvailabilityInput = {
  enabledModules?: readonly ProjectModuleKey[];
  effectivePlan: SubscriptionPlan;
};

export type ProjectViewFeatureLockState = {
  locked: boolean;
  minimumPlan?: SubscriptionPlan;
};

type ProjectViewConfigInput = {
  navbar: ProjectViewNavbarConfig;
  sidebarLabelKey?: string;
  showInSidebar?: boolean;
  requiredFeature?: PlanFeature;
  requiredModule?: ProjectModuleKey;
  pathOverride?: string;
};

const PROJECT_VIEW_CONFIG_INPUTS: Record<
  ProjectViewKey,
  ProjectViewConfigInput
> = Object.freeze({
  [PROJECT_VIEWS.BOARD]: {
    navbar: { showSearch: true, addActionType: "ticket" },
  },
  [PROJECT_VIEWS.RECIPES]: {
    navbar: { showSearch: false, addActionType: null },
    requiredFeature: PlanFeature.RECIPES,
    requiredModule: ProjectModuleKey.RECIPES,
  },
  [PROJECT_VIEWS.SETTINGS]: {
    navbar: { showSearch: false, addActionType: null },
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
    requiredModule: input.requiredModule,
  };
};

const PROJECT_VIEW_CONFIGS: Record<ProjectViewKey, ProjectViewConfig> =
  Object.freeze({
    [PROJECT_VIEWS.BOARD]: createProjectViewConfig(
      PROJECT_VIEWS.BOARD,
      PROJECT_VIEW_CONFIG_INPUTS[PROJECT_VIEWS.BOARD]
    ),
    [PROJECT_VIEWS.RECIPES]: createProjectViewConfig(
      PROJECT_VIEWS.RECIPES,
      PROJECT_VIEW_CONFIG_INPUTS[PROJECT_VIEWS.RECIPES]
    ),
    [PROJECT_VIEWS.SETTINGS]: createProjectViewConfig(
      PROJECT_VIEWS.SETTINGS,
      PROJECT_VIEW_CONFIG_INPUTS[PROJECT_VIEWS.SETTINGS]
    ),
  });

const PROJECT_LANDING_VIEW_PRIORITY: readonly ProjectViewKey[] = Object.freeze([
  PROJECT_VIEWS.RECIPES,
  PROJECT_VIEWS.BOARD,
  PROJECT_VIEWS.SETTINGS,
]);

export const getProjectViewKeyFromPath = (
  pathname: string,
  projectId: string
): ProjectViewKey => {
  const normalized = pathname.replace(/\/$/, "") || PAGE_ROUTES.HOME;
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

export const isProjectViewModuleEnabled = (
  key: ProjectViewKey,
  enabledModules: readonly ProjectModuleKey[] = []
): boolean => {
  const config = getProjectViewConfig(key);

  if (!config.requiredModule) {
    return true;
  }

  return hasProjectModule(enabledModules, config.requiredModule);
};

export const getProjectViewFeatureLockState = (
  key: ProjectViewKey,
  effectivePlan: SubscriptionPlan
): ProjectViewFeatureLockState => {
  const config = getProjectViewConfig(key);

  if (!config.requiredFeature) {
    return { locked: false };
  }

  if (canAccessFeature(effectivePlan, config.requiredFeature)) {
    return { locked: false };
  }

  return {
    locked: true,
    minimumPlan: getMinimumPlanForFeature(config.requiredFeature),
  };
};

export const canAccessProjectView = (
  key: ProjectViewKey,
  options: ProjectViewAvailabilityInput
): boolean => {
  if (!isProjectViewModuleEnabled(key, options.enabledModules)) {
    return false;
  }

  return !getProjectViewFeatureLockState(key, options.effectivePlan).locked;
};

export const getDefaultProjectViewKey = (
  options: ProjectViewAvailabilityInput
): ProjectViewKey => {
  return (
    PROJECT_LANDING_VIEW_PRIORITY.find((key) => {
      return canAccessProjectView(key, options);
    }) ?? PROJECT_VIEWS.BOARD
  );
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
