import type { ProjectRole } from "@/domains/project/core/domain/project.types";

export type ProjectRow = {
  id: string;
  name: string;
  short_code: string;
  board_emoji: string;
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

/**
 * Row type for the project_invitations table.
 */
export type InvitationRow = {
  id: string;
  project_id: string;
  invited_by: string;
  role: string;
  token: string;
  status: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
};
