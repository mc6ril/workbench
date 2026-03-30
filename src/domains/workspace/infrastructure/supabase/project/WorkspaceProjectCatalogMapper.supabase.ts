import { ProjectRole } from "@/domains/project/core/domain/project.types";
import type {
  ProjectWithStats,
  ReclaimableProject,
} from "@/domains/workspace/core/domain/workspace.types";
import type {
  ProjectWithStatsRow,
  ReclaimableProjectRow,
} from "@/domains/workspace/infrastructure/supabase/types";

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
  boardEmoji: row.board_emoji,
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
