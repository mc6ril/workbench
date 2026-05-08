import type { ProjectRole } from "@/domains/project/core/domain/project.types";
import type { ProjectModuleKey } from "@/domains/project/core/domain/projectModule.types";

/**
 * Minimal project data for the persistent shell (sidebar + top bar structure).
 * Loaded once per project route segment via server component.
 */
export type ProjectShellSnapshot = {
  projectId: string;
  enabledModules: readonly ProjectModuleKey[];
  isRecipesBoardVisible: boolean;
  role: ProjectRole | null;
};
