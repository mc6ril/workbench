import type { ProjectWithRole } from "@/domains/project/core/domain/project.types";
import type {
  ProjectWithStats,
  ReclaimableProject,
} from "@/domains/workspace/core/domain/workspace.types";

/**
 * Gateway contract for workspace project catalog operations.
 * Hides infrastructure details behind workspace-facing operations.
 */
export type WorkspaceProjectCatalogGateway = {
  listProjects(): Promise<ProjectWithRole[]>;
  listProjectsWithStats(): Promise<ProjectWithStats[]>;
  hasProjectAccess(): Promise<boolean>;
  listReclaimableProjects(): Promise<ReclaimableProject[]>;
};
