import {
  createConstraintError,
  createDatabaseError,
  createNotFoundError,
} from "@/shared/errors/repositoryError";
import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";
import type { AppSupabaseClient } from "@/shared/infrastructure/supabase/types";
import { isNonEmptyString, isObject } from "@/shared/utils/guards";

import {
  mapProjectRowToDomain,
  mapProjectToProjectWithRole,
} from "./ProjectMapper.supabase";
import {
  extractProjectIdFromPayload,
  extractProjectRowFromPayload,
  fetchProjectRowById,
} from "./projectRowPayload.supabase";

import type {
  Project,
  ProjectWithRole,
} from "@/domains/project/core/domain/project.types";
import { isProjectRole } from "@/domains/project/core/domain/project.types";
import type { ProjectModuleKey } from "@/domains/project/core/domain/projectModule.types";
import type { ProjectGateway } from "@/domains/project/core/ports/project.gateway";

/**
 * Fetch a full project row by ID. Some RPCs only return an ID or a legacy
 * partial project payload, so direct table reads keep the mapper fed with the
 * generated projects row shape.
 */
const fetchProjectById = async (
  client: AppSupabaseClient,
  projectId: string
): Promise<Project> => {
  return mapProjectRowToDomain(await fetchProjectRowById(client, projectId));
};

/**
 * Create a ProjectGateway implementation using the provided Supabase client.
 *
 * @param client - Supabase client instance to use
 * @returns ProjectGateway implementation
 */
export const createProjectGateway = (
  client: AppSupabaseClient
): ProjectGateway => ({
  async findByShortCode(shortCode: string): Promise<Project | null> {
    try {
      const { data, error } = await client
        .from("projects")
        .select("*")
        .eq("short_code", shortCode.trim().toUpperCase())
        .maybeSingle();

      if (error) {
        return handleRepositoryError(error, "Project");
      }

      if (!data) {
        return null;
      }

      return mapProjectRowToDomain(data);
    } catch (error) {
      return handleRepositoryError(error, "Project");
    }
  },

  async findById(id: string): Promise<Project | null> {
    try {
      const { data, error } = await client
        .from("projects")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        return handleRepositoryError(error, "Project", id);
      }

      if (!data) {
        return null;
      }

      return mapProjectRowToDomain(data);
    } catch (error) {
      return handleRepositoryError(error, "Project", id);
    }
  },

  async list(): Promise<ProjectWithRole[]> {
    try {
      const { data, error } = await client
        .from("projects")
        .select(
          `
          *,
          project_members!inner(role)
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        return handleRepositoryError(error, "Project");
      }

      if (!data || !Array.isArray(data)) {
        return [];
      }

      return data.map((row) => {
        if (!isObject(row)) {
          return handleRepositoryError(
            createDatabaseError("Invalid project data structure"),
            "Project"
          );
        }

        const project = mapProjectRowToDomain(row);
        const members = (row as { project_members?: Array<{ role?: string }> })
          .project_members;

        if (!Array.isArray(members) || members.length === 0) {
          return handleRepositoryError(
            createDatabaseError("Project member role not found"),
            "Project",
            project.id
          );
        }

        const roleValue = members[0]?.role;
        if (!roleValue || !isProjectRole(roleValue)) {
          return handleRepositoryError(
            createDatabaseError(`Invalid project role: ${roleValue}`),
            "Project",
            project.id
          );
        }

        return mapProjectToProjectWithRole(project, roleValue);
      });
    } catch (error) {
      return handleRepositoryError(error, "Project");
    }
  },

  async create(input: { name: string; boardEmoji?: string }): Promise<Project> {
    try {
      const { data: rpcData, error: rpcError } = await client.rpc(
        "create_project",
        { project_name: input.name }
      );

      if (rpcError) {
        return handleRepositoryError(rpcError, "Project");
      }

      const projectRow = extractProjectRowFromPayload(rpcData);
      let project: Project;
      if (projectRow) {
        project = mapProjectRowToDomain(projectRow);
      } else {
        const projectId = extractProjectIdFromPayload(rpcData);
        if (!projectId) {
          return handleRepositoryError(
            createDatabaseError(
              "No project data returned from create_project function"
            ),
            "Project"
          );
        }

        project = await fetchProjectById(client, projectId);
      }

      if (input.boardEmoji !== undefined) {
        return this.update(project.id, { boardEmoji: input.boardEmoji });
      }

      return project;
    } catch (error) {
      return handleRepositoryError(error, "Project");
    }
  },

  async update(
    id: string,
    input: {
      name?: string;
      boardEmoji?: string;
      enabledModules?: ProjectModuleKey[];
    }
  ): Promise<Project> {
    try {
      const updateData: Partial<{
        name: string;
        board_emoji: string;
        enabled_modules: ProjectModuleKey[];
      }> = {};

      if (input.name !== undefined) {
        if (!isNonEmptyString(input.name)) {
          return handleRepositoryError(
            createConstraintError(
              "PROJECT_NAME_REQUIRED",
              "Project name cannot be empty"
            ),
            "Project",
            id
          );
        }

        updateData.name = input.name;
      }

      if (input.boardEmoji !== undefined) {
        updateData.board_emoji = input.boardEmoji;
      }

      if (input.enabledModules !== undefined) {
        updateData.enabled_modules = input.enabledModules;
      }

      if (Object.keys(updateData).length === 0) {
        const existing = await this.findById(id);
        if (!existing) {
          return handleRepositoryError(
            createNotFoundError("Project", id),
            "Project",
            id
          );
        }

        return existing;
      }

      const { data, error } = await client
        .from("projects")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return handleRepositoryError(error, "Project", id);
      }

      if (!data) {
        return handleRepositoryError(
          createNotFoundError("Project", id),
          "Project",
          id
        );
      }

      return mapProjectRowToDomain(data);
    } catch (error) {
      return handleRepositoryError(error, "Project", id);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await client.from("projects").delete().eq("id", id);

      if (error) {
        return handleRepositoryError(error, "Project", id);
      }
    } catch (error) {
      return handleRepositoryError(error, "Project", id);
    }
  },
});
