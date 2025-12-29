import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CreateProjectInput,
  Project,
  ProjectRole,
  ProjectWithRole,
} from "@/core/domain/project.schema";
import {
  createConstraintError,
  createDatabaseError,
  createNotFoundError,
} from "@/core/domain/repositoryError";

import { handleRepositoryError } from "@/infrastructure/supabase/shared/errors/errorHandlers";
import type { ProjectRow } from "@/infrastructure/supabase/types";

import {
  isNonEmptyString,
  isObject,
  isProjectRole,
} from "@/shared/utils/guards";

import {
  mapProjectRowToDomain,
  mapProjectToProjectWithRole,
} from "./ProjectMapper.supabase";

import type { ProjectRepository } from "@/core/ports/projectRepository";

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
  async findById(id: string): Promise<Project | null> {
    try {
      const { data, error } = await client
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        handleRepositoryError(error, "Project");
      }

      if (!data) {
        return null;
      }

      return mapProjectRowToDomain(data as ProjectRow);
    } catch (error) {
      handleRepositoryError(error, "Project");
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
        handleRepositoryError(error, "Project");
      }

      if (!data || !Array.isArray(data)) {
        return [];
      }

      // Transform the data to match ProjectWithRole structure
      return data.map((row: unknown) => {
        if (!isObject(row)) {
          handleRepositoryError(
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
          handleRepositoryError(
            createDatabaseError("Project member role not found"),
            "Project"
          );
        }

        const roleValue = members[0]?.role;
        if (!roleValue || !isProjectRole(roleValue)) {
          handleRepositoryError(
            createDatabaseError(`Invalid project role: ${roleValue}`),
            "Project"
          );
        }

        return mapProjectToProjectWithRole(project, roleValue);
      });
    } catch (error) {
      handleRepositoryError(error, "Project");
    }
  },

  async create(input: CreateProjectInput): Promise<Project> {
    try {
      // Use RPC function to bypass RLS issues
      // The function create_project() is SECURITY DEFINER and bypasses RLS
      const { data: projectData, error: rpcError } = await client.rpc(
        "create_project",
        { project_name: input.name }
      );

      if (rpcError) {
        handleRepositoryError(rpcError, "Project");
      }

      // Handle different return types from RPC
      let projectId: string | null = null;

      if (Array.isArray(projectData) && projectData.length > 0) {
        // If it's an array, get the project from it
        const project = projectData[0];
        if (typeof project === "object" && project !== null) {
          // It's already the full project object
          return mapProjectRowToDomain(project as ProjectRow);
        } else if (typeof project === "string") {
          // It's just the ID
          projectId = project;
        }
      } else if (typeof projectData === "string") {
        // RPC returned just the UUID
        projectId = projectData;
      } else if (projectData && typeof projectData === "object") {
        // RPC returned the project object directly (not in array)
        return mapProjectRowToDomain(projectData as ProjectRow);
      }

      // If we only have the ID, fetch the full project using RPC (bypasses RLS)
      if (projectId) {
        const { data: projectDataFromRpc, error: rpcFetchError } =
          await client.rpc("get_project_by_id", { p_project_id: projectId });

        if (rpcFetchError) {
          handleRepositoryError(rpcFetchError, "Project");
        }

        if (!projectDataFromRpc) {
          handleRepositoryError(
            createDatabaseError(
              "No project data returned from get_project_by_id function"
            ),
            "Project"
          );
        }

        // RPC returns array, get first element
        const projectRow = Array.isArray(projectDataFromRpc)
          ? projectDataFromRpc[0]
          : projectDataFromRpc;

        if (!projectRow) {
          handleRepositoryError(
            createDatabaseError("No project data returned after creation"),
            "Project"
          );
        }

        return mapProjectRowToDomain(projectRow as ProjectRow);
      }

      // If we get here, something went wrong
      handleRepositoryError(
        createDatabaseError(
          "No project data returned from create_project function"
        ),
        "Project"
      );
    } catch (error) {
      handleRepositoryError(error, "Project");
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
          handleRepositoryError(
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
          handleRepositoryError(createNotFoundError("Project", id), "Project");
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
        handleRepositoryError(error, "Project");
      }

      if (!data) {
        handleRepositoryError(createNotFoundError("Project", id), "Project");
      }

      return mapProjectRowToDomain(data as ProjectRow);
    } catch (error) {
      handleRepositoryError(error, "Project");
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await client.from("projects").delete().eq("id", id);

      if (error) {
        handleRepositoryError(error, "Project");
      }
    } catch (error) {
      handleRepositoryError(error, "Project");
    }
  },

  async addCurrentUserAsMember(
    projectId: string,
    role: ProjectRole = "viewer"
  ): Promise<Project> {
    try {
      // Get current user session first
      const {
        data: { session },
      } = await client.auth.getSession();
      if (!session?.user?.id) {
        handleRepositoryError(
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
          handleRepositoryError(
            createNotFoundError("Project", projectId),
            "Project"
          );
        }
        // Other errors (constraint violation, permission denied, etc.) are re-thrown as-is
        handleRepositoryError(insertError, "Project");
      }

      // Fetch the project after successful insertion (user is now a member, so RLS allows access)
      // This is the second call (after insert), which is acceptable per AC requirement (max 2 calls)
      const project = await this.findById(projectId);
      if (!project) {
        // This shouldn't happen since insert succeeded, but handle it just in case
        handleRepositoryError(
          createNotFoundError("Project", projectId),
          "Project"
        );
      }

      return project;
    } catch (error) {
      handleRepositoryError(error, "Project");
    }
  },

  async hasProjectAccess(): Promise<boolean> {
    try {
      // Use SQL function for optimized boolean check
      // This function checks if the current user has any project membership
      const { data, error } = await client.rpc("has_any_project_access");

      if (error) {
        handleRepositoryError(error, "Project");
      }

      // SQL function returns boolean, but Supabase RPC might return null
      // Default to false if data is null/undefined
      return Boolean(data);
    } catch (error) {
      handleRepositoryError(error, "Project");
    }
  },
});
