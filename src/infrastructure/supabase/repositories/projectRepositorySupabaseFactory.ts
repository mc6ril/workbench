import type { SupabaseClient } from "@supabase/supabase-js";

import { createNotFoundError } from "@/core/domain/errors/repositoryError";
import type {
  CreateProjectInput,
  Project,
  ProjectRole,
  ProjectWithRole,
} from "@/core/domain/project/project.schema";

import {
  mapProjectRowToDomain,
  mapProjectToProjectWithRole,
} from "@/infrastructure/supabase/mappers/projectMapper";
import type { ProjectRow } from "@/infrastructure/supabase/types/projectRow";
import { mapSupabaseError } from "@/infrastructure/supabase/utils/errorMapper";

import {
  hasErrorCode,
  isNonEmptyString,
  isObject,
  isProjectRole,
} from "@/shared/utils/guards";

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
        throw mapSupabaseError(error, "Project");
      }

      if (!data) {
        return null;
      }

      return mapProjectRowToDomain(data as ProjectRow);
    } catch (error) {
      // Re-throw domain errors, wrap unknown errors
      if (
        hasErrorCode(error, [
          "NOT_FOUND",
          "CONSTRAINT_VIOLATION",
          "DATABASE_ERROR",
        ])
      ) {
        throw error;
      }
      throw mapSupabaseError(error, "Project");
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
        throw mapSupabaseError(error, "Project");
      }

      if (!data || !Array.isArray(data)) {
        return [];
      }

      // Transform the data to match ProjectWithRole structure
      return data.map((row: unknown) => {
        if (!isObject(row)) {
          throw mapSupabaseError(
            new Error("Invalid project data structure"),
            "Project"
          );
        }

        const project = mapProjectRowToDomain(row as ProjectRow);

        // Extract role from project_members relationship
        // The data structure has project_members as an array with one element
        const members = (row as { project_members?: Array<{ role?: string }> })
          .project_members;
        if (!Array.isArray(members) || members.length === 0) {
          throw mapSupabaseError(
            new Error("Project member role not found"),
            "Project"
          );
        }

        const roleValue = members[0]?.role;
        if (!roleValue || !isProjectRole(roleValue)) {
          throw mapSupabaseError(
            new Error(`Invalid project role: ${roleValue}`),
            "Project"
          );
        }

        return mapProjectToProjectWithRole(project, roleValue);
      });
    } catch (error) {
      // Re-throw domain errors, wrap unknown errors
      if (
        hasErrorCode(error, [
          "NOT_FOUND",
          "CONSTRAINT_VIOLATION",
          "DATABASE_ERROR",
        ])
      ) {
        throw error;
      }
      throw mapSupabaseError(error, "Project");
    }
  },

  async create(input: CreateProjectInput): Promise<Project> {
    try {
      const { data, error } = await client
        .from("projects")
        .insert({
          name: input.name,
        })
        .select()
        .single();

      if (error) {
        throw mapSupabaseError(error, "Project");
      }

      if (!data) {
        throw mapSupabaseError(
          new Error("No data returned from insert"),
          "Project"
        );
      }

      return mapProjectRowToDomain(data as ProjectRow);
    } catch (error) {
      // Re-throw domain errors, wrap unknown errors
      if (hasErrorCode(error, ["CONSTRAINT_VIOLATION", "DATABASE_ERROR"])) {
        throw error;
      }
      throw mapSupabaseError(error, "Project");
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
          throw mapSupabaseError(
            new Error("Project name cannot be empty"),
            "Project"
          );
        }
        updateData.name = input.name;
      }

      if (Object.keys(updateData).length === 0) {
        // No fields to update, return existing project
        const existing = await this.findById(id);
        if (!existing) {
          throw createNotFoundError("Project", id);
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
        throw mapSupabaseError(error, "Project");
      }

      if (!data) {
        throw createNotFoundError("Project", id);
      }

      return mapProjectRowToDomain(data as ProjectRow);
    } catch (error) {
      // Re-throw domain errors, wrap unknown errors
      if (
        hasErrorCode(error, [
          "NOT_FOUND",
          "CONSTRAINT_VIOLATION",
          "DATABASE_ERROR",
        ])
      ) {
        throw error;
      }
      throw mapSupabaseError(error, "Project");
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await client.from("projects").delete().eq("id", id);

      if (error) {
        throw mapSupabaseError(error, "Project");
      }
    } catch (error) {
      // Re-throw domain errors, wrap unknown errors
      if (
        hasErrorCode(error, [
          "NOT_FOUND",
          "CONSTRAINT_VIOLATION",
          "DATABASE_ERROR",
        ])
      ) {
        throw error;
      }
      throw mapSupabaseError(error, "Project");
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
        throw mapSupabaseError(
          new Error("User must be authenticated"),
          "Project"
        );
      }

      // Verify the project exists using RPC function (bypasses RLS)
      const { data: exists, error: existsError } = await client.rpc(
        "project_exists",
        { project_uuid: projectId }
      );

      if (existsError || !exists) {
        throw createNotFoundError("Project", projectId);
      }

      // Try to add user as member
      // Note: RLS allows users to self-add as 'viewer', or admins can add with any role
      // If user tries to add themselves with a role other than 'viewer', it will fail unless they're admin
      const { error: insertError } = await client
        .from("project_members")
        .insert({
          project_id: projectId,
          user_id: session.user.id,
          role,
        });

      if (insertError) {
        // Check if user is already a member (unique constraint violation)
        if (
          insertError.code === "23505" ||
          insertError.message?.includes("duplicate")
        ) {
          throw mapSupabaseError(
            new Error("You are already a member of this project"),
            "Project"
          );
        }

        // Check if it's a permission error (RLS policy violation)
        // This can happen if user tries to add themselves with a role other than 'viewer'
        if (
          insertError.code === "42501" ||
          insertError.message?.includes("permission")
        ) {
          if (role !== "viewer") {
            throw mapSupabaseError(
              new Error(
                "You can only add yourself as a viewer. Contact a project admin to be added with a different role."
              ),
              "Project"
            );
          }
          throw mapSupabaseError(
            new Error(
              "Permission denied. Only project admins can add members."
            ),
            "Project"
          );
        }

        // Check if project doesn't exist (foreign key violation)
        if (insertError.code === "23503") {
          throw createNotFoundError("Project", projectId);
        }

        throw mapSupabaseError(insertError, "Project");
      }

      // After successful insertion, fetch the project (user is now a member)
      const project = await this.findById(projectId);
      if (!project) {
        // This shouldn't happen, but handle it just in case
        throw createNotFoundError("Project", projectId);
      }

      return project;
    } catch (error) {
      // Re-throw domain errors, wrap unknown errors
      if (
        hasErrorCode(error, [
          "NOT_FOUND",
          "CONSTRAINT_VIOLATION",
          "DATABASE_ERROR",
        ])
      ) {
        throw error;
      }
      throw mapSupabaseError(error, "Project");
    }
  },

  async hasProjectAccess(): Promise<boolean> {
    try {
      // Use SQL function for optimized boolean check
      // This function checks if the current user has any project membership
      const { data, error } = await client.rpc("has_any_project_access");

      if (error) {
        throw mapSupabaseError(error, "Project");
      }

      // SQL function returns boolean, but Supabase RPC might return null
      // Default to false if data is null/undefined
      return Boolean(data);
    } catch (error) {
      // Re-throw domain errors, wrap unknown errors
      if (hasErrorCode(error, ["DATABASE_ERROR"])) {
        throw error;
      }
      throw mapSupabaseError(error, "Project");
    }
  },
});
