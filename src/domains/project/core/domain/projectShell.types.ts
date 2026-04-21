import type { ProjectModuleKey } from "@/domains/project/core/domain/projectModule.types";

/**
 * Minimal project data for the persistent shell (sidebar + top bar structure).
 * Loaded once per project route segment; excludes name, shortCode, billing, members, role.
 */
export type ProjectShellSnapshot = {
  projectId: string;
  enabledModules: readonly ProjectModuleKey[];
  isRecipesBoardVisible: boolean;
};
