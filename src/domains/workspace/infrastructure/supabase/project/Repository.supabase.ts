import type { SupabaseClient } from "@supabase/supabase-js";

import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";

import {
  mapProjectWithStatsRowToDomain,
  mapReclaimableProjectRowToDomain,
} from "./Mapper.supabase";

import type { ProjectWithRole } from "@/domains/project/core/domain/schema/project.schema";
import { createProjectRepository } from "@/domains/project/infrastructure/supabase/project/ProjectRepository.supabase";
import type {
  ProjectWithStats,
  ReclaimableProject,
} from "@/domains/workspace/core/domain/workspaceProjectCatalog.schema";
import type { WorkspaceProjectCatalogRepository } from "@/domains/workspace/core/ports/workspaceProjectCatalogRepository";
import type {
  ProjectWithStatsRow,
  ReclaimableProjectRow,
} from "@/domains/workspace/infrastructure/supabase/types";

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
 * Create a WorkspaceProjectCatalogRepository implementation using the provided
 * Supabase client.
 *
 * @param client - Supabase client instance to use
 * @returns WorkspaceProjectCatalogRepository implementation
 */
export const createWorkspaceProjectCatalogRepository = (
  client: SupabaseClient
): WorkspaceProjectCatalogRepository => {
  const projectRepository = createProjectRepository(client);

  const repository: WorkspaceProjectCatalogRepository = {
    async listAccessibleProjects(): Promise<ProjectWithRole[]> {
      return projectRepository.list();
    },

    async listProjectsWithStats(): Promise<ProjectWithStats[]> {
      try {
        const { data, error } = await client.rpc("get_projects_with_stats");

        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map((row) =>
            mapProjectWithStatsRowToDomain(row as ProjectWithStatsRow)
          );
        }

        // In some sessions the stats RPC can return an empty result even when
        // the user still has project access. Fallback to the regular catalog
        // listing to keep the workspace usable.
        const hasAccess = await repository.hasAnyProjectAccess();
        if (!hasAccess) {
          return [];
        }

        const projects = await repository.listAccessibleProjects();
        return projects.map(mapProjectWithRoleToStats);
      } catch (error) {
        return handleRepositoryError(error, "Project");
      }
    },

    async hasAnyProjectAccess(): Promise<boolean> {
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

        return data.map((row: unknown) =>
          mapReclaimableProjectRowToDomain(row as ReclaimableProjectRow)
        );
      } catch (error) {
        return handleRepositoryError(error, "Project");
      }
    },
  };

  return repository;
};
