import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createConstraintError,
  createNotFoundError,
} from "@/shared/errors/repositoryError";
import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";

import {
  mapProjectRowToDomain,
  mapProjectWithStatsRowToDomain,
  mapReclaimableProjectRowToDomain,
} from "./ProjectMapper.supabase";

import { createProjectRepository } from "@/domains/project/infrastructure/supabase/project/ProjectRepository.supabase";
import type { ProjectRow } from "@/domains/project/infrastructure/supabase/types";
import type {
  Project,
  ProjectWithRole,
  ProjectWithStats,
  ReclaimableProject,
} from "@/domains/workspace/core/domain/schema/project.schema";
import { ProjectRole } from "@/domains/workspace/core/domain/schema/project.schema";
import type { WorkspaceProjectRepository } from "@/domains/workspace/core/ports/projectRepository";
import type {
  ProjectWithStatsRow,
  ReclaimableProjectRow,
} from "@/domains/workspace/infrastructure/supabase/types";

/**
 * Extract a full project row from an RPC response.
 * The RPC may return a single object or an array of objects.
 */
const extractProjectRow = (data: unknown): ProjectRow | null => {
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0];
    if (typeof first === "object" && first !== null) {
      return first as ProjectRow;
    }
  } else if (data && typeof data === "object" && !Array.isArray(data)) {
    return data as ProjectRow;
  }
  return null;
};

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
 * Create a WorkspaceProjectRepository implementation using the provided Supabase client.
 * This allows using different clients (browser/server) based on context.
 *
 * @param client - Supabase client instance to use
 * @returns WorkspaceProjectRepository implementation
 */
export const createWorkspaceProjectRepository = (
  client: SupabaseClient
): WorkspaceProjectRepository => {
  const projectRepository = createProjectRepository(client);

  return {
    async listWithStats(): Promise<ProjectWithStats[]> {
      try {
        const { data, error } = await client.rpc("get_projects_with_stats");

        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map((row) =>
            mapProjectWithStatsRowToDomain(row as ProjectWithStatsRow)
          );
        }

        // Fallback path:
        // In production, some sessions can observe an empty stats RPC result while
        // still having project access. To avoid an empty workspace, fallback to
        // the regular project listing and provide zeroed statistics.
        const hasAccess = await this.hasProjectAccess();
        if (!hasAccess) {
          return [];
        }

        const projects = await projectRepository.list();
        return projects.map(mapProjectWithRoleToStats);
      } catch (error) {
        return handleRepositoryError(error, "Project");
      }
    },

    async addCurrentUserAsMember(
      projectId: string,
      _role: ProjectRole = ProjectRole.VIEWER
    ): Promise<Project> {
      try {
        const { data, error } = await client.rpc("reclaim_or_join_project", {
          project_uuid: projectId,
        });

        if (error) {
          if (error.code === "P0002") {
            return handleRepositoryError(
              createNotFoundError("Project", projectId),
              "Project"
            );
          }
          if (error.code === "23505") {
            return handleRepositoryError(
              createConstraintError(
                "ALREADY_MEMBER",
                "User is already a member of this project"
              ),
              "Project"
            );
          }
          return handleRepositoryError(error, "Project");
        }

        const projectRow = extractProjectRow(data);
        if (!projectRow) {
          return handleRepositoryError(
            createNotFoundError("Project", projectId),
            "Project"
          );
        }

        return mapProjectRowToDomain(projectRow);
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

        return data.map((row: unknown) =>
          mapReclaimableProjectRowToDomain(row as ReclaimableProjectRow)
        );
      } catch (error) {
        return handleRepositoryError(error, "Project");
      }
    },
  };
};
