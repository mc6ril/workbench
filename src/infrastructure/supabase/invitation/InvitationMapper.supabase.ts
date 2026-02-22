import type {
  PendingInvitation,
  ProjectInvitation,
} from "@/core/domain/schema/invitation.schema";
import { InvitationStatus } from "@/core/domain/schema/invitation.schema";
import { ProjectRole } from "@/core/domain/schema/project.schema";

import type {
  InvitationRow,
  PendingInvitationRow,
} from "@/infrastructure/supabase/types";

import { toDate } from "@/shared/utils/guards";

/**
 * Maps a Supabase row to a domain ProjectInvitation.
 */
export const mapInvitationRowToDomain = (
  row: InvitationRow
): ProjectInvitation => ({
  id: row.id,
  projectId: row.project_id,
  email: row.email,
  role: row.role as ProjectRole,
  status: row.status as InvitationStatus,
  token: row.token,
  invitedBy: row.invited_by,
  expiresAt: toDate(row.expires_at),
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
});

/**
 * Maps a pending invitation RPC row to the domain type.
 */
export const mapPendingInvitationRowToDomain = (
  row: PendingInvitationRow
): PendingInvitation => ({
  id: row.id,
  projectId: row.project_id,
  projectName: row.project_name,
  role: row.role as ProjectRole,
  invitedByName: row.invited_by_name,
  expiresAt: toDate(row.expires_at),
  createdAt: toDate(row.created_at),
  token: row.token,
});
