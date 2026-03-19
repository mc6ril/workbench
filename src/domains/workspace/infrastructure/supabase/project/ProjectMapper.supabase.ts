import { toDate } from "@/shared/utils/guards";

import type {
  Project,
  ProjectRole,
  ProjectWithRole,
  ProjectWithStats,
  ReclaimableProject,
} from "@/domains/workspace/core/domain/schema/project.schema";
import type {
  ProjectRow,
  ProjectWithStatsRow,
  ReclaimableProjectRow,
} from "@/domains/workspace/infrastructure/supabase/types";

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
    shortCode: row.short_code,
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

/**
 * Maps a ProjectWithStatsRow from RPC to ProjectWithStats domain entity.
 * Translates snake_case database fields to camelCase domain fields
 * and includes aggregated statistics.
 *
 * @param row - Row data from get_projects_with_stats RPC function
 * @returns ProjectWithStats domain entity
 */
export const mapProjectWithStatsRowToDomain = (
  row: ProjectWithStatsRow
): ProjectWithStats => ({
  id: row.id,
  name: row.name,
  shortCode: row.short_code,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
  role: row.role as ProjectRole,
  memberCount: row.member_count,
  ticketCount: row.ticket_count,
  inProgressCount: row.in_progress_count,
  completedCount: row.completed_count,
});

/**
 * Maps a ReclaimableProjectRow from RPC to ReclaimableProject domain entity.
 *
 * @param row - Row data from get_reclaimable_projects RPC function
 * @returns ReclaimableProject domain entity
 */
export const mapReclaimableProjectRowToDomain = (
  row: ReclaimableProjectRow
): ReclaimableProject => ({
  id: row.id,
  name: row.name,
  shortCode: row.short_code,
  orphanedAt: new Date(row.orphaned_at),
});
