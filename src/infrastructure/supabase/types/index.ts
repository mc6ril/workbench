/**
 * Supabase row types representing database table structures.
 * These types match the snake_case column names from Supabase tables.
 */

import type { ProjectRole } from "@/core/domain/schema/project.schema";

export type BoardRow = {
  id: string;
  project_id: string;
  created_at: string;
  updated_at: string;
};

export type ColumnRow = {
  id: string;
  board_id: string;
  name: string;
  status: string;
  position: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
};

export type EpicRow = {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  code_number: number;
  created_at: string;
  updated_at: string;
};

export type ProjectMemberRow = {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectRole;
  created_at: string;
  updated_at: string;
};

export type ProjectRow = {
  id: string;
  name: string;
  short_code: string;
  created_at: string;
  updated_at: string;
};

export type TicketRow = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: string;
  position: number;
  code_number: number;
  epic_id: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
};

export type SubscriptionRow = {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
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

/**
 * Row type for the user_profiles table.
 * Synced from auth.users via database trigger.
 */
export type UserProfileRow = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Row type for the project_invitations table.
 */
export type InvitationRow = {
  id: string;
  project_id: string;
  invited_by: string;
  email: string;
  role: string;
  token: string;
  status: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
};

/**
 * Row type returned by get_pending_invitations RPC.
 */
export type PendingInvitationRow = {
  id: string;
  project_id: string;
  project_name: string;
  role: string;
  invited_by_name: string;
  expires_at: string;
  created_at: string;
  token: string;
};

/**
 * Row type returned by the project_members + user_profiles join query.
 */
export type ProjectMemberJoinRow = {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  created_at: string;
  updated_at: string;
  user_profiles: UserProfileRow;
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
