import type {
  PendingInvitation,
  ProjectInvitation,
} from "@/domains/project/core/domain/schema/invitation.schema";
import { InvitationStatus } from "@/domains/project/core/domain/schema/invitation.schema";

import type {
  InvitationRow,
  PendingInvitationRow,
} from "@/shared/infrastructure/types";

import { toDate } from "@/shared/utils/guards";

import { ProjectRole } from "@/domains/workspace/core/domain/schema/project.schema";

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
