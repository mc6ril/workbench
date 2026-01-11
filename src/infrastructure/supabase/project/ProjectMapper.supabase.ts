import type {
  Project,
  ProjectRole,
  ProjectWithRole,
} from "@/core/domain/schema/project.schema";

import type { ProjectRow } from "@/infrastructure/supabase/types";

import { toDate } from "@/shared/utils/guards";

/**
 * Maps a Supabase row to a domain Project entity.
 * Translates snake_case database fields to camelCase domain fields.
 *
 * Pure transformation function: only translates structure and converts types (no validation, no error handling).
 *
 * @param row - Supabase row data
 * @returns Domain Project entity
 */
export const mapProjectRowToDomain = (row: ProjectRow): Project => {
  return {
    id: row.id,
    name: row.name,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
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
