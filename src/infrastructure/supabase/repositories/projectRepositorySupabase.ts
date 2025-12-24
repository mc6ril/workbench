import { createNotFoundError } from "@/core/domain/errors/repositoryError";
import {
  type CreateProjectInput,
  type Project,
  type ProjectRole,
  type ProjectWithRole,
} from "@/core/domain/project/project.schema";

import { supabaseClient } from "@/infrastructure/supabase/client";
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
  isString,
} from "@/shared/utils/guards";

import type { ProjectRepository } from "@/core/ports/projectRepository";

/**
 * Supabase implementation of ProjectRepository.
 * Handles all database operations for projects using Supabase client.
 */
export const projectRepositorySupabase: ProjectRepository = {
  async findById(id: string): Promise<Project | null> {
    try {
      const { data, error } = await supabaseClient
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
      // Query project_members to get projects with roles
      // RLS automatically filters to only the current user's memberships
      const { data, error } = await supabaseClient
        .from("project_members")
        .select(
          `
          role,
          projects!inner (
            id,
            name,
            created_at,
            updated_at
          )
        `
        );

      if (error) {
        throw mapSupabaseError(error, "Project");
      }

      if (!data || !Array.isArray(data)) {
        return [];
      }

      // Map the joined data to ProjectWithRole[]
      // Note: Supabase returns projects as an object (not array) for 1:1 relationships
      const projectsWithRole: ProjectWithRole[] = [];

      for (const row of data) {
        // Validate the row structure
        if (
          !isObject(row) ||
          !isString(row.role) ||
          !isProjectRole(row.role) ||
          !isObject(row.projects)
        ) {
          continue;
        }

        // For 1:1 relationships, Supabase returns projects as an object, not an array
        // Cast to unknown first to handle TypeScript's type inference
        const projectData = row.projects as unknown as ProjectRow;
        const role = row.role; // Type is narrowed to ProjectRole by isProjectRole guard

        // Validate project data
        if (
          !isObject(projectData) ||
          !isNonEmptyString(projectData.id) ||
          !isNonEmptyString(projectData.name)
        ) {
          continue;
        }

        // Map to domain entity
        const project = mapProjectRowToDomain({
          id: String(projectData.id).trim(),
          name: String(projectData.name).trim(),
          created_at: projectData.created_at,
          updated_at: projectData.updated_at,
        });

        projectsWithRole.push(mapProjectToProjectWithRole(project, role));
      }

      // Sort by created_at descending (newest first)
      projectsWithRole.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      return projectsWithRole;
    } catch (error) {
      // Re-throw domain errors, wrap unknown errors
      if (hasErrorCode(error, ["DATABASE_ERROR"])) {
        throw error;
      }
      throw mapSupabaseError(error, "Project");
    }
  },

  async create(input: CreateProjectInput): Promise<Project> {
    try {
      const { data, error } = await supabaseClient
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
      const { data, error } = await supabaseClient
        .from("projects")
        .update({
          name: input.name,
        })
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
      const { error } = await supabaseClient
        .from("projects")
        .delete()
        .eq("id", id);

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
      } = await supabaseClient.auth.getSession();
      if (!session?.user?.id) {
        throw mapSupabaseError(
          new Error("User must be authenticated"),
          "Project"
        );
      }

      // Verify the project exists using RPC function (bypasses RLS)
      const { data: exists, error: existsError } = await supabaseClient.rpc(
        "project_exists",
        { project_uuid: projectId }
      );

      if (existsError || !exists) {
        throw createNotFoundError("Project", projectId);
      }

      // Try to add user as member
      // Note: RLS allows users to self-add as 'viewer', or admins can add with any role
      // If user tries to add themselves with a role other than 'viewer', it will fail unless they're admin
      const { error: insertError } = await supabaseClient
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
};
