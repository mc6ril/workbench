import { createNotFoundError } from "@/core/domain/errors/repositoryError";
import type {
  CreateProjectInput,
  Project,
} from "@/core/domain/project/project.schema";

import { supabaseClient } from "@/infrastructure/supabase/client";
import {
  mapProjectRowsToDomain,
  mapProjectRowToDomain,
} from "@/infrastructure/supabase/mappers/projectMapper";
import type { ProjectRow } from "@/infrastructure/supabase/types/projectRow";
import { mapSupabaseError } from "@/infrastructure/supabase/utils/errorMapper";

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
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error.code === "NOT_FOUND" ||
          error.code === "CONSTRAINT_VIOLATION" ||
          error.code === "DATABASE_ERROR")
      ) {
        throw error;
      }
      throw mapSupabaseError(error, "Project");
    }
  },

  async list(): Promise<Project[]> {
    try {
      const { data, error } = await supabaseClient
        .from("projects")
        .select("id, name, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (error) {
        throw mapSupabaseError(error, "Project");
      }

      if (!data || !Array.isArray(data)) {
        return [];
      }

      // Filter out any invalid rows before mapping
      const validRows = data
        .filter(
          (row): row is ProjectRow =>
            row &&
            typeof row === "object" &&
            typeof row.id === "string" &&
            row.id.trim().length > 0 &&
            typeof row.name === "string" &&
            row.name.trim().length > 0
        )
        .map((row) => ({
          id: String(row.id).trim(),
          name: String(row.name).trim(),
          created_at: row.created_at,
          updated_at: row.updated_at,
        })) as ProjectRow[];

      return mapProjectRowsToDomain(validRows);
    } catch (error) {
      // Re-throw domain errors, wrap unknown errors
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "DATABASE_ERROR"
      ) {
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
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error.code === "CONSTRAINT_VIOLATION" ||
          error.code === "DATABASE_ERROR")
      ) {
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
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error.code === "NOT_FOUND" ||
          error.code === "CONSTRAINT_VIOLATION" ||
          error.code === "DATABASE_ERROR")
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
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error.code === "NOT_FOUND" ||
          error.code === "CONSTRAINT_VIOLATION" ||
          error.code === "DATABASE_ERROR")
      ) {
        throw error;
      }
      throw mapSupabaseError(error, "Project");
    }
  },

  async addCurrentUserAsMember(
    projectId: string,
    role: "admin" | "member" | "viewer" = "viewer"
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
        if (insertError.code === "42501" || insertError.message?.includes("permission")) {
          if (role !== "viewer") {
            throw mapSupabaseError(
              new Error("You can only add yourself as a viewer. Contact a project admin to be added with a different role."),
              "Project"
            );
          }
          throw mapSupabaseError(
            new Error("Permission denied. Only project admins can add members."),
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
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error.code === "NOT_FOUND" ||
          error.code === "CONSTRAINT_VIOLATION" ||
          error.code === "DATABASE_ERROR")
      ) {
        throw error;
      }
      throw mapSupabaseError(error, "Project");
    }
  },
};
