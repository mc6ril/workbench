import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createConstraintError,
  createDatabaseError,
  createNotFoundError,
} from "@/core/domain/repositoryError";
import type {
  CreateProjectInput,
  Project,
  ProjectWithRole,
  ProjectWithStats,
} from "@/core/domain/schema/project.schema";
import { ProjectRole } from "@/core/domain/schema/project.schema";

import { handleRepositoryError } from "@/infrastructure/supabase/shared/errors/errorHandlers";
import type {
  ProjectRow,
  ProjectWithStatsRow,
} from "@/infrastructure/supabase/types";

import {
  isNonEmptyString,
  isObject,
  isProjectRole,
} from "@/shared/utils/guards";

import {
  mapProjectRowToDomain,
  mapProjectToProjectWithRole,
  mapProjectWithStatsRowToDomain,
} from "./ProjectMapper.supabase";

import type { ProjectRepository } from "@/core/ports/projectRepository";

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
    return handleRepositoryError(error, "Project");
  }

  const projectRow = Array.isArray(data) ? data[0] : data;
  if (!projectRow) {
    return handleRepositoryError(
      createDatabaseError("No project data returned after creation"),
      "Project"
    );
  }

  return mapProjectRowToDomain(projectRow as ProjectRow);
};

/**
 * Create a ProjectRepository implementation using the provided Supabase client.
 * This allows using different clients (browser/server) based on context.
 *
 * @param client - Supabase client instance to use
 * @returns ProjectRepository implementation
 */
export const createProjectRepository = (
  client: SupabaseClient
): ProjectRepository => ({
  async findByShortCode(shortCode: string): Promise<Project | null> {
    try {
      const { data, error } = await client
        .from("projects")
        .select("*")
        .eq("short_code", shortCode)
        .single();

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
        .single();

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

      // Transform the data to match ProjectWithRole structure
      return data.map((row: unknown) => {
        if (!isObject(row)) {
          return handleRepositoryError(
            createDatabaseError("Invalid project data structure"),
            "Project"
          );
        }

        const project = mapProjectRowToDomain(row as ProjectRow);

        // Extract role from project_members relationship
        // The data structure has project_members as an array with one element
        const members = (row as { project_members?: Array<{ role?: string }> })
          .project_members;
        if (!Array.isArray(members) || members.length === 0) {
          return handleRepositoryError(
            createDatabaseError("Project member role not found"),
            "Project"
          );
        }

        const roleValue = members[0]?.role;
        if (!roleValue || !isProjectRole(roleValue)) {
          return handleRepositoryError(
            createDatabaseError(`Invalid project role: ${roleValue}`),
            "Project"
          );
        }

        return mapProjectToProjectWithRole(project, roleValue);
      });
    } catch (error) {
      return handleRepositoryError(error, "Project");
    }
  },

  async listWithStats(): Promise<ProjectWithStats[]> {
    try {
      const { data, error } = await client.rpc("get_projects_with_stats");

      if (error) {
        return handleRepositoryError(error, "Project");
      }

      if (!data || !Array.isArray(data)) {
        return [];
      }

      return data.map((row) =>
        mapProjectWithStatsRowToDomain(row as ProjectWithStatsRow)
      );
    } catch (error) {
      return handleRepositoryError(error, "Project");
    }
  },

  async create(input: CreateProjectInput): Promise<Project> {
    try {
      // Use RPC function to bypass RLS issues
      // The function create_project() is SECURITY DEFINER and bypasses RLS
      const { data: rpcData, error: rpcError } = await client.rpc(
        "create_project",
        { project_name: input.name }
      );

      if (rpcError) {
        return handleRepositoryError(rpcError, "Project");
      }

      // Normalize RPC response: the function may return a full project row or just the UUID
      const projectRow = extractProjectRow(rpcData);
      if (projectRow) {
        return mapProjectRowToDomain(projectRow);
      }

      const projectId = extractProjectId(rpcData);
      if (projectId) {
        return await fetchProjectById(client, projectId);
      }

      // Unexpected response shape
      return handleRepositoryError(
        createDatabaseError(
          "No project data returned from create_project function"
        ),
        "Project"
      );
    } catch (error) {
      return handleRepositoryError(error, "Project");
    }
  },

  async update(
    id: string,
    input: Partial<CreateProjectInput>
  ): Promise<Project> {
    try {
      const updateData: Partial<{ name: string }> = {};

      if (input.name !== undefined) {
        if (!isNonEmptyString(input.name)) {
          return handleRepositoryError(
            createConstraintError(
              "PROJECT_NAME_REQUIRED",
              "Project name cannot be empty"
            ),
            "Project"
          );
        }
        updateData.name = input.name;
      }

      if (Object.keys(updateData).length === 0) {
        // No fields to update, return existing project
        const existing = await this.findById(id);
        if (!existing) {
          return handleRepositoryError(
            createNotFoundError("Project", id),
            "Project"
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
        return handleRepositoryError(error, "Project");
      }

      if (!data) {
        return handleRepositoryError(
          createNotFoundError("Project", id),
          "Project"
        );
      }

      return mapProjectRowToDomain(data as ProjectRow);
    } catch (error) {
      return handleRepositoryError(error, "Project");
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await client.from("projects").delete().eq("id", id);

      if (error) {
        return handleRepositoryError(error, "Project");
      }
    } catch (error) {
      return handleRepositoryError(error, "Project");
    }
  },

  async addCurrentUserAsMember(
    projectId: string,
    role: ProjectRole = ProjectRole.VIEWER
  ): Promise<Project> {
    try {
      // Get current user session first
      const {
        data: { session },
      } = await client.auth.getSession();
      if (!session?.user?.id) {
        return handleRepositoryError(
          createDatabaseError("User must be authenticated"),
          "Project"
        );
      }

      // Optimized: Eliminate rpc('project_exists') by relying on foreign key constraint
      // If project doesn't exist, insert will fail with foreign key constraint error (code 23503)
      // This reduces DB calls from 3 to 2 (insert + findById instead of rpc + insert + findById)
      const { error: insertError } = await client
        .from("project_members")
        .insert({
          project_id: projectId,
          user_id: session.user.id,
          role,
        });

      if (insertError) {
        // Check if error is due to foreign key constraint (project doesn't exist)
        if (
          insertError.code === "23503" ||
          (insertError.message &&
            insertError.message.includes("foreign key constraint"))
        ) {
          return handleRepositoryError(
            createNotFoundError("Project", projectId),
            "Project"
          );
        }
        // Other errors (constraint violation, permission denied, etc.) are re-thrown as-is
        return handleRepositoryError(insertError, "Project");
      }

      // Fetch the project after successful insertion (user is now a member, so RLS allows access)
      // This is the second call (after insert), which is acceptable per AC requirement (max 2 calls)
      const project = await this.findById(projectId);
      if (!project) {
        // This shouldn't happen since insert succeeded, but handle it just in case
        return handleRepositoryError(
          createNotFoundError("Project", projectId),
          "Project"
        );
      }

      return project;
    } catch (error) {
      return handleRepositoryError(error, "Project");
    }
  },

  async hasProjectAccess(): Promise<boolean> {
    try {
      // Use SQL function for optimized boolean check
      // This function checks if the current user has any project membership
      const { data, error } = await client.rpc("has_any_project_access");

      if (error) {
        return handleRepositoryError(error, "Project");
      }

      // SQL function returns boolean, but Supabase RPC might return null
      // Default to false if data is null/undefined
      return Boolean(data);
    } catch (error) {
      return handleRepositoryError(error, "Project");
    }
  },
});
