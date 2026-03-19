import type { ProjectRole } from "@/domains/project/core/domain/schema/projectRole.schema";

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
  email: string | null;
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
