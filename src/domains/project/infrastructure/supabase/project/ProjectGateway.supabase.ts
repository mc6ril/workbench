import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createConstraintError,
  createDatabaseError,
  createNotFoundError,
} from "@/shared/errors/repositoryError";
import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";
import { isNonEmptyString, isObject } from "@/shared/utils/guards";

import {
  mapProjectRowToDomain,
  mapProjectToProjectWithRole,
} from "./ProjectMapper.supabase";

import type {
  Project,
  ProjectWithRole,
} from "@/domains/project/core/domain/project.types";
import { isProjectRole } from "@/domains/project/core/domain/project.types";
import type { ProjectModuleKey } from "@/domains/project/core/domain/projectModule.types";
import type { ProjectGateway } from "@/domains/project/core/ports/project.gateway";
import type { ProjectRow } from "@/domains/project/infrastructure/supabase/types";

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

/**
 * Extract a project ID (UUID string) from an RPC response.
 * The RPC may return a single string or an array with a string.
 */
const extractProjectId = (data: unknown): string | null => {
  if (typeof data === "string") {
    return data;
  }

  if (Array.isArray(data) && data.length > 0 && typeof data[0] === "string") {
    return data[0];
  }

  return null;
};

/**
 * Fetch a project by ID using the get_project_by_id RPC function.
 * Used as a fallback when create_project only returns the UUID.
 */
const fetchProjectById = async (
  client: SupabaseClient,
  projectId: string
): Promise<Project> => {
  const { data, error } = await client.rpc("get_project_by_id", {
    p_project_id: projectId,
  });

  if (error) {
    return handleRepositoryError(error, "Project", projectId);
  }

  const projectRow = Array.isArray(data) ? data[0] : data;
  if (!projectRow) {
    return handleRepositoryError(
      createDatabaseError("No project data returned after creation"),
      "Project",
      projectId
    );
  }

  return mapProjectRowToDomain(projectRow as ProjectRow);
};

/**
 * Create a ProjectGateway implementation using the provided Supabase client.
 *
 * @param client - Supabase client instance to use
 * @returns ProjectGateway implementation
 */
export const createProjectGateway = (
  client: SupabaseClient
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

      return mapProjectRowToDomain(data as ProjectRow);
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

      return mapProjectRowToDomain(data as ProjectRow);
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

      return data.map((row: unknown) => {
        if (!isObject(row)) {
          return handleRepositoryError(
            createDatabaseError("Invalid project data structure"),
            "Project"
          );
        }

        const project = mapProjectRowToDomain(row as ProjectRow);
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

      const projectRow = extractProjectRow(rpcData);
      let project: Project;
      if (projectRow) {
        project = mapProjectRowToDomain(projectRow);
      } else {
        const projectId = extractProjectId(rpcData);
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

      return mapProjectRowToDomain(data as ProjectRow);
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
