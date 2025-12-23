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
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw mapSupabaseError(error, "Project");
      }

      if (!data) {
        return [];
      }

      return mapProjectRowsToDomain(data as ProjectRow[]);
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
};
