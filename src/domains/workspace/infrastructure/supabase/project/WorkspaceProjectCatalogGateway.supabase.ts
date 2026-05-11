import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";
import type { AppSupabaseClient } from "@/shared/infrastructure/supabase/types";

import {
  mapProjectWithStatsRowToDomain,
  mapReclaimableProjectRowToDomain,
} from "./WorkspaceProjectCatalogMapper.supabase";

import type { ProjectWithRole } from "@/domains/project/core/domain/project.types";
import { createProjectGateway } from "@/domains/project/infrastructure/supabase/project/ProjectGateway.supabase";
import type {
  ProjectWithStats,
  ReclaimableProject,
} from "@/domains/workspace/core/domain/workspace.types";
import type { WorkspaceProjectCatalogGateway } from "@/domains/workspace/core/ports/workspace-project-catalog.gateway";

const mapProjectWithRoleToStats = (
  project: ProjectWithRole
): ProjectWithStats => ({
  ...project,
  memberCount: 0,
  ticketCount: 0,
  inProgressCount: 0,
  completedCount: 0,
});

/**
 * Create a WorkspaceProjectCatalogGateway implementation using the provided
 * Supabase client.
 *
 * @param client - Supabase client instance to use
 * @returns WorkspaceProjectCatalogGateway implementation
 */
export const createWorkspaceProjectCatalogGateway = (
  client: AppSupabaseClient
): WorkspaceProjectCatalogGateway => {
  const projectGateway = createProjectGateway(client);

  const gateway: WorkspaceProjectCatalogGateway = {
    async listProjects(): Promise<ProjectWithRole[]> {
      return projectGateway.list();
    },

    async listProjectsWithStats(): Promise<ProjectWithStats[]> {
      try {
        const { data, error } = await client.rpc("get_projects_with_stats");

        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map(mapProjectWithStatsRowToDomain);
        }

        // RPC can return empty due to a known session timing issue; fall back
        // to listProjects which returns [] when there is genuinely no access.
        const projects = await gateway.listProjects();
        return projects.map(mapProjectWithRoleToStats);
      } catch (error) {
        return handleRepositoryError(error, "Project");
      }
    },

    async hasProjectAccess(): Promise<boolean> {
      try {
        const { data, error } = await client.rpc("has_any_project_access");

        if (error) {
          return handleRepositoryError(error, "Project");
        }

        return Boolean(data);
      } catch (error) {
        return handleRepositoryError(error, "Project");
      }
    },

    async listReclaimableProjects(): Promise<ReclaimableProject[]> {
      try {
        const { data, error } = await client.rpc("get_reclaimable_projects");

        if (error) {
          return handleRepositoryError(error, "Project");
        }

        if (!data || !Array.isArray(data)) {
          return [];
        }

        return data.map(mapReclaimableProjectRowToDomain);
      } catch (error) {
        return handleRepositoryError(error, "Project");
      }
    },
  };

  return gateway;
};
