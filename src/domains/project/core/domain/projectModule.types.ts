export enum ProjectModuleKey {
  RECIPES = "recipes",
}

export const PROJECT_MODULE_KEYS: readonly ProjectModuleKey[] = Object.freeze([
  ProjectModuleKey.RECIPES,
]);

export const isProjectModuleKey = (
  value: string
): value is ProjectModuleKey => {
  return (PROJECT_MODULE_KEYS as readonly string[]).includes(value);
};

export const hasProjectModule = (
  enabledModules: readonly ProjectModuleKey[],
  moduleKey: ProjectModuleKey
): boolean => {
  return enabledModules.includes(moduleKey);
};
