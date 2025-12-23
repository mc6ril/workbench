import type { Project } from "@/core/domain/project/project.schema";
import { ProjectSchema } from "@/core/domain/project/project.schema";

import type { ProjectRow } from "@/infrastructure/supabase/types/projectRow";

/**
 * Maps a Supabase row to a domain Project entity.
 * Converts snake_case database fields to camelCase domain fields.
 *
 * @param row - Supabase row data
 * @returns Domain Project entity
 * @throws Error if row data is invalid
 */
export const mapProjectRowToDomain = (row: ProjectRow): Project => {
  return ProjectSchema.parse({
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
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
