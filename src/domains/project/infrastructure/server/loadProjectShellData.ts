import type { ProjectShellSnapshot } from "@/domains/project/core/domain/projectShell.types";
import { getProjectShellSnapshot } from "@/domains/project/infrastructure/server/getProjectShellSnapshot";

/**
 * Entry point for project shell server data. Wraps getProjectShellSnapshot so
 * ProjectRouteLayoutContent has a single import for all shell bootstrap logic.
 */
export const loadProjectShellData = async (
  projectId: string
): Promise<ProjectShellSnapshot> => {
  return getProjectShellSnapshot(projectId);
};
