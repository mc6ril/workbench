import type { ProjectWithRole } from "@/domains/project/core/domain/schema/project.schema";
import type {
  ProjectWithStats,
  ReclaimableProject,
} from "@/domains/workspace/core/domain/schema/workspaceProjectCatalog.schema";

/**
 * Repository contract for workspace-owned project catalog operations.
 * Hides infrastructure details and exposes the workspace catalog view only.
 */
export type WorkspaceProjectCatalogRepository = {
  /**
   * List projects accessible to the current user with their role.
   */
  listAccessibleProjects(): Promise<ProjectWithRole[]>;

  /**
   * List accessible projects enriched with aggregated workspace statistics.
   */
  listProjectsWithStats(): Promise<ProjectWithStats[]>;

  /**
   * Check whether the current user can access at least one project.
   */
  hasAnyProjectAccess(): Promise<boolean>;

  /**
   * List orphaned projects reclaimable by the current user.
   */
  listReclaimableProjects(): Promise<ReclaimableProject[]>;
};
