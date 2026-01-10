import { z } from "zod";

import type {
  Project,
  ProjectRole,
  ProjectWithRole,
} from "@/core/domain/schema/project.schema";
import { ProjectSchema } from "@/core/domain/schema/project.schema";

import { handleRepositoryError } from "@/infrastructure/supabase/shared/errors/errorHandlers";
import type { ProjectRow } from "@/infrastructure/supabase/types";

/**
 * Maps a Supabase row to a domain Project entity.
 * Converts snake_case database fields to camelCase domain fields.
 *
 * @param row - Supabase row data
 * @returns Domain Project entity
 * @throws Error if row data is invalid
 */
export const mapProjectRowToDomain = (row: ProjectRow): Project => {
  try {
    // Clean the data before parsing (schema will handle UUID validation and normalization)
    const cleanData = {
      id: String(row.id).trim(),
      name: String(row.name).trim(),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return ProjectSchema.parse(cleanData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const debugMessage = `Failed to map project: ${error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`;
      return handleRepositoryError(
        new Error(debugMessage),
        "ProjectMapper"
      );
    }
    return handleRepositoryError(error, "ProjectMapper");
  }
};

/**
 * Maps multiple Supabase rows to domain Project entities.
 *
 * @param rows - Array of Supabase row data
 * @returns Array of domain Project entities
 */
export const mapProjectRowsToDomain = (rows: ProjectRow[]): Project[] => {
  return rows.map(mapProjectRowToDomain);
};

/**
 * Maps a Project entity with a role to a ProjectWithRole entity.
 *
 * @param project - Project entity
 * @param role - User's role in the project
 * @returns ProjectWithRole entity
 */
export const mapProjectToProjectWithRole = (
  project: Project,
  role: ProjectRole
): ProjectWithRole => {
  return {
    ...project,
    role,
  };
};
