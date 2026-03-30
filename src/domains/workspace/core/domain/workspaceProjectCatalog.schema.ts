import type { ProjectWithRole } from "@/domains/project/core/domain/project.types";

/**
 * Statistics for a project (member counts, ticket counts).
 * Used for workspace overview display.
 */
export type ProjectStats = {
  memberCount: number;
  ticketCount: number;
  inProgressCount: number;
  completedCount: number;
};

/**
 * Project with role and statistics for workspace overview.
 * Combines project data with user role and aggregated stats.
 */
export type ProjectWithStats = ProjectWithRole & ProjectStats;

/**
 * A project that was orphaned (all members left) and can be reclaimed
 * by the original creator via email matching.
 */
export type ReclaimableProject = {
  id: string;
  name: string;
  shortCode: string;
  orphanedAt: Date;
};
