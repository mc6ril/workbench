export type ProjectRow = {
  id: string;
  name: string;
  short_code: string;
  created_at: string;
  updated_at: string;
};

/**
 * Row type returned by get_projects_with_stats RPC function.
 * Includes project data, user role, and aggregated statistics.
 */
export type ProjectWithStatsRow = {
  id: string;
  name: string;
  short_code: string;
  created_at: string;
  updated_at: string;
  role: string;
  member_count: number;
  ticket_count: number;
  in_progress_count: number;
  completed_count: number;
};

/**
 * Row type returned by get_reclaimable_projects RPC function.
 * Represents an orphaned project that can be reclaimed by the current user.
 */
export type ReclaimableProjectRow = {
  id: string;
  name: string;
  short_code: string;
  orphaned_at: string;
};
